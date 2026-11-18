import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { catalogAssetPath, catalogPreimage, jcs, normalizeCatalog } from '../../src/shared/public-catalog';
import { chunkIdPreimage, contentHashPreimage, type PublicChunk, type SearchDocument } from '../../src/shared/public-evidence';
import { assemblePublicArtifacts, buildPublicContent, type ArtifactBundle } from '../../tools/public-content/build';
import { chunkDocument } from '../../tools/public-content/chunk';
import { publishBundle } from '../../tools/public-content/publish';
import { markdownBlocks } from '../../tools/public-content/markdown-blocks';
import * as validator from '../../tools/public-content/validate';

vi.mock('node:fs', async (original) => ({ ...await original<typeof import('node:fs')>() }));
vi.mock('../../tools/public-content/validate', async (original) => ({ ...await original<typeof import('../../tools/public-content/validate')>() }));
const root = fileURLToPath(new URL('../../', import.meta.url));
const temporary: string[] = [];
const env = { PATH: process.env.PATH, LANG: 'C.UTF-8', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_AUTHOR_NAME: 'Synthetic Test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
  GIT_COMMITTER_NAME: 'Synthetic Test', GIT_COMMITTER_EMAIL: 'test@example.invalid' };
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const metadata = { document_id: 'd-a', visibility: 'public' as const, title: 'Fiction — test only',
  created_at: '2024-02-29T12:00:00Z', modified_at: '2024-03-01T12:00:00Z',
  reviewed_by: 'SYNTHETIC TEST REVIEW', reviewed_at: '2024-03-01T12:00:00Z' };
