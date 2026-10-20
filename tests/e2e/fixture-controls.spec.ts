import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect, test as base } from '@playwright/test';
import { LocalFixture, ownedProcesses, scopeKey } from './local-fixture';

const test = base.extend<{ control: LocalFixture }>({
  control: async ({}, use, testInfo) => {
    const control = new LocalFixture({ startupTimeout: 1_000, outputLimit: 4_096 });
    try { await use(control); } finally {
      try {
        if (testInfo.status !== testInfo.expectedStatus) await control.attachLogs(testInfo);
      } finally { await control.dispose(); }
    }
  },
});
test.setTimeout(20_000);

const wait = 'setInterval(() => {}, 1000)';
const questions = [
  ['install', 'Would you like Wrangler to automatically install Cloudflare skills for the best experience?'],
  ['update', 'It looks like your Cloudflare skills might be out of date. Would you like Wrangler to update them for you?'],
  ['wrapped install', 'Would you like Wrangler to automatically inst\r\nall Cloudfl\r\nare skills for the best experience?'],
  ['generic', 'Continue? [y/N]'],
] as const;

for (const [name, question] of questions) {
  test(`synthetic ${name} prompt is rejected without input and cleaned`, async ({ control }) => {
    const command = control.startSynthetic(`console.log(${JSON.stringify(question)}); ${wait}`);
    await expect(control.rejected(command)).rejects.toMatchObject({ code: 'UNEXPECTED_PROMPT' });
    await control.stop(command);
    expect(ownedProcesses(command)).toHaveLength(0);
  });
}

test('synthetic noisy output is rejected, retained at its byte cap and attached without expansion', async ({ control }) => {
  const command = control.startSynthetic(`process.on('SIGTERM', () => process.stdout.write('LATE'.repeat(32768))); process.stdout.write('x'.repeat(131072)); ${wait}`);
  await expect(control.rejected(command)).rejects.toMatchObject({ code: 'OUTPUT_LIMIT' });
  await control.stop(command);
  expect(command.bytes).toBe(4_096);
  expect(Buffer.byteLength(command.output)).toBe(4_096);
  expect(command.discardedBytes).toBeGreaterThan(0);
  expect(ownedProcesses(command)).toHaveLength(0);
  const attached: Buffer[] = [];
  await control.attachLogs({ attach: async (_name, options) => {
    expect(options?.contentType).toBe('text/plain');
    attached.push(Buffer.from(options?.body ?? ''));
  } });
  expect(attached).toHaveLength(1);
  expect(attached[0]?.length).toBe(4_096);
  expect(attached[0]?.toString()).toBe(command.output);
});

test('a silent synthetic command reaches the internal deadline and is cleaned', async ({ control }) => {
  const command = control.startSynthetic(wait);
  const start = Date.now();
  await expect(control.rejected(command)).rejects.toMatchObject({ code: 'DEADLINE', message: expect.stringContaining('1000ms') });
  expect(Date.now() - start).toBeLessThan(2_000);
  await control.stop(command);
  expect(ownedProcesses(command)).toHaveLength(0);
});

test('rejected accepts numeric nonzero exits but not success or signal termination', async ({ control }) => {
  const failed = control.startSynthetic("console.error('SYNTHETIC_BUILD_ERROR'); process.exit(7)");
  await expect(control.rejected(failed)).resolves.toContain('SYNTHETIC_BUILD_ERROR');
  expect(failed.code).toBe(7);
  expect(failed.signal).toBeNull();
  const success = control.startSynthetic('process.exit(0)');
  await expect(control.rejected(success)).rejects.toMatchObject({ code: 'EXPECTED_NONZERO', message: expect.stringContaining('exit=0, signal=null') });
  const signalled = control.startSynthetic("process.kill(process.pid, 'SIGTERM')");
  await expect(control.rejected(signalled)).rejects.toMatchObject({ code: 'EXPECTED_NONZERO', message: expect.stringContaining('exit=null, signal=SIGTERM') });
  expect(signalled.code).toBeNull();
  expect(signalled.signal).toBe('SIGTERM');
});

