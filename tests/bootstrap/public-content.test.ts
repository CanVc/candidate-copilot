import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { describe, expect, it } from 'vitest';

// All content, approvals and repositories here are disposable synthetic data.
// The real corpus/private preparation is never inspected by this suite.
const root = fileURLToPath(new URL('../../', import.meta.url));
const script = join(root, 'scripts/public-content.mjs');
const id = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const docPath = 'content/public/document.md';
const ledgerPath = 'docs/content/document-identities.json';
const coveragePath = 'docs/content/coverage.md';
const date = '2024-02-29T12:34:56Z';
function document(body = '# Synthetic document\n\nSynthetic facts only.\n') {
  return `---\ndocument_id: "${id}"\nvisibility: public\ntitle: "Synthetic document"\ncreated_at: "${date}"\nmodified_at: "${date}"\nreviewed_by: "Synthetic reviewer"\nreviewed_at: "${date}"\n---\n${body}`;
}
function coverage() {
  return `---\nstatus: accepted\naccepted_by: "Synthetic reviewer"\naccepted_at: "${date}"\nquestions:\n  - question: "What does this synthetic document demonstrate?"\n    document_ids: ["${id}"]\n    gaps: ["Synthetic fixture, not career evidence."]\n---\n# Synthetic acceptance only\n`;
}
type Entry = { document_id: string; path: string; status: string };
function fixture() {
  const cwd = mkdtempSync(join(tmpdir(), 'public-content-'));
  const put = (path: string, value: string | Buffer) => {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), value);
  };
  const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' } }).trim();
  const identities = (entries: Entry[] = [{ document_id: id, path: docPath, status: 'active' }]) => put(ledgerPath, `${JSON.stringify({ schema_version: 1, documents: entries })}\n`);
  put('tools/public-content/forbidden-markers.json', readFileSync(join(root, 'tools/public-content/forbidden-markers.json')));
  put('.gitignore', 'content/private/\n');
  put(docPath, document());
  put(coveragePath, coverage());
  identities();
  git('init', '--quiet');
  git('config', 'user.name', 'Synthetic');
  git('config', 'user.email', 'synthetic@example.invalid');
  const commit = () => { git('add', '--all'); git('commit', '--quiet', '-m', 'Synthetic fixture'); return git('rev-parse', 'HEAD'); };
  const sha = commit();
  const run = (...args: string[]) => {
    const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', timeout: 10_000 });
    expect(result.error).toBeUndefined();
    expect(result.signal).toBeNull();
    expect(result.stderr).toBe('');
    const data = JSON.parse(result.stdout) as { ok: boolean; file_count: number; revision?: string; errors: { code: string; ref: string; count: number }[] };
    expect(result.status).toBe(data.ok ? 0 : 1);
    return { ...result, data, codes: data.errors.map((error) => error.code) };
  };
  return { cwd, put, git, identities, commit, sha, run, clean: () => rmSync(cwd, { recursive: true, force: true }) };
}
function snapshot(directory: string): Record<string, string> {
  const result: Record<string, string> = {};
  function walk(relative: string) {
    for (const name of readdirSync(join(directory, relative)).sort()) {
      const file = join(relative, name);
      const stat = lstatSync(join(directory, file));
      if (stat.isDirectory()) walk(file);
      else result[file] = `${stat.mode}:${stat.size}:${stat.mtimeMs}:${readFileSync(join(directory, file)).toString('base64')}`;
    }
  }
  walk('');
  return result;
}

