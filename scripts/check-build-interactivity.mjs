import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { accessSync, constants, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const metadataName = 'agents-skills-install.jsonc';
const scopeVariable = 'CANDIDATE_COPILOT_PTY_SCOPE';
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const prerequisiteHelp = 'Terminal prerequisites: on Ubuntu 24.04 check /usr/bin/script --version (util-linux, packaged as bsdutils), readable /proc/self/{stat,environ}, and writable /dev/ptmx with /dev/pts mounted. See docs/development/application.md#terminal-prerequisites. Nothing is installed automatically.';

function preflight() {
  try {
    assert.equal(process.platform, 'linux', 'The terminal regression supports Ubuntu/Linux only');
    accessSync('/usr/bin/script', constants.X_OK);
    readFileSync('/proc/self/stat');
    readFileSync('/proc/self/environ');
    accessSync('/dev/ptmx', constants.R_OK | constants.W_OK);
  } catch (error) {
    throw new Error(`${prerequisiteHelp}\n${error.message}`, { cause: error });
  }
}

// Ignore terminal wrapping even inside a word. The actual upstream update
// question says "update them", with "skills" in the preceding sentence.
function terminalText(output) {
  return output.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').replace(/\s/g, '');
}
const prompt = /(?:install|update)[^?]*skills[^?]*\?|cloudflareskillsmightbeoutofdate\.[^?]*wouldyoulike[^?]*updatethem[^?]*\?|[\[(]y\/n[\])]/i;

// PID/start-time identities guard against reuse; the inherited random marker
// finds live descendants even if their original parent exited before a poll.
function processes() {
  const result = new Map();
  for (const name of readdirSync('/proc').filter((name) => /^\d+$/.test(name))) {
    try {
      const stat = readFileSync(`/proc/${name}/stat`, 'utf8');
      const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      result.set(Number(name), { parent: Number(fields[1]), birth: fields[19] });
    } catch (error) {
      if (!['ENOENT', 'ESRCH', 'EACCES', 'EPERM'].includes(error.code)) throw error;
    }
  }
  return result;
}

async function terminalBuild(directory, env, command, lifecycle, options = {}) {
  const { timeout = 45_000, outputLimit = 1_000_000, interruptControl = false } = options;
  const scope = `${scopeVariable}=${randomUUID()}`;
  const probe = `if (![process.stdin, process.stdout, process.stderr].every(s => s.isTTY) || process.env.CI !== 'false') process.exit(1); console.log('PTY_READY: stdin/stdout/stderr=true CI=false')`;
  const child = spawn('/usr/bin/script', ['-q', '-e', '-c', `${quote(process.execPath)} -e ${quote(probe)} && exec ${command}`, '/dev/null'], {
    cwd: directory, env: { ...env, [scopeVariable]: scope.slice(scope.indexOf('=') + 1) }, detached: true, stdio: ['pipe', 'pipe', 'pipe'],
  });
  lifecycle.reaped = false;
  lifecycle.interruptions = 0;
  lifecycle.discardedBytes = 0;
  const retained = Buffer.alloc(outputLimit);
  let retainedBytes = 0;
  let saturated = false;
  let timer;
  let poll;
  let secondSignal;
  let rejectRun;
  let interrupted = false;
  const owned = new Map();
  const discover = () => {
    const current = processes();
    for (const [pid, info] of current) {
      try {
        if (readFileSync(`/proc/${pid}/environ`).toString().split('\0').includes(scope)) owned.set(pid, info);
      } catch (error) {
        // Unrelated users' environments need not be readable. Already-owned
        // identities remain tracked when /proc/environ disappears at exit.
        if (!['ENOENT', 'ESRCH', 'EACCES', 'EPERM'].includes(error.code)) throw error;
      }
    }
    return [...owned].filter(([pid, info]) => current.get(pid)?.birth === info.birth);
  };
  const closed = new Promise((resolve) => child.once('close', (code, signal) => resolve({ code, signal })));
  const fail = (code, message) => {
    const error = new Error(message);
    error.code = code;
    rejectRun(error);
  };
  const interrupt = () => {
    lifecycle.interruptions++;
    if (interrupted) return;
    interrupted = true;
    fail('INTERRUPTED', 'Terminal verification interrupted');
  };
  // Keep idempotent handlers throughout awaited cleanup, including repeated
  // SIGINT/SIGTERM. Removing them earlier would restore fatal default handling.
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', interrupt);
  try {
    const result = await Promise.race([
      closed,
      new Promise((_, reject) => {
        rejectRun = reject;
        child.once('error', reject);
        child.stdin.on('error', reject);
        timer = setTimeout(() => fail('DEADLINE', `Terminal build exceeded ${timeout}ms`), timeout);
        poll = setInterval(() => {
          try { discover(); } catch (error) { reject(error); }
        }, 40);
        const receive = (bytes) => {
          if (saturated) {
            lifecycle.discardedBytes += bytes.length;
            return;
          }
          const count = Math.min(bytes.length, outputLimit - retainedBytes);
          bytes.copy(retained, retainedBytes, 0, count);
          retainedBytes += count;
          if (retainedBytes === outputLimit) {
            saturated = true;
            lifecycle.discardedBytes += bytes.length - count;
            return fail('OUTPUT_LIMIT', 'Terminal output exceeded retained-byte limit');
          }
          const output = retained.subarray(0, retainedBytes).toString();
          if (prompt.test(terminalText(output))) fail('UNEXPECTED_PROMPT', 'Terminal verifier rejected an unexpected prompt');
          if (interruptControl && !interrupted && output.includes('SYNTHETIC SIGNAL READY')) process.kill(process.pid, 'SIGINT');
          // Never send input, including default/yes answers.
        };
        child.stdout.on('data', receive);
        child.stderr.on('data', receive);
      }),
    ]);
    assert.equal(result.code, 0, `Terminal command failed (${result.signal}). ${prerequisiteHelp}`);
    const output = retained.subarray(0, retainedBytes).toString();
    assert(output.includes('PTY_READY: stdin/stdout/stderr=true CI=false'), `Missing TTY/outer-CI probe. ${prerequisiteHelp}`);
    return output;
  } catch (error) {
    error.output = retained.subarray(0, retainedBytes).toString();
    throw error;
  } finally {
    clearTimeout(timer);
    clearInterval(poll);
    try {
      if (interruptControl) secondSignal = setTimeout(() => process.kill(process.pid, 'SIGTERM'), 20);
      const signalled = new Map();
      const deadline = Date.now() + 6_000;
      let remaining;
      // Re-scan the scope throughout cleanup, not just the original PPID tree.
      // Leaves exit first so parents can reap; orphan reaping belongs to the
      // host's adopter. Require disappearance, not merely a zombie/no-writer.
      while ((remaining = discover()).length && Date.now() < deadline) {
        const parents = new Set(remaining.map(([, info]) => info.parent));
        for (const [pid, info] of remaining) {
          if (parents.has(pid)) continue;
          const key = `${pid}:${info.birth}`;
          const first = signalled.get(key);
          const signal = first === undefined ? 'SIGTERM' : Date.now() - first >= 300 ? 'SIGKILL' : null;
          if (!signal) continue;
          // Recheck identity immediately before signalling.
          if (processes().get(pid)?.birth !== info.birth) continue;
          try { process.kill(pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw error; }
          if (first === undefined) signalled.set(key, Date.now());
        }
        await delay(25);
      }
      assert.equal(discover().length, 0, 'Owned terminal descendants were not reaped; fixture retained');
      await Promise.race([closed, delay(2_000, undefined, { ref: false }).then(() => { throw new Error('PTY child did not close'); })]);
      lifecycle.owned = owned;
      lifecycle.retainedBytes = retainedBytes;
      lifecycle.reaped = true;
      if (interrupted) {
        const error = new Error('Terminal verification interrupted');
        error.code = 'INTERRUPTED';
        error.output = retained.subarray(0, retainedBytes).toString();
        throw error;
      }
    } finally {
      clearTimeout(secondSignal);
      process.removeListener('SIGINT', interrupt);
      process.removeListener('SIGTERM', interrupt);
    }
  }
}

function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(prefix, entry.name);
    assert(entry.isDirectory() || entry.isFile(), `Unexpected fixture entry: ${path}`);
    return entry.isDirectory() ? [`${path}/`, ...files(join(directory, entry.name), path)] : [path];
  });
}

