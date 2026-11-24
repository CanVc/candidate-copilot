import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { Page } from '@playwright/test';
import { assembleValidatedArtifacts } from '../../tools/public-content/build';
import type { PublicChunk, PublicSearchArtifacts } from '../../src/shared/public-evidence';
import { chunkDocument } from '../../tools/public-content/chunk';
import { test, expect, type LocalFixture } from './local-fixture';
import { validateConversationResult, type ConversationResult, type SourceExcerpt } from '../../src/shared/conversation-result';
import type { ConversationView, CreatedConversation } from '../../src/shared/conversation';

const root = fileURLToPath(new URL('../../', import.meta.url));
const url = 'http://127.0.0.1:5173/';
const fixtureDb = (local: LocalFixture, action: string) => local.completed(local.startCommand(process.execPath, ['tests/e2e/portfolio-entry-db.mjs', action]));
async function start(local: LocalFixture, simulated: boolean | 'middle' | 'failed' | 'short' | 'shortMiddle' = true, published = true) {
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
function countCaptures(page: Page) {
  return page.evaluateHandle(() => {
    const uuid = crypto.randomUUID; let calls = 0;
    crypto.randomUUID = () => { calls++; return uuid.call(crypto); };
    return () => calls;
  });
}
async function composerControlsFit(page: Page) {
  const form = page.locator('.composer'), bounds = (await form.boundingBox())!;
  const height = page.viewportSize()!.height;
  const { left, innerWidth, top, innerHeight } = await form.evaluate(el => {
    const form = el as unknown as { clientLeft: number; clientWidth: number; clientTop: number; clientHeight: number };
    return { left: form.clientLeft, innerWidth: form.clientWidth, top: form.clientTop, innerHeight: form.clientHeight };
  });
  const reading = (await page.locator('.reading-pane').boundingBox())!;
  expect(reading.height).toBeGreaterThan(height * .30);
  expect(bounds.y).toBeGreaterThanOrEqual(reading.y + reading.height);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(height);
  for (const control of [form.getByRole('textbox'), form.locator('#count'), ...await form.getByRole('button').all(), ...await form.locator('#input-guidance').all()]) {
    const box = (await control.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(bounds.x + left);
    expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + left + innerWidth + 0.5);
    expect(box.y).toBeGreaterThanOrEqual(bounds.y + top);
    expect(box.y + box.height, `${control}: ${JSON.stringify({ box, bounds, innerHeight })}`).toBeLessThanOrEqual(bounds.y + top + innerHeight + 0.5);
  }
}
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
        await field.fill('Une ligne'); const line = (await field.boundingBox())!.height;
        await field.fill('Une ligne\nDeux lignes\nTrois lignes'); const three = (await field.boundingBox())!.height;
        expect(three).toBeGreaterThan(line + 20);
        // Without intrinsic field sizing, the native three-row fallback remains usable.
        const fixed = await page.addStyleTag({ content: '.composer textarea { field-sizing: fixed; }' });
        await field.fill('Une ligne');
        expect((await field.boundingBox())!.height).toBeGreaterThan(line + 20);
        await fixed.evaluate(el => (el as unknown as { remove(): void }).remove());
        const boundary = '😀'.repeat(1000);
        await field.fill(boundary); await expect(page.locator('#count')).toHaveText('1000 / 1000 caractères'); await expect(submit).toBeEnabled();
        await field.fill(boundary + 'x'); await expect(page.locator('#count')).toHaveText('1001 / 1000 caractères'); await expect(submit).toBeDisabled();
        const long = 'Ligne fictive\n'.repeat(100);
        await field.fill(long); await expect(field).toHaveValue(long);
        await expect(submit).toBeDisabled(); await expect(page.locator('#input-guidance')).toContainText('Raccourcissez');
        const size = page.viewportSize()!;
        for (const height of [size.height, mobile ? 355 : 500]) {
          await page.setViewportSize({ width: size.width, height });
          await composerControlsFit(page);
          if (mobile && height === 355) await page.screenshot({ path: info.outputPath('long-fictional-draft-320x355.png') });
          expect(await field.evaluate(el => { const a = el as unknown as { scrollHeight: number; clientHeight: number }; return a.scrollHeight > a.clientHeight; })).toBe(true);
        }
        await page.setViewportSize(size); await page.locator('form').dispatchEvent('submit'); expect(posts).toBe(0);
        await field.fill(expected);
        if (mobile) await submit.tap(); else { await page.keyboard.press('Tab'); await expect(submit).toBeFocused(); await page.keyboard.press('Enter'); await expect(page.getByRole('textbox')).toBeFocused(); }
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
  await page.clock.install();
  let posts = 0, reads = 0;
  page.on('request', req => { if (req.method() === 'GET' && req.url().includes('/api/conversations/')) reads++; });
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/messages', async route => { posts++; expect((await route.fetch()).status()).toBe(200); await hold; await route.abort(); });
  await page.goto(url); const suggestion = page.locator('.suggestion').last(), question = await suggestion.innerText(); await suggestion.click();
  try { await expect(page.locator('.pending-turn')).toHaveCount(1); await page.getByRole('textbox').fill('Brouillon intact');
    expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(question);
  } finally { release(); }
  await expect(status(page)).toContainText('Résultat inconnu');
  await expect(page.locator('.pending-turn')).toHaveCount(1); await expect(page.locator('.waiting')).toHaveCount(0);
  await expect(page.getByRole('textbox')).toHaveValue('Brouillon intact'); await expect(page.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(question);
  await page.getByRole('textbox').fill('Encore modifiable'); await expect(page.getByRole('textbox')).toHaveValue('Encore modifiable');
  expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(question); await expect(page.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  await expect(page.locator('.send-hint')).toBeInViewport({ ratio: 1 });
  await page.locator('form').dispatchEvent('submit'); expect(reads).toBe(1);
  await page.clock.fastForward(65_000);
  await expect(page.getByRole('textbox')).toHaveValue('Encore modifiable');
  await expect(page.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(question);
  expect({ reads, posts }).toEqual({ reads: 1, posts: 1 });
  await expect(page.locator('.answer-turn')).toHaveCount(0);
  await page.reload(); await expect(page.getByText(/ne reprend pas un accès/)).toBeVisible();
  await counts(local, 1, 1); expect(posts).toBe(1);
});

test('default Worker: distinguish missing documents from missing processor, never simulate success', async ({ local, page }) => {
  await start(local, false, false);
  await page.goto(url); await page.locator('.suggestion').first().click();
  await expect(status(page)).toContainText('documents publics ne sont pas disponibles');
  await expect(status(page)).not.toContainText(/admise|restauré/);
  await fixtureDb(local, 'seed');
  await page.goto(`${url}?diagnostic`); await expect(status(page)).toHaveText('Worker disponible.');
  await page.getByRole('link', { name: 'Retour au portfolio' }).click(); await free(page).click();
  await expect(status(page)).toContainText('traitement local n’est pas disponible');
  await expect(status(page)).not.toContainText(/admise|restauré/);
  await expect(page.locator('.send-hint')).toHaveText('Traitement indisponible'); await expect(page.locator('.send-hint')).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('textbox')).not.toBeEditable(); await expect(page.locator('#input-guidance')).toHaveCount(0);
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
  let posts = 0; page.on('request', req => { if (req.url().endsWith('/messages')) posts++; });
  await page.goto(url); const chosen = page.locator('.suggestion').first(), question = await chosen.innerText(); await chosen.click();
  await expect(status(page)).toContainText('catalogue a changé');
  await expect(page.locator('.send-hint')).toHaveText('Catalogue modifié'); await expect(page.locator('.send-hint')).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('textbox')).toHaveValue(question);
  await expect(page.getByRole('button', { name: 'Envoyer' })).toBeDisabled(); await page.locator('form').dispatchEvent('submit');

  await expect(page.locator('.answer-turn')).toHaveCount(0);
  await counts(local, 1, 0); expect(posts).toBe(1);
});

