import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { PRESETS, USER_PHOTO_MANIFEST_ROWS, USER_PHOTO_PRESET_IDS } from '../src/constants.js';
import { applyPreset, createInitialState, listPresets } from '../src/state.js';

test('user-photo preset count matches every MANIFEST.csv data row', async () => {
  const csv = await readFile(new URL('../demos/user-photo-styles/MANIFEST.csv', import.meta.url), 'utf8');
  const lines = csv.trim().split(/\r?\n/).slice(1);
  const manifestRows = lines.length;
  assert.equal(USER_PHOTO_MANIFEST_ROWS.length, manifestRows);
  assert.equal(USER_PHOTO_PRESET_IDS.length, manifestRows);
  const parsed = lines.map((line) => {
    const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),"(.*)"$/);
    assert.ok(match, 'manifest row keeps its documented CSV shape');
    return [match[1], match[2], match[3], match[5], match[6], match[7], match[8], match[9]];
  });
  assert.deepEqual(USER_PHOTO_MANIFEST_ROWS, parsed);
});

test('selector data exposes seven originals plus all 27 manifest artworks', () => {
  assert.equal(Object.keys(PRESETS).length, 34);
  assert.equal(listPresets().length, 34);
  assert.ok(Object.values(PRESETS).every((preset) => preset.preservationLevel === 'native'));
  assert.equal(PRESETS.u01.caption, 'THE WIRES HELD THE LAST LIGHT.');
  assert.equal(PRESETS.u27.outputDimensions, '1536x1024');
});

test('a manifest artwork preset records the hash of the image it actually loads', () => {
  const state = createInitialState('preset-hash');
  applyPreset(state, 'u11');
  assert.equal(state.source.sha256, PRESETS.u11.outputSha256);
  assert.notEqual(state.source.sha256, PRESETS.u11.sourceSha256);
});

test('every selector preset points to a shipped image asset', async () => {
  await Promise.all(Object.values(PRESETS).map((preset) => access(new URL('../' + preset.imagePath, import.meta.url))));
});