// All controls are private, harmless Node programs, never Wrangler or installers.
const wait = 'setInterval(() => {}, 1000)';
const question = (text) => `console.log('SYNTHETIC QUESTION ONLY: ' + ${JSON.stringify(text)}); ${wait}`;
const controls = [
  { name: 'skills-install', code: question('Would you like Wrangler to automatically install Cloudflare skills for the best experience?'), expected: 'UNEXPECTED_PROMPT' },
  { name: 'skills-update', code: question('It looks like your Cloudflare skills might be out of date. Would you like Wrangler to update them for you?'), expected: 'UNEXPECTED_PROMPT' },
  { name: 'wrapped-install', code: question('Would you like Wrangler to automatically inst\r\nall Cloudfl\r\nare skills for the best experience?'), expected: 'UNEXPECTED_PROMPT' },
  { name: 'generic-confirmation', code: question('Continue? [y/N]'), expected: 'UNEXPECTED_PROMPT' },
  { name: 'deadline', code: wait, expected: 'DEADLINE' },
  { name: 'output-limit', code: `process.on('SIGTERM', () => process.stdout.write('LATE_NOISE'.repeat(8192))); process.stdout.write('x'.repeat(131072)); ${wait}`, expected: 'OUTPUT_LIMIT', outputLimit: 4096 },
  { name: 'interruption', code: `process.on('SIGTERM', () => {}); console.log('SYNTHETIC SIGNAL READY'); ${wait}`, expected: 'INTERRUPTED', interruptControl: true },
  { name: 'orphan', expected: 'UNEXPECTED_PROMPT' },
];

