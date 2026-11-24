import { expect, it, vi } from 'vitest';
import { claim, editDraft, emptyComposer, resolveRejected, settle, type Attempt, type ComposerState } from '../../frontend/src/composer-state';
import { DEFAULT_ADMISSION_LIMITS } from '../../src/shared/conversation-admission';
import { completeResult, controlledFailure, validateConversationResult } from '../../src/shared/conversation-result';
const ready = (text: string): ComposerState => ({ ...emptyComposer(text), authority: { kind: 'ready' } });
const scope = { catalogHash: 'a'.repeat(64), catalogRevision: 'b'.repeat(40) };
const send = (state: ComposerState) => claim(state, 'one', scope);
const rejection = { kind: 'rejected', reason: { kind: 'invalid' } } as const;
const saved = (attempt: Attempt) => ({ kind: 'saved', turn: { question: attempt.body.question, result: controlledFailure({ requestId: attempt.body.requestId,
  messageId: crypto.randomUUID(), submittedScope: { version: 1, mode: 'global_public', ...scope, resources: [], eligibleDocumentIds: ['doc'] } }, 'processing_unavailable') } } as const);

it('keeps the entire invalid draft, captures once only when admissible', () => {
  for (const text of ['   ', 'a'.repeat(1001), '\uD800']) {
    const state = ready(text); expect(send(state)).toBe(state);
  }
  for (const kind of ['checking', 'busy', 'processor', 'stale', 'limit', 'scope', 'unverified', 'access'] as const) {
    const state = { ...ready('ok'), authority: { kind } }; expect(send(state)).toBe(state);
  }
  const state = ready('  Question 😀\n '), sent = send(state), attempt = sent.pending!;
  expect(attempt).toMatchObject({ conversationId: 'one', revision: 0, body: { question: state.text, selection: { ...scope, resourceIds: [] } } });
  expect(sent.text).toBe(''); expect(send(sent)).toBe(sent); expect(attempt.body.requestId).toBeTruthy();
  expect(Object.isFrozen(attempt.body.selection.resourceIds)).toBe(true);
});
it('unknown freezes only the pending request and cannot transition on late receipts', () => {
  const sent = send(ready('one')), later = editDraft(sent, 'two'), unknown = settle(later, sent.pending!, { kind: 'unknown' });
  expect(unknown.pending).toBe(sent.pending); expect(unknown.text).toBe('two'); expect(send(unknown)).toBe(unknown);
  expect(settle(unknown, sent.pending!, rejection)).toBe(unknown); expect(settle(unknown, sent.pending!, saved(sent.pending!))).toBe(unknown);
});
it('only the matching attempt can finish; admission comes from the server even at the default cap', () => {
  const sent = send(ready('one')), attempt = sent.pending!, receipt = saved(attempt);
  const later = editDraft(sent, 'two');
  expect(settle(later, send(ready('else')).pending!, receipt)).toBe(later);
  expect(settle(later, attempt, saved(send(ready('else')).pending!))).toBe(later);
  const done = settle(later, attempt, receipt);
  expect(done).toMatchObject({ authority: { kind: 'checking' }, pending: null, turns: [receipt.turn], text: later.text, revision: later.revision });
  expect(send(done)).toBe(done);
  const other = claim(ready('two'), 'different', scope); expect(settle(other, attempt, receipt)).toBe(other);
  const history = Array.from({ length: DEFAULT_ADMISSION_LIMITS.maxMessages - 1 }, (_, i) => saved(send(ready(`Earlier ${i}`)).pending!).turn);
  const cap = settle({ ...later, turns: history }, attempt, receipt);
  expect(cap.turns).toHaveLength(DEFAULT_ADMISSION_LIMITS.maxMessages);
  expect(cap.authority.kind).toBe('checking'); expect(send(cap)).toBe(cap);
  expect(send({ ...cap, authority: { kind: 'ready' } }).pending?.body.question).toBe(later.text);
  const blocked = { ...cap, authority: { kind: 'limit' } } as const; expect(send(blocked)).toBe(blocked);
});
it.each(['messageId', 'answerId'] as const)('treats a reused %s on a fresh request as unknown', field => {
  const first = send(ready('First')), receipt = saved(first.pending!);
  const confirmed = settle(first, first.pending!, receipt);
  const second = send(editDraft({ ...confirmed, authority: { kind: 'ready' } }, 'Second')), attempt = second.pending!;
  const reply = saved(attempt);
  expect(reply.turn.result.requestId).not.toBe(receipt.turn.result.requestId);
  reply.turn.result[field] = receipt.turn.result[field];
  const later = editDraft(second, 'Unsent draft'), unknown = settle(later, attempt, reply);
  expect(unknown).toEqual({ ...later, unknown: true });
  expect(unknown.turns).toEqual([receipt.turn]); expect(unknown.pending).toBe(attempt); expect(send(unknown)).toBe(unknown);
});
it('restores an untouched revision but never silently restores after edit-then-clear', () => {
  const sent = send(ready('original')), a = sent.pending!;
  const restored = settle(sent, a, rejection); expect(send(restored)).toBe(restored);
  const amended = editDraft(restored, 'amended'); expect(send(amended)).toBe(amended);
  const independent = send({ ...amended, authority: { kind: 'ready' } });
  expect(independent.pending?.body.question).toBe('amended');
  const done = settle(independent, independent.pending!, saved(independent.pending!));
  const originalAgain = editDraft({ ...done, authority: { kind: 'ready' } }, a.body.question);
  expect(send(originalAgain)).toBe(originalAgain);
  expect(restored).toMatchObject({ pending: null, text: 'original', rejected: null });
  const cleared = editDraft(editDraft(sent, 'other'), ''), refused = settle(cleared, a, rejection);
  expect(refused).toMatchObject({ text: '', revision: 2, pending: null, rejected: { attempt: a, reason: rejection.reason }, turns: [] });
  expect(resolveRejected(refused, a, 'restore')).toMatchObject({ text: 'original', revision: 3, rejected: null });
  const newer = editDraft(refused, 'new'); expect(resolveRejected(newer, a, 'restore')).toBe(newer);
  expect(resolveRejected(newer, a, 'discard')).toMatchObject({ text: 'new', rejected: null });
  const replacement = send({ ...newer, authority: { kind: 'ready' } }); expect(replacement.pending?.body.question).toBe('new'); expect(replacement.rejected).toBe(null);
  expect(resolveRejected(replacement, a, 'discard')).toBe(replacement);
  const lastInvalid = settle(replacement, replacement.pending!, rejection);
  const previous = editDraft({ ...lastInvalid, authority: { kind: 'ready' } }, a.body.question);
  expect(send(previous)).toBe(previous); // The shorter refusal tightens, never loosens, the session bound.
  expect(send(ready(a.body.question)).pending?.body.question).toBe(a.body.question);
});

