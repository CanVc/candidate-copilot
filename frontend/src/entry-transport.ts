import { beforeCutoff, startAttemptTimer } from '../../src/shared/attempt-timing';
import type { CreatedConversation } from '../../src/shared/conversation';
import type { CatalogIdentity } from '../../src/shared/conversation-admission';
import { validateConversationResult, type ConversationResult } from '../../src/shared/conversation-result';
import { isHealthResponse } from '../../src/shared/health';
import { messageTransportWaitMs } from './message-transport';

const path = '/api/conversations';
const clock = { now: () => new Date() };
const shortWait = 4500;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function credentials(value: unknown): value is CreatedConversation {
  return object(value) && Object.keys(value).length === 2 && typeof value.conversationId === 'string' &&
    uuid.test(value.conversationId) && typeof value.sessionToken === 'string' && /^[0-9a-f]{64}$/.test(value.sessionToken);
}
async function json(url: string, init: RequestInit, lifecycle: AbortSignal, wait = shortWait) {
  // A stalled body counts against the same deadline as headers. Do not follow
  // redirects or let a late creation receipt release the suggested question.
  return beforeCutoff(clock, startAttemptTimer, Date.now() + wait, async ({ signal }) => {
    const options = { ...init, mode: 'same-origin', redirect: 'error', credentials: 'omit', cache: 'no-store', signal } as const;
    const response = await fetch(url, options);
    return { status: response.status, headers: response.headers, body: await response.json() as unknown };
  }, lifecycle);
}
type Creation = { kind: 'created'; access: CreatedConversation } | { kind: 'limited'; resume: string } | { kind: 'uncertain' } | { kind: 'rejected' };
export async function createEntry(signal: AbortSignal): Promise<Creation> {
  try {
    const { status, headers, body } = await json(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, signal);
    if (status === 201 && credentials(body)) return { kind: 'created', access: body };
    if (object(body) && ((status === 403 && body.error === 'creation_origin_rejected') ||
        (status === 415 && body.error === 'creation_content_type_rejected') ||
        (status === 400 && body.error === 'creation_body_rejected') ||
        (status === 413 && body.error === 'creation_body_too_large'))) return { kind: 'rejected' };
    const retry = headers.get('Retry-After');
    if (status === 429 && object(body) && body.error === 'rate_limited' && retry) {
      const date = new Date(retry);
      if (Number.isFinite(date.getTime()) && date.toUTCString() === retry) return { kind: 'limited', resume: date.toISOString() };
    }
  } catch { /* Creation may already have committed. */ }
  return { kind: 'uncertain' };
}
const auth = (access: CreatedConversation) => ({ Authorization: `Bearer ${access.sessionToken}` });
type Unavailable = 'access' | 'scope' | 'processor' | 'unverified';
export async function initialScope(access: CreatedConversation, signal: AbortSignal): Promise<CatalogIdentity | Unavailable> {
  try {
    const { status, body } = await json(`${path}/${access.conversationId}`, { headers: auth(access) }, signal);
    if (status === 401) return 'access';
    if (status !== 200 || !object(body) || body.conversationId !== access.conversationId ||
        !Array.isArray(body.transcript) || body.transcript.length !== 0 || !object(body.processing) || body.processing.status !== 'idle' ||
        !object(body.admission)) return 'unverified';
    if (body.admission.available === false) {
      if (body.admission.reason === 'scope_unavailable') return 'scope';
      if (body.admission.reason === 'processing_unavailable') return 'processor';
    }
    if (body.admission.available !== true || Object.keys(body.admission).length !== 1) return 'unverified';
    const health = await json('/api/health', {}, signal);
    if (health.status === 200 && isHealthResponse(health.body)) {
      const { catalogRevision, catalogHash } = health.body;
      return { catalogRevision, catalogHash };
    }
    return health.status === 503 && object(health.body) && health.body.status === 'unavailable' ? 'scope' : 'unverified';
  } catch { return 'unverified'; }
}
export type Submission = 'recorded' | 'failed' | 'unknown' | 'stale' | 'scope' | 'processor' | 'access' | 'rejected';
export async function submitInitial(access: CreatedConversation, scope: CatalogIdentity, question: string, signal: AbortSignal): Promise<Submission> {
  try {
    const requestId = crypto.randomUUID();
    const { status, body } = await json(`${path}/${access.conversationId}/messages`, {
      method: 'POST', headers: { ...auth(access), 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, question, selection: { resourceIds: [], ...scope } }),
    }, signal, messageTransportWaitMs());
    if (status === 401) return 'access';
    if (!object(body) || body.requestId !== requestId) return 'unknown';
    if (status === 200) {
      const result = body as unknown as ConversationResult;
      validateConversationResult(result);
      if (result.submittedScope.catalogRevision !== scope.catalogRevision || result.submittedScope.catalogHash !== scope.catalogHash) return 'unknown';
      return result.status === 'failed' ? 'failed' : 'recorded';
    }
    if (object(body.error)) {
      if (status === 409 && body.error.code === 'catalog_stale') return 'stale';
      if (status === 409 && body.error.code === 'scope_unavailable') return 'scope';
      if (status === 503 && body.error.code === 'provider_unavailable') return 'processor';
      if ((status === 400 && (body.error.code === 'invalid_request' || body.error.code === 'invalid_scope' || body.error.code === 'invalid_retry')) ||
          (status === 409 && body.error.code === 'conversation_busy') ||
          (status === 429 && body.error.code === 'turn_limit_reached')) return 'rejected';
    }
  } catch { /* A lost receipt is not a recorded failure. */ }
  return 'unknown';
}
