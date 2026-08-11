import test from 'node:test';
import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);

function digest(url) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(url);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function pngNames(url) {
  return (await readdir(url)).filter((name) => name.endsWith('.png')).sort();
}

async function assertMirrored(canonicalDirectory, galleryDirectory, expectedCount) {
  const names = await pngNames(canonicalDirectory);
  assert.equal(names.length, expectedCount);
  assert.deepEqual(names, await pngNames(galleryDirectory));
  for (const name of names) {
    assert.equal(
      await digest(new URL(name, canonicalDirectory)),
      await digest(new URL(name, galleryDirectory)),
      name + ' must remain byte-identical to its repository gallery asset'
    );
  }
}

test('canonical skill bundles all seven generated-scene assets byte-for-byte', async () => {
  await assertMirrored(
    new URL('skills/still-scenes-postcard/assets/demos/', root),
    new URL('demos/generated/', root),
    7
  );
});

test('canonical skill bundles all 27 U-series assets byte-for-byte', async () => {
  await assertMirrored(
    new URL('skills/still-scenes-postcard/assets/user-photo-demos/', root),
    new URL('demos/user-photo-styles/generated/', root),
    27
  );
});
