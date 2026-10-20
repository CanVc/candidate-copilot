import assert from 'node:assert/strict';
import { join } from 'node:path';
import { createTestHarness, getPlatformProxy } from 'wrangler';
import { verifyLocalD1 } from '../../src/worker/local-d1.ts';

const root = process.cwd();
const mode = process.argv[2];
if (mode === 'proxy-preserve') {
  const proxy = await getPlatformProxy({
    configPath: join(root, 'wrangler.jsonc'), envFiles: ['/dev/null'], remoteBindings: false,
    persist: { path: join(root, '.wrangler/state/v3') },
  });
  try {
    assert.deepEqual(Object.keys(proxy.env), ['DB'], 'No env-file canary bindings may load');
    await verifyLocalD1(proxy.env);
    const row = await proxy.env.DB.prepare('SELECT value FROM fixture_only WHERE id = 1').first();
    assert.deepEqual(row, { value: 'cli-owned' });
    const update = await proxy.env.DB.prepare("UPDATE fixture_only SET value = 'proxy-owned' WHERE id = 1").run();
    assert.equal(update.success, true);
    console.log('PASS: proxy read CLI row and updated the same persistent storage.');
  } finally {
    await proxy.dispose();
  }
} else if (mode === 'interrupt') {
  const proxy = await getPlatformProxy({
    configPath: join(root, 'wrangler.jsonc'), envFiles: ['/dev/null'], remoteBindings: false,
    persist: { path: join(root, '.wrangler/state/v3') },
  });
  try {
    await verifyLocalD1(proxy.env);
    console.log('D1_RUNTIME_READY');
    // The outer fixture interrupts this live runtime. Miniflare's upstream
    // SIGINT handler exits synchronously (130), before asynchronous finally
    // blocks can run. The fixture must close every owned descendant before
    // removing state, independently of that upstream exit cleanup.
    await new Promise(() => {});
  } finally {
    await proxy.dispose();
  }
} else if (mode === 'worker') {
  // This harness always uses independent, nonpersistent storage. It is NOT
  // evidence that the CLI and Worker dev server share persistence.
  // Keep its synthetic config beside the test entrypoint, with no env files.
  const config = {
    name: 'candidate-copilot-d1-test', main: join(root, 'tests/e2e/d1-worker.ts'),
    compatibility_date: '2026-06-11', send_metrics: false,
    d1_databases: [{
      binding: 'DB', database_name: 'candidate-copilot-local',
      database_id: '00000000-0000-0000-0000-000000000000', remote: false,
      migrations_dir: join(root, 'migrations'),
    }],
  };
  const server = createTestHarness({ root: join(root, 'tests/e2e'), workers: [{ config }] });
  try {
    await server.listen();
    const worker = server.getWorker();
    assert.notEqual((await worker.scheduled({})).outcome, 'ok', 'Uninitialized workerd storage must fail');
    await worker.applyD1Migrations('DB');
    assert.equal((await worker.scheduled({})).outcome, 'ok', 'Actual workerd handler must execute the private SQL helper');
    const env = await worker.getEnv();
    await env.DB.prepare("UPDATE d1_migrations SET name = 'not-the-bootstrap.sql'").run();
    assert.notEqual((await worker.scheduled({})).outcome, 'ok', 'SELECT 1 alone must not pass');
  } finally {
    await server.close();
  }
  const missing = createTestHarness({
    root: join(root, 'tests/e2e'), workers: [{ config: { ...config, d1_databases: [] } }],
  });
  try {
    await missing.listen();
    assert.notEqual((await missing.getWorker().scheduled({})).outcome, 'ok', 'Missing actual Worker binding must fail');
  } finally {
    await missing.close();
  }
  console.log('PASS: private SQL helper in actual workerd scheduled handler; independent storage and negative controls.');
} else {
  throw new Error('Expected proxy-preserve, interrupt or worker mode');
}