test('rapid activations claim once; a delayed saved result preserves draft, focus and caret until lifecycle exit', async ({ local, page }) => {
  await start(local); await page.goto(url); await free(page).click();
  const field = page.getByLabel('Votre première question'); await expect(field).toBeEditable();
  let release!: () => void, received!: () => void;
  const hold = new Promise<void>(r => { release = r; }), ready = new Promise<void>(r => { received = r; });
  let posts = 0;
  await page.route('**/messages', async route => {
    posts++; const response = await route.fetch(); received(); await hold; await route.fulfill({ response });
  });
  const live = await status(page).elementHandle();
  await field.fill('Une question fictive ?'); await page.locator('form').evaluate(el => {
    for (let i = 0; i < 2; i++) (el as unknown as EventTarget).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  const draft = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  try {
    await ready; await expect(page.locator('.pending-turn')).toHaveCount(1); await expect(status(page)).toContainText('En attente');
    expect(await status(page).evaluate((node, original) => node === original, live)).toBe(true);
    await expect(page.locator('.assistant-badge')).toBeVisible(); await expect(page.locator('.waiting')).toBeVisible();
    await expect(page.locator('.waiting')).toContainText('•••');
    await expect(draft).toHaveValue(''); await draft.fill('Nouvelle question'); await expect(send).toBeDisabled();
    expect(await page.locator('.pending-turn .sent-question').textContent()).toBe('Une question fictive ?');
    await expect(page.locator('.send-hint')).toHaveText('En attente •••'); await expect(page.locator('.send-hint')).toBeInViewport({ ratio: 1 });
    await draft.press('Home'); await draft.press('ArrowRight');
    await page.locator('form').dispatchEvent('submit');
  } finally { release(); }
  await expect(send).toBeEnabled(); await expect(page.getByRole('heading', { name: 'Demande de précision' })).toBeVisible();
  await expect(draft).toBeFocused(); await expect(draft).toHaveValue('Nouvelle question');
  expect(await draft.evaluate(el => (el as unknown as { selectionStart: number }).selectionStart)).toBe(1);
  expect(await status(page).evaluate((node, original) => node === original, live)).toBe(true);
  await page.getByRole('button', { name: 'Lire le dernier résultat' }).click();
  await expect(page.getByRole('heading', { name: 'Demande de précision' })).toBeFocused();
  expect(posts).toBe(1);
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

test('two simulated D1 turns: delayed completion leaves the earlier source open; server cap gates further work', async ({ local, page }) => {
  await start(local, 'middle'); await page.setViewportSize({ width: 1600, height: 735 });
  let reads = 0, posts = 0;
  page.on('request', req => { if (req.url().includes('/api/conversations/')) { if (req.method() === 'GET') reads++; else if (req.method() === 'POST') posts++; } });
  const receipt = () => page.waitForResponse(r => r.url().endsWith('/messages') && r.status() === 200).then(r => r.json() as Promise<ConversationResult>);
  const firstReceipt = receipt();
  await page.goto(url); await page.locator('.suggestion').first().click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  await expect(page.locator('.saved-answer')).toHaveCount(1); await field.fill('  Un deuxième passage ?  '); await expect(send).toBeEnabled();
  let received!: () => void, release!: () => void;
  const ready = new Promise<void>(r => { received = r; }), hold = new Promise<void>(r => { release = r; });
  await page.route('**/messages', async route => { const response = await route.fetch(); received(); await hold; await route.fulfill({ response }); });
  const secondReceipt = receipt();
  await send.click(); const viewer = page.getByRole('dialog');
  const reading = page.locator('.reading-pane');
  const passage = page.locator('.answer-passage > p').first();
  let anchor: number, passageTop: number;
  try {
    await ready; await field.fill('Suite non envoyée'); await page.locator('.file-token').first().click();
    await expect(viewer).toHaveClass(/margin-panel/); await viewer.getByRole('button', { name: 'Fermer' }).focus();
    await passage.evaluate(el => (el as unknown as { scrollIntoView(opts: {block: string}): void }).scrollIntoView({ block: 'center' }));
    await expect(passage).toBeInViewport({ ratio: 1 }); passageTop = (await passage.boundingBox())!.y;
    anchor = await reading.evaluate(el => (el as unknown as { scrollTop: number }).scrollTop);
    expect(anchor).toBeGreaterThan(0);
  } finally { release(); }
  await expect(status(page)).toContainText('limite de questions'); await expect(page.locator('.answer-turn')).toHaveCount(2);
  await expect(page.locator('.sent-question').last()).toHaveText('Un deuxième passage ?');
  expect(await page.locator('.sent-question').last().textContent()).toBe('  Un deuxième passage ?  ');
  await expect(field).toHaveValue('Suite non envoyée'); await expect(send).toBeDisabled();
  await expect(viewer.getByRole('button', { name: 'Fermer' })).toBeFocused();
  expect(await reading.evaluate(el => (el as unknown as { scrollTop: number }).scrollTop)).toBe(anchor);
  await expect(viewer.locator('blockquote')).toContainText('inventé et sans rapport avec BC');
  await expect(passage).toBeInViewport({ ratio: 1 }); expect((await passage.boundingBox())!.y).toBeCloseTo(passageTop, 0);
  await expect(page.locator('.send-hint')).toHaveText('Limite atteinte'); await expect(page.locator('.send-hint')).toBeInViewport({ ratio: 1 });
  await field.fill(' '.repeat(1001)); await expect(page.locator('#input-guidance')).toContainText('Raccourcissez');
  await field.fill(''); await expect(page.locator('#input-guidance')).toHaveCount(0); await expect(send).toBeDisabled();
  const [one, two] = await Promise.all([firstReceipt, secondReceipt]);
  expect(one.blocks[0]!.text).not.toBe(two.blocks[0]!.text);
  expect(one.sourceExcerpts[0]!.excerpt).not.toBe(two.sourceExcerpts[0]!.excerpt);
  await expect(page.locator('.answer-passage > p')).toHaveText([one.blocks[0]!.text, two.blocks[0]!.text]);
  expect(await viewer.locator('blockquote').textContent()).toBe(one.sourceExcerpts[0]!.excerpt);
  const first = page.locator('.file-token').first(), second = page.locator('.file-token').last();
  const firstId = await viewer.getAttribute('id'); expect(firstId).toBeTruthy(); await expect(first).toHaveAttribute('aria-controls', firstId!);
  await expect(second).not.toHaveAttribute('aria-controls');
  await second.click(); await expect(viewer).toHaveCount(1);
  expect(await viewer.locator('blockquote').textContent()).toBe(two.sourceExcerpts[0]!.excerpt);
  const secondId = await viewer.getAttribute('id'); expect(secondId).toBeTruthy(); expect(secondId).not.toBe(firstId);
  await expect(second).toHaveAttribute('aria-controls', secondId!); await expect(first).not.toHaveAttribute('aria-controls');
  await page.getByRole('button', { name: 'Lire le dernier résultat' }).click();
  await expect(page.locator('.saved-answer h2').last()).toBeFocused();
  await page.locator('form').dispatchEvent('submit'); expect({ reads, posts }).toEqual({ reads: 3, posts: 2 }); await counts(local, 1, 2);
});

test('controlled pre-admission refusals: unchanged, edited, edit-then-clear, explicit restore/discard', async ({ local, page }) => {
  await start(local); await page.goto(url); await free(page).click();
  let posts = 0, release!: () => void;
  await page.route('**/messages', async route => {
    posts++; const { requestId } = route.request().postDataJSON();
    await new Promise<void>(r => { release = r; });
    // Controlled response only: these POSTs never reach D1.
    await route.fulfill({ status: 400, json: { requestId, error: { code: 'invalid_request', retryMode: 'none', retryable: false, message: 'NON_PUBLIC' } } });
  });
  const field = page.getByRole('textbox');
  for (const [i, action] of ['untouched', 'restore', 'discard'].entries()) {
    const question = `Essai fictif ${'x'.repeat(3 - i)}`; // Each subsequent attempt is shorter.
    await field.fill(question); await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect.poll(() => posts).toBe(i + 1);
    if (action !== 'untouched') { await field.fill('Autre texte'); if (action === 'restore') await field.fill(''); }
    release(); await expect(page.locator('.pending-turn')).toHaveCount(0); await expect(status(page)).toContainText('n’a pas été admise');
    await expect(page.locator('main')).not.toContainText('NON_PUBLIC'); await expect(page.locator('.sent-question')).toHaveCount(0);
    if (action === 'untouched') {
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByRole('button', { name: 'Envoyer' })).toBeDisabled(); await page.locator('form').dispatchEvent('submit'); expect(posts).toBe(1);
    }
    if (action !== 'untouched') {
      await expect(status(page)).not.toContainText('restauré');
      expect(await page.locator('.rejected p').first().textContent()).toBe(question);
      await expect(field).toHaveValue(action === 'restore' ? '' : 'Autre texte');
      await expect(page.locator('.rejected')).toContainText(action === 'restore' ? 'champ vide' : 'videz d’abord');
    }
    if (action === 'restore') { await expect(field).toHaveValue(''); await page.getByRole('button', { name: 'Restaurer la question' }).click(); await expect(field).toBeFocused(); }
    if (action === 'discard') {
      await page.setViewportSize({ width: 320, height: 355 });
      const replacement = page.getByRole('button', { name: 'Écarter l’essai précédent et envoyer' });
      await expect(replacement).toBeEnabled();
      expect(await replacement.evaluate(el => {
        const b = el as unknown as { clientHeight: number }; return b.clientHeight;
      })).toBeGreaterThan(44); // At this width the replacement label wraps.
      await field.fill('Question longue\n'.repeat(100)); await expect(replacement).toBeDisabled(); await composerControlsFit(page);
      await field.fill('Autre texte'); await composerControlsFit(page);
      await expect(page.getByRole('button', { name: 'Restaurer la question' })).toBeDisabled();
      await page.getByRole('button', { name: 'Écarter la question non admise' }).click(); await expect(field).toBeFocused();
      await expect(status(page)).not.toContainText('Modifiez'); await expect(page.locator('.send-hint')).toHaveCount(0);
    }
    await expect(field).toHaveValue(action === 'discard' ? 'Autre texte' : question);
    await expect(page.locator('.rejected')).toHaveCount(0);
  }
  await counts(local, 1, 0); expect(posts).toBe(3);
});

for (const corrupt of ['history', 'malformed 401', 'missing timestamp', 'invalid timestamp']) test(`a saved failure is terminal, not authority: one bounded read and no send on ${corrupt}`, async ({ local, page }) => {
  await start(local, 'failed');
  let reads = 0, posts = 0, release!: () => void;
  page.on('request', req => { if (req.method() === 'POST' && req.url().endsWith('/messages')) posts++; });
  await page.route('**/api/conversations/*', async route => {
    const response = await route.fetch();
    if (++reads === 1) return route.fulfill({ response });
    await new Promise<void>(r => { release = r; });
    if (corrupt.endsWith('timestamp')) {
      const view = await response.json(); view.transcript[0].createdAt = corrupt === 'invalid timestamp' ? 'bad' : undefined;
      return route.fulfill({ response, json: view });
    }
    return corrupt === 'history' ? route.fulfill({ response, json: { ...await response.json(), transcript: [] } }) : route.fulfill({ status: 401, json: {} });
  });
  await page.goto(url); await page.locator('.suggestion').first().click();
  const send = page.getByRole('button', { name: 'Envoyer' });
  await expect(page.getByRole('heading', { name: 'Échec du traitement' })).toBeVisible();
  await expect.poll(() => reads).toBe(2);
  try {
    await page.getByRole('textbox').fill('Brouillon'); await expect(send).toBeDisabled();
    await page.locator('form').dispatchEvent('submit');
  } finally { release(); }
  await expect(status(page)).toContainText(/enregistré un échec.*Impossible de vérifier.*prochain envoi est bloqué/); await expect(send).toBeDisabled();
  await expect(page.locator('.send-hint')).toHaveText('Envoi non vérifié'); await expect(page.locator('.send-hint')).toBeInViewport({ ratio: 1 });
  await page.locator('form').dispatchEvent('submit'); await expect(page.locator('.answer-turn')).toHaveCount(1);
  await expect(page.getByRole('textbox')).toHaveValue('Brouillon'); await expect(page.locator('.waiting')).toHaveCount(0);
  await counts(local, 1, 1); expect({ posts, reads }).toEqual({ posts: 1, reads: 2 });
});

for (const denial of ['message', 'admission'] as const) test(`confirmed access loss on ${denial} clears earlier history and viewer`, async ({ local, page }) => {
  await start(local, 'middle'); await page.setViewportSize({ width: 1600, height: 735 });
  await page.goto(url); await page.locator('.suggestion').first().click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  await expect(page.locator('.saved-answer')).toHaveCount(1); await field.fill('Deuxième ?'); await expect(send).toBeEnabled();
  await page.locator('.file-token').first().click(); await expect(page.getByRole('dialog')).toHaveClass(/margin-panel/);
  let posts = 0; page.on('request', req => { if (req.url().endsWith('/messages')) posts++; });
  // Control only the denial. A message 401 does not establish whether finalization committed.
  let release!: () => void, intercepted!: () => void;
  const hold = new Promise<void>(r => { release = r; }), ready = new Promise<void>(r => { intercepted = r; });
  await page.route(denial === 'message' ? '**/messages' : '**/api/conversations/*', async route => {
    intercepted(); await hold; await route.fulfill({ status: 401, json: { error: 'conversation_unavailable' } });
  });
  await send.click();
  try {
    await ready; await field.fill('Suite privée non envoyée'); await expect(field).toHaveValue('Suite privée non envoyée');
    await expect(page.getByRole('dialog')).toBeVisible();
    if (denial === 'message') await page.getByRole('dialog').getByRole('button', { name: 'Fermer' }).focus();
    else await expect(field).toBeFocused();
  } finally { release(); }
  await expect(status(page)).toContainText('n’est pas accessible');
  await expect(denial === 'message' ? page.getByRole('link', { name: /Retour à l’entrée/ }) : field).toBeFocused();
  if (denial === 'message') await expect(status(page)).toContainText('Résultat inconnu');
  await expect(page.locator('.answer-turn, .rejected, .pending-turn, dialog, .read-latest')).toHaveCount(0);
  await expect(field).not.toBeEditable(); await expect(field).toHaveValue(''); await expect(page.locator('#input-guidance')).toHaveCount(0);
  await expect(send).toBeDisabled(); await page.locator('form').dispatchEvent('submit');
  const messages = denial === 'message' ? 1 : 2;
  await counts(local, 1, messages); expect(posts).toBe(1);
  await page.getByRole('link', { name: /Retour à l’entrée/ }).click(); await expect(free(page)).toBeEnabled(); await counts(local, 1, messages);
  await page.unroute(denial === 'message' ? '**/messages' : '**/api/conversations/*');
  await free(page).click(); await expect(field).toBeEditable(); await expect(field).toHaveValue('');
  await expect(page.locator('.answer-turn')).toHaveCount(0); await counts(local, 2, messages); expect(posts).toBe(1);
});

for (const previous of [false, true]) test(`an unavailable request identity reports only no-send (previous turn: ${previous})`, async ({ local, page }) => {
  await start(local); await page.goto(url);
  if (previous) {
    await page.locator('.suggestion').first().click(); await expect(status(page)).toContainText('enregistré un résultat simulé');
  } else await free(page).click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  await field.fill('À conserver'); await expect(send).toBeEnabled(); let posts = 0;
  page.on('request', req => { if (req.url().endsWith('/messages')) posts++; });
  await page.evaluate(() => { Object.defineProperty(crypto, 'randomUUID', { value: undefined }); });
  const reader = page.locator('.saved-answer h2');
  if (previous) { await reader.focus(); await page.locator('form').dispatchEvent('submit'); }
  else { await send.focus(); await page.keyboard.press('Enter'); }
  await expect(previous ? reader : field).toBeFocused(); await expect(status(page)).toHaveText('Impossible de créer l’identifiant de la question. Aucun envoi ; le brouillon est conservé.');
  await expect(send).toBeDisabled(); await page.locator('form').dispatchEvent('submit');
  await expect(page.locator('.answer-turn')).toHaveCount(previous ? 1 : 0); await counts(local, 1, previous ? 1 : 0);
  await expect(field).toHaveValue('À conserver'); await expect(page.locator('.pending-turn')).toHaveCount(0); expect(posts).toBe(0);
});

for (const [code, httpStatus, reason, timed] of [
  ['provider_unavailable', 503, 'traitement local n’est pas disponible', true],
  ['provider_unavailable', 503, 'traitement local n’est pas disponible', false],
  ['scope_unavailable', 409, 'documents publics ne sont pas disponibles', false],
  ['conversation_busy', 409, 'autre question est en cours', false],
  ['turn_limit_reached', 429, 'limite de questions', false],
] as const) test(`direct ${code} refusal restores untouched text without another send (known time: ${timed})`, async ({ local, page: base }) => {
  await start(local);
  const page = await base.context().browser()!.newPage({ timezoneId: 'America/Los_Angeles' });
  try {
    await page.clock.install({ time: new Date('2026-11-25T13:32:00Z') });
    let calls = 0;
    page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) calls++; });
    // Controlled negative POST receipt; this request never reaches D1.
    await page.route('**/messages', route => route.fulfill({ status: httpStatus, json: { requestId: route.request().postDataJSON().requestId,
      error: { code, message: 'DEMO', retryable: false, retryMode: 'none', ...(timed ? { resumeAt: '2026-11-25T13:33:00.000Z' } : {}) } } }));
    await page.goto(url); await free(page).click();
    const draft = '  Une question sur le musée fictif ?  ', field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
    await field.fill(draft); await send.click(); await expect(status(page)).toContainText(reason);
    await expect(status(page)).toContainText('La question n’a pas été admise. Son texte a été restauré dans le champ.');
    await expect(page.locator('.pending-turn, .rejected')).toHaveCount(0);
    if (timed) await expect(status(page)).toContainText(/25\/11\/2026\s+13:33:00 UTC/);
    else await expect(status(page)).not.toContainText(/UTC|Reprise/);
    await expect(field).toHaveValue(draft); await expect(send).toBeDisabled(); const before = calls;
    await field.fill('Autre question'); await field.fill(draft); // Same text, later edit revision.
    await expect(status(page)).toContainText('La question n’a pas été admise.');
    await expect(status(page)).not.toContainText('restauré');
    await page.clock.runFor(65_000); await expect(send).toBeDisabled(); await page.locator('form').dispatchEvent('submit');
    await counts(local, 1, 0); expect(calls).toBe(before);
  } finally { await page.close(); }
});