test('completed bounds one-shots and cleans every outcome before returning', async ({ control }) => {
  const success = control.startSynthetic("console.log('ONE_SHOT_OK')");
  await expect(control.completed(success)).resolves.toContain('ONE_SHOT_OK');
  expect(ownedProcesses(success)).toHaveLength(0);
  for (const [program, code] of [
    ['process.exit(7)', 'COMMAND_FAILED'],
    ["process.kill(process.pid, 'SIGTERM')", 'COMMAND_FAILED'],
    [wait, 'DEADLINE'],
    [`process.stdout.write('x'.repeat(131072)); ${wait}`, 'OUTPUT_LIMIT'],
    [`console.log('Continue? [y/N]'); ${wait}`, 'UNEXPECTED_PROMPT'],
  ] as const) {
    const command = control.startSynthetic(program);
    await expect(control.completed(command)).rejects.toMatchObject({ code });
    // No explicit stop or fixture teardown may mask a completed() cleanup gap.
    expect(ownedProcesses(command)).toHaveLength(0);
    expect(command.exited).toBe(true);
  }
});

test('real simulation failure stops smoke before a proven Playwright tripwire', async ({}, testInfo) => {
  test.setTimeout(40_000);
  const local = new LocalFixture({ startupTimeout: 10_000 });
  try {
    const bin = join(local.project, 'node_modules/.bin');
    // Unlink only the fixture's shared bin directory before writing a tripwire;
    // never write through a symlink into the source checkout's dependencies.
    expect(lstatSync(bin).isSymbolicLink()).toBe(true);
    rmSync(bin);
    mkdirSync(bin);
    symlinkSync(join(local.project, 'node_modules/vitest/vitest.mjs'), join(bin, 'vitest'));
    const marker = join(local.directory, 'playwright-executed');
    local.env.PLAYWRIGHT_TRIPWIRE = marker;
    writeFileSync(join(bin, 'playwright'), '#!/bin/sh\nprintf "Playwright reached\\n" > "$PLAYWRIGHT_TRIPWIRE"\n', { mode: 0o755 });

    // Run the unchanged npm smoke command with the real existing simulation
    // suite first: success must reach the tripwire through npm's actual PATH.
    await local.completed(local.startCommand('npm', ['run', 'test:smoke']));
    expect(readFileSync(marker, 'utf8')).toBe('Playwright reached\n');
    rmSync(marker);

    const adapter = join(local.project, 'src/adapters/llm/simulated.ts');
    const source = readFileSync(adapter, 'utf8');
    const output = "return 'Simulated LLM: bootstrap-pong';";
    expect(source.split(output)).toHaveLength(2);
    writeFileSync(adapter, source.replace(output, "return 'DELIBERATE_SIMULATION_FAILURE';"));
    const failed = local.startCommand('npm', ['run', 'test:smoke']);
    try {
      const output = await local.rejected(failed);
      expect(output).toContain('tests/bootstrap/simulation.test.ts');
      expect(output).toContain('DELIBERATE_SIMULATION_FAILURE');
      expect(failed.code).toBe(1);
      expect(failed.signal).toBeNull();
      expect(existsSync(marker)).toBe(false);
    } finally { await local.stop(failed); }
    expect(ownedProcesses(failed)).toHaveLength(0);
  } finally {
    try {
      if (testInfo.status !== testInfo.expectedStatus) await local.attachLogs(testInfo);
    } finally { await local.dispose(); }
  }
});

// Both parent and leaves are harmless Node controls. The parent creates a new
// owned leaf during TERM cleanup, so a one-time PID snapshot is insufficient.
const respawner = `const { spawn } = require('node:child_process');
  const leaf = ${JSON.stringify(`process.on('SIGTERM', () => {}); console.log('LEAF_READY'); ${wait}`)};
  const launch = () => spawn(process.execPath, ['-e', leaf], { stdio: ['ignore', 'inherit', 'inherit'] });
  launch();
  process.on('SIGTERM', () => { launch(); console.log('SYNTHETIC_RESPAWNED'); });
  ${wait}`;

