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
    split: /framed field/,
    front: /image-led front/,
    back: /writable back/,
    duplex: /two separate, same-size artifacts/,
    zine: /editorial paper event/
  };
  Object.entries(expected).forEach(([route, pattern]) => assert.match(compilePrompt(stateFor(route)), pattern));
});

test('zine prompt contains no hard-coded split instruction', () => {
  const prompt = compilePrompt(stateFor('zine'));
  assert.doesNotMatch(prompt, /left 46%|writing-field-right|framed field occupying/i);
});

test('structured brief safely serializes quotes, newlines, Unicode, and emoji', () => {
  const serialized = serializeCreationBrief(stateFor('front'));
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.scene_contract.text_locks[0].value, '"Hello: world"\n第一场雨，来得很轻。 🌙');
});

test('alt text changes with route and orientation', () => {
  assert.match(buildAltText(stateFor('back')), /writable paper back/);
  assert.match(buildAltText(stateFor('zine')), /portrait scene-zine/);
  assert.doesNotMatch(buildAltText(stateFor('front')), /image on the left/i);
});

test('distill prompt explicitly excludes source raster', () => {
  const state = stateFor('zine');
  state.transformationPath = 'distill';
  assert.match(compilePrompt(state), /no recognizable source-photo raster/i);
});
