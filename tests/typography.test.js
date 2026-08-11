import test from 'node:test';
import assert from 'node:assert/strict';
import { detectTextCollision, fitLockedText, wrapLockedText } from '../src/typography.js';

function context() {
  return {
    font: '',
    measureText(value) { return { width: Array.from(value).length * 10 }; }
  };
}

test('locked wrapper preserves explicit line breaks', () => {
  const lines = wrapLockedText('Line one\nLine two', (value) => value.length * 10, 200);
  assert.deepEqual(lines, ['Line one', 'Line two']);
});

test('locked wrapper handles CJK and emoji without dropping code points', () => {
  const source = '第一场雨，来得很轻。🌙';
  const lines = wrapLockedText(source, (value) => Array.from(value).length * 10, 40);
  assert.equal(lines.join(''), source);
});

test('fit engine reports overflow instead of changing the wording', () => {
  const source = 'A'.repeat(70);
  const result = fitLockedText(context(), {
    text: source,
    maxWidth: 40,
    maxHeight: 20,
    minFontSize: 12,
    maxFontSize: 14,
    lineHeight: 1.2,
    fontFamily: 'sans-serif'
  });
  assert.equal(result.source, source);
  assert.equal(result.overflow, true);
});

test('collision detection reports overlapping locked fields', () => {
  const collisions = detectTextCollision([
    { field: 'caption', bounds: { x: 0, y: 0, width: 100, height: 30 } },
    { field: 'date', bounds: { x: 80, y: 10, width: 50, height: 20 } }
  ]);
  assert.deepEqual(collisions, [['caption', 'date']]);
});
