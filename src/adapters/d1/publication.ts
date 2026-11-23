import { catalogAssetPath, exactObject, fullRevision, jcs, normalizeCatalog, publicString, validUnicode } from '../../shared/public-catalog.ts';
import { chunkIdPreimage, contentHashPreimage, type PublicChunk, type SearchDocument } from '../../shared/public-evidence.ts';
import type { ProcessingPublicationRead, PublicPublication, ResourceCatalog } from '../../ports/ResourceCatalog.ts';

async function hash(text: string, check?: () => void): Promise<string> {
  check?.();
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  check?.();
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

export class D1ResourceCatalog implements ResourceCatalog {
  private readonly db: D1Database;
  constructor(db: D1Database) { this.db = db; }
  async readSnapshot(): Promise<PublicPublication | null> {
    return (await this.readBatch())?.publication ?? null;
  }
  async readProcessingSnapshot(check?: () => void): Promise<ProcessingPublicationRead> {
    try {
      const snapshot = await this.readBatch(undefined, true, check);
      return snapshot ? { kind: 'available', publication: snapshot.publication } : { kind: 'unavailable' };
    } catch { return { kind: 'dependency_failure' }; }
  }
  // Search rows and all validation reads belong to the same D1 transaction.
  // Callers must resolve match IDs only against this returned publication.
  async readSearchSnapshot(statement: D1PreparedStatement, reportDependency = false, check?: () => void): Promise<{
    publication: PublicPublication; matches: Record<string, unknown>[];
  } | null> {
    return this.readBatch(statement, reportDependency, check);
  }
  private async readBatch(statement?: D1PreparedStatement, reportDependency = false, check?: () => void): Promise<{
    publication: PublicPublication; matches: Record<string, unknown>[];
  } | null> {
    let results: D1Result<Record<string, unknown>>[];
    try {
      // D1 batch is one transaction. Never read an authority pointer first and
      // then issue unguarded data queries, even across independent Workers.
      const reads = [
        'SELECT * FROM active_publication',
        'SELECT * FROM public_resources',
        'SELECT * FROM public_resource_documents',
        'SELECT * FROM public_documents',
        'SELECT * FROM public_chunks ORDER BY document_id, ordinal',
        'SELECT chunk_id, text FROM public_chunks_fts',
      ].map((sql) => this.db.prepare(sql));
      if (statement) reads.push(statement);
      check?.();
      results = await this.db.batch<Record<string, unknown>>(reads);
      check?.();
      if (results.length !== reads.length || results.some((r) => !r.success)) throw new Error();
    } catch {
      if (reportDependency) throw new Error('Publication dependency unavailable');
      return null;
    }
    try {
      const [authority, resources, maps, registry, chunks, fts] = results.map((r) => r.results)!;
      if (authority!.length === 0) return null;
      if (authority!.length !== 1 || authority![0]!.id !== 1 || !registry!.length) throw new Error();
      const row = authority![0]!;
      const catalogRevision = fullRevision(row.catalog_revision);
      const catalogHash = publicString(row.catalog_hash);
      const assetPath = catalogAssetPath(catalogHash);
      if (typeof row.modified_at !== 'string' || !Number.isFinite(Date.parse(row.modified_at))) throw new Error();
      const catalog = normalizeCatalog({ version: 1, catalogRevision,
        resources: resources!.map((r) => ({ resourceId: r.resource_id, name: r.name, description: r.description,
          documentIds: maps!.filter((m) => m.resource_id === r.resource_id).map((m) => m.document_id) })),
        documents: registry!.map((d) => ({ documentId: d.document_id, sourcePath: d.source_path })),
      });
      if (await hash(jcs(catalog), check) !== catalogHash || maps!.length !== catalog.resources.reduce((n, r) => n + r.documentIds.length, 0)) throw new Error();
      check?.();
      const documents = registry!.map((d) => {
        const value = JSON.parse(d.document_json as string);
        exactObject(value, ['documentId', 'sourcePath', 'sourceRevision', 'sourceTitle', 'metadata']);
        return value as SearchDocument;
      });
      const evidence = chunks!.map((c) => {
        const value = JSON.parse(c.chunk_json as string);
        exactObject(value, ['chunkId', 'documentId', 'sourcePath', 'sourceRevision', 'contentHash', 'sourceTitle', 'sectionTitle', 'text', 'location', 'ordinal', 'passage', 'context', 'metadata']);
        return value as PublicChunk;
      });
      if (fts!.length !== evidence.length) throw new Error();
      for (const [index, d] of documents.entries()) {
        check?.();
        const registered = registry![index]!;
        if (d.documentId !== registered.document_id || d.sourcePath !== registered.source_path ||
            d.sourceRevision !== catalogRevision || d.metadata?.document_id !== d.documentId || d.metadata.visibility !== 'public') throw new Error();
        publicString(d.sourceTitle);
        const requiredMetadata = ['document_id', 'visibility', 'title', 'created_at', 'modified_at', 'reviewed_by', 'reviewed_at'];
        const optionalMetadata = ['topics', 'aliases', 'resource_id', 'resource_name', 'resource_description', 'document_ids'];
        if (requiredMetadata.some((key) => !(key in d.metadata)) || Object.keys(d.metadata).some((key) => ![...requiredMetadata, ...optionalMetadata].includes(key))) throw new Error();
        for (const key of ['document_id', 'title', 'reviewed_by'] as const) publicString(d.metadata[key]);
        for (const key of ['created_at', 'modified_at', 'reviewed_at'] as const) {
          const date = d.metadata[key];
          if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(date) || new Date(date).toISOString() !== date.replace('Z', '.000Z')) throw new Error();
        }
        for (const key of optionalMetadata) {
          const value = (d.metadata as unknown as Record<string, unknown>)[key];
          if (value === undefined) continue;
          if (['topics', 'aliases', 'document_ids'].includes(key)) {
            if (!Array.isArray(value)) throw new Error();
            if (key === 'document_ids') value.forEach(publicString);
            else if (value.some((entry) => typeof entry !== 'string' || !validUnicode(entry))) throw new Error();
          } else publicString(value);
        }
        if (d.sourceTitle !== d.metadata.title) throw new Error();
        const members = evidence.filter((c) => c.documentId === d.documentId);
        if (members.length !== registered.chunk_count) throw new Error();
        for (const [ordinal, c] of members.entries()) {
          const stored = chunks!.find((r) => r.chunk_id === c.chunkId);
          if (!stored || stored.document_id !== c.documentId || stored.ordinal !== ordinal || c.ordinal !== ordinal ||
              c.sourceRevision !== catalogRevision || c.sourcePath !== d.sourcePath || c.sourceTitle !== d.sourceTitle ||
              jcs(c.metadata) !== jcs(d.metadata) || await hash(chunkIdPreimage(d.documentId, ordinal), check) !== c.chunkId ||
              await hash(contentHashPreimage(c), check) !== c.contentHash ||
              fts!.filter((r) => r.chunk_id === c.chunkId && r.text === c.text).length !== 1) throw new Error();
          const ranges = [c.passage, ...c.context];
          for (const range of ranges) exactObject(range, ['start', 'end']);
          if (ranges.some((r) => !Number.isSafeInteger(r.start) || !Number.isSafeInteger(r.end) || r.start < 1 || r.end < r.start) ||
              c.location !== `lines:${c.passage.start}-${c.passage.end}${c.context.map((r) => `;context:${r.start}-${r.end}`).join('')}`) throw new Error();
        }
      }
      if (evidence.length !== registry!.reduce((n, r) => n + Number(r.chunk_count), 0)) throw new Error();
      return { publication: { catalogRevision, catalogHash, catalogAssetPath: assetPath, catalog, documents, chunks: evidence },
        matches: statement ? results[6]!.results : [] };
    } catch {
      if (reportDependency) throw new Error('Publication validation unavailable');
      return null;
    }
  }
}

