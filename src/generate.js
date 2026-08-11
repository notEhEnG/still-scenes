import { genericJsonAdapter } from './adapters/generic-json.js';
import { openAIImagesAdapter } from './adapters/openai-images.js';

const MAX_RESULT_BYTES = 25 * 1024 * 1024;
const ADAPTERS = Object.freeze({
  [genericJsonAdapter.id]: genericJsonAdapter,
  [openAIImagesAdapter.id]: openAIImagesAdapter
});

export function listGenerationAdapters() {
  return Object.values(ADAPTERS).map(({ id, label }) => ({ id, label }));
}

export function getGenerationAdapter(id) {
  const adapter = ADAPTERS[id];
  if (!adapter) throw new Error('Unknown generation adapter: ' + id);
  return adapter;
}

export function validateEndpoint(endpoint) {
  let parsed;
  try {
    parsed = new URL(String(endpoint));
  } catch {
    throw new Error('Enter a complete HTTP or HTTPS endpoint URL.');
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Generation endpoints must use HTTP or HTTPS.');
  if (parsed.username || parsed.password) throw new Error('Do not place credentials inside the endpoint URL.');
  return parsed.href;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export async function blobToBase64(blob) {
  if (blob.size > MAX_RESULT_BYTES) throw new Error('The image exceeds the 25 MB generation transfer limit.');
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
}

export function base64ToBlob(base64, mimeType = 'image/png') {
  const binary = atob(base64);
  if (binary.length > MAX_RESULT_BYTES) throw new Error('The image exceeds the 25 MB generation transfer limit.');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mimeType });
}

async function readRemoteImage(url, fetchImpl) {
  const safeUrl = validateEndpoint(url);
  const response = await fetchImpl(safeUrl, { method: 'GET', credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('The generated image URL returned HTTP ' + response.status + '.');
  const contentType = String(response.headers?.get?.('content-type') || 'image/png').split(';')[0].trim().toLowerCase();
  if (!/^image\/(png|jpeg|webp|avif)$/i.test(contentType)) throw new Error('The generated URL did not return a supported raster image.');
  const blob = await response.blob();
  return { base64: await blobToBase64(blob), mimeType: contentType };
}

function responseFailure(response) {
  return 'Generation endpoint returned HTTP ' + response.status + '.';
}

export async function generateImage(request, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('This browser does not provide fetch for the opt-in gateway.');
  const endpoint = validateEndpoint(request.endpoint);
  const prompt = String(request.prompt || '');
  if (!prompt.trim()) throw new Error('A compiled prompt is required.');
  const adapter = getGenerationAdapter(request.adapterId || 'generic-json');
  const built = adapter.buildRequest({ ...request, endpoint, prompt });
  const response = await fetchImpl(built.url, built.init);
  if (!response.ok) throw new Error(responseFailure(response));
  const parsed = await adapter.parseResponse(response, { fetchImpl });
  if (parsed.url) {
    const remote = await readRemoteImage(parsed.url, fetchImpl);
    return { ...remote, adapterId: adapter.id };
  }
  const rawBase64 = String(parsed.base64 || '');
  const dataUrl = rawBase64.match(/^data:(image\/(?:png|jpeg|webp|avif));base64,(.*)$/is);
  const normalized = dataUrl ? dataUrl[2] : rawBase64;
  if (!normalized) throw new Error('The endpoint returned an empty image payload.');
  const estimatedBytes = Math.floor(normalized.length * 0.75);
  if (estimatedBytes > MAX_RESULT_BYTES) throw new Error('The image exceeds the 25 MB generation transfer limit.');
  return { base64: normalized, mimeType: dataUrl ? dataUrl[1].toLowerCase() : parsed.mimeType || 'image/png', adapterId: adapter.id };
}

export function generationSizeForAspect(aspectRatio) {
  if (['2:3', '3:5', '4:5'].includes(aspectRatio)) return '1024x1536';
  if (aspectRatio === '3:2' || aspectRatio === 'A6-land') return '1536x1024';
  return 'auto';
}

export async function imageToBase64(image, options = {}) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error('The source image has no readable dimensions.');
  const maximumSide = options.maximumSide || 2048;
  const scale = Math.min(1, maximumSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = (options.canvasFactory || (() => document.createElement('canvas')))();
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0, width, height);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('The source image could not be encoded for generation.')), 'image/png');
  });
  return { base64: await blobToBase64(blob), mimeType: 'image/png', width, height };
}
