import { sanitizeExportFilename } from './export.js';
import { downloadBlob, downloadProvenanceSidecar } from './export-provenance.js';

const MM_PER_INCH = 25.4;
const POINTS_PER_INCH = 72;

function encode(value) {
  return new TextEncoder().encode(value);
}

function concatBytes(...parts) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function number(value) {
  return Number(value.toFixed(4)).toString();
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function calculatePrintGeometry(width, height, options = {}) {
  const ppi = Number(options.ppi || 300);
  const bleedMm = Math.max(0, Number(options.bleedMm ?? 3));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Print export requires positive canvas dimensions.');
  if (!Number.isFinite(ppi) || ppi <= 0) throw new Error('Print export requires a positive PPI value.');
  const trimWidthMm = Number.isFinite(options.physicalWidthMm) ? options.physicalWidthMm : width / ppi * MM_PER_INCH;
  const trimHeightMm = Number.isFinite(options.physicalHeightMm) ? options.physicalHeightMm : height / ppi * MM_PER_INCH;
  const bleedPixels = Math.round(bleedMm / MM_PER_INCH * ppi);
  const pageWidthMm = trimWidthMm + bleedMm * 2;
  const pageHeightMm = trimHeightMm + bleedMm * 2;
  const pageWidthPoints = pageWidthMm / MM_PER_INCH * POINTS_PER_INCH;
  const pageHeightPoints = pageHeightMm / MM_PER_INCH * POINTS_PER_INCH;
  const bleedPoints = bleedMm / MM_PER_INCH * POINTS_PER_INCH;
  return {
    ppi,
    bleedMm,
    bleedPixels,
    trimWidthMm,
    trimHeightMm,
    pageWidthMm,
    pageHeightMm,
    pageWidthPoints,
    pageHeightPoints,
    rasterWidth: width + bleedPixels * 2,
    rasterHeight: height + bleedPixels * 2,
    trimBox: [bleedPoints, bleedPoints, pageWidthPoints - bleedPoints, pageHeightPoints - bleedPoints]
  };
}

export function createBleedCanvas(canvas, options = {}) {
  const geometry = calculatePrintGeometry(canvas.width, canvas.height, options);
  const createCanvas = options.canvasFactory || (() => document.createElement('canvas'));
  const output = createCanvas();
  output.width = geometry.rasterWidth;
  output.height = geometry.rasterHeight;
  const context = output.getContext('2d');
  const bleed = geometry.bleedPixels;
  const width = canvas.width;
  const height = canvas.height;
  if (bleed > 0) {
    context.drawImage(canvas, 0, 0, width, 1, bleed, 0, width, bleed);
    context.drawImage(canvas, 0, height - 1, width, 1, bleed, bleed + height, width, bleed);
    context.drawImage(canvas, 0, 0, 1, height, 0, bleed, bleed, height);
    context.drawImage(canvas, width - 1, 0, 1, height, bleed + width, bleed, bleed, height);
    context.drawImage(canvas, 0, 0, 1, 1, 0, 0, bleed, bleed);
    context.drawImage(canvas, width - 1, 0, 1, 1, bleed + width, 0, bleed, bleed);
    context.drawImage(canvas, 0, height - 1, 1, 1, 0, bleed + height, bleed, bleed);
    context.drawImage(canvas, width - 1, height - 1, 1, 1, bleed + width, bleed + height, bleed, bleed);
  }
  context.drawImage(canvas, bleed, bleed);
  return { canvas: output, geometry };
}

function xmpMetadata(record) {
  const json = escapeXml(JSON.stringify(record));
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:ss="https://still-scenes.local/provenance/2.0/">
      <ss:provenance>${json}</ss:provenance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

function streamObject(numberValue, dictionary, bytes) {
  return concatBytes(
    encode(numberValue + ' 0 obj\n<< ' + dictionary + ' /Length ' + bytes.length + ' >>\nstream\n'),
    bytes,
    encode('\nendstream\nendobj\n')
  );
}

export function buildRasterPdf({ jpegBytes, imageWidth, imageHeight, geometry, provenance }) {
  const pageWidth = number(geometry.pageWidthPoints);
  const pageHeight = number(geometry.pageHeightPoints);
  const trimBox = geometry.trimBox.map(number).join(' ');
  const content = encode('q\n' + pageWidth + ' 0 0 ' + pageHeight + ' 0 0 cm\n/Im0 Do\nQ\n');
  const metadata = encode(xmpMetadata(provenance));
  const objects = [null,
    encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R /Metadata 6 0 R >>\nendobj\n'),
    encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'),
    encode('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageWidth + ' ' + pageHeight + '] /BleedBox [0 0 ' + pageWidth + ' ' + pageHeight + '] /TrimBox [' + trimBox + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'),
    streamObject(4, '/Type /XObject /Subtype /Image /Width ' + imageWidth + ' /Height ' + imageHeight + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode', jpegBytes),
    streamObject(5, '', content),
    streamObject(6, '/Type /Metadata /Subtype /XML', metadata),
    encode('7 0 obj\n<< /Title (Still Scenes print export) /Producer (Still Scenes Studio) /Subject (RGB PDF with bleed; no CMYK conversion or press certification) >>\nendobj\n')
  ];
  const header = encode('%PDF-1.7\n%StillScenes\n');
  const chunks = [header];
  const offsets = [0];
  let offset = header.length;
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = offset;
    chunks.push(objects[index]);
    offset += objects[index].length;
  }
  const xrefOffset = offset;
  const xrefEntries = offsets.slice(1).map((value) => String(value).padStart(10, '0') + ' 00000 n \n').join('');
  chunks.push(encode(
    'xref\n0 ' + objects.length + '\n' +
    '0000000000 65535 f \n' + xrefEntries +
    'trailer\n<< /Size ' + objects.length + ' /Root 1 0 R /Info 7 0 R >>\n' +
    'startxref\n' + xrefOffset + '\n%%EOF\n'
  ));
  return concatBytes(...chunks);
}

function canvasToJpegBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The browser could not encode the print raster.')), 'image/jpeg', 0.94);
  });
}

export async function exportCanvasPrintPdf(canvas, filename, options) {
  const basename = sanitizeExportFilename(String(filename).replace(/\.pdf$/i, ''));
  const bleed = createBleedCanvas(canvas, options);
  const jpeg = await canvasToJpegBlob(bleed.canvas);
  const pdfBytes = buildRasterPdf({
    jpegBytes: new Uint8Array(await jpeg.arrayBuffer()),
    imageWidth: bleed.canvas.width,
    imageHeight: bleed.canvas.height,
    geometry: bleed.geometry,
    provenance: options.provenance
  });
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfFilename = basename + '.pdf';
  downloadBlob(blob, pdfFilename);
  const sidecar = downloadProvenanceSidecar(options.provenance, basename);
  return { filename: pdfFilename, bytes: blob.size, sidecar, geometry: bleed.geometry };
}
