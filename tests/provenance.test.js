import test from 'node:test';
import assert from 'node:assert/strict';
import { provenanceSidecarBlob } from '../src/export-provenance.js';
import { createProvenanceRecord, embedProvenanceInPngBytes, provenanceJson } from '../src/provenance.js';
import { extractPngProvenanceBytes } from '../src/provenance-reader.js';

const onePixelPng = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));

test('PNG provenance survives an embed and read round trip', async () => {
  const record = await createProvenanceRecord({
    sceneContract: {
      anchor: 'one cloud', transformation_path: 'preserve', identity_locks: ['strong'], geometry_locks: ['strong'],
      spatial_locks: ['horizon low'], palette_locks: ['#224466'], count_locks: ['one cloud'], text_locks: [{ field: 'caption', value: 'Moon.' }],
      surface: { route: 'front', aspect_ratio: '3:2', width: 1536, height: 1024 }
    },
    prompt: 'OUTPUT CONTRACT\nOne cloud.',
    sourceSha256: 'a'.repeat(64),
    timestamp: '2026-08-11T00:00:00.000Z',
    artifact: { format: 'png', route: 'front', width: 1536, height: 1024 }
  });
  const embedded = embedProvenanceInPngBytes(onePixelPng, record);
  assert.deepEqual(extractPngProvenanceBytes(embedded), record);
  assert.equal(record.schema, 'still-scenes/provenance/v2');
});

test('provenance schema whitelists fields and never carries source raster bytes', async () => {
  const rawSentinel = 'RAW_PRIVATE_IMAGE_BASE64_SENTINEL';
  const keySentinel = 'PRIVATE_ENDPOINT_KEY_SENTINEL';
  const record = await createProvenanceRecord({
    sceneContract: {
      anchor: 'one tree', transformation_path: 'reduce', identity_locks: [], geometry_locks: [], spatial_locks: [],
      palette_locks: [], count_locks: [], text_locks: [], rawSourceImage: rawSentinel,
      surface: { route: 'zine', aspect_ratio: '3:5', width: 972, height: 1620 }
    },
    prompt: 'private prompt text is hashed, not embedded',
    sourceSha256: 'b'.repeat(64),
    apiKey: keySentinel,
    endpoint: 'https://private-endpoint.example.test/generate',
    artifact: { format: 'png', route: 'zine', width: 972, height: 1620 }
  });
  const serialized = provenanceJson(record);
  assert.doesNotMatch(serialized, new RegExp(rawSentinel));
  assert.doesNotMatch(serialized, new RegExp(keySentinel));
  assert.doesNotMatch(serialized, /private-endpoint/);
  assert.doesNotMatch(serialized, /private prompt text/);
  assert.equal(record.compiledPrompt.sha256.length, 64);
  assert.equal(record.source.sha256, 'b'.repeat(64));
});

test('the JSON sidecar contains the same human-readable record', async () => {
  const record = { schema: 'still-scenes/provenance/v1', createdAt: '2026-08-11T00:00:00.000Z' };
  const blob = provenanceSidecarBlob(record);
  assert.equal(blob.type, 'application/json');
  assert.deepEqual(JSON.parse(await blob.text()), record);
});

test('an unavailable or malformed source hash is represented as null', async () => {
  const record = await createProvenanceRecord({
    sceneContract: { anchor: '', transformation_path: 'preserve', surface: null },
    prompt: '',
    sourceSha256: 'not-a-sha256'
  });
  assert.equal(record.source.sha256, null);
});

test('a returned image keeps generation history separate from the current composition', async () => {
  const current = {
    anchor: 'one cloud', transformation_path: 'preserve',
    text_locks: [{ field: 'caption', value: 'Current copy.' }],
    surface: { route: 'front', aspect_ratio: '3:2', width: 1536, height: 1024 }
  };
  const generated = {
    ...current,
    text_locks: [{ field: 'caption', value: 'Generation copy.' }]
  };
  const record = await createProvenanceRecord({
    sceneContract: current,
    prompt: 'current composition prompt',
    generation: {
      sceneContract: generated,
      prompt: 'original generation prompt',
      completedAt: '2026-08-11T01:02:03.000Z'
    }
  });
  assert.equal(record.sceneContract.textLocks[0].value, 'Current copy.');
  assert.equal(record.generation.sceneContract.textLocks[0].value, 'Generation copy.');
  assert.notEqual(record.compiledPrompt.sha256, record.generation.compiledPrompt.sha256);
  assert.doesNotMatch(provenanceJson(record), /original generation prompt|current composition prompt/);
});

test('V3 provenance carries a whitelisted Scene Delta signature without image bytes', async () => {
  const rawSentinel = 'RAW_IMAGE_BYTES_MUST_NOT_APPEAR';
  const record = await createProvenanceRecord({
    sceneContract: { anchor: 'one moon', transformation_path: 'distill', surface: { route: 'zine', aspect_ratio: '3:5', width: 972, height: 1620 } },
    sceneIntelligence: {
      sceneGraph: { nodes: [{ id: 'anchor', role: 'anchor', label: 'one moon', raw: rawSentinel }], relations: [], directions: { focal_position: 'left' }, quiet_fields: [] },
      mutationBudget: { values: { source_raster: 'locked' } },
      layoutPlan: { family: 'relational-cluster', image_share: 0.34, quiet_field_share: 0.66, crop_policy: 'not-applicable', breathing_direction: 'right' },
      materialLogic: { treatment: 'source-free-paper-forms', paper_family: 'dusk-gray', texture: 'risograph', reason: 'source-free' },
      distillationPlan: { evidence_status: 'declared', observation: ['one moon'], residue: ['crescent'], relation: ['inside open sky'], tension: [], form: ['isolated paper form'], opening: ['open left field'], source_raster: 'prohibited', raw: rawSentinel },
      sourceBoundary: { role: 'scene-evidence', status: 'declared' },
      sceneDelta: { retained: ['crescent relation'], simplified: [], transformed: ['paper forms'], removed: ['recognizable source-photo raster'], added: [], unexpected: [], unexpected_changes: [], lock_verification: { identity: 'not-applicable' } }
    },
    prompt: 'V3 prompt'
  });
  assert.equal(record.sceneIntelligence.sourceBoundary.role, 'scene-evidence');
  assert.equal(record.sceneIntelligence.distillationPlan.sourceRaster, 'prohibited');
  assert.deepEqual(record.sceneIntelligence.sceneDelta.removed, ['recognizable source-photo raster']);
  assert.doesNotMatch(provenanceJson(record), new RegExp(rawSentinel));
});
