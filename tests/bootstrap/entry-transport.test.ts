import { readFileSync } from 'node:fs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
import { createEntry, endOpening, initialScope, readAdmission, receiveOpening, submitAttempt } from '../../frontend/src/entry-transport';
import { claim, editDraft, emptyComposer, settle } from '../../frontend/src/composer-state';
import { messageTransportWaitMs } from '../../frontend/src/message-transport';
import { assembleValidatedArtifacts } from '../../tools/public-content/build';
import type { PublicChunk, PublicSearchArtifacts } from '../../src/shared/public-evidence';
import { completeResult, controlledFailure } from '../../src/shared/conversation-result';

const access = { conversationId: randomUUID(), sessionToken: randomBytes(32).toString('hex') };
const scope = { catalogRevision: 'a'.repeat(40), catalogHash: 'b'.repeat(64) };
const attempt = (question = 'Fiction ?') => ({ conversationId: access.conversationId, revision: 4, body: { requestId: randomUUID(), question, selection: { ...scope, resourceIds: [] as const } } });
const signal = () => new AbortController().signal;
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const recorded = (requestId: string, catalog = scope) => controlledFailure({ requestId, messageId: randomUUID(), submittedScope: {
  ...catalog, version: 1, mode: 'global_public', eligibleDocumentIds: ['fiction'], resources: [],
} }, 'processing_unavailable', 'fr');
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it.each(['released', 'replaced'])('drops an opening receipt when its owner is %s, independently of cancellation', async disposition => {
  const owner = new AbortController(), slot: { current: AbortController | null } = { current: owner };
  // Inert owner, state and transport: only the guard runs, never a session or a fetch.
  vi.spyOn(owner, 'abort').mockImplementation(() => {});
  const install = vi.fn(), edit = vi.fn(), send = vi.fn();
  const receipt = receiveOpening(slot, owner, Promise.resolve('fixture'), () => { install(); edit(); send(); });
  endOpening(slot); expect(slot.current).toBeNull();
  if (disposition === 'replaced') slot.current = new AbortController();
  await receipt;
  expect(owner.signal.aborted).toBe(false);
  expect(install).not.toHaveBeenCalled(); expect(edit).not.toHaveBeenCalled(); expect(send).not.toHaveBeenCalled();
});

it.each([
  ['wrong status', 200, access, 'uncertain'], ['missing token', 201, { conversationId: access.conversationId }, 'uncertain'],
  ['bad UUID', 201, { ...access, conversationId: '../health' }, 'uncertain'], ['bad token', 201, { ...access, sessionToken: 'fff' }, 'uncertain'],
  ['extra field', 201, { ...access, extra: true }, 'uncertain'], ['no UTC receipt', 429, { error: 'rate_limited' }, 'uncertain'],
  ['uncertain', 503, { error: 'creation_uncertain' }, 'uncertain'], ['origin', 403, { error: 'creation_origin_rejected' }, 'rejected'],
  ['body', 400, { error: 'creation_body_rejected' }, 'rejected'], ['size', 413, { error: 'creation_body_too_large' }, 'rejected'],
  ['type', 415, { error: 'creation_content_type_rejected' }, 'rejected'], ['unknown 403', 403, {}, 'uncertain'],
] as const)('%s cannot release the question', async (_name, status, body, outcome) => {
  const fetch = vi.fn(async (_url: string, _init: RequestInit) => response(body, status));
  vi.stubGlobal('fetch', fetch);
  expect((await createEntry(signal())).kind).toBe(outcome);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('/api/conversations', expect.objectContaining({ method: 'POST', body: '{}' }));
});

