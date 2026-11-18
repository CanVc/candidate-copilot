import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, linkSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import * as fs from 'node:fs';
import * as childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';
import { validatePublicContent } from '../../tools/public-content/validate';

vi.mock('node:child_process', async (original) => ({ ...await original<typeof import('node:child_process')>() }));
vi.mock('node:fs', async (original) => ({ ...await original<typeof import('node:fs')>() }));

const root = fileURLToPath(new URL('../../', import.meta.url));
const temporary: string[] = [];
const developmentSheets = [
  ['mission-regie-collections.md', '0eaf8b1d-791d-4c60-9234-168a6a03acbd', 'eee4d56f027f4e29e83f65e9164a5cccd575c508d3496effcc120b80a705086e', '62dc67fcd7f288d58a6851dba1e07d447b00e0f7381d375b92ff07e7219522ea'],
  ['projet-reperage-reserves.md', 'a53a192f-51d5-4537-8200-427a09ee1ea3', '3ce2b667373b699e8bcc4ac888bad816b11e635b977c403408e4f95c30396628', '18dd57a7dc4eeeb8c1c86d22122125068f859dfb04d117b7ffac3c2d3ae10121'],
  ['projet-prototype-prets.md', '87ddaeda-8ee4-4056-9931-5ebf7b677875', '40e6b7ae36aedbc4c6020cc3f1be2b0a256a5512ace79e0f27077d5b4f9b326b', '945a1f3d2d853205085fec7f6246bd1a415b3c09e9b3b65913e4fcba35f01e2a'],
] as const;
const developmentWarning = ' Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.';
function sheetParts(text: string) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  expect(match).not.toBeNull();
  return { metadata: parse(match![1]!), body: match![2]! };
}
function developmentCopy(name: string) { return readFileSync(join(root, 'content/public', name), 'utf8'); }
function copyDevelopmentCorpus(path: string) {
  for (const [name] of developmentSheets) write(path, `content/public/${name}`, developmentCopy(name));
}
const env = {
  PATH: process.env.PATH, LANG: 'C.UTF-8', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_AUTHOR_NAME: 'Synthetic Test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
  GIT_COMMITTER_NAME: 'Synthetic Test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
};
const valid = (id = 'synthetic-document-1') => `---
document_id: "${id}"
visibility: public
title: "Fiction — test only"
created_at: "2024-02-29T12:00:00Z"
modified_at: '2024-03-01T12:00:00Z'
reviewed_by: "SYNTHETIC TEST REVIEW — NOT HUMAN APPROVAL"
reviewed_at: "2024-03-01T12:00:00Z"
---
# Fiction, not career evidence
[Not an input](../../elsewhere.md)
`;
function write(repository: string, path: string, text: string | Buffer) {
  mkdirSync(dirname(join(repository, path)), { recursive: true });
  writeFileSync(join(repository, path), text);
}
function git(repository: string, args: string[]) {
  return execFileSync('git', args, { cwd: repository, env, encoding: 'utf8' }).trim();
}
function repository(withDocument = true) {
  const path = mkdtempSync(join(tmpdir(), 'candidate-public-content-'));
  temporary.push(path);
  mkdirSync(join(path, 'content/public'), { recursive: true });
  git(path, ['init', '--quiet']);
  if (withDocument) write(path, 'content/public/one.md', valid());
  return path;
}
function commit(path: string) {
  git(path, ['add', '--all']);
  git(path, ['-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'Synthetic snapshot']);
  return git(path, ['rev-parse', 'HEAD']);
}
function codes(path: string) { return validatePublicContent(path).diagnostics.map((d) => d.code); }
function installCli(path: string) {
  for (const file of ['scripts/validate-public-content.mjs', 'tools/public-content/validate.ts', 'tools/public-content/policy.json']) {
    mkdirSync(dirname(join(path, file)), { recursive: true });
    copyFileSync(join(root, file), join(path, file));
  }
  write(path, 'package.json', '{"type":"module"}\n');
  symlinkSync(join(root, 'node_modules'), join(path, 'node_modules'), 'dir');
}
function cli(path: string, args: string[] = [], cwd = path, inheritedEnv: NodeJS.ProcessEnv = {}) {
  return spawnSync(process.execPath, [join(path, 'scripts/validate-public-content.mjs'), ...args], {
    cwd, env: { ...env, ...inheritedEnv }, encoding: 'utf8', timeout: 10_000,
  });
}
afterEach(() => { vi.restoreAllMocks(); for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true }); });

