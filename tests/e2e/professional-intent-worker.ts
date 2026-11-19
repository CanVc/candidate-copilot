import { createWorker } from '../../src/worker/index.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import { ScriptedLLMProvider } from '../../src/adapters/llm/scripted.ts';
import { BoundedSimulationIntentPreparation, ProfessionalIntentProcessor } from '../../src/application/professional-intent-processor.ts';
import { submitConversationQuestion } from '../../src/application/conversation-results.ts';
import { retrieveEvidence } from '../../src/application/retrieve-evidence.ts';
import type { AtomicFinalization } from '../../src/ports/ConversationStore.ts';
import type { ClassificationPrompt } from '../../src/ports/LLMProvider.ts';
import { intentBounds } from '../../src/shared/professional-intent.ts';
import type { IntentContinuation } from '../../src/shared/professional-intent.ts';

// Disposable controls only; no fixture route/header exists in the public Worker.
const prepared = new Map<string, AtomicFinalization>();
const prompts: ClassificationPrompt[] = [], continuations: Array<{ classification: IntentContinuation; eligibleDocumentIds: string[] }> = [];
let retrievals = 0, preparationReads = 0;
export default {
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
          if (fault === 'member') await target.prepare("DELETE FROM public_documents WHERE document_id = 'uncited'").run();
        }
        return target.batch(statements);
      };
      const value = Reflect.get(target, property);
      return typeof value === 'function' ? value.bind(target) : value;
    } });
    const bounds = intentBounds(request.headers.has('X-Fixture-Request-Bytes') ? { requestBytes: Number(request.headers.get('X-Fixture-Request-Bytes')) } : {});
    const processor = () => new ProfessionalIntentProcessor(new ScriptedLLMProvider(async (prompt) => {
      prompts.push(prompt);
      if (branch === 'throw') throw new Error('RAW_PROVIDER_SECRET');
      if (branch === 'array-decision') return { decision: ['clarify'], reasonCode: 'material_ambiguity', responseLanguage: language, clarificationQuestion: 'Which project?' };
      if (branch === 'invalid') return { decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: language, clarificationQuestion: 'Which project?', searchTerms: ['mixed'] };
      if (branch === 'refuse') return { decision: branch, reasonCode: 'sensitive_personal', responseLanguage: language,
        refusalMessage: 'I cannot address personal topics. Please ask about documented professional work.' };
      if (branch === 'clarify') return { decision: branch, reasonCode: 'material_ambiguity', responseLanguage: language,
        clarificationQuestion: 'De quelle décision professionnelle parlez-vous ?' };
      return { decision: ['tokens65', 'zero-token', 'structured-failure', 'invalid-draft'].includes(branch) ? 'answer' : branch, reasonCode: branch === 'redirect' ? 'professional_value_judgment' : 'professional_question', responseLanguage: language,
        professionalTopic: 'Architecture', resolvedQuestion: 'Which professional architecture decisions are documented?', searchTerms: branch === 'tokens65' ? [...Array.from({ length: 15 }, () => 'a b c d'), 'a b c d e'] : branch === 'zero-token' ? ['\u0301'] : ['architecture'] };
    }), new BoundedSimulationIntentPreparation(new D1ResourceCatalog(preparationDb), bounds), { continue: async (input) => {
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
    } }, bounds);
    if (path === '/__fixture/stats') return Response.json({ prompts, continuations, retrievals, preparationReads });
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
    return createWorker(clock, () => '127.0.0.1', { limits: { maxMessages: 5 },
      ...(request.headers.has('X-Fixture-Disabled') ? {} : { processor }) }).fetch(request, env, context);
  },
};