it.each([
  ['unconfirmed selection', false, scope.catalogHash, 'c'.repeat(40), 'stale'],
  ['confirmed hash, wrong revision', true, scope.catalogHash, 'c'.repeat(40), 'unknown'],
  ['different hash, same revision', true, 'd'.repeat(64), scope.catalogRevision, 'stale'],
  ['older confirmed pair', true, 'e'.repeat(64), 'f'.repeat(40), 'stale'],
  ['older hash, wrong revision', true, 'e'.repeat(64), 'c'.repeat(40), 'unknown'],
] as const)('catalog_stale checks confirmed pairs: %s', async (_label, history, catalogHash, catalogRevision, expected) => {
  const turns = history ? [recorded(randomUUID(), { catalogHash: 'e'.repeat(64), catalogRevision: 'f'.repeat(40) }), recorded(randomUUID())]
    .map(result => ({ result, question: 'Fiction' })) : [];
  const capture = attempt();
  const fetch = vi.fn(async () => response({ requestId: capture.body.requestId, catalogHash, catalogRevision,
    error: { code: 'catalog_stale', message: 'Fiction', retryable: false, retryMode: 'none' } }, 409));
  vi.stubGlobal('fetch', fetch);
  expect(await submitAttempt(access, capture, turns, signal())).toEqual(expected === 'unknown'
    ? { kind: 'unknown' } : { kind: 'rejected', reason: { kind: 'stale' } });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('bounds a lost creation body and ignores a later valid receipt', async () => {
  vi.useFakeTimers(); let close!: (value: unknown) => void, observed: AbortSignal | undefined;
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    observed = init.signal ?? undefined;
    return { status: 201, headers: new Headers(), json: () => new Promise(resolve => { close = resolve; }) };
  });
  const result = createEntry(signal()); await vi.advanceTimersByTimeAsync(4500);
  expect((await result).kind).toBe('uncertain'); expect(observed?.aborted).toBe(true); close(access);
});

it('reads only a fresh empty authenticated view and coherent live scope', async () => {
  const fetch = vi.fn(async (url: string, _init: RequestInit) => url === '/api/health'
    ? response({ status: 'ok', ...scope, catalogAssetPath: `/assets/resources-catalog.${scope.catalogHash}.json` })
    : response({ conversationId: access.conversationId, processing: { status: 'idle' }, transcript: [], admission: { available: true } }));
  vi.stubGlobal('fetch', fetch);
  expect(await initialScope(access, signal())).toEqual(scope);
  expect(fetch).toHaveBeenCalledTimes(2);
  const [view, health] = fetch.mock.calls;
  expect(view![0]).toBe(`/api/conversations/${access.conversationId}`);
  expect(new Headers(view![1].headers).get('Authorization') === `Bearer ${access.sessionToken}`).toBe(true);
  expect(new Headers(health![1].headers).has('Authorization')).toBe(false);
});

it('does not release a question on contradictory readiness', async () => {
  const fetch = vi.fn(async () => response({ conversationId: access.conversationId, processing: { status: 'idle' }, transcript: [],
    admission: { available: true, reason: 'processing_unavailable' } }));
  vi.stubGlobal('fetch', fetch);
  expect(await initialScope(access, signal())).toEqual({ kind: 'unverified' }); expect(fetch).toHaveBeenCalledTimes(1);
});

it.each([
  ['catalog_stale', 409, 'stale'], ['scope_unavailable', 409, 'scope'], ['provider_unavailable', 503, 'processor'],
  ['invalid_request', 400, 'invalid'], ['invalid_scope', 400, 'unknown'], ['conversation_busy', 409, 'busy'], ['invalid_retry', 400, 'unknown'],
  ['turn_limit_reached', 429, 'limit'], ['request_in_progress', 409, 'unknown'], ['request_conflict', 409, 'unknown'], ['result_unavailable', 503, 'unknown'],
  ['catalog_stale', 500, 'unknown'], ['malformed success', 200, 'unknown'], ['failed', 200, 'failed'],
] as const)('one exact initial message, %s / %i', async (code, status, expected) => {
  const question = '  Quels choix ?\n😀  ';
  let saved: ReturnType<typeof recorded> | undefined;
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const { requestId } = JSON.parse(init.body as string);
    saved = recorded(requestId);
    return response(code === 'failed' ? saved : { requestId, ...(code === 'catalog_stale' ? { ...scope, catalogHash: 'c'.repeat(64) } : {}), error: { code, message: 'Démo', retryable: false, retryMode: 'none' } }, status);
  });
  vi.stubGlobal('fetch', fetch);
  const captured = attempt(question);
  expect(await submitAttempt(access, captured, [], signal())).toEqual(expected === 'failed' ? { kind: 'saved', turn: { question, result: saved } } : expected === 'unknown' ? { kind: 'unknown' } : { kind: 'rejected', reason: { kind: expected } });
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, init] = fetch.mock.calls[0]!;
  expect(url).toBe(`/api/conversations/${access.conversationId}/messages`);
  expect(init.redirect).toBe('error'); expect(init.method).toBe('POST');
  expect(new Headers(init.headers).get('Authorization') === `Bearer ${access.sessionToken}`).toBe(true);
  const { requestId, ...payload } = JSON.parse(init.body as string);
  expect(requestId).toBe(captured.body.requestId); expect(payload).toEqual({ question, selection: { ...scope, resourceIds: [] } });
});

