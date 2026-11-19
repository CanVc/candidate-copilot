import { exactObject, validUnicode } from './public-catalog.ts';
import { resultLanguage, type ResultDraft } from './conversation-result.ts';

export interface ClassifyTurnRequest {
  question: string;
  documentaryScope: { mode: 'global_public' | 'selected_resources'; resourceNames: string[] };
  conversationContext: Array<{ role: 'user' | 'assistant'; text: string }>;
  publicCatalog: Array<{ topic: string; aliases: string[]; description?: string }>;
  languagePolicy: 'follow-current-question-or-explicit-request';
}
export const INTENT_REASONS = {
  answer: ['professional_question'],
  redirect: ['professional_value_judgment', 'commitment_boundary', 'bypass_boundary'],
  refuse: ['sensitive_personal', 'commitment_boundary', 'bypass_boundary', 'non_professional'],
  clarify: ['material_ambiguity', 'missing_context'],
} as const;
type Decision = keyof typeof INTENT_REASONS;
type Reason<D extends Decision> = typeof INTENT_REASONS[D][number];
type Branch<D extends Decision> = { decision: D; reasonCode: Reason<D>; responseLanguage: string };
export type IntentContinuation = (Branch<'answer'> | Branch<'redirect'>) & {
  professionalTopic: string; resolvedQuestion: string; searchTerms: string[];
};
export type ClassifyTurnResult = IntentContinuation
  | (Branch<'refuse'> & { refusalMessage: string })
  | (Branch<'clarify'> & { clarificationQuestion: string });