describe('read-only public content checks', () => {
  it('has explicit package commands and pinned parsers', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.scripts['content:check']).toBe('node scripts/public-content.mjs check');
    expect(pkg.scripts['content:verify']).toBe('node scripts/public-content.mjs verify');
    for (const parser of ['yaml', 'markdown-it', 'parse5']) expect(pkg.devDependencies[parser]).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('succeeds deterministically without any filesystem or index write', () => {
    const f = fixture();
    try {
      const before = snapshot(f.cwd);
      const first = f.run('check');
      expect(first.data).toMatchObject({ ok: true, file_count: 1, errors: [] });
      expect(f.run('check').stdout).toBe(first.stdout);
      const verified = f.run('verify', '--revision', f.sha);
      expect(verified.data).toMatchObject({ ok: true, revision: f.sha, file_count: 1 });
      expect(f.run('verify', '--revision', f.sha).stdout).toBe(verified.stdout);
      expect(snapshot(f.cwd)).toEqual(before);
    } finally { f.clean(); }
  });

  it.each([
    ['missing', (s: string) => s.replace(/^title:.*\n/m, '')],
    ['empty reviewer', (s: string) => s.replace('"Synthetic reviewer"', '""')],
    ['placeholder title', (s: string) => s.replace('title: "Synthetic document"', 'title: "TBD"')],
    ['private visibility', (s: string) => s.replace('visibility: public', 'visibility: private')],
    ['missing id', (s: string) => s.replace(/^document_id:.*\n/m, '')],
    ['duplicate', (s: string) => s.replace('title:', 'title: "duplicate"\ntitle:')],
    ['nested duplicate', (s: string) => s.replace('title:', 'extra: {x: 1, x: 2}\ntitle:')],
    ['alias', (s: string) => s.replace('title:', 'extra: &anchor [safe]\naliases: *anchor\ntitle:')],
    ['merge', (s: string) => s.replace('title:', 'extra: {<<: {x: 1}}\ntitle:')],
    ['tag', (s: string) => s.replace('title: "Synthetic document"', 'title: !!str "Synthetic document"')],
    ['multiple yaml documents', (s: string) => s.replace('visibility: public', '...\n---\nvisibility: public')],
    ['malformed', (s: string) => s.replace('visibility: public', 'visibility: [')],
    ['invalid UTF-8', () => Buffer.from([0xff])],
    ['empty body', () => document('')],
  ])('rejects %s metadata safely', (_name, change) => {
    const f = fixture();
    try {
      f.put(docPath, change(document()));
      const result = f.run('check');
      expect(result.data.ok).toBe(false);
      expect(result.codes.some((code) => ['METADATA', 'FRONTMATTER_OR_INPUT'].includes(code))).toBe(true);
      expect(result.stdout).not.toContain('Synthetic reviewer');
    } finally { f.clean(); }
  });

  it.each([
    '2023-02-29T12:34:56Z', '2024-02-30T12:34:56Z', '2024-13-01T12:34:56Z',
    '2024-04-31T12:34:56Z', '2024-01-00T12:34:56Z', '2024-01-01T24:00:00Z',
    '2024-01-01T12:60:00Z', '2024-01-01T12:34:60Z', '2024-01-01T12:34Z',
    '2024-01-01', '2024-01-01T12:34:56+00:00', '2024-01-01T12:34:56.000Z', '', 'UNKNOWN',
  ])('rejects invalid documentary date %s in every field', (invalid) => {
    const f = fixture();
    try {
      for (const key of ['created_at', 'modified_at', 'reviewed_at']) {
        f.put(docPath, document().replace(`${key}: "${date}"`, `${key}: "${invalid}"`));
        expect(f.run('check').codes).toContain('METADATA');
      }
    } finally { f.clean(); }
  });

  it('requires quoted timestamps and permits optional metadata', () => {
    const f = fixture();
    try {
      for (const key of ['created_at', 'modified_at', 'reviewed_at']) {
        f.put(docPath, document().replace(`${key}: "${date}"`, `${key}: ${date}`));
        expect(f.run('check').codes).toContain('METADATA');
      }
      f.put(docPath, document().replace('visibility: public', 'visibility: public\ntopics: [synthetic]\naliases: [example]'));
      expect(f.run('check').data.ok).toBe(true);
      // Decision B: inserting publication metadata can occur after reviewed_at;
      // final-byte confirmation does not replace the decision timestamp.
      f.put(docPath, document().replace(`modified_at: "${date}"`, 'modified_at: "2024-02-29T12:40:00Z"'));
      expect(f.run('check').data.ok).toBe(true);
    } finally { f.clean(); }
  });

  it('rejects duplicate IDs and missing/duplicate ledger bindings', () => {
    const f = fixture();
    try {
      f.put('content/public/other.md', document());
      expect(f.run('check').codes).toContain('DUPLICATE_ID');
      rmSync(join(f.cwd, 'content/public/other.md'));
      f.identities([]);
      expect(f.run('check').codes).toContain('IDENTITY_BINDING');
      f.identities([{ document_id: id, path: docPath, status: 'active' }, { document_id: id, path: 'content/public/other.md', status: 'active' }]);
      expect(f.run('check').codes).toContain('IDENTITY_LEDGER');
      f.identities([{ document_id: id, path: docPath, status: 'active' }, { document_id: otherId, path: docPath, status: 'active' }]);
      expect(f.run('check').codes).toContain('IDENTITY_LEDGER');
      f.put(ledgerPath, '{"schema_version":1,"schema_version":1,"documents":[]}');
      expect(f.run('check').codes).toContain('IDENTITY_LEDGER');
    } finally { f.clean(); }
  });

  it('treats uppercase/lowercase UUID spellings as the same identity', () => {
    const f = fixture();
    const mixedId = 'abcdefab-abcd-4abc-8abc-abcdefabcdef';
    try {
      f.put(docPath, document().replace(id, mixedId.toUpperCase()));
      f.put('content/public/other.md', document().replace(id, mixedId));
      f.identities([{ document_id: mixedId, path: docPath, status: 'active' }]);
      f.put(coveragePath, coverage().replace(id, mixedId));
      expect(f.run('check').codes).toContain('DUPLICATE_ID');
      rmSync(join(f.cwd, 'content/public/other.md'));
      // Retain the original ID as retired in the history-aware ledger.
      f.identities([{ document_id: id, path: docPath, status: 'retired' }, { document_id: mixedId, path: docPath, status: 'active' }]);
      expect(f.run('check').data.ok).toBe(true);
    } finally { f.clean(); }
  });

  it('preserves identity across rename and permanent retirement', () => {
    const f = fixture();
    try {
      const renamed = 'content/public/renamed.md';
      renameSync(join(f.cwd, docPath), join(f.cwd, renamed));
      f.identities([{ document_id: id, path: renamed, status: 'active' }]);
      expect(f.run('check').data.ok).toBe(true); // Semantic review remains human-owned.
      const renamedSha = f.commit();
      expect(f.run('verify', '--revision', renamedSha).data.ok).toBe(true);
      expect(f.run('verify', '--revision', f.sha).codes).toContain('SNAPSHOT_MISMATCH');
      // Replacing the ID instead of preserving it loses historical identity.
      f.put(renamed, document().replace(id, otherId));
      f.put(coveragePath, coverage().replace(id, otherId));
      f.identities([{ document_id: otherId, path: renamed, status: 'active' }]);
      expect(f.run('check').codes).toContain('GIT_OR_IDENTITY_HISTORY');
      f.identities([{ document_id: id, path: renamed, status: 'retired' }, { document_id: otherId, path: renamed, status: 'active' }]);
      expect(f.run('check').data.ok).toBe(true);
      f.commit();
      // IDs cannot reactivate or disappear, even if the latest ledger were rewritten.
      f.identities([{ document_id: id, path: renamed, status: 'active' }, { document_id: otherId, path: renamed, status: 'retired' }]);
      f.put(renamed, document());
      f.put(coveragePath, coverage());
      expect(f.run('check').codes).toContain('GIT_OR_IDENTITY_HISTORY');
      f.identities([{ document_id: otherId, path: renamed, status: 'active' }]);
      expect(f.run('check').codes).toContain('GIT_OR_IDENTITY_HISTORY');
    } finally { f.clean(); }
  });

  it.each([
    '[x](../outside.md)', '![x](../../outside.md)', '[x](%2e%2e/%2e%2e/outside.md)',
    '[x](%252e%252e/%252e%252e/outside.md)', '[x](%2Foutside.md)', '[x](file:///outside.md)',
    '[x](%23/../../outside.md)', '[x](%3f/../../outside.md)',
    '[x](..%5coutside.md)', '[x][ref]\n\n[ref]: ../outside.md', '[ref]: ../outside.md',
    '<a href="&#46;&#46;/outside.md">x</a>', '<img src="../outside.md">',
    '<video poster="../outside.md"></video>', '<img srcset="document.md 1x, ../outside.md 2x">',
    '<svg><use xlink:href="../outside.md" /></svg>', '<a ping="../outside.md">x</a>',
    '<meta http-equiv="refresh" content="0;url=../outside.md">', '<base href="https://example.invalid/">',
    '<div style="background:url(../outside.md)">x</div>', '<iframe srcdoc="unsafe"></iframe>',
    '[x](does-not-exist.md)',
  ])('rejects escaping/unsafe link form %s', (body) => {
    const f = fixture();
    try {
      f.put(docPath, document(body));
      expect(f.run('check').codes).toContain('UNSAFE_REFERENCE');
    } finally { f.clean(); }
  });

  it('handles nested, escaped, reference, image and HTML links without fetching', () => {
    const f = fixture();
    try {
      f.put('content/public/with space.md', document().replace(id, otherId));
      f.identities([{ document_id: id, path: docPath, status: 'active' }, { document_id: otherId, path: 'content/public/with space.md', status: 'active' }]);
      f.put(coveragePath, coverage().replace(`document_ids: ["${id}"]`, `document_ids: ["${id}", "${otherId}"]`));
      f.put('content/public/image.png', 'SYNTHETIC_IMAGE');
      f.put(docPath, document('[x](with%20space.md)\n![image](image.png)\n[x][ref]\n\n[ref]: document.md\n\n<a href="document.md#section">x</a>\n<img src="image.png">\n[x](https://example.invalid/not-fetched)\n[x](//example.invalid/not-fetched)\n[x](#section)'));
      expect(f.run('check').data.ok).toBe(true);
      expect(f.run('verify', '--revision', f.commit()).data.ok).toBe(true);
    } finally { f.clean(); }
  });

  it.each(['content', 'content/public', docPath, 'docs', ledgerPath, coveragePath, 'tools/public-content'])('rejects symlink input/ancestor %s', (relative) => {
    const f = fixture();
    const outside = mkdtempSync(join(tmpdir(), 'synthetic-public-outside-'));
    try {
      renameSync(join(f.cwd, relative), join(outside, 'target'));
      symlinkSync(join(outside, 'target'), join(f.cwd, relative));
      expect(f.run('check').data.ok).toBe(false);
    } finally { f.clean(); rmSync(outside, { recursive: true, force: true }); }
  });

  it('rejects local symlinks even when followed by parent traversal, before opening targets', () => {
    const f = fixture();
    try {
      // A deliberately unreadable/nonregular outside target: no read may occur.
      f.put('outside/never-open', 'SYNTHETIC_PRIVATE_SENTINEL');
      symlinkSync(join(f.cwd, 'outside'), join(f.cwd, 'content/public/linked'));
      f.put(docPath, document('[x](linked/../document.md)'));
      const result = f.run('check');
      expect(result.codes).toContain('UNSAFE_INPUT');
      expect(result.codes).toContain('UNSAFE_REFERENCE');
      expect(result.stdout).not.toContain('SYNTHETIC_PRIVATE_SENTINEL');
      rmSync(join(f.cwd, 'content/public/linked'));
      execFileSync('mkfifo', [join(f.cwd, 'content/public/nonregular.md')]);
      expect(f.run('check').codes).toContain('UNSAFE_INPUT');
    } finally { f.clean(); }
  });

  it.each(['PRIVATE_CANARY_VALUE_DO_NOT_ECHO', 'SYNTHETIC_PRIVATE_SENTINEL', 'person@example.invalid', 'password=SYNTHETIC_SECRET', '-----BEGIN PRIVATE KEY-----', '+33 6 12 34 56 78'])('rejects forbidden marker without leaking %s', (marker) => {
    const f = fixture();
    try {
      const unsafeName = 'content/public/PRIVATE_CANARY_FILENAME\nunsafe.md';
      rmSync(join(f.cwd, docPath));
      f.put(unsafeName, document(marker));
      f.identities([{ document_id: id, path: unsafeName, status: 'active' }]);
      const result = f.run('check');
      expect(result.codes).toContain('FORBIDDEN_MARKER');
      expect(result.stdout + result.stderr).not.toContain(marker);
      expect(result.stdout + result.stderr).not.toContain('PRIVATE_CANARY_FILENAME');
      expect(result.stdout + result.stderr).not.toContain(unsafeName);
    } finally { f.clean(); }
  });

  it('fails safely on Git diagnostics, missing config, malformed coverage and empty corpus', () => {
    const f = fixture();
    try {
      f.git('config', 'core.repositoryformatversion', '999');
      expect(f.run('check').codes).toContain('GIT_OR_IDENTITY_HISTORY');
      // No raw stderr such as "Expected git repo version" may escape.
      const config = readFileSync(join(f.cwd, '.git/config'), 'utf8').replace('repositoryformatversion = 999', 'repositoryformatversion = 0');
      f.put('.git/config', config);
      f.put('tools/public-content/forbidden-markers.json', '{}');
      expect(f.run('check').codes).toContain('MARKER_CONFIG');
      f.put(coveragePath, coverage().replace('status: accepted', 'status: pending'));
      expect(f.run('check').codes).toContain('COVERAGE_NOT_ACCEPTED');
      f.put(coveragePath, coverage().replace(id, otherId));
      expect(f.run('check').codes).toContain('COVERAGE_NOT_ACCEPTED');
      rmSync(join(f.cwd, docPath));
      expect(f.run('check').codes).toContain('EMPTY_CORPUS');
      f.put('content/public/README.md', document());
      expect(f.run('check').codes).toContain('METADATA');
    } finally { f.clean(); }
  });
});