it.each([
  ['catalog_stale', 409, {}], ['turn_limit_reached', 429, { retryable: true }], ['turn_limit_reached', 429, { retryMode: 'same_request' }],
] as const)('contradictory %s receipt does not establish rejection', async (code, status, override) => {
  const capture = attempt();
  vi.stubGlobal('fetch', async () => response({ requestId: capture.body.requestId, ...(code === 'catalog_stale' ? scope : {}),
    error: { code, message: 'Démo', retryable: false, retryMode: 'none', ...override } }, status));
  expect(await submitAttempt(access, capture, [], signal())).toEqual({ kind: 'unknown' });
});

for (const code of ['invalid_retry', 'invalid_scope', 'foreign invalid_request']) it.each(['', 'New draft'])(`a ${code} refusal cannot settle this direct attempt (later draft: "%s")`, async draft => {
  const uuid = vi.spyOn(crypto, 'randomUUID');
  try {
    const sent = claim({ ...emptyComposer('Original'), authority: { kind: 'ready' } }, access.conversationId, scope);
    const capture = sent.pending!;
    const fetch = vi.fn(async () => response({ requestId: code.startsWith('foreign') ? randomUUID() : capture.body.requestId,
      error: { code: code.startsWith('foreign') ? 'invalid_request' : code, message: 'Démo', retryable: false, retryMode: 'none' } }, 400));
    vi.stubGlobal('fetch', fetch);
    const receipt = submitAttempt(access, capture, [], signal());
    const later = draft ? editDraft(sent, draft) : sent;
    const unknown = settle(later, capture, await receipt);
    expect(unknown).toEqual({ ...later, unknown: true }); expect(unknown.pending).toBe(capture); expect(unknown.text).toBe(draft);
    expect(claim(unknown, access.conversationId, scope)).toBe(unknown);
    expect(uuid).toHaveBeenCalledTimes(1); expect(fetch).toHaveBeenCalledTimes(1);
  } finally { uuid.mockRestore(); }
});

it('does not promote the real result_unavailable wire projection to rejection', async () => {
  const capture = attempt();
  vi.stubGlobal('fetch', async () => response({ requestId: capture.body.requestId,
    error: { code: 'result_unavailable', message: 'Démo', retryable: true, retryMode: 'same_request' } }, 503));
  expect(await submitAttempt(access, capture, [], signal())).toEqual({ kind: 'unknown' });
});

it('bounds the admission read including its body; no retry or late permission', async () => {
  vi.useFakeTimers(); let finish!: (value: unknown) => void, observed: AbortSignal | undefined;
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    observed = init.signal ?? undefined;
    return { status: 200, headers: new Headers(), json: () => new Promise(resolve => { finish = resolve; }) };
  });
  vi.stubGlobal('fetch', fetch);
  const authority = readAdmission(access, [], signal()); await vi.advanceTimersByTimeAsync(4500);
  expect(observed?.aborted).toBe(true); expect(await authority).toEqual({ authority: { kind: 'unverified' } });
  finish({ conversationId: access.conversationId, transcript: [], processing: { status: 'idle' }, admission: { available: true } });
  await vi.advanceTimersByTimeAsync(65_000); expect(fetch).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0);
});

it.each(['requestId', 'catalogRevision', 'catalogHash'] as const)('refuses valid receipt with wrong %s', async field => {
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => response(recorded(field === 'requestId' ? randomUUID() : JSON.parse(init.body as string).requestId,
    { catalogRevision: field === 'catalogRevision' ? 'c'.repeat(40) : scope.catalogRevision, catalogHash: field === 'catalogHash' ? 'c'.repeat(64) : scope.catalogHash })));
  expect(await submitAttempt(access, attempt(), [], signal())).toEqual({ kind: 'unknown' });
});

