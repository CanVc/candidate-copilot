import { writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { test, expect } from './local-fixture';

test('real Chromium reaches Worker through the frontend proxy, then reports a stopped Worker', async ({ local, page }) => {
  const worker = local.start('dev:worker');
  await local.ready(worker, 'http://127.0.0.1:8787/api/health');
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const health = page.waitForResponse((response) => response.url() === 'http://127.0.0.1:5173/api/health' && response.status() === 200);
  await page.goto('http://127.0.0.1:5173/');
  expect(await (await health).json()).toEqual({ status: 'ok' });
  await expect(page.getByRole('status')).toHaveText('Worker disponible.');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Socle technique local');
  await expect(page.getByText('La disponibilité technique ne signifie pas que le produit est prêt.')).toBeVisible();
  await expect(page.locator('form, input, textarea')).toHaveCount(0);

  await local.stop(worker);
  const start = Date.now();
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Worker indisponible. Rechargez la page pour réessayer.');
  expect(Date.now() - start).toBeLessThan(5_000);
  expect(errors).toEqual([]);

  // A reload is a new attempt, not a latched failure.
  const restarted = local.start('dev:worker');
  await local.ready(restarted, 'http://127.0.0.1:8787/api/health');
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Worker disponible.');
});

test('browser bounds stalled/malformed health and cleans up StrictMode requests', async ({ local, page }) => {
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/health', (route) => route.fulfill({ contentType: 'application/json', body: '{"status":"wrong"}' }));
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByRole('status')).toContainText('Worker indisponible.');
  await page.unroute('**/api/health');
  await page.route('**/api/health', () => { /* deliberately stall; browser must abort */ });
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Vérification du Worker…');
  const start = Date.now();
  await expect(page.getByRole('status')).toContainText('Worker indisponible.');
  expect(Date.now() - start).toBeLessThan(5_000);
  await page.goto('about:blank');
  expect(errors).toEqual([]);
});

test('StrictMode cancels the obsolete request and ignores its completion after the current success', async ({ local, page }) => {
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');
  await page.clock.install();
  type Probe = {
    requests: { aborted: boolean; complete: () => void }[];
    obsoleteGate: Promise<void>;
    releaseObsolete: () => void;
    obsoleteFinished: boolean;
  };
  await page.addInitScript(() => {
    const state = globalThis as typeof globalThis & { healthProbe: Probe };
    let release!: () => void;
    state.healthProbe = {
      requests: [], obsoleteGate: new Promise<void>((resolve) => { release = resolve; }),
      releaseObsolete: () => release(), obsoleteFinished: false,
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (input, options) => {
      if (input !== '/api/health') return originalFetch(input, options);
      return new Promise<Response>((resolve) => {
        const request = {
          aborted: options?.signal?.aborted ?? false,
          complete: () => resolve(new Response('{"status":"ok"}')),
        };
        options?.signal?.addEventListener('abort', () => { request.aborted = true; });
        state.healthProbe.requests.push(request);
        // Intentionally ignore abort here: the real health helper must bound
        // cancellation, and App must also guard an obsolete async completion.
      });
    };
  });
  await page.route('**/src/health.ts', (route) => route.fulfill({
    contentType: 'text/javascript',
    body: `import { checkHealth as actualCheckHealth } from '/src/health.ts?lifecycle-original';
      let call = 0;
      export async function checkHealth(signal) {
        const obsolete = call++ === 0;
        const result = await actualCheckHealth(signal);
        if (obsolete) {
          // Hold the already-cancelled completion across the new success and
          // the old deadline to exercise App's guard, not just fetch cleanup.
          await globalThis.healthProbe.obsoleteGate;
          globalThis.healthProbe.obsoleteFinished = true;
        }
        return result;
      }`,
  }));
  await page.goto('http://127.0.0.1:5173/');
  await expect.poll(() => page.evaluate(() => {
    const { requests } = (globalThis as typeof globalThis & { healthProbe: Probe }).healthProbe;
    return requests.map(({ aborted }) => aborted);
  })).toEqual([true, false]);
  await page.evaluate(() => (globalThis as typeof globalThis & { healthProbe: Probe }).healthProbe.requests[1]!.complete());
  await expect(page.getByRole('status')).toHaveText('Worker disponible.');
  await page.clock.runFor(4_600);
  await page.evaluate(() => (globalThis as typeof globalThis & { healthProbe: Probe }).healthProbe.releaseObsolete());
  await page.waitForFunction(() => (globalThis as typeof globalThis & { healthProbe: Probe }).healthProbe.obsoleteFinished);
  await page.clock.runFor(100);
  await expect(page.getByRole('status')).toHaveText('Worker disponible.');
});

for (const [script, port] of [['dev:frontend', 5173], ['dev:worker', 8787]] as const) {
  test(`${script} rejects an occupied port without reusing or stopping its listener`, async ({ local }) => {
    const listener = createServer((socket) => socket.end('UNRELATED_LISTENER\n'));
    await new Promise<void>((resolve, reject) => {
      listener.once('error', reject);
      listener.listen({ host: '127.0.0.1', port, exclusive: true }, resolve);
    });
    try {
      const output = await local.rejected(local.start(script));
      expect(output).toMatch(new RegExp(`(?:${port}[^\\n]*(?:use|available)|(?:use|available)[^\\n]*${port})`, 'i'));
      expect(listener.listening).toBe(true);
    } finally {
      await new Promise<void>((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
    }
  });
}

test('a failed Worker startup exits nonzero with a useful build diagnosis', async ({ local }) => {
  writeFileSync(join(local.project, 'src/worker/index.ts'), 'export default { fetch: (; };\n');
  const output = await local.rejected(local.start('dev:worker'));
  expect(output).toMatch(/error|failed/i);
  expect(output).toContain('src/worker/index.ts');
});

test('dev HTTP denies disposable private/env/preparation files and serves no canary bytes', async ({ local, page }) => {
  const worker = local.start('dev:worker');
  await local.ready(worker, 'http://127.0.0.1:8787/api/health');
  const frontend = local.start('dev:frontend');
  await local.ready(frontend, 'http://127.0.0.1:5173/');

  const bodies: Promise<void>[] = [];
  page.on('response', (response) => {
    bodies.push(response.body().catch((error: unknown) => {
      // StrictMode can cancel its first health request before its body arrives.
      if (!response.url().endsWith('/api/health')) throw error;
      return Buffer.alloc(0);
    }).then((body) => local.assertNoLeaks(body.toString())));
  });
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByRole('status')).toHaveText('Worker disponible.');
  for (const { path } of local.canaries.filter(({ path }) => path !== '(shell)')) {
    const paths = [`/@fs${join(local.project, path)}`, `/${path}`];
    if (path.startsWith('frontend/')) paths.push(`/${path.slice('frontend/'.length)}`);
    for (const pathname of paths) {
      const response = await page.request.get(`http://127.0.0.1:5173${pathname}`, { headers: { Accept: '*/*' } });
      expect([403, 404], pathname).toContain(response.status());
      local.assertNoLeaks(await response.text());
    }
    const workerResponse = await page.request.get(`http://127.0.0.1:8787/${path}`);
    expect(workerResponse.status()).toBe(404);
    local.assertNoLeaks(await workerResponse.text());
  }
  for (const route of ['/api/llm', '/api/simulation', '/api/db', '/api/diagnostics']) {
    expect((await page.request.get(`http://127.0.0.1:5173${route}`)).status()).toBe(404);
  }
  await Promise.all(bodies);
});
