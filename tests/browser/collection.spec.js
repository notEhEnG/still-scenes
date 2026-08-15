import { expect, test } from '@playwright/test';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const root = process.cwd();

async function downloadText(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

test('collection workflow preserves order, plans items, and exports a private manifest', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('STILL SCENES');
  await expect(page.locator('#studioCanvas')).toHaveAttribute('aria-describedby', 'canvasDescription');

  await page.getByRole('button', { name: 'Collection' }).click();
  const firstImage = await readFile(path.join(root, 'demos/generated/demo-01-lantana-split-postcard.png'));
  const secondImage = await readFile(path.join(root, 'demos/generated/demo-02-rainy-bus-stop-front.png'));
  await page.locator('#collectionImageInput').setInputFiles([
    { name: 'first.png', mimeType: 'image/png', buffer: firstImage },
    { name: 'second.png', mimeType: 'image/png', buffer: secondImage },
    { name: 'invalid.png', mimeType: 'image/png', buffer: Buffer.from('not an image') }
  ]);
  await expect(page.locator('#collectionItems .collection-item')).toHaveCount(2);
  await expect(page.locator('#collectionItemCount')).toHaveText('2 artworks');
  await expect(page.locator('#collectionStatus')).toContainText('Rejected: invalid.png');
  await expect(page.getByRole('button', { name: 'Writable Back' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Duplex Pair' })).toBeHidden();

  await page.getByRole('button', { name: 'Plan Collection' }).click();
  await expect(page.locator('#collectionStatus')).toContainText('user order preserved');
  await expect(page.locator('#collectionItems')).toContainText('quiet-close');

  await page.locator('#inputCaption').fill('FIRST ITEM ONLY');
  await page.getByRole('button', { name: /Edit artwork 2:/ }).click();
  await expect(page.locator('#inputCaption')).toHaveValue('');
  await page.getByRole('button', { name: /Edit artwork 1:/ }).click();
  await expect(page.locator('#inputCaption')).toHaveValue('FIRST ITEM ONLY');

  await page.getByRole('button', { name: 'Move Artwork 2 earlier' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#collectionItems .collection-item').first()).toContainText('Artwork 2');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Collection JSON' }).click();
  const download = await downloadPromise;
  const manifest = JSON.parse(await downloadText(download));
  expect(manifest.schema).toBe('still-scenes/collection-manifest/v1');
  expect(manifest.collection.orderPolicy).toBe('preserve-upload-order');
  expect(manifest.items).toHaveLength(2);
  expect(JSON.stringify(manifest)).not.toContain('demo-01-lantana');
  expect(JSON.stringify(manifest)).not.toContain('apiKey');
  expect(manifest.privacy.rawSourceBytesIncluded).toBe(false);

  const collectionDownloads = [];
  page.on('download', (item) => collectionDownloads.push(item.suggestedFilename()));
  await page.getByRole('button', { name: 'Export Contact Sheet' }).click();
  await expect(page.locator('#studioStatus')).toContainText('contact sheet and complete JSON manifest');
  await expect.poll(() => collectionDownloads.length).toBeGreaterThanOrEqual(3);
  expect(collectionDownloads.some((filename) => filename.endsWith('-contact-sheet.png'))).toBe(true);
  expect(collectionDownloads.some((filename) => filename.endsWith('-collection.json'))).toBe(true);

  expect(requests.every((url) => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);

  await page.reload();
  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(page.locator('#collectionItems .collection-item')).toHaveCount(0);
});

test('primary export action and helper text meet WCAG AA contrast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const ratios = await page.evaluate(() => {
    function rgb(value) {
      return value.match(/[\d.]+/g).slice(0, 3).map((part) => Number(part) / 255);
    }
    function luminance(value) {
      return rgb(value).map((channel) => channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4))
        .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    }
    function contrast(foreground, background) {
      const first = luminance(foreground);
      const second = luminance(background);
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    }
    const button = getComputedStyle(document.querySelector('#btnExportImage'));
    const helper = getComputedStyle(document.querySelector('#uploadStatus'));
    const helperBackground = getComputedStyle(document.querySelector('#sourceControlGroup'));
    return {
      button: contrast(button.color, button.backgroundColor),
      helper: contrast(helper.color, helperBackground.backgroundColor)
    };
  });
  expect(ratios.button).toBeGreaterThanOrEqual(4.5);
  expect(ratios.helper).toBeGreaterThanOrEqual(4.5);
  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(page.locator('#collectionControlGroup')).toBeVisible();
  await expect(page.locator('#collectionStrip')).toBeVisible();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);
});

test('memory evidence builds traceable captions and blocks authority conflicts', async ({ page }) => {
  await page.goto('/');
  await page.locator('#inputSceneAnchor').fill('rainy bus stop');
  await page.locator('#inputSceneDNA').fill('one shelter light');
  await page.locator('#inputObservedEvidence').fill('one red umbrella near the curb\nwet road reflects the shelter light');
  await page.locator('#inputRememberedEvidence').fill('we waited here after the last bus');
  await page.locator('#inputUncertainEvidence').fill('the shop may have been closed');
  await page.locator('#inputForbiddenEvidence').fill('no extra people');

  await expect(page.locator('#memoryEvidenceStatus')).toContainText('2 observed · 1 remembered · 1 uncertain · 1 prohibited · caption-only');
  await expect(page.locator('#captionLadder .caption-option')).toHaveCount(3);
  await page.locator('#captionLadder .caption-option').nth(2).click();
  await expect(page.locator('#inputCaption')).toHaveValue('one red umbrella near the curb\nwe waited here after the last bus');
  await expect(page.locator('#captionAuthorityStatus')).toContainText('character-for-character deterministic assembly');
  await expect(page.locator('#gateAuthority')).toContainText('VERIFIED');

  await page.getByRole('button', { name: 'Brief & Prompt' }).click();
  await page.getByRole('tab', { name: 'Compiled Prompt' }).click();
  await expect(page.locator('#codePrompt')).toContainText('MEMORY AUTHORITY');
  await expect(page.locator('#codePrompt')).toContainText('May shape captions only; do not add it to the visible scene');
  await page.getByRole('button', { name: 'Close inspector' }).click();

  await page.locator('#inputUncertainEvidence').fill('one red umbrella near the curb');
  await expect(page.locator('#memoryEvidenceStatus')).toContainText('Resolve conflicting classifications');
  await expect(page.locator('#gateAuthority')).toContainText('FAILED');
});
