import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSceneContract, getReductionMap, mapLegacyPreservation } from '../src/scene-contract.js';
import { createInitialState } from '../src/state.js';

test('legacy high maps to strong identity, geometry, and spatial locks', () => {
  const profile = mapLegacyPreservation('high');
  assert.equal(profile.identity, 'strong');
  assert.equal(profile.geometry, 'strong');
  assert.equal(profile.spatial, 'strong');
});

test('distill contract forbids recognizable source raster', () => {
  const state = createInitialState('test');
  state.transformationPath = 'distill';
  state.preservationLevel = 'low';
  state.sceneAnchor = 'crescent moon in cobalt sky';
  state.sceneDNA = 'moon left of center\nbranches enter from the right';
  const contract = buildSceneContract(state);
  assert.equal(contract.source_role, 'none');
  assert.ok(contract.forbidden_mutations.includes('recognizable source-photo raster'));
  assert.deepEqual(contract.scene_dna, ['moon left of center', 'branches enter from the right']);
});

test('distill with a supplied source uses the scene-evidence role', () => {
  const state = createInitialState('test');
  state.transformationPath = 'distill';
  state.source.kind = 'user-upload';
  assert.equal(buildSceneContract(state).source_role, 'scene-evidence');
});

test('product reduction gives geometry priority', () => {
  assert.ok(getReductionMap('product').some((line) => line.includes('geometry locks outrank')));
});

test('cloud reduction is scene-dependent', () => {
  const map = getReductionMap('clouds').join(' ');
  assert.match(map, /cloud silhouette/);
  assert.doesNotMatch(map, /apply minimalism/i);
});

test('architecture and vehicle reduction protect construction before decoration', () => {
  assert.match(getReductionMap('architecture').join(' '), /rooflines|openings/);
  assert.match(getReductionMap('vehicles').join(' '), /wheel count/);
});
