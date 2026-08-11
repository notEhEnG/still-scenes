import { UPLOAD_LIMITS } from './constants.js';

export class ImageValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ImageValidationError';
    this.code = code;
  }
}

export function validateFileDescriptor(file, limits = UPLOAD_LIMITS) {
  if (!file || typeof file.size !== 'number') {
    throw new ImageValidationError('missing-file', 'Choose a JPEG, PNG, WebP, or supported AVIF image.');
  }
  if (file.size <= 0) throw new ImageValidationError('empty-file', 'The selected file is empty.');
  if (file.size > limits.maxBytes) {
    throw new ImageValidationError('file-too-large', 'The image exceeds the ' + Math.round(limits.maxBytes / 1024 / 1024) + ' MB upload limit.');
  }
  if (!limits.allowedTypes.includes(file.type)) {
    throw new ImageValidationError('unsupported-mime', 'Unsupported image type. Use JPEG, PNG, WebP, or a browser-supported AVIF.');
  }
  return true;
}

function ascii(bytes, start, end) {
  return String.fromCharCode(...bytes.slice(start, end));
}

export function sniffImageType(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 4) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === 'ftyp') {
    const brand = ascii(bytes, 8, 12);
    if (['avif', 'avis', 'mif1'].includes(brand)) return 'image/avif';
  }
  return null;
}

export function validateImageSignature(declaredType, input) {
  const detected = sniffImageType(input);
  if (!detected) throw new ImageValidationError('invalid-signature', 'The file contents are not a supported image.');
  if (detected !== declaredType && !(declaredType === 'image/avif' && detected === 'image/avif')) {
    throw new ImageValidationError('mime-mismatch', 'The file extension or MIME type does not match its image contents.');
  }
  return detected;
}

export function validateDecodedDimensions(width, height, limits = UPLOAD_LIMITS) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new ImageValidationError('decode-failed', 'The browser could not decode valid image dimensions.');
  }
  if (width > limits.maxWidth || height > limits.maxHeight || width * height > limits.maxPixels) {
    throw new ImageValidationError('pixel-limit', 'The decoded image is too large. Use an image under ' + limits.maxPixels.toLocaleString() + ' pixels and ' + limits.maxWidth + ' px per side.');
  }
  return true;
}

function loadHtmlImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageValidationError('decode-failed', 'The browser could not decode this image.'));
    image.src = url;
  });
}

function dimensionsOf(image) {
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
}

export function sampleImagePalette(image) {
  try {
    const sample = document.createElement('canvas');
    sample.width = 24;
    sample.height = 24;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, 24, 24);
    const data = context.getImageData(0, 0, 24, 24).data;
    const buckets = [[], [], [], []];
    for (let index = 0; index < data.length; index += 16) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const lightness = (red + green + blue) / 3;
      const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
      const bucket = lightness < 70 ? 0 : lightness > 190 ? 1 : saturation > 60 ? 2 : 3;
      buckets[bucket].push([red, green, blue]);
    }
    return buckets.map((values, bucketIndex) => {
      if (!values.length) return ['#25272a', '#f0ede4', '#d8643b', '#6d7478'][bucketIndex];
      const total = values.reduce((sum, value) => [sum[0] + value[0], sum[1] + value[1], sum[2] + value[2]], [0, 0, 0]);
      const rgb = total.map((value) => Math.round(value / values.length));
      return '#' + rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
    });
  } catch {
    return ['#25272a', '#f0ede4', '#d8643b', '#6d7478'];
  }
}

export async function loadUserImage(file, limits = UPLOAD_LIMITS) {
  validateFileDescriptor(file, limits);
  const header = await file.slice(0, 32).arrayBuffer();
  validateImageSignature(file.type, header);

  let image;
  let objectUrl = '';
  try {
    if (typeof createImageBitmap === 'function') {
      image = await createImageBitmap(file);
    } else {
      objectUrl = URL.createObjectURL(file);
      image = await loadHtmlImage(objectUrl);
    }
    const dimensions = dimensionsOf(image);
    validateDecodedDimensions(dimensions.width, dimensions.height, limits);
    const palette = sampleImagePalette(image);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    return {
      image,
      width: dimensions.width,
      height: dimensions.height,
      type: file.type,
      name: file.name || 'untitled-image',
      palette,
      release() {
        if (typeof image.close === 'function') image.close();
      }
    };
  } catch (error) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (image && typeof image.close === 'function') image.close();
    if (error instanceof ImageValidationError) throw error;
    throw new ImageValidationError('decode-failed', 'The browser could not safely decode this image.');
  }
}

export async function loadPresetImage(path) {
  const image = await loadHtmlImage(path);
  const dimensions = dimensionsOf(image);
  return {
    image,
    width: dimensions.width,
    height: dimensions.height,
    type: 'image/png',
    name: path.split('/').pop(),
    palette: sampleImagePalette(image),
    release() {}
  };
}

export function releaseImageResource(resource) {
  if (resource && typeof resource.release === 'function') resource.release();
}
