import { beforeCutoff, startAttemptTimer } from '../../src/shared/attempt-timing';
import type { CreatedConversation } from '../../src/shared/conversation';
import { coherentHistory, type Attempt, type Block, type ReceivedTurn, type Rejection, type Submission } from './composer-state';
import { countQuestionCharacters, type CatalogIdentity, type SubmittedScope } from '../../src/shared/conversation-admission';
import { validateConversationResult, type ConversationResult } from '../../src/shared/conversation-result';
import { fullRevision, jcs, publicString, stringSet } from '../../src/shared/public-catalog';
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
type OpeningSlot = { current: AbortController | null };
export function endOpening(slot: OpeningSlot) {
  const owner = slot.current;
  slot.current = null;
  owner?.abort();
}
// Cancellation bounds the wait; only the current owner may apply its receipt.
export async function receiveOpening<T>(slot: OpeningSlot, owner: AbortController, receipt: Promise<T>, apply: (value: T) => void | Promise<void>) {
  const value = await receipt;
  if (slot.current === owner && !owner.signal.aborted) await apply(value);
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
function exact(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
function processor(value: Record<string, unknown>, keys: string[]): Block | null {
  if (exact(value, keys)) return { kind: 'processor' };
  if (exact(value, [...keys, 'resumeAt']) && validDate(value.resumeAt)) return { kind: 'processor', resumeAt: value.resumeAt };
  return null;
}
const denied = (status: number, body: unknown) => status === 401 && object(body) && exact(body, ['error']) && body.error === 'conversation_unavailable';
function globalScope(value: unknown): value is SubmittedScope {
  return object(value) && exact(value, ['version', 'mode', 'catalogRevision', 'catalogHash', 'resources', 'eligibleDocumentIds']) &&
    value.version === 1 && value.mode === 'global_public' && !!fullRevision(value.catalogRevision) &&
    typeof value.catalogHash === 'string' && /^[a-f0-9]{64}$/.test(value.catalogHash) &&
    Array.isArray(value.resources) && !value.resources.length && Array.isArray(value.eligibleDocumentIds) &&
    value.eligibleDocumentIds.length > 0 && jcs(stringSet(value.eligibleDocumentIds)) === jcs(value.eligibleDocumentIds);
}
function suffixRow(value: unknown) {
  const keys = ['messageId', 'requestId', 'question', 'createdAt', 'submittedScope', 'status'];
  if (!object(value) || !exact(value, value.status === 'completed' ? [...keys, 'result'] : keys) ||
      !validDate(value.createdAt) || !globalScope(value.submittedScope)) throw new Error('Invalid transcript row');
  const row = { requestId: publicString(value.requestId), messageId: publicString(value.messageId), question: publicString(value.question),
    submittedScope: value.submittedScope };
  if (value.status === 'interrupted' || value.status === 'in_progress') return { ...row, status: value.status };
  if (value.status !== 'completed') throw new Error('Invalid transcript status');
  const result = value.result as ConversationResult;
  validateConversationResult(result);
  if (result.requestId !== row.requestId || result.messageId !== row.messageId || jcs(result.submittedScope) !== jcs(row.submittedScope)) {
    throw new Error('Inconsistent transcript result');
  }
  return { ...row, status: value.status, result };
}
function idleAuthority(admission: Record<string, unknown>, count: number): Block | { kind: 'ready' } | null {
  if (admission.available === true && exact(admission, ['available'])) return { kind: 'ready' };
  if (admission.available !== false) return null;
  if (admission.reason === 'processing_unavailable') return processor(admission, ['available', 'reason']);
  if (!exact(admission, ['available', 'reason'])) return null;
  if (admission.reason === 'scope_unavailable') return { kind: 'scope' };
  if (admission.reason === 'turn_limit_reached' && count > 0) return { kind: 'limit' };
  return null;
}
type AdmissionRead = { authority: Block | { kind: 'ready' } | { kind: 'unverified'; refusalContradicted: true }; confirmedTurns?: ReceivedTurn[] };
// One bounded authority read, never a transcript import or a recovery loop. Only
// the exact conversation and locally confirmed history may open the send gate.
export async function readAdmission(access: CreatedConversation, turns: readonly ReceivedTurn[], signal: AbortSignal, { fresh, refused }: { fresh?: boolean; refused?: Attempt } = {}): Promise<AdmissionRead> {
  const unverified = { authority: { kind: 'unverified' } } as const;
  try {
    const { status, body } = await json(`${path}/${access.conversationId}`, { headers: auth(access) }, signal);
    if (denied(status, body)) return { authority: { kind: 'access' } };
    if (status !== 200 || !object(body) || body.conversationId !== access.conversationId || !Array.isArray(body.transcript) ||
        !object(body.processing) || !object(body.admission)) return unverified;
    const { processing, admission, transcript } = body;
    if (!exact(body, ['conversationId', 'transcript', 'admission', 'processing']) ||
        (fresh && (transcript.length !== 0 || processing.status !== 'idle'))) return unverified;
    // Stage only local rows. Nothing reaches the conversation owner until the whole read is verified.
    const confirmedTurns: ReceivedTurn[] = [];
    for (const [i, turn] of turns.entries()) {
      const { question, result, createdAt } = turn;
      const row = transcript[i];
      if (!object(row) || !exact(row, ['messageId', 'requestId', 'question', 'createdAt', 'submittedScope', 'result', 'status']) ||
          !validDate(row.createdAt) || (createdAt !== undefined && createdAt !== row.createdAt) || row.status !== 'completed' ||
          row.question !== question || row.requestId !== result.requestId || row.messageId !== result.messageId ||
          jcs(row.submittedScope) !== jcs(result.submittedScope) || jcs(row.result) !== jcs(result)) return unverified;
      confirmedTurns.push(createdAt === undefined ? { ...turn, createdAt: row.createdAt } : turn);
    }
    const suffix = transcript.slice(turns.length).map(suffixRow);
    if (suffix.length && !coherentHistory(turns, suffix)) return unverified;
    const active = suffix.filter(row => row.status === 'in_progress');
    const idle = processing.status === 'idle' && exact(processing, ['status']);
    const authority = idle && active.length === 0 ? idleAuthority(admission, transcript.length) :
      active.length === 1 && active[0] === suffix.at(-1) && processing.status === 'in_progress' && exact(processing, ['status', 'requestId']) &&
      processing.requestId === active[0]!.requestId && admission.available === false && admission.reason === 'conversation_busy' &&
      exact(admission, ['available', 'reason']) ? { kind: 'busy' } as const : null;
    if (!authority) return unverified;
    if (!suffix.length) return { authority, confirmedTurns };
    // A coherent suffix is evidence, never local history or permission to send.
    const disputed = suffix.find(row => row.requestId === refused?.body.requestId);
    if (disputed && refused) {
      const { question, selection } = refused.body;
      if (refused.conversationId === access.conversationId && disputed.question === question &&
          disputed.submittedScope.catalogRevision === selection.catalogRevision && disputed.submittedScope.catalogHash === selection.catalogHash) {
        return { authority: { kind: 'unverified', refusalContradicted: true } };
      }
      return unverified;
    }
    return authority.kind === 'ready' ? unverified : { authority, confirmedTurns };
  } catch { /* No authority to enable another send. */ }
  return unverified;
}
export async function initialScope(access: CreatedConversation, signal: AbortSignal): Promise<CatalogIdentity | Block> {
  const { authority: admission } = await readAdmission(access, [], signal, { fresh: true });
  if (admission.kind !== 'ready') return admission;
  try {
    const health = await json('/api/health', {}, signal);
    if (health.status === 200 && isHealthResponse(health.body)) {
      const { catalogRevision, catalogHash } = health.body;
      return { catalogRevision, catalogHash };
    }
    if (health.status === 503 && object(health.body) && health.body.status === 'unavailable') return { kind: 'scope' };
  } catch { /* No verified global scope. */ }
  return { kind: 'unverified' };
}
function rejection(status: number, body: Record<string, unknown>, { selection: submitted, question }: Attempt['body'], turns: readonly ReceivedTurn[]): Rejection | null {
  const error = body.error;
  if (!object(error) || !publicString(error.message) || error.retryable !== false || error.retryMode !== 'none') return null;
  const keys = ['code', 'message', 'retryable', 'retryMode'];
  if (status === 409 && error.code === 'catalog_stale' && exact(error, keys) &&
      exact(body, ['requestId', 'error', 'catalogRevision', 'catalogHash']) && typeof body.catalogRevision === 'string' &&
      (body.catalogRevision !== submitted.catalogRevision || body.catalogHash !== submitted.catalogHash) &&
      /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(body.catalogRevision) && typeof body.catalogHash === 'string' && /^[a-f0-9]{64}$/.test(body.catalogHash)) {
    // A claimed selection alone is not a confirmed publication. A saved scope is.
    const conflict = turns.some(({ result: { submittedScope } }) => submittedScope.catalogHash === body.catalogHash &&
      submittedScope.catalogRevision !== body.catalogRevision);
    return conflict ? null : { kind: 'stale' };
  }
  if (!exact(body, ['requestId', 'error'])) return null;
  if (status === 503 && error.code === 'provider_unavailable') return processor(error, keys);
  if (!exact(error, keys)) return null;
  if (status === 409 && error.code === 'scope_unavailable') return { kind: 'scope' };
  if (status === 409 && error.code === 'conversation_busy') return { kind: 'busy' };
  if (status === 429 && error.code === 'turn_limit_reached') return { kind: 'limit' };
  // A claimed direct question is nonblank and valid. Every configured length limit is at least one code point.
  if (status === 400 && error.code === 'invalid_request' && countQuestionCharacters(question) > 1) return { kind: 'invalid' };
  // invalid_scope and invalid_retry cannot describe this frozen direct-global envelope.
  return null;
}
export async function submitAttempt(access: CreatedConversation, attempt: Attempt, turns: readonly ReceivedTurn[], signal: AbortSignal): Promise<Submission> {
  const unknown = { kind: 'unknown' } as const;
  if (access.conversationId !== attempt.conversationId) return unknown;
  const { requestId, question, selection } = attempt.body;
  try {
    const { status, body } = await json(`${path}/${attempt.conversationId}/messages`, {
      method: 'POST', headers: { ...auth(access), 'Content-Type': 'application/json' }, body: JSON.stringify(attempt.body),
    }, signal, messageTransportWaitMs());
    // Access may have expired during finalization, after admission.
    if (denied(status, body)) return { kind: 'unknown', accessLost: true };
    if (!object(body) || body.requestId !== requestId) return unknown;
    if (status === 200) {
      const result = body as unknown as ConversationResult;
      validateConversationResult(result);
      if (result.submittedScope.catalogRevision !== selection.catalogRevision || result.submittedScope.catalogHash !== selection.catalogHash) return unknown;
      return { kind: 'saved', turn: { question, result } };
    }
    const reason = rejection(status, body, attempt.body, turns);
    if (reason) return { kind: 'rejected', reason };
  } catch { /* A lost receipt is not a recorded failure. */ }
  return unknown;
}
