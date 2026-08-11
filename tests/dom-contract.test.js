import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('every main.js byId dependency exists in the page', async () => {
  const [html, main] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('src/main.js', root), 'utf8')
  ]);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const dependencies = new Set([...main.matchAll(/byId\('([^']+)'\)/g)].map((match) => match[1]));
  const missing = [...dependencies].filter((id) => !ids.has(id));
  assert.deepEqual(missing, []);
});

test('all visible treatment options have renderer branches', async () => {
  const [html, renderer] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('src/render/common.js', root), 'utf8')
  ]);
  const select = html.match(/<select id="photoTreatment">([\s\S]*?)<\/select>/)[1];
  const treatments = [...select.matchAll(/value="([^"]+)"/g)].map((match) => match[1]);
  treatments.forEach((treatment) => assert.match(renderer, new RegExp("photoTreatment === '" + treatment + "'")));
});

test('all button elements declare button type', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(buttons.length > 10);
  buttons.forEach((button) => assert.match(button, /type="button"/));
});
