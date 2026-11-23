import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { Page } from '@playwright/test';
import { test, expect, type LocalFixture } from './local-fixture';
import type { ConversationResult } from '../../src/shared/conversation-result';
import type { ConversationView, CreatedConversation } from '../../src/shared/conversation';

const root = fileURLToPath(new URL('../../', import.meta.url));
const url = 'http://127.0.0.1:5173/';
const fixtureDb = (local: LocalFixture, action: string) => local.completed(local.startCommand(process.execPath, ['tests/e2e/portfolio-entry-db.mjs', action]));
async function start(local: LocalFixture, simulated: boolean | 'middle' | 'failed' = true, published = true) {
  for (const file of ['tests/e2e/portfolio-entry-db.mjs', 'tests/e2e/portfolio-entry-worker.ts',
    ...['build.ts', 'chunk.ts', 'markdown-blocks.ts', 'policy.json', 'publish.ts', 'validate.ts'].map(name => `tools/public-content/${name}`),
    ...['mission-regie-collections.md', 'projet-prototype-prets.md', 'projet-reperage-reserves.md'].map(name => `content/public/${name}`)]) {
    cpSync(join(root, file), join(local.project, file), { recursive: true });
  }
  if (simulated) {
    const entry = 'tests/e2e/portfolio-entry-runtime.ts';
    writeFileSync(join(local.project, entry), `export { ${simulated === true ? 'default' : `${simulated} as default`} } from './portfolio-entry-worker.ts';`);
    const config = join(local.project, 'wrangler.jsonc');
    writeFileSync(config, readFileSync(config, 'utf8').replace('src/worker/index.ts', entry));
  }
  await local.completed(local.startCommand(process.execPath, ['scripts/local-d1.mjs', 'init']));
  if (published) await fixtureDb(local, 'seed');
  await local.ready(local.start('dev:worker'), `${url.replace('5173', '8787')}api/health`);
  await local.ready(local.start('dev:frontend'), url);
}
async function counts(local: LocalFixture, conversations: number, messages: number) {
  const output = await fixtureDb(local, 'counts');
  expect(JSON.parse(output.trim().split('\n').at(-1)!)).toEqual({ conversations, creations: conversations, messages, answers: messages });
}
const free = (page: Page) => page.getByRole('button', { name: /^Entrée libre/ });
const status = (page: Page) => page.getByRole('status');
async function canonical(page: Page, creation: CreatedConversation, expectedQuestion: string, receipt: ConversationResult) {
  const response = await page.request.get(`${url}api/conversations/${creation.conversationId}`, { maxRedirects: 0, headers: { Authorization: `Bearer ${creation.sessionToken}` } });
  expect(response.status()).toBe(200);
  const view = await response.json() as ConversationView;
  expect(view.transcript.length).toBe(1);
  const [turn] = view.transcript;
  expect(turn?.question).toBe(expectedQuestion);
  expect(turn?.status).toBe('completed');
  expect(turn?.submittedScope.mode).toBe('global_public');
  expect(turn?.submittedScope.eligibleDocumentIds.length).toBe(3);
  expect(turn?.result?.status).toBe(receipt.status);
  expect(turn?.result).toEqual(receipt);
}

