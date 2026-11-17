import assert from 'node:assert/strict';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const quote = (text: string) => `'${text.replaceAll("'", "'\\''")}'`;
type Record = { event: string; pid: number; service?: string };

async function until(check: () => boolean, message: string, timeout = 10_000) {
  const deadline = Date.now() + timeout;
  while (!check()) {
    assert(Date.now() < deadline, message);
    await delay(25);
  }
}

function alive(pid: number) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    // Defunct children cannot hold files/listeners; their adopter reaps them.
    return !['Z', 'X'].includes(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0]!);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function fixture(mode = 'selected') {
  const temporary = mkdtempSync(join(tmpdir(), 'candidate-copilot-launcher-'));
  const home = join(temporary, 'home');
  const project = join(home, 'project with spaces');
  const bin = join(temporary, 'old');
  const selected = join(temporary, 'selected');
  const fnm = join(home, '.local/share/fnm');
  const log = join(temporary, 'events.jsonl');
  const trigger = join(temporary, 'exit');
  for (const path of [join(project, 'scripts'), join(project, 'node_modules/.bin'), bin, selected, join(fnm, 'aliases')]) mkdirSync(path, { recursive: true });
  for (const file of ['dev.sh', 'check-workstation.sh']) copyFileSync(join(root, 'scripts', file), join(project, 'scripts', file));
  copyFileSync(join(root, '.node-version'), join(project, '.node-version'));
  const executable = (path: string, body: string) => writeFileSync(path, `#!/bin/bash\n${body}\n`, { mode: 0o755 });
  executable(join(bin, 'node'), 'printf "v24.15.0\\n"');
  executable(join(bin, 'npm'), '[[ $* == --version ]] || exit 99; printf "11.12.1\\n"');
  executable(join(bin, 'git'), '[[ $* == --version ]] || exit 99; printf "git version 2.43.0\\n"');
  executable(join(bin, 'cat'), 'if [[ $* == /etc/os-release ]]; then printf \'ID=ubuntu\\nVERSION_ID="24.04"\\n\'; else exec /bin/cat "$@"; fi');
  executable(join(selected, 'node'), '[[ $* == --version ]] || exit 99; [[ $FIXTURE_MODE != wrong-node ]] || { printf "v24.15.0\\n"; exit 0; }; printf "v24.22.0\\n"');
  executable(join(project, 'node_modules/.bin/vite'), 'exit 99');
  executable(join(project, 'node_modules/.bin/wrangler'), 'exit 99');
  if (mode !== 'missing-fnm') executable(join(fnm, 'fnm'), `case "$*" in
  'env --shell bash')
    [[ $FIXTURE_MODE != failed-env ]] || exit 17
    printf 'export PATH=%s:$PATH\\n' ${quote(quote(selected))} ;;
  'use 24.22.0') [[ $FIXTURE_MODE != failed-use ]] || exit 18 ;;
  *) exit 99 ;;
esac`);
  // The npm fixture launches real child processes, but never a server, installer
  // or real credential reader. Descendants inherit the launcher's process group.
  writeFileSync(join(selected, 'npm'), `#!${process.execPath}
const { appendFileSync, existsSync } = require('node:fs');
const { spawn } = require('node:child_process');
if (process.argv[2] === '--version') { console.log(process.env.FIXTURE_MODE === 'wrong-npm' ? '11.12.1' : '11.19.1'); process.exit(0); }
if (process.argv.length !== 4 || process.argv[2] !== 'run' || !['dev:worker', 'dev:frontend'].includes(process.argv[3])) process.exit(99);
const service = process.argv[3].slice(4);
const record = event => appendFileSync(process.env.FIXTURE_LOG, JSON.stringify({ event, service, pid: process.pid }) + '\\n');
record('start');
console.log('SYNTHETIC_READY:' + service);
if (service === 'worker' && process.env.FIXTURE_MODE.startsWith('instant-')) process.exit(process.env.FIXTURE_MODE === 'instant-zero' ? 0 : 23);
const leaf = spawn(process.execPath, ['-e', \`
  const { appendFileSync } = require('node:fs');
  appendFileSync(process.env.FIXTURE_LOG, JSON.stringify({ event: 'leaf', pid: process.pid }) + '\\\\n');
  if (process.env.FIXTURE_MODE === 'resistant') process.on('SIGTERM', () => {});
  setInterval(() => {}, 1000);
\`], { stdio: 'inherit' });
process.on('SIGTERM', () => { record('term'); leaf.kill('SIGTERM'); leaf.once('exit', () => process.exit(0)); });
setInterval(() => {
  if (service === 'worker' && existsSync(process.env.FIXTURE_TRIGGER)) {
    if (process.env.FIXTURE_MODE === 'exit-signal') process.kill(process.pid, 'SIGKILL');
    else process.exit(process.env.FIXTURE_MODE === 'exit-zero' ? 0 : 23);
  }
}, 25);
`, { mode: 0o755 });
  const protectedFiles = [join(home, '.bashrc'), join(home, '.profile'), join(fnm, 'aliases/default'), join(project, 'package-lock.json')];
  for (const path of protectedFiles) writeFileSync(path, 'SYNTHETIC_SETTING_MUST_NOT_CHANGE\n');
  const env = {
    HOME: home, PATH: `${bin}:/usr/bin:/bin`, LANG: 'C.UTF-8', FIXTURE_MODE: mode,
    FIXTURE_LOG: log, FIXTURE_TRIGGER: trigger, PROJECT_ROOT: '/must/not/be/used', WORKSTATION_READY: 'true',
  };
  const records = (): Record[] => existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line)) : [];
  const launched: ChildProcess[] = [];
  const start = (args: string[] = [], terminal = false) => {
    const child = terminal
      ? spawn('/usr/bin/script', ['-q', '-e', '-c', `exec /bin/bash ${quote(join(project, 'scripts/dev.sh'))} ${args.map(quote).join(' ')}`, '/dev/null'], { cwd: temporary, env, stdio: 'pipe' })
      : spawn('/bin/bash', [join(project, 'scripts/dev.sh'), ...args], { cwd: temporary, env, stdio: 'pipe' });
    launched.push(child);
    let output = '';
    child.stdout!.on('data', (chunk) => { output += chunk; });
    child.stderr!.on('data', (chunk) => { output += chunk; });
    const closed = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code, signal) => resolve({ code, signal }));
    });
    return { child, closed, output: () => output };
  };
  const verifyPreserved = () => {
    for (const path of protectedFiles) expect(readFileSync(path, 'utf8')).toBe('SYNTHETIC_SETTING_MUST_NOT_CHANGE\n');
  };
  const dispose = async () => {
    for (const child of launched) if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    // Fallback belongs to the test only, and happens after cleanup assertions.
    for (const { pid } of records()) if (alive(pid)) { try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ } }
    await until(() => launched.every((child) => child.exitCode !== null || child.signalCode !== null), 'Fixture launcher did not stop');
    rmSync(temporary, { recursive: true, force: true });
  };
  const ready = async (count: number) => until(() => records().filter((entry) => entry.event === 'leaf').length === count, 'Synthetic service descendants did not start');
  const noSurvivors = async () => until(() => records().every(({ pid }) => !alive(pid)), 'Owned service descendant survived launcher exit');
  return { temporary, home, project, env, records, start, ready, noSurvivors, verifyPreserved, dispose, trigger };
}

