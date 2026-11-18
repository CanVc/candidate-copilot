import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { createTestHarness } from 'wrangler';
import { createServer } from 'vite';
import { mock } from 'node:test';
import { CREATION_UNCERTAINTY_NOTICE } from '../../src/shared/conversation.ts';

const root = process.cwd();
const origin = 'http://127.0.0.1:5173';
const config = {
  main: join(root, 'tests/e2e/conversations-worker.ts'), compatibility_date: '2026-06-11', send_metrics: false,
  vars: { TRUSTED_BROWSER_ORIGIN: origin },
  d1_databases: [{ binding: 'DB', database_name: 'conversations-disposable', database_id: '00000000-0000-0000-0000-000000000000', remote: false, migrations_dir: join(root, 'migrations') }],
};
const server = createTestHarness({ root: join(root, 'tests/e2e'), workers: [
  { config: { ...config, name: 'conversation-one' } }, { config: { ...config, name: 'conversation-two' } },
] });
try {
  const { url: workerUrl } = await server.listen();
  const one = server.getWorker('conversation-one'), two = server.getWorker('conversation-two');
  await one.applyD1Migrations('DB');
  const { DB: db } = await one.getEnv();
  const headers = { Origin: origin, 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'same-origin' };
  const create = async (worker = one, overrides = {}) => worker.fetch('http://local/api/conversations', { method: 'POST', headers: { ...headers, ...overrides }, body: '{}' });
  const checked = async (response, status) => {
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return response.json();
  };
  const read = async (worker, id, token, time) => {
    const headers = {};
    if (token !== undefined) headers.Authorization = `Bearer ${token}`;
    if (time) headers['X-Fixture-Now'] = time;
    return worker.fetch(`http://local/api/conversations/${id}`, { headers });
  };
  const view = (id) => ({ conversationId: id, transcript: [], processing: { status: 'idle' }, admission: { available: false, reason: 'admission_unavailable' } });
  assert.deepEqual((await db.prepare('SELECT * FROM active_publication').all()).results, []);
  await db.prepare('CREATE TABLE unrelated_fixture (value TEXT)').run();
  await db.prepare("INSERT INTO unrelated_fixture VALUES ('preserved')").run();
  const a = await checked(await create(), 201), b = await checked(await create(two), 201);
  for (const c of [a, b]) {
    assert.deepEqual(Object.keys(c).sort(), ['conversationId', 'sessionToken']);
    assert.match(c.conversationId, /^[0-9a-f-]{36}$/);
    assert.match(c.sessionToken, /^[0-9a-f]{64}$/);
  }
  assert.notEqual(a.sessionToken, b.sessionToken);
  const dump = async () => JSON.stringify((await db.batch(['conversations', 'active_publication', 'unrelated_fixture', 'd1_migrations'].map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1`)))).map((r) => r.results));
  const baseline = await dump();
  const rows = (await db.prepare('SELECT * FROM conversations ORDER BY id').all()).results;
  assert.deepEqual(Object.keys(rows[0]).sort(), ['created_at', 'id', 'modified_at', 'session_token_hash']);
  for (const c of [a, b]) {
    const row = rows.find((r) => r.id === c.conversationId);
    assert.deepEqual(row, { id: c.conversationId, session_token_hash: createHash('sha256').update(c.sessionToken).digest('hex'), created_at: '2026-01-01T00:00:00.000Z', modified_at: '2026-01-01T00:00:00.000Z' });
    assert(!baseline.includes(c.sessionToken));
  }
  for (const worker of [one, two]) {
    for (let i = 0; i < 3; i++) for (const c of [a, b]) assert.deepEqual(await checked(await read(worker, c.conversationId, c.sessionToken), 200), view(c.conversationId));
    for (const [id, credential] of [[a.conversationId, b.sessionToken], [b.conversationId, a.sessionToken], [a.conversationId, undefined], [a.conversationId, 'malformed'], [a.conversationId, '0'.repeat(64)], ['00000000-0000-0000-0000-000000000000', a.sessionToken]]) {
      assert.deepEqual(await checked(await read(worker, id, credential), 401), { error: 'conversation_unavailable' });
    }
    for (const overrides of [{ Origin: 'null' }, { Origin: '' }, { Origin: 'https://foreign.invalid' }, { 'Sec-Fetch-Site': 'same-site' }, { 'Sec-Fetch-Site': 'cross-site' }, { 'Sec-Fetch-Mode': 'navigate', 'X-Fixture-Fetch-Mode': 'navigate' }, { 'Content-Type': 'text/plain' }]) {
      const response = await create(worker, overrides);
      if (overrides['Sec-Fetch-Mode']) assert.equal(response.headers.get('X-Fixture-Observed-Fetch-Mode'), 'navigate', 'actual application handler input');
      assert.equal(response.status, overrides['Content-Type'] ? 415 : 403, JSON.stringify(overrides));
      await checked(response, overrides['Content-Type'] ? 415 : 403);
    }
    for (const path of ['/api/conversations', '/api/admin', '/api/conversations/admin/list']) assert.equal((await worker.fetch(`http://local${path}`)).status, 404);
    for (const path of ['messages', 'deletion-request']) {
      assert.equal((await worker.fetch(`http://local/api/conversations/${a.conversationId}/${path}`, { method: 'POST' })).status, 404);
    }
  }
  assert.equal(await dump(), baseline, 'reads, unavailable effects and policy failures do not mutate any state');
  await one.applyD1Migrations('DB'); await two.applyD1Migrations('DB');
  assert.equal(await dump(), baseline, 'migration reruns preserve conversations, unrelated data and original ledger');
  assert.deepEqual((await db.prepare('SELECT name FROM d1_migrations ORDER BY id').all()).results.map((r) => r.name), ['0001_local_bootstrap.sql', '0002_public_publication.sql', '0003_conversations.sql']);

  await db.prepare("UPDATE conversations SET modified_at = '2026-03-31T23:59:59.999Z' WHERE id = ?").bind(a.conversationId).run();
  for (const worker of [one, two]) {
    assert.deepEqual(await checked(await read(worker, a.conversationId, a.sessionToken, '2026-03-31T23:59:59.999Z'), 200), view(a.conversationId));
    for (const time of ['2026-04-01T00:00:00.000Z', '2026-04-01T00:00:00.001Z']) assert.deepEqual(await checked(await read(worker, a.conversationId, a.sessionToken, time), 401), { error: 'conversation_unavailable' });
  }
  await db.prepare('DELETE FROM conversations WHERE id = ?').bind(b.conversationId).run();
  for (const worker of [one, two]) assert.deepEqual(await checked(await read(worker, b.conversationId, b.sessionToken), 401), { error: 'conversation_unavailable' });

  // Executable A09 entry fixture only, NOT production UI or IP counters.
  class ControlledEntry {
    state = 'idle';
    suggestedIntent = null;
    credentials = null;
    notice = '';
    constructor(create, submit) { this.create = create; this.submit = submit; }
    async begin(suggestion) {
      assert.equal(this.state, 'idle');
      this.suggestedIntent = suggestion;
      await this.attemptCreation();
    }
    async attemptCreation() {
      this.state = 'creating';
      try {
        const response = await this.create();
        if (response.status === 429) {
          assert.equal((await response.json()).error, 'rate_limited');
          const resumeAt = new Date(Date.parse(response.headers.get('Date')) + Number(response.headers.get('Retry-After')) * 1000).toISOString();
          this.credentials = null;
          this.suggestedIntent = null;
          this.state = 'exhausted';
          this.notice = `Nouvelle conversation possible à partir de ${resumeAt}`;
          return;
        }
        this.credentials = await checked(response, 201);
        this.state = 'ready';
        this.notice = '';
      } catch {
        this.credentials = null;
        this.suggestedIntent = null;
        this.state = 'uncertain';
        this.notice = CREATION_UNCERTAINTY_NOTICE;
      }
    }
    observe() { return { state: this.state, notice: this.notice }; }
    async explicitFreshCreation() {
      assert.equal(this.state, 'uncertain');
      this.suggestedIntent = null;
      await this.attemptCreation();
    }
    async sendSuggestion() {
      if (!this.credentials || !this.suggestedIntent) return false;
      await this.submit(this.credentials, this.suggestedIntent);
      return true;
    }
  }
  const count = async () => (await db.prepare('SELECT COUNT(*) AS n FROM conversations').first()).n;
  const beforeLost = await count();
  const createSpy = mock.fn(async () => {
    if (createSpy.mock.calls.length === 0) {
      const lost = await create();
      assert.equal(lost.status, 201);
      await lost.body.cancel(); // Real commit, but no credentials delivered to entry.
      throw new Error('Controlled transport loss');
    }
    if (createSpy.mock.calls.length === 1) return create(two);
    return Response.json({ error: 'rate_limited' }, { status: 429, headers: {
      Date: 'Thu, 01 Jan 2026 12:00:00 GMT', 'Retry-After': '43200',
    } });
  });
  const submitSpy = mock.fn(async () => { throw new Error('Suggested question must not be sent'); });
  const entry = new ControlledEntry(createSpy, submitSpy);
  const pendingEntry = entry.begin('Original suggested question');
  assert.equal(entry.state, 'creating');
  assert.equal(entry.suggestedIntent, 'Original suggested question');
  await pendingEntry;
  assert.deepEqual(entry.observe(), { state: 'uncertain', notice: CREATION_UNCERTAINTY_NOTICE });
  assert.equal(entry.credentials, null);
  assert.equal(entry.suggestedIntent, null);
  assert.equal(await count(), beforeLost + 1);
  for (let i = 0; i < 3; i++) {
    entry.observe();
    assert.equal(await entry.sendSuggestion(), false);
  }
  assert.equal(createSpy.mock.calls.length, 1);
  assert.equal(submitSpy.mock.calls.length, 0);
  await entry.explicitFreshCreation();
  assert.equal(entry.state, 'ready');
  const fresh = entry.credentials;
  assert.equal(await count(), beforeLost + 2);
  assert.deepEqual(await checked(await read(one, fresh.conversationId, fresh.sessionToken), 200), view(fresh.conversationId));
  assert.equal(entry.suggestedIntent, null);
  assert.equal(await entry.sendSuggestion(), false);
  assert.equal(createSpy.mock.calls.length, 2);
  assert.equal(submitSpy.mock.calls.length, 0);
  const exhaustedEntry = new ControlledEntry(createSpy, submitSpy);
  await exhaustedEntry.begin('Another suggested question');
  assert.deepEqual(exhaustedEntry.observe(), { state: 'exhausted', notice: 'Nouvelle conversation possible à partir de 2026-01-02T00:00:00.000Z' });
  assert.equal(exhaustedEntry.credentials, null);
  assert.equal(exhaustedEntry.suggestedIntent, null);
  exhaustedEntry.observe();
  assert.equal(await exhaustedEntry.sendSuggestion(), false);
  assert.equal(createSpy.mock.calls.length, 3);
  assert.equal(submitSpy.mock.calls.length, 0);
  assert.equal(await count(), beforeLost + 2);

  // Verify the real Vite /api proxy without using occupied operator ports.
  // This is a transport check with synthetic browser headers, not UI acceptance.
  const proxy = await createServer({ configFile: join(root, 'vite.config.ts'), server: {
    host: '127.0.0.1', port: 0, strictPort: true, proxy: { '/api': workerUrl.origin },
  } });
  try {
    await proxy.listen();
    const address = proxy.httpServer.address();
    assert(address && typeof address !== 'string');
    const proxied = await fetch(`http://127.0.0.1:${address.port}/api/conversations`, { method: 'POST', headers, body: '{}' });
    const c = await checked(proxied, 201);
    assert.deepEqual(await checked(await read(two, c.conversationId, c.sessionToken), 200), view(c.conversationId));
    assert.equal((await fetch(`http://127.0.0.1:${address.port}/api/conversations`, { method: 'POST', headers: { ...headers, Origin: 'null' }, body: '{}' })).status, 403);
  } finally { await proxy.close(); }

  await db.prepare('ALTER TABLE conversations RENAME TO unavailable_fixture').run();
  const failedCreation = await checked(await create(), 503);
  assert.deepEqual(failedCreation, { error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE });
  assert.deepEqual(await checked(await read(two, fresh.conversationId, fresh.sessionToken), 503), { error: 'conversation_dependency_unavailable' });
  const logs = JSON.stringify(server.getLogs());
  for (const c of [a, b, fresh]) {
    assert(!logs.includes(c.sessionToken));
    assert(!logs.includes(createHash('sha256').update(c.sessionToken).digest('hex')));
  }
  console.log('PASS: real D1 conversations, independent readers, hash-only credentials, 90-day boundary, read-only/policy guards, migration preservation and controlled lost-response/allowance/suggested-intent fixtures (no counter/UI integration).');
} finally { await server.close(); }
