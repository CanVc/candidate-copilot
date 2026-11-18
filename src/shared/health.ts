import { catalogAssetPath, fullRevision } from './public-catalog.ts';
import type { PublicationIdentity } from '../ports/ResourceCatalog.ts';

export type ReadyHealthResponse = { status: 'ok' } & PublicationIdentity;
export type HealthResponse = ReadyHealthResponse | { status: 'unavailable' };

// Only a coherent ready identity enables frontend availability. A live but
// uninitialized Worker deliberately remains unavailable for processing.
export function isHealthResponse(value: unknown): value is ReadyHealthResponse {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !==
        'catalogAssetPath,catalogHash,catalogRevision,status') return false;
    const h = value as ReadyHealthResponse;
    return h.status === 'ok' && typeof h.catalogHash === 'string' && fullRevision(h.catalogRevision) === h.catalogRevision &&
      catalogAssetPath(h.catalogHash) === h.catalogAssetPath;
  } catch { return false; }
}
