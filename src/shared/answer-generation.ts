import { exactObject, fullRevision, sourcePath } from './public-catalog.ts';
import { CANONICAL_RESULT_LIMITS, resultLanguage, type LoadedSource } from './conversation-result.ts';
import { DEFAULT_INTENT_FORBIDDEN, INTENT_REASONS, intentBytes, intentText, type ClassifyTurnRequest, type IntentContinuation } from './professional-intent.ts';
import type { RetrievedChunk } from './public-evidence.ts';

export interface GenerateAnswerRequest {
  question: string;
  resolvedQuestion: string;
  scopeDecision: IntentContinuation['decision'];
  reasonCode: IntentContinuation['reasonCode'];
  responseLanguage: string;
  conversationContext: ClassifyTurnRequest['conversationContext'];
  sourceChunks: Array<{ responseLocalId: string } & Pick<RetrievedChunk, 'documentId' | 'sourceTitle' | 'sectionTitle' | 'sourcePath' | 'location' | 'text'>>;
  answerPolicy: { mustCiteFactualBlocks: true; refuseOutOfScope: true; noPrivateKnowledge: true; noUnsupportedClaims: true };
}
export interface GenerateAnswerDraft {
  status: 'answered' | 'partial' | 'refused' | 'failed';
  outputLanguage: string;
  blocks: Array<{ kind: 'paragraph' | 'summary' | 'limitation' | 'refusal' | 'transition' | 'error'; text: string; sourceIds: string[] }>;
}
export interface AnswerGenerationBounds {
  question: number; historyBytes: number; sources: number; sourceText: number; metadataText: number;
  requestBytes: number; blocks: number; blockText: number; citations: number; outputBytes: number;
}
export const DEFAULT_ANSWER_GENERATION_BOUNDS: Readonly<AnswerGenerationBounds> = Object.freeze({
  question: 4000, historyBytes: 12000, sources: 100, sourceText: 100000, metadataText: 16000,
  requestBytes: 250000, blocks: 100, blockText: 16000, citations: 100, outputBytes: 64000,
});
export function answerGenerationBounds(overrides: Partial<AnswerGenerationBounds> = {}): Readonly<AnswerGenerationBounds> {
  const bounds = { ...DEFAULT_ANSWER_GENERATION_BOUNDS, ...overrides };
  if (Object.values(bounds).some((n) => !Number.isSafeInteger(n) || n < 1)) throw new Error('Invalid generation bounds');
  const hard = CANONICAL_RESULT_LIMITS;
  if (bounds.blocks > hard.blocks || bounds.sources > hard.excerpts || bounds.citations > hard.excerpts ||
      bounds.blockText > hard.text || bounds.metadataText > hard.text || bounds.sourceText > hard.excerptText ||
      bounds.outputBytes > hard.serializedContent) throw new Error('Generation bounds exceed canonical limits');
  // Even an empty excerpt pool must leave room for the canonical envelope/IDs.
  validateReconstructionCapacity([], bounds);
  return Object.freeze(bounds);
}
function array(value: unknown, maximum: number): unknown[] {
  if (!Array.isArray(value) || value.length > maximum || Object.keys(value).length !== value.length) throw new Error('Invalid generation array');
  // Array.from visits holes as undefined, so element validators reject them too.
  return Array.from(value);
}
function safeText(value: unknown, maximum: number, forbidden: readonly RegExp[]): string {
  const text = intentText(value, maximum);
  if (forbidden.some((p) => new RegExp(p.source, p.flags).test(text))) throw new Error('Unsafe generation surface');
  return text;
}
// Validate every retrieved candidate before selecting a bounded prompt pool.
export function copyEligibleSources(chunks: RetrievedChunk[], eligibleDocumentIds: readonly string[], forbidden: readonly RegExp[] = DEFAULT_INTENT_FORBIDDEN): LoadedSource[] {
  const seen = new Set<string>(), membership = new Set(eligibleDocumentIds);
  return array(chunks, Number.MAX_SAFE_INTEGER).map((value, index) => {
    const chunk = exactObject(value, ['chunkId', 'documentId', 'sourcePath', 'sourceRevision', 'contentHash', 'sourceTitle', 'sectionTitle', 'text', 'location', 'rank']);
    for (const key of ['chunkId', 'documentId', 'sourcePath', 'sourceRevision', 'contentHash', 'sourceTitle', 'location']) safeText(chunk[key], Number.MAX_SAFE_INTEGER, forbidden);
    safeText(chunk.text, Number.MAX_SAFE_INTEGER, forbidden);
    if (chunk.sectionTitle !== null) safeText(chunk.sectionTitle, Number.MAX_SAFE_INTEGER, forbidden);
    sourcePath(chunk.sourcePath); fullRevision(chunk.sourceRevision);
    if (!membership.has(chunk.documentId as string) || seen.has(chunk.chunkId as string) || !/^[0-9a-f]{64}$/.test(String(chunk.contentHash)) ||
      typeof chunk.rank !== 'number' || !Number.isFinite(chunk.rank)) throw new Error('Invalid eligible evidence');
    seen.add(chunk.chunkId as string);
    return { responseLocalId: `S${index + 1}`, chunk: structuredClone(chunk) as unknown as RetrievedChunk };
  });
}
export function validateGenerateAnswerRequest(value: GenerateAnswerRequest, bounds: Readonly<AnswerGenerationBounds>): GenerateAnswerRequest {
  exactObject(value, ['question', 'resolvedQuestion', 'scopeDecision', 'reasonCode', 'responseLanguage', 'conversationContext', 'sourceChunks', 'answerPolicy']);
  intentText(value.question, bounds.question); intentText(value.resolvedQuestion, bounds.question);
  if (!['answer', 'redirect'].includes(value.scopeDecision) || !(INTENT_REASONS[value.scopeDecision] as readonly string[]).includes(value.reasonCode)) throw new Error('Invalid generation handoff');
  resultLanguage(value.responseLanguage);
  exactObject(value.answerPolicy, ['mustCiteFactualBlocks', 'refuseOutOfScope', 'noPrivateKnowledge', 'noUnsupportedClaims']);
  if (Object.values(value.answerPolicy).some((v) => v !== true)) throw new Error('Invalid generation policy');
  array(value.conversationContext, bounds.historyBytes).forEach((turn) => {
    const entry = exactObject(turn, ['role', 'text']);
    if (entry.role !== 'user' && entry.role !== 'assistant') throw new Error('Invalid history');
    intentText(entry.text, bounds.historyBytes);
  });
  const ids = new Set<string>();
  array(value.sourceChunks, bounds.sources).forEach((source) => {
    const entry = exactObject(source, ['responseLocalId', 'documentId', 'sourceTitle', 'sectionTitle', 'sourcePath', 'location', 'text']);
    for (const key of ['responseLocalId', 'documentId', 'sourceTitle', 'sourcePath', 'location']) intentText(entry[key], bounds.metadataText);
    if (ids.has(entry.responseLocalId as string)) throw new Error('Duplicate source');
    ids.add(entry.responseLocalId as string);
    sourcePath(entry.sourcePath); intentText(entry.text, bounds.sourceText);
    if (entry.sectionTitle !== null) intentText(entry.sectionTitle, bounds.metadataText);
  });
  if (!ids.size || intentBytes(value.conversationContext) > bounds.historyBytes || intentBytes(value) > bounds.requestBytes) throw new Error('Generation request exceeds bounds');
  return structuredClone(value);
}
// Schema/policy errors are not context exhaustion and must never set reset provenance.
export function validateGenerateAnswerSchema(value: GenerateAnswerRequest): void {
  const unbounded = Object.fromEntries(Object.keys(DEFAULT_ANSWER_GENERATION_BOUNDS).map((key) => [key, Number.MAX_SAFE_INTEGER])) as unknown as AnswerGenerationBounds;
  validateGenerateAnswerRequest(value, unbounded);
}

