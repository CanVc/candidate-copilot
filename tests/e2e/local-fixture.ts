import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium, test as base } from '@playwright/test';
import type { Browser, TestInfo } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const scopeKey = 'CANDIDATE_COPILOT_SMOKE_SCOPE';
type Identity = { parent: number; birth: string };
export type Command = {
  label: string;
  scope: string;
  readonly output: string;
  retained: Buffer;
  bytes: number;
  discardedBytes: number;
  failure?: Error;
  failureObserved: boolean;
  exited: boolean;
  code: number | null;
  signal: NodeJS.Signals | null;
  closed: Promise<void>;
  owned: Map<number, Identity>;
};

function processes(): Map<number, Identity> {
  const result = new Map<number, Identity>();
  for (const name of readdirSync('/proc').filter((name) => /^\d+$/.test(name))) {
    try {
      const stat = readFileSync(`/proc/${name}/stat`, 'utf8');
      const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      result.set(Number(name), { parent: Number(fields[1]), birth: fields[19]! });
    } catch (error) {
      if (!['ENOENT', 'ESRCH', 'EACCES', 'EPERM'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
    }
  }
  return result;
}

export function ownedProcesses(command: Command) {
  const current = processes();
  for (const [pid, identity] of current) {
    try {
      if (readFileSync(`/proc/${pid}/environ`).toString().split('\0').includes(`${scopeKey}=${command.scope}`)) {
        command.owned.set(pid, identity);
      }
    } catch (error) {
      if (!['ENOENT', 'ESRCH', 'EACCES', 'EPERM'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
    }
  }
  return [...command.owned].filter(([pid, identity]) => current.get(pid)?.birth === identity.birth);
}

export class LocalFixture {
  readonly directory = mkdtempSync(join(tmpdir(), 'candidate-copilot-smoke-'));
  readonly project = join(this.directory, 'project');
  readonly env: Record<string, string>;
  readonly canaries: { path: string; marker: string }[] = [];
  private readonly commands: Command[] = [];
  private disposing: Promise<void> | undefined;
  private readonly startupTimeout: number;
  private readonly outputLimit: number;
  interruptions = 0;
  private readonly interrupted = () => {
    // Keep the handler installed through cleanup, including repeated signals.
    if (++this.interruptions > 1) return;
    void this.dispose().then(() => process.exit(130), (error: unknown) => {
      console.error(error);
      process.exit(1);
    });
  };

  constructor(limits: { startupTimeout?: number; outputLimit?: number } = {}) {
    this.startupTimeout = limits.startupTimeout ?? 25_000;
    this.outputLimit = limits.outputLimit ?? 250_000;
    for (const path of ['package.json', 'frontend/index.html', 'frontend/src', 'src', 'vite.config.ts', 'wrangler.jsonc', 'tsconfig.json', 'tsconfig.frontend.json', 'tsconfig.worker.json']) {
      mkdirSync(dirname(join(this.project, path)), { recursive: true });
      cpSync(join(root, path), join(this.project, path), {
        recursive: true,
        filter: (source) => lstatSync(source).isDirectory() || (lstatSync(source).isFile() && /\.(?:jsonc?|tsx?|css|html)$/.test(source)),
      });
    }
    // Share immutable installed packages, not Vite's writable dev caches.
    mkdirSync(join(this.project, 'node_modules'));
    for (const name of readdirSync(join(root, 'node_modules')).filter((name) => !name.startsWith('.vite'))) {
      symlinkSync(join(root, 'node_modules', name), join(this.project, 'node_modules', name));
    }
    const settings = join(this.directory, 'settings');
    this.env = {
      PATH: process.env.PATH!, HOME: join(this.directory, 'home'), LANG: 'C.UTF-8', CI: 'true',
      WRANGLER_SEND_METRICS: 'false', WRANGLER_CACHE_DIR: join(settings, 'wrangler-cache'), WRANGLER_LOG_PATH: join(settings, 'logs'),
      XDG_CONFIG_HOME: join(settings, 'config'), XDG_CACHE_HOME: join(settings, 'cache'), XDG_DATA_HOME: join(settings, 'data'), XDG_STATE_HOME: join(settings, 'state'),
      npm_config_cache: join(settings, 'npm-cache'), npm_config_userconfig: '/dev/null', npm_config_globalconfig: join(settings, 'empty-global-npmrc'), npm_config_update_notifier: 'false',
      TMPDIR: join(settings, 'tmp'),
    };
    for (const path of [this.env.HOME!, this.env.TMPDIR!]) mkdirSync(path, { recursive: true });
    writeFileSync(this.env.npm_config_globalconfig!, '');
    for (const path of [
      'content/private/preparation.md', 'content/public/unpublished.md', 'docs/preparation.md',
      '_bmad/preparation.md', '.agents/preparation.md', '.env', '.env.local', '.dev.vars',
      'frontend/.env', 'frontend/.env.local', 'frontend/.dev.vars', 'frontend/preparation.md',
      'frontend/public/preparation.txt', 'public/preparation.txt', '.wrangler/state/generated.txt',
    ]) {
      const marker = `DEV_HTTP_CANARY_${randomUUID().replaceAll('-', '')}`;
      const destination = join(this.project, path);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, /\.(env|dev\.vars)/.test(path) ? `VITE_SMOKE_CANARY=${marker}\n` : marker);
      this.canaries.push({ path, marker });
    }
    const shellMarker = `DEV_HTTP_CANARY_${randomUUID().replaceAll('-', '')}`;
    this.env.VITE_SMOKE_SHELL = shellMarker;
    this.canaries.push({ path: '(shell)', marker: shellMarker });
    // Materialize Vite's env object in this disposable copy, never real source.
    writeFileSync(join(this.project, 'frontend/src/main.tsx'), '\nconsole.log(import.meta.env);\n', { flag: 'a' });
    process.on('SIGINT', this.interrupted);
    process.on('SIGTERM', this.interrupted);
  }

  // The explicit scope argument is used only to retain ownership of a nested,
  // disposable fixture control if its supervising control exits unexpectedly.
  trackScope(label: string, scope: string = randomUUID()): Command {
    const retained = Buffer.alloc(this.outputLimit);
    const command: Command = {
      label, scope, retained, bytes: 0, discardedBytes: 0, failureObserved: false,
      get output() { return retained.subarray(0, this.bytes).toString(); },
      exited: false, code: null, signal: null, closed: Promise.resolve(), owned: new Map(),
    };
    this.commands.push(command);
    return command;
  }

  start(script: 'dev:frontend' | 'dev:worker'): Command {
    return this.launch('npm', ['run', script], script);
  }

  // Harmless synthetic programs exercise this same launcher, never installers.
  startSynthetic(code: string): Command {
    return this.launch(process.execPath, ['-e', code], 'synthetic control');
  }

  private launch(executable: string, args: string[], label: string): Command {
    const command = this.trackScope(label);
    const child = spawn(executable, args, {
      cwd: this.project, env: { ...this.env, [scopeKey]: command.scope }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    command.closed = new Promise((resolve) => child.once('close', (code, signal) => {
      command.exited = true;
      command.code = code;
      command.signal = signal;
      resolve();
    }));
    child.once('error', (error) => { command.failure ??= error; });
    const receive = (bytes: Buffer) => {
      const count = Math.min(bytes.length, this.outputLimit - command.bytes);
      bytes.copy(command.retained, command.bytes, 0, count);
      command.bytes += count;
      command.discardedBytes += bytes.length - count;
      if (bytes.length > count) command.failure ??= this.error(command, 'OUTPUT_LIMIT', `Startup output exceeded ${this.outputLimit} bytes`);
      const plain = command.output.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').replace(/\s/g, '');
      if (/[\[(]y\/n[\])]|(?:install|update)[^?]*skills[^?]*\?|cloudflareskillsmightbeoutofdate\.[^?]*updatethem[^?]*\?/i.test(plain)) {
        command.failure ??= this.error(command, 'UNEXPECTED_PROMPT', 'Unexpected interactive startup prompt (no answer sent)');
      }
    };
    child.stdout!.on('data', receive);
    child.stderr!.on('data', receive);
    if (child.pid) {
      const identity = processes().get(child.pid);
      if (identity) command.owned.set(child.pid, identity);
    }
    return command;
  }

  private error(command: Command, code: string, message: string): Error {
    return Object.assign(new Error(`${message} (exit=${command.code}, signal=${command.signal})\n${command.output}`), { code });
  }

  private reject(command: Command, error: Error): never {
    command.failureObserved = true;
    throw error;
  }

  browserEnvironment(): Record<string, string> {
    return { ...this.env, [scopeKey]: this.trackScope('Chromium').scope };
  }

  async closeBrowser(browser: Browser, environment: Record<string, string>): Promise<void> {
    const command = this.commands.find((candidate) => candidate.scope === environment[scopeKey]);
    assert(command, 'Missing owned browser scope');
    // Start protocol closure, but do not wait for a responsive Chromium before
    // beginning bounded PID/start-time-checked cleanup of its owned scope.
    const closing = browser.close();
    await Promise.all([
      this.stop(command),
      Promise.race([closing, delay(2_000, undefined, { ref: false }).then(() => { throw new Error('Owned browser close exceeded 2000ms'); })]),
    ]);
  }

  async attachLogs(testInfo: Pick<TestInfo, 'attach'>): Promise<void> {
    for (const [index, command] of this.commands.entries()) {
      if (command.output) await testInfo.attach(`${index}-${command.label.replaceAll(':', '-')}.log`, {
        body: command.retained.subarray(0, command.bytes), contentType: 'text/plain',
      });
    }
  }

  async ready(command: Command, url: string): Promise<void> {
    const deadline = Date.now() + this.startupTimeout;
    while (Date.now() < deadline) {
      if (command.failure || command.exited) this.reject(command, command.failure ?? this.error(command, 'STARTUP_FAILED', 'Startup failed'));
      // Never accept an unrelated existing server: require the owned startup
      // banner, then the expected HTTP response, while the command is alive.
      const plain = command.output.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
      if (/Ready on http:\/\/127\.0\.0\.1:8787|Local:\s+http:\/\/127\.0\.0\.1:5173/.test(plain)) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(750) });
          if (response.ok && !command.exited && !command.failure) return;
        } catch { /* retry only until the bounded startup deadline */ }
      }
      await delay(100);
    }
    this.reject(command, this.error(command, 'DEADLINE', `Startup exceeded ${this.startupTimeout}ms for ${url}`));
  }

  async rejected(command: Command): Promise<string> {
    const deadline = Date.now() + this.startupTimeout;
    while (!command.exited && !command.failure && Date.now() < deadline) await delay(25);
    if (command.failure) this.reject(command, command.failure);
    if (!command.exited) this.reject(command, this.error(command, 'DEADLINE', `Startup exceeded ${this.startupTimeout}ms`));
    if (typeof command.code !== 'number' || command.code === 0) {
      this.reject(command, this.error(command, 'EXPECTED_NONZERO', 'Expected a numeric nonzero startup exit'));
    }
    return command.output;
  }

  assertNoLeaks(body: string) {
    for (const { marker } of this.canaries) {
      assert(!body.includes(marker), 'Raw canary leaked in dev HTTP response');
      for (const offset of [0, 1, 2]) {
        const encoded = Buffer.from(marker.slice(offset)).toString('base64').replace(/=+$/, '').slice(0, -3);
        assert(!body.includes(encoded), 'Encoded canary leaked in dev HTTP response');
      }
    }
  }

  async stop(command: Command): Promise<void> {
    const signalled = new Map<string, number>();
    const deadline = Date.now() + 6_000;
    while (ownedProcesses(command).length && Date.now() < deadline) {
      const remaining = ownedProcesses(command);
      // Persistent dev watchers can respawn a killed leaf. Ask every owned
      // process to stop together, then escalate only surviving identities.
      for (const [pid, identity] of remaining) {
        const key = `${pid}:${identity.birth}`;
        const first = signalled.get(key);
        const signal = first === undefined ? 'SIGTERM' : Date.now() - first >= 300 ? 'SIGKILL' : null;
        if (!signal || processes().get(pid)?.birth !== identity.birth) continue;
        try { process.kill(pid, signal); } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
        }
        if (first === undefined) signalled.set(key, Date.now());
      }
      await delay(25);
    }
    assert.equal(ownedProcesses(command).length, 0, `Owned startup descendants survived; fixture retained: ${this.directory}`);
    await Promise.race([command.closed, delay(2_000, undefined, { ref: false }).then(() => { throw new Error('Owned startup pipes did not close'); })]);
  }

  dispose(): Promise<void> {
    this.disposing ??= (async () => {
      try {
        // Attempt every owned command even if one cleanup fails.
        const results = await Promise.allSettled(this.commands.map((command) => this.stop(command)));
        const failed = results.find((result) => result.status === 'rejected');
        if (failed?.status === 'rejected') throw failed.reason;
        rmSync(this.directory, { recursive: true, force: true });
        const failure = this.commands.find((command) => command.failure && !command.failureObserved)?.failure;
        if (failure) throw failure;
      } finally {
        process.removeListener('SIGINT', this.interrupted);
        process.removeListener('SIGTERM', this.interrupted);
      }
    })();
    return this.disposing;
  }
}

export const test = base.extend<{ local: LocalFixture }>({
  local: async ({}, use, testInfo) => {
    const local = new LocalFixture();
    try { await use(local); } finally {
      try {
        if (testInfo.status !== testInfo.expectedStatus) await local.attachLogs(testInfo);
      } finally { await local.dispose(); }
    }
  },
  page: async ({ local }, use) => {
    // Resolve the installed binary normally, but give the browser only disposable
    // HOME/settings and the same credential-free allowlisted environment.
    const environment = local.browserEnvironment();
    const browser = await chromium.launch({ env: environment });
    try {
      const context = await browser.newContext();
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(5_000);
      page.setDefaultNavigationTimeout(10_000);
      await use(page);
    } finally { await local.closeBrowser(browser, environment); }
  },
});

export { expect } from '@playwright/test';