const front = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
const sheet = (body = '# Fiction\n\n> Fiction, unrelated to BC, development only.\n\nText.\n', extra = '') => `---\n${front}\n${extra}---\n${body}`;
function write(path: string, relative: string, bytes: string) {
  fs.mkdirSync(dirname(join(path, relative)), { recursive: true }); fs.writeFileSync(join(path, relative), bytes);
}
function git(path: string, args: string[]) { return execFileSync('git', args, { cwd: path, env, encoding: 'utf8' }).trim(); }
function repository(body = sheet()) {
  const path = fs.mkdtempSync(join(tmpdir(), 'public-artifacts-')); temporary.push(path);
  git(path, ['init', '--quiet']); write(path, '.gitignore', 'dist/\nnode_modules/\n');
  write(path, 'content/public/a.md', body); return path;
}
function commit(path: string) {
  git(path, ['add', '--all']); git(path, ['-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'Synthetic snapshot']);
  return git(path, ['rev-parse', 'HEAD']);
}
function document(): SearchDocument { return { documentId: 'd-a', sourcePath: 'content/public/a.md', sourceTitle: metadata.title,
  sourceRevision: '0'.repeat(40), metadata }; }
function persisted(path: string, bundle: ArtifactBundle) {
  return Object.fromEntries(Object.keys(bundle.files).map((file) => [file, fs.readFileSync(join(path, 'dist/public-content', bundle.catalogHash, file), 'utf8')]));
}
function search(bundle: ArtifactBundle) { return JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!); }
function installCli(path: string) {
  for (const file of ['scripts/build-public-content.mjs', 'tools/public-content/build.ts', 'tools/public-content/validate.ts',
    'tools/public-content/policy.json', 'tools/public-content/publish.ts', 'tools/public-content/chunk.ts',
    'tools/public-content/markdown-blocks.ts', 'src/shared/public-catalog.ts', 'src/shared/public-evidence.ts']) {
    fs.mkdirSync(dirname(join(path, file)), { recursive: true }); fs.copyFileSync(join(root, file), join(path, file));
  }
  write(path, 'package.json', '{"type":"module"}\n'); fs.symlinkSync(join(root, 'node_modules'), join(path, 'node_modules'), 'dir');
}
const golden = { version: 1, catalogRevision: '0'.repeat(40), resources: [{ resourceId: 'p-a', name: 'A', description: 'Test', documentIds: ['d-a'] }],
  documents: [{ documentId: 'd-a', sourcePath: 'content/public/a.md' }] };
afterEach(() => { vi.restoreAllMocks(); for (const path of temporary.splice(0)) fs.rmSync(path, { recursive: true, force: true }); });

describe('src/shared/public-catalog.ts', () => {
  it('matches the independent Runtime §1 fixed digest and exact bytes', () => {
    expect(catalogPreimage(golden)).toBe('{"catalogRevision":"0000000000000000000000000000000000000000","documents":[{"documentId":"d-a","sourcePath":"content/public/a.md"}],"resources":[{"description":"Test","documentIds":["d-a"],"name":"A","resourceId":"p-a"}],"version":1}');
    expect(hash(catalogPreimage(golden))).toBe('aefae89a06c759fbf9b82ef17b8f57e532731af585f0df1f138cfda52c897223');
    expect(catalogAssetPath('a'.repeat(64))).toBe(`/assets/resources-catalog.${'a'.repeat(64)}.json`);
    expect(() => catalogAssetPath('../unsafe')).toThrow();
  });
  it('normalizes reordered entities and overlapping/repeated sets using unsigned UTF-16', () => {
    const documents = ['\ue000', '😀', 'a'].map((documentId) => ({ documentId, sourcePath: 'content/public/a.md' }));
    const resources = ['z', 'a'].map((resourceId) => ({ resourceId, name: 'é"\\\n', description: 'Test', documentIds: ['\ue000', '😀', 'a', '😀'] }));
    const input = { ...golden, documents, resources };
    const normalized = normalizeCatalog(input);
    expect(normalized.documents.map((d) => d.documentId)).toEqual(['a', '😀', '\ue000']);
    expect(normalized.resources.map((r) => r.resourceId)).toEqual(['a', 'z']);
    expect(normalized.resources[0]!.documentIds).toEqual(['a', '😀', '\ue000']);
    expect(catalogPreimage({ ...input, resources: resources.toReversed(), documents: documents.toReversed() })).toBe(catalogPreimage(input));
    expect(jcs({ '\ue000': 1, '😀': 2, 'é': '\b\t\n\f\r"\\' })).toBe('{"é":"\\b\\t\\n\\f\\r\\"\\\\","😀":2,"":1}');
    expect(jcs('é')).not.toBe(jcs('e\u0301'));
  });
  it.each([
    { ...golden, version: 2 }, { ...golden, extra: 1 }, { ...golden, catalogRevision: 'HEAD' },
    { ...golden, documents: [...golden.documents, ...golden.documents] },
    { ...golden, resources: [...golden.resources, ...golden.resources] },
    { ...golden, resources: [{ ...golden.resources[0], documentIds: [] }] },
    { ...golden, resources: [{ ...golden.resources[0], documentIds: ['unknown'] }] },
    { ...golden, documents: [{ documentId: 'd-a', sourcePath: 'content/private/a.md' }] },
    { ...golden, documents: [{ documentId: 'd-a', sourcePath: 'content/public/../a.md' }] },
    { ...golden, resources: [{ ...golden.resources[0], name: '\ud800' }] },
  ])('rejects invalid catalog schema %#', (value) => { expect(() => catalogPreimage(value)).toThrow(); });
  it.each(['documents', 'resources'] as const)('rejects sparse %s entity arrays before normalization', (field) => {
    for (const sparse of [Array(1), [...golden[field], ...Array(1)]]) {
      // Spreading fills holes; delete a slot to exercise both empty and mixed arrays.
      delete sparse[sparse.length - 1];
      expect(() => normalizeCatalog({ ...golden, [field]: sparse })).toThrow('SCHEMA_INVALID');
    }
  });
  it.each([undefined, NaN, Infinity, '\ud800', '\udc00', { value: undefined }, [undefined], new Date(), Array(1)])('rejects non-JCS/invalid Unicode values %#', (value) => {
    expect(() => jcs(value)).toThrow();
  });
  it('matches independent fixed revision, overlapping-map and Unicode/escape vectors', () => {
    expect(hash(catalogPreimage({ ...golden, catalogRevision: '1'.repeat(40) })))
      .toBe('5bf7de9e47dc0e4d86779fa1eba631dfba02071f43c03bf841e611b4870bdde5');
    const mapped = { ...golden, documents: [...golden.documents, { documentId: 'd-b', sourcePath: 'content/public/b.md' }],
      resources: [{ ...golden.resources[0], documentIds: ['d-b', 'd-a', 'd-b'] }] };
    expect(hash(catalogPreimage(mapped))).toBe('b082fdb035dd1d4146a06a70fc32b2cf7d19103f6507e8550f2ffa068ce91d37');
    expect(hash(catalogPreimage({ ...golden, resources: [{ ...golden.resources[0], name: 'École "😀"\\\n', description: 'e\u0301 / é' }] })))
      .toBe('39e2512c86395c7abde8b2c451d6e732964957b375637d1f457718a98e91c31d');
  });
  it('changes catalog identity for revision, maps, paths and factual fields', () => {
    const base = hash(catalogPreimage(golden));
    for (const changed of [{ ...golden, catalogRevision: '1'.repeat(40) },
      { ...golden, documents: [{ documentId: 'd-a', sourcePath: 'content/public/renamed.md' }] },
      { ...golden, resources: [{ ...golden.resources[0], name: 'Renamed' }] },
      { ...golden, resources: [{ ...golden.resources[0], description: 'Changed' }] },
      { ...golden, resources: [] }]) expect(hash(catalogPreimage(changed))).not.toBe(base);
  });
});

describe('src/shared/public-evidence.ts', () => {
  const fields = { documentId: 'd-é', sourcePath: 'content/public/a.md' as const, sourceTitle: 'Title "é"', sectionTitle: null,
    location: 'lines:10-12;context:8-8', text: '> Fiction\r\nTexte 😀\n',
    metadata: { ...metadata, document_id: 'd-é', title: 'Title "é"' } };
  it('matches an independently specified content-hash vector (not a production-helper oracle)', () => {
    // Fixed literal and digest calculated independently with Python hashlib.
    const literal = '{"documentId":"d-é","location":"lines:10-12;context:8-8","metadata":{"created_at":"2024-02-29T12:00:00Z","document_id":"d-é","modified_at":"2024-03-01T12:00:00Z","reviewed_at":"2024-03-01T12:00:00Z","reviewed_by":"SYNTHETIC TEST REVIEW","title":"Title \\"é\\"","visibility":"public"},"sectionTitle":null,"sourcePath":"content/public/a.md","sourceTitle":"Title \\"é\\"","text":"> Fiction\\r\\nTexte 😀\\n","version":1}';
    expect(contentHashPreimage(fields)).toBe(literal);
    expect(hash(contentHashPreimage(fields))).toBe('8edc2c5dab3cc466916a3fa6399f53081208ccb7339633617238f297a612a0e5');
  });
  it.each(['documentId', 'sourcePath', 'sourceTitle', 'sectionTitle', 'location', 'text', 'metadata'] as const)('binds %s to content hash', (field) => {
    const changed = { ...fields, [field]: field === 'metadata' ? { ...fields.metadata, topics: ['changed'] } : field === 'sourcePath' ? 'content/public/other.md' : 'Changed' };
    expect(hash(contentHashPreimage(changed))).not.toBe(hash(contentHashPreimage(fields)));
  });
  it('specifies chunk identity independently and rejects invalid ordinals', () => {
    expect(chunkIdPreimage('d-a', 0)).toBe('{"documentId":"d-a","ordinal":0,"version":1}');
    expect(chunkIdPreimage('d-a', 1)).not.toBe(chunkIdPreimage('d-a', 0));
    for (const ordinal of [-1, 0.5, NaN]) expect(() => chunkIdPreimage('d-a', ordinal)).toThrow();
  });
});

describe('tools/public-content/markdown-blocks.ts and chunk.ts', () => {
  function reconstruct(text: string, chunks: PublicChunk[]) {
    const lines = text.match(/[^\n]*\n|[^\n]+$/g)!;
    const sourceBody = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
    let reconstructed = '';
    for (const [i, chunk] of chunks.entries()) {
      const passage = lines.slice(chunk.passage.start - 1, chunk.passage.end).join('');
      const context = chunk.context.map((r) => lines.slice(r.start - 1, r.end).join('')).join('');
      expect(chunk.text).toBe(context + passage);
      if (i) expect(chunk.passage.start).toBe(chunks[i - 1]!.passage.end + 1);
      reconstructed += passage;
    }
    expect(reconstructed).toBe(sourceBody);
  }
  it.each(['\n', '\r\n'])('preserves exact absolute ranges, Unicode and repeated/nested headings for %j', (eol) => {
    const text = sheet('Unheaded é\n# Same\nOne\n## Same\nTwo\n# Same\nThree 😀\n').replaceAll('\n', eol);
    const chunks = chunkDocument(document(), text);
    expect(chunks.map((c) => c.sectionTitle)).toEqual([null, 'Same', 'Same', 'Same']);
    expect(chunks.map((c) => c.location)).toEqual(['lines:10-10', 'lines:11-12', 'lines:13-14', 'lines:15-16']);
    reconstruct(text, chunks);
  });
  it.each(['#', '# ###', '# ###  '])('recognizes empty ATX heading %j as a section boundary', (heading) => {
    const chunks = chunkDocument(document(), sheet(`# Named\nBefore\n${heading}\nAfter\n`));
    expect(chunks.map((c) => c.sectionTitle)).toEqual(['Named', null]);
    expect(chunks[1]!.text).toBe(`${heading}\nAfter\n`);
  });
  it.each(['\n', '\r\n'])('specifies exact passage/context locations and ranges for %j', (eol) => {
    const text = sheet('# Title\n\n> Fiction.\nUnrelated to BC; development only.\n\n## Section\nText.\n').replaceAll('\n', eol);
    const chunks = chunkDocument(document(), text);
    expect(chunks.map((c) => ({ location: c.location, passage: c.passage, context: c.context }))).toEqual([
      { location: 'lines:10-14', passage: { start: 10, end: 14 }, context: [] },
      { location: 'lines:15-16;context:12-13', passage: { start: 15, end: 16 }, context: [{ start: 12, end: 13 }] },
    ]);
    expect(chunks[1]!.text).toBe(`> Fiction.${eol}Unrelated to BC; development only.${eol}## Section${eol}Text.${eol}`);
    reconstruct(text, chunks);
  });
  it('packs passages independently of oversized complete opening context', () => {
    const warning = `> ${'Fiction, unrelated to BC; development only. '.repeat(80)}\n`;
    const lines = Array.from({ length: 40 }, (_, i) => `${i}: ${'x'.repeat(90)}\n`).join('');
    const text = sheet(`# Title\n${warning}## Section\n${lines}`);
    const chunks = chunkDocument(document(), text);
    const later = chunks.filter((c) => c.context.length);
    expect(warning.length).toBeGreaterThan(2_000);
    expect(later).toHaveLength(2);
    for (const chunk of later) {
      expect(chunk.text.startsWith(warning)).toBe(true);
      expect(chunk.context).toEqual([{ start: 11, end: 11 }]);
      expect(chunk.passage.end - chunk.passage.start).toBeGreaterThan(10);
      expect(chunk.text.length - warning.length).toBeLessThanOrEqual(2_000);
      expect(chunk.text.length).toBeGreaterThan(2_000);
    }
    reconstruct(text, chunks);
  });
  it.each(['\n', '\r\n'])('does not accept NBSP as a top-level fence closing suffix for %j', (eol) => {
    const fence = '~~~\n~~~\u00a0\n# Literal heading\n~~~ \t\n'.replaceAll('\n', eol);
    const text = sheet(`${fence}# Outside\nDone.\n`).replaceAll(/(?<!\r)\n/g, eol);
    expect(markdownBlocks(text)[0]!.text).toBe(fence);
    expect(chunkDocument(document(), text).map((c) => c.sectionTitle)).toEqual([null, 'Outside']);
    reconstruct(text, chunkDocument(document(), text));
  });
  it.each(['-', '+', '*', '1.', '2)'])('keeps an empty end-of-line list marker %j and descendants indivisible', (marker) => {
    for (const eol of ['\n', '\r\n']) {
      const container = `- First\n\n${marker}\n  # Inside item\n  Detail.\n`.replaceAll('\n', eol);
      const text = sheet(`${container}\n# Outside\nDone.\n`).replaceAll(/(?<!\r)\n/g, eol);
      expect(markdownBlocks(text)[0]!.text).toBe(container);
      expect(chunkDocument(document(), text).map((c) => c.sectionTitle)).toEqual([null, 'Outside']);
      reconstruct(text, chunkDocument(document(), text));
    }
  });
  it.each([
    ['quote', '> '], ['quote', '- '], ['list', '> '], ['list', '- '],
  ])('does not interpret literal %s-container code prefix %j as a descendant fence', (kind, literal) => {
    const prefix = kind === 'quote' ? '> ' : '  ';
    const opening = kind === 'quote' ? '> ```\n' : '- Item\n  ```\n';
    const container = `${opening}${prefix}${literal}\`\`\`\n${prefix}# Literal code\n${prefix}\`\`\`\n`;
    const text = sheet(`${container}\n# Outside\nDone.\n`);
    expect(markdownBlocks(text)[0]!.text).toBe(container);
    expect(chunkDocument(document(), text).at(-1)!.sectionTitle).toBe('Outside');
    reconstruct(text, chunkDocument(document(), text));
  });
  it.each(['quote', 'list'])('terminates an unclosed fence with its %s container', (kind) => {
    const container = kind === 'quote' ? '> ```\n> Unclosed\n' : '- Item\n  ```\n  Unclosed\n';
    for (const separator of ['', '\n']) {
      const text = sheet(`${container}${separator}# Outside\nDone.\n`);
      expect(markdownBlocks(text)[0]!.text).toBe(container);
      expect(chunkDocument(document(), text).at(-1)!.sectionTitle).toBe('Outside');
      reconstruct(text, chunkDocument(document(), text));
    }
  });
  it('repeats the complete opening lazy blockquote including the non-BC warning', () => {
    const warning = '> Fiction.\nThis is unrelated to BC and development only.\n';
    const text = sheet(`# Title\n\n${warning}\n## Section\n${'Long line. '.repeat(100)}\n${'Another. '.repeat(100)}\n${'Last. '.repeat(200)}\n`);
    const chunks = chunkDocument(document(), text);
    expect(chunks.length).toBeGreaterThan(3);
    for (const chunk of chunks.filter((c) => c.context.length)) expect(chunk.text.startsWith(warning)).toBe(true);
    expect(chunks.at(-1)!.context).toEqual([{ start: 12, end: 13 }]);
    reconstruct(text, chunks);
  });
  it.each(['quote', 'list', 'list-quote', 'quote-list'])('keeps a long %s-nested fence atomic and internal headings non-top-level', (kind) => {
    const prefix = kind === 'quote' ? '> ' : kind === 'list' ? '  ' : kind === 'list-quote' ? '  > ' : '>   ';
    const start = kind === 'quote' ? '> warning\n' : kind === 'list' || kind === 'list-quote' ? '- item\n' : '> - item\n';
    const container = `${start}${prefix}\`\`\`md\n${Array.from({ length: 40 }, () => `${prefix}# ${'x'.repeat(100)}\n`).join('')}${prefix}\`\`\`\n`;
    const text = sheet(`## Outer\n${container}\n## Next\nDone.\n`);
    const blocks = markdownBlocks(text);
    expect(blocks.find((b) => b.text === container)).toBeDefined();
    const chunks = chunkDocument(document(), text);
    expect(chunks.find((c) => c.text.includes(container))).toBeDefined();
    expect(chunks.map((c) => c.sectionTitle)).not.toContain('x'.repeat(100));
    reconstruct(text, chunks);
  });
  it('handles 150,000 fence lines iteratively without argument-count overflow', () => {
    const fence = `\`\`\`\n${'x\n'.repeat(150_000)}\`\`\`\n`;
    const text = sheet(`# Large\n${fence}\nAfter\n`);
    const chunks = chunkDocument(document(), text);
    expect(chunks.some((chunk) => chunk.text === fence)).toBe(true);
    reconstruct(text, chunks);
  });
  it('keeps complete list lazy continuations, indented fences and blank-separated members', () => {
    const list = '- First\nLazy continuation\n\n  ~~~\n  # Not section\n  ~~~\n\n- Second\n';
    const text = sheet(`# Section\n${list}\n# Outside\nEnd\n`);
    expect(markdownBlocks(text).find((b) => b.text === list)).toBeDefined();
    reconstruct(text, chunkDocument(document(), text));
  });
});

describe('tools/public-content/build.ts committed artifact bundle', () => {
  it('builds identical linked bytes twice, persists exact registry records, and retains the pinned revision across application changes', () => {
    const path = repository(); const revision = commit(path);
    const bundle = assemblePublicArtifacts(path, revision);
    const first = buildPublicContent(path, revision);
    expect(first.ok).toBe(true); expect(persisted(path, bundle)).toEqual(bundle.files);
    write(path, 'application.ts', 'unrelated'); commit(path);
    expect(buildPublicContent(path, revision)).toEqual(first);
    expect(assemblePublicArtifacts(path, revision)).toEqual(bundle);
    expect(persisted(path, bundle)).toEqual(bundle.files);
    const parsed = JSON.parse(persisted(path, bundle)[`search-artifacts.${bundle.searchHash}.json`]!);
    expect(parsed.documents).toEqual([{ documentId: 'd-a', sourcePath: 'content/public/a.md', sourceRevision: revision, sourceTitle: metadata.title, metadata }]);
    expect(parsed.chunks.length).toBeGreaterThan(0);
    for (const chunk of parsed.chunks) {
      const record = parsed.documents.find((d: SearchDocument) => d.documentId === chunk.documentId);
      expect(record).toBeDefined();
      expect({ sourcePath: chunk.sourcePath, sourceRevision: chunk.sourceRevision, sourceTitle: chunk.sourceTitle, metadata: chunk.metadata })
        .toEqual({ sourcePath: record.sourcePath, sourceRevision: record.sourceRevision, sourceTitle: record.sourceTitle, metadata: record.metadata });
      expect(chunk.chunkId).toBe(hash(JSON.stringify({ documentId: 'd-a', ordinal: chunk.ordinal, version: 1 })));
      // Construct canonical fields independently from the persisted chunk, not
      // through either production preimage or canonicalization helper.
      const preimage = JSON.stringify({ documentId: chunk.documentId, location: chunk.location,
        metadata: Object.fromEntries(Object.entries(chunk.metadata).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)),
        sectionTitle: chunk.sectionTitle, sourcePath: chunk.sourcePath, sourceTitle: chunk.sourceTitle, text: chunk.text, version: 1 });
      expect(chunk.contentHash).toBe(hash(preimage));
    }
    const catalog = JSON.parse(bundle.files[`assets/resources-catalog.${bundle.catalogHash}.json`]!);
    expect(catalog.payload.resources).toEqual([]);
    expect(Object.keys(catalog.payload).sort()).toEqual(['catalogRevision', 'documents', 'resources', 'version']);
    expect(catalog.payload.catalogRevision).toBe(revision);
    expect(hash(jcs(catalog.payload))).toBe(bundle.catalogHash);
    expect(hash(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!)).toBe(bundle.searchHash);
    expect(fs.readdirSync(join(path, 'dist/public-content'))).toEqual([bundle.catalogHash]);
  });
  it('consumes committed blobs after the complete gate without mutable source rereads or private reads', () => {
    const path = repository(); const revision = commit(path);
    write(path, 'content/private/canary.md', 'SYNTHETIC_PRIVATE_DO_NOT_READ'); write(path, 'elsewhere.md', 'SYNTHETIC_PRIVATE_DO_NOT_READ');
    const original = validator.readCommittedPublicContent;
    const read = fs.readFileSync;
    let handedOff = false; const lateReads: string[] = [];
    vi.spyOn(validator, 'readCommittedPublicContent').mockImplementation((...args) => {
      const result = original(...args); handedOff = true;
      fs.renameSync(join(path, 'content/public/a.md'), join(path, 'before.md'));
      fs.symlinkSync(join(path, 'content/private/canary.md'), join(path, 'content/public/a.md'));
      return result;
    });
    vi.spyOn(fs, 'readFileSync').mockImplementation(((input: fs.PathOrFileDescriptor, ...args: unknown[]) => {
      const resolved = fs.realpathSync(typeof input === 'number' ? `/proc/self/fd/${input}` : input);
      expect(resolved).not.toBe(join(path, 'content/private/canary.md'));
      expect(resolved).not.toBe(join(path, 'elsewhere.md'));
      if (handedOff) lateReads.push(resolved);
      return Reflect.apply(read, fs, [input, ...args]);
    }) as typeof fs.readFileSync);
    const bundle = assemblePublicArtifacts(path, revision);
    expect(lateReads).toEqual([]); expect(search(bundle).documents[0].sourceRevision).toBe(revision);
  });
  it.each(['dirty', 'untracked', 'mismatched', 'unsafe', 'symlink', 'invalid-review'])('rejects %s source inputs before output', (kind) => {
    const path = repository(); let revision = commit(path);
    if (kind === 'dirty') write(path, 'content/public/a.md', sheet() + 'Changed');
    if (kind === 'untracked') write(path, 'content/public/b.md', sheet().replace('d-a', 'd-b'));
    if (kind === 'mismatched') revision = 'f'.repeat(40);
    if (kind === 'unsafe') { write(path, 'content/public/a.md', sheet() + 'SYNTHETIC_PRIVATE_MARKER'); revision = commit(path); }
    if (kind === 'symlink') { fs.renameSync(join(path, 'content/public/a.md'), join(path, 'elsewhere.md')); fs.symlinkSync('../../elsewhere.md', join(path, 'content/public/a.md')); }
    if (kind === 'invalid-review') { write(path, 'content/public/a.md', sheet().replace('SYNTHETIC TEST REVIEW', '')); revision = commit(path); }
    expect(buildPublicContent(path, revision)).toEqual({ ok: false, sourceRevision: null, diagnostics: [{ code: 'BUILD_FAILED', document: null }] });
    expect(fs.existsSync(join(path, 'dist'))).toBe(false);
  });
  const descriptor = 'resource_id: p-a\nresource_name: A\nresource_description: Test\ndocument_ids: [d-a]\n';
  it.each([
    ['partial', 'resource_id: p-a\n'], ['blank', descriptor.replace('resource_name: A', 'resource_name: " "')],
    ['empty map', descriptor.replace('[d-a]', '[]')], ['dangling', descriptor.replace('[d-a]', '[missing]')],
    ['nonpublic map', descriptor.replace('[d-a]', '[private-id]')],
    ['map only', 'document_ids: [d-a]\n'],
    ['duplicate Resource', descriptor], ['duplicate document', ''],
  ])('rejects %s descriptor/entity', (kind, extra) => {
    const path = repository(sheet(undefined, extra));
    fs.mkdirSync(join(path, 'content/public/resources'));
    fs.renameSync(join(path, 'content/public/a.md'), join(path, 'content/public/resources/a.md'));
    write(path, 'content/private/a.md', sheet().replace('d-a', 'private-id'));
    if (kind === 'duplicate Resource') write(path, 'content/public/resources/b.md', sheet(undefined, extra).replace('document_id: "d-a"', 'document_id: "d-b"'));
    if (kind === 'duplicate document') write(path, 'content/public/b.md', sheet());
    const revision = commit(path); expect(buildPublicContent(path, revision).ok).toBe(false);
  });
  it.each(['outside descriptor directory', 'missing descriptor fields'])('rejects %s', (kind) => {
    const path = repository(kind === 'outside descriptor directory' ? sheet(undefined, descriptor) : sheet());
    if (kind === 'missing descriptor fields') {
      fs.mkdirSync(join(path, 'content/public/resources'));
      fs.renameSync(join(path, 'content/public/a.md'), join(path, 'content/public/resources/a.md'));
    }
    expect(buildPublicContent(path, commit(path)).ok).toBe(false);
  });
  it('allows shared documents and repeated map members, never implicitly self-maps descriptors', () => {
    const path = repository(sheet(undefined, descriptor.replace('[d-a]', '[d-b, d-b]')));
    fs.mkdirSync(join(path, 'content/public/resources'));
    fs.renameSync(join(path, 'content/public/a.md'), join(path, 'content/public/resources/a.md'));
    write(path, 'content/public/b.md', sheet().replace('document_id: "d-a"', 'document_id: "d-b"'));
    write(path, 'content/public/resources/c.md', sheet(undefined, descriptor.replace('p-a', 'p-b').replace('[d-a]', '[d-b]')).replace('document_id: "d-a"', 'document_id: "d-c"'));
    const bundle = assemblePublicArtifacts(path, commit(path));
    const catalog = JSON.parse(bundle.files[`assets/resources-catalog.${bundle.catalogHash}.json`]!);
    expect(catalog.payload.resources.map((r: { documentIds: string[] }) => r.documentIds)).toEqual([['d-b'], ['d-b']]);
    expect(catalog.payload.documents).toHaveLength(3);
  });
  it('persists complete descriptor-derived Resource objects with distinct factual names/descriptions', () => {
    const path = repository();
    write(path, 'content/public/resources/alpha.md', sheet(undefined,
      'resource_id: p-alpha\nresource_name: Alpha project\nresource_description: First factual description\ndocument_ids: [d-a, d-a]\n')
      .replace('document_id: "d-a"', 'document_id: "d-alpha"'));
    write(path, 'content/public/resources/beta.md', sheet(undefined,
      'resource_id: p-beta\nresource_name: Beta project\nresource_description: Second factual description\ndocument_ids: [d-a]\n')
      .replace('document_id: "d-a"', 'document_id: "d-beta"'));
    const revision = commit(path);
    const bundle = assemblePublicArtifacts(path, revision);
    expect(buildPublicContent(path, revision).ok).toBe(true);
    const catalog = JSON.parse(persisted(path, bundle)[`assets/resources-catalog.${bundle.catalogHash}.json`]!);
    expect(catalog.payload.resources).toEqual([
      { resourceId: 'p-alpha', name: 'Alpha project', description: 'First factual description', documentIds: ['d-a'] },
      { resourceId: 'p-beta', name: 'Beta project', description: 'Second factual description', documentIds: ['d-a'] },
    ]);
  });
  it('preserves original complete fiction/non-BC/development warnings in independent middle chunks for all synthetic sheets', () => {
    const path = repository(); fs.rmSync(join(path, 'content/public/a.md'));
    const originals = fs.readdirSync(join(root, 'content/public'));
    for (const name of originals) write(path, `content/public/${name}`, fs.readFileSync(join(root, 'content/public', name), 'utf8'));
    const revision = commit(path); const parsed = search(assemblePublicArtifacts(path, revision));
    for (const name of originals) {
      const text = fs.readFileSync(join(path, 'content/public', name), 'utf8');
      const originalWarning = markdownBlocks(text).find((b) => b.quote)!.text;
      const chunks = parsed.chunks.filter((c: PublicChunk) => c.sourcePath.endsWith(name));
      const middle = chunks[Math.floor(chunks.length / 2)];
      expect(middle.text).toContain(originalWarning);
      expect(middle.text).toContain('sans rapport avec BC');
      expect(middle.text).toContain('développement synthétique');
      reconstructSynthetic(text, chunks);
    }
    function reconstructSynthetic(text: string, chunks: PublicChunk[]) {
      const lines = text.match(/[^\n]*\n|[^\n]+$/g)!;
      expect(chunks.map((c) => lines.slice(c.passage.start - 1, c.passage.end).join('')).join(''))
        .toBe(text.replace(/^---\n[\s\S]*?\n---\n/, ''));
    }
  });
});

