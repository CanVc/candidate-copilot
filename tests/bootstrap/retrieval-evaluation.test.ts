import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { evaluateRetrieval, type RetrievalCases } from '../../tools/retrieval/evaluate.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import type { ArtifactBundle } from '../../tools/public-content/build.ts';
import type { PublicChunk, PublicSearchArtifacts } from '../../src/shared/public-evidence.ts';

const revision = 'a'.repeat(40);
const passage = { documentId: 'd-a', sectionTitle: 'Evidence' };
const chunk = { ...passage, chunkId: 'b'.repeat(64), sourcePath: 'content/public/a.md', sourceRevision: revision,
  contentHash: 'c'.repeat(64), sourceTitle: 'Fiction', text: 'Fiction unrelated to BC.', location: 'lines:1-2',
  ordinal: 0, passage: { start: 1, end: 2 }, context: [], metadata: {
    document_id: 'd-a', visibility: 'public', title: 'Fiction', created_at: '2024-01-01T00:00:00Z',
    modified_at: '2024-01-01T00:00:00Z', reviewed_by: 'Synthetic test', reviewed_at: '2024-01-01T00:00:00Z',
  } } satisfies PublicChunk;
const fixtures: RetrievalCases = { version: 1, sourceRevision: revision, cases: [{ id: 'test', category: 'unit',
  resolvedQuestion: 'Evidence?', searchTerms: ['evidence'], eligibleDocumentIds: ['d-a'], requiredPassages: [passage],
  negativePassages: [], expectEmpty: false, limitation: 'Test only.' }] };
const search = { version: 1, chunkingVersion: 1, catalogRevision: revision, catalogHash: 'catalog',
  documents: [{ documentId: 'd-a', sourcePath: chunk.sourcePath, sourceRevision: revision,
    sourceTitle: chunk.sourceTitle, metadata: chunk.metadata }], chunks: [chunk] } satisfies PublicSearchArtifacts;
const bundle: ArtifactBundle = { catalogHash: 'catalog', searchHash: 'search', files: {
  'search-artifacts.search.json': JSON.stringify(search),
  'assets/resources-catalog.catalog.json': JSON.stringify({ payload: { resources: [] } }),
} };
const db = { prepare() { return { bind() { return this; } }; }, async batch() { return []; } } as unknown as D1Database;
afterEach(() => vi.restoreAllMocks());

describe('tools/retrieval/evaluate.ts', () => {
  it.each(['requiredPassages', 'negativePassages'] as const)('rejects misspelled %s before any retrieval/scoring', async (field) => {
    const retrieve = vi.spyOn(D1Retriever.prototype, 'retrieve');
    const typo = { ...fixtures.cases[0]!, id: 'typo', [field]: [{ ...passage, sectionTitle: 'Evidnce' }] };
    await expect(evaluateRetrieval(db, { ...fixtures, cases: [fixtures.cases[0]!, typo] }, bundle, revision)).rejects.toThrow('EVALUATION_FAILED');
    expect(retrieve).not.toHaveBeenCalled();
  });
  it.each([0, 2, NaN])('rejects a non-sequential first rank %s independently of artifact provenance', async (rank) => {
    vi.spyOn(D1Retriever.prototype, 'retrieve').mockResolvedValue({ chunks: [{ ...chunk, rank }] });
    await expect(evaluateRetrieval(db, fixtures, bundle, revision)).rejects.toThrow('EVALUATION_FAILED');
  });
  it('rejects duplicate or skipped later ranks', async () => {
    const retrieve = vi.spyOn(D1Retriever.prototype, 'retrieve');
    for (const rank of [1, 3]) {
      retrieve.mockResolvedValue({ chunks: [{ ...chunk, rank: 1 }, { ...chunk, rank }] });
      await expect(evaluateRetrieval(db, fixtures, bundle, revision)).rejects.toThrow('EVALUATION_FAILED');
    }
  });
  it('records genuine recall gaps and mechanical negative failures separately', async () => {
    vi.spyOn(D1Retriever.prototype, 'retrieve').mockResolvedValue({ chunks: [{ ...chunk, rank: 1 }] });
    const report = await evaluateRetrieval(db, { ...fixtures, cases: [{ ...fixtures.cases[0]!, negativePassages: [passage], expectEmpty: true }] }, bundle, revision);
    expect(report.foundPassages).toBe(1);
    expect(report.results[0]!.found).toEqual([passage]);
    expect(report.results[0]!.missed).toEqual([]);
    expect(report.negativeHits).toBe(1);
    expect(report.results[0]!.emptyExpectationMet).toBe(false);
    vi.spyOn(D1Retriever.prototype, 'retrieve').mockResolvedValue({ chunks: [] });
    const gap = await evaluateRetrieval(db, fixtures, bundle, revision);
    expect(gap.foundPassages).toBe(0);
    expect(gap.results[0]!.missed).toEqual([passage]);
    expect(gap.negativeHits).toBe(0);
    expect(gap.results[0]!.emptyExpectationMet).toBe(true);
  });
});

