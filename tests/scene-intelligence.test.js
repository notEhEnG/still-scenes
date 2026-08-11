import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseMaterialLogic } from '../src/material-logic.js';
import { buildMutationBudget } from '../src/mutation-budget.js';
import { buildSceneContract } from '../src/scene-contract.js';
import { buildSceneGraph, validateSceneGraph } from '../src/scene-graph.js';
import { buildSceneIntelligence } from '../src/scene-intelligence.js';
import { applyVerificationToSceneDelta } from '../src/scene-delta.js';
import { resolveSourceRole } from '../src/source-boundary.js';
import { cropPolicyUsesFit } from '../src/render/common.js';
import { createInitialState, transitionToUserUpload } from '../src/state.js';

function declaredState() {
  const state = createInitialState('v3-test');
  transitionToUserUpload(state, { name: 'scene.png', type: 'image/png', width: 1200, height: 800 });
  state.sceneAnchor = 'person facing the shoreline';
  state.sceneDNA = 'person remains at the left edge\nlow horizon stays level';
  state.sceneRelationships = 'person looks toward open water';
  state.sceneFocalPosition = 'left';
  state.sceneGazeDirection = 'right';
  state.sceneDensity = 'sparse';
  state.strongHorizon = true;
  state.subjectCategory = 'person';
  return state;
}

test('Distill uses scene-evidence rather than reference-grammar for a source photograph', () => {
  const state = declaredState();
  state.transformationPath = 'distill';
  assert.equal(resolveSourceRole(state), 'scene-evidence');
  const contract = buildSceneContract(state);
  assert.equal(contract.source_role, 'scene-evidence');
  assert.equal(contract.source_evidence_only, true);
  assert.deepEqual(contract.identity_locks, []);
  assert.deepEqual(contract.geometry_locks, []);
  assert.ok(contract.forbidden_mutations.includes('recognizable source-photo raster'));
});

test('Scene Graph validates declared nodes, relations, directions, and quiet fields', () => {
  const graph = buildSceneGraph(declaredState());
  const validation = validateSceneGraph(graph);
  assert.equal(validation.valid, true);
  assert.equal(graph.nodes[0].role, 'anchor');
  assert.equal(graph.nodes[0].locked, true);
  assert.equal(graph.nodes[0].source_region, 'left');
  assert.equal(graph.relations[0].label, 'person looks toward open water');
  assert.equal(graph.directions.gaze_or_motion, 'right');
  assert.equal(graph.directions.horizon, 'strong');
  assert.equal(graph.quiet_fields[0].region, 'right');
  assert.deepEqual(graph.focal_structure.primary, 'anchor');
});

test('Scene Contract locks override an expressive mutation profile', () => {
  const state = declaredState();
  state.mutationProfile = 'expressive';
  state.caption = 'Exact words.';
  const contract = buildSceneContract(state);
  const budget = buildMutationBudget(state, contract);
  assert.equal(budget.values.identity, 'locked');
  assert.equal(budget.values.geometry, 'locked');
  assert.equal(budget.values.count, 'locked');
  assert.equal(budget.values.typography, 'locked');
  assert.equal(budget.values.spatial_relation, 'tight');
  assert.ok(['locked', 'tight', 'restrained', 'flexible', 'free', 'not-applicable'].includes(budget.values.composition));
  assert.ok(budget.precedence.length >= 4);
});

test('layout follows focal and gaze constraints instead of a fixed route recipe', () => {
  const state = declaredState();
  state.route = 'front';
  const contract = buildSceneContract(state);
  const intelligence = buildSceneIntelligence(state, contract);
  assert.equal(intelligence.layoutPlan.photo_alignment, 'left');
  assert.equal(intelligence.layoutPlan.breathing_direction, 'right');
  assert.equal(intelligence.layoutPlan.crop_policy, 'fit-within-safe-area');
  assert.match(intelligence.layoutPlan.rationale.join(' '), /horizon|gaze/i);
  assert.equal(intelligence.layoutPlan.visual_exit, 'right');
  assert.ok(intelligence.reductionMap.some((line) => /gaze or motion path/.test(line)));
});

test('identity-sensitive material logic refuses a destructive silhouette request', () => {
  const state = declaredState();
  state.photoTreatment = 'silhouette';
  const contract = buildSceneContract(state);
  const budget = buildMutationBudget(state, contract);
  const material = chooseMaterialLogic(state, contract, budget);
  assert.equal(material.treatment, 'framed');
  assert.match(material.warnings[0], /identity|geometry/i);
});

test('Scene Delta distinguishes intended change from observed verification', () => {
  const state = declaredState();
  state.transformationPath = 'reduce';
  const intelligence = buildSceneIntelligence(state, buildSceneContract(state));
  assert.equal(intelligence.sceneDelta.observation_status, 'expected');
  assert.ok(intelligence.sceneDelta.retained.includes('person facing the shoreline'));
  assert.ok(intelligence.sceneDelta.simplified.length > 0);
  assert.equal(intelligence.sceneDelta.lock_verification.identity, 'declared');
});

test('Distill compiles the six-stage source-free reasoning plan without inventing tension', () => {
  const state = declaredState();
  state.transformationPath = 'distill';
  state.quietField = 'open water to the right';
  const intelligence = buildSceneIntelligence(state, buildSceneContract(state));
  assert.deepEqual(Object.keys(intelligence.distillationPlan).filter((key) => ['observation', 'residue', 'relation', 'tension', 'form', 'opening'].includes(key)), [
    'observation', 'residue', 'relation', 'tension', 'form', 'opening'
  ]);
  assert.deepEqual(intelligence.distillationPlan.tension, []);
  assert.equal(intelligence.distillationPlan.source_raster, 'prohibited');
  assert.match(intelligence.distillationPlan.opening[0], /open water/);
});

test('Scene Delta records measured divergence as unexpected instead of inventing semantic observations', () => {
  const intelligence = buildSceneIntelligence(declaredState(), buildSceneContract(declaredState()));
  const report = {
    paletteMatch: { status: 'failed' },
    structuralSimilarity: { status: 'warning' },
    geometry: { status: 'verified' }
  };
  const delta = applyVerificationToSceneDelta(intelligence.sceneDelta, report);
  assert.equal(delta.observation_status, 'heuristically-compared');
  assert.equal(delta.unexpected_changes.length, 2);
  assert.match(delta.unexpected_changes.join(' '), /palette|spatial structure/i);
  assert.equal(delta.lock_verification.identity, 'declared');
});

test('extreme landscape source into portrait uses fit-with-border', () => {
  const state = declaredState();
  state.aspectRatio = '2:3';
  state.source.width = 4000;
  state.source.height = 900;
  const intelligence = buildSceneIntelligence(state, buildSceneContract(state));
  assert.equal(intelligence.layoutPlan.crop_policy, 'fit-with-border');
  assert.equal(cropPolicyUsesFit(intelligence.layoutPlan.crop_policy), true);
});
