import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { linkSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { catalogAssetPath, jcs } from '../../src/shared/public-catalog.ts';
import { isHealthResponse } from '../../src/shared/health.ts';
import { activatePublicContent } from '../../tools/public-content/activate.ts';
import { assemblePublicArtifacts } from '../../tools/public-content/build.ts';
import { readLocalCatalogAsset } from '../../tools/public-content/local-assets.ts';

const temporary: string[] = [];
const payload = { version: 1, catalogRevision: 'a'.repeat(40), resources: [], documents: [{ documentId: 'd-a', sourcePath: 'content/public/a.md' }] };
const catalogHash = createHash('sha256').update(jcs(payload)).digest('hex');
const bytes = jcs({ catalogHash, payload });
const path = catalogAssetPath(catalogHash);
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'public-activation-')); temporary.push(root);
  const disk = join(root, 'dist/public-content', catalogHash, path.slice(1));
  mkdirSync(dirname(disk), { recursive: true }); writeFileSync(disk, bytes);
  return { root, disk };
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe('tools/public-content/local-assets.ts', () => {
  it('serves exact verified immutable bytes without requiring source trees or search artifacts', () => {
    const { root } = fixture();
    expect(readLocalCatalogAsset(root, path)?.toString()).toBe(bytes);
    expect(readLocalCatalogAsset(root, catalogAssetPath('b'.repeat(64)))).toBeNull();
  });
  it.each([`${path}?x`, `${path}#x`, '/assets/resources-catalog.bad.json', '/assets/../content/private/a.md', '/content/public/a.md', '/search-artifacts.x.json', `/assets/resources-catalog.${catalogHash.toUpperCase()}.json`, '/assets/resources-catalog.%2e%2e.json'])('rejects any nonexact catalog path: %s', (request) => {
    const { root } = fixture(); expect(readLocalCatalogAsset(root, request)).toBeNull();
  });
  it('rejects an otherwise valid hard-linked asset', () => {
    const { root, disk } = fixture();
    linkSync(disk, join(root, 'second-link.json'));
    expect(readFileSync(disk, 'utf8')).toBe(bytes);
    expect(readLocalCatalogAsset(root, path)).toBeNull();
  });
  it.each(['file', 'assets', 'bundle', 'public-content', 'dist'])('never follows a symlink at %s', (target) => {
    const { root, disk } = fixture();
    const selected = target === 'file' ? disk : target === 'assets' ? dirname(disk) : target === 'bundle' ? dirname(dirname(disk)) : join(root, target === 'dist' ? 'dist' : 'dist/public-content');
    const saved = `${selected}-saved`;
    // Move real bytes, then substitute a symlink to those same valid bytes.
    const content = readFileSync(disk);
    rmSync(selected, { recursive: true });
    if (target === 'file') writeFileSync(saved, content);
    else {
      const suffix = disk.slice(selected.length + 1);
      mkdirSync(dirname(join(saved, suffix)), { recursive: true }); writeFileSync(join(saved, suffix), content);
    }
    symlinkSync(saved, selected);
    expect(readLocalCatalogAsset(root, path)).toBeNull();
  });
  it.each(['{}', `${bytes}\n`, `\ufeff${bytes}`, bytes.replace('content/public/a.md', 'content/private/a.md'), bytes.replace('d-a', 'd-b')])('rejects malformed, noncanonical or mismatched catalog bytes %#', (invalid) => {
    const { root, disk } = fixture(); writeFileSync(disk, invalid);
    expect(readLocalCatalogAsset(root, path)).toBeNull();
  });
});

describe('src/shared/health.ts ready identity', () => {
  const ready = { status: 'ok', catalogRevision: payload.catalogRevision, catalogHash, catalogAssetPath: path };
  it('accepts only a ready identity with derived path', () => { expect(isHealthResponse(ready)).toBe(true); });
  it.each([{ status: 'ok' }, { status: 'unavailable' }, { ...ready, catalogRevision: 'HEAD' }, { ...ready, catalogHash: '../private' }, { ...ready, catalogHash: [catalogHash] }, { ...ready, catalogAssetPath: '/other' }, { ...ready, diagnostics: 'private' }])('rejects unusable or diagnostic health %#', (value) => {
    expect(isHealthResponse(value)).toBe(false);
  });
});


describe('tools/public-content/activate.ts bounded asset verification', () => {
  function repository() {
    const root = mkdtempSync(join(tmpdir(), 'public-activation-')); temporary.push(root);
    mkdirSync(join(root, 'content/public'), { recursive: true });
    writeFileSync(join(root, 'content/public/a.md'), `---
 document_id: d-a
 visibility: public
 title: Fiction
 created_at: "2024-01-01T00:00:00Z"
 modified_at: "2024-01-01T00:00:00Z"
 reviewed_by: "SYNTHETIC TEST ONLY"
 reviewed_at: "2024-01-01T00:00:00Z"
---
Fiction unrelated to BC, development only.
`);
    const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: {
      PATH: process.env.PATH, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    } }).trim();
    git('init', '--quiet'); git('add', 'content/public');
    git('-c', 'user.name=Synthetic Test', '-c', 'user.email=test@example.invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'Fixture');
    const revision = git('rev-parse', 'HEAD');
    const bundle = assemblePublicArtifacts(root, revision);
    return { root, revision, expected: Buffer.from(bundle.files[catalogAssetPath(bundle.catalogHash).slice(1)]!) };
  }
  it.each(['status', 'oversized', 'mismatch', 'short', 'stalled'] as const)('rejects %s bodies and cancels without preparing or mutating D1', async (kind) => {
    const { root, revision, expected } = repository();
    const prepare = vi.fn(); const batch = vi.fn();
    const db = { prepare, batch } as unknown as D1Database;
    const cancelled = vi.fn(); const pulled = vi.fn();
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    const stream = new ReadableStream<Uint8Array>({
      start(streamController) {
        // Like fetch, a stalled body rejects when the request deadline aborts.
        if (kind === 'stalled') controller.signal.addEventListener('abort', () => streamController.error(new Error('deadline')));
      },
      pull(streamController) {
        pulled();
        if (kind === 'status' || kind === 'stalled') return;
        if (kind === 'oversized') streamController.enqueue(Buffer.concat([expected, Buffer.from('extra')]));
        if (kind === 'mismatch') streamController.enqueue(Buffer.from('not the expected catalog'));
        if (kind === 'short') streamController.enqueue(expected.subarray(0, -1));
        if (kind === 'short') streamController.close();
      },
      cancel: cancelled,
    }, { highWaterMark: 0 });
    const fetch = vi.fn(async () => new Response(stream, { status: kind === 'status' ? 503 : 200 }));
    vi.stubGlobal('fetch', fetch);
    const activation = activatePublicContent(root, revision, db);
    const rejected = expect(activation).rejects.toThrow();
    if (kind === 'stalled') {
      await vi.waitFor(() => expect(pulled).toHaveBeenCalled());
      controller.abort();
    }
    await rejected;
    expect(prepare).not.toHaveBeenCalled(); expect(batch).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/^http:\/\/127\.0\.0\.1:5173\/assets\/resources-catalog\.[0-9a-f]{64}\.json$/),
      expect.objectContaining({ redirect: 'error', signal: controller.signal }));
    expect(timeout).toHaveBeenCalledWith(4_500);
    if (kind === 'status') expect(pulled).not.toHaveBeenCalled();
    // An errored/closed stream is already terminal; all other rejected bodies
    // must be actively cancelled rather than drained.
    if (!['stalled', 'short'].includes(kind)) expect(cancelled).toHaveBeenCalledOnce();
  });
});
