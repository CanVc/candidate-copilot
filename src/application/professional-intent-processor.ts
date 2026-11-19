import type { ConversationProcessor, ConversationProcessingContext } from '../ports/ConversationProcessor.ts';
import type { LLMProvider } from '../ports/LLMProvider.ts';
import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import type { AdmittedMessage, SubmittedScope } from '../shared/conversation-admission.ts';
import { resultLanguage } from '../shared/conversation-result.ts';
import { DEFAULT_INTENT_FORBIDDEN, directIntentDraft, intentBounds, intentBytes, intentText, validateClassifyTurnRequest,
  type ClassifyTurnRequest, type IntentBounds, type IntentContinuation } from '../shared/professional-intent.ts';
import { classifyProfessionalIntent } from './classify-professional-intent.ts';

export type PreparedIntent = { kind: 'ready'; request: ClassifyTurnRequest }
  | { kind: 'missing_context' } | { kind: 'scope_unavailable' } | { kind: 'processing_unavailable' };
export interface IntentPreparation {
  prepare(message: AdmittedMessage, context: ConversationProcessingContext): Promise<PreparedIntent>;
}
export interface ProfessionalIntentContinuation {
  continue(input: {
    question: string;
    classification: IntentContinuation;
    submittedScope: Readonly<SubmittedScope>;
    conversationContext: ClassifyTurnRequest['conversationContext'];
    signal?: AbortSignal;
  }): ReturnType<ConversationProcessor['process']>;
}

// Conservative local simulation only. Complete recent exchanges, JSON UTF-8 byte
// bounds, and no excerpt attachments. Real receiving-model accounting is 2.10.
export class BoundedSimulationIntentPreparation implements IntentPreparation {
  constructor(private readonly catalog: ResourceCatalog, private readonly bounds: Readonly<IntentBounds> = intentBounds()) {}
  async prepare(message: AdmittedMessage, context: ConversationProcessingContext): Promise<PreparedIntent> {
    const request: ClassifyTurnRequest = { question: message.question,
      documentaryScope: { mode: message.submittedScope.mode, resourceNames: [] },
      conversationContext: [], publicCatalog: [], languagePolicy: 'follow-current-question-or-explicit-request' };
    // Reserve the immutable base before optional metadata. Unrepresentable input
    // is missing interpretation context, not malformed model output.
    try { validateClassifyTurnRequest(request, this.bounds); }
    catch { return { kind: 'missing_context' }; }
    if (!context.contextAvailable) return { kind: 'missing_context' };
    for (let i = context.precedingMessages.length - 1; i >= 0; i--) {
      const turn = context.precedingMessages[i]!;
      let exchange: ClassifyTurnRequest['conversationContext'];
      try {
        if (!turn.result) throw new Error('Incomplete exchange');
        exchange = [
          { role: 'user', text: intentText(turn.question, this.bounds.historyBytes) },
          { role: 'assistant', text: intentText(turn.result.blocks.map((block) => block.text).join('\n'), this.bounds.historyBytes) },
        ];
        validateClassifyTurnRequest({ ...request, conversationContext: [...exchange, ...request.conversationContext] }, this.bounds);
      } catch {
        if (!request.conversationContext.length) return { kind: 'missing_context' };
        break; // A usable recent exchange lets a clean clarification reply recover.
      }
      request.conversationContext.unshift(...exchange);
    }
    let publication;
    try {
      if (this.catalog.readProcessingSnapshot) {
        const read = await this.catalog.readProcessingSnapshot();
        if (read.kind === 'dependency_failure') return { kind: 'processing_unavailable' };
        publication = read.kind === 'available' ? read.publication : null;
      } else publication = await this.catalog.readSnapshot();
    } catch { return { kind: 'processing_unavailable' }; }
    const scope = message.submittedScope, eligible = new Set(scope.eligibleDocumentIds);
    if (!publication || !eligible.size || [...eligible].some((id) => !publication.catalog.documents.some((doc) => doc.documentId === id))) return { kind: 'scope_unavailable' };
    const usable = (text: unknown): text is string => {
      try { intentText(text, this.bounds.metadataText); return true; } catch { return false; }
    };
    const fits = (entry: ClassifyTurnRequest['publicCatalog'][number], replaceLast = false) => {
      const entries = replaceLast ? request.publicCatalog.slice(0, -1) : request.publicCatalog;
      return entries.length < this.bounds.catalogEntries && intentBytes([...entries, entry]) <= this.bounds.catalogBytes &&
        intentBytes({ ...request, publicCatalog: [...entries, entry] }) <= this.bounds.requestBytes;
    };
    const add = (topic: unknown, aliases: unknown = [], description?: unknown) => {
      if (!usable(topic)) return;
      let entry: ClassifyTurnRequest['publicCatalog'][number] = { topic, aliases: [] };
      if (!fits(entry)) return;
      request.publicCatalog.push(entry);
      // Optional metadata never vetoes a usable title or changes eligibility.
      for (const alias of Array.isArray(aliases) ? aliases : []) {
        if (!usable(alias) || entry.aliases.length >= this.bounds.aliases) continue;
        const candidate = { ...entry, aliases: [...entry.aliases, alias] };
        if (fits(candidate, true)) entry = candidate;
      }
      if (usable(description)) {
        const candidate = { ...entry, description };
        if (fits(candidate, true)) entry = candidate;
      }
      request.publicCatalog[request.publicCatalog.length - 1] = entry;
    };
    const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
    for (const doc of [...publication.documents].sort((a, b) => compare(a.documentId, b.documentId))) {
      if (!eligible.has(doc.documentId)) continue;
      add(doc.sourceTitle, doc.metadata.aliases);
      for (const topic of doc.metadata.topics ?? []) add(topic);
    }
    for (const resource of [...publication.catalog.resources].sort((a, b) => compare(a.resourceId, b.resourceId))) {
      if (resource.documentIds.length && resource.documentIds.every((id) => eligible.has(id))) add(resource.name, [], resource.description);
    }
    return { kind: 'ready', request: validateClassifyTurnRequest(request, this.bounds) };
  }
}