describe('tools/public-content/publish.ts ownership and failure preservation', () => {
  it('rejects unlinked bytes or unexpected bundle paths before filesystem output', () => {
    const path = repository(); const bundle = assemblePublicArtifacts(path, commit(path));
    for (const changed of [{ ...bundle, searchHash: '0'.repeat(64) },
      { ...bundle, files: { ...bundle.files, '../unexpected': 'unowned' } },
      { ...bundle, files: { ...bundle.files, [`search-artifacts.${bundle.searchHash}.json`]: '{}' } }]) {
      expect(() => publishBundle(path, changed)).toThrow();
      expect(fs.existsSync(join(path, 'dist'))).toBe(false);
    }
  });
  it.each(['dist link', 'parent link', 'destination link', 'asset link', 'file conflict', 'unexpected entry', 'write failure', 'rename failure'])('rejects %s without altering an existing valid bundle', (kind) => {
    const path = repository(); const revision = commit(path); const bundle = assemblePublicArtifacts(path, revision);
    expect(buildPublicContent(path, revision).ok).toBe(true);
    const before = persisted(path, bundle);
    const parent = join(path, 'dist/public-content'); const output = join(parent, bundle.catalogHash);
    const outside = repository();
    if (kind === 'dist link' || kind === 'parent link') {
      const location = kind === 'dist link' ? join(path, 'dist') : parent;
      fs.renameSync(location, `${location}-original`); fs.symlinkSync(outside, location, 'dir');
    }
    if (kind === 'destination link') { fs.renameSync(output, `${output}-original`); fs.symlinkSync(outside, output, 'dir'); }
    if (kind === 'asset link') { fs.renameSync(join(output, 'assets'), join(output, 'assets-original')); fs.symlinkSync(outside, join(output, 'assets'), 'dir'); }
    if (kind === 'file conflict') {
      // Conflicting bundle bytes are never repaired or overwritten.
      fs.writeFileSync(join(output, `search-artifacts.${bundle.searchHash}.json`), 'unowned sentinel');
    }
    if (kind === 'unexpected entry') fs.writeFileSync(join(output, 'unowned-sentinel'), 'keep');
    if (kind === 'write failure' || kind === 'rename failure') {
      // A new catalog identity must not damage a previous valid bundle.
      write(path, 'content/public/a.md', sheet() + 'Changed\n'); const nextRevision = commit(path);
      const unlink = vi.spyOn(fs, 'unlinkSync'); const rmdir = vi.spyOn(fs, 'rmdirSync');
      if (kind === 'write failure') vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { throw new Error('sensitive-write-failure'); });
      else vi.spyOn(fs, 'renameSync').mockImplementation(() => { throw new Error('sensitive-rename-failure'); });
      expect(buildPublicContent(path, nextRevision).ok).toBe(false);
      expect(persisted(path, bundle)).toEqual(before);
      const entries = fs.readdirSync(parent);
      expect(entries).toContain(bundle.catalogHash);
      const staging = entries.filter((name) => name.startsWith('.staging-'));
      expect(staging).toHaveLength(1);
      expect(fs.existsSync(join(parent, staging[0]!, 'assets'))).toBe(true);
      expect(unlink).not.toHaveBeenCalled(); expect(rmdir).not.toHaveBeenCalled(); return;
    }
    expect(buildPublicContent(path, revision).ok).toBe(false);
    if (kind === 'dist link') expect(fs.readFileSync(join(path, 'dist-original/public-content', bundle.catalogHash, Object.keys(bundle.files)[0]!), 'utf8')).toBe(Object.values(before)[0]);
    if (kind === 'parent link') expect(fs.readFileSync(join(`${parent}-original`, bundle.catalogHash, Object.keys(bundle.files)[0]!), 'utf8')).toBe(Object.values(before)[0]);
    if (kind === 'destination link') expect(fs.readFileSync(join(`${output}-original`, Object.keys(bundle.files)[0]!), 'utf8')).toBe(Object.values(before)[0]);
    if (kind === 'file conflict') expect(fs.readFileSync(join(output, `search-artifacts.${bundle.searchHash}.json`), 'utf8')).toBe('unowned sentinel');
    if (kind === 'unexpected entry') expect(fs.readFileSync(join(output, 'unowned-sentinel'), 'utf8')).toBe('keep');
  });
  it.each(['symlink', 'directory'])('rejects injected staging %s replacement immediately at rename commit point', (kind) => {
    const path = repository(); const revision = commit(path); const bundle = assemblePublicArtifacts(path, revision);
    const outside = repository(); write(outside, 'unowned-sentinel', 'keep');
    const rename = fs.renameSync; let swapped = false;
    vi.spyOn(fs, 'renameSync').mockImplementation(((source: fs.PathLike, destination: fs.PathLike) => {
      swapped = true;
      rename(source, `${String(source)}-original`);
      if (kind === 'symlink') fs.symlinkSync(outside, source, 'dir');
      else { fs.mkdirSync(source); fs.writeFileSync(`${String(source)}/unowned-sentinel`, 'keep'); }
      return rename(source, destination);
    }) as typeof fs.renameSync);
    expect(buildPublicContent(path, revision)).toEqual({ ok: false, sourceRevision: null, diagnostics: [{ code: 'BUILD_FAILED', document: null }] });
    expect(swapped).toBe(true);
    expect(fs.readFileSync(join(path, 'dist/public-content', bundle.catalogHash, 'unowned-sentinel'), 'utf8')).toBe('keep');
    expect(fs.readFileSync(join(outside, 'unowned-sentinel'), 'utf8')).toBe('keep');
  });
  it('retains a staging file replaced after verification without any unlink/rmdir cleanup', () => {
    const path = repository(); const revision = commit(path); const bundle = assemblePublicArtifacts(path, revision);
    const unlink = vi.spyOn(fs, 'unlinkSync'); const rmdir = vi.spyOn(fs, 'rmdirSync');
    const rename = fs.renameSync; let staging = '';
    vi.spyOn(fs, 'renameSync').mockImplementation(((source: fs.PathLike) => {
      staging = fs.realpathSync(source);
      const file = `${String(source)}/assets/resources-catalog.${bundle.catalogHash}.json`;
      rename(file, `${file}-original`);
      fs.writeFileSync(file, 'unowned replacement');
      throw new Error('injected after verification');
    }) as typeof fs.renameSync);
    expect(buildPublicContent(path, revision).ok).toBe(false);
    const file = join(staging, 'assets', `resources-catalog.${bundle.catalogHash}.json`);
    expect(fs.readFileSync(file, 'utf8')).toBe('unowned replacement');
    expect(fs.readFileSync(`${file}-original`, 'utf8')).toBe(bundle.files[`assets/resources-catalog.${bundle.catalogHash}.json`]);
    expect(fs.readFileSync(join(staging, `search-artifacts.${bundle.searchHash}.json`), 'utf8'))
      .toBe(bundle.files[`search-artifacts.${bundle.searchHash}.json`]);
    expect(unlink).not.toHaveBeenCalled(); expect(rmdir).not.toHaveBeenCalled();
  });
  it('retains replaced staging directories and original complete residue without deletion', () => {
    const path = repository(); const revision = commit(path); const bundle = assemblePublicArtifacts(path, revision);
    const unlink = vi.spyOn(fs, 'unlinkSync'); const rmdir = vi.spyOn(fs, 'rmdirSync');
    const rename = fs.renameSync; let replacement = '';
    vi.spyOn(fs, 'renameSync').mockImplementation(((source: fs.PathLike) => {
      replacement = fs.realpathSync(source);
      rename(source, `${String(source)}-original`); fs.mkdirSync(source);
      fs.writeFileSync(`${String(source)}/unowned-sentinel`, 'keep');
      throw new Error('injected');
    }) as typeof fs.renameSync);
    expect(buildPublicContent(path, revision).ok).toBe(false);
    expect(fs.readFileSync(join(replacement, 'unowned-sentinel'), 'utf8')).toBe('keep');
    for (const [file, bytes] of Object.entries(bundle.files)) {
      expect(fs.readFileSync(join(`${replacement}-original`, file), 'utf8')).toBe(bytes);
    }
    expect(unlink).not.toHaveBeenCalled(); expect(rmdir).not.toHaveBeenCalled();
  });
  it('closes descriptors on publication success, rerun and failure', () => {
    const path = repository(); const revision = commit(path);
    const count = fs.readdirSync('/proc/self/fd').length;
    expect(buildPublicContent(path, revision).ok).toBe(true);
    expect(buildPublicContent(path, revision).ok).toBe(true);
    write(path, 'content/public/a.md', sheet() + 'Changed\n'); const next = commit(path);
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { throw new Error(); });
    expect(buildPublicContent(path, next).ok).toBe(false);
    expect(fs.readdirSync('/proc/self/fd')).toHaveLength(count);
  });
});

