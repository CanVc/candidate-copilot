import { countQuestionCharacters, DEFAULT_ADMISSION_LIMITS, type AdmittedMessage, type CatalogIdentity } from '../../src/shared/conversation-admission';
import { excerptContentCheck, parseLineLocation, type ConversationResult, type SourceExcerpt } from '../../src/shared/conversation-result';
import { validUnicode } from '../../src/shared/public-catalog';

export type Block = { kind: 'unverified' | 'access' | 'scope' | 'stale' | 'busy' | 'limit' } | { kind: 'processor'; resumeAt?: string };
export type Authority = Block | { kind: 'ready' | 'checking' | 'identityUnavailable' };
export type Rejection = Block | { kind: 'invalid' };
export type Attempt = Readonly<{
  conversationId: string; revision: number;
  body: Readonly<{ requestId: string; question: string; selection: Readonly<CatalogIdentity & { resourceIds: readonly [] }> }>;
}>;
export type ReceivedTurn = { question: string; result: ConversationResult; readonly createdAt?: string };
export type Submission = { kind: 'saved'; turn: ReceivedTurn } | { kind: 'unknown'; accessLost?: true } | { kind: 'rejected'; reason: Rejection };
export interface ComposerState {
  authority: Authority;
  text: string;
  revision: number;
  turns: ReceivedTurn[];
  pending: Attempt | null;
  unknown: boolean;
  rejected: { attempt: Attempt; reason: Rejection } | null;
  lastRejection: { restoredAtRevision: number | null } | null;
  refusedLength: number | null;
}
export const emptyComposer = (text = ''): ComposerState => ({ authority: { kind: 'checking' }, text, revision: 0,
  turns: [], pending: null, unknown: false, rejected: null, lastRejection: null, refusedLength: null });