for (const mobile of [false, true]) for (const freeEntry of [false, true]) {
  test(`${mobile ? 'touch' : 'keyboard'} ${freeEntry ? 'free entry' : 'suggestion'} — one deliberate turn in workerd/D1`, async ({ local, page: base }, info) => {
    await start(local);
    const context = await base.context().browser()!.newContext({ hasTouch: mobile, viewport: { width: mobile ? 320 : 1280, height: mobile ? 580 : 800 } });
    try {
      let external = 0, creates = 0, posts = 0;
      await context.route('**/*', route => {
        const req = route.request(), target = new URL(req.url());
        if (target.origin !== url.slice(0, -1)) { external++; return route.abort(); }
        if (req.method() === 'POST' && target.pathname === '/api/conversations') creates++;
        if (req.method() === 'POST' && target.pathname.endsWith('/messages')) posts++;
        return route.continue();
      });
      const page = await context.newPage();
      await page.goto(url);
      const card = page.getByRole('region', { name: /Par où/ });
      await expect(card.getByRole('button')).toHaveCount(3);
      await expect(card).toHaveCSS('background-color', 'rgb(251, 250, 246)');
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 240, 232)');
      await expect(page.locator('body')).toHaveCSS('font-family', /Manrope/);
      if (mobile === freeEntry) await page.screenshot({ fullPage: true, path: info.outputPath('entry-landing.png') });
      const suggested = card.getByRole('button').first();
      await expect(suggested).toHaveCSS('font-family', /Newsreader/);
      const expected = freeEntry ? '  Quels choix décrit le projet fictif ?  ' : (await suggested.innerText());
      const message = page.waitForResponse(r => r.url().endsWith('/messages') && r.status() === 200);
      const receipt = page.waitForResponse(r => r.url() === `${url}api/conversations` && r.status() === 201);
      if (mobile) await (freeEntry ? free(page) : suggested).tap();
      else {
        await page.keyboard.press('Tab'); await expect(suggested).toBeFocused();
        await expect(suggested).toHaveCSS('outline-style', 'solid');
        await page.keyboard.press('Tab'); await expect(card.getByRole('button').nth(1)).toBeFocused();
        await page.keyboard.press('Tab'); await expect(free(page)).toBeFocused();
        if (!freeEntry) { await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); }
        await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
      }
      const access = await (await receipt).json() as CreatedConversation;
      const title = page.getByRole('heading', { name: 'BC — nom non renseigné' });
      await expect(title).toBeFocused();
      const guide = page.locator('details');
      await expect(guide).toHaveAttribute('open', '');
      await expect(guide).toContainText('clés API');
      await expect(guide).toHaveCSS('background-color', 'rgb(251, 250, 246)');
      await expect(page.getByText('Lieu non renseigné')).toBeVisible();
      await expect(page.getByText('Lieu non renseigné')).toHaveCSS('font-family', /DM Mono/);
      await expect(page.locator('header')).toHaveCSS('position', 'static');
      expect(await page.locator('html').evaluate(el => (el as unknown as { scrollWidth: number }).scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
      const identityBox = await page.locator('header').boundingBox();
      const guideBox = await guide.boundingBox();
      expect(identityBox!.y + identityBox!.height).toBeLessThanOrEqual(guideBox!.y);
      const summary = guide.locator('summary');
      if (mobile) await summary.tap();
      else { await page.keyboard.press('Tab'); await expect(summary).toBeFocused(); await page.keyboard.press('Space'); }
      await expect(guide).not.toHaveAttribute('open');
      if (mobile) await summary.tap(); else await page.keyboard.press('Enter');
      await expect(guide).toHaveAttribute('open', '');
      if (freeEntry) {
        await expect(status(page)).toContainText('Aucune question envoyée');
        await counts(local, 1, 0);
        await expect(page.getByLabel('Votre première question')).toHaveValue('');
        const field = page.getByLabel('Votre première question'), submit = page.getByRole('button', { name: 'Envoyer' });
        const boundary = '😀'.repeat(1000);
        await field.fill(boundary); await expect(page.locator('#count')).toHaveText('1000 / 1000 caractères'); await expect(submit).toBeEnabled();
        await field.fill(boundary + 'x'); await expect(page.locator('#count')).toHaveText('1001 / 1000 caractères'); await expect(submit).toBeDisabled();
        await field.fill(expected);
        if (mobile) await submit.tap(); else { await page.keyboard.press('Tab'); await expect(submit).toBeFocused(); await page.keyboard.press('Enter'); }
      }
      await expect(status(page)).toContainText('enregistré un résultat simulé');
      if (mobile === freeEntry) await page.screenshot({ fullPage: true, path: info.outputPath('entry-guide.png') });
      const saved = await (await message).json() as ConversationResult;
      expect(saved.status).toBe('clarification');
      await canonical(page, access, expected, saved);
      expect(await page.locator('.sent-question').textContent()).toBe(expected);
      await expect(page.locator('.answer-passage > p')).toHaveText(saved.blocks.map(b => b.text));
      await page.reload(); await expect(page.getByText(/ne reprend pas un accès/)).toBeVisible();
      await counts(local, 1, 1);
      expect({ external, creates, posts }).toEqual({ external: 0, creates: 1, posts: 1 });
    } finally { await context.close(); }
  });
}