export interface IntentBounds {
  question: number; topic: number; resolvedQuestion: number; term: number; terms: number;
  directText: number; outputBytes: number; historyBytes: number; catalogBytes: number;
  catalogEntries: number; aliases: number; metadataText: number; requestBytes: number;
}
// Simulation byte bounds are not model-token accounting (Story 2.10).
export const DEFAULT_INTENT_BOUNDS: Readonly<IntentBounds> = Object.freeze({
  question: 4000, topic: 200, resolvedQuestion: 4000, term: 64, terms: 16,
  directText: 600, outputBytes: 12000, historyBytes: 12000, catalogBytes: 12000,
  catalogEntries: 40, aliases: 16, metadataText: 600, requestBytes: 32000,
});
export const DEFAULT_INTENT_FORBIDDEN: readonly RegExp[] = [
  /(?:^|[^A-Z0-9_])private[/\\]/i, /PRIVATE_SENTINEL|SYNTHETIC_PRIVATE|DEV_HTTP_CANARY|INTERNAL_ONLY/i,
  /-----BEGIN (?:(?:[A-Z0-9]+ )*PRIVATE KEY|PGP PRIVATE KEY BLOCK)-----/i,
  /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Z0-9](?:[A-Z0-9.-]{0,251}[A-Z0-9])?\.[A-Z]{2,63}/i, /(?:mailto|tel)\s*:/i, /\b(?:sessionToken|session_token_hash)\b/i,
  /\b(?:SQLITE_ERROR|D1_ERROR|ReferenceError|TypeError):/i, /\bat .+\.(?:ts|js):\d+:\d+/,
];
export function intentBounds(overrides: Partial<IntentBounds> = {}): Readonly<IntentBounds> {
  const bounds = { ...DEFAULT_INTENT_BOUNDS, ...overrides };
  if (Object.values(bounds).some((n) => !Number.isSafeInteger(n) || n < 1)) throw new Error('Invalid intent bounds');
  return Object.freeze(bounds);
}
export function intentBytes(value: unknown): number { return new TextEncoder().encode(JSON.stringify(value)).length; }
export function intentText(value: unknown, maximum: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum || !validUnicode(value) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error('Invalid intent text');
  return value;
}
function strings(value: unknown, maximum: number, length: number): string[] {
  if (!Array.isArray(value) || value.length > maximum) throw new Error('Invalid intent array');
  return Array.from(value, (entry) => intentText(entry, length));
}
export function validateClassifyTurnRequest(value: ClassifyTurnRequest, bounds: Readonly<IntentBounds>): ClassifyTurnRequest {
  exactObject(value, ['question', 'documentaryScope', 'conversationContext', 'publicCatalog', 'languagePolicy']);
  const question = intentText(value.question, bounds.question);
  const scope = exactObject(value.documentaryScope, ['mode', 'resourceNames']);
  if ((typeof scope.mode !== 'string' || !['global_public', 'selected_resources'].includes(scope.mode)) || value.languagePolicy !== 'follow-current-question-or-explicit-request') throw new Error('Invalid intent request');
  const resourceNames = strings(scope.resourceNames, bounds.catalogEntries, bounds.metadataText);
  if ((scope.mode === 'global_public') !== (resourceNames.length === 0)) throw new Error('Invalid intent scope');
  if (!Array.isArray(value.conversationContext) || !Array.isArray(value.publicCatalog) || value.publicCatalog.length > bounds.catalogEntries) throw new Error('Invalid intent request');
  const conversationContext = Array.from(value.conversationContext, (turn) => {
    exactObject(turn, ['role', 'text']);
    if (turn.role !== 'user' && turn.role !== 'assistant') throw new Error('Invalid intent role');
    return { role: turn.role, text: intentText(turn.text, bounds.historyBytes) };
  });
  const publicCatalog = Array.from(value.publicCatalog, (entry) => {
    exactObject(entry, ['topic', 'aliases', ...(Object.hasOwn(entry, 'description') ? ['description'] : [])]);
    return { topic: intentText(entry.topic, bounds.metadataText), aliases: strings(entry.aliases, bounds.aliases, bounds.metadataText),
      ...(entry.description === undefined ? {} : { description: intentText(entry.description, bounds.metadataText) }) };
  });
  const request: ClassifyTurnRequest = { question, documentaryScope: { mode: scope.mode as ClassifyTurnRequest['documentaryScope']['mode'], resourceNames }, conversationContext, publicCatalog, languagePolicy: value.languagePolicy };
  if (intentBytes(conversationContext) > bounds.historyBytes || intentBytes(publicCatalog) > bounds.catalogBytes || intentBytes(request) > bounds.requestBytes) throw new Error('Intent request exceeds bounds');
  return request;
}
export function validateClassifyTurnResult(value: unknown, bounds: Readonly<IntentBounds> = DEFAULT_INTENT_BOUNDS, forbidden: readonly RegExp[] = DEFAULT_INTENT_FORBIDDEN): ClassifyTurnResult {
  if (!value || typeof value !== 'object' || !('decision' in value)) throw new Error('Invalid intent result');
  const decision = value.decision as Decision;
  if (typeof decision !== 'string' || !Object.hasOwn(INTENT_REASONS, decision)) throw new Error('Invalid intent decision');
  const fields = decision === 'answer' || decision === 'redirect' ? ['professionalTopic', 'resolvedQuestion', 'searchTerms'] : [decision === 'refuse' ? 'refusalMessage' : 'clarificationQuestion'];
  const result = exactObject(value, ['decision', 'reasonCode', 'responseLanguage', ...fields]);
  if (!(INTENT_REASONS[decision] as readonly unknown[]).includes(result.reasonCode)) throw new Error('Invalid intent reason');
  const responseLanguage = resultLanguage(result.responseLanguage);
  const texts: string[] = [responseLanguage];
  let validated: ClassifyTurnResult;
  if (decision === 'answer' || decision === 'redirect') {
    const professionalTopic = intentText(result.professionalTopic, bounds.topic), resolvedQuestion = intentText(result.resolvedQuestion, bounds.resolvedQuestion);
    const searchTerms = strings(result.searchTerms, bounds.terms, bounds.term);
    if (!searchTerms.length || searchTerms.some((term) => !/^[\p{L}\p{N}\p{M}]+(?:[ '\u2019-][\p{L}\p{N}\p{M}]+)*$/u.test(term))) throw new Error('Invalid lexical terms');
    // The downstream FTS encoder quotes literal tokens; these are never raw syntax.
    const tokens = searchTerms.map((term) => term.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? []);
    if (tokens.some((term) => !term.length) || tokens.flat().length > 64 || tokens.flat().some((token) => token.length > 64)) throw new Error('Invalid lexical tokens');
    texts.push(professionalTopic, resolvedQuestion, ...searchTerms);
    validated = { decision, reasonCode: result.reasonCode, responseLanguage, professionalTopic, resolvedQuestion, searchTerms } as IntentContinuation;
  } else {
    const field = decision === 'refuse' ? 'refusalMessage' : 'clarificationQuestion';
    const text = intentText(result[field], bounds.directText); texts.push(text);
    validated = { decision, reasonCode: result.reasonCode, responseLanguage, [field]: text } as ClassifyTurnResult;
  }
  if (intentBytes(value) > bounds.outputBytes || texts.some((text) => forbidden.some((pattern) => new RegExp(pattern.source, pattern.flags).test(text)))) throw new Error('Invalid intent output');
  return validated;
}
export function directIntentDraft(result: Exclude<ClassifyTurnResult, IntentContinuation>): ResultDraft {
  return { status: result.decision === 'refuse' ? 'refused' : 'clarification', language: result.responseLanguage,
    blocks: [{ kind: result.decision === 'refuse' ? 'refusal' : 'clarification', text: result.decision === 'refuse' ? result.refusalMessage : result.clarificationQuestion, sourceIds: [] }] };
}
