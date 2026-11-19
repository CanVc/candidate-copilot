import { createWorker } from '../../src/worker/index.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import { ScriptedLLMProvider } from '../../src/adapters/llm/scripted.ts';
import { ScriptedAnswerGenerator } from '../../src/adapters/llm/scripted-answer.ts';
import { deterministicReceiver } from '../../src/adapters/llm/deterministic-accounting.ts';
import { jcs, normalizeCatalog } from '../../src/shared/public-catalog.ts';
import { answerGenerationBounds } from '../../src/shared/answer-generation.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET } from '../../src/shared/model-context-budget.ts';
import { EligibleEvidenceContinuation } from '../../src/application/generate-answer.ts';
import { ModelAwareIntentPreparation, ProfessionalIntentProcessor } from '../../src/application/professional-intent-processor.ts';
import { submitConversationQuestion } from '../../src/application/conversation-results.ts';
import type { AtomicFinalization } from '../../src/ports/ConversationStore.ts';
import type { PreparedModelCall } from '../../src/ports/ModelTokenAccounting.ts';

// Disposable test Worker only. The production composition remains unconfigured.
const prepared = new Map<string, AtomicFinalization>();
const classifications: PreparedModelCall[] = [], generations: PreparedModelCall[] = [];
let retrievals = 0, retrievalReads = 0, preparationReads = 0;
export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const path = new URL(request.url).pathname;
    const clock = { now: () => new Date(request.headers.get('X-Fixture-Now') ?? '2026-01-01T00:00:00Z') };
    const catalog = new D1ResourceCatalog(env.DB), store = new D1ConversationStore(env.DB, clock);
    const branch = request.headers.get('X-Fixture-Branch') ?? 'answer', language = request.headers.get('X-Fixture-Language') ?? 'en';
    const fault = request.headers.get('X-Fixture-Retrieval');
    const preparationFault = request.headers.get('X-Fixture-Preparation');
    const faultDatabase = (fault: string | null, preparation: boolean) => new Proxy(env.DB, { get(target, property) {
      if (property === 'batch') return async (statements: D1PreparedStatement[]) => {
        if (preparation) preparationReads++; else retrievalReads++;
        if (fault === 'dependency') return target.batch([...statements, target.prepare('SELECT * FROM nonexistent_generation_fixture')]);
        if (fault === 'publication') await target.prepare('DELETE FROM active_publication').run();
        if (fault === 'authority-corrupt') await target.prepare("UPDATE active_publication SET catalog_hash = 'corrupt'").run();
        if (fault === 'chunk-corrupt') await target.prepare("UPDATE public_chunks SET chunk_json = '{}' WHERE document_id = 'doc'").run();
        if (fault === 'registry-corrupt') await target.prepare("UPDATE public_documents SET chunk_count = chunk_count + 1 WHERE document_id = 'doc'").run();
        if (fault === 'member') {
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
        return target.batch(statements);
      };
      const value = Reflect.get(target, property);
      return typeof value === 'function' ? value.bind(target) : value;
    } });
    const retrievalDb = faultDatabase(fault, false);
    const preparationCatalog = new D1ResourceCatalog(faultDatabase(preparationFault, true));
    const processor = () => {
      const classifier = new ScriptedLLMProvider((prompt) => {
        classifications.push(prompt as PreparedModelCall);
        if (branch === 'clarify') return { decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: language, clarificationQuestion: 'Which architecture decision?' };
        if (branch === 'refuse') return { decision: 'refuse', reasonCode: 'sensitive_personal', responseLanguage: language, refusalMessage: 'I cannot address personal topics.' };
        return { decision: ['redirect', 'redirect-empty', 'redirect-unsourced', 'redirect-limitation'].includes(branch) ? 'redirect' : 'answer',
          reasonCode: ['redirect', 'redirect-empty', 'redirect-unsourced', 'redirect-limitation'].includes(branch) ? request.headers.get('X-Fixture-Reason') ?? 'professional_value_judgment' : 'professional_question', responseLanguage: language,
          professionalTopic: 'Architecture', resolvedQuestion: 'Which architecture decisions are documented?', searchTerms: ['empty', 'redirect-empty'].includes(branch) ? ['unfindableword'] : ['architecture'] };
      });
      const receiver = deterministicReceiver('scalar-v1', { capacity: 50000, budget: { ...DEFAULT_MODEL_CONTEXT_BUDGET,
        components: { ...DEFAULT_MODEL_CONTEXT_BUDGET.components, history: Number(request.headers.get('X-Fixture-History') ?? 3000),
          evidence: Number(request.headers.get('X-Fixture-Evidence') ?? 12000) } } });
      const generator = new ScriptedAnswerGenerator((prompt) => {
        generations.push(prompt as PreparedModelCall);
        if (branch === 'throw') throw new Error('RAW_GENERATOR_DIAGNOSTICS');
        const data = JSON.parse(prompt.data), id = data.sourceChunks[0].responseLocalId;
        if (branch === 'multi') return { status: 'answered', outputLanguage: language, blocks: [
          { kind: 'paragraph', text: 'Plusieurs passages fictifs, sans attribution à BC.', sourceIds: data.sourceChunks.map((s: { responseLocalId: string }) => s.responseLocalId).reverse() },
          { kind: 'summary', text: 'Uniquement des exemples fictifs, pas le travail de BC.', sourceIds: data.sourceChunks.map((s: { responseLocalId: string }) => s.responseLocalId) },
        ] };
        if (['limitation-only', 'refusal-only', 'redirect-limitation'].includes(branch)) return {
          status: branch === 'refusal-only' ? 'refused' : 'partial', outputLanguage: language, blocks: [
            ...(branch !== 'limitation-only' ? [{ kind: 'refusal', text: 'I cannot make a value judgment about BC.', sourceIds: [] }] : []),
            ...(branch !== 'refusal-only' ? [{ kind: 'limitation', text: 'The retrieved evidence does not support further detail.', sourceIds: [] }] : []),
          ],
        };
        if (branch === 'failed') return { status: 'failed', outputLanguage: language, blocks: [{ kind: 'error', text: 'MODEL_FAILURE_EXPLANATION', sourceIds: [] }] };
        if (branch === 'redirect-unsourced') return { status: 'partial', outputLanguage: language, blocks: [{ kind: 'limitation', text: 'Insufficient evidence.', sourceIds: [] }] };
        return { status: branch === 'partial' ? 'partial' : 'answered', outputLanguage: branch === 'language-conflict' ? 'fr' : language,
          ...(branch === 'reset' ? { contextReset: true } : {}), blocks: [
            ...(data.scopeDecision === 'redirect' ? [{ kind: 'refusal', text: 'No value judgment or hiring recommendation about BC.', sourceIds: [] }] : []),
            { kind: 'paragraph', text: branch === 'pattern' ? 'PRIVATE_SENTINEL' : language === 'fr' ? 'Un exemple fictif d’architecture, pas le travail de BC.' : language === 'de-CH' ? 'Ein fiktives Architekturbeispiel, nicht die Arbeit von BC.' : 'This is a fictional architecture example, not BC’s work.', sourceIds: [branch === 'citation' ? 'S99' : id] },
            { kind: 'limitation', text: language === 'fr' ? 'Les éléments retrouvés ne permettent pas de donner davantage de détails.' : language === 'de-CH' ? 'Die gefundenen Belege stützen keine weiteren Einzelheiten.' : 'Further details are not supported by the retrieved evidence.', sourceIds: [] },
          ] };
      }, receiver);
      const retriever = new D1Retriever(retrievalDb, { topK: 5, textBudget: Number(request.headers.get('X-Fixture-Text-Budget') ?? 12000) });
      return new ProfessionalIntentProcessor(classifier, new ModelAwareIntentPreparation(preparationCatalog, classifier), new EligibleEvidenceContinuation({
        retrieveForGeneration: async (input) => { retrievals++; return retriever.retrieveForGeneration(input); },
      }, generator, answerGenerationBounds({ sources: Number(request.headers.get('X-Fixture-Sources') ?? 100) })));
    };
    if (path === '/__fixture/stats') return Response.json({ classifications, generations, retrievals, retrievalReads, preparationReads });
    if (path === '/__fixture/prepare') {
      const body = await request.json() as { conversationId: string; input: unknown; gate: string };
      store.finalize = async (command) => { prepared.set(body.gate, command); throw new Error('Prepared only'); };
      try { await submitConversationQuestion(store, catalog, clock, processor(), body.conversationId, request.headers.get('Authorization') ?? undefined, body.input); }
      catch { return Response.json({ prepared: prepared.has(body.gate) }); }
    }
    if (path.startsWith('/__fixture/finalize/')) {
      try { return Response.json(await store.finalize(prepared.get(path.split('/').at(-1)!)!)); }
      catch { return Response.json({ error: 'result_unavailable' }); }
    }
    return createWorker(clock, () => '127.0.0.1', { limits: { maxMessages: 20 },
      ...(request.headers.has('X-Fixture-Disabled') ? {} : { processor }) }).fetch(request, env, context);
  },
};