async function check(control, accepted = false) {
  const temporary = mkdtempSync(join(tmpdir(), 'candidate-copilot-terminal-'));
  const lifecycle = { reaped: true };
  try {
    const project = join(temporary, 'project');
    const home = join(temporary, 'home');
    const settings = join(temporary, 'settings');
    for (const path of ['package.json', 'frontend/index.html', 'frontend/src', 'src', 'vite.config.ts', 'wrangler.jsonc', 'tsconfig.json', 'tsconfig.frontend.json', 'tsconfig.worker.json']) {
      mkdirSync(dirname(join(project, path)), { recursive: true });
      cpSync(join(root, path), join(project, path), {
        recursive: true,
        filter: (source) => lstatSync(source).isDirectory() || (lstatSync(source).isFile() && /\.(?:jsonc?|tsx?|css|html)$/.test(source)),
      });
    }
    symlinkSync(join(root, 'node_modules'), join(project, 'node_modules'), 'dir');
    const manifest = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'));
    assert.equal((manifest.scripts['build:worker'].match(/CI=true /g) ?? []).length, 1, 'Expected exactly one command-local CI protection');
    const sentinels = new Map();
    const sentinel = (path, value, base = home) => {
      const destination = join(base, path);
      mkdirSync(dirname(destination), { recursive: true });
      const bytes = Buffer.from(value);
      writeFileSync(destination, bytes);
      sentinels.set(destination, bytes);
    };
    mkdirSync(settings);
    for (const path of ['.claude/skills/cloudflare/SKILL.md', '.codex/skills/workers/SKILL.md', '.agents/skills/wrangler/SKILL.md']) sentinel(path, `SYNTHETIC_ONLY_${randomUUID()}\n`);
    if (accepted) {
      sentinel(`config/.wrangler/${metadataName}`, JSON.stringify({
        version: 1, accepted: true, date: '2000-01-01T00:00:00.000Z', installFailed: false,
        detectedAgents: [{ name: 'Claude Code', rosie: { id: 'claude', globalPath: join(home, '.claude/skills') } }],
        installedSkillNames: ['cloudflare'], installedTreeSha: 'synthetic-old',
      }), settings);
      // Fresh synthetic cache avoids network if a regression reaches the update
      // flow, while its differing SHA and aged metadata avoid cooldown masking.
      sentinel('config/.wrangler/cloudflare-skills-repo-cache.json', JSON.stringify({ lastUpdate: Date.now(), skillNames: ['cloudflare'], skillsTreeSha: 'synthetic-new' }), settings);
    }
    const initialHome = files(home).sort();
    const env = {
      PATH: process.env.PATH, HOME: home, LANG: 'C.UTF-8', TERM: 'xterm', CI: 'false',
      WRANGLER_SEND_METRICS: 'false', WRANGLER_CACHE_DIR: join(settings, 'wrangler-cache'), WRANGLER_LOG_PATH: join(settings, 'logs'),
      XDG_CONFIG_HOME: join(settings, 'config'), XDG_CACHE_HOME: join(settings, 'cache'), XDG_DATA_HOME: join(settings, 'data'), XDG_STATE_HOME: join(settings, 'state'),
      npm_config_cache: join(settings, 'npm-cache'), npm_config_userconfig: '/dev/null', npm_config_globalconfig: join(settings, 'empty-global-npmrc'), npm_config_update_notifier: 'false',
      TMPDIR: join(settings, 'tmp'),
    };
    mkdirSync(env.TMPDIR);
    let code = control?.code;
    const orphanFile = join(settings, 'orphan-ready.json');
    const lateWrite = join(settings, 'orphan-late-write');
    const orphanStarted = join(settings, 'orphan-started');
    if (control?.name === 'orphan') {
      // An intermediate exits immediately; its detached, HUP/TERM-ignoring
      // child proves reparenting before the terminal question triggers cleanup.
      const orphan = `const fs = require('node:fs'); const parent = process.ppid;
        process.on('SIGHUP', () => {}); process.on('SIGTERM', () => {});
        fs.writeFileSync(${JSON.stringify(orphanStarted)}, 'ready');
        const ready = setInterval(() => { if (process.ppid === parent) return; clearInterval(ready);
          const fields = fs.readFileSync('/proc/self/stat', 'utf8').split(') ')[1].split(' ');
          fs.writeFileSync(${JSON.stringify(orphanFile)}, JSON.stringify({ pid: process.pid, parent: process.ppid, originalParent: parent, birth: fields[19] }));
          setTimeout(() => fs.writeFileSync(${JSON.stringify(lateWrite)}, 'UNEXPECTED LATE WRITE'), 3000);
        }, 10); ${wait}`;
      const intermediate = `const fs = require('node:fs'); const { spawn } = require('node:child_process'); spawn(process.execPath, ['-e', ${JSON.stringify(orphan)}], { detached: true, stdio: 'ignore' }).unref(); setInterval(() => { if (fs.existsSync(${JSON.stringify(orphanStarted)})) process.exit(0); }, 10)`;
      code = `const fs = require('node:fs'); const { spawn } = require('node:child_process'); spawn(process.execPath, ['-e', ${JSON.stringify(intermediate)}], { stdio: 'ignore' }).unref();
        const ready = setInterval(() => { if (!fs.existsSync(${JSON.stringify(orphanFile)})) return; clearInterval(ready); console.log('SYNTHETIC ORPHAN READY: Continue? [y/N]'); }, 10); ${wait}`;
    }
    const command = control ? `${quote(process.execPath)} -e ${quote(code)}` : 'npm run build';
    let failure;
    let output;
    try {
      output = await terminalBuild(project, env, command, lifecycle, control ? { timeout: 1500, ...control } : {});
    } catch (error) {
      failure = error;
    }
    assert(lifecycle.reaped, 'Terminal cleanup failed; fixture retained');
    assert.deepEqual(files(home).sort(), initialHome, 'Unexpected skill or HOME writes');
    for (const [path, bytes] of sentinels) assert.deepEqual(readFileSync(path), bytes, `Sentinel changed: ${path}`);
    const installationFiles = files(settings).filter((path) => /agents-skills-install|cloudflare-skills-repo-cache|skills-lock/.test(path)).sort();
    assert.deepEqual(installationFiles, accepted ? [`config/.wrangler/${metadataName}`, 'config/.wrangler/cloudflare-skills-repo-cache.json'] : [], 'Unexpected installation metadata/cache');
    for (const path of ['.agents', '.claude', '.codex']) assert(!existsSync(join(project, path)), `Unexpected project skills directory: ${path}`);
    if (control) {
      assert.equal(failure?.code, control.expected, `Synthetic ${control.name} must reject for the expected reason: ${failure?.message}`);
      assert.match(failure.output, /PTY_READY: stdin\/stdout\/stderr=true CI=false/);
      if (control.name === 'output-limit') {
        assert.equal(lifecycle.retainedBytes, control.outputLimit);
        assert(Buffer.byteLength(failure.output) <= control.outputLimit, 'Retained output exceeded cap');
        assert(lifecycle.discardedBytes > 0, 'Noisy control did not exercise discarded output');
      }
      if (control.interruptControl) assert(lifecycle.interruptions >= 2, 'Repeated signal during cleanup was not exercised');
      if (control.name === 'orphan') {
        const orphan = JSON.parse(readFileSync(orphanFile, 'utf8'));
        assert.notEqual(orphan.parent, orphan.originalParent, 'Control never became orphaned');
        assert.equal(lifecycle.owned.get(orphan.pid)?.birth, orphan.birth, 'Orphan was not tracked by scope/identity');
        assert.notEqual(processes().get(orphan.pid)?.birth, orphan.birth, 'Orphan survived cleanup');
        assert(!existsSync(lateWrite), 'Orphan wrote after cleanup');
      }
      console.log(`PASS: synthetic PTY ${control.name} rejected and cleaned (not Wrangler).`);
    } else {
      if (failure) { process.stderr.write(failure.output ?? ''); throw failure; }
      assert.match(output, /dry-run: exiting now/i);
      for (const path of ['dist/frontend/index.html', 'dist/worker/index.js']) assert(existsSync(join(project, path)), `Missing artifact: ${path}`);
      console.log(`PASS: protected PTY build completed without skills prompt (${accepted ? 'aged accepted metadata preserved' : 'fresh settings'}); synthetic skills unchanged.`);
    }
  } finally {
    if (lifecycle.reaped) rmSync(temporary, { recursive: true, force: true });
    else console.error(`Fixture retained for safe inspection: ${temporary}`);
  }
}

preflight();
await check();
await check(undefined, true);
for (const control of controls) await check(control);