test('compact composer after a saved turn: discard the rejected attempt and send exactly the replacement', async ({ local, page }) => {
  await start(local); await page.goto(url); await page.locator('.suggestion').first().click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  await expect(page.locator('.answer-turn')).toHaveCount(1);
  const posted: string[] = []; page.on('request', req => { if (req.url().endsWith('/messages')) posted.push(req.postDataJSON().question); });
  let received!: () => void, release!: () => void;
  const ready = new Promise<void>(r => { received = r; }), hold = new Promise<void>(r => { release = r; });
  await page.route('**/messages', async route => {
    received(); await hold; await route.fulfill({ status: 400, json: { requestId: route.request().postDataJSON().requestId,
      error: { code: 'invalid_request', message: 'Démo', retryable: false, retryMode: 'none' } } });
  }, { times: 1 });
  const original = 'Essai fictif de refus de longueur. '.repeat(3);
  await field.fill(original); await send.click();
  const replacement = '  Nouveau brouillon fictif  ';
  try { await ready; await field.fill(replacement); } finally { release(); }
  const combined = page.getByRole('button', { name: 'Écarter l’essai précédent et envoyer' });
  await expect(combined).toBeEnabled(); await page.setViewportSize({ width: 320, height: 355 });
  await expect(page.locator('.read-latest')).toHaveCount(1);
  await field.fill('Question longue\n'.repeat(100)); await expect(combined).toBeDisabled(); await composerControlsFit(page);
  await field.fill(replacement); await composerControlsFit(page); await combined.click();
  await expect(page.locator('.rejected')).toHaveCount(0); await expect(page.locator('.answer-turn')).toHaveCount(2);
  expect(await page.locator('.answer-turn .sent-question').last().textContent()).toBe(replacement);
  expect(posted).toEqual([original, replacement]); await counts(local, 1, 2);
});

