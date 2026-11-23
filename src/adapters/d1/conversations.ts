import { assertContextResetResult } from '../../shared/professional-intent.ts';
import { controlledFailure, factualResult, validateConversationResult, type ConversationResult, type AnswerBlock, type SourceExcerpt } from '../../shared/conversation-result.ts';
import { CONVERSATION_RETENTION_MS } from '../../application/conversations.ts';
import { AdmissionRejected, type AdmittedMessage, type AdmissionState, type AdmissionOutcome, type SubmissionIdentity } from '../../shared/conversation-admission.ts';
import { ConversationUnavailable } from '../../shared/conversation.ts';
import { jcs } from '../../shared/public-catalog.ts';
import { publicationGuard } from './publication.ts';
import type { AtomicFinalization, AtomicAdmission, ConversationStore, StoredConversation } from '../../ports/ConversationStore.ts';
import type { CreationAllowance, CreationWindow } from '../../shared/conversation.ts';
import type { Clock } from '../../ports/Clock.ts';

export class D1ConversationStore implements ConversationStore {
  // A clock override is only used by isolated deterministic runtime composition.
  // Production window checks execute against SQLite time, including queue delay.
  constructor(private readonly db: D1Database, private readonly clock?: Clock) {}
  private nowSql(): string {
    if (!this.clock) return "CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)";
    const now = this.clock.now().getTime();
    if (!Number.isSafeInteger(now)) throw new Error('Creation clock unavailable');
    return String(now);
  }
  async readAdmissionState(conversationId: string, sessionTokenHash: string, createdAfter: string, check?: () => void): Promise<AdmissionState | null> {
    const statements = [
      this.db.prepare('SELECT id FROM conversations WHERE id = ? AND session_token_hash = ? AND created_at > ?').bind(conversationId, sessionTokenHash, createdAfter),
      this.db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY ordinal').bind(conversationId),
      this.db.prepare('SELECT * FROM conversation_processing_leases WHERE conversation_id = ?').bind(conversationId),
      ...resultReads(this.db, conversationId),
    ];
    check?.();
    const results = await this.db.batch<Record<string, unknown>>(statements);
    check?.();
    if (results.some((r) => !r.success)) throw new Error('Admission read unavailable');
    if (!results[0]?.results.length) return null;
    const lease = results[2]?.results[0];
    return { messages: results[1]!.results.map((row) => {
      check?.();
      const message = readMessage(row);
      const result = readResult(message, results.slice(3).map((r) => r.results));
      const answer = results[3]!.results.find((a) => a.message_id === message.messageId);
      return result ? { ...message, result, contextReset: answer?.context_reset === 1 } : message;
    }), lease: lease ? {
      requestId: String(lease.request_id), attemptId: String(lease.attempt_id), until: Number(lease.processing_until),
    } : null };
  }
  async admit(command: AtomicAdmission, check?: () => void): Promise<AdmissionOutcome> {
    const { conversationId, sessionTokenHash, requestId, identity, messageId, attemptId, limits, publication, recover } = command;
    const now = this.nowSql();
    const guard = publicationGuard(publication);
    const identityJson = jcs(identity);
    const scope = JSON.stringify({ version: 1, mode: 'global_public', catalogRevision: publication.catalogRevision,
      catalogHash: publication.catalogHash, resources: [], eligibleDocumentIds: publication.catalog.documents.map((d) => d.documentId) });
    // Compute the decision again inside the mutation transaction: the earlier
    // authenticated service read is for precedence, never write authorization.
    const decision = `CASE
      WHEN NOT EXISTS (SELECT 1 FROM conversations WHERE id = ? AND session_token_hash = ?
        AND julianday(created_at) > 2440587.5 + (${now} - ${CONVERSATION_RETENTION_MS}) / 86400000.0) THEN 'conversation_unavailable'
      WHEN EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ? AND submission_identity <> ?) THEN 'request_conflict'
      WHEN EXISTS (SELECT 1 FROM answers a JOIN messages m ON m.id = a.message_id WHERE m.conversation_id = ? AND m.request_id = ?) THEN 'completed'
      WHEN EXISTS (SELECT 1 FROM conversation_processing_leases WHERE conversation_id = ? AND processing_until > ${now} AND request_id = ?) THEN 'request_in_progress'
      WHEN EXISTS (SELECT 1 FROM conversation_processing_leases WHERE conversation_id = ? AND processing_until > ${now}) THEN 'conversation_busy'
      WHEN EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?) AND ? = 0 THEN 'interrupted'
      WHEN NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?) AND ? = 1 THEN 'invalid_request'
      WHEN NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?)
        AND (SELECT COUNT(*) FROM messages WHERE conversation_id = ?) >= ? THEN 'turn_limit_reached'
      WHEN NOT EXISTS (SELECT 1 FROM active_publication WHERE id = 1) THEN 'scope_unavailable'
      WHEN NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?)
        AND NOT EXISTS (SELECT 1 FROM active_publication WHERE id = 1 AND catalog_revision = ? AND catalog_hash = ?) THEN 'catalog_stale'
      WHEN NOT (${guard.sql}) THEN 'scope_unavailable'
      WHEN EXISTS (SELECT 1 FROM messages m, json_each(m.submitted_scope, '$.eligibleDocumentIds') member
        WHERE m.conversation_id = ? AND m.request_id = ? AND NOT EXISTS (SELECT 1 FROM public_documents d WHERE d.document_id = member.value)) THEN 'scope_unavailable'
      ELSE 'acquire' END`;
    const bindings = [conversationId, sessionTokenHash, conversationId, requestId, identityJson, conversationId, requestId, conversationId, requestId,
      conversationId, conversationId, requestId, Number(recover), conversationId, requestId, Number(recover),
      conversationId, requestId, conversationId, limits.maxMessages, conversationId, requestId, publication.catalogRevision, publication.catalogHash, ...guard.bindings, conversationId, requestId];
    const statements = [
      this.db.prepare(`SELECT ${decision} AS outcome, EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?) AS recovering,
        (SELECT catalog_revision FROM active_publication WHERE id = 1) AS catalog_revision,
        (SELECT catalog_hash FROM active_publication WHERE id = 1) AS catalog_hash`).bind(...bindings, conversationId, requestId),
      this.db.prepare(`INSERT INTO conversation_processing_leases (conversation_id, request_id, attempt_id, processing_until)
        SELECT ?, ?, ?, ${now} + ? WHERE (${decision}) = 'acquire'
        ON CONFLICT(conversation_id) DO UPDATE SET request_id = excluded.request_id, attempt_id = excluded.attempt_id, processing_until = excluded.processing_until`)
        .bind(conversationId, requestId, attemptId, limits.leaseMilliseconds, ...bindings),
      this.db.prepare(`INSERT INTO messages (id, conversation_id, request_id, ordinal, question, created_at, context_anchor_message_id, submission_identity, submitted_scope)
        SELECT ?, ?, ?, (SELECT COUNT(*) + 1 FROM messages WHERE conversation_id = ?), ?, strftime('%Y-%m-%dT%H:%M:%fZ', ${now} / 1000.0, 'unixepoch'), ?, ?, ?
        WHERE EXISTS (SELECT 1 FROM conversation_processing_leases WHERE conversation_id = ? AND attempt_id = ?)
        AND NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?)`)
        .bind(messageId, conversationId, requestId, conversationId, identity.kind === 'direct' ? identity.question : '', messageId, identityJson, scope, conversationId, attemptId, conversationId, requestId),
      this.db.prepare(`UPDATE conversations SET modified_at = strftime('%Y-%m-%dT%H:%M:%fZ', ${now} / 1000.0, 'unixepoch')
        WHERE id = ? AND EXISTS (SELECT 1 FROM conversation_processing_leases WHERE conversation_id = ? AND attempt_id = ?)`)
        .bind(conversationId, conversationId, attemptId),
      this.db.prepare(`SELECT m.*, l.attempt_id, l.processing_until FROM messages m LEFT JOIN conversation_processing_leases l
        ON l.conversation_id = m.conversation_id AND l.request_id = m.request_id AND l.attempt_id = ?
        WHERE m.conversation_id = ? AND m.request_id = ?`).bind(attemptId, conversationId, requestId),
      ...resultReads(this.db, conversationId),
    ];
    check?.();
    const results = await this.db.batch<Record<string, unknown>>(statements);
    check?.();
    if (results.some((r) => !r.success)) throw new Error('Admission persistence unavailable');
    const row = results[4]?.results[0];
    if (row?.attempt_id === attemptId) return { status: results[0]?.results[0]?.recovering ? 'recovered' : 'admitted', message: readMessage(row), lease: { requestId, attemptId, until: Number(row.processing_until) } };
    const outcome = results[0]?.results[0]?.outcome;
    if (outcome === 'completed' && row) {
      const message = readMessage(row);
      const result = readResult(message, results.slice(5).map((r) => r.results));
      if (!result) throw new AdmissionRejected('result_unavailable');
      return { status: 'completed', message: { ...message, result } };
    }
    if (outcome === 'interrupted' && row) return { status: 'interrupted', message: readMessage(row) };
    if (outcome === 'conversation_unavailable') throw new ConversationUnavailable();
    if (outcome === 'catalog_stale') {
      const decision = results[0]!.results[0]!;
      throw new AdmissionRejected('catalog_stale', { catalogRevision: String(decision.catalog_revision), catalogHash: String(decision.catalog_hash) });
    }
    if (typeof outcome === 'string' && outcome !== 'acquire' && outcome !== 'interrupted') throw new AdmissionRejected(outcome as import('../../shared/conversation-admission.ts').AdmissionErrorCode);
    throw new AdmissionRejected('result_unavailable');
  }
  async finalize(command: AtomicFinalization, check?: () => void): Promise<ConversationResult> {
    const { conversationId, sessionTokenHash, requestId, attemptId, result } = command;
    validateConversationResult(result);
    if (command.contextReset) assertContextResetResult(result);
    if (result.requestId !== requestId) throw new Error('Invalid finalization identity');
    const now = this.nowSql();
    const failure = controlledFailure({ messageId: result.messageId, requestId, submittedScope: result.submittedScope },
      'scope_unavailable', result.language, command.previousLanguage);
    // Check CURRENT membership, not equality with the publication loaded before
    // processing. Atomic publication replacement may rename/reindex/add documents.
    // Every frozen member, including uncited/zero-chunk members, must remain public
    // and belong to the active revision. No old text/path/title equality is required.
    const available = `EXISTS (SELECT 1 FROM active_publication p WHERE p.id = 1
      AND length(p.catalog_revision) IN (40,64) AND p.catalog_revision NOT GLOB '*[^0-9a-f]*'
      AND length(p.catalog_hash) = 64 AND p.catalog_hash NOT GLOB '*[^0-9a-f]*'
      AND NOT EXISTS (SELECT 1 FROM json_each(m.submitted_scope, '$.eligibleDocumentIds') member
        WHERE NOT EXISTS (SELECT 1 FROM public_documents d WHERE d.document_id = member.value
          AND json_extract(d.document_json, '$.documentId') = d.document_id
          AND json_extract(d.document_json, '$.metadata.document_id') = d.document_id
          AND json_extract(d.document_json, '$.metadata.visibility') = 'public'
          AND json_extract(d.document_json, '$.sourceRevision') = p.catalog_revision
          AND json_extract(d.document_json, '$.sourcePath') = d.source_path)))`;
    const owner = `m.conversation_id = ? AND m.request_id = ? AND m.id = ?
      AND c.session_token_hash = ?
      AND julianday(c.created_at) > 2440587.5 + (${now} - ${CONVERSATION_RETENTION_MS}) / 86400000.0
      AND l.request_id = m.request_id AND l.attempt_id = ? AND l.processing_until > ${now}`;
    const chosen = `CASE WHEN ? = 1 AND NOT (${available}) THEN ? ELSE ? END`;
    // All children are reachable only through this candidate's unique answer and
    // still-matching owner. The lease is removed last; transaction failure rolls
    // back every row, metadata and timestamp. No independently writable terminal flag.
    const childGuard = `a.id = ? AND m.conversation_id = ? AND m.request_id = ?
      AND l.request_id = m.request_id AND l.attempt_id = ?`;
    const joins = `FROM answers a JOIN messages m ON m.id = a.message_id
      JOIN conversation_processing_leases l ON l.conversation_id = m.conversation_id`;
    const childBindings = [result.answerId, conversationId, requestId, attemptId];
    const blocks = JSON.stringify(result.blocks), excerpts = JSON.stringify(result.sourceExcerpts);
    const failureBlocks = JSON.stringify(failure.blocks);
    const statements = [
      this.db.prepare(`INSERT INTO answers (id, message_id, status, language, error_json, created_at, context_reset)
        SELECT ?, m.id, json_extract(${chosen}, '$.status'), json_extract(${chosen}, '$.language'),
          json_extract(${chosen}, '$.error'), strftime('%Y-%m-%dT%H:%M:%fZ', ${now} / 1000.0, 'unixepoch'), ?
        FROM messages m JOIN conversations c ON c.id = m.conversation_id
        JOIN conversation_processing_leases l ON l.conversation_id = c.id
        WHERE ${owner} AND json(m.submitted_scope) = json(?)
          AND NOT EXISTS (SELECT 1 FROM answers WHERE message_id = m.id)`)
        .bind(result.answerId, ...Array.from({ length: 3 }, () => [Number(factualResult(result)), JSON.stringify(failure), JSON.stringify(result)]).flat(), Number(command.contextReset === true),
          conversationId, requestId, result.messageId, sessionTokenHash, attemptId, JSON.stringify(result.submittedScope)),
      this.db.prepare(`INSERT INTO answer_blocks (id, answer_id, sequence, kind, text)
        SELECT json_extract(b.value, '$.blockId'), a.id, CAST(b.key AS INTEGER), json_extract(b.value, '$.kind'), json_extract(b.value, '$.text')
        ${joins}, json_each(CASE WHEN ? = 1 AND a.status = 'failed' THEN ? ELSE ? END) b WHERE ${childGuard}`)
        .bind(Number(factualResult(result)), failureBlocks, blocks, ...childBindings),
      this.db.prepare(`INSERT INTO source_excerpts (id, answer_id, sequence, response_local_id, document_id, source_chunk_id, content_hash,
        source_title, section_title, source_path, source_revision, excerpt, location)
        SELECT json_extract(s.value, '$.sourceExcerptId'), a.id, CAST(s.key AS INTEGER), json_extract(s.value, '$.responseLocalId'),
          json_extract(s.value, '$.documentId'), json_extract(s.value, '$.sourceChunkId'), json_extract(s.value, '$.contentHash'),
          json_extract(s.value, '$.sourceTitle'), json_extract(s.value, '$.sectionTitle'), json_extract(s.value, '$.sourcePath'),
          json_extract(s.value, '$.sourceRevision'), json_extract(s.value, '$.excerpt'), json_extract(s.value, '$.location')
        ${joins}, json_each(?) s WHERE ${childGuard} AND a.status <> 'failed'`).bind(excerpts, ...childBindings),
      this.db.prepare(`INSERT INTO answer_block_sources (answer_id, answer_block_id, source_excerpt_id, sequence)
        SELECT a.id, json_extract(b.value, '$.blockId'), s.id, CAST(edge.key AS INTEGER)
        ${joins}, json_each(?) b, json_each(b.value, '$.sourceIds') edge
        JOIN source_excerpts s ON s.answer_id = a.id AND s.response_local_id = edge.value
        WHERE ${childGuard} AND a.status <> 'failed'`).bind(blocks, ...childBindings),
      this.db.prepare(`UPDATE conversations SET modified_at = strftime('%Y-%m-%dT%H:%M:%fZ', ${now} / 1000.0, 'unixepoch')
        WHERE id = ? AND EXISTS (SELECT 1 ${joins} WHERE ${childGuard})`).bind(conversationId, ...childBindings),
      this.db.prepare(`DELETE FROM conversation_processing_leases WHERE conversation_id = ? AND request_id = ? AND attempt_id = ?
        AND EXISTS (SELECT 1 FROM answers a JOIN messages m ON m.id = a.message_id WHERE a.id = ? AND m.conversation_id = ? AND m.request_id = ?)`)
        .bind(conversationId, requestId, attemptId, result.answerId, conversationId, requestId),
      this.db.prepare(`SELECT m.* FROM messages m JOIN conversations c ON c.id = m.conversation_id
        WHERE m.conversation_id = ? AND m.request_id = ? AND c.session_token_hash = ?
        AND julianday(c.created_at) > 2440587.5 + (${now} - ${CONVERSATION_RETENTION_MS}) / 86400000.0`).bind(conversationId, requestId, sessionTokenHash),
      ...resultReads(this.db, conversationId),
    ];
    check?.();
    const results = await this.db.batch<Record<string, unknown>>(statements);
    check?.();
    if (results.some((r) => !r.success)) throw new AdmissionRejected('result_unavailable');
    const row = results[6]?.results[0];
    if (!row) throw new ConversationUnavailable();
    const saved = readResult(readMessage(row), results.slice(7).map((r) => r.results));
    if (!saved) throw new AdmissionRejected('result_unavailable');
    return saved;
  }
  async dailyCreationKey(window: CreationWindow): Promise<string> {
    const candidate = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
    const now = this.nowSql();
    const results = await this.db.batch<Record<string, unknown>>([
      this.db.prepare(`UPDATE conversation_creation_key SET day = ?, expires_at = ?, daily_key = ?
        WHERE id = 1 AND day < ? AND expires_at = day + 86400000
        AND (daily_key IS NULL OR (length(daily_key) = 64 AND daily_key NOT GLOB '*[^0-9a-f]*'))
        AND ? <= ${now} AND ${now} < ?`)
        .bind(window.day, window.expiresAt, candidate, window.day, window.day, window.expiresAt),
      this.db.prepare('SELECT day, expires_at, daily_key FROM conversation_creation_key WHERE id = 1'),
    ]);
    const row = results[1]?.results[0] as { day: number; expires_at: number; daily_key: string | null } | undefined;
    if (results.some((r) => !r.success) || !row || row.day !== window.day || row.expires_at !== window.expiresAt ||
        typeof row.daily_key !== 'string' || !/^[0-9a-f]{64}$/.test(row.daily_key)) throw new Error('Creation key unavailable');
    return row.daily_key;
  }
  async create(conversation: StoredConversation, allowance: CreationAllowance): Promise<'created' | 'rate_limited'> {
    const { day, expiresAt, dailyKey, pseudonym, limit } = allowance;
    const now = this.nowSql();
    const guard = `EXISTS (SELECT 1 FROM conversation_creation_key WHERE id = 1 AND day = ? AND expires_at = ? AND daily_key = ?)
      AND ? <= ${now} AND ${now} < ?`;
    const guards = [day, expiresAt, dailyKey, day, expiresAt];
    // changes() must immediately follow the capped UPSERT in the same atomic batch.
    // The UPSERT is the admission-time window guard for the entire transaction.
    // Do not recheck time between its increment and INSERT: midnight must not
    // leave a consumed allowance without a Conversation. Concurrent key rollover
    // cannot interleave inside this batch. Failed INSERT rolls back the allowance.
    const results = await this.db.batch<Record<string, unknown>>([
      this.db.prepare(`INSERT INTO conversation_creation_counters (pseudonym, expires_at, creations)
        SELECT ?, ?, 1 WHERE ${guard}
        ON CONFLICT(pseudonym) DO UPDATE SET creations = creations + 1
        WHERE creations < ? AND expires_at = excluded.expires_at`).bind(pseudonym, expiresAt, ...guards, limit),
      this.db.prepare(`INSERT INTO conversations (id, session_token_hash, created_at, modified_at)
        SELECT ?, ?, ?, ? WHERE changes() = 1`)
        .bind(conversation.conversationId, conversation.sessionTokenHash, conversation.createdAt, conversation.modifiedAt),
      this.db.prepare(`SELECT 1 AS valid FROM conversation_creation_counters
        WHERE pseudonym = ? AND expires_at = ? AND creations >= ? AND ${guard}`)
        .bind(pseudonym, expiresAt, limit, ...guards),
    ]);
    if (results.some((r) => !r.success)) throw new Error('Creation persistence unavailable');
    if (results[1]?.meta.changes === 1) return 'created';
    if (!results[2]?.results.length) throw new Error('Creation persistence unavailable');
    if (results[0]?.meta.changes !== 0) throw new Error('Creation persistence unavailable');
    return 'rate_limited';
  }
  async cleanupCreationLimits(): Promise<void> {
    const now = this.nowSql();
    const results = await this.db.batch<Record<string, unknown>>([
      this.db.prepare(`DELETE FROM conversation_creation_counters WHERE expires_at <= ${now}`),
      this.db.prepare(`UPDATE conversation_creation_key SET daily_key = NULL WHERE daily_key IS NOT NULL AND expires_at <= ${now}`),
    ]);
    if (results.some((r) => !r.success)) throw new Error('Creation cleanup unavailable');
  }
  async findAuthenticated(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<{ conversationId: string } | null> {
    const row = await this.db.prepare('SELECT id FROM conversations WHERE id = ? AND session_token_hash = ? AND created_at > ?')
      .bind(conversationId, sessionTokenHash, createdAfter).first<{ id: string }>();
    return row ? { conversationId: row.id } : null;
  }
}

function readMessage(row: Record<string, unknown>): AdmittedMessage {
  return { messageId: String(row.id), requestId: String(row.request_id), question: String(row.question), createdAt: String(row.created_at),
    contextAnchorMessageId: String(row.context_anchor_message_id), submissionIdentity: JSON.parse(String(row.submission_identity)) as SubmissionIdentity,
    submittedScope: JSON.parse(String(row.submitted_scope)) as AdmittedMessage['submittedScope'] };
}

function resultReads(db: D1Database, conversationId: string): D1PreparedStatement[] {
  return [
    'SELECT a.* FROM answers a JOIN messages m ON m.id = a.message_id WHERE m.conversation_id = ?',
    'SELECT b.* FROM answer_blocks b JOIN answers a ON a.id = b.answer_id JOIN messages m ON m.id = a.message_id WHERE m.conversation_id = ? ORDER BY b.sequence',
    'SELECT s.* FROM source_excerpts s JOIN answers a ON a.id = s.answer_id JOIN messages m ON m.id = a.message_id WHERE m.conversation_id = ? ORDER BY s.sequence',
    'SELECT e.*, s.response_local_id FROM answer_block_sources e JOIN source_excerpts s ON s.answer_id = e.answer_id AND s.id = e.source_excerpt_id JOIN answers a ON a.id = e.answer_id JOIN messages m ON m.id = a.message_id WHERE m.conversation_id = ? ORDER BY e.sequence',
  ].map((sql) => db.prepare(sql).bind(conversationId));
}
function readResult(message: AdmittedMessage, rows: Record<string, unknown>[][]): ConversationResult | undefined {
  const answer = rows[0]?.find((a) => a.message_id === message.messageId);
  if (!answer) return undefined;
  const result: ConversationResult = {
    requestId: message.requestId, messageId: message.messageId, answerId: String(answer.id), status: answer.status as ConversationResult['status'],
    language: String(answer.language), submittedScope: message.submittedScope,
    blocks: rows[1]!.filter((b) => b.answer_id === answer.id).map((b): AnswerBlock => ({ blockId: String(b.id), kind: b.kind as AnswerBlock['kind'],
      text: String(b.text), sourceIds: rows[3]!.filter((e) => e.answer_block_id === b.id).map((e) => String(e.response_local_id)) })),
    sourceExcerpts: rows[2]!.filter((s) => s.answer_id === answer.id).map((s): SourceExcerpt => ({ sourceExcerptId: String(s.id), responseLocalId: String(s.response_local_id),
      documentId: String(s.document_id), sourceChunkId: String(s.source_chunk_id), contentHash: String(s.content_hash), sourceTitle: String(s.source_title),
      sectionTitle: s.section_title === null ? null : String(s.section_title), sourcePath: s.source_path as SourceExcerpt['sourcePath'], sourceRevision: String(s.source_revision),
      excerpt: String(s.excerpt), location: String(s.location) })),
    ...(answer.error_json === null ? {} : { error: JSON.parse(String(answer.error_json)) as NonNullable<ConversationResult['error']> }),
  };
  validateConversationResult(result);
  return result;
}
