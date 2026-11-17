import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const help = 'Usage: npm run content:check -- [--revision <full-commit>] | --help';
if (args.length === 1 && args[0] === '--help') {
  console.log(help);
} else if (args.length !== 0 && !(args.length === 2 && args[0] === '--revision')) {
  console.log(JSON.stringify({ ok: false, count: 0, sourceRevision: null, diagnostics: [{ code: 'ARGUMENTS_INVALID', document: null }] }));
  process.exitCode = 1;
} else {
  try {
    const { validatePublicContent } = await import('../tools/public-content/validate.ts');
    const result = validatePublicContent(fileURLToPath(new URL('../', import.meta.url)),
      args.length ? { revision: args[1] } : {});
    console.log(JSON.stringify(result));
    if (!result.ok) process.exitCode = 1;
  } catch {
    // No raw exception, parser excerpt, Git stderr or source pathname escapes.
    console.log(JSON.stringify({ ok: false, count: 0, sourceRevision: null, diagnostics: [{ code: 'VALIDATION_FAILED', document: null }] }));
    process.exitCode = 1;
  }
}
