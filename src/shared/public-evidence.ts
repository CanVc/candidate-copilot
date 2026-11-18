import { fullRevision, jcs, publicString, sourcePath } from './public-catalog.ts';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  sourcePath: `content/public/${string}`;
  sourceRevision: string;
  contentHash: string;
  sourceTitle: string;
  sectionTitle: string | null;
  text: string;
  location: string;
  rank: number;
}
export interface LineRange { start: number; end: number }
export interface PublicMetadata {
  document_id: string;
  visibility: 'public';
  title: string;
  created_at: string;
  modified_at: string;
  reviewed_by: string;
  reviewed_at: string;
  topics?: string[];
  aliases?: string[];
  resource_id?: string;
  resource_name?: string;
  resource_description?: string;
  document_ids?: string[];
}
export interface PublicChunk extends Omit<RetrievedChunk, 'rank'> {
  ordinal: number;
  passage: LineRange;
  context: LineRange[];
  metadata: PublicMetadata;
}
export interface SearchDocument {
  documentId: string;
  sourcePath: `content/public/${string}`;
  sourceRevision: string;
  sourceTitle: string;
  metadata: PublicMetadata;
}
export interface PublicSearchArtifacts {
  version: 1;
  chunkingVersion: 1;
  catalogRevision: string;
  catalogHash: string;
  documents: SearchDocument[];
  chunks: PublicChunk[];
}
export function chunkIdPreimage(documentId: string, ordinal: number): string {
  if (!Number.isSafeInteger(ordinal) || ordinal < 0) throw new Error('SCHEMA_INVALID');
  return jcs({ version: 1, documentId: publicString(documentId), ordinal });
}
export function contentHashPreimage(chunk: Pick<PublicChunk, 'documentId' | 'sourcePath' | 'sourceTitle' | 'sectionTitle' | 'location' | 'text' | 'metadata'>): string {
  publicString(chunk.documentId); sourcePath(chunk.sourcePath); publicString(chunk.sourceTitle);
  if (chunk.sectionTitle !== null) publicString(chunk.sectionTitle);
  publicString(chunk.location);
  if (typeof chunk.text !== 'string') throw new Error('SCHEMA_INVALID');
  return jcs({ version: 1, documentId: chunk.documentId, sourcePath: chunk.sourcePath,
    sourceTitle: chunk.sourceTitle, sectionTitle: chunk.sectionTitle, location: chunk.location,
    text: chunk.text, metadata: chunk.metadata });
}
export function searchPreimage(search: PublicSearchArtifacts): string {
  fullRevision(search.catalogRevision);
  return jcs(search);
}