async function closedWithin(run: ReturnType<ReturnType<typeof fixture>['start']>) {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      run.closed,
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(`Launcher did not close:\n${run.output()}`)), 12_000); }),
    ]);
  } finally { clearTimeout(timer!); }
}

describe('daily development launcher', () => {
  it.each([
    ['--help'], ['-h'], ['unknown'], [''], ['worker', 'extra'], ['--help', 'extra'],
  ])('validates arguments before tool acquisition: %j', async (...args: string[]) => {
    const f = fixture('missing-fnm');
    try {
      const run = f.start(args);
      const result = await closedWithin(run);
      expect(result.code).toBe(args.length === 1 && ['--help', '-h'].includes(args[0]!) ? 0 : 2);
      expect(run.output()).toContain('Usage:');
      expect(f.records()).toEqual([]);
      f.verifyPreserved();
    } finally { await f.dispose(); }
  });

  it.each(['missing-fnm', 'failed-env', 'failed-use', 'wrong-node', 'wrong-npm', 'missing-pin', 'invalid-pin', 'missing-dependencies'])('stops %s before starting services', async (mode) => {
    const f = fixture(mode);
    try {
      if (mode === 'missing-pin') rmSync(join(f.project, '.node-version'));
      if (mode === 'invalid-pin') writeFileSync(join(f.project, '.node-version'), '--install\n');
      if (mode === 'missing-dependencies') rmSync(join(f.project, 'node_modules'), { recursive: true });
      const run = f.start();
      expect((await closedWithin(run)).code).not.toBe(0);
      expect(run.output()).toContain('Development startup failed:');
      expect(f.records()).toEqual([]);
      f.verifyPreserved();
    } finally { await f.dispose(); }
  });

  it('refuses sourcing without changing the calling shell options', () => {
    const run = spawnSync('/bin/bash', ['--noprofile', '--norc', '-c', `before=$-; source ${quote(join(root, 'scripts/dev.sh'))}; status=$?; [[ $- == "$before" ]] || exit 99; exit "$status"`], { encoding: 'utf8', timeout: 5_000 });
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('do not source');
  });

  it.each(['all', 'worker', 'frontend'])('selects pins from an old PATH and owns only requested %s processes', async (mode) => {
    const f = fixture();
    const unrelated = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
    try {
      const run = f.start([mode]);
      await f.ready(mode === 'all' ? 2 : 1);
      expect(run.output()).toContain('PASS: Node v24.22.0');
      expect(run.output()).toContain('PASS: npm 11.19.1');
      expect(f.records().filter((entry) => entry.event === 'start').map((entry) => entry.service).sort()).toEqual(mode === 'all' ? ['frontend', 'worker'] : [mode]);
      run.child.kill('SIGINT');
      expect((await closedWithin(run)).code).toBe(130);
      await f.noSurvivors();
      expect(alive(unrelated.pid!)).toBe(true);
      f.verifyPreserved();
    } finally { unrelated.kill('SIGTERM'); await f.dispose(); }
  });

  it.each(['worker', 'frontend'])('requires only the local tool for %s in single-service mode', async (mode) => {
    const f = fixture();
    try {
      rmSync(join(f.project, 'node_modules/.bin', mode === 'worker' ? 'vite' : 'wrangler'));
      const run = f.start([mode]);
      await f.ready(1);
      run.child.kill('SIGTERM');
      expect((await closedWithin(run)).code).toBe(143);
      await f.noSurvivors();
    } finally { await f.dispose(); }
  });

  it.each(['instant-error', 'instant-zero'])('cleans up when a service exits during startup: %s', async (mode) => {
    const f = fixture(mode);
    try {
      const run = f.start();
      expect((await closedWithin(run)).code).toBe(mode === 'instant-zero' ? 1 : 23);
      await f.noSurvivors();
    } finally { await f.dispose(); }
  });

  it.each(['exit-error', 'exit-zero', 'exit-signal'])('stops the sibling and orphan descendants on %s', async (mode) => {
    const f = fixture(mode);
    try {
      const run = f.start();
      await f.ready(2);
      writeFileSync(f.trigger, 'exit');
      expect((await closedWithin(run)).code).toBe(mode === 'exit-error' ? 23 : mode === 'exit-signal' ? 137 : 1);
      await f.noSurvivors();
      expect(run.output()).toContain('stopping owned services');
      f.verifyPreserved();
    } finally { await f.dispose(); }
  });

  it('bounds cleanup of resistant descendants and tolerates repeated interruption', async () => {
    const f = fixture('resistant');
    try {
      const run = f.start();
      await f.ready(2);
      run.child.kill('SIGTERM');
      await delay(100);
      run.child.kill('SIGINT');
      run.child.kill('SIGTERM');
      expect((await closedWithin(run)).code).toBe(143);
      expect(run.output()).toContain('Stopping unresponsive owned');
      await f.noSurvivors();
    } finally { await f.dispose(); }
  });

  it('handles a real terminal Ctrl+C, not only a directly sent signal', async () => {
    const f = fixture();
    try {
      const run = f.start([], true);
      await f.ready(2);
      run.child.stdin!.write('\x03');
      expect((await closedWithin(run)).code).toBe(130);
      await f.noSurvivors();
      f.verifyPreserved();
    } finally { await f.dispose(); }
  });
});