describe('tools/public-content/validate.ts metadata', () => {
  it('accepts only public Markdown, leaves private canaries and linked sources alone, and never mutates inputs', () => {
    const path = repository();
    write(path, 'content/public/nested/two.md', valid('synthetic-document-2'));
    write(path, 'content/public/ignored.txt', 'SYNTHETIC_PRIVATE_DO_NOT_READ');
    write(path, 'content/private/canary.md', 'SYNTHETIC_PRIVATE_DO_NOT_READ');
    write(path, 'elsewhere.md', 'SYNTHETIC_PRIVATE_DO_NOT_READ');
    const revision = commit(path);
    const before = git(path, ['status', '--porcelain=v1', '--untracked-files=all']);
    expect(validatePublicContent(path)).toEqual({ ok: true, count: 2, sourceRevision: null, diagnostics: [] });
    expect(validatePublicContent(path, { revision })).toEqual({ ok: true, count: 2, sourceRevision: revision, diagnostics: [] });
    expect(git(path, ['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
    expect(readFileSync(join(path, 'content/public/one.md'), 'utf8')).toBe(valid());
    expect(readFileSync(join(path, 'content/private/canary.md'), 'utf8')).toBe('SYNTHETIC_PRIVATE_DO_NOT_READ');
  });

  it('rejects an empty corpus and a self-contained placeholder README without an exemption', () => {
    const path = repository(false);
    expect(codes(path)).toContain('EMPTY_CORPUS');
    write(path, 'content/public/README.md', '# Public knowledge sources (deferred)\n\nDrafts stay in `content/private/`.\n');
    expect(codes(path)).toContain('FRONTMATTER_INVALID');
    expect(codes(path)).toContain('FORBIDDEN_PRIVATE_PATH');
  });

  it.each(['document_id', 'visibility', 'title', 'created_at', 'modified_at', 'reviewed_by', 'reviewed_at'])('requires %s as a nonblank string', (field) => {
    const path = repository();
    for (const replacement of ['', `${field}: ""`, `${field}: "  "`, `${field}: 123`, `${field}: [wrong]`, `${field}: null`]) {
      write(path, 'content/public/one.md', valid().replace(new RegExp(`^${field}:.*$`, 'm'), replacement));
      expect(validatePublicContent(path).diagnostics).toContainEqual({ code: 'METADATA_INVALID', document: 1, field });
    }
    if (field === 'visibility') {
      write(path, 'content/public/one.md', valid().replace('visibility: public', 'visibility: private'));
      expect(codes(path)).toContain('METADATA_INVALID');
    }
  });

  it.each(['created_at', 'modified_at', 'reviewed_at'])('requires quoted calendar-valid UTC seconds for %s', (field) => {
    const path = repository();
    for (const value of ['2024-03-01T12:00:00Z', '"2023-02-29T12:00:00Z"', '"2024-04-31T12:00:00Z"',
      '"2024-01-01T24:00:00Z"', '"2024-01-01T12:60:00Z"', '"2024-01-01T12:00:60Z"',
      '"2024-01-01"', '"2024-01-01T12:00:00+00:00"', '"2024-01-01T12:00:00.000Z"']) {
      write(path, 'content/public/one.md', valid().replace(new RegExp(`^${field}:.*$`, 'm'), `${field}: ${value}`));
      expect(validatePublicContent(path).diagnostics).toContainEqual({ code: 'TIMESTAMP_INVALID', document: 1, field });
    }
  });

  it('preserves identity through rename and rejects duplicate IDs', () => {
    const path = repository();
    renameSync(join(path, 'content/public/one.md'), join(path, 'content/public/renamed.md'));
    expect(validatePublicContent(path).ok).toBe(true);
    expect(readFileSync(join(path, 'content/public/renamed.md'), 'utf8')).toBe(valid());
    write(path, 'content/public/duplicate.md', valid());
    expect(codes(path)).toContain('DUPLICATE_ID');
  });

  it.each([
    ['duplicate key', 'title: duplicate', 'YAML_INVALID'],
    ['unknown duplicate key', 'unknown: one\nunknown: two', 'YAML_INVALID'],
    ['alias', 'unknown: &anchor value\nother: *anchor', 'YAML_UNSUPPORTED'],
    ['explicit tag', 'unknown: !!str value', 'YAML_UNSUPPORTED'],
    ['custom tag', 'unknown: !custom value', 'YAML_INVALID'],
    ['parser error', 'unsafe-parser-secret: [unterminated', 'YAML_INVALID'],
    ['complex key', '? [unsafe-key]\n: value', 'YAML_INVALID'],
  ])('rejects %s without exposing parser input', (_, extra, code) => {
    const path = repository();
    write(path, 'content/public/one.md', valid().replace('\n---\n#', `\n${extra}\n---\n#`));
    const result = validatePublicContent(path);
    expect(result.diagnostics.map((d) => d.code)).toContain(code);
    expect(JSON.stringify(result)).not.toContain(extra);
    expect(JSON.stringify(result)).not.toContain('unsafe');
  });

  it.each(['interview_state', 'review_history', 'type', 'template_version', 'provenance', 'unsafe-unknown-key'])('rejects nonpublic key %s without disclosing its name or value', (field) => {
    const path = repository();
    write(path, 'content/public/one.md', valid().replace('\n---\n#', `\n${field}: unsafe-sidecar-value\n---\n#`));
    const result = validatePublicContent(path);
    expect(result.diagnostics).toContainEqual({ code: 'METADATA_INVALID', document: 1 });
    expect(JSON.stringify(result)).not.toContain(field);
    expect(JSON.stringify(result)).not.toContain('unsafe-sidecar-value');
  });

  it('accepts only string/list shapes for the documented optional public and Resource keys', () => {
    const path = repository();
    const add = (extra: string) => write(path, 'content/public/one.md', valid().replace('\n---\n#', `\n${extra}\n---\n#`));
    add('topics: [fiction]\naliases: []\nresource_id: resource-fiction\nresource_name: Fiction\nresource_description: Test\ndocument_ids: [synthetic-document-1]');
    expect(validatePublicContent(path).ok).toBe(true);
    for (const field of ['topics', 'aliases', 'document_ids']) {
      for (const value of ['string', 'null', '[one, 2]', '{key: value}']) {
        add(`${field}: ${value}`);
        expect(validatePublicContent(path).diagnostics).toContainEqual({ code: 'METADATA_INVALID', document: 1, field });
      }
    }
    for (const field of ['resource_id', 'resource_name', 'resource_description']) {
      for (const value of ['123', 'null', '[wrong]']) {
        add(`${field}: ${value}`);
        expect(validatePublicContent(path).diagnostics).toContainEqual({ code: 'METADATA_INVALID', document: 1, field });
      }
    }
  });

  it('rejects every original synthetic draft and accepts only explicitly synthetic temporary variants', () => {
    const path = repository(false);
    const names = ['mission-regie-collections.md', 'projet-reperage-reserves.md', 'projet-prototype-prets.md'];
    const originals = names.map((name) => readFileSync(join(root, 'tests/fixtures/synthetic-corpus/documents', name), 'utf8'));
    names.forEach((name, i) => write(path, `content/public/${name}`, originals[i]!));
    const result = validatePublicContent(path);
    for (const document of [1, 2, 3]) {
      for (const field of ['visibility', 'reviewed_by', 'reviewed_at']) {
        expect(result.diagnostics).toContainEqual({ code: 'METADATA_INVALID', document, field });
      }
    }
    names.forEach((name, i) => write(path, `content/public/${name}`, originals[i]!
      .replace('reviewed_by: ""', 'visibility: public\nreviewed_by: "SYNTHETIC TEST ONLY — NOT OWNER APPROVAL"')
      .replace('reviewed_at: ""', 'reviewed_at: "2026-11-17T15:00:00Z"')));
    expect(validatePublicContent(path).ok).toBe(true);
    names.forEach((name, i) => expect(readFileSync(join(root, 'tests/fixtures/synthetic-corpus/documents', name), 'utf8')).toBe(originals[i]));
  });
});

describe('content/public synthetic development corpus', () => {
  it('contains exactly three valid sheets with genuine development-only review and preserved fixture provenance', () => {
    expect(fs.readdirSync(join(root, 'content/public')).sort()).toEqual(developmentSheets.map(([name]) => name).sort());
    expect(validatePublicContent(root)).toEqual({ ok: true, count: 3, sourceRevision: null, diagnostics: [] });
    const handoff = readFileSync(join(root, 'docs/_bmad-output/implementation-artifacts/handoff-2-1-development-corpus.md'), 'utf8');
    expect(handoff).toContain('modified_at: "2026-11-18T08:46:57Z"');
    for (const [name, id, originalHash, preparedHash] of developmentSheets) {
      const original = readFileSync(join(root, 'tests/fixtures/synthetic-corpus/documents', name), 'utf8');
      expect(createHash('sha256').update(original).digest('hex')).toBe(originalHash);
      const prepared = readFileSync(join(root, 'content/public', name));
      expect(createHash('sha256').update(prepared).digest('hex')).toBe(preparedHash);
      expect(handoff).toContain(`| \`${name}\` | \`${id}\` | \`${preparedHash}\` |`);
      const { metadata: fields, body } = sheetParts(prepared.toString('utf8'));
      expect(fields).toEqual({
        document_id: id, created_at: '2026-11-17T14:31:20Z', modified_at: '2026-11-18T08:46:57Z',
        title: sheetParts(original).metadata.title, visibility: 'public',
        reviewed_by: 'BC — revue finale pour le développement synthétique uniquement',
        reviewed_at: '2026-11-18T08:45:47Z',
      });
      const expectedBody = sheetParts(original).body
        .replace("Ce document n'est ni approuvé pour publication ni une fiche du portfolio de BC.", "Ce document n'est pas une fiche du portfolio de BC.")
        .replace(" Ce document n'est pas approuvé pour publication.", '');
      expect(body).toBe(expectedBody.replace(/^(> .+)$/m, `$1${developmentWarning}`));
      expect(body).toContain('sans rapport avec BC');
      expect(body).toContain('Le « je » désigne une personne fictive.');
      expect(body).not.toContain("n'est pas approuvé pour publication");
    }
  });

  it('accepts documentary gaps without changing the production source boundary or claiming runtime evaluation', () => {
    const path = repository(false);
    copyDevelopmentCorpus(path);
    write(path, 'elsewhere.md', 'SYNTHETIC_PRIVATE_DO_NOT_READ');
    write(path, 'content/private/canary.md', 'SYNTHETIC_PRIVATE_DO_NOT_READ');
    const read = fs.readFileSync;
    const reads: string[] = [];
    let descriptorRead = false;
    const observer = vi.spyOn(fs, 'readFileSync').mockImplementation(((input: fs.PathOrFileDescriptor, ...args: unknown[]) => {
      descriptorRead ||= typeof input === 'number' || String(input).startsWith('/proc/self/fd/');
      reads.push(fs.realpathSync(typeof input === 'number' ? `/proc/self/fd/${input}` : input));
      return Reflect.apply(read, fs, [input, ...args]);
    }) as typeof fs.readFileSync);
    const result = validatePublicContent(path);
    observer.mockRestore();
    expect(result).toEqual({ ok: true, count: 3, sourceRevision: null, diagnostics: [] });
    expect(descriptorRead).toBe(true);
    expect([...new Set(reads.filter((target) => target.endsWith('.md')))].sort())
      .toEqual(developmentSheets.map(([name]) => join(path, 'content/public', name)).sort());
    expect(reads).not.toContain(join(path, 'content/private/canary.md'));
    expect(reads).not.toContain(join(path, 'elsewhere.md'));
    // These are source assertions, not generated-answer or exhaustive coverage tests.
    expect(developmentCopy('mission-regie-collections.md')).toContain('Aucun budget global');
    expect(developmentCopy('projet-prototype-prets.md')).toContain("Aucun gain de temps, taux d'erreur, montant économisé ou taux d'adoption n'est établi");
    expect(developmentCopy('projet-reperage-reserves.md')).toContain("le nombre d'objets distincts touchés n'est pas défini");
    expect(readFileSync(join(path, 'content/private/canary.md'), 'utf8')).toBe('SYNTHETIC_PRIVATE_DO_NOT_READ');
  });

  it('never certifies uncommitted development copies as old HEAD, and verifies exact bytes only in a disposable commit', () => {
    const before = git(root, ['status', '--porcelain=v1', '--untracked-files=all']);
    const path = repository();
    const oldRevision = commit(path);
    rmSync(join(path, 'content/public/one.md'));
    copyDevelopmentCorpus(path);
    expect(validatePublicContent(path)).toEqual({ ok: true, count: 3, sourceRevision: null, diagnostics: [] });
    expect(validatePublicContent(path, { revision: oldRevision })).toEqual({ ok: false, count: 3, sourceRevision: null,
      diagnostics: [{ code: 'SNAPSHOT_MISMATCH', document: null }] });
    const revision = commit(path);
    expect(validatePublicContent(path, { revision })).toEqual({ ok: true, count: 3, sourceRevision: revision, diagnostics: [] });
    const [name] = developmentSheets[0];
    write(path, `content/public/${name}`, developmentCopy(name) + '\nChanged bytes.\n');
    expect(validatePublicContent(path, { revision }).diagnostics).toContainEqual({ code: 'SNAPSHOT_MISMATCH', document: null });
    expect(validatePublicContent(path, { revision }).sourceRevision).toBeNull();
    expect(git(root, ['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
  });
});

describe('tools/public-content/validate.ts isolation and safe diagnostics', () => {
  it.each(['content', 'content/public', 'content/public/one.md', 'content/public/link.txt', 'content/public/nested'])('rejects symlink at %s without reading its target', (location) => {
    const path = repository();
    const target = repository();
    write(target, 'secret.md', 'SYNTHETIC_PRIVATE_TARGET_SECRET');
    rmSync(join(path, location), { recursive: true, force: true });
    symlinkSync(location.endsWith('.md') || location.endsWith('.txt') ? join(target, 'secret.md') : target, join(path, location));
    const result = validatePublicContent(path);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((d) => d.code)).toContain('SOURCE_BOUNDARY');
    expect(JSON.stringify(result)).not.toContain(target);
    expect(JSON.stringify(result)).not.toContain('TARGET_SECRET');
  });

  it.each(['content/public', 'content/public/nested'])('pins %s across a deterministic directory swap without reading synthetic private targets', (location) => {
    const path = repository(false);
    mkdirSync(join(path, location), { recursive: true });
    write(path, 'content/private/secret.md', valid('synthetic-private-target'));
    const target = join(path, 'content/private');
    const original = join(path, location);
    const moved = `${original}-before-swap`;
    const originalInode = fs.statSync(original).ino;
    const privateInode = fs.statSync(join(target, 'secret.md')).ino;
    const readdir = fs.readdirSync;
    const read = fs.readFileSync;
    let swapped = false;
    let privateRead = false;
    vi.spyOn(fs, 'readdirSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      if (!swapped && fs.statSync(input).ino === originalInode) {
        swapped = true;
        renameSync(original, moved);
        symlinkSync(target, original, 'dir');
      }
      return Reflect.apply(readdir, fs, [input, ...args]);
    }) as typeof fs.readdirSync);
    vi.spyOn(fs, 'readFileSync').mockImplementation(((input: fs.PathOrFileDescriptor, ...args: unknown[]) => {
      const stat = typeof input === 'number' ? fs.fstatSync(input) : fs.statSync(input);
      if (stat.ino === privateInode) privateRead = true;
      return Reflect.apply(read, fs, [input, ...args]);
    }) as typeof fs.readFileSync);
    const result = validatePublicContent(path);
    expect(swapped).toBe(true);
    expect(privateRead).toBe(false);
    expect(result.ok).toBe(false);
    expect(result.count).toBe(0);
    expect(result.diagnostics).toContainEqual({ code: 'SOURCE_BOUNDARY', document: null });
    expect(read(join(target, 'secret.md'), 'utf8')).toBe(valid('synthetic-private-target'));
    expect(JSON.stringify(result)).not.toContain('synthetic-private-target');
  });

  it('rejects a component swapped after lstat but before its no-follow open', () => {
    const path = repository(false);
    write(path, 'content/private/secret.md', valid('synthetic-private-target'));
    const original = join(path, 'content/public');
    const beforeInode = fs.statSync(original).ino;
    const lstat = fs.lstatSync;
    let swapped = false;
    vi.spyOn(fs, 'lstatSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      const stat = Reflect.apply(lstat, fs, [input, ...args]);
      if (!swapped && stat.ino === beforeInode) {
        swapped = true;
        renameSync(original, `${original}-before-swap`);
        symlinkSync(join(path, 'content/private'), original, 'dir');
      }
      return stat;
    }) as typeof fs.lstatSync);
    const result = validatePublicContent(path);
    expect(swapped).toBe(true);
    expect(result.ok).toBe(false);
    expect(result.count).toBe(0);
  });

  it('pins configuration ancestors and rejects replacement before reading a private policy', () => {
    const path = repository();
    const directory = join(root, 'tools/public-content');
    const inode = fs.statSync(directory).ino;
    const privatePolicy = join(path, 'content/private/policy.json');
    write(path, 'content/private/policy.json', 'SYNTHETIC_PRIVATE_POLICY');
    const open = fs.openSync;
    const read = fs.readFileSync;
    let intercepted = false;
    let privateRead = false;
    // Simulate the raced open returning a different directory descriptor. No
    // real tooling path is changed: all replaced entries remain disposable.
    vi.spyOn(fs, 'openSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      const fd = Reflect.apply(open, fs, [input, ...args]);
      if (!intercepted && fs.fstatSync(fd).ino === inode) {
        intercepted = true;
        fs.closeSync(fd);
        return open(dirname(privatePolicy), fs.constants.O_RDONLY | fs.constants.O_DIRECTORY);
      }
      return fd;
    }) as typeof fs.openSync);
    vi.spyOn(fs, 'readFileSync').mockImplementation(((input: fs.PathOrFileDescriptor, ...args: unknown[]) => {
      const stat = typeof input === 'number' ? fs.fstatSync(input) : fs.statSync(input);
      if (stat.ino === fs.statSync(privatePolicy).ino) privateRead = true;
      return Reflect.apply(read, fs, [input, ...args]);
    }) as typeof fs.readFileSync);
    expect(validatePublicContent(path).diagnostics).toEqual([{ code: 'POLICY_INVALID', document: null }]);
    expect(intercepted).toBe(true);
    expect(privateRead).toBe(false);
  });

  it('closes every opened descriptor on success and failure', () => {
    const path = repository();
    const before = fs.readdirSync('/proc/self/fd').length;
    for (let i = 0; i < 10; i++) expect(validatePublicContent(path).ok).toBe(true);
    symlinkSync('../private', join(path, 'content/public/nested'));
    for (let i = 0; i < 10; i++) expect(validatePublicContent(path).ok).toBe(false);
    expect(fs.readdirSync('/proc/self/fd')).toHaveLength(before);
  });

  it('rejects repository roots reached through an outside symlink', () => {
    const path = repository();
    const outside = repository(false);
    symlinkSync(path, join(outside, 'outside-root'));
    expect(validatePublicContent(join(outside, 'outside-root')).diagnostics).toEqual([{ code: 'SOURCE_BOUNDARY', document: null }]);
  });

  it('rejects hard links and special entries without blocking on a FIFO', () => {
    const path = repository();
    linkSync(join(path, 'content/public/one.md'), join(path, 'content/public/hard.md'));
    execFileSync('mkfifo', [join(path, 'content/public/pipe.md')]);
    expect(codes(path).filter((code) => code === 'SOURCE_BOUNDARY')).toHaveLength(3);
  });

  it.each(['content/private/hidden', 'content\\private\\hidden', 'SYNTHETIC_PRIVATE_HIDDEN',
    '../private/secret.md', '../../private/secret.md', '../nested/private/secret.md', '..\\private\\secret.md',
    '-----BEGIN PGP PRIVATE KEY BLOCK-----', '-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----', 'fictional-contact@example.invalid', 'mailto:opaque', 'tel:123456'])('rejects configured marker without returning its value (%#)', (marker) => {
    const path = repository();
    for (const text of [valid() + marker, valid().replace('Fiction — test only', marker)]) {
      write(path, 'content/public/one.md', text);
      const result = validatePublicContent(path);
      expect(result.ok).toBe(false);
      expect(result.diagnostics.some((d) => d.code.startsWith('FORBIDDEN_'))).toBe(true);
      expect(JSON.stringify(result)).not.toContain(marker);
    }
  });

  it.each(['[source](private/secret.md)', ' private/secret.md', '"private/secret.md"',
    '(private\\secret.md)', '\nprivate/secret.md', './private/secret.md'])('rejects textual private-path boundaries without exposing values (%#)', (marker) => {
    const path = repository();
    write(path, 'content/public/one.md', valid() + marker);
    const result = validatePublicContent(path);
    expect(result.diagnostics).toContainEqual({ code: 'FORBIDDEN_PRIVATE_PATH', document: 1 });
    expect(JSON.stringify(result)).not.toContain('secret.md');
  });

  it('does not confuse ordinary Private cloud titles with private paths', () => {
    const path = repository();
    write(path, 'content/public/one.md', valid().replace('Fiction — test only', 'Private cloud'));
    expect(validatePublicContent(path).ok).toBe(true);
  });

  it('rejects invalid UTF-8 without replacing bytes or exposing them in CLI output', () => {
    const path = repository();
    const bytes = Buffer.concat([Buffer.from(valid()), Buffer.from([0xff])]);
    write(path, 'content/public/one.md', bytes);
    expect(codes(path)).toContain('SOURCE_READ');
    installCli(path);
    const revision = commit(path);
    for (const args of [[], ['--revision', revision]]) {
      const result = cli(path, args);
      expect(result.status).toBe(1);
      expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout).sourceRevision).toBeNull();
      expect(result.stdout).not.toContain('Fiction');
    }
    expect(readFileSync(join(path, 'content/public/one.md'))).toEqual(bytes);
  });

  it('rejects an unreadable ordinary file even with a readable sibling and redacts CLI failure', () => {
    const path = repository();
    const unreadable = join(path, 'content/public/unreadable-sensitive-name.md');
    writeFileSync(unreadable, valid('unreadable-sensitive-value'));
    installCli(path);
    fs.chmodSync(path, 0o755);
    fs.chmodSync(unreadable, 0o000);
    try {
      const result = spawnSync(process.execPath, [join(path, 'scripts/validate-public-content.mjs')], {
        cwd: path, env, encoding: 'utf8', timeout: 10_000,
        ...(process.getuid?.() === 0 ? { uid: 65534, gid: 65534 } : {}),
      });
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(result.stderr).toBe('');
      const output = JSON.parse(result.stdout);
      expect(output.count).toBe(1);
      expect(output.sourceRevision).toBeNull();
      expect(output.diagnostics).toContainEqual({ code: 'SOURCE_READ', document: 2 });
      expect(result.stdout + result.stderr).not.toContain('unreadable-sensitive');
    } finally { fs.chmodSync(unreadable, 0o644); }
    expect(readFileSync(unreadable, 'utf8')).toBe(valid('unreadable-sensitive-value'));
    expect(readFileSync(join(path, 'content/public/one.md'), 'utf8')).toBe(valid());
  });

  it('scans decoded YAML scalars and unsafe filenames without leaking values to CLI streams', () => {
    const path = repository();
    write(path, 'content/public/one.md', valid().replace('Fiction — test only', 'fictional\\u0040example.invalid'));
    expect(codes(path)).toContain('FORBIDDEN_EMAIL');
    renameSync(join(path, 'content/public/one.md'), join(path, 'content/public/unsafe-person@example.invalid.md'));
    installCli(path);
    const result = cli(path);
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(result.stdout).not.toContain('unsafe-person');
    expect(result.stdout).not.toContain('fictional');
    write(path, 'content/public/parser-secret.md', '---\nprivate-parser-sentinel: [broken\n---\n');
    const parser = cli(path);
    expect(parser.status).toBe(1);
    expect(parser.stdout + parser.stderr).not.toContain('private-parser-sentinel');
  });

  it('rejects a forbidden filename with otherwise clean content and redacts both CLI streams', () => {
    const path = repository();
    renameSync(join(path, 'content/public/one.md'), join(path, 'content/public/filename-only@example.invalid.md'));
    installCli(path);
    const result = cli(path);
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout).diagnostics).toEqual([{ code: 'FORBIDDEN_EMAIL', document: 1 }]);
    expect(result.stdout + result.stderr).not.toContain('filename-only');
    expect(readFileSync(join(path, 'content/public/filename-only@example.invalid.md'), 'utf8')).toBe(valid());
  });

  it('rejects an unprefixed PKCS#8 private-key header through the CLI without echoing it', () => {
    const path = repository();
    const header = '-----BEGIN PRIVATE KEY-----';
    write(path, 'content/public/one.md', valid() + `${header}\nsynthetic-payload-only\n`);
    installCli(path);
    const result = cli(path);
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout).diagnostics).toEqual([{ code: 'FORBIDDEN_PRIVATE_KEY', document: 1 }]);
    expect(result.stdout + result.stderr).not.toContain(header);
    expect(result.stdout + result.stderr).not.toContain('synthetic-payload-only');
  });

  it('bounds long email misses and dangling-at inputs in a deadline-limited subprocess', () => {
    const path = repository();
    installCli(path);
    for (const body of ['a'.repeat(250_000), `${'a'.repeat(250_000)}@`, `a@${'a'.repeat(250_000)}`]) {
      write(path, 'content/public/one.md', valid() + body);
      const result = spawnSync(process.execPath, [join(path, 'scripts/validate-public-content.mjs')], {
        cwd: path, env, encoding: 'utf8', timeout: 3_000,
      });
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout).ok).toBe(true);
    }
  });

  it.each([null, {}, { rules: [] }, { rules: [{ id: 'unsafe-policy-sentinel', pattern: '[', flags: 'i' }] }])('fails closed on malformed rules (%#)', (policy) => {
    const path = repository();
    expect(validatePublicContent(path, { policy })).toEqual({ ok: false, count: 0, sourceRevision: null,
      diagnostics: [{ code: 'POLICY_INVALID', document: null }] });
  });

  it.each(['symlink', 'hard link', 'FIFO'])('rejects a policy %s without reading private configuration targets', (kind) => {
    const path = repository();
    installCli(path);
    const policy = join(path, 'tools/public-content/policy.json');
    const target = join(path, 'content/private/policy.json');
    const bytes = readFileSync(policy);
    write(path, 'content/private/policy.json', bytes);
    rmSync(policy);
    if (kind === 'symlink') symlinkSync(target, policy);
    if (kind === 'hard link') linkSync(target, policy);
    if (kind === 'FIFO') execFileSync('mkfifo', [policy]);
    const result = cli(path);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout).diagnostics).toEqual([{ code: 'POLICY_INVALID', document: null }]);
    expect(readFileSync(target)).toEqual(bytes);
  });

  it('fails closed and closes handles when descriptor traversal is unsupported', () => {
    const path = repository();
    const count = fs.readdirSync('/proc/self/fd').length;
    const stat = fs.statSync;
    vi.spyOn(fs, 'statSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      if (String(input).startsWith('/proc/self/fd/')) throw new Error('unsafe-platform-detail');
      return Reflect.apply(stat, fs, [input, ...args]);
    }) as typeof fs.statSync);
    expect(validatePublicContent(path).diagnostics).toEqual([{ code: 'POLICY_INVALID', document: null }]);
    expect(fs.readdirSync('/proc/self/fd')).toHaveLength(count);
  });

  it('rejects invalid policy UTF-8 instead of weakening a configured rule', () => {
    const path = repository();
    installCli(path);
    write(path, 'content/public/one.md', valid() + '[source](private/secret.md)\n');
    const policyPath = join(path, 'tools/public-content/policy.json');
    const bytes = readFileSync(policyPath);
    const index = bytes.indexOf(Buffer.from('private[/'));
    expect(index).toBeGreaterThanOrEqual(0);
    bytes[index] = 0xff;
    writeFileSync(policyPath, bytes);
    const result = cli(path);
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout).diagnostics).toEqual([{ code: 'POLICY_INVALID', document: null }]);
    expect(result.stdout + result.stderr).not.toContain('secret.md');
    expect(readFileSync(policyPath)).toEqual(bytes);
  });

  it('suppresses malformed policy content in CLI output', () => {
    const path = repository();
    installCli(path);
    write(path, 'tools/public-content/policy.json', '{unsafe-policy-secret');
    const result = cli(path);
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout).diagnostics).toEqual([{ code: 'POLICY_INVALID', document: null }]);
    expect(result.stdout).not.toContain('unsafe-policy-secret');
  });

  it('rejects invalid regexes, duplicate/unknown IDs and flags even in otherwise complete policies', () => {
    const path = repository();
    const policy = JSON.parse(readFileSync(join(root, 'tools/public-content/policy.json'), 'utf8'));
    for (const patch of [{ pattern: '[' }, { pattern: '' }, { flags: 'g' }, { id: 'unsafe-policy-sentinel' }, { id: 'email' }]) {
      const modified = structuredClone(policy);
      Object.assign(modified.rules[0], patch);
      expect(codes(path)).not.toContain('POLICY_INVALID');
      expect(validatePublicContent(path, { policy: modified }).diagnostics).toEqual([{ code: 'POLICY_INVALID', document: null }]);
    }
  });
});

