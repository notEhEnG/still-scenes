import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ImageValidationError,
  sniffImageType,
  validateDecodedDimensions,
  validateFileDescriptor,
  validateImageSignature
} from '../src/image-loader.js';

const limits = {
  maxBytes: 25 * 1024 * 1024,
  maxPixels: 40_000_000,
  maxWidth: 12_000,
  maxHeight: 12_000,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
};

test('zero-byte and 50 MB fake JPEG descriptors are rejected', () => {
  assert.throws(() => validateFileDescriptor({ size: 0, type: 'image/jpeg' }, limits), ImageValidationError);
  assert.throws(() => validateFileDescriptor({ size: 50 * 1024 * 1024, type: 'image/jpeg' }, limits), /25 MB/);
});

test('SVG and unsupported MIME are rejected', () => {
  assert.throws(() => validateFileDescriptor({ size: 120, type: 'image/svg+xml' }, limits), /Unsupported image type/);
});

test('magic-byte sniffing recognizes PNG, JPEG, and WebP', () => {
  assert.equal(sniffImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(sniffImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(sniffImageType(Uint8Array.from([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80])), 'image/webp');
});

test('text renamed JPG and MIME mismatch are rejected', () => {
  assert.throws(() => validateImageSignature('image/jpeg', new TextEncoder().encode('not an image')), /not a supported image/);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.throws(() => validateImageSignature('image/jpeg', png), /does not match/);
});

test('decoded pixel and dimension limits are enforced', () => {
  assert.throws(() => validateDecodedDimensions(15_000, 100, limits), /too large/);
  assert.throws(() => validateDecodedDimensions(10_000, 10_000, limits), /too large/);
  assert.equal(validateDecodedDimensions(4000, 3000, limits), true);
});
