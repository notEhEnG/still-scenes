const STATUS_RANK = Object.freeze({ verified: 0, declared: 1, 'not-applicable': 1, warning: 2, failed: 3 });

export const VERIFICATION_STATUS = Object.freeze({
  VERIFIED: 'verified',
  DECLARED: 'declared',
  WARNING: 'warning',
  FAILED: 'failed',
  NOT_APPLICABLE: 'not-applicable'
});

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function dimensionsOf(image) {
  return {
    width: image.naturalWidth || image.videoWidth || image.width,
    height: image.naturalHeight || image.videoHeight || image.height
  };
}

function channelStride(raster) {
  const pixels = raster.width * raster.height;
  if (raster.data.length === pixels * 4) return 4;
  if (raster.data.length === pixels * 3) return 3;
  throw new Error('Raster data must contain RGB or RGBA pixels.');
}

function pixelAt(raster, x, y) {
  const stride = channelStride(raster);
  const index = (y * raster.width + x) * stride;
  return [raster.data[index], raster.data[index + 1], raster.data[index + 2], stride === 4 ? raster.data[index + 3] : 255];
}

function resizeNearest(raster, width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(raster.height - 1, Math.floor((y + 0.5) * raster.height / height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(raster.width - 1, Math.floor((x + 0.5) * raster.width / width));
      const pixel = pixelAt(raster, sourceX, sourceY);
      const index = (y * width + x) * 4;
      data[index] = pixel[0];
      data[index + 1] = pixel[1];
      data[index + 2] = pixel[2];
      data[index + 3] = pixel[3];
    }
  }
  return { width, height, data };
}