it('refuses a correlated 200 whose saved paragraph cites an absent excerpt', async () => {
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const { error: _error, ...receipt } = recorded(JSON.parse(init.body as string).requestId);
    return response({ ...receipt, status: 'answered', blocks: [{ blockId: 'b1', kind: 'paragraph', text: 'Fiction', sourceIds: ['missing'] }] });
  });
  expect(await submitAttempt(access, attempt(), [], signal())).toEqual({ kind: 'unknown' });
});

it('message waits past the shorter creation deadline for a valid recorded receipt', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', (_url: string, init: RequestInit) => new Promise(resolve => setTimeout(() => resolve(response(recorded(JSON.parse(init.body as string).requestId))), 5000)));
  const result = submitAttempt(access, attempt(), [], signal()); await vi.advanceTimersByTimeAsync(5000);
  expect(await result).toMatchObject({ kind: 'saved', turn: { question: 'Fiction ?', result: { status: 'failed' } } });
});

it('message deadline is unknown; no second POST or creation', async () => {
  vi.useFakeTimers(); let calls = 0;
  vi.stubGlobal('fetch', () => { calls++; return new Promise(() => {}); });
  const result = submitAttempt(access, attempt(), [], signal()); await vi.advanceTimersByTimeAsync(messageTransportWaitMs());
  expect(await result).toEqual({ kind: 'unknown' }); expect(calls).toBe(1); expect(vi.getTimerCount()).toBe(0);
});

it.each([
  [401, { error: 'conversation_unavailable' }, { kind: 'unknown', accessLost: true }],
  [401, {}, { kind: 'unknown' }], [429, { error: { code: 'turn_limit_reached' } }, { kind: 'unknown' }],
])('access loss or malformed rejection is not proof of non-admission', async (status, body, expected) => {
  const capture = attempt();
  vi.stubGlobal('fetch', async () => response(status === 429 ? { requestId: capture.body.requestId, ...body as object } : body, Number(status)));
  expect(await submitAttempt(access, capture, [], signal())).toEqual(expected);
});
it('verifies conversation, matching confirmed history and capacity, never grants from a terminal alone', async () => {
  const result = recorded(randomUUID()), turn = { result, question: 'Q' };
  result.submittedScope.eligibleDocumentIds = ['a', 'b'];
  const row = { ...turn, createdAt: '2026-11-25T13:30:00.000Z', submittedScope: result.submittedScope, requestId: result.requestId, messageId: result.messageId, status: 'completed' };
  const view = { conversationId: access.conversationId, processing: { status: 'idle' }, transcript: [row], admission: { available: true } };
  const changedScope = { ...result.submittedScope, eligibleDocumentIds: ['elsewhere'] };
  const active = { createdAt: '2026-11-25T13:33:00.000Z', requestId: 'other-request', messageId: 'other-message', submittedScope: result.submittedScope, question: 'Q2', status: 'in_progress' };
  const envelope = (row: { requestId: string; question: string }) => {
    const a = attempt(row.question); return { refused: { ...a, body: { ...a.body, requestId: row.requestId } } };
  };
  const busy = { processing: { status: 'in_progress', requestId: active.requestId }, admission: { available: false, reason: 'conversation_busy' } };
  vi.stubGlobal('fetch', async () => response({ ...view, ...busy, transcript: [row, active] }));
  expect(await readAdmission(access, [turn], signal(), envelope(active))).toEqual({ authority: { kind: 'unverified', refusalContradicted: true } });
  expect(await readAdmission(access, [turn], signal(), envelope({ ...active, requestId: 'refused' }))).toEqual({ authority: { kind: 'busy' }, confirmedTurns: [{ ...turn, createdAt: row.createdAt }] });
  for (const last of [row, { ...active, status: 'interrupted' }]) {
    vi.stubGlobal('fetch', async () => response({ ...view, transcript: [last] }));
    expect(await readAdmission(access, [], signal(), envelope(last))).toEqual({ authority: { kind: 'unverified', refusalContradicted: true } });
  }
  for (const [delta, expected] of [
    [{}, { kind: 'ready' }], [{ conversationId: randomUUID() }, { kind: 'unverified' }],
    ...[undefined, '2026-13-35'].map(createdAt => [{ transcript: [{ ...row, createdAt }] }, { kind: 'unverified' }] as const),
    [{ transcript: [] }, { kind: 'unverified' }], [{ transcript: [{ ...row, question: 'other' }] }, { kind: 'unverified' }],
    [{ transcript: [{ ...row, result: { ...result, answerId: randomUUID() } }] }, { kind: 'unverified' }],
    [{ transcript: [{ ...row, result: { ...result, language: 'en' } }] }, { kind: 'unverified' }],
    [{ transcript: [{ ...row, submittedScope: changedScope }] }, { kind: 'unverified' }],
    [{ transcript: [{ ...row, result: { ...result, submittedScope: changedScope } }] }, { kind: 'unverified' }],
    [{ ...busy, transcript: [row, active] }, { kind: 'busy' }], [busy, { kind: 'unverified' }],
    [{ ...busy, transcript: [{ ...row, question: 'wrong' }, active] }, { kind: 'unverified' }],
    [{ ...busy, transcript: [row, { ...active, requestId: 'different' }] }, { kind: 'unverified' }],
    [{ ...busy, transcript: [row, { ...active, status: 'completed' }] }, { kind: 'unverified' }],
    [{ ...busy, processing: { ...busy.processing, requestId: '\ud800' }, transcript: [row, { ...active, requestId: '\ud800' }] }, { kind: 'unverified' }],
    ...[{ messageId: '\ud800' }, { submittedScope: { ...result.submittedScope, eligibleDocumentIds: ['b', 'a'] } }, { question: undefined }, { createdAt: undefined }, { createdAt: 'bad' }, { submittedScope: undefined },
      { submittedScope: { ...result.submittedScope, mode: 'other' } }, { submittedScope: changedScope }].map(delta =>
      [{ ...busy, transcript: [row, { ...active, ...delta }] }, { kind: 'unverified' }] as const),
    [{ admission: { available: false, reason: 'turn_limit_reached' } }, { kind: 'limit' }],
    [{ admission: { available: false, reason: 'processing_unavailable', resumeAt: 'bad' } }, { kind: 'unverified' }],
    [{ admission: { available: false, reason: 'processing_unavailable', resumeAt: '2026-11-25T13:33:00.000Z' } }, { kind: 'processor', resumeAt: '2026-11-25T13:33:00.000Z' }],
  ] as const) {
    const fetch = vi.fn(async () => response({ ...view, ...delta })); vi.stubGlobal('fetch', fetch);
    expect(await readAdmission(access, [turn], signal())).toEqual({ authority: expected,
      ...(expected.kind === 'unverified' ? {} : { confirmedTurns: [{ ...turn, createdAt: row.createdAt }] }) }); expect(fetch).toHaveBeenCalledTimes(1);
  }
});

