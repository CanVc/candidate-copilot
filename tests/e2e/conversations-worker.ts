import { createWorker, cleanupCreationLimits } from '../../src/worker/index.ts';
import { canonicalAddress, trustedCreationAddress } from '../../src/adapters/cloudflare/creation-address.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { creationPseudonym, creationWindow } from '../../src/application/conversation-creation-limits.ts';
import type { CreationAllowance } from '../../src/shared/conversation.ts';

// Test-only split creation: hold a successfully acquired key across real D1
// cleanup/rollover by another Worker, then exercise the actual insertion guard.
const prepared = new Map<string, CreationAllowance>();

// Disposable test-only clock. The application Worker never interprets this header.
export default {
  async scheduled(event: ScheduledController, env: Cloudflare.Env) {
    await cleanupCreationLimits(env, { now: () => new Date(event.scheduledTime) });
  },
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const time = request.headers.get('X-Fixture-Now') ?? '2026-01-01T00:00:00.000Z';
    const path = new URL(request.url).pathname;
    if (path === '/__fixture/prepare' || path === '/__fixture/commit') {
      // Only the atomic-midnight regression substitutes a SQL-backed clock;
      // a trigger advances it between UPSERT and INSERT inside the real batch.
      const db = request.headers.has('X-Fixture-Sql-Clock') ? {
        prepare: (sql: string) => env.DB.prepare(sql.replaceAll(String(new Date(time).getTime()), '(SELECT now FROM fixture_creation_clock)')),
        batch: (statements: D1PreparedStatement[]) => env.DB.batch(statements),
      } as D1Database : env.DB;
      const store = new D1ConversationStore(db, { now: () => new Date(time) });
      if (path === '/__fixture/prepare') {
        const window = creationWindow(new Date(time));
        const dailyKey = await store.dailyCreationKey(window);
        const pseudonym = await creationPseudonym('192.0.2.200', window, dailyKey);
        const id = crypto.randomUUID();
        prepared.set(id, { ...window, dailyKey, pseudonym, limit: 10 });
        return Response.json({ id });
      }
      const { id } = await request.json() as { id: string };
      const allowance = prepared.get(id);
      if (!allowance) throw new Error('Missing prepared creation');
      prepared.delete(id);
      try {
        const outcome = await store.create({ conversationId: id, sessionTokenHash: id.replaceAll('-', '').repeat(2), createdAt: time, modifiedAt: time }, allowance);
        return Response.json({ outcome }, { status: outcome === 'created' ? 201 : 429 });
      } catch { return Response.json({ error: 'creation_unavailable' }, { status: 503 }); }
    }
    // Node's fetch transport overwrites Sec-Fetch-Mode. Inject only here so the
    // real application handler still receives and rejects the contradictory value.
    const mode = request.headers.get('X-Fixture-Fetch-Mode');
    const input = new Request(request);
    if (mode) input.headers.set('Sec-Fetch-Mode', mode);
    const address = request.headers.get('X-Fixture-Address');
    const limit = request.headers.get('X-Fixture-Limit');
    const response = await createWorker({ now: () => new Date(time) }, address === null ? trustedCreationAddress : () => canonicalAddress(address))
      .fetch(input, { ...env, ...(limit === null ? {} : { CONVERSATION_CREATION_LIMIT: limit }) }, context);
    if (mode) response.headers.set('X-Fixture-Observed-Fetch-Mode', input.headers.get('Sec-Fetch-Mode')!);
    return response;
  },
};
