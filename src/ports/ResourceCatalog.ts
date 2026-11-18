import type { PublicCatalogPayload } from '../shared/public-catalog.ts';
import type { PublicChunk, SearchDocument } from '../shared/public-evidence.ts';

export interface PublicationIdentity {
  catalogRevision: string;
  catalogHash: string;
  catalogAssetPath: `/assets/resources-catalog.${string}.json`;
}
export interface PublicPublication extends PublicationIdentity {
  catalog: PublicCatalogPayload;
  documents: SearchDocument[];
  chunks: PublicChunk[];
}
// Null means unavailable: callers must not process evidence or infer global scope.
export interface ResourceCatalog { readSnapshot(): Promise<PublicPublication | null> }