// Compare the complete validated read with the write-transaction dataset, not
// just its mutable pointer. JSON parameters avoid SQL/bind limits per document.
export function publicationGuard(publication: PublicPublication): { sql: string; bindings: string[] } {
  const { catalog, documents, chunks } = publication;
  const tables = [
    { actual: 'SELECT catalog_revision, catalog_hash FROM active_publication WHERE id = 1',
      expected: "SELECT json_extract(value, '$.revision'), json_extract(value, '$.hash') FROM json_each(?)",
      rows: [{ revision: publication.catalogRevision, hash: publication.catalogHash }] },
    { actual: 'SELECT resource_id, name, description FROM public_resources',
      expected: "SELECT json_extract(value, '$.resourceId'), json_extract(value, '$.name'), json_extract(value, '$.description') FROM json_each(?)", rows: catalog.resources },
    { actual: 'SELECT resource_id, document_id FROM public_resource_documents',
      expected: "SELECT json_extract(value, '$.resourceId'), json_extract(value, '$.documentId') FROM json_each(?)",
      rows: catalog.resources.flatMap((r) => r.documentIds.map((documentId) => ({ resourceId: r.resourceId, documentId }))) },
    { actual: 'SELECT document_id, source_path, json(document_json), chunk_count FROM public_documents',
      expected: "SELECT json_extract(value, '$.documentId'), json_extract(value, '$.sourcePath'), json_extract(value, '$.document'), json_extract(value, '$.count') FROM json_each(?)",
      rows: documents.map((document) => ({ documentId: document.documentId, sourcePath: document.sourcePath, document, count: chunks.filter((c) => c.documentId === document.documentId).length })) },
    { actual: 'SELECT chunk_id, document_id, ordinal, json(chunk_json) FROM public_chunks',
      expected: "SELECT json_extract(value, '$.chunkId'), json_extract(value, '$.documentId'), json_extract(value, '$.ordinal'), json_extract(value, '$.chunk') FROM json_each(?)",
      rows: chunks.map((chunk) => ({ chunkId: chunk.chunkId, documentId: chunk.documentId, ordinal: chunk.ordinal, chunk })) },
    { actual: 'SELECT chunk_id, text FROM public_chunks_fts',
      expected: "SELECT json_extract(value, '$.chunkId'), json_extract(value, '$.text') FROM json_each(?)", rows: chunks },
  ];
  return {
    sql: tables.map(({ actual, expected }) => `NOT EXISTS (${actual} EXCEPT ${expected}) AND NOT EXISTS (${expected} EXCEPT ${actual})`).join(' AND ')
      + ` AND (SELECT COUNT(*) FROM public_chunks_fts) = ${chunks.length}`,
    bindings: tables.flatMap(({ rows }) => [JSON.stringify(rows), JSON.stringify(rows)]),
  };
}
