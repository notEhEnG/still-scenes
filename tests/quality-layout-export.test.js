import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeExportFilename } from '../src/export.js';
import { duplexProfilesMatch, getCanvasProfile, getPrintSpecification } from '../src/layout.js';
import { evaluateQuality } from '../src/quality.js';
import { createInitialState, transitionToUserUpload } from '../src/state.js';

test('A6 reports exact pixels, physical size, and PPI without press-ready wording', () => {
  const spec = getPrintSpecification('A6-land');
  assert.equal(spec.width, 1748);
  assert.equal(spec.height, 1240);
  assert.equal(spec.physicalSize, '148 × 105 mm');
  assert.equal(spec.ppi, 300);
  assert.doesNotMatch(spec.label, /press.ready/i);
});

test('duplex matching compares both dimensions', () => {
  const profile = getCanvasProfile('3:2');
  assert.equal(duplexProfilesMatch(profile, { ...profile }), true);
  assert.equal(duplexProfilesMatch(profile, getCanvasProfile('2:3')), false);
});

test('export filename removes traversal and unsafe characters', () => {
  assert.equal(sanitizeExportFilename('../../Still Scenes 🌙: front'), 'Still-Scenes-front');
});

test('quality gate never verifies declared AI preservation', () => {
  const state = createInitialState('test');
  state.sceneAnchor = 'one scene';
  state.sceneDNA = 'one relation';
  const gates = evaluateQuality(state, { copy: [], collisions: [], sourcePixelsUsed: false, safeArea: true }, { width: 1536, height: 1024 });
  const contract = gates.find((gate) => gate.id === 'contract');
  assert.equal(contract.status, 'declared');
  assert.match(contract.detail, /not automatically verified/i);
});

test('quality detects preset ownership attached to a custom upload', () => {
  const state = createInitialState('test');
  transitionToUserUpload(state, { name: 'mine.png', type: 'image/png', width: 100, height: 100 });
  state.copyMeta.location = { owner: 'preset', dirty: false };
  const gates = evaluateQuality(state, { copy: [], collisions: [], sourcePixelsUsed: false, safeArea: true }, { width: 1536, height: 1024 });
  assert.equal(gates.find((gate) => gate.id === 'privacy').status, 'failed');
});

test('distilled output fails if source pixels are reported', () => {
  const state = createInitialState('test');
  state.route = 'zine';
  state.transformationPath = 'distill';
  const gates = evaluateQuality(state, { copy: [], collisions: [], sourcePixelsUsed: true, safeArea: true }, { width: 972, height: 1620 });
  assert.equal(gates.find((gate) => gate.id === 'route').status, 'failed');
});