function rgbDistance(left, right) {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

function hexToRgb(value) {
  const match = String(value).match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;
  const number = Number.parseInt(match[1], 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

function rgbToHex(rgb) {
  return '#' + rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('');
}

function flattenStrings(value, output = []) {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => flattenStrings(entry, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((entry) => flattenStrings(entry, output));
  return output;
}

export function dominantPalette(raster, count = 5) {
  const sampled = resizeNearest(raster, Math.min(64, raster.width), Math.min(64, raster.height));
  const buckets = new Map();
  for (let y = 0; y < sampled.height; y += 1) {
    for (let x = 0; x < sampled.width; x += 1) {
      const [red, green, blue, alpha] = pixelAt(sampled, x, y);
      if (alpha < 24) continue;
      const key = (red >> 5) + ':' + (green >> 5) + ':' + (blue >> 5);
      const bucket = buckets.get(key) || { count: 0, red: 0, green: 0, blue: 0 };
      bucket.count += 1;
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
      buckets.set(key, bucket);
    }
  }
  return [...buckets.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, count)
    .map((bucket) => [bucket.red / bucket.count, bucket.green / bucket.count, bucket.blue / bucket.count]);
}

export function paletteSetDistance(expected, actual) {
  if (!expected.length || !actual.length) return 441.67;
  const meanNearest = (from, to) => from.reduce((sum, color) => {
    return sum + Math.min(...to.map((candidate) => rgbDistance(color, candidate)));
  }, 0) / from.length;
  return (meanNearest(expected, actual) + meanNearest(actual, expected)) / 2;
}

export function computeDHash(raster) {
  const sample = resizeNearest(raster, 9, 8);
  const bits = new Uint8Array(64);
  let bit = 0;
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const left = pixelAt(sample, x, y);
      const right = pixelAt(sample, x + 1, y);
      const leftGray = left[0] * 0.299 + left[1] * 0.587 + left[2] * 0.114;
      const rightGray = right[0] * 0.299 + right[1] * 0.587 + right[2] * 0.114;
      bits[bit] = leftGray > rightGray ? 1 : 0;
      bit += 1;
    }
  }
  return bits;
}

export function hammingDistance(left, right) {
  if (left.length !== right.length) throw new Error('Perceptual hashes must have the same length.');
  let distance = 0;
  for (let index = 0; index < left.length; index += 1) distance += left[index] === right[index] ? 0 : 1;
  return distance;
}

function pathThresholds(path) {
  return {
    preserve: { palettePass: 55, paletteWarn: 105, structurePass: 14, structureWarn: 28 },
    reduce: { palettePass: 70, paletteWarn: 125, structurePass: 18, structureWarn: 32 },
    hybrid: { palettePass: 82, paletteWarn: 140, structurePass: 24, structureWarn: 38 },
    distill: { palettePass: 95, paletteWarn: 155, structurePass: 30, structureWarn: 46 }
  }[path] || { palettePass: 55, paletteWarn: 105, structurePass: 14, structureWarn: 28 };
}

function thresholdStatus(value, passMaximum, warnMaximum) {
  if (value <= passMaximum) return VERIFICATION_STATUS.VERIFIED;
  if (value <= warnMaximum) return VERIFICATION_STATUS.WARNING;
  return VERIFICATION_STATUS.FAILED;
}

function paletteCheck(sourceRaster, outputRaster, contract) {
  const sourcePalette = dominantPalette(sourceRaster);
  const outputPalette = dominantPalette(outputRaster);
  const declaredColors = flattenStrings(contract.palette_locks || [])
    .flatMap((value) => value.match(/#[0-9a-f]{6}/gi) || [])
    .map(hexToRgb)
    .filter(Boolean);
  const sourceDistance = paletteSetDistance(sourcePalette, outputPalette);
  const lockDistance = declaredColors.length ? paletteSetDistance(declaredColors, outputPalette) : sourceDistance;
  const distance = sourceDistance * 0.7 + lockDistance * 0.3;
  const thresholds = pathThresholds(contract.transformation_path);
  return {
    status: thresholdStatus(distance, thresholds.palettePass, thresholds.paletteWarn),
    confidence: Number(clamp(1 - distance / 180).toFixed(3)),
    distance: Number(distance.toFixed(2)),
    sourceDistance: Number(sourceDistance.toFixed(2)),
    declaredLockDistance: Number(lockDistance.toFixed(2)),
    declaredLocks: [...(contract.palette_locks || [])],
    sourcePalette: sourcePalette.map(rgbToHex),
    outputPalette: outputPalette.map(rgbToHex),
    method: declaredColors.length ? 'dominant-palette and declared-color distance' : 'dominant-palette distance using source evidence'
  };
}

function structuralCheck(sourceRaster, outputRaster, contract) {
  const distance = hammingDistance(computeDHash(sourceRaster), computeDHash(outputRaster));
  const thresholds = pathThresholds(contract.transformation_path);
  return {
    status: thresholdStatus(distance, thresholds.structurePass, thresholds.structureWarn),
    confidence: Number(clamp(1 - distance / 64).toFixed(3)),
    hammingDistance: distance,
    hashBits: 64,
    method: '64-bit dHash on downsampled grayscale pixels'
  };
}

function parseRatio(contract) {
  const surface = contract.surface || {};
  if (Number.isFinite(surface.width) && Number.isFinite(surface.height) && surface.width > 0 && surface.height > 0) {
    return { ratio: surface.width / surface.height, label: surface.aspect_ratio || surface.width + ':' + surface.height };
  }
  const label = surface.aspect_ratio || contract.surface_ratio || '';
  const match = String(label).match(/^([0-9.]+):([0-9.]+)$/);
  if (!match || Number(match[2]) === 0) return null;
  return { ratio: Number(match[1]) / Number(match[2]), label };
}

function geometryCheck(outputRaster, contract) {
  const expected = parseRatio(contract);
  const dimensions = outputRaster.original || outputRaster;
  const actualRatio = dimensions.width / dimensions.height;
  if (!expected) {
    return {
      status: VERIFICATION_STATUS.DECLARED,
      confidence: 0,
      expected: 'undeclared',
      actual: dimensions.width + ' × ' + dimensions.height + ' (' + actualRatio.toFixed(4) + ')',
      ratioError: null,
      method: 'surface aspect-ratio comparison'
    };
  }
  const ratioError = Math.abs(actualRatio - expected.ratio) / expected.ratio;
  const status = ratioError <= 0.01
    ? VERIFICATION_STATUS.VERIFIED
    : ratioError <= 0.03 ? VERIFICATION_STATUS.WARNING : VERIFICATION_STATUS.FAILED;
  return {
    status,
    confidence: Number(clamp(1 - ratioError * 8).toFixed(3)),
    expected: expected.label + ' (' + expected.ratio.toFixed(4) + ')',
    actual: dimensions.width + ' × ' + dimensions.height + ' (' + actualRatio.toFixed(4) + ')',
    ratioError: Number(ratioError.toFixed(4)),
    method: 'surface aspect-ratio comparison'
  };
}

export function verifyRasterPair(sourceRaster, outputRaster, contract) {
  if (!sourceRaster || !outputRaster || !contract) throw new Error('Source raster, output raster, and Scene Contract are required.');
  const paletteMatch = paletteCheck(sourceRaster, outputRaster, contract);
  const structuralSimilarity = structuralCheck(sourceRaster, outputRaster, contract);
  const geometry = geometryCheck(outputRaster, contract);
  const checks = [paletteMatch, structuralSimilarity, geometry];
  const overallStatus = checks.reduce((worst, check) => {
    return STATUS_RANK[check.status] > STATUS_RANK[worst] ? check.status : worst;
  }, VERIFICATION_STATUS.VERIFIED);
  const weightedConfidence = paletteMatch.confidence * 0.35 + structuralSimilarity.confidence * 0.4 + geometry.confidence * 0.25;
  const overallConfidence = overallStatus === VERIFICATION_STATUS.FAILED
    ? Math.min(weightedConfidence, 0.49)
    : overallStatus === VERIFICATION_STATUS.WARNING ? Math.min(weightedConfidence, 0.74) : weightedConfidence;
  return {
    schemaVersion: 2,
    heuristic: true,
    paletteMatch,
    structuralSimilarity,
    geometry,
    lockFamilies: {
      identity: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'No face, identity, or semantic recognition is performed.' },
      geometry: { status: VERIFICATION_STATUS.DECLARED, confidence: structuralSimilarity.confidence, evidence: 'dHash is a coarse structure signal, not an object-geometry measurement.' },
      spatial: { status: structuralSimilarity.status, confidence: structuralSimilarity.confidence, evidence: '64-bit dHash comparison.' },
      palette: { status: paletteMatch.status, confidence: paletteMatch.confidence, evidence: 'Dominant-palette and declared-lock color distance.' },
      count: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'No object detector or semantic counter is used.' },
      text: { status: VERIFICATION_STATUS.NOT_APPLICABLE, confidence: 0, evidence: 'Returned-image verification does not perform OCR.' },
      sourceBoundary: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'Source-raster absence requires capable visual inspection.' },
      layoutSafety: { status: geometry.status, confidence: geometry.confidence, evidence: 'Declared surface-ratio comparison.' },
      exportCorrectness: { status: geometry.status, confidence: geometry.confidence, evidence: 'Returned raster dimensions compared with the declared surface.' }
    },
    overallStatus,
    overallConfidence: Number(overallConfidence.toFixed(3)),
    limitation: 'Palette distance, dHash, and aspect ratio can flag visible divergence. Identity, object geometry, count, source-boundary compliance, and text remain declared or not applicable unless a capable inspection verifies them.'
  };
}

export function rasterizeImage(image, maximumSide = 96, canvasFactory) {
  const sourceDimensions = dimensionsOf(image);
  if (!sourceDimensions.width || !sourceDimensions.height) throw new Error('The image has no readable dimensions.');
  const scale = Math.min(1, maximumSide / Math.max(sourceDimensions.width, sourceDimensions.height));
  const width = Math.max(1, Math.round(sourceDimensions.width * scale));
  const height = Math.max(1, Math.round(sourceDimensions.height * scale));
  const createCanvas = canvasFactory || (() => document.createElement('canvas'));
  const canvas = createCanvas();
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  return { width, height, data: context.getImageData(0, 0, width, height).data, original: sourceDimensions };
}

export function verifyImages(sourceImage, outputImage, contract, options = {}) {
  const sourceRaster = rasterizeImage(sourceImage, options.maximumSide || 96, options.canvasFactory);
  const outputRaster = rasterizeImage(outputImage, options.maximumSide || 96, options.canvasFactory);
  return verifyRasterPair(sourceRaster, outputRaster, contract);
}

export function verifyOutputWithoutSource(outputImage, contract, options = {}) {
  const outputRaster = rasterizeImage(outputImage, options.maximumSide || 96, options.canvasFactory);
  const geometry = geometryCheck(outputRaster, contract);
  const unavailable = (method) => ({
    status: VERIFICATION_STATUS.NOT_APPLICABLE,
    confidence: 0,
    method,
    unavailable: true
  });
  return {
    schemaVersion: 2,
    heuristic: true,
    paletteMatch: unavailable('not run because no original source image is loaded'),
    structuralSimilarity: unavailable('not run because no original source image is loaded'),
    geometry,
    lockFamilies: {
      identity: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'No source comparison available.' },
      geometry: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'No source comparison available.' },
      spatial: { status: VERIFICATION_STATUS.NOT_APPLICABLE, confidence: 0, evidence: 'No source comparison available.' },
      palette: { status: VERIFICATION_STATUS.NOT_APPLICABLE, confidence: 0, evidence: 'No source comparison available.' },
      count: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'No semantic counter is used.' },
      text: { status: VERIFICATION_STATUS.NOT_APPLICABLE, confidence: 0, evidence: 'No OCR is performed.' },
      sourceBoundary: { status: VERIFICATION_STATUS.DECLARED, confidence: 0, evidence: 'No source comparison available.' },
      layoutSafety: { status: geometry.status, confidence: geometry.confidence, evidence: 'Declared surface-ratio comparison.' },
      exportCorrectness: { status: geometry.status, confidence: geometry.confidence, evidence: 'Returned raster dimensions compared with the declared surface.' }
    },
    overallStatus: geometry.status === VERIFICATION_STATUS.FAILED ? VERIFICATION_STATUS.FAILED : VERIFICATION_STATUS.WARNING,
    overallConfidence: Number((geometry.confidence * 0.25).toFixed(3)),
    limitation: 'Only output geometry was checked because no original source image was available; semantic preservation cannot be assessed.'
  };
}