describe('scripts/build-public-content.mjs CLI', () => {
  it('requires an explicit full revision, resolves repository rather than cwd, and emits redacted JSON only', () => {
    const path = repository(); installCli(path); const revision = commit(path);
    const outside = repository();
    const cli = (args: string[]) => spawnSync(process.execPath, [join(path, 'scripts/build-public-content.mjs'), ...args],
      { cwd: outside, env, encoding: 'utf8', timeout: 10_000 });
    expect(cli(['--help']).stdout).toContain('Usage:'); expect(cli(['--help']).status).toBe(0);
    for (const args of [[], ['--revision'], ['--help', 'extra'], ['--revision', 'HEAD'], ['--revision', revision.slice(0, 12)],
      ['--root', '/unsafe-sensitive'], ['--revision', revision, '--revision', revision], ['--revision=HEAD']]) {
      const result = cli(args); expect(result.status).toBe(1); expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout).sourceRevision).toBeNull(); expect(result.stdout).not.toContain('unsafe-sensitive');
    }
    const first = cli(['--revision', revision]); expect(first.status).toBe(0); expect(first.stderr).toBe('');
    expect(JSON.parse(first.stdout).sourceRevision).toBe(revision);
    expect(cli(['--revision', revision]).stdout).toBe(first.stdout);
    write(path, 'content/public/a.md', sheet() + 'SYNTHETIC_PRIVATE_SECRET');
    const failed = cli(['--revision', revision]); expect(failed.status).toBe(1); expect(failed.stderr).toBe('');
    expect(JSON.parse(failed.stdout)).toEqual({ ok: false, sourceRevision: null, diagnostics: [{ code: 'BUILD_FAILED', document: null }] });
    expect(failed.stdout).not.toContain('SECRET'); expect(failed.stdout).not.toContain(path);
  });
});
