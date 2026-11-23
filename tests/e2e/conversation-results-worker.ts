import { createWorker } from '../../src/worker/index.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { SyntheticConversationProcessor } from '../../src/adapters/simulated/conversation-processor.ts';
import { submitConversationQuestion } from '../../src/application/conversation-results.ts';
import { admitConversationQuestion } from '../../src/application/conversation-admission.ts';
import type { AtomicFinalization, AtomicAdmission } from '../../src/ports/ConversationStore.ts';
import { AdmissionRejected } from '../../src/shared/conversation-admission.ts';
import { ConversationUnavailable } from '../../src/shared/conversation.ts';
import { authenticateConversation, CONVERSATION_RETENTION_MS } from '../../src/application/conversations.ts';
import { completeResult } from '../../src/shared/conversation-result.ts';
import type { AnswerStatus } from '../../src/shared/conversation-result.ts';

// Disposable-only controls. No test routes/headers are installed by createWorker.
const finalizations = new Map<string, AtomicFinalization>();
const publicationRaces = new Map<string, Array<{ sql: string; bindings: string[] }>>();
const admissions = new Map<string, AtomicAdmission>();
let calls = 0;
export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const path = new URL(request.url).pathname;
    const clock = { now: () => new Date(request.headers.get('X-Fixture-Now') ?? '2026-01-01T00:00:00.000Z') };
    const status = (request.headers.get('X-Fixture-Status') ?? 'answered') as AnswerStatus;
    const language = request.headers.get('X-Fixture-Language') === 'en' ? 'en' : 'fr';
    const catalog = new D1ResourceCatalog(env.DB), store = new D1ConversationStore(env.DB, clock);
    const processor = () => {
      const synthetic = new SyntheticConversationProcessor(catalog, ['cited-refused', 'nul-text'].includes(String(status)) ? 'answered' : status, language);
      return { process: async (message: Parameters<typeof synthetic.process>[0]) => { calls++; if (String(status) === 'throw') throw new Error('Synthetic raw dependency failure'); const output = await synthetic.process(message);
        if ('draft' in output) {
          const draft = output.draft as import('../../src/shared/conversation-result.ts').ResultDraft;
          if (request.headers.get('X-Fixture-Language') === 'de') draft.language = 'de';
          if (String(status) === 'nul-text') draft.blocks[0]!.text = '\0Synthetic fixture';
        }
        if (request.headers.has('X-Fixture-Distinct-Blocks') && 'draft' in output) {
          const draft = output.draft as import('../../src/shared/conversation-result.ts').ResultDraft;
          draft.blocks.forEach((block, i) => { block.kind = i ? 'summary' : 'paragraph'; block.sourceIds = i ? ['S1', 'S2'] : ['S2', 'S1']; block.text = `  Synthetic block ${i + 1}, not BC: épreuve 😀\r\nline é\t  `; });
        }
        if (String(status) === 'cited-refused' && 'draft' in output) {
          const draft = output.draft as import('../../src/shared/conversation-result.ts').ResultDraft;
          draft.status = 'refused'; draft.blocks.unshift({ kind: 'refusal', text: 'Synthetic refusal, not BC.', sourceIds: [] });
        }
        return output; } };
    };
    try {
      if (path === '/__fixture/publication-race') {
        const { gate, statements } = await request.json() as { gate: string; statements: Array<{ sql: string; bindings: string[] }> };
        publicationRaces.set(gate, statements); return Response.json({ prepared: true });
      }
      if (path === '/__fixture/prepare-existing') {
        const { conversationId, body, gate } = await request.json() as { conversationId: string; body: { requestId: string }; gate: string };
        const sessionTokenHash = await authenticateConversation(store, clock, conversationId, request.headers.get('Authorization') ?? undefined);
        const state = await store.readAdmissionState(conversationId, sessionTokenHash, new Date(clock.now().getTime() - CONVERSATION_RETENTION_MS).toISOString());
        const message = state!.messages.find((m) => m.requestId === body.requestId)!;
        const output = await processor().process(message);
        if (!('draft' in output)) throw new Error('Expected synthetic draft');
        finalizations.set(gate, { conversationId, sessionTokenHash, requestId: message.requestId, attemptId: state!.lease!.attemptId,
          result: completeResult(message, output.draft, output.sources) });
        return Response.json({ prepared: true });
      }
      if (path === '/__fixture/calls') return Response.json({ calls });
      if (path === '/__fixture/prepare' || path === '/__fixture/admit') {
        const { conversationId, body, gate, action = 'submit' } = await request.json() as { conversationId: string; body: unknown; gate?: string; action?: 'submit' | 'recover' };
        if (path === '/__fixture/prepare') {
          store.finalize = async (command) => {
            if (request.headers.has('X-Fixture-Controlled-Scope')) {
              const { controlledFailure } = await import('../../src/shared/conversation-result.ts');
              command.result = controlledFailure(command.result, 'scope_unavailable', 'en');
              command.result.error!.message = '  Historical synthetic scope failure, not BC: é 😀\n  ';
              command.result.blocks[0]!.text = command.result.error!.message;
            }
            finalizations.set(gate!, command); throw new Error('Prepared fixture'); };
          try { return Response.json(await submitConversationQuestion(store, catalog, clock, processor(), conversationId, request.headers.get('Authorization') ?? undefined, body)); }
          catch (error) { if (finalizations.has(gate!)) return Response.json({ prepared: true }); throw error; }
        }
        if (gate) store.admit = async (command) => { admissions.set(gate, command); throw new Error('Prepared admission'); };
        try { return Response.json(await admitConversationQuestion(store, catalog, clock, conversationId, request.headers.get('Authorization') ?? undefined, body, action)); }
        catch (error) { if (gate && admissions.has(gate)) return Response.json({ prepared: true }); throw error; }
      }
      if (path.startsWith('/__fixture/finalize/')) {
        return Response.json(await store.finalize(finalizations.get(path.split('/').at(-1)!)!));
      }
      if (path.startsWith('/__fixture/acquire/')) return Response.json(await store.admit(admissions.get(path.split('/').at(-1)!)!));
    } catch (error) {
      return Response.json({ error: error instanceof AdmissionRejected || error instanceof ConversationUnavailable ? error.code : 'result_unavailable' });
    }
    const race = publicationRaces.get(request.headers.get('X-Fixture-Admission-Race') ?? '');
    let admissionBatch = false;
    const database = race ? new Proxy(env.DB, { get(target, key) {
      if (key === 'prepare') return (sql: string) => { if (sql.includes(' AS recovering,')) admissionBatch = true; return target.prepare(sql); };
      if (key === 'batch') return async (statements: D1PreparedStatement[]) => {
        if (!admissionBatch) return target.batch(statements);
        admissionBatch = false;
        const activation = race.map(({ sql, bindings }) => target.prepare(sql).bind(...bindings));
        return (await target.batch([...activation, ...statements])).slice(activation.length);
      };
      const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value;
    } }) : env.DB;
    return createWorker(clock, () => '127.0.0.1', {
      limits: { maxMessages: 5, maxQuestionCharacters: 1000, leaseMilliseconds: 40_000 },
      // Synthetic availability control on this disposable test Worker only.
      availability: () => request.headers.has('X-Fixture-Outage') ? { confirmedUnavailable: true,
        ...(request.headers.get('X-Fixture-Outage') === 'timed' ? { resumeAt: Date.parse('2026-01-01T01:00:00Z') } : {}) } : null,
      ...(request.headers.has('X-Fixture-Disabled') ? {} : { processor }),
    }).fetch(request, { ...env, DB: database }, context);
  },
};
