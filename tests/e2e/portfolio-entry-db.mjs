import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertLocalD1Target } from '../../scripts/local-d1-target.mjs';
import { assembleValidatedArtifacts } from '../../tools/public-content/build.ts';

const root = process.cwd();
// LocalFixture creates a fresh mkdtemp parent, sibling HOME and TMPDIR, and
// launches this *copied* helper with a per-command scope. Never probe the
// checkout's config or .wrangler state to decide whether it is a fixture.
const parent = dirname(root);
if (basename(root) !== 'project' || !/^candidate-copilot-smoke-[a-zA-Z0-9]{6}$/.test(basename(parent)) ||
    process.env.HOME !== join(parent, 'home') || process.env.TMPDIR !== join(parent, 'settings/tmp') ||
    !/^[a-f0-9-]{36}$/.test(process.env.CANDIDATE_COPILOT_SMOKE_SCOPE ?? '') ||
    fileURLToPath(import.meta.url) !== join(root, 'tests/e2e/portfolio-entry-db.mjs') || realpathSync(root) !== root) {
  throw new Error('Disposable entry fixture required');
}
for (const part of ['wrangler.jsonc', '.wrangler', '.wrangler/state', '.wrangler/state/v3']) {
  const path = join(root, part);
  if (existsSync(path) && realpathSync(path) !== path) throw new Error('Unexpected fixture path');
}
const configPath = await assertLocalD1Target(root);
const { getPlatformProxy } = await import('wrangler');
const proxy = await getPlatformProxy({ configPath, remoteBindings: false, envFiles: ['/dev/null'], persist: { path: join(root, '.wrangler/state/v3') } });
try {
  const db = proxy.env.DB;
  if (process.argv[2] === 'counts') {
    console.log(JSON.stringify(await db.prepare(`SELECT (SELECT count(*) FROM conversations) AS conversations,
      (SELECT coalesce(sum(creations),0) FROM conversation_creation_counters) AS creations,
      (SELECT count(*) FROM messages) AS messages, (SELECT count(*) FROM answers) AS answers`).first()));
  } else if (process.argv[2] === 'remove-publication') {
    await db.batch(['active_publication', 'public_chunks_fts', 'public_chunks', 'public_documents'].map(table => db.prepare(`DELETE FROM ${table}`)));
  } else if (process.argv[2] === 'seed') {
    // Exactly these approved fictional development copies, never a content directory walk.
    const revision = '4323afe312f43b6b87a014abee062e03e12f6022';
    const pinned = {
      'mission-regie-collections.md': '62dc67fcd7f288d58a6851dba1e07d447b00e0f7381d375b92ff07e7219522ea',
      'projet-prototype-prets.md': '945a1f3d2d853205085fec7f6246bd1a415b3c09e9b3b65913e4fcba35f01e2a',
      'projet-reperage-reserves.md': '18dd57a7dc4eeeb8c1c86d22122125068f859dfb04d117b7ffac3c2d3ae10121',
    };
    const bundle = assembleValidatedArtifacts(Object.entries(pinned).map(([name, hash]) => {
      const path = `content/public/${name}`, bytes = readFileSync(join(root, path));
      if (createHash('sha256').update(bytes).digest('hex') !== hash) throw new Error('Unexpected public fixture');
      return { path, bytes };
    }), revision);
    const search = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]);
    await db.batch([
      ...search.documents.map(d => db.prepare('INSERT INTO public_documents VALUES (?,?,?,?)').bind(d.documentId, d.sourcePath,
        JSON.stringify(d), search.chunks.filter(c => c.documentId === d.documentId).length)),
      ...search.chunks.flatMap(c => [db.prepare('INSERT INTO public_chunks VALUES (?,?,?,?)').bind(c.chunkId,c.documentId,c.ordinal,JSON.stringify(c)),
        db.prepare('INSERT INTO public_chunks_fts (chunk_id,text) VALUES (?,?)').bind(c.chunkId,c.text)]),
      db.prepare('INSERT INTO active_publication VALUES (1,?,?,?)').bind(revision, bundle.catalogHash, new Date().toISOString()),
    ]);
  } else throw new Error('Unknown fixture action');
} finally { await proxy.dispose(); }