for (const late of ['message', 'admission', 'admission after invalid_request']) test(`old ${late} completion after explicit fresh creation cannot change the new session`, async ({ local, page }) => {
  await start(local); await page.goto(url); await free(page).click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  await field.fill('Ancienne question'); await expect(send).toBeEnabled();
  // Simulate a receiver which completes despite cancellation. Keep the UI mounted across pagehide.
  await page.evaluate(() => { AbortController.prototype.abort = () => {}; });
  let received!: () => void, release!: () => void;
  const ready = new Promise<void>(r => { received = r; }), hold = new Promise<void>(r => { release = r; });
  const response = page.waitForResponse(r => late === 'message' ? r.url().endsWith('/messages') : r.status() === 401);
  if (late === 'admission after invalid_request') await page.route('**/messages', route => route.fulfill({ status: 400,
    json: { requestId: route.request().postDataJSON().requestId, error: { code: 'invalid_request', message: 'Démo', retryable: false, retryMode: 'none' } } }), { times: 1 });
  await page.route(late === 'message' ? '**/messages' : '**/api/conversations/*', async route => {
    const receipt = await route.fetch(); received(); await hold;
    await (late === 'message' ? route.fulfill({ response: receipt }) : route.fulfill({ status: 401, json: { error: 'conversation_unavailable' } }));
  }, { times: 1 });
  await send.click();
  try {
    await ready; await page.evaluate(() => (globalThis as unknown as EventTarget).dispatchEvent(new Event('pagehide')));
    await page.getByRole('button', { name: /nouvelle conversation vide/ }).click();
    await expect(field).toBeEditable(); await field.fill('Nouveau brouillon'); await expect(send).toBeEnabled();
  } finally { release(); }
  await (await response).finished();
  await expect(status(page)).toContainText('Aucune question envoyée'); await expect(page.locator('.answer-turn, .pending-turn')).toHaveCount(0);
  await expect(field).toHaveValue('Nouveau brouillon'); await expect(send).toBeEnabled(); await counts(local, 2, late === 'admission after invalid_request' ? 0 : 1);
});