describe('tools/public-content/validate.ts commit provenance and CLI', () => {
  it.each(['modified', 'untracked', 'removed', 'renamed', 'raw bytes'])('rejects %s public inputs as a committed snapshot', (change) => {
    const path = repository();
    const revision = commit(path);
    if (change === 'modified') write(path, 'content/public/one.md', valid() + '\nChanged.\n');
    if (change === 'untracked') write(path, 'content/public/two.md', valid('synthetic-document-2'));
    if (change === 'removed') rmSync(join(path, 'content/public/one.md'));
    if (change === 'renamed') renameSync(join(path, 'content/public/one.md'), join(path, 'content/public/renamed.md'));
    if (change === 'raw bytes') write(path, 'content/public/one.md', valid().replaceAll('\n', '\r\n'));
    const result = validatePublicContent(path, { revision });
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics.map((d) => d.code)).toContain('SNAPSHOT_MISMATCH');
    // The current bytes, not the index, are compared, including staged changes.
    git(path, ['add', '--all']);
    expect(validatePublicContent(path, { revision }).sourceRevision).toBeNull();
  });

  it('does not treat unrelated changes as verification or require them to be clean', () => {
    const path = repository();
    const revision = commit(path);
    write(path, 'application.ts', 'unrelated change');
    write(path, 'content/public/notes.txt', 'ineligible');
    expect(validatePublicContent(path, { revision }).sourceRevision).toBe(revision);
    expect(validatePublicContent(path).sourceRevision).toBeNull();
  });

  it('requires the full 64-character commit ID in a SHA-256 repository', () => {
    const path = repository(false);
    rmSync(join(path, '.git'), { recursive: true });
    git(path, ['init', '--quiet', '--object-format=sha256']);
    write(path, 'content/public/one.md', valid());
    const revision = commit(path);
    expect(revision).toHaveLength(64);
    const abbreviated = validatePublicContent(path, { revision: revision.slice(0, 40) });
    expect(abbreviated.ok).toBe(false);
    expect(abbreviated.sourceRevision).toBeNull();
    expect(abbreviated.diagnostics).toContainEqual({ code: 'REVISION_INVALID', document: null });
    expect(validatePublicContent(path, { revision }).sourceRevision).toBe(revision);
  });

  it('rejects lossy Git filename decoding rather than equating distinct raw paths', () => {
    const path = repository(false);
    const invalidPath = Buffer.concat([
      Buffer.from(`${join(path, 'content/public')}/`), Buffer.from([0xff]), Buffer.from('.md'),
    ]);
    writeFileSync(invalidPath, valid());
    const revision = commit(path);
    renameSync(invalidPath, join(path, 'content/public/\uFFFD.md'));
    const result = validatePublicContent(path, { revision });
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics).toContainEqual({ code: 'REVISION_INVALID', document: null });
    expect(readFileSync(join(path, 'content/public/\uFFFD.md'), 'utf8')).toBe(valid());
    expect(JSON.stringify(result)).not.toContain('\uFFFD');
  });

  it('rejects invalid/abbreviated commits, tags and blobs and never claims a revision on metadata failure', () => {
    const path = repository();
    const revision = commit(path);
    git(path, ['tag', '-a', 'synthetic-tag', '-m', 'Not a commit object']);
    const tag = git(path, ['rev-parse', 'synthetic-tag']);
    const blob = git(path, ['rev-parse', 'HEAD:content/public/one.md']);
    for (const invalid of ['HEAD', revision.slice(0, 12), 'f'.repeat(40), '--all', tag, blob, '../unsafe']) {
      const result = validatePublicContent(path, { revision: invalid });
      expect(result.sourceRevision).toBeNull();
      expect(result.diagnostics.map((d) => d.code)).toContain('REVISION_INVALID');
    }
    write(path, 'content/public/one.md', valid().replace('visibility: public', 'visibility: private'));
    const invalidMetadataRevision = commit(path);
    expect(validatePublicContent(path, { revision: invalidMetadataRevision }).sourceRevision).toBeNull();
  });

  it('does not label replacement-object bytes as the replaced commit', () => {
    const path = repository();
    const revisionA = commit(path);
    write(path, 'content/public/one.md', valid() + '\nReplacement snapshot.\n');
    const revisionB = commit(path);
    git(path, ['replace', revisionA, revisionB]);
    // A normal Git read now lies about A; provenance must bypass the mapping.
    expect(git(path, ['show', `${revisionA}:content/public/one.md`])).toContain('Replacement snapshot');
    const result = validatePublicContent(path, { revision: revisionA });
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics).toContainEqual({ code: 'SNAPSHOT_MISMATCH', document: null });
    expect(validatePublicContent(path, { revision: revisionB }).sourceRevision).toBe(revisionB);
  });

  it('rejects unavailable promisor objects without lazy-fetching or changing any Git bytes', () => {
    const remote = repository();
    const revision = commit(remote);
    const blob = git(remote, ['rev-parse', `${revision}:content/public/one.md`]);
    git(remote, ['config', 'uploadpack.allowFilter', 'true']);
    git(remote, ['config', 'uploadpack.allowAnySHA1InWant', 'true']);
    const path = repository(false);
    // A local-only partial clone would ordinarily fetch this missing blob on
    // cat-file. Copy the expected worktree bytes without triggering checkout.
    rmSync(path, { recursive: true });
    execFileSync('git', ['clone', '--quiet', '--filter=blob:none', '--no-checkout', `file://${remote}`, path], { env });
    write(path, 'content/public/one.md', valid());
    expect(git(path, ['config', '--get', 'remote.origin.promisor'])).toBe('true');
    const missing = execFileSync('git', ['rev-list', '--objects', '--all', '--missing=print'], { cwd: path, env, encoding: 'utf8' });
    expect(missing).toContain(`?${blob}`);
    const snapshot = () => {
      const files: Record<string, string> = {};
      function walk(directory: string) {
        for (const entry of fs.readdirSync(join(path, directory), { withFileTypes: true })) {
          const name = `${directory}/${entry.name}`;
          if (entry.isDirectory()) walk(name);
          else files[name] = createHash('sha256').update(readFileSync(join(path, name))).digest('hex');
        }
      }
      walk('.git');
      return files;
    };
    const before = snapshot();
    const result = validatePublicContent(path, { revision });
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics).toContainEqual({ code: 'REVISION_INVALID', document: null });
    expect(snapshot()).toEqual(before);
    expect(readFileSync(join(path, 'content/public/one.md'), 'utf8')).toBe(valid());
    // Positive fixture control: the local promisor really can provide it.
    expect(git(path, ['cat-file', 'blob', blob])).toBe(valid().trim());
    expect(snapshot()).not.toEqual(before);
  });

  it('preserves trailing spaces in repository paths for provenance', () => {
    const original = repository();
    const path = `${original} `;
    renameSync(original, path);
    temporary.push(path);
    const revision = commit(path);
    expect(validatePublicContent(path, { revision })).toEqual({ ok: true, count: 1, sourceRevision: revision, diagnostics: [] });
  });

  it('ignores conflicting inherited Git redirection in the CLI', () => {
    const path = repository();
    const conflicting = repository();
    installCli(path);
    write(path, '.gitignore', 'node_modules/\n');
    const revision = commit(path);
    const result = cli(path, ['--revision', revision], path, {
      GIT_DIR: join(conflicting, '.git'), GIT_WORK_TREE: conflicting,
      GIT_INDEX_FILE: join(conflicting, 'nonexistent-index'), GIT_OBJECT_DIRECTORY: join(conflicting, 'missing-objects'),
    });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout)).toEqual({ ok: true, count: 1, sourceRevision: revision, diagnostics: [] });
    expect(fs.existsSync(join(conflicting, 'nonexistent-index'))).toBe(false);
  });

  it('rejects a historical snapshot with a link even when it is no longer on disk', () => {
    const path = repository();
    symlinkSync('../private/never-read', join(path, 'content/public/link.md'));
    const revision = commit(path);
    rmSync(join(path, 'content/public/link.md'));
    expect(validatePublicContent(path, { revision }).diagnostics.map((d) => d.code)).toContain('SNAPSHOT_MISMATCH');
  });

  it('resolves the CLI repository, not cwd, accepts only strict options and keeps all failures safe', () => {
    const path = repository();
    installCli(path);
    // Keep the dependency link out of the synthetic Git snapshot.
    write(path, '.gitignore', 'node_modules/\n');
    const revision = commit(path);
    const elsewhere = repository(false);
    for (const args of [[], ['--revision', revision]]) {
      const result = cli(path, args, elsewhere);
      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout)).toEqual({ ok: true, count: 1, sourceRevision: args.length ? revision : null, diagnostics: [] });
    }
    expect(cli(path, ['--help']).status).toBe(0);
    expect(cli(path, ['--help']).stdout).toContain('Usage:');
    for (const args of [['--root', '/unsafe-private-sentinel'], ['--revision'], ['--help', 'extra'],
      ['--revision', revision, '--revision', revision], ['--revision=HEAD'], ['--revision', 'HEAD']]) {
      const result = cli(path, args);
      expect(result.status).toBe(1);
      expect(result.stderr).toBe('');
      expect(result.stdout).not.toContain('unsafe-private-sentinel');
      expect(JSON.parse(result.stdout).sourceRevision).toBeNull();
    }
  });
});