it.each([{}, { randomUUID: () => { throw new Error(); } }])('an unavailable request identity blocks before capture', crypto => {
  vi.stubGlobal('crypto', crypto);
  try {
    const state = ready('  Garder ce texte  '), blocked = send(state);
    expect(blocked).toEqual({ ...state, authority: { kind: 'identityUnavailable' } }); expect(send(blocked)).toBe(blocked);
  } finally { vi.unstubAllGlobals(); }
});

it.each([
  { ids: ['b', 'a'], coherent: true }, { ids: ['a'], coherent: false }, { ids: ['a', 'c'], coherent: false },
])('checks document membership across receipts for one catalog: $ids', ({ ids, coherent }) => {
  const first = send(ready('First')), receipt = saved(first.pending!);
  receipt.turn.result.submittedScope.eligibleDocumentIds = ['a', 'b'];
  const confirmed = settle(first, first.pending!, receipt);
  const second = send(editDraft({ ...confirmed, authority: { kind: 'ready' } }, 'Second')), attempt = second.pending!;
  const later = editDraft(second, 'Unsent'), reply = saved(attempt);
  reply.turn.result.submittedScope.eligibleDocumentIds = ids;
  const observed = settle(later, attempt, reply);
  if (coherent) expect(observed.turns).toEqual([receipt.turn, reply.turn]);
  else { expect(observed).toEqual({ ...later, unknown: true }); expect(send(observed)).toBe(observed); }
});

