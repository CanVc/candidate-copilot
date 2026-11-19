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
  vars: { TRUSTED_BROWSER_ORIGIN: origin, CREATION_ADDRESS_MODE: 'local-fixed', CONVERSATION_CREATION_LIMIT: '10' },
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
  for (const sql of [
    'INSERT INTO conversation_creation_counters (pseudonym, expires_at, creations) VALUES (NULL, 1, 1)',
    'INSERT INTO conversation_creation_counters (expires_at, creations) VALUES (1, 1)',
  ]) await assert.rejects(db.prepare(sql).run(), /NOT NULL/);
  assert.deepEqual((await db.prepare('SELECT * FROM conversation_creation_counters').all()).results, []);
  const prepareCreation = async (time) => (await (await one.fetch('http://local/__fixture/prepare', { headers: { 'X-Fixture-Now': time } })).json()).id;
  const commitCreation = (id, time, extra = {}) => one.fetch('http://local/__fixture/commit', {
    method: 'POST', headers: { 'X-Fixture-Now': time, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify({ id }),
  });
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
  const view = (id) => ({ conversationId: id, transcript: [], processing: { status: 'idle' }, admission: { available: false, reason: 'scope_unavailable' } });
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
  const dump = async () => JSON.stringify((await db.batch(['conversations', 'conversation_creation_key', 'conversation_creation_counters', 'active_publication', 'unrelated_fixture', 'd1_migrations'].map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1`)))).map((r) => r.results));
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
      assert.equal((await worker.fetch(`http://local/api/conversations/${a.conversationId}/${path}`, { method: 'POST' })).status, path === 'messages' ? 401 : 404);
    }
  }
  assert.equal(await dump(), baseline, 'reads, unavailable effects and policy failures do not mutate any state');
  await one.applyD1Migrations('DB'); await two.applyD1Migrations('DB');
  assert.equal(await dump(), baseline, 'migration reruns preserve conversations, unrelated data and original ledger');
  assert.deepEqual((await db.prepare('SELECT name FROM d1_migrations ORDER BY id').all()).results.map((r) => r.name), ['0001_local_bootstrap.sql', '0002_public_publication.sql', '0003_conversations.sql', '0004_conversation_creation_limits.sql', '0005_conversation_admission.sql', '0006_conversation_results.sql']);

  await db.prepare("UPDATE conversations SET modified_at = '2026-03-31T23:59:59.999Z' WHERE id = ?").bind(a.conversationId).run();
  for (const worker of [one, two]) {
    assert.deepEqual(await checked(await read(worker, a.conversationId, a.sessionToken, '2026-03-31T23:59:59.999Z'), 200), view(a.conversationId));
    for (const time of ['2026-04-01T00:00:00.000Z', '2026-04-01T00:00:00.001Z']) assert.deepEqual(await checked(await read(worker, a.conversationId, a.sessionToken, time), 401), { error: 'conversation_unavailable' });
  }
  await db.prepare('DELETE FROM conversations WHERE id = ?').bind(b.conversationId).run();
  for (const worker of [one, two]) assert.deepEqual(await checked(await read(worker, b.conversationId, b.sessionToken), 401), { error: 'conversation_unavailable' });

  // Executable A09 entry fixture with real D1 allowance, NOT production UI.
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
          const resumeAt = new Date(response.headers.get('Retry-After')).toISOString();
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
    return create(two, { 'X-Fixture-Limit': '4' });
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

  // Lose the last permitted creation, then explicitly request a fresh one:
  // the very same entry must receive actual exhaustion, not retry automatically.
  const lastAddress = { 'X-Fixture-Address': '192.0.2.199', 'X-Fixture-Limit': '1' };
  const beforeLastLost = await count();
  const lastCreate = mock.fn(async () => {
    const response = await create(two, lastAddress);
    if (lastCreate.mock.calls.length === 0) {
      assert.equal(response.status, 201);
      await response.body.cancel();
      throw new Error('Controlled last-allowance response loss');
    }
    assert.equal(response.status, 429);
    return response;
  });
  const lastEntry = new ControlledEntry(lastCreate, submitSpy);
  await lastEntry.begin('Never carry this suggestion');
  assert.equal(lastEntry.state, 'uncertain');
  assert.equal(await count(), beforeLastLost + 1);
  const afterLastLost = await dump();
  for (let i = 0; i < 3; i++) { lastEntry.observe(); assert.equal(await lastEntry.sendSuggestion(), false); }
  assert.equal(lastCreate.mock.calls.length, 1);
  await lastEntry.explicitFreshCreation();
  assert.deepEqual(lastEntry.observe(), { state: 'exhausted', notice: 'Nouvelle conversation possible à partir de 2026-01-02T00:00:00.000Z' });
  assert.equal(lastEntry.credentials, null);
  assert.equal(lastEntry.suggestedIntent, null);
  assert.equal(await lastEntry.sendSuggestion(), false);
  assert.equal(lastCreate.mock.calls.length, 2);
  assert.equal(submitSpy.mock.calls.length, 0);
  assert.equal(await dump(), afterLastLost);

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

  // Same shared D1, independent Workers, concurrent cap and ignored forged headers.
  const tomorrow = { 'X-Fixture-Now': '2026-01-02T23:59:59.000Z' };
  const beforeRace = await count();
  const races = await Promise.all(Array.from({ length: 32 }, (_, i) => create(i % 2 ? one : two, {
    ...tomorrow, 'CF-Connecting-IP': `192.0.2.${i + 1}`, 'X-Forwarded-For': `198.51.100.${i + 1}`, 'X-Real-IP': `203.0.113.${i + 1}`,
  })));
  assert.equal(races.filter((r) => r.status === 201).length, 10);
  assert.equal(races.filter((r) => r.status === 429).length, 22);
  assert.equal(await count(), beforeRace + 10);
  const saved = await checked(races.find((r) => r.status === 201), 201);
  for (const response of races.filter((r) => r.status === 429)) {
    assert.equal(response.headers.get('Retry-After'), 'Sat, 03 Jan 2026 00:00:00 GMT');
    assert.deepEqual(await checked(response, 429), { error: 'rate_limited' });
  }
  const afterRace = await dump();
  assert.deepEqual(await checked(await read(two, saved.conversationId, saved.sessionToken, tomorrow['X-Fixture-Now']), 200), view(saved.conversationId));
  assert.equal(await dump(), afterRace, 'exhaustion cannot affect reads/counters');
  const state = await db.prepare('SELECT * FROM conversation_creation_key').first();
  assert.match(state.daily_key, /^[0-9a-f]{64}$/);
  assert.equal((await db.prepare('SELECT creations FROM conversation_creation_counters WHERE expires_at = ?').bind(Date.parse('2026-01-03T00:00:00Z')).first()).creations, 10);

  // These requests already acquired a valid key. Resume insertion only after
  // advancing the clock, erasing the key, or publishing the next day's key.
  const beforeMidnight = tomorrow['X-Fixture-Now'];
  const expiredInsertion = await prepareCreation(beforeMidnight);
  const cleanedInsertion = await prepareCreation(beforeMidnight);
  const rolledInsertion = await prepareCreation(beforeMidnight);
  assert.equal((await commitCreation(expiredInsertion, '2026-01-03T00:00:00Z')).status, 503);
  assert.equal(await dump(), afterRace, 'window guard rejects insertion after successful old-day key lookup');

  // No HTTP traffic drives physical expiry. Failure rolls back both cleanup writes;
  // the next scheduled execution recovers without changing the retention deadline.
  await db.prepare("CREATE TRIGGER fixture_cleanup_failure BEFORE UPDATE ON conversation_creation_key BEGIN SELECT RAISE(ABORT, 'fixture cleanup failure'); END").run();
  const failedSchedule = await one.scheduled({ scheduledTime: new Date('2026-01-03T00:00:00Z'), cron: '* * * * *' });
  assert.notEqual(failedSchedule.outcome, 'ok');
  assert.equal(await dump(), afterRace);
  await db.prepare('DROP TRIGGER fixture_cleanup_failure').run();
  assert.equal((await two.scheduled({ scheduledTime: new Date('2026-01-03T00:00:00Z'), cron: '* * * * *' })).outcome, 'ok');
  assert.deepEqual((await db.prepare('SELECT * FROM conversation_creation_counters').all()).results, []);
  assert.deepEqual(await db.prepare('SELECT * FROM conversation_creation_key').first(), { ...state, daily_key: null });
  const afterCleanup = await dump();
  assert.equal((await commitCreation(cleanedInsertion, beforeMidnight)).status, 503);
  assert.equal(await dump(), afterCleanup, 'erased-key insertion guard prevents resurrection even with stale clock');
  await db.prepare("CREATE TRIGGER fixture_idle_key_write BEFORE UPDATE ON conversation_creation_key WHEN OLD.daily_key IS NULL BEGIN SELECT RAISE(ABORT, 'unexpected idle key write'); END").run();
  assert.equal((await one.scheduled({ scheduledTime: new Date('2026-01-03T00:01:00Z'), cron: '* * * * *' })).outcome, 'ok');
  assert.equal(await dump(), afterCleanup, 'idle cleanup neither changes state nor writes an already-null key');
  await db.prepare('DROP TRIGGER fixture_idle_key_write').run();
  // Stale previous-day execution cannot regenerate erased keys or revive rows.
  assert.equal((await create(one, tomorrow)).status, 503);
  assert.deepEqual((await db.prepare('SELECT * FROM conversation_creation_counters').all()).results, []);

  const rollover = { 'X-Fixture-Now': '2026-01-03T00:00:00.000Z', 'X-Fixture-Limit': '3', 'X-Fixture-Address': '2001:0DB8:0:0:0:0:0:1' };
  const firstRollover = await checked(await create(one, rollover), 201);
  const newKey = await db.prepare('SELECT * FROM conversation_creation_key').first();
  assert.notEqual(newKey.daily_key, state.daily_key);
  for (let i = 0; i < 2; i++) await checked(await create(two, { ...rollover, 'X-Fixture-Address': '2001:db8::1' }), 201);
  assert.equal((await create(one, rollover)).status, 429, 'corporate shared canonical IPv6 cap');
  assert.equal((await create(two, { ...rollover, 'X-Fixture-Address': '2001:db8::2' })).status, 201, 'different synthetic address');
  assert.equal((await create(two, tomorrow)).status, 503, 'old day cannot overwrite newer key');
  const stableKey = await db.prepare('SELECT * FROM conversation_creation_key').first();
  // Fresh Worker composition on every request must keep the same daily key.
  assert.deepEqual(stableKey, newKey);

  const afterRollover = await dump();
  assert.equal((await commitCreation(rolledInsertion, beforeMidnight)).status, 503);
  assert.equal(await dump(), afterRollover, 'new daily key fences an insertion that acquired the old key');

  // A mismatched expiry is corruption, whether the count is below or at cap.
  const cappedCounter = await db.prepare('SELECT * FROM conversation_creation_counters WHERE creations = 3').first();
  await db.prepare('UPDATE conversation_creation_counters SET expires_at = expires_at + 86400000 WHERE pseudonym = ?').bind(cappedCounter.pseudonym).run();
  const inconsistentCounter = await dump();
  for (const limit of ['3', '4']) {
    assert.deepEqual(await checked(await create(one, { ...rollover, 'X-Fixture-Limit': limit }), 503), { error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE });
    assert.equal(await dump(), inconsistentCounter, 'corrupt counter is unavailable without mutation, never a false 429');
  }
  await db.prepare('UPDATE conversation_creation_counters SET expires_at = ? WHERE pseudonym = ?').bind(cappedCounter.expires_at, cappedCounter.pseudonym).run();

  // Mixed expiry: clean an obsolete counter while retaining the active key and
  // current counters exactly, including their exhausted allowance.
  const currentState = await dump();
  await db.prepare('INSERT INTO conversation_creation_counters VALUES (?, ?, 1)').bind('0'.repeat(64), Date.parse('2026-01-03T00:00:00Z')).run();
  assert.equal((await two.scheduled({ scheduledTime: new Date('2026-01-03T00:01:00Z'), cron: '* * * * *' })).outcome, 'ok');
  assert.equal(await dump(), currentState);
  assert.deepEqual(await checked(await create(two, rollover), 429), { error: 'rate_limited' });
  assert.equal(await dump(), currentState);

  const beforeRollback = await dump();
  await db.prepare("CREATE TRIGGER fixture_insert_failure BEFORE INSERT ON conversations BEGIN SELECT RAISE(ABORT, 'fixture insert failure'); END").run();
  assert.equal((await create(one, { ...rollover, 'X-Fixture-Address': '192.0.2.99' })).status, 503);
  assert.equal(await dump(), beforeRollback, 'INSERT failure rolls back capped UPSERT in actual D1');
  await db.prepare('DROP TRIGGER fixture_insert_failure').run();
  assert.equal((await create(two, { ...rollover, 'X-Fixture-Address': '192.0.2.99' })).status, 201);
  const snapshot = await dump();
  for (const overrides of [{ Origin: 'null' }, { 'Content-Type': 'text/plain' }, { 'X-Fixture-Limit': '0' }, { 'X-Fixture-Address': '192.0.2.1,192.0.2.2' }]) assert.notEqual((await create(one, { ...rollover, ...overrides })).status, 201);
  assert.equal(await dump(), snapshot, 'rejects never consume allowance');
  const counterRows = (await db.prepare('SELECT * FROM conversation_creation_counters').all()).results;
  for (const row of counterRows) assert.deepEqual(Object.keys(row).sort(), ['creations', 'expires_at', 'pseudonym']);
  for (const address of ['2001:db8::1', '192.0.2.99', '127.0.0.1']) assert(!snapshot.includes(address));

  // Advance actual SQLite clock state between UPSERT and INSERT in one batch.
  // Admission before midnight must still commit both records, not only a counter.
  const midnightId = await prepareCreation('2026-01-03T23:59:59.999Z');
  const beforeMidnightCount = await count();
  await db.prepare('CREATE TABLE fixture_creation_clock (now INTEGER NOT NULL)').run();
  await db.prepare('INSERT INTO fixture_creation_clock VALUES (?)').bind(Date.parse('2026-01-03T23:59:59.999Z')).run();
  await db.prepare(`CREATE TRIGGER fixture_midnight AFTER INSERT ON conversation_creation_counters BEGIN UPDATE fixture_creation_clock SET now = ${Date.parse('2026-01-04T00:00:00Z')}; END`).run();
  assert.equal((await commitCreation(midnightId, '2026-01-03T23:59:59.999Z', { 'X-Fixture-Sql-Clock': 'true' })).status, 201);
  assert.equal((await db.prepare('SELECT now FROM fixture_creation_clock').first()).now, Date.parse('2026-01-04T00:00:00Z'));
  await db.prepare('DROP TRIGGER fixture_midnight').run();
  await db.prepare('DROP TABLE fixture_creation_clock').run();
  assert.equal(await count(), beforeMidnightCount + 1);
  assert.equal((await db.prepare('SELECT SUM(creations) AS n FROM conversation_creation_counters').first()).n, counterRows.reduce((sum, row) => sum + row.creations, 0) + 1);
  assert.equal((await two.scheduled({ scheduledTime: new Date('2026-01-04T00:00:00Z'), cron: '* * * * *' })).outcome, 'ok');
  assert.deepEqual((await db.prepare('SELECT * FROM conversation_creation_counters').all()).results, []);
  assert.equal((await db.prepare('SELECT id FROM conversations WHERE id = ?').bind(midnightId).first()).id, midnightId);
  assert.equal(await count(), beforeMidnightCount + 1);

  // Missing/malformed same-day key and missing singleton fail closed, never reset.
  await db.prepare('UPDATE conversation_creation_key SET daily_key = NULL').run();
  const corrupt = await dump();
  assert.equal((await create(two, rollover)).status, 503);
  assert.equal(await dump(), corrupt);
  assert.deepEqual(await checked(await read(one, firstRollover.conversationId, firstRollover.sessionToken, rollover['X-Fixture-Now']), 200), view(firstRollover.conversationId));
  await db.prepare('PRAGMA ignore_check_constraints = ON').run();
  await db.prepare("UPDATE conversation_creation_key SET daily_key = 'malformed'").run();
  assert.equal((await create(one, rollover)).status, 503);
  assert.equal((await db.prepare('SELECT daily_key FROM conversation_creation_key').first()).daily_key, 'malformed');
  await db.prepare('PRAGMA ignore_check_constraints = OFF').run();
  await db.prepare('DELETE FROM conversation_creation_key').run();
  assert.equal((await create(two, rollover)).status, 503);
  assert.equal((await create(two, { ...rollover, 'X-Fixture-Now': '2026-01-04T00:00:00Z' })).status, 503);
  assert.deepEqual((await db.prepare('SELECT * FROM conversation_creation_key').all()).results, []);

  await db.prepare('ALTER TABLE conversations RENAME TO unavailable_fixture').run();
  const failedCreation = await checked(await create(), 503);
  assert.deepEqual(failedCreation, { error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE });
  assert.deepEqual(await checked(await read(two, fresh.conversationId, fresh.sessionToken), 503), { error: 'conversation_dependency_unavailable' });
  const logs = JSON.stringify(server.getLogs());
  for (const secret of [state.daily_key, newKey.daily_key, ...counterRows.map((row) => row.pseudonym), '192.0.2.99', '2001:db8::1']) assert(!logs.includes(secret));
  for (const c of [a, b, fresh]) {
    assert(!logs.includes(c.sessionToken));
    assert(!logs.includes(createHash('sha256').update(c.sessionToken).digest('hex')));
  }
  console.log('PASS: real D1 conversations, independent readers, atomic creation caps, rollback, midnight, physical scheduled cleanup/failure recovery, corrupt-state guards and controlled lost-response/suggested-intent fixtures (no production UI or hosted ingress proof).');
} finally { await server.close(); }
