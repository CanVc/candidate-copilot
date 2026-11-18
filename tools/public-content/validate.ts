import { spawnSync } from 'node:child_process';
import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync, readdirSync, statSync, type Stats } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { isAlias, isMap, isScalar, isSeq, parseDocument, visit } from 'yaml';

const fields = ['document_id', 'visibility', 'title', 'created_at', 'modified_at', 'reviewed_by', 'reviewed_at'] as const;
const listFields = ['topics', 'aliases', 'document_ids'] as const;
const resourceFields = ['resource_id', 'resource_name', 'resource_description'] as const;
type Field = typeof fields[number] | typeof listFields[number] | typeof resourceFields[number];
const publicFields = new Set<string>([...fields, ...listFields, ...resourceFields]);
const ruleIds = ['private_path', 'synthetic_private', 'private_key', 'email', 'contact_uri'] as const;
type RuleId = typeof ruleIds[number];
type Code = 'POLICY_INVALID' | 'SOURCE_BOUNDARY' | 'SOURCE_READ' | 'EMPTY_CORPUS' | 'FRONTMATTER_INVALID' |
  'YAML_INVALID' | 'YAML_UNSUPPORTED' | 'METADATA_INVALID' | 'TIMESTAMP_INVALID' | 'DUPLICATE_ID' |
  'REVISION_INVALID' | 'SNAPSHOT_MISMATCH' | `FORBIDDEN_${Uppercase<RuleId>}`;
export interface Diagnostic {
  code: Code;
  document: number | null;
  field?: Field;
}
export interface ValidationResult {
  ok: boolean;
  count: number;
  sourceRevision: string | null;
  diagnostics: Diagnostic[];
}
interface Source { path: string; bytes: Buffer; observation: Stats; ordinal: number }
interface Rule { id: RuleId; expression: RegExp }

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
}

function loadPolicy(input: unknown): Rule[] {
  if (!input || typeof input !== 'object' || !('rules' in input) ||
      Object.keys(input).length !== 1 || !Array.isArray(input.rules) || input.rules.length !== ruleIds.length) throw new Error();
  const seen = new Set<string>();
  return input.rules.map((rule: unknown) => {
    if (!rule || typeof rule !== 'object') throw new Error();
    const r = rule as Record<string, unknown>;
    if (Object.keys(r).sort().join(',') !== 'flags,id,pattern' ||
        !ruleIds.includes(r.id as RuleId) || seen.has(r.id as string) ||
        typeof r.pattern !== 'string' || !r.pattern.trim() || r.flags !== 'i') throw new Error();
    seen.add(r.id as string);
    return { id: r.id as RuleId, expression: new RegExp(r.pattern, r.flags) };
  });
}