function clarificationLanguage(context: ConversationProcessingContext): 'en' | 'fr' {
  const previous = [...context.precedingMessages].reverse().find((message) => message.result)?.result?.language;
  try { return resultLanguage(previous).split('-')[0] === 'en' ? 'en' : 'fr'; } catch { return 'fr'; }
}
export class ProfessionalIntentProcessor implements ConversationProcessor {
  constructor(private readonly provider: LLMProvider, private readonly preparation: IntentPreparation,
    private readonly continuation: ProfessionalIntentContinuation, private readonly bounds: Readonly<IntentBounds> = intentBounds(),
    private readonly forbidden: readonly RegExp[] = DEFAULT_INTENT_FORBIDDEN) {}
  async process(message: AdmittedMessage, context: ConversationProcessingContext): ReturnType<ConversationProcessor['process']> {
    if (context.signal?.aborted) return { failure: 'processing_unavailable' };
    let prepared: PreparedIntent;
    try { prepared = await this.preparation.prepare(message, context); }
    catch { return { failure: 'invalid_result' }; }
    if (context.signal?.aborted) return { failure: 'processing_unavailable' };
    if (prepared.kind === 'scope_unavailable' || prepared.kind === 'processing_unavailable') return { failure: prepared.kind };
    if (prepared.kind === 'missing_context') {
      const language = clarificationLanguage(context);
      return { draft: directIntentDraft({ decision: 'clarify', reasonCode: 'missing_context', responseLanguage: language,
        clarificationQuestion: language === 'en' ? 'Could you restate the professional question with the necessary context?' : 'Pouvez-vous reformuler la question professionnelle avec le contexte nécessaire ?' }), sources: [] };
    }
    const options = context.signal ? { signal: context.signal } : {};
    const outcome = await classifyProfessionalIntent(this.provider, prepared.request, this.bounds, this.forbidden, options);
    if (outcome.kind === 'failure') return { failure: outcome.failure };
    if (outcome.kind === 'direct') return { draft: outcome.draft, sources: [] };
    // Separate copies ensure no downstream adapter can alter admitted authority.
    const submittedScope = structuredClone(message.submittedScope);
    Object.freeze(submittedScope.eligibleDocumentIds); Object.freeze(submittedScope.resources); Object.freeze(submittedScope);
    try {
      const output = await this.continuation.continue({ question: message.question, classification: outcome.classification,
        submittedScope, conversationContext: prepared.request.conversationContext, ...options });
      if (context.signal?.aborted) return { failure: 'processing_unavailable', language: outcome.classification.responseLanguage };
      return 'failure' in output && output.language !== undefined
        ? output : { ...output, language: outcome.classification.responseLanguage };
    } catch { return { failure: 'processing_unavailable', language: outcome.classification.responseLanguage }; }
  }
}
