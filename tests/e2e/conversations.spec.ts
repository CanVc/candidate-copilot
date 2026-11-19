import { chromium } from '@playwright/test';
import { cpSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { test, expect } from './local-fixture';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('real D1 professional intent classifier and canonical Chromium direct results', async ({ local }) => {
  for (const path of ['tests/e2e/professional-intent-worker.ts', 'tests/e2e/professional-intent-runtime.mjs']) cpSync(join(root, path), join(local.project, path));
  const output = await local.completed(local.startCommand(process.execPath, ['tests/e2e/professional-intent-runtime.mjs', chromium.executablePath()]));
  expect(output).toContain('PASS: real D1 professional intent');
});

test('real D1 isolated conversations and atomic creation limits and controlled A07/A09 fixtures', async ({ local }) => {
  for (const path of ['tests/e2e/conversations-worker.ts', 'tests/e2e/conversations-runtime.mjs']) cpSync(join(root, path), join(local.project, path));
  const output = await local.completed(local.startCommand(process.execPath, ['tests/e2e/conversations-runtime.mjs']));
  expect(output).toContain('PASS: real D1 conversations, independent readers');
  expect(output).toContain('no production UI or hosted ingress proof');
});

test('real D1 global admission and manual recovery across independent instances', async ({ local }) => {
  for (const path of ['tests/e2e/conversation-admission-worker.ts', 'tests/e2e/conversation-admission-runtime.mjs']) cpSync(join(root, path), join(local.project, path));
  const output = await local.completed(local.startCommand(process.execPath, ['tests/e2e/conversation-admission-runtime.mjs', chromium.executablePath()]));
  expect(output).toContain('PASS: real D1 admission');
});

test('Chromium-generated creation headers use checked-in frontend/Worker origin configuration', async ({ local, page }) => {
  await local.completed(local.startCommand(process.execPath, ['scripts/local-d1.mjs', 'init']));
  const worker = local.start('dev:worker');
  await local.ready(worker, 'http://127.0.0.1:8787/api/health');
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  await page.goto('http://127.0.0.1:5173/');
  const creationRequest = page.waitForRequest((request) => request.url().endsWith('/api/conversations') && request.method() === 'POST');
  const created = await page.evaluate(async () => {
    const before = Date.now();
    const response = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    return { before, after: Date.now(), status: response.status, cache: response.headers.get('Cache-Control'), body: await response.json() as { conversationId: string; sessionToken: string } };
  });
  const generatedHeaders = await (await creationRequest).allHeaders();
  expect(generatedHeaders.origin).toBe('http://127.0.0.1:5173');
  expect(generatedHeaders['content-type']).toBe('application/json');
  expect(created.status).toBe(201);
  expect(created.cache).toBe('no-store');
  expect(Object.keys(created.body).sort()).toEqual(['conversationId', 'sessionToken']);
  const read = await page.evaluate(async (credentials) => {
    const response = await fetch(`/api/conversations/${credentials.conversationId}`, { headers: { Authorization: `Bearer ${credentials.sessionToken}` } });
    return { status: response.status, cache: response.headers.get('Cache-Control'), body: await response.json() };
  }, created.body);
  expect(read).toEqual({ status: 200, cache: 'no-store', body: { conversationId: created.body.conversationId, transcript: [], processing: { status: 'idle' }, admission: { available: false, reason: 'scope_unavailable' } } });

  const utcDay = (time: number) => Math.floor(time / 86_400_000);
  const knownCreationsByDay = new Map<number, number>();
  const recordCreation = (before: number, after: number) => {
    if (utcDay(before) !== utcDay(after)) return; // Admission day straddles observation.
    const day = utcDay(before);
    const count = (knownCreationsByDay.get(day) ?? 0) + 1;
    expect(count).toBeLessThanOrEqual(10);
    knownCreationsByDay.set(day, count);
  };
  recordCreation(created.before, created.after);
  for (let i = 0; i < 9; i++) {
    const filled = await page.evaluate(async (index) => {
      const before = Date.now();
      const response = await fetch('/api/conversations', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': `192.0.2.${index + 1}` }, body: '{}',
      });
      return { before, after: Date.now(), status: response.status };
    }, i);
    expect(filled.status).toBe(201);
    recordCreation(filled.before, filled.after);
  }
  await local.stop(worker);
  const restarted = local.start('dev:worker');
  await local.ready(restarted, 'http://127.0.0.1:8787/api/health');
  let persistedCreations = 10;
  let observedExhaustion = false;
  // Midnight can legitimately divide the ten initial creations or occur during
  // restart. Refill only a demonstrably newer UTC day, never forgive a same-day
  // reset. Bound the fixture rather than retrying indefinitely.
  for (let attempt = 0; attempt < 21; attempt++) {
    const capped = await page.evaluate(async () => {
      const before = Date.now();
      const response = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      return { before, after: Date.now(), status: response.status, retry: response.headers.get('Retry-After'), body: await response.json() };
    });
    if (capped.status === 201) {
      expect(utcDay(capped.after)).toBeGreaterThan(utcDay(created.before));
      recordCreation(capped.before, capped.after);
      persistedCreations++;
      continue;
    }
    expect(capped.status).toBe(429);
    expect(capped.body).toEqual({ error: 'rate_limited' });
    const possibleResumeTimes = [...new Set([capped.before, capped.after].map((time) =>
      new Date((utcDay(time) + 1) * 86_400_000).toUTCString()))];
    expect(possibleResumeTimes).toContain(capped.retry);
    observedExhaustion = true;
    break;
  }
  expect(observedExhaustion).toBe(true);
  expect(await page.evaluate(async (credentials) => (await fetch(`/api/conversations/${credentials.conversationId}`, {
    headers: { Authorization: `Bearer ${credentials.sessionToken}` },
  })).status, created.body)).toBe(200);

  // A foreign-origin form navigation avoids CORS/preflight hiding the actual
  // creation-policy response. Origin is checked before media type/Fetch Mode.
  await page.goto('http://127.0.0.1:8787/');
  const foreignRequest = page.waitForRequest((request) => request.url() === 'http://127.0.0.1:5173/api/conversations' && request.method() === 'POST');
  const foreignResponse = page.waitForResponse((response) => response.url() === 'http://127.0.0.1:5173/api/conversations' && response.request().method() === 'POST');
  await page.setContent('<form action="http://127.0.0.1:5173/api/conversations" method="POST" enctype="text/plain"><button type="submit">Créer</button></form>');
  await page.getByRole('button', { name: 'Créer' }).click();
  expect((await (await foreignRequest).allHeaders()).origin).toBe('http://127.0.0.1:8787');
  const rejection = await foreignResponse;
  expect(rejection.status()).toBe(403);
  expect((await rejection.allHeaders())['cache-control']).toBe('no-store');
  await expect(page.locator('body')).toHaveText(JSON.stringify({ error: 'creation_origin_rejected' }));
  await local.stop(frontend);
  await local.stop(restarted);
  const output = await local.completed(local.startCommand(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'candidate-copilot-local', '--config', 'wrangler.jsonc', '--local', '--persist-to', '.wrangler/state', '--env-file', '/dev/null', '--json', '--command', 'SELECT COUNT(*) AS n FROM conversations']));
  expect(JSON.parse(output)[0].results).toEqual([{ n: persistedCreations }]);
  // This is HTTP/configuration verification, not acceptance of an entry UI.
});

test('real D1 complete results, populated 0005 upgrade and canonical Chromium POST GET replay', async ({ local }) => {
  for (const path of ['tests/e2e/conversation-results-worker.ts', 'tests/e2e/conversation-results-runtime.mjs']) cpSync(join(root, path), join(local.project, path));
  // Hold only the disposable fixture's next migration until 0005 has real rows.
  renameSync(join(local.project, 'migrations/0006_conversation_results.sql'), join(local.project, 'pending-conversation-results.sql'));
  const output = await local.completed(local.startCommand(process.execPath, ['tests/e2e/conversation-results-runtime.mjs', chromium.executablePath()]));
  expect(output).toContain('PASS: populated 0005-to-0006 upgrade preserves admitted rows and guarded completion');
  expect(output).toContain('PASS: real D1 complete results');
});
