import test from 'node:test';
import assert from 'node:assert/strict';
import { contactSheetGeometry, createCollectionManifest } from '../src/collection-export.js';
import { generateStudioVariationSet, renderedRecipeDifferences } from '../src/collection-recipe.js';
import {
  addCollectionItem,
  createCollectionWorkspace,
  moveCollectionItem,
  planCollection,
  selectCollectionItem
} from '../src/collection-state.js';
import { createInitialState, transitionToUserUpload } from '../src/state.js';
import { buildSceneContract } from '../src/scene-contract.js';
import { buildSceneIntelligence } from '../src/scene-intelligence.js';

function itemState(name, width = 1200, height = 800) {
  const state = createInitialState('collection-test-' + name);
  transitionToUserUpload(state, { name, type: 'image/png', width, height, sha256: name + '-hash' });
  state.imageResource = { name, width, height, image: {} };
  return state;
}

test('collection preserves upload order and supports explicit accessible moves', () => {
  const workspace = createCollectionWorkspace({ name: 'Monsoon notes' });
  const first = addCollectionItem(workspace, itemState('first.png'));
  const second = addCollectionItem(workspace, itemState('second.png'));
  addCollectionItem(workspace, itemState('third.png'));
  assert.deepEqual(workspace.items.map((item) => item.label), ['Artwork 1', 'Artwork 2', 'Artwork 3']);
  moveCollectionItem(workspace, second.id, -1);
  assert.deepEqual(workspace.items.map((item) => item.label), ['Artwork 2', 'Artwork 1', 'Artwork 3']);
  assert.equal(selectCollectionItem(workspace, first.id).id, first.id);
});

test('collection planning uses existing DNA and sequence engines with rendered variation', () => {
  const workspace = createCollectionWorkspace({ name: 'Quiet roads', defaultRoute: 'front' });
  addCollectionItem(workspace, itemState('one.png'));
  addCollectionItem(workspace, itemState('two.png', 800, 1200));
  addCollectionItem(workspace, itemState('three.png'));
  planCollection(workspace);
  assert.equal(workspace.sequencePlan.orderPolicy, 'user order preserved');
  assert.equal(workspace.items.at(-1).narrativeRole, 'quiet-close');
  assert.ok(workspace.items.every((item) => item.recipe?.schema === 'still-scenes/studio-recipe/v1'));
  assert.ok(workspace.variationSet.renderedGuard.every((entry) => entry.passes));
});

test('studio variation recipes differ on at least three rendered axes', () => {
  const set = generateStudioVariationSet(12);
  for (let index = 1; index < set.studioRecipes.length; index += 1) {
    assert.ok(renderedRecipeDifferences(set.studioRecipes[index].requested, set.studioRecipes[index - 1].requested).length >= 3);
  }
});

test('Scene Contract crop safety records requested and resolved collection recipes', () => {
  const state = itemState('locked.png');
  state.variationRecipe = {
    requested: { crop: 'scene-aware-cover' },
    layoutFamily: 'small-window-memory',
    imageShare: 0.62,
    cropPolicy: 'scene-aware-cover',
    photoTreatment: 'halftone',
    transformationPath: 'preserve',
    printTexture: 'risograph',
    captionPlacement: 'lower band'
  };
  const contract = buildSceneContract(state);
  const intelligence = buildSceneIntelligence(state, contract);
  assert.equal(intelligence.layoutPlan.requested_collection_recipe.crop, 'scene-aware-cover');
  assert.equal(intelligence.layoutPlan.resolved_collection_recipe.crop_policy, 'fit-within-safe-area');
  assert.match(intelligence.layoutPlan.rationale.join(' '), /overrode the requested collection crop/i);
});

test('contact sheet geometry stays bounded from two through twelve items', () => {
  for (let count = 2; count <= 12; count += 1) {
    const geometry = contactSheetGeometry(Array.from({ length: count }, () => ({})));
    assert.ok(geometry.columns >= 2 && geometry.columns <= 4);
    assert.ok(geometry.width === 2048 && geometry.height > geometry.headerHeight);
    assert.ok(geometry.cellWidth > 300);
  }
});

test('collection manifest excludes sensitive payload categories', () => {
  const workspace = createCollectionWorkspace({ name: 'Private set' });
  const manifest = createCollectionManifest(workspace, [{
    id: 'one',
    prompt: 'A quiet scene',
    apiKey: 'must-not-export',
    source: { filename: 'private-name.png', sha256: 'hash', width: 10, height: 10, mimeType: 'image/png' },
    brief: { source: { filename: 'private-name.png' } }
  }]);
  assert.equal(manifest.privacy.rawSourceBytesIncluded, false);
  assert.equal(manifest.privacy.credentialsIncluded, false);
  assert.equal(manifest.privacy.userAuthoredMemoryEvidenceIncluded, true);
  assert.equal(manifest.privacy.reviewBeforeSharing, true);
  assert.equal(manifest.items[0].order, 1);
  assert.equal(manifest.items[0].brief.source.filename, null);
  assert.doesNotMatch(JSON.stringify(manifest), /private-name|must-not-export/);
});
