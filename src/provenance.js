import { evidenceCounts } from './memory-evidence.js';

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
export const PROVENANCE_KEYWORD = 'still-scenes:provenance';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

function concatBytes(...parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function uint32(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, false);
  return bytes;
}

function readUint32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, false);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function createPngChunk(type, data = new Uint8Array()) {
  const typeBytes = new TextEncoder().encode(type);
  if (typeBytes.length !== 4) throw new Error('PNG chunk types must contain four ASCII characters.');
  const body = concatBytes(typeBytes, data);
  return concatBytes(uint32(data.length), body, uint32(crc32(body)));
}

function assertPng(bytes) {
  if (bytes.length < PNG_SIGNATURE.length || !PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    throw new Error('Provenance can be embedded only in a valid PNG byte stream.');
  }
}

function iTextData(record) {
  const keyword = new TextEncoder().encode(PROVENANCE_KEYWORD);
  const json = new TextEncoder().encode(JSON.stringify(record));
  return concatBytes(keyword, Uint8Array.of(0, 0, 0, 0, 0), json);
}

export function embedProvenanceInPngBytes(input, record) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  assertPng(bytes);
  let offset = PNG_SIGNATURE.length;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    const end = offset + 12 + length;
    if (end > bytes.length) throw new Error('The PNG contains a truncated chunk.');
    const type = new TextDecoder('latin1').decode(bytes.subarray(offset + 4, offset + 8));
    if (type === 'IEND') {
      const chunk = createPngChunk('iTXt', iTextData(record));
      return concatBytes(bytes.subarray(0, offset), chunk, bytes.subarray(offset));
    }
    offset = end;
  }
  throw new Error('The PNG has no IEND chunk.');
}

export async function embedProvenanceInPngBlob(blob, record) {
  const bytes = embedProvenanceInPngBytes(new Uint8Array(await blob.arrayBuffer()), record);
  return new Blob([bytes], { type: 'image/png' });
}

function hex(bytes) {
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function sha256Bytes(value) {
  let bytes;
  if (typeof value === 'string') bytes = new TextEncoder().encode(value);
  else if (value instanceof Blob) bytes = new Uint8Array(await value.arrayBuffer());
  else if (value instanceof Uint8Array) bytes = value;
  else if (value instanceof ArrayBuffer) bytes = new Uint8Array(value);
  else throw new Error('SHA-256 input must be text, Blob, ArrayBuffer, or Uint8Array.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return hex(new Uint8Array(digest));
}

function copyLocks(values) {
  return Array.isArray(values) ? values.map((value) => {
    if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value));
    return String(value);
  }) : [];
}

function normalizedSha256(value) {
  const hash = String(value || '');
  return /^[0-9a-f]{64}$/i.test(hash) ? hash.toLowerCase() : null;
}

function contractSummary(sceneContract) {
  const memoryEvidence = sceneContract.memory_evidence || null;
  return {
    anchor: String(sceneContract.anchor || ''),
    transformationPath: String(sceneContract.transformation_path || ''),
    identityLocks: copyLocks(sceneContract.identity_locks),
    geometryLocks: copyLocks(sceneContract.geometry_locks),
    spatialLocks: copyLocks(sceneContract.spatial_locks),
    paletteLocks: copyLocks(sceneContract.palette_locks),
    countLocks: copyLocks(sceneContract.count_locks),
    textLocks: copyLocks(sceneContract.text_locks),
    memoryEvidence: memoryEvidence ? {
      schema: memoryEvidence.schema,
      influence: memoryEvidence.influence,
      counts: evidenceCounts(memoryEvidence),
      rawTextEmbedded: false
    } : null,
    surface: sceneContract.surface ? {
      route: sceneContract.surface.route,
      aspectRatio: sceneContract.surface.aspect_ratio,
      width: sceneContract.surface.width,
      height: sceneContract.surface.height
    } : null
  };
}

function stringList(values) {
  return Array.isArray(values) ? values.map((value) => String(value)) : [];
}

