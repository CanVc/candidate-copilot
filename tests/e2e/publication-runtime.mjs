import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createTestHarness } from 'wrangler';
import { assemblePublicArtifacts } from '../../tools/public-content/build.ts';
import { activatePublicContent } from '../../tools/public-content/activate.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';

const root = process.cwd();
const [a, b, metadataOnly] = process.argv.slice(2);
const checkout = (revision) => execFileSync('git', ['restore', '--source', revision, '--worktree', 'content/public'], { cwd: root });
const config = {
  main: join(root, 'tests/e2e/publication-worker.ts'), compatibility_date: '2026-06-11', send_metrics: false,
  d1_databases: [{ binding: 'DB', database_name: 'candidate-copilot-local', database_id: '00000000-0000-0000-0000-000000000000', remote: false, migrations_dir: join(root, 'migrations') }],
};
const server = createTestHarness({ root: join(root, 'tests/e2e'), workers: [
  { config: { ...config, name: 'reader-one' } }, { config: { ...config, name: 'reader-two' } },
] });
try {
  await server.listen();
  const one = server.getWorker('reader-one');
  const two = server.getWorker('reader-two');
  await one.applyD1Migrations('DB');
  const { DB: db } = await one.getEnv();
  const read = async (worker) => (await worker.fetch('http://local/snapshot')).json();
  const health = async (worker, status) => {
    const response = await worker.fetch('http://local/api/health');
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    if (status === 503) assert.deepEqual(body, { status: 'unavailable' });
    return body;
  };
  const expectedPublication = (revision) => {
    const bundle = assemblePublicArtifacts(root, revision);
    const catalogAssetPath = `/assets/resources-catalog.${bundle.catalogHash}.json`;
    const { payload } = JSON.parse(bundle.files[catalogAssetPath.slice(1)]);
    const { documents, chunks } = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]);
    return { catalogRevision: revision, catalogHash: bundle.catalogHash, catalogAssetPath, catalog: payload, documents, chunks };
  };
  const assertPublication = async (expected) => {
    for (const worker of [one, two]) {
      assert.deepEqual(await read(worker), expected, 'complete returned catalog/evidence must match pinned artifacts, not reader baselines');
      const { catalogRevision, catalogHash, catalogAssetPath } = expected;
      assert.deepEqual(await health(worker, 200), { status: 'ok', catalogRevision, catalogHash, catalogAssetPath });
    }
  };
  const tables = ['active_publication', 'public_resources', 'public_resource_documents', 'public_documents', 'public_chunks', 'public_chunks_fts', 'unrelated_fixture'];
  const dump = async () => JSON.stringify((await db.batch(tables.map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1, 2`)))).map((r) => r.results));
  await db.prepare("CREATE TABLE unrelated_fixture (id INTEGER, value TEXT); ").run();
  await db.prepare("INSERT INTO unrelated_fixture VALUES (1, 'historical visitor sentinel')").run();
  checkout(a);
  await health(one, 503);
  await health(two, 503);
  const empty = await dump();
  await db.prepare("CREATE TRIGGER activation_fault BEFORE INSERT ON public_chunks BEGIN SELECT RAISE(ABORT, 'synthetic fault'); END").run();
  await assert.rejects(activatePublicContent(root, a, db));
  assert.equal(await dump(), empty);
  await health(one, 503);
  await db.prepare('DROP TRIGGER activation_fault').run();
  const expectedA = expectedPublication(a);
  await activatePublicContent(root, a, db);
  await assertPublication(expectedA);
  assert.deepEqual(expectedA.documents.find((d) => d.documentId === 'd-a').metadata.topics, ['']);
  assert.deepEqual(expectedA.documents.find((d) => d.documentId === 'd-a').metadata.aliases, ['   ']);
  assert(expectedA.documents.some((d) => d.documentId === 'd-empty'));
  assert.equal(expectedA.chunks.filter((c) => c.documentId === 'd-empty').length, 0);
  const snapshotA = await read(one);
  assert(snapshotA && snapshotA.catalogRevision === a);
  assert.deepEqual(await read(two), snapshotA, 'independent workerd instances must share D1');
  const baseline = await dump();
  checkout(b);
  await db.prepare("CREATE TRIGGER activation_fault BEFORE INSERT ON active_publication BEGIN SELECT RAISE(ABORT, 'synthetic fault'); END").run();
  await assert.rejects(activatePublicContent(root, b, db));
  assert.equal(await dump(), baseline);
  assert.deepEqual(await read(two), snapshotA);
  assert((await db.prepare("SELECT chunk_id FROM public_chunks_fts WHERE public_chunks_fts MATCH 'Alpha'").all()).results.length > 0);
  assert.equal((await db.prepare("SELECT chunk_id FROM public_chunks_fts WHERE public_chunks_fts MATCH 'Beta'").all()).results.length, 0);
  await db.prepare('DROP TRIGGER activation_fault').run();
  const expectedB = expectedPublication(b);
  await activatePublicContent(root, b, db);
  await assertPublication(expectedB);
  const snapshotB = await read(two);
  assert(snapshotB && snapshotB.catalogRevision === b);
  assert((await db.prepare("SELECT chunk_id FROM public_chunks_fts WHERE public_chunks_fts MATCH 'Beta'").all()).results.length > 0);
  assert.equal((await db.prepare("SELECT chunk_id FROM public_chunks_fts WHERE public_chunks_fts MATCH 'Alpha'").all()).results.length, 0);
  let observing = true;
  let observations = 0;
  const observedRevisions = new Set();
  const observer = async (worker) => {
    while (observing) {
      const snapshot = await read(worker);
      assert(snapshot, 'active replacement cannot become unavailable');
      assert.deepEqual(snapshot, snapshot.catalogRevision === a ? snapshotA : snapshotB);
      const h = await health(worker, 200);
      assert([a,b].includes(h.catalogRevision));
      assert.equal(h.catalogAssetPath, `/assets/resources-catalog.${h.catalogHash}.json`);
      observedRevisions.add(snapshot.catalogRevision);
      observations++;
    }
  };
  const readers = [observer(one), observer(two)];
  try {
    for (const revision of [a, b, a, b, a, a]) { checkout(revision); await activatePublicContent(root, revision, db); }
  } finally { observing = false; await Promise.all(readers); }
  assert(observations >= 2);
  assert.deepEqual([...observedRevisions].sort(), [a, b].sort());
  assert.deepEqual(await read(two), snapshotA, 'explicit A→B→A rollback and repeated activation');
  assert.deepEqual((await db.prepare('SELECT * FROM unrelated_fixture').all()).results, [{ id: 1, value: 'historical visitor sentinel' }]);
  for (const [method, path] of [['POST','/api/health'], ['POST','/api/publication'], ['DELETE','/api/publication'], ['GET','/content/private/test.md']]) {
    assert.equal((await one.fetch(`http://local${path}`, { method })).status, 404);
  }
  assert.deepEqual(await read(one), snapshotA);
  // Corrupted authority, registry, mappings, chunks and FTS all fail closed.
  for (const sql of [
    'DELETE FROM active_publication',
    "UPDATE active_publication SET catalog_hash = '" + 'f'.repeat(64) + "'",
    "UPDATE active_publication SET modified_at = 'invalid'",
    'DELETE FROM public_resource_documents',
    "UPDATE public_documents SET document_json = '{}'",
    'DELETE FROM public_chunks',
    "UPDATE public_chunks SET chunk_json = '{}'",
    'DELETE FROM public_chunks_fts',
    `UPDATE public_chunks SET chunk_json = json_set(chunk_json, '$.sourceRevision', '${b}') WHERE chunk_id = '${expectedA.chunks[0].chunkId}'`,
    `UPDATE public_chunks SET chunk_json = json_set(chunk_json, '$.ordinal', 123) WHERE chunk_id = '${expectedA.chunks[0].chunkId}'`,
    `UPDATE public_chunks SET chunk_json = json_set(chunk_json, '$.contentHash', '${'0'.repeat(64)}') WHERE chunk_id = '${expectedA.chunks[0].chunkId}'`,
    `UPDATE public_chunks_fts SET text = 'Valid shaped but incorrect FTS text' WHERE chunk_id = '${expectedA.chunks[0].chunkId}'`,
  ]) {
    await db.prepare(sql).run();
    assert.equal(await new D1ResourceCatalog(db).readSnapshot(), null);
    for (const worker of [one, two]) {
      assert.equal(await read(worker), null);
      await health(worker, 503);
    }
    await activatePublicContent(root, a, db);
  }
  await assert.rejects(db.prepare("INSERT INTO active_publication VALUES (2, ?, ?, 'now')").bind(a, snapshotA.catalogHash).run());
  checkout(metadataOnly);
  const expectedEmptyEvidence = expectedPublication(metadataOnly);
  assert(expectedEmptyEvidence.documents.length > 0);
  assert.deepEqual(expectedEmptyEvidence.chunks, []);
  await activatePublicContent(root, metadataOnly, db);
  await assertPublication(expectedEmptyEvidence);
  assert.deepEqual((await db.prepare('SELECT chunk_count FROM public_documents').all()).results,
    expectedEmptyEvidence.documents.map(() => ({ chunk_count: 0 })));
  await db.batch(['DELETE FROM public_resource_documents', 'DELETE FROM public_documents'].map((sql) => db.prepare(sql)));
  for (const worker of [one, two]) { assert.equal(await read(worker), null); await health(worker, 503); }

  // Runtime §1 and the independent fixed vectors already checked by tooling.
  // Populate D1 directly: these zero-SHA fixtures are not production provenance.
  const golden = { version: 1, catalogRevision: '0'.repeat(40), resources: [{ resourceId: 'p-a', name: 'A', description: 'Test', documentIds: ['d-a'] }],
    documents: [{ documentId: 'd-a', sourcePath: 'content/public/a.md' }] };
  const vectors = [
    [golden, 'aefae89a06c759fbf9b82ef17b8f57e532731af585f0df1f138cfda52c897223'],
    [{ ...golden, catalogRevision: '1'.repeat(40) }, '5bf7de9e47dc0e4d86779fa1eba631dfba02071f43c03bf841e611b4870bdde5'],
    [{ ...golden, documents: [...golden.documents, { documentId: 'd-b', sourcePath: 'content/public/b.md' }],
      resources: [{ ...golden.resources[0], documentIds: ['d-a', 'd-b'] }] }, 'b082fdb035dd1d4146a06a70fc32b2cf7d19103f6507e8550f2ffa068ce91d37'],
    [{ ...golden, resources: [{ ...golden.resources[0], name: 'École "😀"\\\n', description: 'e\u0301 / é' }] }, '39e2512c86395c7abde8b2c451d6e732964957b375637d1f457718a98e91c31d'],
    // UTF-16 entity order and shared overlapping maps; digest independently
    // calculated with Python hashlib over the explicitly ordered JSON payload.
    [{ ...golden,
      documents: [{ documentId: 'a', sourcePath: 'content/public/a.md' }, { documentId: '😀', sourcePath: 'content/public/b.md' }, { documentId: '\ue000', sourcePath: 'content/public/c.md' }],
      resources: ['a', 'z'].map((resourceId) => ({ resourceId, name: 'é"\\\n', description: 'Test', documentIds: ['a', '😀', '\ue000'] })),
    }, 'f2a7ae2d27ea58ba26bb2da74d0f248d4663b2989670cedac9a4dcd86dc52ec3'],
  ];
  for (const [catalog, catalogHash] of vectors) {
    for (const reverse of [false, true]) {
      const reorder = (items) => reverse ? items.toReversed() : items;
      const statements = ['public_chunks_fts', 'public_chunks', 'public_resource_documents', 'public_resources', 'public_documents', 'active_publication']
        .map((table) => db.prepare(`DELETE FROM ${table}`));
      for (const d of reorder(catalog.documents)) {
        const metadata = { document_id: d.documentId, visibility: 'public', title: 'Synthetic vector',
          created_at: '2024-01-01T00:00:00Z', modified_at: '2024-01-01T00:00:00Z', reviewed_at: '2024-01-01T00:00:00Z', reviewed_by: 'SYNTHETIC TEST ONLY' };
        const document = { ...d, sourceRevision: catalog.catalogRevision, sourceTitle: metadata.title, metadata };
        statements.push(db.prepare('INSERT INTO public_documents VALUES (?, ?, ?, 0)').bind(d.documentId, d.sourcePath, JSON.stringify(document)));
      }
      for (const r of reorder(catalog.resources)) {
        statements.push(db.prepare('INSERT INTO public_resources VALUES (?, ?, ?)').bind(r.resourceId, r.name, r.description));
        for (const id of reorder(r.documentIds)) statements.push(db.prepare('INSERT INTO public_resource_documents VALUES (?, ?)').bind(r.resourceId, id));
      }
      statements.push(db.prepare('INSERT INTO active_publication VALUES (1, ?, ?, ?)').bind(catalog.catalogRevision, catalogHash, '2024-01-01T00:00:00Z'));
      await db.batch(statements);
      for (const worker of [one, two]) {
        const snapshot = await read(worker);
        assert(snapshot, `fixed digest ${catalogHash} must be accepted in workerd`);
        assert.deepEqual(snapshot.catalog, catalog);
        assert.deepEqual(snapshot.chunks, []);
        assert.equal(snapshot.catalogHash, catalogHash);
        assert.deepEqual(await health(worker, 200), { status: 'ok', catalogRevision: catalog.catalogRevision,
          catalogHash, catalogAssetPath: `/assets/resources-catalog.${catalogHash}.json` });
      }
    }
  }
  console.log(`PASS: first/replacement SQL faults, FTS, rollback, unchanged unrelated data, fail-closed corruption, read-only routes; ${observations} interleaved independent-workerd snapshots.`);
} finally { await server.close(); }
