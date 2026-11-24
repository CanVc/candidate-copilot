import type { AdmittedMessage, SubmittedScope } from './conversation-admission.ts';
import type { LineRange, RetrievedChunk } from './public-evidence.ts';
import { exactObject, fullRevision, publicString, sourcePath, stringSet, jcs, validUnicode } from './public-catalog.ts';

export type AnswerStatus = 'answered' | 'partial' | 'clarification' | 'refused' | 'failed';
export type BlockKind = 'paragraph' | 'summary' | 'limitation' | 'refusal' | 'transition' | 'clarification' | 'error';
export type ResultFailureCode = 'scope_unavailable' | 'invalid_result' | 'processing_unavailable';
export interface ResultError { code: ResultFailureCode; message: string; retryable: boolean; retryMode: 'none' | 'new_request' }
export interface AnswerBlock { blockId: string; kind: BlockKind; text: string; sourceIds: string[] }
export interface SourceExcerpt {
  sourceExcerptId: string;
  responseLocalId: string;
  documentId: string;
  sourceChunkId: string;
  contentHash: string;
  sourceTitle: string;
  sectionTitle: string | null;
  sourcePath: `content/public/${string}`;
  sourceRevision: string;
  excerpt: string;
  location: string;
}
// Other adapters may use opaque diagnostic locations. Only the publisher's
// lines: representation declares positive, inclusive, safe-integer ranges.
export function parseLineLocation(location: string): { primary: LineRange; context: LineRange[] } | null {
  if (!location.startsWith('lines:')) return null;
  const ranges: LineRange[] = [];
  for (const range of location.slice('lines:'.length).split(';context:')) {
    const match = /^([1-9]\d*)-([1-9]\d*)$/.exec(range);
    if (!match) return null;
    const start = Number(match[1]), end = Number(match[2]);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) return null;
    ranges.push({ start, end });
  }
  return { primary: ranges[0]!, context: ranges.slice(1) };
}
// A hash fixes the copied fields across publications. Conversely those fields fix
// the hash only at the same source revision, where the document also fixes the
// uncopied metadata. Chunk ordinals and per-answer citation IDs are not content.
export function excerptContentCheck() {
  const projectionByHash = new Map<string, string>(), hashByRevisionProjection = new Map<string, string>();
  const passageByLines = new Map<string, SourceExcerpt>();
  return (source: SourceExcerpt): boolean => {
    const projection = JSON.stringify([source.documentId, source.sourcePath, source.sourceTitle,
      source.sectionTitle, source.location, source.excerpt]);
    const key = `${source.sourceRevision}:${projection}`;
    const previous = projectionByHash.get(source.contentHash), hash = hashByRevisionProjection.get(key);
    if ((previous !== undefined && previous !== projection) || (hash !== undefined && hash !== source.contentHash)) return false;
    if (source.location.startsWith('lines:')) {
      const lines = JSON.stringify([source.sourceRevision, source.documentId, source.location]);
      const passage = passageByLines.get(lines);
      if (passage && (passage.sectionTitle !== source.sectionTitle || passage.excerpt !== source.excerpt)) return false;
      passageByLines.set(lines, source);
    }
    projectionByHash.set(source.contentHash, projection); hashByRevisionProjection.set(key, source.contentHash);
    return true;
  };
}
export interface ConversationResult {
  requestId: string;
  messageId: string;
  answerId: string;
  status: AnswerStatus;
  language: string;
  submittedScope: SubmittedScope;
  blocks: AnswerBlock[];
  sourceExcerpts: SourceExcerpt[];
  error?: ResultError;
}
export interface ResultDraft {
  status: Exclude<AnswerStatus, 'failed'>;
  language: string;
  blocks: Array<Omit<AnswerBlock, 'blockId'>>;
}
export interface LoadedSource { responseLocalId: string; chunk: RetrievedChunk }
export const CANONICAL_RESULT_LIMITS = Object.freeze({ blocks: 100, excerpts: 100, text: 16000, excerptText: 100000, serializedContent: 500000 });
const statuses = ['answered', 'partial', 'clarification', 'refused', 'failed'];
const kinds = ['paragraph', 'summary', 'limitation', 'refusal', 'transition', 'clarification', 'error'];
const failureText = {
  scope_unavailable: { fr: 'Les documents de cette question ne sont plus disponibles.', en: 'The documents for this question are no longer available.' },
  invalid_result: { fr: 'Impossible de produire un résultat valide pour le moment.', en: 'A valid result could not be produced at this time.' },
  processing_unavailable: { fr: 'Le traitement est indisponible pour le moment.', en: 'Processing is currently unavailable.' },
};
function validFailureCode(code: unknown): code is ResultFailureCode {
  return typeof code === 'string' && Object.hasOwn(failureText, code);
}
function text(value: unknown, maximum: number = CANONICAL_RESULT_LIMITS.text): string {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0') || value.length > maximum || !validUnicode(value)) throw new Error('Invalid result');
  return value;
}
export function resultLanguage(value: unknown): string {
  const language = text(value, 100);
  const normalized = Intl.getCanonicalLocales(language)[0];
  if (!normalized) throw new Error('Invalid result language');
  return normalized;
}
export function factualResult(result: ConversationResult): boolean {
  return result.blocks.some((block) => block.kind === 'paragraph' || block.kind === 'summary') || result.sourceExcerpts.length > 0;
}
export function controlledFailure(message: Pick<AdmittedMessage, 'messageId' | 'requestId' | 'submittedScope'>, code: ResultFailureCode, language?: string, previousLanguage?: string): ConversationResult {
  if (!validFailureCode(code)) throw new Error('Invalid failure code');
  const supported = (value: string | undefined): 'en' | 'fr' | undefined => {
    try { const base = resultLanguage(value).split('-')[0]; return base === 'en' || base === 'fr' ? base : undefined; }
    catch { return undefined; }
  };
  const actualLanguage = supported(language) ?? supported(previousLanguage) ?? 'fr';
  const description = failureText[code][actualLanguage];
  const retryable = code !== 'scope_unavailable';
  return { requestId: message.requestId, messageId: message.messageId, answerId: crypto.randomUUID(),
    status: 'failed', language: actualLanguage, submittedScope: message.submittedScope,
    blocks: [{ blockId: crypto.randomUUID(), kind: 'error', text: description, sourceIds: [] }], sourceExcerpts: [],
    error: { code, message: description, retryable, retryMode: retryable ? 'new_request' : 'none' } };
}
// Only the server-loaded pool supplies historical text/provenance. Drafts cannot
// author excerpts, paths, IDs, failure policy or scope.
export function completeResult(message: AdmittedMessage, value: unknown, sources: LoadedSource[]): ConversationResult {
  const draft = exactObject(value, ['status', 'language', 'blocks']);
  if (!['answered', 'partial', 'clarification', 'refused'].includes(String(draft.status)) || !Array.isArray(draft.blocks)) throw new Error('Invalid result draft');
  const used = new Set<string>();
  const blocks = Array.from(draft.blocks, (value) => {
    const block = exactObject(value, ['kind', 'text', 'sourceIds']);
    if (!Array.isArray(block.sourceIds)) throw new Error('Invalid citations');
    const sourceIds = Array.from(block.sourceIds, (id) => { const sourceId = publicString(id); used.add(sourceId); return sourceId; });
    return { blockId: crypto.randomUUID(), kind: block.kind as BlockKind, text: text(block.text), sourceIds };
  });
  if (new Set(sources.map((s) => s.responseLocalId)).size !== sources.length) throw new Error('Duplicate loaded source');
  const sourceExcerpts = [...used].map((id) => {
    const chunk = sources.find((s) => s.responseLocalId === id)?.chunk;
    if (!chunk) throw new Error('Unknown citation');
    return { sourceExcerptId: crypto.randomUUID(), responseLocalId: id, documentId: chunk.documentId, sourceChunkId: chunk.chunkId,
      contentHash: chunk.contentHash, sourceTitle: chunk.sourceTitle, sectionTitle: chunk.sectionTitle, sourcePath: chunk.sourcePath,
      sourceRevision: chunk.sourceRevision, excerpt: chunk.text, location: chunk.location };
  });
  const result: ConversationResult = { requestId: message.requestId, messageId: message.messageId, answerId: crypto.randomUUID(),
    status: draft.status as AnswerStatus, language: resultLanguage(draft.language), submittedScope: message.submittedScope, blocks, sourceExcerpts };
  validateConversationResult(result);
  return result;
}
// Mechanical checks only: not entailment, factuality, actual language or privacy certification.
export function validateConversationResult(value: ConversationResult): void {
  exactObject(value, ['requestId', 'messageId', 'answerId', 'status', 'language', 'submittedScope', 'blocks', 'sourceExcerpts', ...(value.error ? ['error'] : [])]);
  const scope = value.submittedScope;
  exactObject(scope, ['version', 'mode', 'catalogRevision', 'catalogHash', 'resources', 'eligibleDocumentIds']);
  fullRevision(scope.catalogRevision);
  if (scope.version !== 1 || scope.mode !== 'global_public' || !Array.isArray(scope.resources) || scope.resources.length ||
      !/^[0-9a-f]{64}$/.test(scope.catalogHash) || !Array.isArray(scope.eligibleDocumentIds) || !scope.eligibleDocumentIds.length ||
      jcs(stringSet(scope.eligibleDocumentIds)) !== jcs(scope.eligibleDocumentIds)) throw new Error('Invalid result scope');
  for (const id of [value.requestId, value.messageId, value.answerId]) publicString(id);
  if (!statuses.includes(value.status) || resultLanguage(value.language) !== value.language ||
      !Array.isArray(value.blocks) || !value.blocks.length || value.blocks.length > CANONICAL_RESULT_LIMITS.blocks ||
      !Array.isArray(value.sourceExcerpts) || value.sourceExcerpts.length > CANONICAL_RESULT_LIMITS.excerpts || JSON.stringify({ status: value.status, language: value.language, blocks: value.blocks, sourceExcerpts: value.sourceExcerpts, error: value.error }).length > CANONICAL_RESULT_LIMITS.serializedContent) throw new Error('Invalid result');
  const sourceIds = new Set<string>();
  const excerptIds = new Set<string>(), chunkIds = new Set<string>();
  const filesByDocument = new Map<string, SourceExcerpt>(), documentsByPath = new Map<string, string>();
  const acceptContent = excerptContentCheck();
  for (const source of value.sourceExcerpts) {
    exactObject(source, ['sourceExcerptId', 'responseLocalId', 'documentId', 'sourceChunkId', 'contentHash', 'sourceTitle', 'sectionTitle', 'sourcePath', 'sourceRevision', 'excerpt', 'location']);
    for (const id of [source.sourceExcerptId, source.responseLocalId, source.documentId, source.sourceChunkId]) publicString(id);
    sourcePath(source.sourcePath); fullRevision(source.sourceRevision);
    if (source.sourceRevision !== value.sourceExcerpts[0]!.sourceRevision) throw new Error('Mixed source revisions');
    if (typeof source.contentHash !== 'string' || !/^[0-9a-f]{64}$/.test(source.contentHash) || !value.submittedScope.eligibleDocumentIds.includes(source.documentId) ||
        sourceIds.has(source.responseLocalId) || excerptIds.has(source.sourceExcerptId)) throw new Error('Invalid excerpt');
    text(source.excerpt, CANONICAL_RESULT_LIMITS.excerptText); text(source.sourceTitle); text(source.location);
    if (source.location.startsWith('lines:') && !parseLineLocation(source.location)) throw new Error('Invalid line location');
    if (source.sectionTitle !== null) text(source.sectionTitle);
    // A result snapshots each cited retrieval chunk once; blocks may share its citation.
    if (chunkIds.has(source.sourceChunkId)) throw new Error('Duplicate source chunk');
    const file = filesByDocument.get(source.documentId), owner = documentsByPath.get(source.sourcePath);
    if ((file && (file.sourcePath !== source.sourcePath || file.sourceTitle !== source.sourceTitle)) ||
        (owner !== undefined && owner !== source.documentId)) throw new Error('Inconsistent source file');
    if (!acceptContent(source)) throw new Error('Inconsistent content hash or line passage');
    chunkIds.add(source.sourceChunkId); filesByDocument.set(source.documentId, source); documentsByPath.set(source.sourcePath, source.documentId);
    sourceIds.add(source.responseLocalId); excerptIds.add(source.sourceExcerptId);
  }
  const blockIds = new Set<string>(), cited = new Set<string>();
  for (const block of value.blocks) {
    exactObject(block, ['blockId', 'kind', 'text', 'sourceIds']);
    publicString(block.blockId); text(block.text);
    if (blockIds.has(block.blockId) || !kinds.includes(block.kind) || !Array.isArray(block.sourceIds) ||
        new Set(block.sourceIds).size !== block.sourceIds.length || Array.from(block.sourceIds).some((id) => !sourceIds.has(id)) ||
        (['paragraph', 'summary'].includes(block.kind) && !block.sourceIds.length)) throw new Error('Invalid block');
    blockIds.add(block.blockId); block.sourceIds.forEach((id) => cited.add(id));
  }
  if (cited.size !== sourceIds.size) throw new Error('Uncited excerpt');
  if (value.status === 'failed') {
    const error = value.error;
    if (!error || !validFailureCode(error.code)) throw new Error('Invalid failure');
    exactObject(error, ['code', 'message', 'retryable', 'retryMode']);
    text(error.message);
    // Saved copy is authoritative; changing today's template must not invalidate
    // yesterday's canonical result or reconstruct its message/retry metadata.
    if (typeof error.retryable !== 'boolean' || error.retryMode !== (error.retryable ? 'new_request' : 'none') ||
        (error.code === 'scope_unavailable' && error.retryable) || value.blocks.length !== 1 || value.blocks[0]?.kind !== 'error' ||
        value.blocks[0].text !== error.message || value.sourceExcerpts.length || value.blocks[0].sourceIds.length) throw new Error('Invalid failure metadata');
  } else if (value.error || value.blocks.some((b) => b.kind === 'error')) throw new Error('Unexpected failure');
  if (value.status === 'clarification' && (value.blocks.some((b) => b.kind !== 'clarification') || value.sourceExcerpts.length)) throw new Error('Invalid clarification');
}
