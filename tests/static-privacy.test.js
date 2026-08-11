import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shipped page has restrictive CSP and no remote runtime URL', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|<script[^>]+https?:/i);
});

test('shipped page loads the V2 module and not the legacy monolith', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /type="module" src="src\/main\.js"/);
  assert.doesNotMatch(html, /<script src="app\.js"/);
});

test('Pontian is not an initial HTML form default', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /id="inputLocation"[^>]+PONTIAN/i);
});
