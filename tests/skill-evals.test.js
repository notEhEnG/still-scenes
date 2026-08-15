import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const canonicalPath = new URL('../skills/still-scenes-postcard/evals/evals.json', import.meta.url);
const legacyPath = new URL('../skills/still-scenes-postcard-zine/evals/evals.json', import.meta.url);

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

test('canonical V3 eval pack covers native Scene Intelligence and bounded legacy aliases', async () => {
  const pack = await readJson(canonicalPath);
  assert.equal(pack.skill, 'still-scenes-postcard');
  assert.equal(pack.version, 3);
  assert.equal(pack.evals.length, 58);

  const legacyCases = pack.evals.filter(({ id }) => id.startsWith('legacy-'));
  assert.deepEqual(legacyCases.map(({ id }) => id).sort(), [
    'legacy-high-alias',
    'legacy-low-alias',
    'legacy-medium-alias'
  ]);

  const nativeAssertions = pack.evals
    .filter(({ id }) => !id.startsWith('legacy-'))
    .flatMap(({ assertions }) => assertions)
    .join(' ');
  assert.match(nativeAssertions, /Scene Graph/);
  assert.match(nativeAssertions, /Mutation Budget/);
  assert.match(nativeAssertions, /Scene Delta/);
  assert.match(nativeAssertions, /scene-evidence/i);
  assert.match(nativeAssertions, /Memory Authority|observed.*remembered|caption-only/i);
});

test('legacy invocation remains a V3 compatibility package', async () => {
  const pack = await readJson(legacyPath);
  assert.equal(pack.skill, 'still-scenes-postcard-zine');
  assert.equal(pack.version, 3);
  assert.equal(pack.evals.length, 45);
  assert.ok(pack.evals.some(({ assertions }) => assertions.some((line) => /Scene Graph/.test(line))));
});
