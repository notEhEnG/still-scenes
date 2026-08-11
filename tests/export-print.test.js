import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRasterPdf, calculatePrintGeometry } from '../src/export-print.js';

test('3 mm bleed expands the raster and declares a trim box', () => {
  const geometry = calculatePrintGeometry(1536, 1024, { bleedMm: 3, ppi: 300 });
  assert.equal(geometry.bleedPixels, 35);
  assert.equal(geometry.rasterWidth, 1606);
  assert.equal(geometry.rasterHeight, 1094);
  assert.ok(geometry.pageWidthMm > geometry.trimWidthMm);
  assert.equal(geometry.trimBox.length, 4);
});

test('minimal PDF embeds one RGB raster, bleed geometry, and XMP provenance', () => {
  const geometry = calculatePrintGeometry(300, 200, { bleedMm: 3, ppi: 300 });
  const provenance = { schema: 'still-scenes/provenance/v1', source: { sha256: 'a'.repeat(64) } };
  const pdf = buildRasterPdf({
    jpegBytes: Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]),
    imageWidth: geometry.rasterWidth,
    imageHeight: geometry.rasterHeight,
    geometry,
    provenance
  });
  const text = new TextDecoder().decode(pdf);
  assert.match(text, /^%PDF-1\.7/);
  assert.match(text, /\/TrimBox \[/);
  assert.match(text, /\/BleedBox \[/);
  assert.match(text, /\/DeviceRGB/);
  assert.doesNotMatch(text, /\/DeviceCMYK/);
  assert.match(text, /still-scenes\/provenance\/v[12]/);
  assert.match(text, /startxref/);
});
