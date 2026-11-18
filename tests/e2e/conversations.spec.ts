import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { test, expect } from './local-fixture';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('real D1 isolated conversations and controlled A07/A09 fixtures, without UI/counter integration', async ({ local }) => {
  for (const path of ['tests/e2e/conversations-worker.ts', 'tests/e2e/conversations-runtime.mjs']) cpSync(join(root, path), join(local.project, path));
  const output = await local.completed(local.startCommand(process.execPath, ['tests/e2e/conversations-runtime.mjs']));
  expect(output).toContain('PASS: real D1 conversations, independent readers');
  expect(output).toContain('no counter/UI integration');
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
    const response = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    return { status: response.status, cache: response.headers.get('Cache-Control'), body: await response.json() as { conversationId: string; sessionToken: string } };
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
  expect(read).toEqual({ status: 200, cache: 'no-store', body: { conversationId: created.body.conversationId, transcript: [], processing: { status: 'idle' }, admission: { available: false, reason: 'admission_unavailable' } } });

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
  await local.stop(worker);
  const output = await local.completed(local.startCommand(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'candidate-copilot-local', '--config', 'wrangler.jsonc', '--local', '--persist-to', '.wrangler/state', '--env-file', '/dev/null', '--json', '--command', 'SELECT COUNT(*) AS n FROM conversations']));
  expect(JSON.parse(output)[0].results).toEqual([{ n: 1 }]);
  // This is HTTP/configuration verification, not acceptance of an entry UI.
});
