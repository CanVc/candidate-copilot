import { CONVERSATION_RETENTION_MS } from '../../application/conversations.ts';
import { AdmissionRejected, type AdmittedMessage, type AdmissionState, type AdmissionOutcome, type SubmissionIdentity } from '../../shared/conversation-admission.ts';
import { ConversationUnavailable } from '../../shared/conversation.ts';
import { jcs } from '../../shared/public-catalog.ts';
import { publicationGuard } from './publication.ts';
import type { AtomicAdmission, ConversationStore, StoredConversation } from '../../ports/ConversationStore.ts';
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
  async readAdmissionState(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<AdmissionState | null> {
    const results = await this.db.batch<Record<string, unknown>>([
      this.db.prepare('SELECT id FROM conversations WHERE id = ? AND session_token_hash = ? AND created_at > ?').bind(conversationId, sessionTokenHash, createdAfter),
      this.db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY ordinal').bind(conversationId),
      this.db.prepare('SELECT * FROM conversation_processing_leases WHERE conversation_id = ?').bind(conversationId),
    ]);
    if (results.some((r) => !r.success)) throw new Error('Admission read unavailable');
    if (!results[0]?.results.length) return null;
    const lease = results[2]?.results[0];
    return { messages: results[1]!.results.map(readMessage), lease: lease ? {
      requestId: String(lease.request_id), attemptId: String(lease.attempt_id), until: Number(lease.processing_until),
    } : null };
  }
  async admit(command: AtomicAdmission): Promise<AdmissionOutcome> {
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
      WHEN EXISTS (SELECT 1 FROM conversation_processing_leases WHERE conversation_id = ? AND processing_until > ${now} AND request_id = ?) THEN 'request_in_progress'
      WHEN EXISTS (SELECT 1 FROM conversation_processing_leases WHERE conversation_id = ? AND processing_until > ${now}) THEN 'conversation_busy'
      WHEN EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?) AND ? = 0 THEN 'interrupted'
      WHEN NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?) AND ? = 1 THEN 'invalid_request'
      WHEN NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?)
        AND (SELECT COUNT(*) FROM messages WHERE conversation_id = ?) >= ? THEN 'turn_limit_reached'
      WHEN NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?)
        AND NOT EXISTS (SELECT 1 FROM active_publication WHERE id = 1 AND catalog_revision = ? AND catalog_hash = ?) THEN 'catalog_stale'
      WHEN NOT (${guard.sql}) THEN 'scope_unavailable'
      WHEN EXISTS (SELECT 1 FROM messages m, json_each(m.submitted_scope, '$.eligibleDocumentIds') member
        WHERE m.conversation_id = ? AND m.request_id = ? AND NOT EXISTS (SELECT 1 FROM public_documents d WHERE d.document_id = member.value)) THEN 'scope_unavailable'
      ELSE 'acquire' END`;
    const bindings = [conversationId, sessionTokenHash, conversationId, requestId, identityJson, conversationId, requestId,
      conversationId, conversationId, requestId, Number(recover), conversationId, requestId, Number(recover),
      conversationId, requestId, conversationId, limits.maxMessages, conversationId, requestId, publication.catalogRevision, publication.catalogHash, ...guard.bindings, conversationId, requestId];
    const results = await this.db.batch<Record<string, unknown>>([
      this.db.prepare(`SELECT ${decision} AS outcome, EXISTS (SELECT 1 FROM messages WHERE conversation_id = ? AND request_id = ?) AS recovering`).bind(...bindings, conversationId, requestId),
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
    ]);
    if (results.some((r) => !r.success)) throw new Error('Admission persistence unavailable');
    const row = results[4]?.results[0];
    if (row?.attempt_id === attemptId) return { status: results[0]?.results[0]?.recovering ? 'recovered' : 'admitted', message: readMessage(row), lease: { requestId, attemptId, until: Number(row.processing_until) } };
    const outcome = results[0]?.results[0]?.outcome;
    if (outcome === 'interrupted' && row) return { status: 'interrupted', message: readMessage(row) };
    if (outcome === 'conversation_unavailable') throw new ConversationUnavailable();
    if (typeof outcome === 'string' && outcome !== 'acquire' && outcome !== 'interrupted') throw new AdmissionRejected(outcome as import('../../shared/conversation-admission.ts').AdmissionErrorCode);
    throw new AdmissionRejected('result_unavailable');
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
