import { catalogAssetPath, exactObject, fullRevision, jcs, publicString, stringSet, validUnicode } from './public-catalog.ts';

export interface AdmissionLimits { maxQuestionCharacters: number; maxMessages: number; leaseMilliseconds: number }
export const DEFAULT_ADMISSION_LIMITS: Readonly<AdmissionLimits> = Object.freeze({ maxQuestionCharacters: 1000, maxMessages: 20, leaseMilliseconds: 40_000 });
// Unicode code points, without normalization: CR and LF each count, combining
// marks count separately, and an astral character counts once. Shared with UI.
export function countQuestionCharacters(question: string): number { return Array.from(question).length; }
export function admissionLimits(overrides: Partial<AdmissionLimits> = {}): AdmissionLimits {
  const limits = { ...DEFAULT_ADMISSION_LIMITS, ...overrides };
  if (Object.values(limits).some((n) => !Number.isSafeInteger(n) || n < 1)) throw new Error('Invalid admission configuration');
  return limits;
}
export type SubmitTurnRequest = { requestId: string } & (
  | { question: string; selection: { resourceIds: string[]; catalogRevision: string; catalogHash: string } }
  | { retryOfRequestId: string }
);
export type SubmissionIdentity =
  | { kind: 'direct'; question: string; resourceIds: string[]; catalogRevision: string; catalogHash: string }
  | { kind: 'retry'; retryOfRequestId: string };
export interface SubmittedScope {
  version: 1;
  mode: 'global_public';
  catalogRevision: string;
  catalogHash: string;
  resources: [];
  eligibleDocumentIds: string[];
}
export interface AdmittedMessage {
  messageId: string;
  requestId: string;
  question: string;
  createdAt: string;
  contextAnchorMessageId: string;
  submissionIdentity: SubmissionIdentity;
  submittedScope: SubmittedScope;
  // Internal answer-owned provenance; never accepted or returned by HTTP.
  contextReset?: boolean;
  result?: import('./conversation-result.ts').ConversationResult;
}
export interface ProcessingLease { requestId: string; attemptId: string; until: number }
export interface AdmissionState { messages: AdmittedMessage[]; lease: ProcessingLease | null }
export type AdmissionErrorCode = 'invalid_request' | 'invalid_scope' | 'invalid_retry' | 'request_conflict' | 'request_in_progress' | 'conversation_busy' | 'catalog_stale' | 'scope_unavailable' | 'turn_limit_reached' | 'result_unavailable' | 'provider_unavailable';
export interface CatalogIdentity { catalogRevision: string; catalogHash: string }
export class AdmissionRejected extends Error {
  readonly code: AdmissionErrorCode;
  constructor(code: AdmissionErrorCode, readonly currentCatalog?: CatalogIdentity, readonly resumeAt?: string) { super(code); this.name = 'AdmissionRejected'; this.code = code; }
}
export function normalizeSubmission(value: unknown): { requestId: string; identity: SubmissionIdentity } {
  try {
    if (!value || typeof value !== 'object') throw new Error();
    const retry = 'retryOfRequestId' in value;
    const body = exactObject(value, retry ? ['requestId', 'retryOfRequestId'] : ['requestId', 'question', 'selection']);
    const requestId = publicString(body.requestId);
    if (retry) return { requestId, identity: { kind: 'retry', retryOfRequestId: publicString(body.retryOfRequestId) } };
    if (typeof body.question !== 'string' || !validUnicode(body.question)) throw new Error();
    let selection;
    try {
      selection = exactObject(body.selection, ['resourceIds', 'catalogRevision', 'catalogHash']);
      const catalogHash = publicString(selection.catalogHash);
      catalogAssetPath(catalogHash);
      return { requestId, identity: { kind: 'direct', question: body.question, resourceIds: stringSet(selection.resourceIds), catalogRevision: fullRevision(selection.catalogRevision), catalogHash } };
    } catch { throw new AdmissionRejected('invalid_scope'); }
  } catch (error) {
    if (error instanceof AdmissionRejected) throw error;
    throw new AdmissionRejected('invalid_request');
  }
}
export function sameIdentity(a: SubmissionIdentity, b: SubmissionIdentity): boolean { return jcs(a) === jcs(b); }
export type AdmissionOutcome = { status: 'admitted' | 'recovered'; message: AdmittedMessage; lease: ProcessingLease } | { status: 'interrupted' | 'completed'; message: AdmittedMessage };
