import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAltText } from '../src/alt-text.js';
import { compilePrompt, serializeCreationBrief } from '../src/prompt-compiler.js';
import { createInitialState } from '../src/state.js';

function stateFor(route) {
  const state = createInitialState('test');
  state.route = route;
  state.sceneAnchor = 'one observed scene';
  state.sceneDNA = 'low horizon\nquiet upper field';
  state.caption = '"Hello: world"\n第一场雨，来得很轻。 🌙';
  if (route === 'back') state.viewMode = 'back';
  if (route === 'duplex') state.viewMode = 'front';
  if (route === 'zine') state.aspectRatio = '3:5';
  return state;
}

test('prompt compiler is route-aware for every surface', () => {
  const expected = {
    split: /scene-weighted-split|horizon-split/,
    front: /scene-weighted-front|wide-horizon-front/,
    back: /writable back/,
    duplex: /two separate, same-size artifacts/,
    zine: /relational-cluster|open-horizon-event/
  };
  Object.entries(expected).forEach(([route, pattern]) => assert.match(compilePrompt(stateFor(route)), pattern));
});

test('Prompt Compiler V3 uses the required section order and native terminology', () => {
  const prompt = compilePrompt(stateFor('front'));
  const expected = [
    'OUTPUT CONTRACT', 'SOURCE ROLE', 'SCENE GRAPH', 'SCENE CONTRACT', 'MEMORY AUTHORITY', 'MUTATION BUDGET',
    'TRANSFORMATION PATH', 'LAYOUT PLAN', 'REDUCTION MAP', 'MATERIAL LOGIC', 'COLOR FUNCTION',
    'LOCKED COPY STRATEGY', 'REPRODUCTION', 'PRIVACY / REFERENCE BOUNDARY', 'HARD FAILURES',
    'SCENE DELTA EXPECTATION'
  ];
  const headings = prompt.split('\n\n').map((section) => section.split('\n')[0]);
  assert.deepEqual(headings, expected);
  assert.doesNotMatch(prompt, /high preservation|medium preservation|low preservation/i);
  assert.doesNotMatch(prompt, /\[[A-Za-z][^\]]*\]/);
});

test('zine prompt contains no hard-coded split instruction', () => {
  const prompt = compilePrompt(stateFor('zine'));
  assert.doesNotMatch(prompt, /left 46%|writing-field-right|framed field occupying/i);
});

test('structured brief safely serializes quotes, newlines, Unicode, and emoji', () => {
  const serialized = serializeCreationBrief(stateFor('front'));
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.schema_version, 3);
  assert.equal(parsed.scene_graph.schema, 'still-scenes/scene-graph/v1');
  assert.equal(parsed.mutation_budget.schema, 'still-scenes/mutation-budget/v1');
  assert.equal(parsed.scene_contract.text_locks[0].value, '"Hello: world"\n第一场雨，来得很轻。 🌙');
});

test('structured brief reports the optional network boundary without weakening the core default', () => {
  const local = stateFor('front');
  const localBrief = JSON.parse(serializeCreationBrief(local));
  assert.equal(localBrief.privacy.network_transmission, 'none-in-core-studio');
  assert.deepEqual(localBrief.privacy.network_payload, []);

  const enabled = stateFor('front');
  enabled.capability.imageGeneration = true;
  enabled.capability.imageEditing = true;
  const enabledBrief = JSON.parse(serializeCreationBrief(enabled));
  assert.equal(enabledBrief.privacy.network_transmission, 'optional-generation-endpoint-enabled');
  assert.ok(enabledBrief.privacy.network_payload.includes('selected source image'));
});

test('alt text changes with route and orientation', () => {
  assert.match(buildAltText(stateFor('back')), /writable paper back/);
  assert.match(buildAltText(stateFor('zine')), /portrait scene-zine/);
  assert.doesNotMatch(buildAltText(stateFor('front')), /image on the left/i);
});

test('distill prompt explicitly excludes source raster', () => {
  const state = stateFor('zine');
  state.transformationPath = 'distill';
  const prompt = compilePrompt(state);
  assert.match(prompt, /no recognizable source-photo raster/i);
  assert.match(prompt, /Distillation sequence: observation/i);
  assert.match(prompt, /tension — not applicable/i);
});