// Reserve enough canonical serialized space for ANY accepted bounded draft plus
// all selected excerpts. UTF-8 output bytes upper-bound UTF-16 JSON length; each
// persisted block adds one UUID property. The fixed envelope is counted explicitly.
export function validateReconstructionCapacity(sources: LoadedSource[], bounds: Readonly<AnswerGenerationBounds>): void {
  if (sources.length > bounds.sources) throw new Error('Source pool exceeds bounds');
  const uuid = '0'.repeat(36);
  const excerpts = sources.map(({ responseLocalId, chunk }) => {
    for (const value of [responseLocalId, chunk.chunkId, chunk.documentId, chunk.sourceTitle, chunk.sourcePath, chunk.location, chunk.sourceRevision, chunk.contentHash]) intentText(value, bounds.metadataText);
    if (chunk.sectionTitle !== null) intentText(chunk.sectionTitle, bounds.metadataText);
    intentText(chunk.text, bounds.sourceText);
    return { sourceExcerptId: uuid, responseLocalId, documentId: chunk.documentId, sourceChunkId: chunk.chunkId,
      contentHash: chunk.contentHash, sourceTitle: chunk.sourceTitle, sectionTitle: chunk.sectionTitle, sourcePath: chunk.sourcePath,
      sourceRevision: chunk.sourceRevision, excerpt: chunk.text, location: chunk.location };
  });
  const envelope = JSON.stringify({ status: 'answered', language: 'x'.repeat(100), blocks: [], sourceExcerpts: excerpts }).length;
  const blockIdOverhead = JSON.stringify({ blockId: uuid }).length - 1;
  if (bounds.outputBytes + bounds.blocks * blockIdOverhead + envelope > CANONICAL_RESULT_LIMITS.serializedContent) throw new Error('Reconstructed result exceeds canonical capacity');
}
export function validateGenerateAnswerDraft(value: unknown, request: GenerateAnswerRequest, sources: LoadedSource[], eligibleDocumentIds: readonly string[],
  bounds: Readonly<AnswerGenerationBounds> = DEFAULT_ANSWER_GENERATION_BOUNDS, forbidden: readonly RegExp[] = DEFAULT_INTENT_FORBIDDEN): GenerateAnswerDraft {
  const draft = exactObject(value, ['status', 'outputLanguage', 'blocks']);
  if (typeof draft.status !== 'string' || !['answered', 'partial', 'refused', 'failed'].includes(draft.status) || intentBytes(value) > bounds.outputBytes) throw new Error('Invalid generation draft');
  const outputLanguage = resultLanguage(safeText(draft.outputLanguage, 100, forbidden));
  if (outputLanguage !== resultLanguage(request.responseLanguage)) throw new Error('Conflicting generation language');
  copyEligibleSources(sources.map((s) => s.chunk), eligibleDocumentIds, forbidden);
  validateReconstructionCapacity(sources, bounds);
  const ids = new Set(sources.map((s) => safeText(s.responseLocalId, bounds.metadataText, forbidden)));
  if (ids.size !== sources.length || request.sourceChunks.length !== sources.length || request.sourceChunks.some((s) => !ids.has(s.responseLocalId))) throw new Error('Invalid source pool');
  const blocks = array(draft.blocks, bounds.blocks).map((value) => {
    const block = exactObject(value, ['kind', 'text', 'sourceIds']);
    if (typeof block.kind !== 'string' || !['paragraph', 'summary', 'limitation', 'refusal', 'transition', 'error'].includes(block.kind)) throw new Error('Invalid block kind');
    const text = safeText(block.text, bounds.blockText, forbidden);
    const sourceIds = array(block.sourceIds, bounds.citations).map((id) => {
      if (typeof id !== 'string' || !ids.has(id)) throw new Error('Unknown generation citation');
      return safeText(id, bounds.metadataText, forbidden);
    });
    if (new Set(sourceIds).size !== sourceIds.length || (['paragraph', 'summary'].includes(String(block.kind)) && !sourceIds.length)) throw new Error('Invalid generation citations');
    return { kind: block.kind as GenerateAnswerDraft['blocks'][number]['kind'], text, sourceIds };
  });
  if (!blocks.length || (draft.status === 'failed' ? blocks.some((b) => b.kind !== 'error' || b.sourceIds.length) : blocks.some((b) => b.kind === 'error')) ||
    (request.scopeDecision === 'redirect' && draft.status !== 'failed' && !blocks.some((b) => b.kind === 'refusal'))) throw new Error('Invalid generation structure');
  return { status: draft.status as GenerateAnswerDraft['status'], outputLanguage, blocks };
}
export function answerTemplateLanguage(current?: string, previous?: string): 'en' | 'fr' {
  for (const candidate of [current, previous]) {
    try { const base = resultLanguage(candidate).split('-')[0]; if (base === 'en' || base === 'fr') return base; } catch { /* Unsupported declaration uses the trusted fallback. */ }
  }
  return 'fr';
}