// Linux procfs paths refer to our already-open parent, not a mutable ancestor
// pathname. Every component is opened without following links and identity is
// checked before/after opening and after use. No private target is dereferenced.
export function descriptorPath(fd: number, name?: string): string {
  return `/proc/self/fd/${fd}${name === undefined ? '' : `/${name}`}`;
}
export function sameEntry(a: Stats, b: Stats): boolean {
  return a.dev === b.dev && a.ino === b.ino && a.mode === b.mode && (a.isDirectory() || a.nlink === b.nlink);
}
function sameObservation(a: Stats, b: Stats): boolean {
  return sameEntry(a, b) && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;
}
interface PinnedEntry { fd: number; check: () => void }
export function openEntry(parent: number, name: string, directory: boolean): PinnedEntry {
  const path = descriptorPath(parent, name);
  const before = lstatSync(path);
  if (directory ? !before.isDirectory() : !before.isFile() || before.nlink !== 1) throw new Error();
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK |
    (directory ? constants.O_DIRECTORY : 0));
  const check = () => {
    const opened = fstatSync(fd);
    if (!sameEntry(before, opened) || !sameEntry(opened, lstatSync(path)) ||
        (!directory && (!sameObservation(before, opened) || !sameObservation(opened, lstatSync(path))))) throw new Error();
  };
  try { check(); return { fd, check }; }
  catch (error) { closeSync(fd); throw error; }
}
export function pinDirectory(path: string): { fd: number; check: () => void; close: () => void } {
  if (process.platform !== 'linux' || !constants.O_NOFOLLOW || !constants.O_DIRECTORY) throw new Error();
  const entries: PinnedEntry[] = [];
  try {
    const fd = openSync('/', constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
    entries.push({ fd, check: () => {
      const stat = fstatSync(fd);
      if (!stat.isDirectory() || !sameEntry(stat, lstatSync('/')) ||
          !sameEntry(stat, statSync(descriptorPath(fd)))) throw new Error();
    } });
    entries[0]!.check();
    for (const component of resolve(path).split('/').filter(Boolean)) {
      entries.push(openEntry(entries.at(-1)!.fd, component, true));
    }
    return { fd: entries.at(-1)!.fd, check: () => { for (const entry of entries) entry.check(); },
      close: () => { for (const entry of entries.reverse()) closeSync(entry.fd); } };
  } catch (error) {
    for (const entry of entries.reverse()) closeSync(entry.fd);
    throw error;
  }
}
function readOrdinary(parent: number, name: string): { bytes: Buffer; observation: Stats } {
  const entry = openEntry(parent, name, false);
  try {
    const observation = fstatSync(entry.fd);
    const bytes = readFileSync(entry.fd);
    entry.check();
    if (bytes.length !== observation.size) throw new Error();
    return { bytes, observation };
  } finally { closeSync(entry.fd); }
}
function readConfiguration(path: string): Buffer {
  const directory = pinDirectory(dirname(path));
  try {
    const { bytes } = readOrdinary(directory.fd, basename(path));
    directory.check();
    return bytes;
  } finally { directory.close(); }
}

function validTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false;
  const time = new Date(value);
  return Number.isFinite(time.getTime()) && time.toISOString() === value.replace('Z', '.000Z');
}

// This adapter accepts a repository root for disposable rehearsals. It never
// accepts source paths: collection is always confined to content/public.
export interface CommittedSource { path: string; bytes: Buffer }
export interface CommittedValidation extends ValidationResult { sources?: CommittedSource[] }

export function validatePublicContent(repositoryRoot: string, options: { revision?: string; policy?: unknown } = {}): ValidationResult {
  return validate(repositoryRoot, options, false);
}

// Bytes are returned only after the entire corpus, Git snapshot and freshness
// checks pass. Builders never reopen mutable source paths after this handoff.
export function readCommittedPublicContent(repositoryRoot: string, revision: string): CommittedValidation {
  return validate(repositoryRoot, { revision }, true);
}