describe('tools/public-content/validate.ts point-in-time freshness', () => {
  it.each([
    ['local', 'new Markdown'], ['revision', 'new Markdown'],
    ['local', 'nested Markdown'], ['revision', 'nested Markdown'],
    ['local', 'removed Markdown'], ['revision', 'removed Markdown'],
    ['local', 'in-place replacement'], ['revision', 'in-place replacement'],
    ['local', 'same-byte rewrite'], ['revision', 'same-byte rewrite'],
  ])('rejects %s inputs changed by %s immediately after the initial read', (mode, change) => {
    const path = repository();
    mkdirSync(join(path, 'content/public/nested'));
    const revision = commit(path);
    const source = join(path, 'content/public/one.md');
    const inode = fs.statSync(source).ino;
    const read = fs.readFileSync;
    let mutated = false;
    vi.spyOn(fs, 'readFileSync').mockImplementation(((input: fs.PathOrFileDescriptor, ...args: unknown[]) => {
      const matches = typeof input === 'number' && fs.fstatSync(input).ino === inode;
      const bytes = Reflect.apply(read, fs, [input, ...args]);
      if (matches && !mutated) {
        mutated = true;
        if (change === 'new Markdown') write(path, 'content/public/late-sensitive-name.md', valid('late') + 'SYNTHETIC_PRIVATE_LATE');
        if (change === 'nested Markdown') write(path, 'content/public/nested/late.md', valid('late'));
        if (change === 'removed Markdown') rmSync(source);
        if (change === 'in-place replacement') {
          const replacement = valid().replace('# Fiction, not career evidence', 'SYNTHETIC_PRIVATE_REPLACEMENT');
          writeFileSync(source, replacement.padEnd(Buffer.byteLength(valid()), ' '));
        }
        if (change === 'same-byte rewrite') {
          writeFileSync(source, valid());
          // A deterministic metadata-only change must also invalidate the read.
          fs.utimesSync(source, new Date(0), new Date(0));
        }
      }
      return bytes;
    }) as typeof fs.readFileSync);
    const result = validatePublicContent(path, mode === 'revision' ? { revision } : {});
    expect(mutated).toBe(true);
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(JSON.stringify(result)).not.toContain('sensitive');
    expect(JSON.stringify(result)).not.toContain('REPLACEMENT');
  });

  it.each([
    ['local', 'replacement'], ['revision', 'replacement'],
    ['local', 'same-byte rewrite'], ['revision', 'same-byte rewrite'],
  ])('rejects a %s %s after cached metadata validation and before the final read', (mode, change) => {
    const path = repository();
    const revision = commit(path);
    const source = join(path, 'content/public/one.md');
    const inode = fs.statSync(join(path, 'content/public')).ino;
    const readdir = fs.readdirSync;
    let listings = 0;
    vi.spyOn(fs, 'readdirSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      const entries = Reflect.apply(readdir, fs, [input, ...args]);
      if (fs.statSync(input).ino === inode && ++listings === 2) {
        writeFileSync(source, change === 'replacement'
          ? valid().replace('Fiction — test only', 'SYNTHETIC_PRIVATE_REPLACEMENT') : valid());
        if (change === 'same-byte rewrite') fs.utimesSync(source, new Date(0), new Date(0));
      }
      return entries;
    }) as typeof fs.readdirSync);
    const result = validatePublicContent(path, mode === 'revision' ? { revision } : {});
    expect(listings).toBe(3);
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics).toContainEqual({ code: 'SOURCE_READ', document: 1 });
    expect(JSON.stringify(result)).not.toContain('REPLACEMENT');
  });

  it.each(['local', 'revision'])('rejects file metadata changed after final byte comparison in %s mode', (mode) => {
    const path = repository();
    const revision = commit(path);
    const source = join(path, 'content/public/one.md');
    const inode = fs.statSync(join(path, 'content/public')).ino;
    const readdir = fs.readdirSync;
    let listings = 0;
    vi.spyOn(fs, 'readdirSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      const entries = Reflect.apply(readdir, fs, [input, ...args]);
      if (fs.statSync(input).ino === inode && ++listings === 3) {
        writeFileSync(source, valid().replace('Fiction — test only', 'SYNTHETIC_PRIVATE_FINAL'));
      }
      return entries;
    }) as typeof fs.readdirSync);
    const result = validatePublicContent(path, mode === 'revision' ? { revision } : {});
    expect(listings).toBe(3);
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics).toContainEqual({ code: 'SOURCE_READ', document: 1 });
    expect(JSON.stringify(result)).not.toContain('SYNTHETIC_PRIVATE_FINAL');
  });

  it.each(['local', 'revision'])('rechecks complete membership after final byte reads in %s mode', (mode) => {
    const path = repository();
    const revision = commit(path);
    const inode = fs.statSync(join(path, 'content/public/one.md')).ino;
    const read = fs.readFileSync;
    let reads = 0;
    vi.spyOn(fs, 'readFileSync').mockImplementation(((input: fs.PathOrFileDescriptor, ...args: unknown[]) => {
      const matches = typeof input === 'number' && fs.fstatSync(input).ino === inode;
      const bytes = Reflect.apply(read, fs, [input, ...args]);
      if (matches && ++reads === 2) write(path, 'content/public/late.md', valid('late'));
      return bytes;
    }) as typeof fs.readFileSync);
    const result = validatePublicContent(path, mode === 'revision' ? { revision } : {});
    expect(reads).toBe(2);
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(result.diagnostics).toContainEqual({ code: 'SOURCE_BOUNDARY', document: null });
  });

  it.each(['new Markdown', 'in-place replacement'])('rechecks %s after Git has compared cached bytes', (change) => {
    const path = repository();
    const revision = commit(path);
    const spawn = childProcess.spawnSync;
    let mutated = false;
    vi.spyOn(childProcess, 'spawnSync').mockImplementation(((command: string, args: string[], options: unknown) => {
      const result = Reflect.apply(spawn, childProcess, [command, args, options]);
      if (args.includes('blob') && !mutated) {
        mutated = true;
        if (change === 'new Markdown') write(path, 'content/public/late.md', valid('late'));
        else write(path, 'content/public/one.md', valid().replace('Fiction — test only', 'SYNTHETIC_PRIVATE_LATE'));
      }
      return result;
    }) as typeof childProcess.spawnSync);
    const result = validatePublicContent(path, { revision });
    expect(mutated).toBe(true);
    expect(result.ok).toBe(false);
    expect(result.sourceRevision).toBeNull();
    expect(JSON.stringify(result)).not.toContain('SYNTHETIC_PRIVATE_LATE');
  });

  it.each(['local', 'revision'])('ignores unrelated directory-link-count changes and ineligible files during %s collection', (mode) => {
    const path = repository();
    const revision = commit(path);
    const inode = fs.statSync(join(path, 'content/public')).ino;
    const readdir = fs.readdirSync;
    let mutated = false;
    vi.spyOn(fs, 'readdirSync').mockImplementation(((input: fs.PathLike, ...args: unknown[]) => {
      const entries = Reflect.apply(readdir, fs, [input, ...args]);
      if (!mutated && fs.statSync(input).ino === inode) {
        mutated = true;
        mkdirSync(join(path, 'unrelated-application-directory'));
        write(path, 'content/public/notes.txt', 'ineligible');
      }
      return entries;
    }) as typeof fs.readdirSync);
    expect(validatePublicContent(path, mode === 'revision' ? { revision } : {})).toEqual({
      ok: true, count: 1, sourceRevision: mode === 'revision' ? revision : null, diagnostics: [],
    });
    expect(mutated).toBe(true);
  });
});
