import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  console.log('Usage: npm run content:build -- --revision <full-commit> | --help');
} else if (args.length !== 2 || args[0] !== '--revision' || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(args[1])) {
  console.log(JSON.stringify({ ok: false, sourceRevision: null, diagnostics: [{ code: 'ARGUMENTS_INVALID', document: null }] }));
  process.exitCode = 1;
} else {
  try {
    const { buildPublicContent } = await import('../tools/public-content/build.ts');
    const result = buildPublicContent(fileURLToPath(new URL('../', import.meta.url)), args[1]);
    console.log(JSON.stringify(result));
    if (!result.ok) process.exitCode = 1;
  } catch {
    console.log(JSON.stringify({ ok: false, sourceRevision: null, diagnostics: [{ code: 'BUILD_FAILED', document: null }] }));
    process.exitCode = 1;
  }
}
