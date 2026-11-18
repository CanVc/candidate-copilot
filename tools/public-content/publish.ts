import { randomUUID } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, writeFileSync, type Stats } from 'node:fs';
import { descriptorPath, openEntry, pinDirectory, sameEntry } from './validate.ts';
import type { ArtifactBundle } from './build.ts';
import { catalogPreimage, exactObject, jcs } from '../../src/shared/public-catalog.ts';
import { sha256 } from './chunk.ts';

function missing(error: unknown): boolean { return (error as NodeJS.ErrnoException).code === 'ENOENT'; }
function exists(parent: number, name: string): boolean {
  try { lstatSync(descriptorPath(parent, name)); return true; }
  catch (error) { if (missing(error)) return false; throw error; }
}
interface OwnedFile { parent: number; name: string; fd: number; observation: Stats; bytes: string }
function checkFile(file: OwnedFile) {
  const current = fstatSync(file.fd);
  const named = lstatSync(descriptorPath(file.parent, file.name));
  if (!current.isFile() || current.nlink !== 1 || !sameEntry(file.observation, current) || !sameEntry(current, named) ||
      current.size !== file.observation.size || current.mtimeMs !== file.observation.mtimeMs ||
      current.ctimeMs !== file.observation.ctimeMs || !readFileSync(descriptorPath(file.fd)).equals(Buffer.from(file.bytes))) throw new Error();
}
function names(fd: number, expected: string[]) {
  if (readdirSync(descriptorPath(fd)).sort().join('\0') !== expected.sort().join('\0')) throw new Error();
}
function verifyExisting(parent: number, name: string, bundle: ArtifactBundle): void {
  const directory = openEntry(parent, name, true);
  let assets: ReturnType<typeof openEntry> | undefined;
  const files: ReturnType<typeof openEntry>[] = [];
  try {
    names(directory.fd, ['assets', `search-artifacts.${bundle.searchHash}.json`]);
    assets = openEntry(directory.fd, 'assets', true);
    names(assets.fd, [`resources-catalog.${bundle.catalogHash}.json`]);
    for (const [path, bytes] of Object.entries(bundle.files)) {
      const file = openEntry(path.startsWith('assets/') ? assets.fd : directory.fd, path.split('/').at(-1)!, false);
      files.push(file);
      if (!readFileSync(descriptorPath(file.fd)).equals(Buffer.from(bytes))) throw new Error();
      file.check();
    }
    for (const file of files) file.check();
    assets.check(); directory.check();
  } finally {
    for (const file of files) closeSync(file.fd);
    if (assets) closeSync(assets.fd);
    closeSync(directory.fd);
  }
}

// Publication is local artifact creation, not runtime activation. All I/O uses
// pinned directory descriptors. Rename is not a trust boundary: destination
// identity and complete contents must still match the original owned staging.
export function publishBundle(repositoryRoot: string, bundle: ArtifactBundle): void {
  if (!/^[0-9a-f]{64}$/.test(bundle.catalogHash) || !/^[0-9a-f]{64}$/.test(bundle.searchHash)) throw new Error();
  const catalogName = `assets/resources-catalog.${bundle.catalogHash}.json`;
  const searchName = `search-artifacts.${bundle.searchHash}.json`;
  if (Object.keys(bundle.files).sort().join('\0') !== [catalogName, searchName].sort().join('\0')) throw new Error();
  const catalogBytes = bundle.files[catalogName]!;
  const searchBytes = bundle.files[searchName]!;
  const catalog = exactObject(JSON.parse(catalogBytes), ['catalogHash', 'payload']);
  const search = exactObject(JSON.parse(searchBytes), ['version', 'chunkingVersion', 'catalogRevision', 'catalogHash', 'documents', 'chunks']);
  const payloadBytes = catalogPreimage(catalog.payload);
  if (catalog.catalogHash !== bundle.catalogHash || sha256(payloadBytes) !== bundle.catalogHash ||
      jcs(catalog.payload) !== payloadBytes ||
      jcs(catalog) !== catalogBytes || sha256(searchBytes) !== bundle.searchHash || jcs(search) !== searchBytes ||
      search.version !== 1 || search.chunkingVersion !== 1 || search.catalogHash !== bundle.catalogHash ||
      search.catalogRevision !== (catalog.payload as { catalogRevision: string }).catalogRevision) throw new Error();
  const root = pinDirectory(repositoryRoot);
  const parents: ReturnType<typeof openEntry>[] = [];
  let stage: ReturnType<typeof openEntry> | undefined;
  let assets: ReturnType<typeof openEntry> | undefined;
  const files: OwnedFile[] = [];
  const stageName = `.staging-${randomUUID()}`;
  let parent = root.fd;
  let destination: ReturnType<typeof openEntry> | undefined;
  try {
    for (const name of ['dist', 'public-content']) {
      if (!exists(parent, name)) mkdirSync(descriptorPath(parent, name));
      const entry = openEntry(parent, name, true);
      parents.push(entry); parent = entry.fd;
    }
    const checkParents = () => { root.check(); for (const entry of parents) entry.check(); };
    checkParents();
    if (exists(parent, bundle.catalogHash)) {
      verifyExisting(parent, bundle.catalogHash, bundle); checkParents(); return;
    }
    mkdirSync(descriptorPath(parent, stageName));
    // If the initial pin fails, ownership is uncertain: retain for inspection.
    stage = openEntry(parent, stageName, true);
    mkdirSync(descriptorPath(stage.fd, 'assets'));
    assets = openEntry(stage.fd, 'assets', true);
    for (const [path, bytes] of Object.entries(bundle.files)) {
      const directory = path.startsWith('assets/') ? assets.fd : stage.fd;
      const name = path.split('/').at(-1)!;
      const fd = openSync(descriptorPath(directory, name), constants.O_RDWR | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o644);
      // Register the descriptor before writing so failure never leaks a handle.
      const file = { parent: directory, name, fd, observation: fstatSync(fd), bytes };
      files.push(file);
      writeFileSync(fd, bytes, 'utf8');
      file.observation = fstatSync(fd);
    }
    const verifyOwned = () => {
      names(stage!.fd, ['assets', `search-artifacts.${bundle.searchHash}.json`]);
      names(assets!.fd, [`resources-catalog.${bundle.catalogHash}.json`]);
      for (const file of files) checkFile(file);
      assets!.check();
    };
    verifyOwned(); stage.check(); checkParents();
    if (exists(parent, bundle.catalogHash)) throw new Error();
    stage.check();
    renameSync(descriptorPath(parent, stageName), descriptorPath(parent, bundle.catalogHash));
    destination = openEntry(parent, bundle.catalogHash, true);
    if (!sameEntry(fstatSync(stage.fd), fstatSync(destination.fd))) throw new Error();
    verifyOwned();
    verifyExisting(parent, bundle.catalogHash, bundle);
    destination.check(); checkParents();
  } finally {
    // Failed staging is retained: pathname ownership can change before deletion.
    if (destination) closeSync(destination.fd);
    for (const file of files) closeSync(file.fd);
    if (assets) closeSync(assets.fd);
    if (stage) closeSync(stage.fd);
    for (const entry of parents.reverse()) closeSync(entry.fd);
    root.close();
  }
}