it('checks the older confirmed row even when the latest row and idle admission agree', async () => {
  const turns = ['First', 'Second'].map(question => ({ question, result: recorded(randomUUID()) }));
  const transcript = turns.map(({ question, result }) => ({ question, result, status: 'completed', requestId: result.requestId,
    messageId: result.messageId, createdAt: '2026-11-25T13:33:00.000Z', submittedScope: result.submittedScope }));
  vi.stubGlobal('fetch', async () => response({ conversationId: access.conversationId, processing: { status: 'idle' }, admission: { available: true }, transcript }));
  expect(await readAdmission(access, turns, signal())).toEqual({ authority: { kind: 'ready' },
    confirmedTurns: turns.map((turn, i) => ({ ...turn, createdAt: transcript[i]!.createdAt })) });
  transcript[0]!.question = 'Altered';
  expect(await readAdmission(access, turns, signal())).toEqual({ authority: { kind: 'unverified' } });
});

it('distinguishes fresh empty idle authority from a coherent but unexpected active row or impossible empty cap', async () => {
  const active = { question: 'Q', requestId: 'r', messageId: 'm', status: 'in_progress', createdAt: '2026-11-25T13:30:00.000Z', submittedScope: recorded('r').submittedScope };
  for (const view of [
    { transcript: [active], processing: { status: 'in_progress', requestId: 'r' }, admission: { available: false, reason: 'conversation_busy' } },
    { transcript: [], processing: { status: 'idle' }, admission: { available: false, reason: 'turn_limit_reached' } },
  ]) {
    const fetch = vi.fn(async () => response({ ...view, conversationId: access.conversationId })); vi.stubGlobal('fetch', fetch);
    expect(await initialScope(access, signal())).toEqual({ kind: 'unverified' }); expect(fetch).toHaveBeenCalledTimes(1);
    expect(await readAdmission(access, [], signal())).toEqual(view.transcript.length ? { authority: { kind: 'busy' }, confirmedTurns: [] } : { authority: { kind: 'unverified' } });
  }
});

