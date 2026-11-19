import { GENERATION_CONTEXT_LIMIT } from './generate-answer.ts';
import { answerTemplateLanguage } from '../shared/answer-generation.ts';
import type { PreparedModelCall } from '../ports/ModelTokenAccounting.ts';
import { contextFallbackLanguage, selectConversationExchanges } from './conversation-context.ts';
import type { ConversationProcessor, ConversationProcessingContext } from '../ports/ConversationProcessor.ts';
import type { LLMProvider } from '../ports/LLMProvider.ts';
import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import type { AdmittedMessage, SubmittedScope } from '../shared/conversation-admission.ts';
import { CONTEXT_RESTATEMENT, DEFAULT_INTENT_FORBIDDEN, directIntentDraft, intentBounds, intentBytes, intentText, validateClassifyTurnRequest,
  type ClassifyTurnRequest, type IntentBounds, type IntentContinuation } from '../shared/professional-intent.ts';
import { classifyProfessionalIntent, prepareProfessionalIntent } from './classify-professional-intent.ts';

export type PreparedIntent = { kind: 'ready'; request: ClassifyTurnRequest; call?: PreparedModelCall }
  | { kind: 'missing_context'; contextReset?: true } | { kind: 'scope_unavailable' } | { kind: 'processing_unavailable' };
export interface IntentPreparation {
  prepare(message: AdmittedMessage, context: ConversationProcessingContext): Promise<PreparedIntent>;
}
export interface ProfessionalIntentContinuation {
  continue(input: {
    question: string;
    classification: IntentContinuation;
    submittedScope: Readonly<SubmittedScope>;
    conversationContext: ClassifyTurnRequest['conversationContext'];
    // Re-select for the continuation's receiver; canonical records never escape.
    selectConversationContext: (fits: (history: ClassifyTurnRequest['conversationContext']) => boolean) => ClassifyTurnRequest['conversationContext'] | null;
    fallbackLanguage?: 'en' | 'fr';
    signal?: AbortSignal;
  }): Promise<Awaited<ReturnType<ConversationProcessor['process']>> | typeof GENERATION_CONTEXT_LIMIT>;
}

// Shared runtime request/catalog assembly. Its default byte-only history selector
// remains for legacy 2.9 regressions; delivered composition overrides selection and
// acceptance with ModelAwareIntentPreparation, not byte-to-token accounting.
export class BoundedSimulationIntentPreparation implements IntentPreparation {
  constructor(private readonly catalog: ResourceCatalog, protected readonly bounds: Readonly<IntentBounds> = intentBounds()) {}
  protected accept(request: ClassifyTurnRequest): void { validateClassifyTurnRequest(request, this.bounds); }
  protected selectHistory(request: ClassifyTurnRequest, context: ConversationProcessingContext): ClassifyTurnRequest['conversationContext'] | null {
    if (!context.contextAvailable) return null;
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
        if (!request.conversationContext.length) return null;
        break; // A usable recent exchange lets a clean clarification reply recover.
      }
      request.conversationContext.unshift(...exchange);
    }
    return request.conversationContext;
  }
  async prepare(message: AdmittedMessage, context: ConversationProcessingContext): Promise<PreparedIntent> {
    const request: ClassifyTurnRequest = { question: message.question,
      documentaryScope: { mode: message.submittedScope.mode, resourceNames: [] },
      conversationContext: [], publicCatalog: [], languagePolicy: 'follow-current-question-or-explicit-request' };
    try { this.accept(request); } catch { return { kind: 'missing_context' }; }
    const history = this.selectHistory(request, context);
    if (history === null) return { kind: 'missing_context' };
    request.conversationContext = history;
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
      if (entries.length >= this.bounds.catalogEntries || intentBytes([...entries, entry]) > this.bounds.catalogBytes ||
        intentBytes({ ...request, publicCatalog: [...entries, entry] }) > this.bounds.requestBytes) return false;
      try { this.accept({ ...request, publicCatalog: [...entries, entry] }); return true; } catch { return false; }
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

export class ModelAwareIntentPreparation extends BoundedSimulationIntentPreparation {
  constructor(catalog: ResourceCatalog, private readonly provider: LLMProvider, bounds: Readonly<IntentBounds> = intentBounds()) { super(catalog, bounds); }
  protected override accept(request: ClassifyTurnRequest): void { prepareProfessionalIntent(this.provider.receiver, request, this.bounds); }
  protected override selectHistory(request: ClassifyTurnRequest, context: ConversationProcessingContext): ClassifyTurnRequest['conversationContext'] | null {
    return selectConversationExchanges(context, this.bounds.historyBytes, (conversationContext) => {
      try { this.accept({ ...request, conversationContext }); return true; } catch { return false; }
    });
  }
  override async prepare(message: AdmittedMessage, context: ConversationProcessingContext): Promise<PreparedIntent> {
    const prepared = await super.prepare(message, context);
    if (prepared.kind === 'missing_context') return { kind: 'missing_context', contextReset: true };
    if (prepared.kind !== 'ready') return prepared;
    try { return { ...prepared, call: prepareProfessionalIntent(this.provider.receiver, prepared.request, this.bounds) }; }
    catch { return { kind: 'missing_context', contextReset: true }; }
  }
}

function missingContext(context: ConversationProcessingContext, contextReset = false, currentLanguage?: string) {
  const language = answerTemplateLanguage(currentLanguage, contextFallbackLanguage(context));
  return { draft: directIntentDraft({ decision: 'clarify', reasonCode: 'missing_context', responseLanguage: language,
    clarificationQuestion: CONTEXT_RESTATEMENT[language] }),
    sources: [], ...(contextReset ? { contextReset: true as const } : {}) };
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
    if (prepared.kind === 'missing_context') return missingContext(context, prepared.contextReset);
    const options = context.signal ? { signal: context.signal } : {};
    const outcome = await classifyProfessionalIntent(this.provider, prepared.request, this.bounds, this.forbidden, options, prepared.call);
    if (outcome.kind === 'limit') return missingContext(context, true);
    if (outcome.kind === 'failure') return { failure: outcome.failure };
    if (outcome.kind === 'direct') return { draft: outcome.draft, sources: [] };
    // Separate copies ensure no downstream adapter can alter admitted authority.
    const submittedScope = structuredClone(message.submittedScope);
    Object.freeze(submittedScope.eligibleDocumentIds); Object.freeze(submittedScope.resources); Object.freeze(submittedScope);
    try {
      const output = await this.continuation.continue({ question: message.question, classification: outcome.classification,
        submittedScope, conversationContext: prepared.request.conversationContext, fallbackLanguage: contextFallbackLanguage(context),
        selectConversationContext: (fits) => selectConversationExchanges(context, this.bounds.historyBytes, fits), ...options });
      if (context.signal?.aborted) return { failure: 'processing_unavailable', language: outcome.classification.responseLanguage };
      if (output === GENERATION_CONTEXT_LIMIT) return missingContext(context, true, outcome.classification.responseLanguage);
      if ('draft' in output) {
        const { contextReset: _untrustedReset, ...ordinary } = output;
        return { ...ordinary, language: outcome.classification.responseLanguage };
      }
      return 'failure' in output && output.language !== undefined
        ? output : { ...output, language: outcome.classification.responseLanguage };
    } catch { return { failure: 'processing_unavailable', language: outcome.classification.responseLanguage }; }
  }
}