test('lost 201 discards the suggestion; only an explicit empty creation can spend again', async ({ local, page }) => {
  await start(local);
  await page.route('**/api/conversations', async route => {
    expect((await route.fetch()).status()).toBe(201);
    await route.abort();
  }, { times: 1 });
  await page.goto(url);
  await page.locator('.suggestion').first().evaluate(el => { const button = el as unknown as { click(): void }; button.click(); button.click(); });
  await expect(page.getByText(/création a peut-être abouti/)).toBeVisible();
  await counts(local, 1, 0);
  await page.getByRole('button', { name: /nouvelle conversation vide/ }).click();
  await expect(status(page)).toContainText('Aucune question envoyée');
  await expect(page.getByRole('textbox')).toHaveValue('');
  await counts(local, 2, 0);
});

test('lost completed message result is unknown; reload never recovers or replays', async ({ local, page }) => {
  await start(local);
  let posts = 0;
  await page.route('**/messages', async route => { posts++; expect((await route.fetch()).status()).toBe(200); await route.abort(); });
  await page.goto(url); await page.locator('.suggestion').last().click();
  await expect(status(page)).toContainText('Résultat inconnu');
  await expect(page.locator('.answer-turn')).toHaveCount(0);
  await page.reload(); await expect(page.getByText(/ne reprend pas un accès/)).toBeVisible();
  await counts(local, 1, 1); expect(posts).toBe(1);
});

test('default Worker: distinguish missing documents from missing processor, never simulate success', async ({ local, page }) => {
  await start(local, false, false);
  await page.goto(url); await page.locator('.suggestion').first().click();
  await expect(status(page)).toContainText('documents publics ne sont pas disponibles');
  await fixtureDb(local, 'seed');
  await page.goto(`${url}?diagnostic`); await expect(status(page)).toHaveText('Worker disponible.');
  await page.getByRole('link', { name: 'Retour au portfolio' }).click(); await free(page).click();
  await expect(status(page)).toContainText('traitement local n’est pas disponible');
  await expect(page.getByRole('textbox')).not.toBeEditable();
  await expect(page.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  await counts(local, 2, 0);
});

test('confirmed allowance shows UTC resume time, no scheduled action', async ({ local, page: base }) => {
  await local.ready(local.start('dev:frontend'), url);
  const page = await base.context().browser()!.newPage({ timezoneId: 'America/Los_Angeles' });
  try {
  let calls = 0;
  await page.route('**/api/conversations', route => { calls++; return route.fulfill({ status: 429, json: { error: 'rate_limited' }, headers: { 'Retry-After': 'Sun, 22 Nov 2026 00:00:00 GMT' } }); });
  await page.clock.install({ time: new Date('2026-11-21T23:59:59Z') });
  await page.goto(url); await free(page).click();
  await expect(page.locator('time')).toHaveAttribute('datetime', '2026-11-22T00:00:00.000Z');
  await expect(page.locator('time')).toHaveText(/22\/11\/2026\s+00:00:00 UTC/);
  await page.reload(); await expect(page.locator('time')).toHaveAttribute('datetime', '2026-11-22T00:00:00.000Z');
  await page.clock.runFor(3000);
  await page.getByRole('link', { name: /Retour à l’entrée/ }).click(); await expect(free(page)).toBeEnabled(); expect(calls).toBe(1);
  } finally { await page.close(); }
});

test('reload between committed creation and receipt discards the selected question', async ({ local, page }) => {
  await start(local);
  let committed!: () => void, release!: () => void;
  const received = new Promise<void>(resolve => { committed = resolve; });
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/conversations', async route => {
    const response = await route.fetch();
    expect(response.status()).toBe(201);
    committed(); await hold;
    await route.fulfill({ response }).catch(() => { /* navigation cancelled the request */ });
  });
  await page.goto(url);
  await page.locator('.suggestion').first().click();
  try { await received; await page.reload(); } finally { release(); }
  await expect(page.getByText(/ne reprend pas un accès/)).toBeVisible();
  await counts(local, 1, 0);
});

test('nonempty initial transcript with admission available cannot release a suggestion', async ({ local, page }) => {
  await start(local);
  await page.route('**/api/conversations/*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...await response.json(), transcript: [{ status: 'completed' }] } });
  });
  let posts = 0; page.on('request', r => { if (r.url().endsWith('/messages')) posts++; });
  await page.goto(url); await page.locator('.suggestion').first().click();
  await expect(status(page)).toContainText('Impossible de vérifier'); await counts(local, 1, 0); expect(posts).toBe(0);
});