test('cleanup finds and stops owned descendants respawned during cleanup', async ({ control }) => {
  const command = control.startSynthetic(respawner);
  await expect.poll(() => command.output).toContain('LEAF_READY');
  await control.stop(command);
  expect(command.output).toContain('SYNTHETIC_RESPAWNED');
  expect(command.owned.size).toBeGreaterThanOrEqual(3);
  expect(ownedProcesses(command)).toHaveLength(0);
});

test('repeated real interruption during cleanup is handled in an isolated LocalFixture control', async ({ control }) => {
  const moduleUrl = new URL('./local-fixture.ts', import.meta.url).href;
  const supervisor = control.startSynthetic(`(async () => {
    const { LocalFixture } = await import(${JSON.stringify(moduleUrl)});
    const local = new LocalFixture({ startupTimeout: 1000, outputLimit: 4096 });
    const command = local.startSynthetic(${JSON.stringify(respawner)});
    console.log('CONTROL_SCOPE:' + JSON.stringify({ directory: local.directory, scope: command.scope }));
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => console.log('INTERRUPT_COUNT:' + local.interruptions));
    const ready = setInterval(() => {
      if (!command.output.includes('LEAF_READY')) return;
      clearInterval(ready);
      console.log('CONTROL_READY');
    }, 10);
  })().catch(error => { console.error(error); process.exit(1); });`);
  await expect.poll(() => supervisor.output, { timeout: 5_000 }).toContain('CONTROL_SCOPE:');
  const match = supervisor.output.match(/CONTROL_SCOPE:([^\n]+)/);
  expect(match).not.toBeNull();
  const nested = JSON.parse(match![1]!) as { directory: string; scope: string };
  const descendants = control.trackScope('nested interruption control', nested.scope);
  try {
    await expect.poll(() => supervisor.output, { timeout: 5_000 }).toContain('CONTROL_READY');
    const identity = ownedProcesses(supervisor)[0];
    expect(identity).toBeDefined();
    const [pid, original] = identity!;
    expect(ownedProcesses(supervisor).find(([candidate]) => candidate === pid)?.[1].birth).toBe(original.birth);
    process.kill(pid, 'SIGINT');
    await delay(20);
    expect(ownedProcesses(supervisor).find(([candidate]) => candidate === pid)?.[1].birth).toBe(original.birth);
    process.kill(pid, 'SIGTERM');
    await expect(control.rejected(supervisor)).resolves.toContain('INTERRUPT_COUNT:2');
    expect(supervisor.output).toContain('INTERRUPT_COUNT:1');
    expect(supervisor.code).toBe(130);
    expect(supervisor.signal).toBeNull();
    expect(existsSync(nested.directory)).toBe(false);
    expect(ownedProcesses(descendants)).toHaveLength(0);
  } finally {
    // The outer fixture also owns these exact synthetic scopes if the nested
    // verifier fails. Never delete its copy while either scope can still write.
    await control.stop(supervisor);
    await control.stop(descendants);
    rmSync(nested.directory, { recursive: true, force: true });
  }
});

test('suspended disposable Chromium cannot block bounded owned-browser teardown', async ({ control }) => {
  const command = control.trackScope('suspended disposable Chromium');
  const environment = { ...control.env, [scopeKey]: command.scope };
  const browser = await chromium.launch({ env: environment, timeout: 5_000 });
  try {
    await browser.newPage();
    const root = ownedProcesses(command).find(([pid]) => {
      const args = readFileSync(`/proc/${pid}/cmdline`, 'utf8');
      return args.includes('--remote-debugging-pipe') && !args.includes('--type=');
    });
    expect(root).toBeDefined();
    const [pid, original] = root!;
    expect(ownedProcesses(command).find(([candidate]) => candidate === pid)?.[1].birth).toBe(original.birth);
    process.kill(pid, 'SIGSTOP'); // Only this fixture-marked, identified browser.
    const start = Date.now();
    await control.closeBrowser(browser, environment);
    expect(Date.now() - start).toBeLessThan(3_000);
    expect(browser.isConnected()).toBe(false);
    expect(ownedProcesses(command)).toHaveLength(0);
  } finally {
    // Does not depend on browser responsiveness even if an assertion failed.
    await control.closeBrowser(browser, environment);
  }
});