describe('exact committed public provenance', () => {
  it.each(['unstaged', 'staged', 'deleted', 'staged-deleted', 'untracked', 'ignored-public', 'index-only', 'coverage', 'identities', 'asset', 'mode'])('rejects %s mismatch', (kind) => {
    const f = fixture();
    try {
      if (kind === 'unstaged' || kind === 'staged') {
        f.put(docPath, document('# Edited synthetic text\n'));
        if (kind === 'staged') f.git('add', docPath);
      } else if (kind === 'deleted' || kind === 'staged-deleted') {
        rmSync(join(f.cwd, docPath));
        if (kind === 'staged-deleted') f.git('add', docPath);
      } else if (kind === 'untracked' || kind === 'ignored-public') {
        if (kind === 'ignored-public') f.put('.gitignore', 'content/private/\ncontent/public/untracked.md\n');
        f.put('content/public/untracked.md', document().replace(id, otherId));
      } else if (kind === 'index-only') {
        f.put(docPath, document('# Staged synthetic bytes\n'));
        f.git('add', docPath);
        f.put(docPath, document());
      } else if (kind === 'coverage') f.put(coveragePath, `${coverage()}\nChanged coverage\n`);
      else if (kind === 'identities') f.put(ledgerPath, `${readFileSync(join(f.cwd, ledgerPath), 'utf8')}\n`);
      else if (kind === 'asset') f.put('content/public/untracked.png', 'SYNTHETIC_ASSET');
      else chmodSync(join(f.cwd, docPath), 0o755);
      expect(f.run('verify', '--revision', f.sha).codes).toContain('SNAPSHOT_MISMATCH');
    } finally { f.clean(); }
  });

  it('ignores private/unrelated changes, never certifies noncommit/abbreviated revisions or unsafe snapshot modes', () => {
    const f = fixture();
    try {
      f.put('content/private/ignored.md', 'SYNTHETIC_PRIVATE_SENTINEL');
      f.put('unrelated.txt', 'not in the public snapshot');
      f.put('.gitignore', 'content/private/\n# unrelated change\n');
      expect(f.run('verify', '--revision', f.sha).data.ok).toBe(true);
      for (const revision of [f.sha.slice(0, 12), 'HEAD', '--help', 'PRIVATE_CANARY_BAD_REVISION']) {
        const result = f.run('verify', '--revision', revision);
        expect(result.codes).toContain('ARGUMENTS');
        expect(result.stdout).not.toContain(revision);
      }
      const tree = f.git('rev-parse', `${f.sha}^{tree}`);
      expect(f.run('verify', '--revision', tree).codes).toContain('SNAPSHOT_MISMATCH');
      const blob = f.git('rev-parse', `${f.sha}:${docPath}`);
      expect(f.run('verify', '--revision', blob).codes).toContain('SNAPSHOT_MISMATCH');
      f.git('update-index', '--cacheinfo', `120000,${blob},${docPath}`);
      // Commit the index directly; no symlink is ever followed in the workspace.
      const unsafeTree = f.git('write-tree');
      const unsafeCommit = f.git('commit-tree', unsafeTree, '-p', f.sha, '-m', 'Synthetic unsafe mode');
      expect(f.run('verify', '--revision', unsafeCommit).codes).toContain('SNAPSHOT_MISMATCH');
    } finally { f.clean(); }
  });
});