it('scripts/evaluate-retrieval.mjs fingerprints only copied bytes and reads installed toolchain/lock identity', () => {
  const directory = mkdtempSync(join(tmpdir(), 'retrieval-fingerprint-test-'));
  try {
    execFileSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import { createHash } from 'node:crypto';
      import { createRequire } from 'node:module';
      import { cpSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
      import { join } from 'node:path';
      import { fingerprintInputs, readEvaluationToolchain } from './scripts/evaluate-retrieval.mjs';
      const directory = process.argv[1], root = process.cwd();
      const original = join(directory, 'original'), copied = join(directory, 'copied');
      mkdirSync(original); writeFileSync(join(original, 'input.txt'), 'executed bytes');
      cpSync(original, copied, { recursive: true });
      writeFileSync(join(original, 'input.txt'), 'changed after copy');
      const expected = createHash('sha256').update('input.txt\\0executed bytes\\0').digest('hex');
      assert.equal(fingerprintInputs(copied, ['input.txt']), expected);
      assert.notEqual(fingerprintInputs(original, ['input.txt']), expected);
      writeFileSync(join(copied, 'input.txt'), 'changed copy');
      assert.notEqual(fingerprintInputs(copied, ['input.txt']), expected);
      const require = createRequire(join(root, 'package.json'));
      const miniflare = createRequire(createRequire(require.resolve('wrangler/package.json')).resolve('miniflare'));
      const identity = readEvaluationToolchain(root);
      assert.equal(identity.wrangler, require('wrangler/package.json').version);
      assert.equal(identity.workerd, miniflare('workerd/package.json').version);
      assert.equal(identity.dependencyLockHash, createHash('sha256').update(readFileSync('package-lock.json')).digest('hex'));
      // Synthetic installed graph proves versions are read, not pinned literals,
      // and workerd follows Miniflare resolution rather than a root-package guess.
      const installed = (path, content) => { const disk = join(copied, path); mkdirSync(disk.slice(0, disk.lastIndexOf('/')), { recursive: true }); writeFileSync(disk, content); };
      installed('package.json', '{}'); installed('package-lock.json', 'synthetic lock bytes');
      installed('node_modules/wrangler/package.json', '{"version":"99.1.2"}');
      installed('node_modules/miniflare/index.js', '');
      installed('node_modules/miniflare/node_modules/workerd/package.json', '{"version":"88.3.4"}');
      installed('node_modules/workerd/package.json', '{"version":"wrong-root"}');
      const synthetic = readEvaluationToolchain(copied);
      assert.equal(synthetic.wrangler, '99.1.2'); assert.equal(synthetic.workerd, '88.3.4');
      assert.equal(synthetic.dependencyLockHash, createHash('sha256').update('synthetic lock bytes').digest('hex'));
    `, directory], { cwd: process.cwd(), stdio: 'pipe' });
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