it.each(['intact', 'new citation label', 'block', 'excerpt ID', 'text', 'documentId', 'sourcePath',
  'sourceTitle', 'sectionTitle', 'location', 'new revision', 'new chunk', 'new chunk and hash', 'new section and hash', 'different context and section', 'different context', 'changed primary with context', 'partial overlap', 'partial overlap CRLF', 'missing final LF', 'partial context over primary', 'new excerpt and hash', 'new revision and hash', 'revised text under same hash',
  'different chunk and document under same hash', 'updated chunk', 'changed hash only', 'updated in new revision', 'reassigned chunk',
  'new chunk moved file', 'new chunk changed title', 'path reassigned', 'other file same title', 'renamed in new revision',
  'after EOF', 'after EOF in another document', 'after EOF in another revision'])(
  'checks persisted IDs and hash-bound fields separately from reusable passage identities: %s', variant => {
  const reply = (attempt: Attempt) => {
    const { messageId, requestId, submittedScope } = saved(attempt).turn.result;
    submittedScope.eligibleDocumentIds = ['doc', 'other'];
    const result = completeResult({ ...attempt.body, messageId, requestId, submittedScope, createdAt: '2026-11-25T13:33:00.000Z',
      contextAnchorMessageId: messageId, submissionIdentity: { kind: 'direct', question: attempt.body.question, resourceIds: [], ...scope } },
    { status: 'answered', language: 'fr', blocks: [{ kind: 'paragraph', text: 'Exemple fictif.', sourceIds: ['S1'] }] },
    [{ responseLocalId: 'S1', chunk: { chunkId: 'chunk', documentId: 'doc', sourcePath: 'content/public/fiction.md', sourceRevision: scope.catalogRevision,
      contentHash: 'c'.repeat(64), text: 'Extrait fictif.\nSans rapport avec BC.', sourceTitle: 'Fiction', sectionTitle: null, location: 'lines:11-12', rank: 0 } }]);
    return { kind: 'saved', turn: { question: attempt.body.question, result } } as const;
  };
  const first = send(ready('Premier')), one = reply(first.pending!), confirmed = settle(first, first.pending!, one);
  const second = send(editDraft({ ...confirmed, authority: { kind: 'ready' } }, 'Second')), a = second.pending!, two = reply(a);
  const previous = one.turn.result, result = two.turn.result;
  const source = result.sourceExcerpts[0]!;
  const original = structuredClone(one.turn);
  expect(source.sourceExcerptId).not.toBe(previous.sourceExcerpts[0]!.sourceExcerptId);
  switch (variant) {
    case 'changed primary with context': case 'partial overlap': case 'partial overlap CRLF': case 'missing final LF': case 'partial context over primary':
      source.sourceChunkId = 'other-chunk'; source.contentHash = 'e'.repeat(64);
      if (variant === 'changed primary with context') {
        source.location += ';context:7-7'; source.excerpt = 'Contexte fictif.\n' + source.excerpt + ' Variante.';
      } else if (variant === 'partial context over primary') {
        source.location = 'lines:20-20;context:10-11'; source.excerpt = 'Autre ligne.\nVariante.\nPlus loin.';
      } else {
        source.location = 'lines:10-11';
        const ending = variant === 'partial overlap CRLF' ? '\r\n' : variant === 'missing final LF' ? '' : '\n';
        source.excerpt = 'Autre ligne.\nExtrait fictif.' + ending;
      }
      break;
    case 'after EOF': case 'after EOF in another document': case 'after EOF in another revision':
      source.location = 'lines:13-14'; source.sourceChunkId = 'later'; source.contentHash = 'e'.repeat(64);
      if (variant === 'after EOF in another document') { source.documentId = 'other'; source.sourcePath = 'content/public/other.md'; }
      if (variant === 'after EOF in another revision') source.sourceRevision = 'd'.repeat(40);
      break;
    case 'new revision': source.sourceRevision = 'd'.repeat(40); break;
    case 'revised text under same hash': source.sourceRevision = 'd'.repeat(40); source.excerpt += ' Variante.'; break;
    case 'new chunk': source.sourceChunkId = 'other-chunk'; break;
    case 'new chunk and hash': case 'new section and hash': case 'different context and section': case 'different context': case 'new excerpt and hash': case 'new revision and hash':
      source.sourceChunkId = 'other-chunk'; source.contentHash = 'e'.repeat(64);
      if (variant === 'new excerpt and hash') source.excerpt += ' Variante.';
      if (variant === 'different context' || variant === 'different context and section') {
        source.location += ';context:7-7'; source.excerpt = '> Contexte fictif.\n' + source.excerpt;
      }
      if (variant === 'new section and hash' || variant === 'different context and section') source.sectionTitle = 'Autre section';
      if (variant === 'new revision and hash') source.sourceRevision = 'd'.repeat(40);
      break;
    case 'different chunk and document under same hash': source.sourceChunkId = 'other-chunk'; source.documentId = 'other'; break;
    case 'new chunk moved file': case 'new chunk changed title': case 'path reassigned': case 'other file same title':
      source.sourceChunkId = 'other-chunk'; source.contentHash = 'e'.repeat(64);
      if (variant === 'new chunk moved file' || variant === 'other file same title') source.sourcePath = 'content/public/other.md';
      if (variant === 'new chunk changed title') source.sourceTitle += ' modifié';
      if (variant === 'path reassigned' || variant === 'other file same title') source.documentId = 'other';
      break;
    case 'renamed in new revision':
      source.sourceRevision = 'd'.repeat(40); source.sourcePath = 'content/public/renamed.md'; source.sourceTitle += ' modifié';
      source.contentHash = 'e'.repeat(64); break;
    case 'changed hash only': source.contentHash = 'e'.repeat(64); break;
    case 'updated in new revision': source.sourceRevision = 'd'.repeat(40); source.contentHash = 'e'.repeat(64); source.excerpt += ' Mise à jour.'; break;
    case 'updated chunk': source.contentHash = 'e'.repeat(64); source.excerpt += ' Mise à jour.'; break;
    case 'reassigned chunk': source.contentHash = 'e'.repeat(64); source.documentId = 'other'; break;
    case 'block': result.blocks[0]!.blockId = previous.blocks[0]!.blockId; break;
    case 'excerpt ID': source.sourceExcerptId = previous.sourceExcerpts[0]!.sourceExcerptId; break;
    case 'text': source.excerpt += ' Autre texte.'; break;
    case 'documentId': source.documentId = 'other'; break;
    case 'sourcePath': source.sourcePath = 'content/public/other.md'; break;
    case 'sourceTitle': source.sourceTitle = 'Autre titre'; break;
    case 'sectionTitle': source.sectionTitle = 'Section fictive'; break;
    case 'location': source.location = 'lines:5-6'; break;
    case 'new citation label': source.responseLocalId = 'S2'; result.blocks[0]!.sourceIds = ['S2']; break;
  }
  validateConversationResult(result); // Each receipt is canonical in isolation.
  const edited = editDraft(second, 'Brouillon'), observed = settle(edited, a, two);
  expect(observed.turns[0]).toEqual(original);
  if (['intact', 'new citation label', 'new revision', 'new chunk', 'different context', 'partial overlap', 'new revision and hash', 'updated in new revision', 'other file same title', 'renamed in new revision', 'after EOF in another document', 'after EOF in another revision'].includes(variant)) expect(observed).toMatchObject({ pending: null, turns: [one.turn, two.turn], text: edited.text, unknown: false });
  else { expect(observed).toEqual({ ...edited, unknown: true }); expect(send(observed)).toBe(observed); }
});
