import { spawnSync } from 'node:child_process';
import { accessSync, constants, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertLocalD1Target } from './local-d1-target.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = join(root, 'wrangler.jsonc');
const [action, ...extra] = process.argv.slice(2);

try {
  if (!['init', 'check', 'types'].includes(action) || extra.length) {
    throw new Error('Usage: node scripts/local-d1.mjs init|check|types (no remote, preview, environment or target arguments).');
  }
  await assertLocalD1Target(root);
  const { getPlatformProxy } = await import('wrangler');

  function wrangler(args) {
    const result = spawnSync(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), ...args,
      '--config', 'wrangler.jsonc', '--env-file', '/dev/null'], { cwd: root, env: process.env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Local Wrangler ${action} failed (exit=${result.status}, signal=${result.signal}).`);
  }

  if (action === 'types') {
    wrangler(['types', 'src/worker/env.d.ts', '--include-runtime=false']);
  } else {
    if (action === 'init') {
      accessSync(join(root, 'migrations/0001_local_bootstrap.sql'), constants.R_OK);
      wrangler(['d1', 'migrations', 'apply', 'candidate-copilot-local', '--local', '--persist-to', '.wrangler/state']);
    }
    // Fail before starting a runtime if the storage directory cannot be used.
    // This only creates missing directories; it never replaces existing data.
    const storage = join(root, '.wrangler/state/v3/d1');
    mkdirSync(storage, { recursive: true });
    accessSync(storage, constants.R_OK | constants.W_OK | constants.X_OK);
    const { verifyLocalD1 } = await import('../src/worker/local-d1.ts');
    const proxy = await getPlatformProxy({
      configPath, remoteBindings: false, envFiles: ['/dev/null'],
      // Proxy takes the versioned path; CLI --persist-to takes its parent.
      persist: { path: join(root, '.wrangler/state/v3') },
    });
    try {
      await verifyLocalD1(proxy.env);
      console.log('PASS: local D1 SQL and exact bootstrap migration marker (DB, .wrangler/state/v3/d1).');
    } finally {
      await proxy.dispose();
    }
  }
} catch (error) {
  console.error(`Local D1 ${action ?? 'command'} failed:`, error);
  // Proxy construction can fail before it returns a disposable handle while
  // leaving runtime handles live. Run upstream exit cleanup and fail nonzero
  // rather than hanging after reporting a setup error. Returned proxies above
  // always have their asynchronous disposal awaited first.
  process.exit(1);
}