it('only uses a completed suffix as cap evidence when its cited chunks and file agree', async () => {
  const { requestId, messageId, answerId, submittedScope } = recorded(randomUUID());
  const first = { sourceExcerptId: 'e1', responseLocalId: 'S1', sourceChunkId: 'one', documentId: 'fiction',
    sourcePath: 'content/public/fiction.md', sourceTitle: 'Fiction', sourceRevision: scope.catalogRevision,
    contentHash: '1'.repeat(64), location: 'lines:11-12', excerpt: 'Premier exemple fictif.\r\nSans rapport avec BC.\r\n', sectionTitle: null };
  const second = { ...first, sourceExcerptId: 'e2', responseLocalId: 'S2', sourceChunkId: 'two', contentHash: '2'.repeat(64),
    location: 'lines:21-22', excerpt: 'Deuxième exemple fictif.\nSans rapport avec BC.' };
  const lowerEOF = { ...first, excerpt: first.excerpt.slice(0, -2) };
  for (const [sourceExcerpts, kind] of [
    [[first, second], 'limit'], [[second, first], 'limit'], // Real CRLF below a valid unterminated final line.
    [[lowerEOF, second], 'unverified'], [[second, lowerEOF], 'unverified'],
    [[first, { ...second, sourceChunkId: 'one' }], 'unverified'],
    [[first, { ...second, sourceTitle: 'Autre titre' }], 'unverified'],
    [[first, { ...second, location: 'lines:1-9007199254740991' }], 'unverified'],
    [[first, { ...second, location: 'heading:fiction' }], 'limit'],
  ] as const) {
    const result = { requestId, messageId, answerId, submittedScope, status: 'answered', language: 'fr', sourceExcerpts,
      blocks: [{ blockId: 'b', kind: 'paragraph', text: 'Exemples fictifs.', sourceIds: ['S1', 'S2'] }] };
    const row = { requestId, messageId, submittedScope, result, status: 'completed', question: 'Exemples ?', createdAt: '2026-11-25T13:33:00.000Z' };
    vi.stubGlobal('fetch', async () => response({ conversationId: access.conversationId, transcript: [row], processing: { status: 'idle' },
      admission: { available: false, reason: 'turn_limit_reached' } }));
    expect(await readAdmission(access, [], signal())).toEqual(kind === 'limit' ? { authority: { kind }, confirmedTurns: [] } : { authority: { kind } });
  }
});

