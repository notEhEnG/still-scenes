import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyRasterPair } from '../src/verify.js';

function solidRaster(width, height, color) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = 255;
  }
  return { width, height, data };
}

function contract(overrides = {}) {
  return {
    transformation_path: 'preserve',
    palette_locks: ['source-resonant', '#c83c28'],
    surface: { route: 'front', aspect_ratio: '3:2', width: 300, height: 200 },
    ...overrides
  };
}

test('identical images pass palette, structural, and geometry checks', () => {
  const image = solidRaster(300, 200, [200, 60, 40]);
  const report = verifyRasterPair(image, image, contract());
  assert.equal(report.paletteMatch.status, 'verified');
  assert.equal(report.structuralSimilarity.status, 'verified');
  assert.equal(report.structuralSimilarity.hammingDistance, 0);
  assert.equal(report.geometry.status, 'verified');
  assert.equal(report.overallStatus, 'verified');
  assert.equal(report.lockFamilies.identity.status, 'declared');
  assert.equal(report.lockFamilies.text.status, 'not-applicable');
});

test('a deliberately shifted palette warns or fails instead of silently passing', () => {
  const source = solidRaster(300, 200, [200, 60, 40]);
  const output = solidRaster(300, 200, [25, 45, 220]);
  const report = verifyRasterPair(source, output, contract());
  assert.ok(['warning', 'failed'].includes(report.paletteMatch.status));
  assert.ok(report.paletteMatch.distance > 100);
  assert.ok(report.paletteMatch.confidence < 0.5);
});

test('wrong output aspect ratio fails geometry', () => {
  const source = solidRaster(300, 200, [200, 60, 40]);
  const output = solidRaster(200, 200, [200, 60, 40]);
  const report = verifyRasterPair(source, output, contract());
  assert.equal(report.geometry.status, 'failed');
  assert.equal(report.geometry.actual, '200 × 200 (1.0000)');
  assert.ok(report.overallConfidence < 0.5);
});
