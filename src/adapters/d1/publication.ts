import { catalogAssetPath, exactObject, fullRevision, jcs, normalizeCatalog, publicString, validUnicode } from '../../shared/public-catalog.ts';
import { chunkIdPreimage, contentHashPreimage, type PublicChunk, type SearchDocument } from '../../shared/public-evidence.ts';
import type { PublicPublication, ResourceCatalog } from '../../ports/ResourceCatalog.ts';

async function hash(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

export class D1ResourceCatalog implements ResourceCatalog {
  private readonly db: D1Database;
  constructor(db: D1Database) { this.db = db; }
  async readSnapshot(): Promise<PublicPublication | null> {
    return (await this.readBatch())?.publication ?? null;
  }
  // Search rows and all validation reads belong to the same D1 transaction.
  // Callers must resolve match IDs only against this returned publication.
  async readSearchSnapshot(statement: D1PreparedStatement): Promise<{
    publication: PublicPublication; matches: Record<string, unknown>[];
  } | null> {
    return this.readBatch(statement);
  }
  private async readBatch(statement?: D1PreparedStatement): Promise<{
    publication: PublicPublication; matches: Record<string, unknown>[];
  } | null> {
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
      const results = await this.db.batch<Record<string, unknown>>(reads);
      if (results.length !== reads.length || results.some((r) => !r.success)) throw new Error();
      const [authority, resources, maps, registry, chunks, fts] = results.map((r) => r.results)!;
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
      if (await hash(jcs(catalog)) !== catalogHash || maps!.length !== catalog.resources.reduce((n, r) => n + r.documentIds.length, 0)) throw new Error();
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
              jcs(c.metadata) !== jcs(d.metadata) || await hash(chunkIdPreimage(d.documentId, ordinal)) !== c.chunkId ||
              await hash(contentHashPreimage(c)) !== c.contentHash ||
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
    } catch { return null; }
  }
}