for (const refusal of ['invalid_scope', 'foreign invalid_request', 'single-code-point invalid_request']) test(`${refusal} is not a receipt for this direct-global attempt`, async ({ local, page }) => {
  await start(local); await page.clock.install();
  let reads = 0, posts = 0, release!: () => void;
  page.on('request', r => { if (r.method() === 'GET' && r.url().includes('/api/conversations/')) reads++; });
  await page.route('**/messages', async route => {
    posts++; await new Promise<void>(resolve => { release = resolve; });
    const foreign = refusal.startsWith('foreign');
    await route.fulfill({ status: 400, json: { requestId: foreign ? 'other-id' : route.request().postDataJSON().requestId,
      error: { code: refusal === 'invalid_scope' ? refusal : 'invalid_request', retryMode: 'none', retryable: false, message: 'Démo' } } });
  });
  await page.goto(url); await free(page).click(); const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  const original = refusal.startsWith('single-code-point') ? '😀' : '  Essai fictif  ', draft = refusal === 'invalid_scope' ? '' : 'Autre brouillon';
  await field.fill(original); await send.click();
  try { await expect.poll(() => posts).toBe(1); if (draft) await field.fill(draft); } finally { release(); }
  await expect(status(page)).toContainText('Résultat inconnu'); await page.locator('form').dispatchEvent('submit'); await page.clock.fastForward(65_000);
  expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(original); await expect(field).toHaveValue(draft);
  await expect(send).toBeDisabled(); await expect(page.locator('.rejected')).toHaveCount(0);
  if (!draft) await expect(page.locator('#input-guidance')).toHaveCount(0);
  await counts(local, 1, 0); expect({ reads, posts }).toEqual({ reads: 1, posts: 1 });
});

// Test-side oracle only. Rebuild the seed's three named inputs, and compare both
// receipts to the saved selection and to bytes at the builder's physical ranges.
function fixtureSections(result: ConversationResult, earlier: boolean) {
  const inputs = ['mission-regie-collections', 'projet-prototype-prets', 'projet-reperage-reserves'].map(name => {
    const path = `content/public/${name}.md`; return { path, bytes: readFileSync(join(root, path)) };
  });
  const bundle = assembleValidatedArtifacts(inputs, result.submittedScope.catalogRevision);
  expect(bundle.catalogHash).toBe(result.submittedScope.catalogHash);
  const search: PublicSearchArtifacts = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!);
  const sheet = inputs[1]!, lines = sheet.bytes.toString('utf8').match(/[^\n]*\n|[^\n]+$/g)!;
  function section(title: string) {
    const chunk = search.chunks.find(c => c.sourcePath === sheet.path && c.sectionTitle === title)!;
    const physical = [...chunk.context, chunk.passage].flatMap(({ start, end }) => lines.slice(start - 1, end)).join('');
    expect(chunk.text).toBe(physical); expect(chunk.context).toEqual([{ start: 13, end: 13 }]);
    return chunk;
  }
  const first = section('Solution et choix importants'), second = section(earlier ? 'Ma contribution et le périmètre réalisé' : 'État du projet et usages réels');
  expect(first.location).toBe('lines:29-36;context:13-13');
  expect(second.location).toBe(earlier ? 'lines:21-28;context:13-13' : 'lines:37-42;context:13-13');
  expect(second.chunkId).not.toBe(first.chunkId); expect(second.contentHash).not.toBe(first.contentHash);
  expect(result.sourceExcerpts).toHaveLength(1); expect(result.sourceExcerpts[0]).toMatchObject(copiedFields(first));
  return second;
}
function copiedFields(chunk: PublicChunk) {
  return { documentId: chunk.documentId, sourceRevision: chunk.sourceRevision, sourceChunkId: chunk.chunkId,
    contentHash: chunk.contentHash, sourceTitle: chunk.sourceTitle, sourcePath: chunk.sourcePath,
    sectionTitle: chunk.sectionTitle, location: chunk.location, excerpt: chunk.text };
}
function contradictOpening(source: SourceExcerpt) {
  expect(source.excerpt.split('\n')[0]).toContain('SYNTHÉTIQUE');
  source.excerpt = source.excerpt.replace('SYNTHÉTIQUE', 'FICTIF');
}
// Synthetic consumer compatibility, not a passage partition emitted by this builder.
function overlappingTitle(first: SourceExcerpt, second: SourceExcerpt, same: boolean) {
  const [quote, shared] = first.excerpt.split('\n');
  expect(first.location).toBe('lines:29-36;context:13-13'); expect(shared).toBe('## Solution et choix importants');
  second.location = 'lines:28-29;context:13-13'; second.excerpt = `${quote}\n\n${shared}\n`;
  second.sectionTitle = same ? first.sectionTitle : null;
}
const lineSuffixes = ['valid-lines-suffix', 'reversed-lines-suffix', 'reversed-context-suffix', 'reordered-context-suffix',
  'overlapping-context-suffix', 'touching-passage-suffix', 'later-context-suffix', 'short-excerpt-suffix'];