// No seeded intermediate passage ends on nonblank text. Exercise EOF at the
// data-input seam, not as a claim about Chromium or the publication in D1.
it('compares a builder-produced lower passage with and without only its final LF', async () => {
  const path = 'content/public/projet-prototype-prets.md', original = readFileSync(path);
  expect(createHash('sha256').update(original).digest('hex')).toBe('945a1f3d2d853205085fec7f6246bd1a415b3c09e9b3b65913e4fcba35f01e2a');
  const lines = original.toString('utf8').match(/[^\n]*\n|[^\n]+$/g)!;
  expect(lines.splice(27, 1)).toEqual(['\n']); // private fixture only: remove blank line 28
  const bytes = Buffer.from(lines.join(''));
  // Content-derived fixture identity, NOT a Git revision of the pinned corpus.
  const catalogRevision = createHash('sha256').update('2.17 EOF fixture\0').update(bytes).digest('hex');
  const bundle = assembleValidatedArtifacts([{ path, bytes }], catalogRevision);
  const selection = { catalogRevision, catalogHash: bundle.catalogHash, resourceIds: [] as const };
  const search: PublicSearchArtifacts = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!);
  const lower = search.chunks.find(c => c.sectionTitle === 'Ma contribution et le périmètre réalisé')!;
  const higher = search.chunks.find(c => c.sectionTitle === 'Solution et choix importants')!;
  expect(lower.location).toBe('lines:21-27;context:13-13'); expect(higher.location).toBe('lines:28-35;context:13-13');
  expect(lower.text).toBe(lines[12]! + lines.slice(20, 27).join('')); expect(higher.text).toBe(lines[12]! + lines.slice(27, 35).join(''));
  expect(lower.text).toMatch(/[^\s]\n$/); expect(lower.chunkId).not.toBe(higher.chunkId); expect(lower.contentHash).not.toBe(higher.contentHash);
  const submittedScope = { ...recorded('scope').submittedScope, catalogRevision, catalogHash: bundle.catalogHash, eligibleDocumentIds: [lower.documentId] };
  const row = (chunk: PublicChunk, question: string) => {
    const requestId = randomUUID(), messageId = randomUUID(), createdAt = '2026-11-25T13:33:00.000Z';
    const result = completeResult({ requestId, messageId, question, createdAt, contextAnchorMessageId: messageId, submittedScope,
      submissionIdentity: { kind: 'direct', question, ...selection, resourceIds: [] } },
    { status: 'answered', language: 'fr', blocks: [{ kind: 'paragraph', text: 'Exemple fictif.', sourceIds: ['S1'] }] },
    [{ responseLocalId: 'S1', chunk: { ...chunk, rank: 0 } }]);
    return { requestId, messageId, question, createdAt, submittedScope, status: 'completed', result };
  };
  const prior = row(higher, 'Avant'), intact = row(lower, '  Autre passage ?  '), eof = structuredClone(intact);
  const copy = eof.result.sourceExcerpts[0]!;
  expect(copy.excerpt).toBe(lower.text); copy.excerpt = copy.excerpt.slice(0, -1);
  expect(copy.excerpt.match(/[^\n]*\n|[^\n]+$/g)).toHaveLength(8); // one context + seven primary, still eight
  const refused = { ...attempt(), body: { requestId: intact.requestId, question: intact.question, selection } };
  const edited = { ...emptyComposer('Brouillon'), pending: refused, turns: [prior] };
  for (const disputed of [intact, eof]) {
    const terminal = settle(edited, refused, { kind: 'saved', turn: { question: disputed.question, result: disputed.result } });
    if (disputed === intact) expect(terminal).toMatchObject({ turns: [prior, { result: intact.result }], pending: null, text: edited.text });
    else expect(terminal).toEqual({ ...edited, unknown: true });
    const fetch = vi.fn(async () => response({ conversationId: access.conversationId, transcript: [prior, disputed],
      processing: { status: 'idle' }, admission: { available: true } })); vi.stubGlobal('fetch', fetch);
    expect(await readAdmission(access, [prior], signal(), { refused })).toEqual({ authority: disputed === intact ?
      { kind: 'unverified', refusalContradicted: true } : { kind: 'unverified' } });
    expect(fetch).toHaveBeenCalledTimes(1);
  }
});

