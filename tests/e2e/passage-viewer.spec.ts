import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { test, expect, type LocalFixture } from './local-fixture';

// Rendering-only fixture, not a route or a legacy D1 reader. Mount the actual
// component in the disposable frontend with no Worker or live catalog at all.
const url = 'http://127.0.0.1:5173/';
async function start(local: LocalFixture) {
  copyFileSync(fileURLToPath(new URL('../bootstrap/passage-sources.fixture.ts', import.meta.url)), join(local.project, 'frontend/src/fixture.ts'));
  writeFileSync(join(local.project, 'frontend/src/main.tsx'), `
    import { createRoot } from 'react-dom/client'; import { AnswerTurn } from './AnswerTurn'; import { historical } from './fixture';
    import './styles/tokens.css'; import './styles/base.css';
    const root = createRoot(document.querySelector('#root'));
    const refused = { status: 'refused', language: 'fr', blocks: [{blockId:'r', kind:'refusal',text:'Refus enregistré',sourceIds:[]}], sourceExcerpts:[] };
    const render = (arrived) => root.render(<main><div style={{height: '150vh'}}>Guide</div><button onClick={() => render(true)}>Recevoir</button>
      {arrived && <AnswerTurn question={'  Question <img> ?  '} result={location.search === '?refus' ? refused : historical} />}
      <footer style={{height:'100vh'}}>Fin</footer></main>); render(false);
  `);
  await local.ready(local.start('dev:frontend'), url);
}

test('keyboard: saved passage only, one non-displacing margin panel, replacement and focus', async ({ local, page }) => {
  await start(local); await page.setViewportSize({ width: 1600, height: 800 }); await page.goto(url);
  const requests: string[] = []; page.on('request', req => requests.push(req.url()));
  const receive = page.getByRole('button', { name: 'Recevoir' }); await receive.focus();
  const before = await receive.boundingBox(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Réponse partielle' })).toBeVisible();
  expect(await receive.boundingBox()).toEqual(before); await expect(receive).toBeFocused();
  expect(await page.locator('.sent-question').textContent()).toBe('  Question <img> ?  ');
  await expect(page.locator('.sent-question')).toHaveCSS('background-color', 'rgb(25, 33, 29)');
  await expect(page.locator('.sent-question')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('.saved-answer')).toHaveCSS('background-color', 'rgb(237, 243, 238)');
  expect(await page.locator('.answer-passage > p').allTextContents()).toEqual(['Saved <em>paragraph</em>\n  Second line.', 'Second passage']);
  await expect(page.locator('.answer-passage > p').first()).toHaveCSS('white-space', 'pre-wrap');
  await expect(page.locator('img, em')).toHaveCount(0);
  const first = page.getByRole('button', { name: 'Titre partagé <img>' });
  await page.keyboard.press('Tab'); await expect(first).toBeFocused();
  const answer = page.locator('.answer-turn'), geometry = await answer.boundingBox();
  await page.keyboard.press('Enter'); const viewer = page.getByRole('dialog');
  await expect(viewer).toHaveClass(/margin-panel/); expect(await answer.boundingBox()).toEqual(geometry);
  expect((await viewer.boundingBox())!.x).toBeGreaterThan(geometry!.x + geometry!.width);
  await expect(viewer.getByRole('button', { name: 'Titre partagé <img>' })).toHaveAttribute('aria-expanded', 'true');
  await expect(viewer.locator('blockquote:visible')).toHaveText(['Saved English excerpt s2', 'Saved English excerpt s1']);
  await expect(viewer).not.toContainText('legacy.md');
  const sibling = page.locator('.file-token').filter({ hasText: 'Archived title' }); await sibling.click();
  const row = viewer.getByRole('button', { name: 'Archived title' });
  await expect(row).toHaveAttribute('aria-expanded', 'true'); await expect(viewer.locator('blockquote:visible')).toHaveText(['Saved English excerpt s3']);
  await row.click(); await expect(row).toHaveAttribute('aria-expanded', 'false');
  await sibling.click(); await expect(row).toHaveAttribute('aria-expanded', 'true');
  await row.focus(); await page.setViewportSize({ width: 390, height: 700 });
  await expect(page.locator('dialog:modal')).toHaveCount(1); await expect(row).toBeFocused();
  await page.setViewportSize({ width: 1600, height: 800 }); await expect(viewer).toHaveClass(/margin-panel/); await expect(row).toBeFocused();
  await page.setViewportSize({ width: 390, height: 700 }); await expect(page.locator('dialog:modal')).toHaveCount(1);
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: '4 fichiers sources pour ce passage' })).toBeFocused();
  await page.setViewportSize({ width: 1600, height: 800 });
  const legacy = page.getByRole('button', { name: 'legacy.md' }); await legacy.click();
  const replaced = await answer.boundingBox(); await expect(viewer).toHaveCount(1);
  await expect(viewer.getByRole('button')).toHaveCount(1); await expect(viewer.locator('blockquote')).toHaveText('Saved English excerpt legacy');
  await expect(viewer.locator('dd', { hasText: 'Non disponible' })).toHaveCount(3);
  await expect(viewer).not.toContainText('Saved English excerpt s2');
  await receive.evaluate(el => (el as unknown as { focus(options: { preventScroll: boolean }): void }).focus({ preventScroll: true }));
  await page.keyboard.press('Escape'); await expect(legacy).toBeFocused(); expect(await answer.boundingBox()).toEqual(replaced);
  expect(requests).toEqual([]);
  await page.goto(url + '?refus'); await receive.click(); await expect(page.getByRole('heading', { name: 'Refus' })).toBeVisible();
  await expect(page.locator('.answer-passage > p')).toHaveText('Refus enregistré'); await expect(page.locator('.citations')).toHaveCount(0);
});

