import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shipped page has restrictive CSP and no remote runtime URL', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|<script[^>]+https?:/i);
});

test('network access is isolated behind an explicit gateway disclosure', async () => {
  const [core, gateway, main, generation] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../network.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/generate.js', import.meta.url), 'utf8')
  ]);
  assert.match(core, /connect-src 'none'/);
  assert.match(core, /third-party endpoint/i);
  assert.match(core, /id="generationConsent"/);
  assert.doesNotMatch(main, /\bfetch\s*\(/);
  assert.match(gateway, /connect-src https: http:/);
  assert.match(gateway, /source image leave the browser/i);
  assert.match(generation, /credentials: 'omit'/);
  assert.match(generation, /referrerPolicy: 'no-referrer'/);
  assert.doesNotMatch(core + gateway + main + generation, /localStorage|sessionStorage|sendBeacon|WebSocket/);
});

test('generation uses a generic source filename rather than transmitting the local name', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /name: 'source\.png'/);
  assert.doesNotMatch(main, /name: state\.source\.filename/);
});

test('Pages deployment remains static and bypasses Jekyll', async () => {
  const [workflow, noJekyll] = await Promise.all([
    readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8'),
    readFile(new URL('../.nojekyll', import.meta.url), 'utf8')
  ]);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /cp index\.html network\.html provenance\.html styles\.css \.nojekyll site\//);
  assert.ok(noJekyll.trim().length > 0);
});

test('shipped page loads the V3 module entry point and not the legacy monolith', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /type="module" src="src\/main\.js"/);
  assert.doesNotMatch(html, /<script src="app\.js"/);
});

test('Pontian is not an initial HTML form default', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /id="inputLocation"[^>]+PONTIAN/i);
});
