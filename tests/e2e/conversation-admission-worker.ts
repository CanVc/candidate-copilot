import type { AtomicAdmission } from '../../src/ports/ConversationStore.ts';
import { admitConversationQuestion } from '../../src/application/conversation-admission.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { createWorker } from '../../src/worker/index.ts';
import { AdmissionRejected, type AdmissionLimits } from '../../src/shared/conversation-admission.ts';
import { ConversationUnavailable } from '../../src/shared/conversation.ts';

// Disposable-only service transport. This is deliberately not a public message
// endpoint: its acquisition payload includes internal ownership for assertions.
const gates = new Map<string, AtomicAdmission>();
export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const path = new URL(request.url).pathname;
    const time = { value: Date.parse(request.headers.get('X-Fixture-Now') ?? '2026-01-01T00:00:00.000Z') };
    const clock = { now: () => new Date(time.value) };
    if (path.startsWith('/__fixture/gate/')) {
      const key = path.split('/').at(-1)!;
      const gate = gates.get(key);
      if (request.method === 'GET') return Response.json({ waiting: !!gate });
      if (!gate) return new Response(null, { status: 404 });
      gates.delete(key);
      try {
        return Response.json(await new D1ConversationStore(env.DB, clock).admit(gate));
      } catch (error) {
        return Response.json({ error: error instanceof AdmissionRejected || error instanceof ConversationUnavailable ? error.code : 'result_unavailable' });
      }
    }
    if (path === '/__fixture/admit') {
      const { conversationId, body, action, limits } = await request.json() as { conversationId: string; body: unknown; action: 'submit' | 'recover'; limits: Partial<AdmissionLimits> };
      const catalog = new D1ResourceCatalog(env.DB);
      const gate = request.headers.get('X-Fixture-Gate');
      const store = new D1ConversationStore(env.DB, clock);
      if (gate) store.admit = async (command) => {
        // Split only at the production atomic port, after all application
        // authentication/identity/scope validation. No unresolved Worker Promise.
        gates.set(gate, command);
        throw new Error('Fixture prepared command');
      };
      try {
        return Response.json(await admitConversationQuestion(store, catalog, clock, conversationId,
          request.headers.get('Authorization') ?? undefined, body, action, limits));
      } catch (error) {
        if (gate && gates.has(gate)) return Response.json({ prepared: true });
        return Response.json({ error: error instanceof AdmissionRejected || error instanceof ConversationUnavailable ? error.code : 'fixture_unavailable' }, { status: 409 });
      }
    }
    return createWorker(clock, () => request.headers.get('X-Fixture-Address') ?? '127.0.0.1').fetch(request, env, context);
  },
};
