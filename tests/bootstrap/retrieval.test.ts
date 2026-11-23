import { describe, expect, it, vi } from 'vitest';
import { retrieveEvidence, retrieveGenerationEvidence, validateRetrievalRequest } from '../../src/application/retrieve-evidence.ts';
import { D1Retriever, encodeLexicalTerms } from '../../src/adapters/d1/retriever.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { RetrievalUnavailable, RetrievalScopeUnavailable, RetrievalDependencyUnavailable, RetrievalLimitExceeded, type RetrievalRequest, type Retriever } from '../../src/ports/Retriever.ts';
import type { PublicPublication } from '../../src/ports/ResourceCatalog.ts';
import type { PublicChunk } from '../../src/shared/public-evidence.ts';

const request: RetrievalRequest = { resolvedQuestion: 'Resolved intent', searchTerms: ['alpha'], eligibleDocumentIds: ['d-a'] };
function database() {
  const statements: { sql: string; values: unknown[] }[] = [];
  const db = { prepare(sql: string) {
    const statement = { sql, values: [] as unknown[], bind(...values: unknown[]) { this.values = values; return this; } };
    statements.push(statement); return statement;
  } } as unknown as D1Database;
  return { db, statements };
}
const chunk = (id: string, text: string): PublicChunk => ({ chunkId: id, documentId: 'd-a', sourcePath: 'content/public/a.md',
  sourceRevision: 'a'.repeat(40), contentHash: 'b'.repeat(64), sourceTitle: 'Fiction', sectionTitle: 'Limits', text,
  location: 'lines:1-2;context:1-1', ordinal: 0, passage: { start: 1, end: 2 }, context: [], metadata: {} as PublicChunk['metadata'] });
function snapshot(chunks: PublicChunk[], ids = ['d-a']) {
  return { publication: { documents: ids.map((documentId) => ({ documentId })), chunks } as PublicPublication,
    matches: chunks.map((c) => ({ chunk_id: c.chunkId })) };
}

describe('retrieve-evidence trusted input and membership guard', () => {
  it.each([
    { ...request, eligibleDocumentIds: [] }, { ...request, eligibleDocumentIds: [''] },
    { ...request, eligibleDocumentIds: ['\ud800'] }, { ...request, eligibleDocumentIds: Array(1) },
    { ...request, searchTerms: Array(1) }, { ...request, searchTerms: ['\ud800'] },
    { ...request, searchTerms: ['x'.repeat(257)] }, { ...request, searchTerms: Array(33).fill('x') },
    { ...request, resolvedQuestion: '' }, { ...request, resolvedQuestion: 'x'.repeat(8001) },
    { ...request, extra: true },
  ])('rejects malformed input without consulting adapter %#', async (bad) => {
    const retrieve = vi.fn();
    await expect(retrieveEvidence({ retrieve }, bad)).rejects.toThrow('retrieval_unavailable');
    expect(retrieve).not.toHaveBeenCalled();
  });
  it('deduplicates membership without an arbitrary document count cap', () => {
    expect(validateRetrievalRequest({ ...request, eligibleDocumentIds: ['z', 'a', 'a'] }).eligibleDocumentIds).toEqual(['a', 'z']);
    expect(validateRetrievalRequest({ ...request, eligibleDocumentIds: Array.from({ length: 1000 }, (_, i) => `d-${i}`) }).eligibleDocumentIds).toHaveLength(1000);
  });
  it('rejects public-but-unselected adapter evidence, including mutation of its request', async () => {
    const retriever: Retriever = { async retrieve(input) {
      input.eligibleDocumentIds.push('outside');
      return { chunks: [{ ...chunk('outside', 'excluded'), documentId: 'outside', rank: 1 }] };
    } };
    await expect(retrieveEvidence(retriever, request)).rejects.toBeInstanceOf(RetrievalUnavailable);
  });
  it('redacts thrown details but accepts successful empty evidence', async () => {
    await expect(retrieveEvidence({ async retrieve() { throw new Error('SQL PRIVATE query'); } }, request)).rejects.toMatchObject({ message: 'retrieval_unavailable' });
    await expect(retrieveEvidence({ async retrieve() { return { chunks: [] }; } }, request)).resolves.toEqual({ chunks: [] });
  });
});

