import { parse } from 'yaml';
import { catalogAssetPath, compareUtf16, jcs, normalizeCatalog, publicString, sourcePath, type PublicCatalog } from '../../src/shared/public-catalog.ts';
import { searchPreimage, type PublicMetadata, type PublicSearchArtifacts, type SearchDocument } from '../../src/shared/public-evidence.ts';
import { chunkDocument, sha256 } from './chunk.ts';
import { readCommittedPublicContent, type CommittedSource } from './validate.ts';
import { publishBundle } from './publish.ts';

export interface ArtifactBundle {
  catalogHash: string;
  searchHash: string;
  files: Record<string, string>;
}
export function assemblePublicArtifacts(repositoryRoot: string, revision: string): ArtifactBundle {
  const validated = readCommittedPublicContent(repositoryRoot, revision);
  if (!validated.ok || !validated.sources || validated.sourceRevision !== revision) throw new Error('SOURCE_INVALID');
  return assembleValidatedArtifacts(validated.sources, revision);
}
// Pure assembly. Caller has already authenticated these exact immutable bytes.
export function assembleValidatedArtifacts(input: CommittedSource[], revision: string): ArtifactBundle {
  const documents: SearchDocument[] = input.map((source) => {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(source.bytes);
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)!;
    const metadata = parse(match[1]!) as PublicMetadata;
    // Also validate decoded YAML Unicode, including optional metadata.
    jcs(metadata);
    return { documentId: publicString(metadata.document_id), sourcePath: sourcePath(source.path),
      sourceRevision: revision, sourceTitle: publicString(metadata.title), metadata };
  }).sort((a, b) => compareUtf16(a.documentId, b.documentId));
  const resources = [];
  for (const { metadata, sourcePath: path } of documents) {
    const fields = ['resource_id', 'resource_name', 'resource_description', 'document_ids'] as const;
    const hasFields = fields.some((key) => key in metadata);
    const isDescriptor = path.startsWith('content/public/resources/');
    if (!hasFields && !isDescriptor) continue;
    if (!isDescriptor || !fields.every((key) => key in metadata)) throw new Error('DESCRIPTOR_INVALID');
    resources.push({ resourceId: publicString(metadata.resource_id), name: publicString(metadata.resource_name),
      description: publicString(metadata.resource_description), documentIds: metadata.document_ids });
  }
  const payload = normalizeCatalog({ version: 1, catalogRevision: revision, resources,
    documents: documents.map(({ documentId, sourcePath }) => ({ documentId, sourcePath })) });
  const catalogHash = sha256(jcs(payload));
  const catalog: PublicCatalog = { catalogHash, payload };
  const sources = new Map(input.map((source) => [source.path, source.bytes]));
  const search: PublicSearchArtifacts = { version: 1, chunkingVersion: 1, catalogRevision: revision, catalogHash,
    documents, chunks: documents.flatMap((document) => chunkDocument(document,
      new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(sources.get(document.sourcePath)!))) };
  const searchBytes = searchPreimage(search);
  const searchHash = sha256(searchBytes);
  return { catalogHash, searchHash, files: {
    [catalogAssetPath(catalogHash).slice(1)]: jcs(catalog),
    [`search-artifacts.${searchHash}.json`]: searchBytes,
  } };
}
export function buildPublicContent(repositoryRoot: string, revision: string) {
  try {
    const bundle = assemblePublicArtifacts(repositoryRoot, revision);
    publishBundle(repositoryRoot, bundle);
    return { ok: true, sourceRevision: revision, catalogHash: bundle.catalogHash, searchHash: bundle.searchHash,
      outputPath: `dist/public-content/${bundle.catalogHash}`, diagnostics: [] };
  } catch {
    return { ok: false, sourceRevision: null, diagnostics: [{ code: 'BUILD_FAILED', document: null }] };
  }
}