for (const projection of ['ready', 'turn_limit_reached', 'completed-at-cap', 'completed-no-scope', 'completed-no-processor', 'processing_unavailable', 'same-request', 'same-request-card', 'same-request-reader', 'same-request-untouched', 'same-request-cleared', 'same-request-restored', 'suffix', 'malformed-suffix', 'revision-conflict-suffix', 'active-first-suffix', ...lineSuffixes, 'shared-quote-suffix', 'changed-quote-suffix', 'earlier-section-suffix', 'earlier-quote-conflict-suffix', 'unreadable']) test(`real length refusal settles text, not capacity: ${projection}`, async ({ local, page }) => {
  const pairedSections = ['shared-quote-suffix', 'changed-quote-suffix', 'earlier-section-suffix', 'earlier-quote-conflict-suffix'].includes(projection);
  const lineSuffix = lineSuffixes.includes(projection) || pairedSections;
  await start(local, pairedSections ? 'shortMiddle' : 'short'); if (lineSuffix) await page.clock.install(); await page.goto(url); await free(page).click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' }), form = page.locator('form');
  await field.fill('Premier tour'); await send.click(); await field.fill('Préparer'); await expect(send).toBeEnabled();
  let reads = 0, posts = 0, releasePost!: () => void, releaseRead!: () => void;
  const postHold = new Promise<void>(r => { releasePost = r; }), readHold = new Promise<void>(r => { releaseRead = r; });
  const a = 'Q'.repeat(20) + '😀', sameLength = 'R'.repeat(21), b = ' ' + '😀'.repeat(18) + ' ';
  const contradiction = projection.startsWith('same-request') || projection === 'suffix' || projection === 'valid-lines-suffix' || projection === 'shared-quote-suffix' || projection === 'earlier-section-suffix', untouched = projection === 'same-request-untouched';
  const suffix = projection.endsWith('suffix');
  let refusedId = '';
  await page.route('**/messages', async route => {
    posts++; const response = await route.fetch();
    if (posts === 1) {
      refusedId = route.request().postDataJSON().requestId; expect(response.status()).toBe(400);
      expect(await response.json()).toMatchObject({ requestId: refusedId, error: { code: 'invalid_request' } }); await postHold;
    }
    await route.fulfill({ response });
  });
  await page.route('**/api/conversations/*', async route => {
    reads++; const response = await route.fetch(); await readHold;
    // POST and ready read are real. Only these alternative read projections are injected.
    if (projection === 'unreadable') return route.fulfill({ status: 200, body: '{' });
    if (projection.startsWith('completed-')) {
      const view = await response.json() as ConversationView;
      const prior = view.transcript[0]!, saved = prior.result!;
      expect(saved.status).toBe('clarification');
      const requestId = 'other-request', messageId = 'other-message';
      const result = { ...saved, requestId, messageId, answerId: 'other-answer',
        blocks: saved.blocks.map((block, i) => ({ ...block, blockId: `other-block-${i}` })) };
      const admission = projection === 'completed-no-processor' ? { available: false, reason: 'processing_unavailable', resumeAt: '2026-11-25T13:33:00.000Z' } :
        { available: false, reason: projection === 'completed-no-scope' ? 'scope_unavailable' : 'turn_limit_reached' };
      return route.fulfill({ response, json: { ...view, admission,
        transcript: [...view.transcript, { ...prior, requestId, messageId, question: 'Autre tour fictif', result }] } });
    }
    if (pairedSections) {
      const view = await response.json() as ConversationView;
      expect(view.transcript).toHaveLength(1);
      const prior = view.transcript[0]!, saved = prior.result!;
      const section = fixtureSections(saved, projection.startsWith('earlier-'));
      const second = { sourceExcerptId: 'fiction-excerpt', responseLocalId: 'S1', ...copiedFields(section) };
      if (projection === 'changed-quote-suffix' || projection === 'earlier-quote-conflict-suffix') contradictOpening(second);
      const result = { ...saved, requestId: refusedId, messageId: 'fiction', answerId: 'fiction-answer',
        blocks: [{ ...saved.blocks[0]!, blockId: 'fiction-block', text: `Démonstration fictive : ${section.sectionTitle}.` }], sourceExcerpts: [second] };
      validateConversationResult(result);
      return route.fulfill({ response, json: { ...view, transcript: [...view.transcript, { ...prior, requestId: refusedId,
        messageId: result.messageId, question: a, result }] } });
    }
    if (lineSuffix) {
      const view = await response.json() as ConversationView;
      const { createdAt, submittedScope } = view.transcript[0]!;
      // Build the positive copy with the publisher itself. Change only the field
      // under test in the browser's read, never the post-refusal D1 transcript.
      const documentId = submittedScope.eligibleDocumentIds[0]!, sourceTitle = 'Fiction', sourcePath = 'content/public/fiction.md';
      const chunk = chunkDocument({ documentId, sourceTitle, sourcePath, sourceRevision: submittedScope.catalogRevision,
        metadata: { document_id: documentId, title: sourceTitle, visibility: 'public', reviewed_by: 'Fixture', created_at: createdAt,
          modified_at: createdAt, reviewed_at: createdAt } },
      '---\ntitle: Fiction\n---\n> Sans rapport avec BC.\n# Repère\n> Exemple inventé.\n## Passage\nDémo fictive.').at(-1)!;
      expect(chunk.location).toBe('lines:7-8;context:4-4;context:6-6');
      const locations: Record<string, string> = {
        'reversed-lines-suffix': 'lines:8-7;context:4-4;context:6-6',
        'reversed-context-suffix': 'lines:7-8;context:5-4;context:6-6',
        'reordered-context-suffix': 'lines:7-8;context:6-6;context:4-4',
        'overlapping-context-suffix': 'lines:7-8;context:4-4;context:4-4',
        'touching-passage-suffix': 'lines:7-8;context:4-4;context:7-7',
        'later-context-suffix': 'lines:7-8;context:4-4;context:9-9',
      };
      const result: ConversationResult = { requestId: refusedId, messageId: 'fiction', answerId: 'fiction-answer', submittedScope,
        status: 'answered', language: 'fr', blocks: [{ blockId: 'fiction-block', text: 'Exemple fictif.', kind: 'paragraph', sourceIds: ['S1'] }],
        sourceExcerpts: [{ sourceExcerptId: 'fiction-excerpt', responseLocalId: 'S1', sourceChunkId: chunk.chunkId, documentId,
          sourceRevision: chunk.sourceRevision, contentHash: chunk.contentHash, sourcePath, sourceTitle, sectionTitle: chunk.sectionTitle,
          excerpt: projection === 'short-excerpt-suffix' ? 'Sans rapport avec BC.' : chunk.text, location: locations[projection] ?? chunk.location }] };
      return route.fulfill({ response, json: { ...view, transcript: [...view.transcript, { requestId: refusedId, messageId: result.messageId,
        question: a, createdAt, submittedScope, status: 'completed', result }] } });
    }
    if (suffix) {
      const view = await response.json() as ConversationView;
      const { createdAt, submittedScope } = view.transcript[0]!;
      const disputed = { createdAt, submittedScope, messageId: 'fiction', requestId: refusedId, question: a, status: 'interrupted' };
      const later = { ...disputed, messageId: 'fiction-2', requestId: 'fiction-later', question: 'Suite fictive', status: 'in_progress' };
      if (projection === 'revision-conflict-suffix') later.submittedScope = { ...submittedScope, catalogRevision: 'd'.repeat(40) };
      const rows = projection === 'active-first-suffix' ? [later, disputed] : [disputed, later];
      return route.fulfill({ response, json: { ...view, transcript: [...view.transcript, ...rows],
        processing: { status: 'in_progress', requestId: later.requestId },
        admission: projection === 'malformed-suffix' ? {} : { available: false, reason: 'conversation_busy' } } });
    }
    if (contradiction) {
      const view = await response.json() as ConversationView;
      const { createdAt, submittedScope } = view.transcript[0]!;
      return route.fulfill({ response, json: { ...view, transcript: [...view.transcript, { createdAt, submittedScope, messageId: 'fiction',
        requestId: refusedId, question: a, status: 'in_progress' }], processing: { status: 'in_progress', requestId: refusedId },
        admission: { available: false, reason: 'conversation_busy' } } });
    }
    if (projection === 'ready') return route.fulfill({ response });
    return route.fulfill({ response, json: { ...await response.json(), admission: { available: false, reason: projection } } });
  });
  await field.fill(a); await send.click(); try { if (!untouched) await field.fill(b); } finally { releasePost(); }
  const combined = page.getByRole('button', { name: 'Écarter l’essai précédent et envoyer' });
  const discard = page.getByRole('button', { name: 'Écarter la question non admise' }), reader = page.locator('.saved-answer h2');
  const pane = page.locator('.reading-pane');
  try {
    await expect.poll(() => reads).toBe(1); await expect(page.locator('.pending-turn')).toHaveCount(0);
    if (untouched) {
      await expect(page.locator('.rejected')).toHaveCount(0); await expect(field).toHaveValue(a); await expect(send).toBeDisabled();
    } else {
      expect(await page.locator('.rejected p').first().textContent()).toBe(a); await expect(field).toHaveValue(b); await expect(combined).toBeDisabled();
    }
    await form.dispatchEvent('submit'); expect(posts).toBe(1);
    if (suffix || ['same-request', 'same-request-card', 'same-request-reader', 'unreadable'].includes(projection)) await field.fill(sameLength);
    if (projection === 'same-request-cleared' || projection === 'same-request-restored') await field.fill('');
    if (projection === 'same-request-restored') {
      await page.getByRole('button', { name: 'Restaurer la question' }).click(); await expect(field).toHaveValue(a);
    }
    if (projection === 'same-request-card' || projection === 'same-request-reader') {
      const owner = projection === 'same-request-card' ? discard : reader;
      await owner.focus(); await expect(owner).toBeFocused();
      await pane.evaluate(el => { (el as unknown as {scrollTop: number}).scrollTop = 20; });
      expect(await pane.evaluate(el => (el as unknown as {scrollTop: number}).scrollTop)).toBe(20);
    }
  } finally { releaseRead(); }
  if (projection === 'ready') {
    await expect(combined).toBeEnabled();
    await expect(page.getByRole('region', { name: 'Question non admise' })).toContainText('Le service a refusé cette question en raison de sa longueur (21 caractères).');
    await expect(field).toHaveValue(b); await expect(field).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator('#input-guidance')).toHaveCount(0);
    for (const edit of [sameLength, sameLength + '!']) {
      await field.fill(edit); await expect(page.locator('#input-guidance')).toHaveText('Le service a refusé une question de 21 caractères. Raccourcissez votre question.');
      await expect(page.locator('#count')).toContainText(`${edit.length} / 1000 caractères`);
      await expect(combined).toBeDisabled(); await form.dispatchEvent('submit'); await expect(field).toHaveValue(edit);
      await expect(page.locator('.pending-turn')).toHaveCount(0); expect({ posts, reads }).toEqual({ posts: 1, reads: 1 });
    }
    await field.fill(b); await expect(combined).toBeEnabled(); await combined.click(); await expect(page.locator('.answer-turn')).toHaveCount(2);
    expect(await page.locator('.answer-turn .sent-question').last().textContent()).toBe(b);
    await field.fill('Troisième'); await expect(send).toBeEnabled(); await field.fill(a); await expect(send).toBeDisabled();
    await form.dispatchEvent('submit'); await expect(field).toHaveValue(a); await expect(page.locator('.pending-turn')).toHaveCount(0);
    await counts(local, 1, 2); expect({ posts, reads }).toEqual({ posts: 2, reads: 2 });
  } else if (contradiction || projection === 'unreadable' || suffix) {
    if (contradiction) {
      await expect(status(page)).toContainText('Résultat inconnu'); await expect(status(page)).not.toContainText(/admise|restauré/);
      await expect(page.locator('.rejected, #input-guidance')).toHaveCount(0); await expect(field).toHaveAttribute('aria-invalid', 'false');
      if (projection === 'same-request-card' || projection === 'same-request-reader') {
        await expect(projection === 'same-request-card' ? field : reader).toBeFocused();
        expect(await pane.evaluate(el => (el as unknown as {scrollTop: number}).scrollTop)).toBe(20);
      }
      if (projection === 'same-request') await expect(field).toBeFocused();
      await expect(page.locator('.pending-turn .sent-question')).toHaveText(a); await expect(send).toBeDisabled();
    } else {
      await expect(status(page)).toContainText('Impossible de vérifier'); await expect(status(page)).toContainText('pas été admise');
      await expect(page.locator('#input-guidance')).toContainText('Raccourcissez'); await expect(page.locator('.rejected')).toContainText(a);
      await expect(page.getByRole('button', { name: 'Écarter la question non admise' })).toBeEnabled(); await expect(combined).toBeDisabled();
    }
    const expected = projection === 'same-request-restored' ? a : untouched || projection === 'same-request-cleared' ? '' : sameLength;
    await expect(field).toHaveValue(expected); await field.fill('Bref');
    // Even a forced submit with a valid short draft must not capture a new ID.
    const captureCount = await countCaptures(page);
    await form.dispatchEvent('submit'); expect(await captureCount.evaluate(count => count())).toBe(0);
    if (lineSuffix) await page.clock.fastForward(65_000);
    await expect(field).toHaveValue('Bref');
    await expect(page.locator('.pending-turn')).toHaveCount(contradiction ? 1 : 0);
    await expect(page.locator('.answer-turn')).toHaveCount(1); await counts(local, 1, 1); expect({ posts, reads }).toEqual({ posts: 1, reads: 1 });
  } else {
    const processor = projection === 'processing_unavailable' || projection === 'completed-no-processor';
    await expect(page.locator('.send-hint')).toHaveText(processor ? 'Traitement indisponible' : projection === 'completed-no-scope' ? 'Documents indisponibles' : 'Limite atteinte');
    if (projection === 'completed-no-processor') await expect(status(page)).toContainText(/25\/11\/2026\s+13:33:00 UTC/);
    await expect(status(page)).toContainText('pas été admise'); await expect(page.locator('.rejected')).toContainText(a);
    await expect(combined).toBeDisabled();
    const captures = await countCaptures(page);
    await form.dispatchEvent('submit'); expect(await captures.evaluate(count => count())).toBe(0);
    await expect(field).toHaveValue(b); await expect(page.locator('.pending-turn')).toHaveCount(0);
    await expect(page.locator('.answer-turn')).toHaveCount(1);
    await counts(local, 1, 1); expect({ posts, reads }).toEqual({ posts: 1, reads: 1 });
  }
});