describe('D1Retriever encoding, transactional selection and limits', () => {
  it('honors a signal-only abort during search preparation before issuing a D1 batch', async () => {
    const controller = new AbortController(), batch = vi.fn();
    const db = { prepare() { controller.abort(); return { bind() { return this; } }; }, batch } as unknown as D1Database;
    await expect(new D1Retriever(db).retrieveForGeneration(request, { signal: controller.signal })).rejects.toBeInstanceOf(RetrievalDependencyUnavailable);
    expect(batch).not.toHaveBeenCalled();
  });
  it('encodes operators/quotes/SQL as bounded literal lexical data', () => {
    expect(encodeLexicalTerms(['alpha" OR text:beta*; DROP TABLE x --', 'alpha', 'été 日本 123'])).toBe('"alpha" OR "OR" OR "text" OR "beta" OR "DROP" OR "TABLE" OR "x" OR "été" OR "日本" OR "123"');
    expect(encodeLexicalTerms(['" * - : ; 😀'])).toBeNull();
    expect(() => encodeLexicalTerms(['a'.repeat(65)])).toThrow(RetrievalUnavailable);
    expect(() => encodeLexicalTerms([Array.from({ length: 65 }, (_, i) => `t${i}`).join(' ')])).toThrow(RetrievalUnavailable);
  });
  it.each([{ topK: 0, textBudget: 1 }, { topK: 1.5, textBudget: 1 }, { topK: 101, textBudget: 1 }, { topK: 1, textBudget: -1 }, { topK: 1, textBudget: Infinity }])('rejects invalid limits %j', (limits) => {
    expect(() => new D1Retriever(database().db, limits)).toThrow(RetrievalUnavailable);
  });
  it('binds only literal data and resolves ranked IDs against the same snapshot; skips oversized chunks whole', async () => {
    const { db, statements } = database();
    const chunks = [chunk('large', 'x'.repeat(20)), chunk('first', 'Fiction, non-BC.'), chunk('last', 'abc')];
    const spy = vi.spyOn(D1ResourceCatalog.prototype, 'readSearchSnapshot').mockResolvedValue(snapshot(chunks));
    try {
      const result = await new D1Retriever(db, { topK: 2, textBudget: 19 }).retrieve(request);
      expect(result.chunks.map((c) => c.chunkId)).toEqual(['first', 'last']);
      expect(result.chunks.map((c) => c.rank)).toEqual([1, 2]);
      expect(result.chunks[0]).toEqual({ ...Object.fromEntries(Object.entries(chunks[1]!).filter(([key]) => !['ordinal', 'passage', 'context', 'metadata'].includes(key))), rank: 1 });
      expect(statements[0]!.sql).toContain('json_each(?)');
      expect(statements[0]!.sql).toContain('ORDER BY bm25');
      expect(statements[0]!.sql).not.toContain('alpha');
      expect(statements[0]!.values).toEqual(['["d-a"]', '"alpha"']);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally { spy.mockRestore(); }
  });
  it('snapshots inherited limit values and accessor values exactly once', async () => {
    const { db } = database();
    const spy = vi.spyOn(D1ResourceCatalog.prototype, 'readSearchSnapshot').mockResolvedValue(snapshot([chunk('first', 'xx'), chunk('second', 'yy')]));
    try {
      const inherited = Object.create({ topK: 1, textBudget: 1 }) as { topK: number; textBudget: number };
      await expect(new D1Retriever(db, inherited).retrieve(request)).resolves.toEqual({ chunks: [] });
      let topKReads = 0, budgetReads = 0;
      const limits = { get topK() { topKReads++; return 1; }, get textBudget() { budgetReads++; return 2; } };
      const retriever = new D1Retriever(db, limits);
      expect(topKReads).toBe(1);
      expect(budgetReads).toBe(1);
      expect((await retriever.retrieve(request)).chunks.map((c) => c.chunkId)).toEqual(['first']);
      expect(topKReads).toBe(1);
      expect(budgetReads).toBe(1);
    } finally { spy.mockRestore(); }
  });
  it('still validates publication and complete membership when no tokens exist', async () => {
    const { db, statements } = database();
    const spy = vi.spyOn(D1ResourceCatalog.prototype, 'readSearchSnapshot').mockResolvedValue(snapshot([], ['d-a']));
    try {
      await expect(new D1Retriever(db).retrieve({ ...request, searchTerms: [] })).resolves.toEqual({ chunks: [] });
      expect(statements[0]!.sql).toContain('WHERE 0');
      await expect(new D1Retriever(db).retrieve({ ...request, searchTerms: [], eligibleDocumentIds: ['d-a', 'withdrawn'] })).rejects.toThrow(RetrievalUnavailable);
      spy.mockResolvedValue(null);
      await expect(new D1Retriever(db).retrieve(request)).rejects.toThrow('retrieval_unavailable');
    } finally { spy.mockRestore(); }
  });
  it('batches MATCH with six validation reads, preserving six-read readSnapshot and making no later query', async () => {
    const prepared: string[] = [];
    const batch = vi.fn(async (statements: unknown[]) => statements.map(() => ({ success: false, results: [] })));
    const db = { prepare(sql: string) {
      prepared.push(sql);
      return { bind() { return this; } };
    }, batch } as unknown as D1Database;
    await expect(new D1ResourceCatalog(db).readSnapshot()).resolves.toBeNull();
    expect(prepared).toHaveLength(6);
    expect(batch.mock.calls[0]![0]).toHaveLength(6);
    prepared.length = 0;
    await expect(new D1Retriever(db).retrieve(request)).rejects.toThrow('retrieval_unavailable');
    expect(prepared).toHaveLength(7);
    expect(batch.mock.calls[1]![0]).toHaveLength(7);
    expect(prepared[0]).toContain('MATCH ?');
    expect(batch).toHaveBeenCalledTimes(2);
  });
  it('controls malformed runtime configuration', () => {
    expect(() => new D1Retriever(database().db, null as unknown as ConstructorParameters<typeof D1Retriever>[1])).toThrow(RetrievalUnavailable);
  });
  it('redacts D1 faults without returning partial evidence', async () => {
    const db = { prepare() { throw new Error('SQL SECRET'); } } as unknown as D1Database;
    await expect(new D1Retriever(db).retrieve(request)).rejects.toMatchObject({ message: 'retrieval_unavailable' });
  });
});


describe('D1Retriever generation-only failure distinction', () => {
  it('preserves legacy empty overflow while generation reports a limit from one read', async () => {
    const spy = vi.spyOn(D1ResourceCatalog.prototype, 'readSearchSnapshot').mockResolvedValue(snapshot([chunk('big', 'too large')]));
    try {
      const retriever = new D1Retriever(database().db, { topK: 1, textBudget: 1 });
      await expect(retrieveEvidence(retriever, request)).resolves.toEqual({ chunks: [] });
      spy.mockClear();
      await expect(retrieveGenerationEvidence(retriever, request)).rejects.toBeInstanceOf(RetrievalLimitExceeded);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally { spy.mockRestore(); }
  });
  it('reports absent publication and coherent missing members, not query errors, as withdrawal', async () => {
    const spy = vi.spyOn(D1ResourceCatalog.prototype, 'readSearchSnapshot');
    try {
      for (const value of [null, snapshot([], ['different'])]) {
        spy.mockResolvedValue(value);
        await expect(new D1Retriever(database().db).retrieveForGeneration(request)).rejects.toBeInstanceOf(RetrievalScopeUnavailable);
      }
      spy.mockRejectedValue(new Error('RAW_DATABASE_DIAGNOSTIC'));
      await expect(new D1Retriever(database().db).retrieveForGeneration(request)).rejects.toBeInstanceOf(RetrievalDependencyUnavailable);
      expect(spy).toHaveBeenCalledTimes(3);
    } finally { spy.mockRestore(); }
  });
  it('keeps legacy readers closed while distinguishing successful absence from corrupt publication', async () => {
    const batch = vi.fn(async () => Array.from({ length: 7 }, () => ({ success: true, results: [] as unknown[] })));
    const db = { prepare: () => ({}), batch } as unknown as D1Database;
    const catalog = new D1ResourceCatalog(db), statement = {} as D1PreparedStatement;
    await expect(catalog.readSearchSnapshot(statement, true)).resolves.toBeNull();
    batch.mockImplementation(async () => [{ success: true, results: [{ id: 2 }] }, ...Array.from({ length: 6 }, () => ({ success: true, results: [] }))]);
    await expect(catalog.readSearchSnapshot(statement)).resolves.toBeNull();
    await expect(catalog.readSearchSnapshot(statement, true)).rejects.toThrow('Publication validation unavailable');
    batch.mockImplementation(async () => [{ success: true, results: [{ id: 2 }] }, ...Array.from({ length: 5 }, () => ({ success: true, results: [] }))]);
    await expect(catalog.readProcessingSnapshot()).resolves.toEqual({ kind: 'dependency_failure' });
    expect(batch).toHaveBeenCalledTimes(4);
  });
});