it('attributes a refusal contradiction only after validating the whole projection against the frozen envelope', async () => {
  const refused = attempt('  Fiction ? 😀  ');
  const completed = (question: string, requestId: string) => {
    const result = recorded(requestId);
    return { question, requestId, result, submittedScope: result.submittedScope, messageId: result.messageId,
      createdAt: '2026-11-25T13:33:00.000Z', status: 'completed' };
  };
  const prior = completed('Avant', randomUUID()), disputed = completed(refused.body.question, refused.body.requestId), later = completed('Après', randomUUID());
  const { result: _result, ...incomplete } = later;
  const active = { ...incomplete, status: 'in_progress' };
  const busy = { processing: { status: 'in_progress', requestId: active.requestId }, admission: { available: false, reason: 'conversation_busy' } };
  const idle = { processing: { status: 'idle' }, admission: { available: true } };
  const check = async (suffix: unknown[], contradicted: boolean, projection: unknown = idle, envelope = refused) => {
    const fetch = vi.fn(async () => response({ conversationId: access.conversationId, transcript: [prior, ...suffix], ...projection as object }));
    vi.stubGlobal('fetch', fetch);
    expect(await readAdmission(access, [prior], signal(), { refused: envelope })).toEqual({ authority: contradicted ?
      { kind: 'unverified', refusalContradicted: true } : { kind: 'unverified' } });
    expect(fetch).toHaveBeenCalledTimes(1);
  };
  const capped = { ...idle, admission: { available: false, reason: 'turn_limit_reached' } };
  await check([disputed, later], true, capped); // disputed envelope takes precedence over capacity
  await check([{ ...later, createdAt: 'invalid' }], false, capped);
  vi.stubGlobal('fetch', async () => response({ conversationId: access.conversationId, transcript: [prior, later], ...capped }));
  expect(await readAdmission(access, [prior], signal(), { refused })).toEqual({ authority: { kind: 'limit' }, confirmedTurns: [prior] });
  const resumeAt = '2026-11-25T13:33:00.000Z';
  for (const [admission, expected] of [
    [{ available: false, reason: 'scope_unavailable' }, { kind: 'scope' }],
    [{ available: false, reason: 'processing_unavailable' }, { kind: 'processor' }],
    [{ available: false, reason: 'processing_unavailable', resumeAt }, { kind: 'processor', resumeAt }],
  ] as const) {
    const projection = { ...idle, admission };
    vi.stubGlobal('fetch', async () => response({ conversationId: access.conversationId, transcript: [prior, later], ...projection }));
    expect(await readAdmission(access, [prior], signal(), { refused })).toEqual({ authority: expected, confirmedTurns: [prior] });
    await check([disputed, later], true, projection);
    await check([{ ...later, createdAt: 'invalid' }], false, projection);
  }
  await check([disputed, later], true);
  // Same fictional completed row and saved metadata; only the type of its code differs.
  const error = disputed.result.error!;
  const malformed = { ...disputed.result, error: { ...error, code: [error.code] } };
  await check([{ ...disputed, result: malformed }, later], false);
  vi.stubGlobal('fetch', async () => response(malformed));
  expect(await submitAttempt(access, refused, [prior], signal())).toEqual({ kind: 'unknown' });
  await check([later, disputed], true);
  await check([disputed, active], true, busy);
  await check([active, disputed], false, busy); // same rows and lease, impossible admission order
  // Only prior and active share this hash. A different hash for the disputed row
  // need not have a different revision; the active row must agree with the prefix.
  const otherScope = { ...disputed.submittedScope, catalogHash: 'c'.repeat(64) };
  const otherRow = { ...disputed, submittedScope: otherScope, result: { ...disputed.result, submittedScope: otherScope } };
  const otherEnvelope = { ...refused, body: { ...refused.body, selection: { ...refused.body.selection, catalogHash: otherScope.catalogHash } } };
  await check([otherRow, active], true, busy, otherEnvelope);
  await check([otherRow, { ...active, submittedScope: { ...active.submittedScope, catalogRevision: 'd'.repeat(40) } }], false, busy, otherEnvelope);
  await check([disputed, active], false); // idle cannot have a live row
  await check([disputed, later], false, busy); // lease with no live row
  await check([disputed, { ...active, requestId: disputed.requestId }], false, busy);
  await check([disputed, later], false, { ...idle, admission: {} });
  await check([disputed, later], false, { ...idle, admission: { available: false, reason: 'processing_unavailable', resumeAt: 'bad' } });
  await check([disputed, { ...later, createdAt: 'bad' }], false);
  await check([disputed, { ...later, messageId: prior.messageId, result: { ...later.result, messageId: prior.messageId } }], false);
  await check([disputed, { ...later, result: { ...later.result, answerId: disputed.result.answerId } }], false);
  await check([disputed, { ...later, result: { ...later.result, blocks: prior.result.blocks } }], false);
  await check([{ ...disputed, result: { ...disputed.result, messageId: prior.messageId } }], false);
  await check([{ ...disputed, question: disputed.question.trim() }, later], false);
  await check([later], false);
  for (const catalog of [{ ...scope, catalogHash: 'c'.repeat(64) }, { ...scope, catalogRevision: 'd'.repeat(40) }]) {
    const submittedScope = { ...disputed.submittedScope, ...catalog };
    await check([{ ...disputed, submittedScope, result: { ...disputed.result, submittedScope } }, later], false);
  }
  await check([disputed, later], false, idle, { ...refused, conversationId: randomUUID() });
});
