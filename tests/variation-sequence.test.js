import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCollectionDNA, validateCollectionDNA } from '../src/collection-dna.js';
import { planMemorySequence } from '../src/memory-sequence.js';
import { generateVariationSet, recipeDifferences } from '../src/variation.js';

test('variation engine changes at least three meaningful axes between outputs', () => {
  const set = generateVariationSet(8);
  assert.equal(set.recipes.length, 8);
  for (let index = 1; index < set.recipes.length; index += 1) {
    assert.ok(recipeDifferences(set.recipes[index], set.recipes[index - 1]).length >= 3);
    assert.equal(set.guard[index].passes, true);
  }
  assert.ok(set.recipes.every((recipe) => recipe.material && recipe.edgeBehavior && recipe.transformationPath));
});

test('memory sequence preserves explicit user order and creates a quiet close', () => {
  const sequence = planMemorySequence([
    { id: 'third', sourceKind: 'generated' },
    { id: 'first', sourceKind: 'photo' },
    { id: 'second', sourceKind: 'photo' },
    { id: 'fourth', sourceKind: 'text' }
  ]);
  assert.deepEqual(sequence.items.map((item) => item.id), ['third', 'first', 'second', 'fourth']);
  assert.equal(sequence.items.at(-1).narrativeRole, 'quiet-close');
  assert.match(sequence.limitation, /does not claim cross-session memory/i);
  assert.equal(sequence.total_items, 4);
  assert.equal(sequence.transitions.length, 3);
  assert.ok(sequence.items.every((item) => item.layoutFamily && item.captionRole));
});

test('automatic memory edit uses scene scale and closing potential instead of sorting IDs', () => {
  const sequence = planMemorySequence([
    { id: 'a-detail', shotScale: 'detail' },
    { id: 'z-wide', shotScale: 'wide' },
    { id: 'm-close', shotScale: 'close', closingPotential: true }
  ], { preserveOrder: false });
  assert.deepEqual(sequence.items.map((item) => item.id), ['z-wide', 'a-detail', 'm-close']);
  assert.equal(sequence.items.at(-1).narrativeRole, 'quiet-close');
});

test('Collection DNA is explicit, bounded, and variable', () => {
  const collection = buildCollectionDNA({ name: 'Monsoon notes', paperFamily: 'dusk-gray' });
  assert.equal(validateCollectionDNA(collection).valid, true);
  assert.equal(collection.paper_family, 'dusk-gray');
  assert.equal(collection.memory_scope, 'current request or explicitly supplied collection only');
  assert.equal(collection.caption_voice, 'observational');
  assert.ok(collection.preferred_materials.length >= 3);
});

test('Collection DNA can record a deliberate break without pretending it still matches', () => {
  const collection = buildCollectionDNA({ breakCollection: true, breakReason: 'use a loud red field for this anniversary card' });
  assert.equal(collection.mode, 'deliberate-break');
  assert.match(collection.deliberate_break, /red field/);
  assert.equal(validateCollectionDNA(collection).valid, true);
});
