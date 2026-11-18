import { catalogAssetPath, fullRevision, type PublicCatalog } from '../../src/shared/public-catalog.ts';
import type { PublicSearchArtifacts } from '../../src/shared/public-evidence.ts';
import { assemblePublicArtifacts } from './build.ts';
import { publishBundle } from './publish.ts';

export async function activatePublicContent(repositoryRoot: string, revision: string, db: D1Database): Promise<void> {
  fullRevision(revision);
  // Only trusted assembly from validated committed bytes, never supplied bundles.
  const bundle = assemblePublicArtifacts(repositoryRoot, revision);
  publishBundle(repositoryRoot, bundle);
  const path = catalogAssetPath(bundle.catalogHash);
  const bytes = bundle.files[path.slice(1)]!;
  const response = await fetch(`http://127.0.0.1:5173${path}`, {
    redirect: 'error', signal: AbortSignal.timeout(4_500), cache: 'no-store',
  });
  const reader = response.body?.getReader();
  let verified = false;
  try {
    if (!response.ok || !reader) throw new Error('ASSET_INVALID');
    const expected = Buffer.from(bytes);
    let offset = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.byteLength > expected.byteLength - offset ||
          !expected.subarray(offset, offset + value.byteLength).equals(value)) throw new Error('ASSET_INVALID');
      offset += value.byteLength;
    }
    if (offset !== expected.byteLength) throw new Error('ASSET_INVALID');
    verified = true;
  } finally {
    if (!verified) {
      try { await reader?.cancel(); } catch { /* Preserve the redacted verification failure. */ }
    }
    reader?.releaseLock();
  }
  const catalog = JSON.parse(bytes) as PublicCatalog;
  const search = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!) as PublicSearchArtifacts;
  const statements: D1PreparedStatement[] = [];
  const add = (sql: string, ...values: (string | number)[]) => { statements.push(db.prepare(sql).bind(...values)); };
  for (const table of ['public_chunks_fts', 'public_chunks', 'public_resource_documents', 'public_resources', 'public_documents', 'active_publication']) add(`DELETE FROM ${table}`);
  for (const d of search.documents) add('INSERT INTO public_documents VALUES (?, ?, ?, ?)', d.documentId, d.sourcePath,
    JSON.stringify(d), search.chunks.filter((c) => c.documentId === d.documentId).length);
  for (const r of catalog.payload.resources) {
    add('INSERT INTO public_resources VALUES (?, ?, ?)', r.resourceId, r.name, r.description);
    for (const id of r.documentIds) add('INSERT INTO public_resource_documents VALUES (?, ?)', r.resourceId, id);
  }
  for (const c of search.chunks) {
    add('INSERT INTO public_chunks VALUES (?, ?, ?, ?)', c.chunkId, c.documentId, c.ordinal, JSON.stringify(c));
    add('INSERT INTO public_chunks_fts (chunk_id, text) VALUES (?, ?)', c.chunkId, c.text);
  }
  add('INSERT INTO active_publication VALUES (1, ?, ?, ?)', revision, bundle.catalogHash, new Date().toISOString());
  const result = await db.batch(statements);
  if (result.some((r) => !r.success)) throw new Error('ACTIVATION_FAILED');
}