for (const width of [390, 1100]) test(`sheet at ${width}px: touch expansion, actual file count and modal keyboard containment`, async ({ local, page: base }) => {
  await start(local);
  const context = await base.context().browser()!.newContext({ hasTouch: true, viewport: { width, height: 700 } });
  try {
    const page = await context.newPage(); await page.goto(url); await page.getByRole('button', { name: 'Recevoir' }).tap();
    const citations = page.locator('.citations').first(), mobile = width === 390;
    await expect(citations.getByRole('button')).toHaveCount(mobile ? 1 : 4);
    const trigger = mobile ? citations.getByRole('button', { name: '4 fichiers sources pour ce passage' }) : citations.getByRole('button', { name: 'Archived title' });
    if (mobile) { await expect(trigger.locator('.file-circle')).toHaveCount(3); await expect(trigger).toContainText('+1'); }
    await trigger.scrollIntoViewIfNeeded(); const before = await trigger.boundingBox(); await trigger.tap();
    const sheet = page.getByRole('dialog'); await expect(sheet).toHaveClass(/modal-sheet/);
    await expect(page.locator('dialog:modal')).toHaveCount(1); await expect(sheet.getByRole('link')).toHaveCount(0);
    expect(await trigger.boundingBox()).toEqual(before);
    const close = sheet.getByRole('button', { name: 'Fermer' }), last = sheet.getByRole('button').last();
    await expect(close).toBeFocused(); await page.keyboard.press('Shift+Tab'); await expect(last).toBeFocused();
    await page.keyboard.press('Tab'); await expect(close).toBeFocused();
    const row = sheet.getByRole('button', { name: 'Titre partagé <img>' });
    await expect(row).toHaveAttribute('aria-expanded', 'false'); await row.tap(); await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(sheet.getByText('Saved English excerpt s2')).toBeVisible(); await expect(sheet.getByText('Saved English excerpt s1')).toBeVisible();
    await expect(sheet).not.toContainText('legacy.md'); await row.tap(); await expect(row).toHaveAttribute('aria-expanded', 'false');
    await close.tap(); await expect(trigger).toBeFocused(); expect(await trigger.boundingBox()).toEqual(before);
  } finally { await context.close(); }
});
