import { randomBytes, randomUUID } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
import { createEntry, initialScope, submitInitial } from '../../frontend/src/entry-transport';
import { messageTransportWaitMs } from '../../frontend/src/message-transport';
import { controlledFailure } from '../../src/shared/conversation-result';

const access = { conversationId: randomUUID(), sessionToken: randomBytes(32).toString('hex') };
const scope = { catalogRevision: 'a'.repeat(40), catalogHash: 'b'.repeat(64) };
const signal = () => new AbortController().signal;
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const recorded = (requestId: string, catalog = scope) => controlledFailure({ requestId, messageId: randomUUID(), submittedScope: {
  ...catalog, version: 1, mode: 'global_public', eligibleDocumentIds: ['fiction'], resources: [],
} }, 'processing_unavailable', 'fr');
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

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
  expect(await initialScope(access, signal())).toBe('unverified'); expect(fetch).toHaveBeenCalledTimes(1);
});

it.each([
  ['catalog_stale', 409, 'stale'], ['scope_unavailable', 409, 'scope'], ['provider_unavailable', 503, 'processor'],
  ['invalid_request', 400, 'rejected'], ['invalid_scope', 400, 'rejected'], ['conversation_busy', 409, 'rejected'],
  ['turn_limit_reached', 429, 'rejected'], ['result_unavailable', 503, 'unknown'],
  ['catalog_stale', 500, 'unknown'], ['malformed success', 200, 'unknown'], ['failed', 200, 'failed'],
] as const)('one exact initial message, %s / %i', async (code, status, expected) => {
  const question = '  Quels choix ?\n😀  ';
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const { requestId } = JSON.parse(init.body as string);
    return response(code === 'failed' ? recorded(requestId) : { requestId, error: { code } }, status);
  });
  vi.stubGlobal('fetch', fetch);
  expect(await submitInitial(access, scope, question, signal())).toBe(expected);
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, init] = fetch.mock.calls[0]!;
  expect(url).toBe(`/api/conversations/${access.conversationId}/messages`);
  expect(init.redirect).toBe('error'); expect(init.method).toBe('POST');
  expect(new Headers(init.headers).get('Authorization') === `Bearer ${access.sessionToken}`).toBe(true);
  const { requestId, ...payload } = JSON.parse(init.body as string);
  expect(requestId).toMatch(/^[0-9a-f-]{36}$/); expect(payload).toEqual({ question, selection: { ...scope, resourceIds: [] } });
});

it.each(['requestId', 'catalogRevision', 'catalogHash'] as const)('refuses valid receipt with wrong %s', async field => {
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => response(recorded(field === 'requestId' ? randomUUID() : JSON.parse(init.body as string).requestId,
    { catalogRevision: field === 'catalogRevision' ? 'c'.repeat(40) : scope.catalogRevision, catalogHash: field === 'catalogHash' ? 'c'.repeat(64) : scope.catalogHash })));
  expect(await submitInitial(access, scope, 'Fiction ?', signal())).toBe('unknown');
});

it('message waits past the shorter creation deadline for a valid recorded receipt', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', (_url: string, init: RequestInit) => new Promise(resolve => setTimeout(() => resolve(response(recorded(JSON.parse(init.body as string).requestId))), 5000)));
  const result = submitInitial(access, scope, 'Fiction ?', signal()); await vi.advanceTimersByTimeAsync(5000);
  expect(await result).toBe('failed');
});

it('message deadline is unknown; no second POST or creation', async () => {
  vi.useFakeTimers(); let calls = 0;
  vi.stubGlobal('fetch', () => { calls++; return new Promise(() => {}); });
  const result = submitInitial(access, scope, 'Fiction ?', signal()); await vi.advanceTimersByTimeAsync(messageTransportWaitMs());
  expect(await result).toBe('unknown'); expect(calls).toBe(1); expect(vi.getTimerCount()).toBe(0);
});
