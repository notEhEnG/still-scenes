import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPreset,
  classifyImageSource,
  compatibleViews,
  createInitialState,
  hasPresetCopyLeak,
  normalizeViewForRoute,
  setRoute,
  transitionToUserUpload,
  updateCopyField
} from '../src/state.js';

const upload = { name: 'mine.png', type: 'image/png', width: 1200, height: 900, loadedAt: '2026-08-10T00:00:00.000Z' };

test('initial custom state contains no Pontian or demo copy', () => {
  const state = createInitialState('test');
  assert.equal(state.location, '');
  assert.equal(state.date, '');
  assert.equal(state.caption, '');
  assert.equal(state.source.kind, 'none');
});

test('every route has only compatible views', () => {
  assert.deepEqual(compatibleViews('split'), ['composite', 'base']);
  assert.deepEqual(compatibleViews('back'), ['back']);
  assert.deepEqual(compatibleViews('duplex'), ['front', 'back']);
  assert.deepEqual(compatibleViews('zine'), ['composite', 'base']);
});

test('route change normalizes an invalid back view', () => {
  const state = createInitialState('test');
  state.viewMode = 'back';
  setRoute(state, 'zine');
  assert.equal(state.viewMode, 'composite');
  assert.equal(normalizeViewForRoute('front', 'back'), 'composite');
});

test('user upload clears untouched preset location, date, and caption', () => {
  const state = createInitialState('test');
  applyPreset(state, 'demo1');
  transitionToUserUpload(state, upload);
  assert.equal(state.location, '');
  assert.equal(state.date, '');
  assert.equal(state.caption, '');
  assert.equal(state.source.presetId, null);
  assert.equal(hasPresetCopyLeak(state), false);
});

test('user-authored copy survives a custom upload', () => {
  const state = createInitialState('test');
  applyPreset(state, 'demo1');
  updateCopyField(state, 'caption', 'My exact words 🌙');
  updateCopyField(state, 'location', 'A place I chose');
  transitionToUserUpload(state, upload);
  assert.equal(state.caption, 'My exact words 🌙');
  assert.equal(state.location, 'A place I chose');
  assert.equal(state.date, '');
});

test('custom source classification is supplied, never generated', () => {
  const state = createInitialState('test');
  transitionToUserUpload(state, upload);
  assert.equal(classifyImageSource(state), 'supplied');
  assert.equal(state.source.userOwned, true);
});