function intelligenceSummary(intelligence) {
  if (!intelligence) return null;
  const graph = intelligence.sceneGraph || {};
  const delta = intelligence.sceneDelta || {};
  return {
    sceneGraph: {
      nodes: (graph.nodes || []).map((node) => ({ id: String(node.id || ''), role: String(node.role || ''), label: String(node.label || '') })),
      relations: (graph.relations || []).map((relation) => String(relation.label || '')),
      directions: graph.directions ? { ...graph.directions } : null,
      quietFields: Array.isArray(graph.quiet_fields) ? JSON.parse(JSON.stringify(graph.quiet_fields)) : []
    },
    mutationBudget: intelligence.mutationBudget?.values ? { ...intelligence.mutationBudget.values } : null,
    layoutPlan: intelligence.layoutPlan ? {
      family: intelligence.layoutPlan.family,
      imageShare: intelligence.layoutPlan.image_share,
      quietFieldShare: intelligence.layoutPlan.quiet_field_share,
      cropPolicy: intelligence.layoutPlan.crop_policy,
      breathingDirection: intelligence.layoutPlan.breathing_direction
    } : null,
    materialLogic: intelligence.materialLogic ? {
      treatment: intelligence.materialLogic.treatment,
      paperFamily: intelligence.materialLogic.paper_family,
      texture: intelligence.materialLogic.texture,
      reason: intelligence.materialLogic.reason
    } : null,
    distillationPlan: intelligence.distillationPlan ? {
      evidenceStatus: intelligence.distillationPlan.evidence_status,
      observation: stringList(intelligence.distillationPlan.observation),
      residue: stringList(intelligence.distillationPlan.residue),
      relation: stringList(intelligence.distillationPlan.relation),
      tension: stringList(intelligence.distillationPlan.tension),
      form: stringList(intelligence.distillationPlan.form),
      opening: stringList(intelligence.distillationPlan.opening),
      sourceRaster: intelligence.distillationPlan.source_raster
    } : null,
    sourceBoundary: intelligence.sourceBoundary ? { role: intelligence.sourceBoundary.role, status: intelligence.sourceBoundary.status } : null,
    sceneDelta: {
      retained: stringList(delta.retained),
      simplified: stringList(delta.simplified),
      transformed: stringList(delta.transformed),
      removed: stringList(delta.removed),
      added: stringList(delta.added),
      unexpected: stringList(delta.unexpected),
      unexpectedChanges: stringList(delta.unexpected_changes),
      lockVerification: delta.lock_verification ? { ...delta.lock_verification } : null
    }
  };
}

export async function createProvenanceRecord({
  sceneContract,
  prompt,
  sourceSha256 = '',
  timestamp = new Date().toISOString(),
  artifact = {},
  sceneIntelligence = null,
  generation = null
}) {
  if (!sceneContract) throw new Error('A Scene Contract is required for provenance.');
  const promptSha256 = await sha256Bytes(String(prompt || ''));
  const record = {
    schema: 'still-scenes/provenance/v2',
    createdAt: timestamp,
    generator: 'Still Scenes Studio',
    source: { sha256: normalizedSha256(sourceSha256) },
    sceneContract: contractSummary(sceneContract),
    sceneIntelligence: intelligenceSummary(sceneIntelligence),
    compiledPrompt: { sha256: promptSha256 },
    artifact: {
      format: artifact.format || 'png',
      route: artifact.route || sceneContract.surface?.route || null,
      width: Number.isFinite(artifact.width) ? artifact.width : sceneContract.surface?.width || null,
      height: Number.isFinite(artifact.height) ? artifact.height : sceneContract.surface?.height || null,
      bleedMm: Number.isFinite(artifact.bleedMm) ? artifact.bleedMm : 0,
      colorSpace: 'RGB'
    }
  };
  if (generation?.sceneContract) {
    record.generation = {
      completedAt: generation.completedAt || null,
      sceneContract: contractSummary(generation.sceneContract),
      sceneIntelligence: intelligenceSummary(generation.sceneIntelligence),
      compiledPrompt: { sha256: await sha256Bytes(String(generation.prompt || '')) }
    };
  }
  return record;
}

export function provenanceJson(record, pretty = true) {
  return JSON.stringify(record, null, pretty ? 2 : 0);
}