function validate(repositoryRoot: string, options: { revision?: string; policy?: unknown }, includeSources: boolean): CommittedValidation {
  const diagnostics: Diagnostic[] = [];
  const sources: Source[] = [];
  const committed: CommittedSource[] = [];
  const add = (code: Code, document: number | null = null, field?: Field) => {
    diagnostics.push({ code, document, ...(field ? { field } : {}) });
  };
  const finish = (revision: string | null = null): CommittedValidation => ({
    ok: diagnostics.length === 0, count: sources.length,
    sourceRevision: diagnostics.length === 0 ? revision : null, diagnostics,
    ...(includeSources && !diagnostics.length && revision ? { sources: committed } : {}),
  });
  let rules: Rule[];
  try {
    rules = loadPolicy(options.policy === undefined
      ? JSON.parse(decodeUtf8(readConfiguration(fileURLToPath(new URL('./policy.json', import.meta.url)))))
      : options.policy);
  } catch { add('POLICY_INVALID'); return finish(); }
  const scan = (text: string, ordinal: number) => {
    for (const rule of rules) {
      const code = `FORBIDDEN_${rule.id.toUpperCase()}` as Code;
      if (rule.expression.test(text) && !diagnostics.some((d) => d.code === code && d.document === ordinal)) add(code, ordinal);
    }
  };
  const root = resolve(repositoryRoot);
  let repository: ReturnType<typeof pinDirectory>;
  try { repository = pinDirectory(root); }
  catch { add('SOURCE_BOUNDARY'); return finish(); }
  const directories: PinnedEntry[] = [];
  try {
    let ordinal = 0;
    function collect(parent: number, relative: string, phase: 'initial' | 'bytes' | 'membership' = 'initial', seen = new Set<string>()) {
      for (const name of readdirSync(descriptorPath(parent)).sort()) {
        const path = `${relative}/${name}`;
        const stat = lstatSync(descriptorPath(parent, name));
        if (stat.isDirectory()) {
          const directory = openEntry(parent, name, true);
          directories.push(directory);
          collect(directory.fd, path, phase, seen);
          directory.check();
        } else if (!stat.isFile() || stat.nlink !== 1) {
          add('SOURCE_BOUNDARY', phase === 'initial' ? ++ordinal : null);
        } else if (name.endsWith('.md')) {
          if (phase !== 'initial') {
            seen.add(path);
            const source = sources.find((source) => source.path === path);
            if (!source) { add('SOURCE_BOUNDARY'); continue; }
            if (phase === 'membership') {
              if (!sameObservation(source.observation, stat)) add('SOURCE_READ', source.ordinal);
              continue;
            }
            try {
              const current = readOrdinary(parent, name);
              if (!sameObservation(source.observation, current.observation) || !source.bytes.equals(current.bytes)) {
                add('SOURCE_READ', source.ordinal);
              }
            } catch { add('SOURCE_READ', source.ordinal); }
          } else {
            const document = ++ordinal;
            scan(path, document);
            try { sources.push({ path, ...readOrdinary(parent, name), ordinal: document }); }
            catch { add('SOURCE_READ', document); }
          }
        }
      }
      return seen;
    }
    let publicDirectory: PinnedEntry | undefined;
    try {
      const content = openEntry(repository.fd, 'content', true);
      directories.push(content);
      publicDirectory = openEntry(content.fd, 'public', true);
      directories.push(publicDirectory);
      collect(publicDirectory.fd, 'content/public');
      for (const directory of directories) directory.check();
      repository.check();
    } catch { add('SOURCE_BOUNDARY'); }
    // This is a point-in-time recheck, not a filesystem transaction. Keep all
    // original directory descriptors pinned through Git and freshness checks.
    const finishFresh = (revision: string | null = null): CommittedValidation => {
      if (!diagnostics.length && publicDirectory) {
        try {
          collect(publicDirectory.fd, 'content/public', 'bytes');
          // Enumerate membership after the byte reads as well: a late sibling
          // must not be omitted merely because its directory was listed first.
          const seen = collect(publicDirectory.fd, 'content/public', 'membership');
          if (seen.size !== sources.length || sources.some((source) => !seen.has(source.path))) add('SOURCE_BOUNDARY');
          for (const directory of directories) directory.check();
          repository.check();
        } catch { add('SOURCE_BOUNDARY'); }
      }
      return finish(revision);
    };
    if (!sources.length) add('EMPTY_CORPUS');
    const identities = new Set<string>();
    for (const source of sources) {
      let text: string;
      try { text = decodeUtf8(source.bytes); }
      catch { add('SOURCE_READ', source.ordinal); continue; }
      scan(text, source.ordinal);
      const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
      if (!match) { add('FRONTMATTER_INVALID', source.ordinal); continue; }
      try {
        const yaml = parseDocument(match[1]!, { uniqueKeys: true, prettyErrors: false, strict: true });
        if (yaml.errors.length || yaml.warnings.length || !isMap(yaml.contents)) {
          add('YAML_INVALID', source.ordinal); continue;
        }
        let unsupported = false;
        visit(yaml, (_, node) => {
          if (isAlias(node) || (node && typeof node === 'object' && 'tag' in node && node.tag)) unsupported = true;
          if (isScalar(node) && typeof node.value === 'string') scan(node.value, source.ordinal);
        });
        if (unsupported) { add('YAML_UNSUPPORTED', source.ordinal); continue; }
        // Only scalar string keys are metadata. Never print unknown field names.
        if (yaml.contents.items.some((pair) => !isScalar(pair.key) || typeof pair.key.value !== 'string')) {
          add('YAML_INVALID', source.ordinal); continue;
        }
        if (yaml.contents.items.some((pair) => !isScalar(pair.key) || !publicFields.has(String(pair.key.value)))) {
          add('METADATA_INVALID', source.ordinal);
        }
        for (const field of resourceFields) {
          if (yaml.has(field)) {
            const node = yaml.get(field, true);
            if (!isScalar(node) || typeof node.value !== 'string') add('METADATA_INVALID', source.ordinal, field);
          }
        }
        for (const field of listFields) {
          if (yaml.has(field)) {
            const node = yaml.get(field, true);
            if (!isSeq(node) || node.items.some((item) => !isScalar(item) || typeof item.value !== 'string')) {
              add('METADATA_INVALID', source.ordinal, field);
            }
          }
        }
        for (const field of fields) {
          const node = yaml.get(field, true);
          if (!isScalar(node) || typeof node.value !== 'string' || !node.value.trim() ||
              (field === 'visibility' && node.value !== 'public')) {
            add('METADATA_INVALID', source.ordinal, field); continue;
          }
          if (field.endsWith('_at') &&
              (!['QUOTE_DOUBLE', 'QUOTE_SINGLE'].includes(node.type ?? '') || !validTimestamp(node.value))) {
            add('TIMESTAMP_INVALID', source.ordinal, field);
          }
          if (field === 'document_id') {
            if (identities.has(node.value)) add('DUPLICATE_ID', source.ordinal, field);
            identities.add(node.value);
          }
        }
      } catch { add('YAML_INVALID', source.ordinal); }
    }
    if (options.revision !== undefined) {
      const revision = options.revision;
      if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(revision)) { add('REVISION_INVALID'); return finish(); }
      // Ignore inherited Git redirection/configuration, replacement objects and
      // lazy fetch: provenance must not download or write missing Git objects.
      const env = {
        PATH: process.env.PATH, LANG: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_NO_REPLACE_OBJECTS: '1', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0',
      };
      const git = (args: string[]) => {
        const result = spawnSync('git', ['--no-pager', ...args], {
          cwd: `/proc/${process.pid}/fd/${repository.fd}`, env, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, timeout: 10_000,
        });
        if (result.error || result.status !== 0) throw new Error();
        return result.stdout;
      };
      try {
        if (git(['rev-parse', '--show-toplevel']).toString('utf8').replace(/\n$/, '') !== root ||
            git(['cat-file', '-t', revision]).toString('utf8').trim() !== 'commit' ||
            git(['rev-parse', '--verify', revision]).toString('ascii').replace(/\n$/, '') !== revision) {
          add('REVISION_INVALID'); return finish();
        }
        const entries = decodeUtf8(git(['ls-tree', '-rz', '--full-tree', revision, '--', 'content/public/'])).split('\0').filter(Boolean);
        const snapshot = new Map<string, string>();
        let mismatch = false;
        for (const entry of entries) {
          const match = /^(\d+) (\w+) ([0-9a-f]+)\t([\s\S]+)$/.exec(entry);
          if (!match) throw new Error();
          const [, mode, type, oid, path] = match;
          if (type !== 'blob' || !['100644', '100755'].includes(mode!)) { mismatch = true; continue; }
          if (path!.endsWith('.md')) snapshot.set(path!, oid!);
        }
        if (snapshot.size !== sources.length) mismatch = true;
        for (const source of sources) {
          const oid = snapshot.get(source.path);
          if (!oid) { mismatch = true; continue; }
          const bytes = git(['cat-file', 'blob', oid]);
          if (!bytes.equals(source.bytes)) mismatch = true;
          committed.push({ path: source.path, bytes });
        }
        if (mismatch) add('SNAPSHOT_MISMATCH');
      } catch { add('REVISION_INVALID'); }
      return finishFresh(revision);
    }
    return finishFresh();
  } finally {
    for (const directory of directories.reverse()) closeSync(directory.fd);
    repository.close();
  }
}
