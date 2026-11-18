import assert from 'node:assert/strict';
import { join } from 'node:path';
import { createTestHarness } from 'wrangler';
import { assemblePublicArtifacts } from '../../tools/public-content/build.ts';
import { installEvaluationPublication, evaluateRetrieval } from '../../tools/retrieval/evaluate.ts';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const [a, b] = process.argv.slice(2);
const config = {
  main: join(root, 'tests/e2e/retrieval-worker.ts'), compatibility_date: '2026-06-11', send_metrics: false,
  d1_databases: [{ binding: 'DB', database_name: 'retrieval-disposable', database_id: '00000000-0000-0000-0000-000000000000', remote: false, migrations_dir: join(root, 'migrations') }],
};
const server = createTestHarness({ root: join(root, 'tests/e2e'), workers: [
  { config: { ...config, name: 'reader-one' } }, { config: { ...config, name: 'reader-two' } },
] });
try {
  await server.listen();
  const one = server.getWorker('reader-one'), two = server.getWorker('reader-two');
  await one.applyD1Migrations('DB');
  const { DB: db } = await one.getEnv();
  const request = { resolvedQuestion: 'What Alpha evidence is eligible?', searchTerms: ['Alpha'], eligibleDocumentIds: ['d-a', 'd-c'] };
  const read = async (worker, input = request, limits = { topK: 2, textBudget: 12000 }) => {
    const response = await worker.fetch('http://local/test-only', { method: 'POST', body: JSON.stringify({ input, limits }) });
    return { status: response.status, body: await response.json() };
  };
  const unavailable = async (input = request) => {
    for (const worker of [one, two]) assert.deepEqual(await read(worker, input), { status: 503, body: { error: 'retrieval_unavailable' } });
  };
  const bundle = (revision) => {
    execFileSync('git', ['restore', '--source', revision, '--worktree', 'content/public'], { cwd: root });
    return assemblePublicArtifacts(root, revision);
  };
  const bundleA = bundle(a), bundleB = bundle(b);
  const evidence = (bundle) => JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]);
  const artifactA = evidence(bundleA), artifactB = evidence(bundleB);
  const artifactResult = (artifact, passages) => ({ status: 200, body: { chunks: passages.map(([documentId, ordinal], index) => {
    const c = artifact.chunks.find((c) => c.documentId === documentId && c.ordinal === ordinal);
    assert(c, `pinned fixture passage ${documentId}/${ordinal} must exist`);
    const { chunkId, sourcePath, sourceRevision, contentHash, sourceTitle, sectionTitle, text, location } = c;
    return { chunkId, documentId, sourcePath, sourceRevision, contentHash, sourceTitle, sectionTitle, text, location, rank: index + 1 };
  }) } });
  const baselinePassages = [['d-a', 1], ['d-c', 1]];
  await unavailable(); // migrated but uninitialized
  await installEvaluationPublication(db, bundleA);
  await db.prepare('CREATE TABLE unrelated_fixture (id INTEGER, value TEXT)').run();
  await db.prepare("INSERT INTO unrelated_fixture VALUES (1, 'retained sentinel')").run();
  const dump = async () => JSON.stringify((await db.batch(['active_publication', 'public_resources', 'public_resource_documents', 'public_documents', 'public_chunks', 'public_chunks_fts', 'unrelated_fixture'].map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1, 2`)))).map((r) => r.results));
  const baseline = await dump();
  const expectedA = artifactResult(artifactA, baselinePassages);
  assert.equal(expectedA.body.chunks.length, 2);
  assert.deepEqual(expectedA.body.chunks.map((c) => c.documentId), ['d-a', 'd-c'], 'equal text uses deterministic document tie order');
  const global = (await db.prepare(`SELECT c.document_id FROM public_chunks_fts JOIN public_chunks c ON c.chunk_id = public_chunks_fts.chunk_id
    WHERE public_chunks_fts MATCH '"Alpha"' ORDER BY bm25(public_chunks_fts)`).all()).results;
  assert(global.slice(0, 6).every((r) => r.document_id.startsWith('excluded-')), 'at least six excluded distractors outrank eligible passages');
  for (const worker of [one, two]) {
    assert.deepEqual(await read(worker), expectedA);
    assert(expectedA.body.chunks.every((c) => c.text.includes('Fiction unrelated to BC')));
    for (const input of [
      { ...request, eligibleDocumentIds: [] },
      { ...request, eligibleDocumentIds: ['d-a', 'withdrawn'] },
      { ...request, eligibleDocumentIds: [''] },
      { ...request, eligibleDocumentIds: ['d-a\" OR 1=1 --'] },
    ]) assert.deepEqual(await read(worker, input), { status: 503, body: { error: 'retrieval_unavailable' } });
    for (const searchTerms of [[], ['" * -- 😀'], ['zzznomatchzzz']]) {
      assert.deepEqual(await read(worker, { ...request, searchTerms }), { status: 200, body: { chunks: [] } });
    }
    assert.deepEqual(await read(worker, { ...request, eligibleDocumentIds: ['d-empty'] }), { status: 200, body: { chunks: [] } });
    assert.deepEqual(await read(worker, { ...request, searchTerms: ['Alpha" OR text:NEAR(foo) * ; SELECT DROP TABLE --'] }), expectedA);
    assert.deepEqual(await read(worker, { ...request, eligibleDocumentIds: ['d-c', 'd-a', 'd-a'] }), expectedA);
    assert.deepEqual(await read(worker, request, { topK: 1, textBudget: 12000 }), artifactResult(artifactA, [['d-a', 1]]));
    const size = expectedA.body.chunks[0].text.length;
    assert.deepEqual(await read(worker, request, { topK: 2, textBudget: size }), artifactResult(artifactA, [['d-a', 1]]));
    assert.deepEqual(await read(worker, request, { topK: 2, textBudget: size - 1 }), { status: 200, body: { chunks: [] } });
  }
  // Independent fixture expectations: not ranked/selected by adapter code or a duplicate ORDER BY oracle.
  const ordinalPassages = [['d-ordinal-1', 1], ['d-ordinal-1', 2]];
  const ordinalChunks = artifactResult(artifactA, ordinalPassages).body.chunks;
  assert.equal(ordinalChunks[0].text, ordinalChunks[1].text, 'identical text yields an equal BM25 score');
  assert(ordinalChunks[0].chunkId > ordinalChunks[1].chunkId, 'chunk-ID order must oppose ordinal order');
  const scoreRows = async (word) => (await db.prepare(`SELECT c.document_id, bm25(public_chunks_fts) AS score
    FROM public_chunks_fts JOIN public_chunks c ON c.chunk_id = public_chunks_fts.chunk_id
    WHERE public_chunks_fts MATCH ?`).bind(`"${word}"`).all()).results;
  const rankingScores = await scoreRows('Scoreprobe');
  assert(rankingScores.find((r) => r.document_id === 'd-rank-z-strong').score < rankingScores.find((r) => r.document_id === 'd-rank-a-weak').score,
    'strong eligible winner has strictly better BM25 despite later document ID');
  const budgetPassages = [['d-budget-a-large', 1], ['d-budget-b-small', 1], ['d-budget-c-small', 1]];
  const budgetChunks = artifactResult(artifactA, budgetPassages).body.chunks;
  const smallBudget = budgetChunks[1].text.length + budgetChunks[2].text.length;
  assert(budgetChunks[0].text.length > smallBudget);
  const budgetScores = await scoreRows('Budgetprobe');
  assert(budgetScores.find((r) => r.document_id === 'd-budget-a-large').score < budgetScores.find((r) => r.document_id === 'd-budget-b-small').score);
  for (const worker of [one, two]) {
    assert.deepEqual(await read(worker, { ...request, searchTerms: ['Tieprobe'], eligibleDocumentIds: ['d-ordinal-1'] }), artifactResult(artifactA, ordinalPassages));
    assert.deepEqual(await read(worker, { ...request, searchTerms: ['Scoreprobe'], eligibleDocumentIds: ['d-rank-a-weak', 'd-rank-z-strong'] }, { topK: 1, textBudget: 12000 }),
      artifactResult(artifactA, [['d-rank-z-strong', 1]]));
    const budgetRequest = { ...request, searchTerms: ['Budgetprobe'], eligibleDocumentIds: budgetPassages.map(([id]) => id) };
    assert.deepEqual(await read(worker, budgetRequest, { topK: 3, textBudget: 12000 }), artifactResult(artifactA, budgetPassages));
    assert.deepEqual(await read(worker, budgetRequest, { topK: 2, textBudget: smallBudget }), artifactResult(artifactA, budgetPassages.slice(1)),
      'skip higher-ranked oversized text; retain both later passages whole, ranked 1 and 2');
  }
  assert.equal(await dump(), baseline, 'all searches and failed scopes are read-only');
  await installEvaluationPublication(db, bundleB);
  const expectedB = artifactResult(artifactB, baselinePassages);
  assert.notDeepEqual(expectedB, expectedA);
  assert.deepEqual(await read(two), expectedB);
  let observing = true, observations = 0;
  const observed = new Set();
  const milestones = new Map([one, two].map((worker) => [worker, new Map()]));
  let readerFailure;
  const observe = async (worker) => {
    while (observing) {
      const result = await read(worker);
      assert.equal(result.status, 200, 'atomic replacement must not make evidence unavailable');
      const revision = result.body.chunks[0].sourceRevision;
      assert([a, b].includes(revision));
      assert.deepEqual(result, revision === a ? expectedA : expectedB, 'never mixed identity/text/hash/revision');
      const seen = milestones.get(worker);
      seen.set(revision, (seen.get(revision) ?? 0) + 1);
      observed.add(revision); observations++;
    }
  };
  const readers = [observe(one), observe(two)].map((reader) => reader.catch((error) => { readerFailure = error; }));
  try {
    for (const publication of [bundleA, bundleB, bundleA, bundleB, bundleA]) {
      const revision = evidence(publication).catalogRevision;
      const before = [one, two].map((worker) => milestones.get(worker).get(revision) ?? 0);
      await installEvaluationPublication(db, publication);
      const deadline = Date.now() + 5000;
      while ([one, two].some((worker, index) => (milestones.get(worker).get(revision) ?? 0) <= before[index])) {
        if (readerFailure) throw readerFailure;
        assert(Date.now() < deadline, `both independent readers must observe ${revision} within five seconds`);
        await delay(5);
      }
    }
  } finally { observing = false; await Promise.all(readers); }
  if (readerFailure) throw readerFailure;
  assert(observations >= 2);
  assert.deepEqual([...observed].sort(), [a, b].sort());
  for (const sql of [
    'DELETE FROM active_publication',
    "UPDATE active_publication SET catalog_hash = '" + '0'.repeat(64) + "'",
    "UPDATE public_documents SET document_json = '{}' WHERE document_id = 'excluded-0'",
    'DELETE FROM public_resource_documents',
    "UPDATE public_chunks SET chunk_json = '{}' WHERE document_id = 'excluded-0'",
    "UPDATE public_chunks_fts SET text = 'corrupt' WHERE chunk_id = '" + artifactA.chunks[0].chunkId + "'",
    'DELETE FROM public_chunks_fts',
  ]) {
    await db.prepare(sql).run();
    await unavailable();
    await unavailable({ ...request, searchTerms: [] });
    await installEvaluationPublication(db, bundleA);
  }
  // A D1 SQL fault is redacted just like corruption, without partial evidence.
  await db.prepare('ALTER TABLE public_chunks RENAME TO unavailable_chunks').run();
  await unavailable();
  await db.prepare('ALTER TABLE unavailable_chunks RENAME TO public_chunks').run();
  assert.deepEqual((await db.prepare('SELECT * FROM unrelated_fixture').all()).results, [{ id: 1, value: 'retained sentinel' }]);

  // Actual approved-corpus engine evaluation in this same disposable real D1.
  const fixtures = JSON.parse(readFileSync(join(root, 'tests/fixtures/retrieval/cases.json'), 'utf8'));
  const approved = bundle(fixtures.sourceRevision);
  const report = await evaluateRetrieval(db, fixtures, approved, a);
  assert.equal(report.results.length, fixtures.cases.length);
  assert.equal(report.negativeHits, 0);
  assert(report.results.every((r) => r.emptyExpectationMet));
  const corpusDocument = {
    mission: '0eaf8b1d-791d-4c60-9234-168a6a03acbd',
    prototype: '87ddaeda-8ee4-4056-9931-5ebf7b677875',
    reperage: 'a53a192f-51d5-4537-8200-427a09ee1ea3',
  };
  const p = (document, sectionTitle) => ({ documentId: corpusDocument[document], sectionTitle });
  const measuredExpectations = [
    ['fr-mesures', [p('reperage', 'Résultats démontrés et limites')], []],
    ['en-results', [], [p('reperage', 'Résultats démontrés et limites')]],
    ['corporate', [], [p('mission', 'Autonomie et collaboration')]],
    ['paraphrase', [], [p('reperage', 'Solution et choix importants')]],
    ['named-project', [p('prototype', 'État du projet et usages réels')], []],
    ['resolved-follow-up', [p('reperage', 'État du projet et usages réels')], []],
    ['missing-salary', [p('mission', 'Contraintes structurantes')], []],
    ['missing-roi', [p('reperage', 'Résultats démontrés et limites')], []],
    ['missing-current-use', [p('prototype', 'État du projet et usages réels')], []],
    ['no-match', [], []], ['no-tokens', [], []],
    ['scoped-exclusion', [], [p('prototype', 'Résultats démontrés et limites')]],
  ];
  assert.deepEqual(report.results.map((r) => [r.id, r.found, r.missed]), measuredExpectations,
    'known pinned-corpus passage outcomes are independent of scorer output');
  assert.equal(report.foundPassages, 6);
  assert.equal(report.requiredPassages, 10);
  const artifact = evidence(approved);
  for (const fixture of fixtures.cases) {
    const { resolvedQuestion, searchTerms, eligibleDocumentIds } = fixture;
    for (const worker of [one, two]) {
      const result = await read(worker, { resolvedQuestion, searchTerms, eligibleDocumentIds }, report.limits);
      const evaluated = report.results.find((r) => r.id === fixture.id);
      assert.deepEqual(result, { status: 200, body: { chunks: evaluated.chunks } });
      for (const c of result.body.chunks) {
        const pinned = artifact.chunks.find((p) => p.chunkId === c.chunkId);
        for (const key of Object.keys(c).filter((key) => key !== 'rank')) assert.deepEqual(c[key], pinned[key]);
      }
    }
  }
  console.log(`PASS: real D1 retrieval matrix, six dominant excluded distractors, pinned artifact provenance, redacted corruption/faults, ${observations} independent-reader race observations; ${report.results.length} approved fictional evaluation cases.`);
} finally { await server.close(); }