for (const changed of [false, true]) test(`admission compares the first GET timestamp of an older local turn (changed: ${changed})`, async ({ local, page }) => {
  await start(local); await page.goto(url); await free(page).click();
  const field = page.getByRole('textbox'), send = page.getByRole('button', { name: 'Envoyer' });
  await expect(field).toBeEditable();
  const dates = ['2026-11-25T13:30:00.000Z', '2026-11-25T13:33:00.000Z'] as const;
  let reads = 0, posts = 0;
  page.on('request', r => { if (r.url().endsWith('/messages')) posts++; });
  await page.route('**/api/conversations/*', async route => {
    const response = await route.fetch(), view = await response.json() as ConversationView;
    expect(view.transcript).toHaveLength(++reads); expect(view.admission).toEqual({ available: true });
    view.transcript[0]!.createdAt = changed && reads === 2 ? dates[1] : dates[0];
    // The new row has no timestamp from its POST; its first GET value may differ from row 1.
    if (reads === 2) view.transcript[1]!.createdAt = '2026-11-25T13:35:00.000Z';
    await route.fulfill({ response, json: view });
  });
  await field.fill('Première question'); await send.click(); await field.fill('Deuxième question');
  await expect(send).toBeEnabled(); await send.click(); await field.fill('Brouillon suivant');
  await expect(page.locator('.answer-turn .sent-question')).toHaveText(['Première question', 'Deuxième question']);
  if (changed) {
    await expect(status(page)).toContainText('Impossible de vérifier'); await expect(send).toBeDisabled();
    const captures = await countCaptures(page);
    await page.locator('form').dispatchEvent('submit'); expect(await captures.evaluate(count => count())).toBe(0);
  } else await expect(send).toBeEnabled();
  await expect(field).toHaveValue('Brouillon suivant'); await expect(page.locator('.pending-turn')).toHaveCount(0);
  await counts(local, 1, 2); expect({ posts, reads }).toEqual({ posts: 2, reads: 2 });
});

