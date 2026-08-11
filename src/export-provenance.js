import { sanitizeExportFilename } from './export.js';
import { embedProvenanceInPngBlob, provenanceJson } from './provenance.js';

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The browser could not encode the PNG.')), 'image/png');
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function provenanceSidecarBlob(record) {
  return new Blob([provenanceJson(record) + '\n'], { type: 'application/json' });
}

export function downloadProvenanceSidecar(record, basename) {
  const filename = sanitizeExportFilename(basename) + '.json';
  const blob = provenanceSidecarBlob(record);
  downloadBlob(blob, filename);
  return { filename, bytes: blob.size };
}

export async function exportCanvasPNGWithProvenance(canvas, filename, record) {
  const basename = sanitizeExportFilename(String(filename).replace(/\.png$/i, ''));
  const rawBlob = await canvasToPngBlob(canvas);
  const blob = await embedProvenanceInPngBlob(rawBlob, record);
  const pngFilename = basename + '.png';
  downloadBlob(blob, pngFilename);
  const sidecar = downloadProvenanceSidecar(record, basename);
  return { filename: pngFilename, bytes: blob.size, sidecar };
}
