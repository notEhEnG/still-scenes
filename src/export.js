import { getPrintSpecification } from './layout.js';

export function sanitizeExportFilename(value) {
  const normalized = String(value || 'still-scenes')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
  return normalized || 'still-scenes';
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The browser could not encode the PNG.'));
    }, 'image/png');
  });
}

export async function exportCanvasPNG(canvas, filename) {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = sanitizeExportFilename(String(filename).replace(/\.png$/i, '')) + '.png';
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { filename: link.download, bytes: blob.size };
}

export function describeExport(aspectRatio) {
  return getPrintSpecification(aspectRatio);
}