for (const receipt of ['stale-conflict', 'stale-compatible', 'excerpt-conflict', 'duplicate-chunk', 'same-revision-chunk', 'same-revision-file', 'excerpt-reuse', 'twin-reuse', 'twin-hash-conflict', 'split-reuse', 'split-hash-conflict', 'split-section-conflict', 'split-excerpt-conflict', 'split-context', 'split-context-section-conflict', 'split-moved-section', 'split-moved-quote-conflict', 'split-earlier-section', 'split-earlier-quote-conflict', 'split-overlap-title', 'split-overlap-null'] as const) test(`second POST against a confirmed turn${/^(split-(?!moved|earlier)|twin-)/.test(receipt) ? ' (synthetic compatibility)' : ''}: ${receipt}`, async ({ local, page }) => {
  await start(local, 'middle'); await page.clock.install();
  const firstReceipt = page.waitForResponse(r => r.url().endsWith('/messages')).then(r => r.json() as Promise<ConversationResult>);
  await page.goto(url); const suggestion = page.locator('.suggestion').first(), firstQuestion = await suggestion.innerText(); await suggestion.click();
  const first = await firstReceipt, field = page.getByRole('textbox'), send = page.locator('.composer button').last();
  const movedSection = receipt.startsWith('split-moved-') || receipt.startsWith('split-earlier-') || receipt.startsWith('split-overlap-');
  const question = receipt.startsWith('split-earlier-') ? '  Un passage antérieur ?  ' : movedSection ? '  Un deuxième passage ?  ' : '  Reprendre ce passage ?  ', draft = 'Autre brouillon fictif';
  await field.fill(question); await expect(send).toBeEnabled();
  // Start counting after the first result and its normal authority read.
  const traffic: string[] = [];
  page.on('request', r => { if (r.url().includes('/api/')) traffic.push(r.method()); });
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  const stale = receipt.startsWith('stale');
  if (receipt.startsWith('split-')) await page.setViewportSize({ width: 1600, height: 735 });
  await page.route('**/messages', async route => {
    await hold;
    if (stale) {
      const { catalogHash, catalogRevision } = first.submittedScope;
      const change = (s: string) => (s[0] === '0' ? '1' : '0') + s.slice(1);
      await route.fulfill({ status: 409, json: { requestId: route.request().postDataJSON().requestId,
        catalogHash: receipt === 'stale-compatible' ? change(catalogHash) : catalogHash,
        catalogRevision: receipt === 'stale-conflict' ? change(catalogRevision) : catalogRevision,
        error: { code: 'catalog_stale', message: 'Catalogue fictif', retryable: false, retryMode: 'none' } } });
    } else {
      const response = await route.fetch(), result = await response.json() as ConversationResult;
      const source = result.sourceExcerpts[0]!;
      expect(source.sourceExcerptId).not.toBe(first.sourceExcerpts[0]!.sourceExcerptId);
      if (movedSection) {
        expect(first.sourceExcerpts).toHaveLength(1); expect(result.sourceExcerpts).toHaveLength(1);
        expect(source.sectionTitle).not.toBe(first.sourceExcerpts[0]!.sectionTitle);
        expect(source).toMatchObject(copiedFields(fixtureSections(first, receipt.startsWith('split-earlier-'))));
        validateConversationResult(result);
        if (receipt === 'split-moved-section' || receipt === 'split-earlier-section') return route.fulfill({ response });
        if (receipt === 'split-moved-quote-conflict' || receipt === 'split-earlier-quote-conflict') contradictOpening(source);
        if (receipt.startsWith('split-overlap-')) overlappingTitle(first.sourceExcerpts[0]!, source, receipt === 'split-overlap-title');
        validateConversationResult(result);
        return route.fulfill({ response, json: result });
      }
      expect({ ...source, sourceExcerptId: first.sourceExcerpts[0]!.sourceExcerptId }).toEqual(first.sourceExcerpts[0]);
      if (receipt.startsWith('split-')) {
        // One excerpt per receipt: only the earlier turn can establish a contradiction.
        expect(first.sourceExcerpts).toHaveLength(1); expect(result.sourceExcerpts).toHaveLength(1);
        source.sourceChunkId += '-other';
        if (receipt !== 'split-reuse') source.contentHash = (source.contentHash[0] === '0' ? '1' : '0') + source.contentHash.slice(1);
        if (receipt === 'split-excerpt-conflict') source.excerpt = source.excerpt.replace('SYNTHÉTIQUE', 'FICTIF');
        if (receipt === 'split-context' || receipt === 'split-context-section-conflict') {
          expect(source.location).toBe('lines:29-36;context:13-13');
          source.location = 'lines:29-36;context:13-14';
          source.excerpt = source.excerpt.replace('\n', '\n> Contexte fictif supplémentaire.\n');
        }
        if (receipt === 'split-section-conflict' || receipt === 'split-context-section-conflict') source.sectionTitle = 'Autre section fictive';
        validateConversationResult(first); validateConversationResult(result);
      }
      if (receipt === 'duplicate-chunk') {
        const extra = { ...source, responseLocalId: 'S2', sourceExcerptId: 'other-excerpt',
          contentHash: 'f'.repeat(64), excerpt: 'Autre passage fictif, sans rapport avec BC.' };
        result.sourceExcerpts.push(extra); result.blocks[0]!.sourceIds.push(extra.responseLocalId);
      }
      if (receipt === 'twin-reuse' || receipt === 'twin-hash-conflict') {
        const twin = { ...source, responseLocalId: 'S2', sourceExcerptId: 'other-excerpt', sourceChunkId: 'other-chunk' };
        if (receipt === 'twin-hash-conflict') twin.contentHash = (source.contentHash[0] === '0' ? '1' : '0') + source.contentHash.slice(1);
        result.sourceExcerpts.push(twin); result.blocks[0]!.sourceIds.push(twin.responseLocalId);
      }
      if (receipt === 'same-revision-chunk') { source.contentHash = 'e'.repeat(64); source.excerpt = source.excerpt.replace('SYNTHÉTIQUE', 'FICTIF'); }
      if (receipt === 'same-revision-file') { source.sourceChunkId += '-other'; source.contentHash = 'e'.repeat(64); source.sourceTitle += ' modifié'; }
      if (receipt === 'excerpt-conflict') source.excerpt = source.excerpt.replace('SYNTHÉTIQUE', 'FICTIF');
      await route.fulfill({ response, json: result });
    }
  });
  await send.click();
  try { await expect(page.locator('.pending-turn .sent-question')).toHaveText(question.trim());
    expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(question); await field.fill(draft); } finally { release(); }
  const changedButCoherent = receipt === 'twin-reuse' || receipt === 'split-reuse' || receipt === 'split-context' || receipt === 'split-overlap-title';
  const saved = receipt === 'excerpt-reuse' || receipt === 'split-moved-section' || receipt === 'split-earlier-section' || changedButCoherent, rejected = receipt === 'stale-compatible';
  await expect(status(page)).toContainText(changedButCoherent ? 'Impossible de vérifier' : saved ? 'limite de questions' : rejected ? 'catalogue a changé' : 'Résultat inconnu');
  await expect(send).toBeDisabled(); const captures = await countCaptures(page);
  await page.locator('form').dispatchEvent('submit'); await page.clock.fastForward(65_000);
  expect(await captures.evaluate(count => count())).toBe(0); await expect(field).toHaveValue(draft);
  if (saved) expect(await page.locator('.answer-turn .sent-question').last().textContent()).toBe(question);
  await expect(page.locator('.answer-turn')).toHaveCount(saved ? 2 : 1);
  expect(await page.locator('.answer-turn .sent-question').first().textContent()).toBe(firstQuestion);
  await expect(page.locator('.answer-passage > p').first()).toHaveText(first.blocks[0]!.text);
  await expect(page.locator('.rejected')).toHaveCount(rejected ? 1 : 0);
  if (!rejected) await expect(status(page)).not.toContainText(/admise|restauré/);
  if (saved || rejected) await expect(page.locator('.pending-turn')).toHaveCount(0);
  else expect(await page.locator('.pending-turn .sent-question').textContent()).toBe(question);
  await counts(local, 1, stale ? 1 : 2);
  if (receipt.startsWith('split-')) {
    await page.locator('.answer-turn .file-token').first().click();
    const viewer = page.getByRole('dialog'), original = first.sourceExcerpts[0]!;
    await expect(viewer.locator('h4')).toHaveText(original.sectionTitle!);
    expect(await viewer.locator('blockquote').textContent()).toBe(original.excerpt);
    await expect(viewer.locator('.meta')).toContainText(original.location);
  }
  expect(traffic).toEqual(saved ? ['POST', 'GET'] : ['POST']);
});
