import { jcs, normalizeCatalog } from '../../src/shared/public-catalog.ts';
import { deterministicReceiver } from '../../src/adapters/llm/deterministic-accounting.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET } from '../../src/shared/model-context-budget.ts';
import { createWorker } from '../../src/worker/index.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import { ScriptedLLMProvider } from '../../src/adapters/llm/scripted.ts';
import { ModelAwareIntentPreparation, ProfessionalIntentProcessor } from '../../src/application/professional-intent-processor.ts';
import { submitConversationQuestion } from '../../src/application/conversation-results.ts';
import { retrieveEvidence } from '../../src/application/retrieve-evidence.ts';
import type { AtomicFinalization } from '../../src/ports/ConversationStore.ts';
import type { ClassificationPrompt } from '../../src/ports/LLMProvider.ts';
import { validateConversationResult } from '../../src/shared/conversation-result.ts';
import { intentBounds } from '../../src/shared/professional-intent.ts';
import type { IntentContinuation } from '../../src/shared/professional-intent.ts';

export function createIntentFixture(maxMessages = 5, contextBudgets = false) {
// Disposable controls only; no fixture route/header exists in the public Worker.
const prepared = new Map<string, AtomicFinalization>();
const prompts: ClassificationPrompt[] = [], continuations: Array<{ classification: IntentContinuation; eligibleDocumentIds: string[] }> = [];
let retrievals = 0, preparationReads = 0;
return {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const path = new URL(request.url).pathname;
    const clock = { now: () => new Date(request.headers.get('X-Fixture-Now') ?? '2026-01-01T00:00:00Z') };
    const catalog = new D1ResourceCatalog(env.DB), store = new D1ConversationStore(env.DB, clock);
    const branch = request.headers.get('X-Fixture-Branch') ?? 'answer';
    const language = request.headers.get('X-Fixture-Language') ?? 'en';
    const fault = request.headers.get('X-Fixture-Preparation');
    let readOnce = false;
    const preparationDb = new Proxy(env.DB, { get(target, property) {
      if (property === 'batch') return async (statements: D1PreparedStatement[]) => {
        preparationReads++;
        if (!readOnce) {
          readOnce = true;
          if (fault === 'dependency') return target.batch([...statements, target.prepare('SELECT * FROM nonexistent_intent_fixture_table')]);
          if (fault === 'publication') await target.prepare('DELETE FROM active_publication').run();
          if (fault === 'member') {
            // Fixture withdrawal is a coherent atomic publication, not corruption.
            const before = await new D1ResourceCatalog(target).readSnapshot();
            if (!before || before.catalog.resources.length || before.chunks.some((chunk) => chunk.documentId === 'uncited')) throw new Error('Invalid withdrawal fixture');
            const next = normalizeCatalog({ ...before.catalog, documents: before.catalog.documents.filter((doc) => doc.documentId !== 'uncited') });
            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(jcs(next)));
            const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
            await target.batch([
              target.prepare("DELETE FROM public_resource_documents WHERE document_id = 'uncited'"),
              target.prepare("DELETE FROM public_documents WHERE document_id = 'uncited'"),
              target.prepare('UPDATE active_publication SET catalog_hash = ? WHERE id = 1').bind(hash),
            ]);
            const after = await new D1ResourceCatalog(target).readProcessingSnapshot();
            if (after.kind !== 'available' || after.publication.catalogHash !== hash || after.publication.documents.some((doc) => doc.documentId === 'uncited')) throw new Error('Incoherent withdrawal fixture');
          }
        }
        return target.batch(statements);
      };
      const value = Reflect.get(target, property);
      return typeof value === 'function' ? value.bind(target) : value;
    } });
    const bounds = intentBounds(request.headers.has('X-Fixture-Request-Bytes') ? { requestBytes: Number(request.headers.get('X-Fixture-Request-Bytes')) } : {});
    const receiver = deterministicReceiver(request.headers.get('X-Fixture-Profile') === 'scalar-v1' ? 'scalar-v1' : 'scalar-pair-v1', contextBudgets ? {
      capacity: Number(request.headers.get('X-Fixture-Capacity') ?? 32000),
      budget: { output: Number(request.headers.get('X-Fixture-Output') ?? 2000), components: { ...DEFAULT_MODEL_CONTEXT_BUDGET.components,
        history: Number(request.headers.get('X-Fixture-History') ?? 3000) } },
    } : {});
    const processor = () => { const provider = new ScriptedLLMProvider(async (prompt) => {
      prompts.push(prompt);
      if (branch === 'forged-reset') return { decision: 'clarify', reasonCode: 'missing_context', responseLanguage: language, clarificationQuestion: 'Which project?', contextReset: true };
      if (branch === 'throw') throw new Error('RAW_PROVIDER_SECRET');
      if (branch === 'array-decision') return { decision: ['clarify'], reasonCode: 'material_ambiguity', responseLanguage: language, clarificationQuestion: 'Which project?' };
      if (branch === 'invalid') return { decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: language, clarificationQuestion: 'Which project?', searchTerms: ['mixed'] };
      if (branch === 'refuse') return { decision: branch, reasonCode: 'sensitive_personal', responseLanguage: language,
        refusalMessage: 'I cannot address personal topics. Please ask about documented professional work.' };
      if (branch === 'clarify') return { decision: branch, reasonCode: 'material_ambiguity', responseLanguage: language,
        clarificationQuestion: 'De quelle décision professionnelle parlez-vous ?' };
      return { decision: ['tokens65', 'zero-token', 'structured-failure', 'invalid-draft'].includes(branch) ? 'answer' : branch, reasonCode: branch === 'redirect' ? 'professional_value_judgment' : 'professional_question', responseLanguage: language,
        professionalTopic: 'Architecture', resolvedQuestion: 'Which professional architecture decisions are documented?', searchTerms: branch === 'tokens65' ? [...Array.from({ length: 15 }, () => 'a b c d'), 'a b c d e'] : branch === 'zero-token' ? ['\u0301'] : ['architecture'] };
    }, receiver); return new ProfessionalIntentProcessor(provider, new ModelAwareIntentPreparation(new D1ResourceCatalog(preparationDb), provider, bounds), { continue: async (input) => {
      continuations.push({ classification: input.classification, eligibleDocumentIds: [...input.submittedScope.eligibleDocumentIds] });
      if (branch === 'structured-failure') return { failure: 'processing_unavailable' };
      if (branch === 'invalid-draft') return { draft: { language: 'fr', blocks: 'invalid' }, sources: [], language: 'fr' };
      retrievals++;
      const evidence = await retrieveEvidence(new D1Retriever(env.DB), { resolvedQuestion: input.classification.resolvedQuestion,
        searchTerms: input.classification.searchTerms, eligibleDocumentIds: [...input.submittedScope.eligibleDocumentIds] });
      const sources = evidence.chunks.map((chunk, index) => ({ responseLocalId: `S${index + 1}`, chunk }));
      return { draft: { status: 'partial', language: input.classification.responseLanguage, blocks: [
        ...(input.classification.decision === 'redirect' ? [{ kind: 'refusal', text: 'Synthetic boundary: no value judgment or hiring recommendation about BC.', sourceIds: [] }] : []),
        { kind: sources.length ? 'paragraph' : 'limitation', text: 'Synthetic development fixture, not evidence about BC.', sourceIds: sources.map((source) => source.responseLocalId) },
      ] }, sources };
    } }, bounds); };
    if (path === '/__fixture/stats') return Response.json({ prompts, continuations, retrievals, preparationReads });
    if (path === '/__fixture/prepare') {
      const body = await request.json() as { conversationId: string; input: unknown; gate: string };
      store.finalize = async (command) => { prepared.set(body.gate, command); throw new Error('Prepared only'); };
      try { await submitConversationQuestion(store, catalog, clock, processor(), body.conversationId, request.headers.get('Authorization') ?? undefined, body.input); }
      catch { return Response.json({ prepared: prepared.has(body.gate) }); }
    }
    if (path.startsWith('/__fixture/finalize/')) {
      const command = structuredClone(prepared.get(path.split('/').at(-1)!)!);
      // Disposable adapter-defense probes bypass service association validation,
      // but still require an otherwise valid canonical result.
      const resetFault = contextBudgets && request.headers.get('X-Fixture-Reset-Association');
      if (resetFault === 'template') command.result.blocks[0]!.text = 'Which professional project?';
      if (resetFault === 'language') command.result.language = command.result.language === 'en' ? 'fr' : 'en';
      validateConversationResult(command.result);
      try { return Response.json(await store.finalize(command)); }
      catch { return Response.json({ error: 'result_unavailable' }); }
    }
    return createWorker(clock, () => '127.0.0.1', { limits: { maxMessages },
      ...(request.headers.has('X-Fixture-Disabled') ? {} : { processor }) }).fetch(request, env, context);
  },
};

}
export default createIntentFixture();
