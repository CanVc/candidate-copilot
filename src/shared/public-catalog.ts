export interface PublicResource {
  resourceId: string;
  name: string;
  description: string;
  documentIds: string[];
}
export interface PublicDocument { documentId: string; sourcePath: `content/public/${string}` }
export interface PublicCatalogPayload {
  version: 1;
  catalogRevision: string;
  resources: PublicResource[];
  documents: PublicDocument[];
}
export interface PublicCatalog { catalogHash: string; payload: PublicCatalogPayload }

export function compareUtf16(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
export function validUnicode(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const next = text.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (c >= 0xdc00 && c <= 0xdfff) return false;
  }
  return true;
}
export function publicString(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || !validUnicode(value)) throw new Error('SCHEMA_INVALID');
  return value;
}
export function sourcePath(value: unknown): `content/public/${string}` {
  const path = publicString(value);
  if (!path.startsWith('content/public/') || !path.endsWith('.md') || path.includes('\\') ||
      path.split('/').some((part) => !part || part === '.' || part === '..') || /[\u0000-\u001f]/.test(path)) throw new Error('SCHEMA_INVALID');
  return path as `content/public/${string}`;
}
export function fullRevision(value: unknown): string {
  if (typeof value !== 'string' || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(value)) throw new Error('SCHEMA_INVALID');
  return value;
}
export function exactObject(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Object.keys(value).sort(compareUtf16).join(',') !== keys.sort(compareUtf16).join(',')) throw new Error('SCHEMA_INVALID');
  return value as Record<string, unknown>;
}
export function stringSet(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error('SCHEMA_INVALID');
  return [...new Set(value.map(publicString))].sort(compareUtf16);
}
function entities<T>(value: unknown, convert: (item: unknown) => T, id: (item: T) => string): T[] {
  if (!Array.isArray(value)) throw new Error('SCHEMA_INVALID');
  const items = Array.from(value, convert).sort((a, b) => compareUtf16(id(a), id(b)));
  if (items.some((item, i) => i > 0 && id(items[i - 1]!) === id(item))) throw new Error('SCHEMA_INVALID');
  return items;
}
export function normalizeCatalog(value: unknown): PublicCatalogPayload {
  const p = exactObject(value, ['version', 'catalogRevision', 'resources', 'documents']);
  if (p.version !== 1) throw new Error('SCHEMA_INVALID');
  const documents = entities(p.documents, (value) => {
    const d = exactObject(value, ['documentId', 'sourcePath']);
    return { documentId: publicString(d.documentId), sourcePath: sourcePath(d.sourcePath) };
  }, (d) => d.documentId);
  const ids = new Set(documents.map((d) => d.documentId));
  const resources = entities(p.resources, (value) => {
    const r = exactObject(value, ['resourceId', 'name', 'description', 'documentIds']);
    const documentIds = stringSet(r.documentIds);
    if (!documentIds.length || documentIds.some((id) => !ids.has(id))) throw new Error('SCHEMA_INVALID');
    return { resourceId: publicString(r.resourceId), name: publicString(r.name), description: publicString(r.description), documentIds };
  }, (r) => r.resourceId);
  return { version: 1, catalogRevision: fullRevision(p.catalogRevision), resources, documents };
}

// RFC 8785: ECMAScript scalar serialization, recursive unsigned UTF-16 key
// ordering, no Unicode normalization and no non-JSON/invalid Unicode values.
export function jcs(value: unknown): string {
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'string') {
    if (!validUnicode(value)) throw new Error('SCHEMA_INVALID');
    return JSON.stringify(value);
  }
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length ||
        Object.keys(value).some((key, index) => key !== String(index))) throw new Error('SCHEMA_INVALID');
    return `[${value.map(jcs).join(',')}]`;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return `{${Object.keys(value).sort(compareUtf16).map((key) => `${jcs(key)}:${jcs((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  throw new Error('SCHEMA_INVALID');
}
export function catalogPreimage(value: unknown): string { return jcs(normalizeCatalog(value)); }
export function catalogAssetPath(hash: string): `/assets/resources-catalog.${string}.json` {
  if (!/^[0-9a-f]{64}$/.test(hash)) throw new Error('SCHEMA_INVALID');
  return `/assets/resources-catalog.${hash}.json`;
}
