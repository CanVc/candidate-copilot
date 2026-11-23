import { createHash } from 'node:crypto';
import { closeSync, fstatSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleValidatedArtifacts } from '../public-content/build.ts';
import { pinDirectory, openEntry, descriptorPath } from '../public-content/validate.ts';
import { jcs } from '../../src/shared/public-catalog.ts';
import { installEvaluationPublication } from '../retrieval/evaluate.ts';

const root = new URL('../../', import.meta.url);
const names = {
  'mission-regie-collections.md': '62dc67fcd7f288d58a6851dba1e07d447b00e0f7381d375b92ff07e7219522ea',
  'projet-prototype-prets.md': '945a1f3d2d853205085fec7f6246bd1a415b3c09e9b3b65913e4fcba35f01e2a',
  'projet-reperage-reserves.md': '18dd57a7dc4eeeb8c1c86d22122125068f859dfb04d117b7ffac3c2d3ae10121',
};
function pinned(dir, name, sha) {
  const entry = openEntry(dir.fd, name, false);
  try {
    if (fstatSync(entry.fd).size > 65536) throw new Error();
    const bytes = readFileSync(entry.fd); entry.check(); dir.check();
    if (createHash('sha256').update(bytes).digest('hex') !== sha) throw new Error();
    return bytes;
  } finally { closeSync(entry.fd); }
}
export function inputs() {
  const path = fileURLToPath(new URL('tests/fixtures/global-evaluation/cases.json', root));
  const dir = pinDirectory(dirname(path)); let cases;
  try { cases = JSON.parse(pinned(dir, basename(path), '3075022367346d57870a1f663170e29a6ad444f6c1f1d392c092f45a52e3c654')); }
  finally { dir.close(); }
  const content = pinDirectory(fileURLToPath(new URL('content/public', root)));
  try {
    const inventory = () => {
      content.check();
      if (JSON.stringify(readdirSync(descriptorPath(content.fd)).sort()) !== JSON.stringify(Object.keys(names).sort())) throw new Error();
    };
    inventory();
    const sources = Object.entries(names).map(([name, sha]) => ({ path: `content/public/${name}`, bytes: pinned(content, name, sha) }));
    inventory();
    const { sourceRevision, catalogHash, searchHash } = cases.corpus;
    const bundle = assembleValidatedArtifacts(sources, sourceRevision);
    const hash = data => createHash('sha256').update(data).digest('hex');
    const catalog = JSON.parse(bundle.files[`assets/resources-catalog.${catalogHash}.json`]);
    if (bundle.catalogHash !== catalogHash || bundle.searchHash !== searchHash || catalog.catalogHash !== catalogHash ||
        hash(jcs(catalog.payload)) !== catalogHash || hash(bundle.files[`search-artifacts.${searchHash}.json`]) !== searchHash) throw new Error();
    Object.freeze(bundle.files); Object.freeze(bundle);
    // The fixture digest pins the complete turn, revision, hashes and membership. Project only the fresh question.
    const question = cases.cases.find(c => c.id === 'long-documented').turns[0].question;
    const eligibleDocumentIds = cases.scope.eligibleDocumentIds;
    const submittedScope = { version: 1, mode: 'global_public', resources: [], eligibleDocumentIds, catalogHash, catalogRevision: sourceRevision };
    const message = { messageId: 'pilot', contextAnchorMessageId: 'pilot', requestId: 'one-shot', createdAt: new Date().toISOString(), question,
      submittedScope, submissionIdentity: { kind: 'direct', resourceIds: [], catalogHash, catalogRevision: sourceRevision, question } };
    return { bundle, message };
  } finally { content.close(); }
}
export async function localPublication(directory, bundle, use, onDisposeFailure) {
  const require = createRequire(new URL('node_modules/wrangler/package.json', root));
  const { Miniflare, Log, LogLevel } = require('miniflare');
  // Pinned Miniflare installs synchronous process.exit(128+signal) hooks in its
  // constructor. This standalone CLI owns these signals and awaits dispose instead.
  // Leave its exit hook and all pre-existing handlers intact.
  const signals = ['SIGINT','SIGTERM','SIGHUP'];
  const existing = new Set(signals.flatMap(sig => process.listeners(sig)));
  const mf = new Miniflare({ host: '127.0.0.1', port: 0, cf: false, log: new Log(LogLevel.NONE), telemetry: { enabled: false },
    resourcePersistencePath: `${directory}/storage`, workers: [{ dev: { rootPath: directory }, config: {
      name: 'pilot-local', compatibilityDate: '2026-06-11', env: { DB: { type: 'd1', id: 'pilot-local', dev: { remote: false } } },
      manifest: { mainModule: 'empty.mjs', modules: { 'empty.mjs': { type: 'esm', contents: 'export default {};' } } },
    } }] });
  try {
    for (const sig of signals) for (const fn of process.listeners(sig)) {
      if (!existing.has(fn) && ['onSignalInt','onSignalTerm','onSignalHup'].includes(fn.name)) process.off(sig, fn);
    }
    const db = await mf.getD1Database('DB');
    const sql = readFileSync(new URL('migrations/0002_public_publication.sql', root), 'utf8');
    await db.batch(sql.split(';').map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
    await installEvaluationPublication(db, bundle);
    return await use(db);
  } finally { try { await mf.dispose(); } catch { onDisposeFailure(); } }
}
