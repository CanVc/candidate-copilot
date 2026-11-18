import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { assertLocalD1Target } from './local-d1-target.mjs';

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  console.log('Usage: npm run content:activate -- --revision <full-commit> (local only; frontend on 127.0.0.1:5173 required)');
} else {
  let proxy;
  let failed = false;
  try {
    if (args.length !== 2 || args[0] !== '--revision' || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(args[1])) throw new Error();
    const root = fileURLToPath(new URL('../', import.meta.url));
    const configPath = await assertLocalD1Target(root);
    const { getPlatformProxy } = await import('wrangler');
    const { activatePublicContent } = await import('../tools/public-content/activate.ts');
    proxy = await getPlatformProxy({ configPath, remoteBindings: false, envFiles: ['/dev/null'], persist: { path: join(root, '.wrangler/state/v3') } });
    await activatePublicContent(root, args[1], proxy.env.DB);
  } catch {
    failed = true;
  } finally {
    try { if (proxy) await proxy.dispose(); }
    catch { failed = true; }
  }
  if (failed) {
    console.error(JSON.stringify({ ok: false, diagnostics: [{ code: 'ACTIVATION_FAILED', document: null }] }));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, sourceRevision: args[1] }));
}
