import { execFileSync } from 'node:child_process';
import { cpSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { test, expect, type LocalFixture } from './local-fixture';

const root = fileURLToPath(new URL('../../', import.meta.url));
function prepare(local: LocalFixture) {
  for (const path of ['tools/public-content', 'scripts/activate-public-content.mjs', 'scripts/build-public-content.mjs', 'tests/e2e/publication-runtime.mjs', 'tests/e2e/publication-worker.ts']) {
    mkdirSync(dirname(join(local.project, path)), { recursive: true });
    cpSync(join(root, path), join(local.project, path), { recursive: true });
  }
  rmSync(join(local.project, 'content/public'), { recursive: true });
  mkdirSync(join(local.project, 'content/public/resources'), { recursive: true });
  const git = (...args: string[]) => execFileSync('git', args, { cwd: local.project, env: { ...local.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' }, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  const source = (id: string, text: string, extra = '') => `---\ndocument_id: ${id}\nvisibility: public\ntitle: "Fiction ${id}"\ncreated_at: "2024-01-01T00:00:00Z"\nmodified_at: "2024-01-01T00:00:00Z"\nreviewed_by: "SYNTHETIC TEST ONLY"\nreviewed_at: "2024-01-01T00:00:00Z"\ntopics: [""]\naliases: ["   "]\n${extra}---\n# Fiction\n\n> Fiction unrelated to BC, development only.\n\n${text}\n`;
  const commit = () => {
    git('add', 'content/public');
    git('-c', 'user.name=Synthetic Test', '-c', 'user.email=test@example.invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'Synthetic fixture');
    return git('rev-parse', 'HEAD');
  };
  writeFileSync(join(local.project, 'content/public/a.md'), source('d-a', 'Alpha evidence.'));
  writeFileSync(join(local.project, 'content/public/resources/r.md'), source('d-r', 'Resource descriptor.', 'resource_id: r-a\nresource_name: Alpha\nresource_description: Fixture\ndocument_ids: [d-a]\n'));
  writeFileSync(join(local.project, 'content/public/empty.md'), source('d-empty', '').split('\n# Fiction')[0]!.trimEnd() + '\n');
  const a = commit();
  writeFileSync(join(local.project, 'content/public/a.md'), source('d-a', 'Beta replacement evidence.'));
  writeFileSync(join(local.project, 'content/public/resources/r.md'), source('d-r', 'Resource descriptor.', 'resource_id: r-b\nresource_name: Beta\nresource_description: Replacement\ndocument_ids: [d-a, d-r]\n'));
  const b = commit();
  for (const path of ['a.md', 'empty.md', 'resources/r.md']) {
    const disk = join(local.project, 'content/public', path);
    writeFileSync(disk, readFileSync(disk, 'utf8').split('\n# Fiction')[0]!.trimEnd() + '\n');
  }
  const metadataOnly = commit();
  const checkout = (revision: string) => git('restore', '--source', revision, '--worktree', 'content/public');
  checkout(a);
  return { a, b, metadataOnly, checkout };
}
async function run(local: LocalFixture, ...args: string[]) { return local.completed(local.startCommand(process.execPath, args)); }
async function rejected(local: LocalFixture, ...args: string[]) {
  const command = local.startCommand(process.execPath, args);
  try { return await local.rejected(command); } finally { await local.stop(command); }
}
const activate = (revision: string) => ['scripts/activate-public-content.mjs', '--revision', revision];
const health = async () => {
  const response = await fetch('http://127.0.0.1:5173/api/health');
  expect(response.headers.get('cache-control')).toBe('no-store');
  return { status: response.status, body: await response.json() as Record<string, unknown> };
};

test('actual pinned CLI verifies HTTP assets before atomic activation and retains prior immutable assets', async ({ local }) => {
  const { a, b, checkout } = prepare(local);
  await run(local, 'scripts/local-d1.mjs', 'init');
  expect(await rejected(local, ...activate(a))).toContain('ACTIVATION_FAILED'); // no local server
  for (const args of [[], ['--revision', 'HEAD'], ['--revision', a, '--remote'], ['--revision', a, '--url', 'http://elsewhere']]) {
    expect(await rejected(local, 'scripts/activate-public-content.mjs', ...args)).toContain('ACTIVATION_FAILED');
  }
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  const worker = local.start('dev:worker');
  await local.ready(worker, 'http://127.0.0.1:8787/api/health');
  expect(await health()).toEqual({ status: 503, body: { status: 'unavailable' } });
  const buildA = JSON.parse(await run(local, 'scripts/build-public-content.mjs', '--revision', a));
  const assetPathA = `/assets/resources-catalog.${buildA.catalogHash}.json`;
  const assetA = await fetch(`http://127.0.0.1:5173${assetPathA}`);
  expect(assetA.headers.get('cache-control')).toContain('immutable');
  const bytesA = await assetA.text();
  expect(JSON.parse(bytesA).payload.catalogRevision).toBe(a);
  expect(bytesA).toBe(readFileSync(join(local.project, 'dist/public-content', buildA.catalogHash, assetPathA.slice(1)), 'utf8'));
  const diskA = join(local.project, 'dist/public-content', buildA.catalogHash, assetPathA.slice(1));
  const hardLink = join(local.project, 'otherwise-valid-catalog.json');
  linkSync(diskA, hardLink);
  const denied = await fetch(`http://127.0.0.1:5173${assetPathA}`);
  expect(denied.status).toBe(404);
  expect(await denied.text()).not.toContain(bytesA);
  expect(readFileSync(diskA, 'utf8')).toBe(bytesA);
  rmSync(hardLink);
  expect((await fetch(`http://127.0.0.1:5173${assetPathA}`)).status).toBe(200);
  // A reachable but mismatching HTTP asset must fail even with valid disk bytes.
  writeFileSync(join(local.project, 'vite.config.ts'), readFileSync(join(local.project, 'vite.config.ts'), 'utf8').replace('plugins: [react(),', "plugins: [{name:'synthetic-mismatch',configureServer(s){s.middlewares.use((q,r,n)=>{if(q.url?.startsWith('/assets/resources-catalog.')){r.end('{}');}else n();});}}, react(),"));
  await expect.poll(async () => (await fetch(`http://127.0.0.1:5173${assetPathA}`)).text()).toBe('{}');
  expect(await rejected(local, ...activate(a))).toContain('ACTIVATION_FAILED');
  expect(await health()).toEqual({ status: 503, body: { status: 'unavailable' } });
  cpSync(join(root, 'vite.config.ts'), join(local.project, 'vite.config.ts'));
  await expect.poll(async () => (await fetch(`http://127.0.0.1:5173${assetPathA}`)).text()).toBe(bytesA);
  const cliPath = join(local.project, 'scripts/activate-public-content.mjs');
  const cli = readFileSync(cliPath, 'utf8');
  writeFileSync(cliPath, cli.replace('    await activatePublicContent(root, args[1], proxy.env.DB);', `    const originalDispose = proxy.dispose.bind(proxy);
    proxy.dispose = async () => { await originalDispose(); throw new Error('PRIVATE_DISPOSAL_FAILURE'); };
    await activatePublicContent(root, args[1], proxy.env.DB);`));
  const disposalFailure = await rejected(local, ...activate(a));
  expect(disposalFailure.trim()).toBe('{"ok":false,"diagnostics":[{"code":"ACTIVATION_FAILED","document":null}]}');
  expect((await health()).body.catalogRevision).toBe(a); // commit survived cleanup failure
  writeFileSync(cliPath, cli);
  expect(await run(local, ...activate(a))).toContain('"ok":true');
  const readyA = await health();
  expect(readyA).toEqual({ status: 200, body: { status: 'ok', catalogRevision: a, catalogHash: buildA.catalogHash, catalogAssetPath: assetPathA } });
  checkout(b);
  const buildB = JSON.parse(await run(local, 'scripts/build-public-content.mjs', '--revision', b));
  const diskB = join(local.project, 'dist/public-content', buildB.catalogHash, `assets/resources-catalog.${buildB.catalogHash}.json`);
  const bytesB = readFileSync(diskB);
  writeFileSync(diskB, '{}');
  expect(await rejected(local, ...activate(b))).toContain('ACTIVATION_FAILED');
  expect(await health()).toEqual(readyA);
  writeFileSync(diskB, bytesB);
  // Untrusted worktree content cannot be assigned the pinned revision.
  writeFileSync(join(local.project, 'content/public/a.md'), 'invalid private source');
  const failure = await rejected(local, ...activate(b));
  expect(failure).not.toContain('private source');
  expect(await health()).toEqual(readyA);
  checkout(b);
  expect(await run(local, ...activate(b))).toContain('"ok":true');
  expect((await health()).body.catalogRevision).toBe(b);
  checkout(a);
  await run(local, ...activate(a));
  expect(await health()).toEqual(readyA);
  expect(await (await fetch(`http://127.0.0.1:5173${assetPathA}`)).text()).toBe(bytesA);
  expect(await (await fetch(`http://127.0.0.1:5173/assets/resources-catalog.${buildB.catalogHash}.json`)).text()).toBe(bytesB.toString());
  for (const path of [`${assetPathA}?anything`, '/assets/resources-catalog.bad.json', '/search-artifacts.bad.json', '/dist/public-content', '/content/private/preparation.md']) {
    expect([403,404]).toContain((await fetch(`http://127.0.0.1:5173${path}`)).status);
  }
});

test('real D1 transactional faults, FTS and independent Worker snapshot races', async ({ local }) => {
  const { a, b, metadataOnly } = prepare(local);
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  const output = await run(local, 'tests/e2e/publication-runtime.mjs', a, b, metadataOnly);
  console.log(output.trim());
  expect(output).toContain('PASS: first/replacement SQL faults');
  expect(output).toContain('interleaved independent-workerd snapshots');
});


test('approved fictional corpus pinned source activates without relabeling application revision', async ({ local }) => {
  prepare(local);
  const sourceRevision = '4323afe312f43b6b87a014abee062e03e12f6022';
  const applicationRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  // Fetch only from the local repository object store; no network or hosted D1.
  execFileSync('git', ['-c', 'protocol.file.allow=always', 'fetch', '--no-tags', root, sourceRevision], { cwd: local.project, env: local.env, stdio: 'pipe' });
  rmSync(join(local.project, 'content/public'), { recursive: true });
  execFileSync('git', ['restore', '--source', sourceRevision, '--worktree', 'content/public'], { cwd: local.project, env: local.env });
  await run(local, 'scripts/local-d1.mjs', 'init');
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  const worker = local.start('dev:worker');
  await local.ready(worker, 'http://127.0.0.1:8787/api/health');
  expect(await health()).toEqual({ status: 503, body: { status: 'unavailable' } });
  const build = JSON.parse(await run(local, 'scripts/build-public-content.mjs', '--revision', sourceRevision));
  await run(local, ...activate(sourceRevision));
  const ready = await health();
  expect(ready.status).toBe(200);
  expect(ready.body.catalogRevision).toBe(sourceRevision);
  expect(ready.body.catalogHash).toBe(build.catalogHash);
  expect(sourceRevision).not.toBe(applicationRevision);
  console.log(JSON.stringify({ sourceRevision, applicationRevision, catalogHash: build.catalogHash, searchHash: build.searchHash }));
});