export const editDraft = (state: ComposerState, text: string): ComposerState => ({ ...state, text, revision: state.revision + 1 });
export function inputProblem({ text, refusedLength }: Pick<ComposerState, 'text' | 'refusedLength'>, required = true) {
  const length = countQuestionCharacters(text);
  if (length > DEFAULT_ADMISSION_LIMITS.maxQuestionCharacters) return 'Raccourcissez la question avant l’envoi.';
  if (refusedLength !== null && length >= refusedLength) return `Le service a refusé une question de ${refusedLength} caractères. Raccourcissez votre question.`;
  if (!validUnicode(text)) return 'Remplacez les caractères non valides avant l’envoi.';
  return required && !text.trim() ? 'Saisissez une question avant l’envoi.' : null;
}
export const canSend = (state: ComposerState) => state.authority.kind === 'ready' && !state.pending && !inputProblem(state);
export function claim(state: ComposerState, conversationId: string, scope: CatalogIdentity): ComposerState {
  if (!canSend(state)) return state;
  let requestId: string;
  try { requestId = crypto.randomUUID(); }
  catch { return { ...state, authority: { kind: 'identityUnavailable' }, lastRejection: null }; }
  const selection = Object.freeze({ ...scope, resourceIds: Object.freeze([] as const) });
  const body = Object.freeze({ requestId, question: state.text, selection });
  return { ...state, text: '', rejected: null, lastRejection: null, pending: Object.freeze({ conversationId, revision: state.revision, body }) };
}
type HistoryRow = Pick<AdmittedMessage, 'requestId' | 'messageId' | 'submittedScope' | 'result'>;
// Stronger than historical decoding: only a producer-consistent copy can settle
// a direct POST or make an appended GET row evidence against a refusal.
function receiptLineCheck() {
  type DocumentLines = { copies: Map<number, string>; primaryTitles: Map<number, string | null>; highest: number; eof: number | null };
  const documents = new Map<string, DocumentLines>();
  return ({ location, sourceRevision, documentId, sectionTitle, excerpt }: SourceExcerpt) => {
    if (!location.startsWith('lines:')) return true;
    const lines = parseLineLocation(location);
    if (!lines) return false;
    const { primary, context } = lines;
    let previousEnd = 0;
    for (const { start, end } of context) {
      if (start <= previousEnd || end >= primary.start) return false;
      previousEnd = end;
    }
    const doc = JSON.stringify([sourceRevision, documentId]);
    let observed = documents.get(doc);
    if (!observed) {
      observed = { copies: new Map(), primaryTitles: new Map(), highest: 0, eof: null };
      documents.set(doc, observed);
    }
    const { copies, primaryTitles } = observed;
    // The producer copies context first, then the primary passage. Advance by
    // actual text, retaining each LF (and any CR), never by a claimed extent.
    const ranges = [...context, primary];
    let range = 0, line = ranges[0]!.start;
    for (let start = 0; start < excerpt.length;) {
      if (range === ranges.length) return false;
      const lf = excerpt.indexOf('\n', start), end = lf < 0 ? excerpt.length : lf + 1;
      const copy = excerpt.slice(start, end), previous = copies.get(line);
      if (previous !== undefined && previous !== copy) return false;
      // An unterminated copy is the last physical line, in either observation order.
      if ((observed.eof !== null && line > observed.eof) || (lf < 0 && line < observed.highest)) return false;
      if (lf < 0) observed.eof = line;
      observed.highest = Math.max(observed.highest, line);
      copies.set(line, copy);
      if (range === context.length) {
        if (primaryTitles.has(line) && primaryTitles.get(line) !== sectionTitle) return false;
        primaryTitles.set(line, sectionTitle);
      }
      start = end;
      if (line < ranges[range]!.end) line++;
      else line = ranges[++range]?.start ?? 0;
    }
    return range === ranges.length;
  };
}
// Each persisted table has its own ID namespace. Citation labels belong to one
// answer; document and chunk identities can legitimately recur across answers.
export function coherentHistory(turns: readonly ReceivedTurn[], appended: readonly HistoryRow[]): boolean {
  const requests = new Set<string>(), messages = new Set<string>(), answers = new Set<string>();
  const blocks = new Set<string>(), excerpts = new Set<string>();
  const acceptContent = excerptContentCheck(), acceptLines = receiptLineCheck();
  const documentByChunk = new Map<string, string>();
  // A revision pins the source file, but not its citation labels or excerpt row IDs.
  const hashByRevisionChunk = new Map<string, string>(), fileByRevisionDocument = new Map<string, SourceExcerpt>();
  const documentByRevisionPath = new Map<string, string>();
  const catalogs = new Map<string, { revision: string; docs: Set<string> }>();
  function fresh(ids: Set<string>, id: string) {
    if (ids.has(id)) return false;
    ids.add(id); return true;
  }
  function accept({ requestId, messageId, submittedScope, result }: HistoryRow) {
    if (!fresh(requests, requestId) || !fresh(messages, messageId)) return false;
    const { catalogRevision, catalogHash, eligibleDocumentIds } = submittedScope;
    const known = catalogs.get(catalogHash);
    if (!known) catalogs.set(catalogHash, { revision: catalogRevision, docs: new Set(eligibleDocumentIds) });
    else if (known.revision !== catalogRevision || known.docs.size !== eligibleDocumentIds.length ||
      eligibleDocumentIds.some(id => !known.docs.has(id))) return false;
    return !result || (fresh(answers, result.answerId) && result.blocks.every(b => fresh(blocks, b.blockId)) &&
      result.sourceExcerpts.every(source => {
        if (!fresh(excerpts, source.sourceExcerptId)) return false;
        const owner = documentByChunk.get(source.sourceChunkId);
        if (owner !== undefined && owner !== source.documentId) return false;
        documentByChunk.set(source.sourceChunkId, source.documentId);
        // Revisions are hex, so the first colon unambiguously separates the key parts.
        const atRevision = (id: string) => `${source.sourceRevision}:${id}`;
        const chunk = atRevision(source.sourceChunkId), doc = atRevision(source.documentId), path = atRevision(source.sourcePath);
        const hash = hashByRevisionChunk.get(chunk), file = fileByRevisionDocument.get(doc), pathOwner = documentByRevisionPath.get(path);
        if ((hash !== undefined && hash !== source.contentHash) || (file && (file.sourcePath !== source.sourcePath || file.sourceTitle !== source.sourceTitle)) ||
            (pathOwner !== undefined && pathOwner !== source.documentId)) return false;
        hashByRevisionChunk.set(chunk, source.contentHash); fileByRevisionDocument.set(doc, source); documentByRevisionPath.set(path, source.documentId);
        return acceptLines(source) && acceptContent(source);
      }));
  }
  return turns.every(({ result }) => accept({ ...result, result })) && appended.every(accept);
}
export function settle(state: ComposerState, attempt: Attempt, outcome: Submission): ComposerState {
  if (state.pending !== attempt || state.unknown) return state;
  if (outcome.kind === 'unknown') return { ...state, unknown: true, authority: outcome.accessLost ? { kind: 'access' } : state.authority };
  if (outcome.kind === 'saved') {
    if (outcome.turn.result.requestId !== attempt.body.requestId || outcome.turn.question !== attempt.body.question) return state;
    const result = outcome.turn.result;
    if (!coherentHistory(state.turns, [{ ...result, result }])) return { ...state, unknown: true };
    const turns = [...state.turns, outcome.turn];
    return { ...state, pending: null, turns, authority: { kind: 'checking' } };
  }
  const unchanged = state.revision === attempt.revision;
  return { ...state, pending: null, authority: outcome.reason.kind === 'invalid' ? { kind: 'checking' } : outcome.reason,
    refusedLength: outcome.reason.kind === 'invalid' ? countQuestionCharacters(attempt.body.question) : state.refusedLength,
    lastRejection: { restoredAtRevision: unchanged ? state.revision : null }, ...(unchanged ? { text: attempt.body.question } : { rejected: { attempt, reason: outcome.reason } }) };
}
export function resolveRejected(state: ComposerState, attempt: Attempt, action: 'restore' | 'discard'): ComposerState {
  if (state.rejected?.attempt !== attempt || (action === 'restore' && state.text !== '')) return state;
  return { ...(action === 'restore' ? editDraft(state, attempt.body.question) : state), rejected: null };
}