test('history denial before creation is a known no-send, not an uncertain POST', async ({ local, page }) => {
  await local.ready(local.start('dev:frontend'), url);
  let posts = 0; page.on('request', r => { if (r.method() === 'POST') posts++; });
  await page.goto(url); await page.evaluate(() => { (globalThis as unknown as { history: { replaceState: () => void } }).history.replaceState = () => { throw new Error('denied'); }; });
  await free(page).click(); await expect(page.getByText(/n’a pas été créée/)).toBeVisible(); expect(posts).toBe(0);
});

test('stale publication identity is rejected, not updated and resubmitted', async ({ local, page }) => {
  await start(local);
  // Deliver an older valid identity to the client; the real Worker owns admission.
  await page.route('**/api/health', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...await response.json(), catalogRevision: 'b'.repeat(40) } });
  });
  await page.goto(url); await page.locator('.suggestion').first().click();
  await expect(status(page)).toContainText('catalogue a changé');
  await expect(page.locator('.answer-turn')).toHaveCount(0);
  await counts(local, 1, 0);
});

test('confirmed answer hands off composer focus; changed fragment cannot retain a turn on explicit renewal', async ({ local, page }) => {
  await start(local); await page.goto(url); await free(page).click();
  const field = page.getByLabel('Votre première question'); await expect(field).toBeEditable();
  let release!: () => void, received!: () => void;
  const hold = new Promise<void>(r => { release = r; }), ready = new Promise<void>(r => { received = r; });
  await page.route('**/messages', async route => {
    const response = await route.fetch(); received(); await hold; await route.fulfill({ response });
  });
  await field.fill('Une question fictive ?'); await page.getByRole('button', { name: 'Envoyer' }).click();
  try { await ready; await field.focus(); } finally { release(); }
  await expect(page.getByRole('heading', { name: 'Demande de précision' })).toBeFocused();
  await page.goto(`${url}#autre`); await page.evaluate(() => (globalThis as unknown as { dispatchEvent(event: Event): boolean }).dispatchEvent(new Event('pagehide')));
  await expect(page.locator('.answer-turn')).toHaveCount(0);
  await page.getByRole('button', { name: /nouvelle conversation vide/ }).click();
  await expect(field).toBeEditable(); await expect(field).toHaveValue(''); await expect(page.locator('.answer-turn')).toHaveCount(0);
  await counts(local, 2, 1);
});

for (const mode of ['middle', 'failed'] as const) {
  test(`saved ${mode} receipt is rendered from real simulated workerd/D1`, async ({ local, page }) => {
    await start(local, mode);
    await page.goto(url);
    const creation = page.waitForResponse(r => r.url() === `${url}api/conversations` && r.status() === 201);
    const message = page.waitForResponse(r => r.url().endsWith('/messages') && r.status() === 200);
    const trigger = page.locator('.suggestion').first(), question = await trigger.innerText();
    await trigger.click();
    const access = await (await creation).json() as CreatedConversation, result = await (await message).json() as ConversationResult;
    await expect(page.locator('.answer-passage > p')).toHaveText(result.blocks.map(b => b.text));
    await counts(local, 1, 1);
    if (mode === 'failed') {
      expect(result.status).toBe('failed'); await expect(status(page)).toContainText('enregistré un échec');
      await expect(page.locator('.citations')).toHaveCount(0);
    } else {
      expect(result.status).toBe('answered');
      await fixtureDb(local, 'remove-publication');
      const [source] = result.sourceExcerpts;
      expect(source!.sectionTitle).toBe('Solution et choix importants');
      expect(source!.location).toContain(';context:');
      await page.getByRole('button', { name: source!.sourceTitle }).click();
      const viewer = page.getByRole('dialog');
      expect(await viewer.locator('blockquote').textContent()).toBe(source!.excerpt);
      await expect(viewer.locator('blockquote')).toContainText('inventé et sans rapport avec BC');
      await expect(viewer.getByRole('heading', { name: source!.sectionTitle! })).toBeVisible();
      for (const [label, value] of Object.entries({ Fichier: source!.sourcePath, Révision: source!.sourceRevision,
        Emplacement: source!.location, Document: source!.documentId, Fragment: source!.sourceChunkId, Empreinte: source!.contentHash })) {
        expect(await viewer.locator('dl div').filter({ has: page.getByText(label, { exact: true }) }).locator('dd').textContent()).toBe(value);
      }
    }
    await canonical(page, access, question, result);
  });
}
