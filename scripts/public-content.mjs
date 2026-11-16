#!/usr/bin/env node
// Read-only local checks. No private inputs, network, checkout, staging or writes.
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TextDecoder } from 'node:util';
import { isAlias, isMap, isScalar, parseAllDocuments, visit } from 'yaml';
import MarkdownIt from 'markdown-it';
import { parseFragment } from 'parse5';

const root = process.cwd();
const publicRoot = 'content/public';
const ledgerPath = 'docs/content/document-identities.json';
const coveragePath = 'docs/content/coverage.md';
const errors = [];
const fail = (code, ref = 'corpus') => errors.push({ code, ref });
const utf8 = new TextDecoder('utf-8', { fatal: true });
const text = (bytes) => utf8.decode(bytes);
const placeholder = /^(?:unknown|tbd|todo|pending|placeholder|unreviewed|n\/a|<.*>|\{.*\})$/i;
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0 && !placeholder.test(value.trim());
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validId = (value) => typeof value === 'string' && uuid.test(value) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value);
function utc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value.replace('Z', '.000Z');
}
function quotedDate(node, key) {
  const value = node.get(key, true);
  return isScalar(value) && ['QUOTE_DOUBLE', 'QUOTE_SINGLE'].includes(value.type) && utc(value.value);
}
function structured(source) {
  const docs = parseAllDocuments(source, { uniqueKeys: true, strict: true, version: '1.2' });
  if (docs.length !== 1 || docs[0].errors.length || docs[0].warnings.length) throw new Error('structure');
  visit(docs[0], {
    Node(_key, node) { if (node.anchor || node.tag || isAlias(node)) throw new Error('structure'); },
    Pair(_key, pair) { if (!isScalar(pair.key) || pair.key.value === '<<') throw new Error('structure'); },
  });
  return docs[0];
}
function json(source) {
  JSON.parse(source); // Require JSON syntax, with YAML's duplicate-key check as well.
  return structured(source).toJS();
}
function frontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error('frontmatter');
  const doc = structured(match[1]);
  if (!isMap(doc.contents)) throw new Error('frontmatter');
  return { node: doc.contents, data: doc.toJS(), body: source.slice(match[0].length) };
}
// lstat each component BEFORE opening/descending; never resolve through a link.
// As with the authoring helper, a hostile concurrent filesystem mutation is out of scope.
function safeStat(relative, allowMissing = false) {
  const parts = relative.split('/');
  if (path.isAbsolute(relative) || parts.some((part) => !part || part === '.' || part === '..')) throw new Error('path');
  let current = root;
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    let stat;
    try { stat = lstatSync(current); } catch (error) {
      if (allowMissing && error.code === 'ENOENT') return null;
      throw error;
    }
    if (stat.isSymbolicLink() || (index < parts.length - 1 && !stat.isDirectory())) throw new Error('path');
    if (index === parts.length - 1) return stat;
  }
}
function read(relative) {
  if (!safeStat(relative).isFile()) throw new Error('file');
  return readFileSync(path.join(root, relative));
}
function git(args) {
  const result = spawnSync('git', ['--no-pager', ...args], {
    cwd: root, encoding: null, maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_NO_REPLACE_OBJECTS: '1', GIT_TERMINAL_PROMPT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error || result.status !== 0) throw new Error('git');
  return result.stdout; // Never expose subprocess diagnostics.
}
const args = process.argv.slice(2);
const mode = args[0];
const revision = args[2];
if (!(mode === 'check' && args.length === 1) &&
    !(mode === 'verify' && args.length === 3 && args[1] === '--revision' && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(revision))) {
  fail('ARGUMENTS');
}
let patterns = [];
try {
  const config = json(text(read('tools/public-content/forbidden-markers.json')));
  if (config.version !== 1 || !Array.isArray(config.patterns) || !config.patterns.length) throw new Error('config');
  patterns = config.patterns.map((entry) => {
    if (!nonempty(entry.code) || !nonempty(entry.pattern)) throw new Error('config');
    return new RegExp(entry.pattern, 'iu');
  });
} catch { fail('MARKER_CONFIG'); }
function scan(source, ref) {
  if (patterns.some((pattern) => pattern.test(source))) fail('FORBIDDEN_MARKER', ref);
}
const working = new Map();
const markdown = [];
try {
  const stat = safeStat(publicRoot, true);
  if (stat && !stat.isDirectory()) throw new Error('root');
  function walk(directory) {
    for (const name of readdirSync(path.join(root, directory)).sort()) {
      const relative = `${directory}/${name}`;
      const stat = safeStat(relative);
      if (stat.isDirectory()) walk(relative);
      else if (stat.isFile()) {
        working.set(relative, null);
        if (relative.endsWith('.md')) markdown.push(relative);
      } else throw new Error('input');
    }
  }
  if (stat) walk(publicRoot);
} catch { fail('UNSAFE_INPUT'); }
if (!markdown.length) fail('EMPTY_CORPUS');

const md = new MarkdownIt({ html: true });
// Inspect unsafe schemes too, rather than letting the renderer silently drop them.
md.validateLink = () => true;
function target(value, origin) {
  const raw = value.trim();
  if (/[\x00-\x1f\x7f\\]/.test(raw)) throw new Error('target');
  if (/^(?:https?:)?\/\//i.test(raw)) return; // Never fetched.
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) throw new Error('scheme');
  // Split URL syntax before decoding: %23/%3f are filename characters,
  // not fragment/query delimiters that can hide a following traversal.
  let decoded = raw.split(/[?#]/, 1)[0];
  for (let depth = 0; depth < 10; depth++) {
    const next = decodeURIComponent(decoded);
    if (next === decoded) break;
    decoded = next;
    if (depth === 9) throw new Error('encoding');
  }
  if (/[\x00-\x1f\x7f\\]/.test(decoded)) throw new Error('target');
  const local = decoded;
  if (!local) return;
  if (local.startsWith('/')) throw new Error('absolute');
  const parts = path.posix.dirname(origin).split('/');
  for (const segment of local.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (parts.length <= 2) throw new Error('escape');
      parts.pop();
    } else parts.push(segment);
    // Check prefixes before normalizing away `link/..`.
    const stat = safeStat(parts.join('/'));
    if (!stat.isFile() && !stat.isDirectory()) throw new Error('target');
  }
  if (parts.length < 2 || parts[0] !== 'content' || parts[1] !== 'public') throw new Error('escape');
}
function htmlLinks(source, origin) {
  function walk(node) {
    for (const attr of node.attrs ?? []) {
      if (['href', 'src', 'poster', 'action', 'formaction', 'data', 'xlink:href', 'cite', 'background', 'longdesc',
        'usemap', 'manifest', 'profile', 'icon', 'codebase', 'classid'].includes(attr.name) ||
          (attr.prefix === 'xlink' && attr.name === 'href')) target(attr.value, origin);
      if (attr.name === 'ping' || attr.name === 'archive') {
        for (const item of attr.value.trim().split(/\s+/)) target(item, origin);
      }
      if (attr.name === 'srcset' || attr.name === 'imagesrcset') {
        for (const item of attr.value.split(',')) target(item.trim().split(/\s+/)[0], origin);
      }
      // CSS URLs and embedded HTML have different grammars: fail closed.
      if ((attr.name === 'style' && /url\s*\(|@import/i.test(attr.value)) || attr.name === 'srcdoc') throw new Error('embedded');
    }
    if (node.tagName === 'base' || node.tagName === 'style' ||
        (node.tagName === 'meta' && node.attrs?.some((attr) => attr.name === 'http-equiv' && attr.value.toLowerCase() === 'refresh'))) throw new Error('embedded');
    for (const child of node.childNodes ?? []) walk(child);
    if (node.content) walk(node.content);
  }
  walk(parseFragment(source));
}
function links(source, origin) {
  const env = {};
  function walk(tokens) {
    for (const token of tokens) {
      for (const [key, value] of token.attrs ?? []) if (key === 'href' || key === 'src') target(value, origin);
      if (token.type === 'html_inline' || token.type === 'html_block') htmlLinks(token.content, origin);
      if (token.children) walk(token.children);
    }
  }
  walk(md.parse(source, env));
  // Check unused reference definitions as well as rendered links.
  for (const reference of Object.values(env.references ?? {})) target(reference.href, origin);
}
const documents = new Map();
for (const [index, relative] of markdown.entries()) {
  const ref = `document-${index + 1}`;
  try {
    const bytes = read(relative);
    working.set(relative, bytes);
    const source = text(bytes);
    scan(source, ref);
    const { node, data, body } = frontmatter(source);
    if (!validId(data.document_id) || data.visibility !== 'public' || !nonempty(data.title) || !nonempty(data.reviewed_by) ||
        !['created_at', 'modified_at', 'reviewed_at'].every((key) => quotedDate(node, key)) ||
        !body.trim() || /^(?:README|placeholder)$/i.test(path.posix.basename(relative, '.md'))) {
      fail('METADATA', ref);
    }
    const identity = typeof data.document_id === 'string' ? data.document_id.toLowerCase() : data.document_id;
    if (documents.has(identity)) fail('DUPLICATE_ID', ref);
    documents.set(identity, relative);
    try { links(body, relative); } catch { fail('UNSAFE_REFERENCE', ref); }
  } catch { fail('FRONTMATTER_OR_INPUT', ref); }
}
function ledger(source) {
  const data = json(source);
  if (data.schema_version !== 1 || !Array.isArray(data.documents)) throw new Error('ledger');
  const ids = new Map();
  const activePaths = new Set();
  for (const entry of data.documents) {
    if (!validId(entry.document_id) || ids.has(entry.document_id.toLowerCase()) || !['active', 'retired'].includes(entry.status) ||
        typeof entry.path !== 'string' || !entry.path.startsWith(`${publicRoot}/`) || !entry.path.endsWith('.md') ||
        path.posix.normalize(entry.path) !== entry.path || /[\\\x00-\x1f\x7f]/.test(entry.path)) throw new Error('ledger');
    if (entry.status === 'active') {
      if (activePaths.has(entry.path)) throw new Error('ledger');
      activePaths.add(entry.path);
    }
    ids.set(entry.document_id.toLowerCase(), entry);
  }
  return ids;
}
let identities;
try {
  const bytes = read(ledgerPath);
  working.set(ledgerPath, bytes);
  const source = text(bytes);
  scan(source, 'identities');
  identities = ledger(source);
  for (const [id, entry] of identities) {
    if (entry.status === 'active' ? documents.get(id) !== entry.path : documents.has(id)) fail('IDENTITY_BINDING', 'identities');
  }
  for (const [id, relative] of documents) {
    const entry = identities.get(id);
    if (!entry || entry.status !== 'active' || entry.path !== relative) fail('IDENTITY_BINDING', 'identities');
  }
} catch { fail('IDENTITY_LEDGER', 'identities'); }
try {
  const bytes = read(coveragePath);
  working.set(coveragePath, bytes);
  const source = text(bytes);
  scan(source, 'coverage');
  const { node, data, body } = frontmatter(source);
  if (data.status !== 'accepted' || !nonempty(data.accepted_by) || !quotedDate(node, 'accepted_at') || !body.trim() ||
      !Array.isArray(data.questions) || !data.questions.length) throw new Error('coverage');
  const covered = new Set();
  for (const question of data.questions) {
    if (!question || !nonempty(question.question) || !Array.isArray(question.document_ids) || !Array.isArray(question.gaps) ||
        !question.gaps.every(nonempty) || (!question.document_ids.length && !question.gaps.length)) throw new Error('coverage');
    for (const rawId of question.document_ids) {
      if (!validId(rawId)) throw new Error('coverage');
      const id = rawId.toLowerCase();
      if (!documents.has(id) || identities?.get(id)?.status !== 'active' || covered.has(`${question.question}\0${id}`)) throw new Error('coverage');
      covered.add(`${question.question}\0${id}`);
    }
  }
  for (const id of documents.keys()) if (!data.questions.some((question) => question.document_ids.some((rawId) => rawId.toLowerCase() === id))) throw new Error('coverage');
} catch { fail('COVERAGE_NOT_ACCEPTED', 'coverage'); }

// A ledger entry cannot vanish, and a retired ID cannot become active again.
// Inspect only the public ledger from reachable history, never private blobs.
function continuity(previous, current) {
  for (const [id, entry] of previous) {
    const next = current.get(id);
    if (!next || (entry.status === 'retired' && next.status !== 'retired')) throw new Error('continuity');
    // Paths may change; semantic continuity requires BC's review, not a heuristic.
  }
}
function history(tip) {
  const hashes = text(git(['log', '--full-history', '--format=%H', tip, '--', ledgerPath])).trim().split('\n').filter(Boolean);
  for (const hash of hashes) {
    const tree = treeAt(hash);
    const entry = tree.get(ledgerPath);
    if (!entry) continue;
    if (entry.mode !== '100644' && entry.mode !== '100755') throw new Error('mode');
    const previous = ledger(text(git(['cat-file', 'blob', entry.oid])));
    continuity(previous, identities);
  }
}
function treeAt(sha) {
  const result = new Map();
  const output = git(['ls-tree', '-r', '-z', sha, '--', publicRoot, ledgerPath, coveragePath]);
  for (const record of text(output).split('\0').filter(Boolean)) {
    const match = /^(\d{6}) (\w+) ([0-9a-f]+)\t([\s\S]+)$/.exec(record);
    if (!match) throw new Error('tree');
    result.set(match[4], { mode: match[1], type: match[2], oid: match[3] });
  }
  return result;
}
if (!errors.some((error) => error.code === 'ARGUMENTS')) {
  try {
    const gitRoot = text(git(['rev-parse', '--show-toplevel'])).trim();
    if (gitRoot !== root) throw new Error('root');
    if (identities) history('HEAD');
  } catch { fail('GIT_OR_IDENTITY_HISTORY', 'identities'); }
  if (mode === 'verify') {
    try {
      // A full object ID must name a commit itself, not a tag/tree or abbreviation.
      if (text(git(['cat-file', '-t', revision])).trim() !== 'commit') throw new Error('commit');
      const snapshot = treeAt(revision);
      if (snapshot.size !== working.size) throw new Error('set');
      for (const [relative, entry] of snapshot) {
        if (!working.has(relative) || entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) throw new Error('mode');
        const bytes = working.get(relative) ?? read(relative);
        if (!bytes.equals(git(['cat-file', 'blob', entry.oid]))) throw new Error('bytes');
        const executable = Boolean(safeStat(relative).mode & 0o111);
        if (executable !== (entry.mode === '100755')) throw new Error('mode');
      }
      // Also bind the index: a staged change must not be certified as clean.
      const index = git(['ls-files', '--stage', '-z', '--', publicRoot, ledgerPath, coveragePath]);
      const entries = text(index).split('\0').filter(Boolean);
      if (entries.length !== snapshot.size) throw new Error('index');
      for (const record of entries) {
        const match = /^(\d{6}) ([0-9a-f]+) (\d)\t([\s\S]+)$/.exec(record);
        const entry = match && snapshot.get(match[4]);
        if (!entry || match[3] !== '0' || entry.mode !== match[1] || entry.oid !== match[2]) throw new Error('index');
      }
      if (identities) history(revision);
    } catch { fail('SNAPSHOT_MISMATCH'); }
  }
}
const counts = new Map();
for (const { code, ref } of errors) {
  const key = `${code}:${ref}`;
  counts.set(key, { code, ref, count: (counts.get(key)?.count ?? 0) + 1 });
}
const result = { ok: errors.length === 0, mode: mode === 'verify' ? 'verify' : 'check', file_count: markdown.length,
  ...(errors.length === 0 && mode === 'verify' ? { revision } : {}), errors: [...counts.values()] };
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.ok ? 0 : 1;
