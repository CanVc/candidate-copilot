import { closeSync, constants, fstatSync, lstatSync, openSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';
import { catalogPreimage, exactObject, jcs } from '../../src/shared/public-catalog.ts';

// Open each component without following symlinks. Linux descriptor-relative
// paths keep every parent pinned even if a name is replaced during the read.
export function readLocalCatalogAsset(root: string, path: string): Buffer | null {
  const match = /^\/assets\/resources-catalog\.([0-9a-f]{64})\.json$/.exec(path);
  if (!match) return null;
  const handles: number[] = [];
  try {
    if (!root.startsWith('/') || root.split('/').some((part) => part === '.' || part === '..')) return null;
    let parent = openSync('/', constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
    handles.push(parent);
    for (const name of [...root.split('/').filter(Boolean), 'dist', 'public-content', match[1]!, 'assets']) {
      parent = openSync(`/proc/self/fd/${parent}/${name}`, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
      handles.push(parent);
    }
    const name = `resources-catalog.${match[1]}.json`;
    const fd = openSync(`/proc/self/fd/${parent}/${name}`, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    handles.push(fd);
    const before = fstatSync(fd);
    if (!before.isFile() || before.nlink !== 1) return null;
    const bytes = readFileSync(fd);
    const after = fstatSync(fd);
    const named = lstatSync(`/proc/self/fd/${parent}/${name}`);
    if (before.ino !== after.ino || before.dev !== after.dev || before.size !== after.size ||
        before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs || named.ino !== after.ino || named.dev !== after.dev || named.isSymbolicLink()) return null;
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    const catalog = exactObject(JSON.parse(text), ['catalogHash', 'payload']);
    const canonical = catalogPreimage(catalog.payload);
    if (catalog.catalogHash !== match[1] || createHash('sha256').update(canonical).digest('hex') !== match[1] ||
        jcs(catalog.payload) !== canonical || !bytes.equals(Buffer.from(jcs(catalog)))) return null;
    return bytes;
  } catch { return null; }
  finally { for (const fd of handles.reverse()) closeSync(fd); }
}

export function localCatalogAssets(root: string): Plugin {
  return {
    name: 'local-immutable-public-catalog',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url ?? '';
        if (!path.startsWith('/assets/resources-catalog.')) return next();
        const bytes = readLocalCatalogAsset(root, path);
        if (!bytes || !['GET', 'HEAD'].includes(request.method ?? '')) {
          response.statusCode = 404; response.end(); return;
        }
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.end(request.method === 'HEAD' ? undefined : bytes);
      });
    },
  };
}
