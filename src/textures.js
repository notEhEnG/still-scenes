export function hashSeed(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seedValue) {
  let state = hashSeed(seedValue) || 1;
  return function next() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function textureAlpha(type) {
  return {
    subtle: 0.06,
    film: 0.1,
    risograph: 0.12,
    clean: 0
  }[type] || 0.06;
}

export class TextureCache {
  constructor() {
    this.layers = new Map();
  }

  get(width, height, type, seed) {
    const key = [width, height, type, seed].join(':');
    if (this.layers.has(key)) return this.layers.get(key);
    const layer = this.create(width, height, type, seed);
    this.layers.set(key, layer);
    if (this.layers.size > 8) {
      const oldest = this.layers.keys().next().value;
      this.layers.delete(oldest);
    }
    return layer;
  }

  create(width, height, type, seed) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    if (type === 'clean') return canvas;

    const context = canvas.getContext('2d');
    const random = createSeededRandom(seed + ':' + type);
    const alpha = textureAlpha(type);
    context.save();

    const fiberCount = Math.max(120, Math.round(width * height / 6500));
    for (let index = 0; index < fiberCount; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const length = 2 + random() * (type === 'film' ? 3 : 14);
      context.strokeStyle = 'rgba(40, 35, 31,' + (alpha * (0.25 + random() * 0.6)).toFixed(3) + ')';
      context.lineWidth = type === 'risograph' ? 1.2 : 0.55;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + length, y + (random() - 0.5) * 2);
      context.stroke();
    }

    if (type === 'film' || type === 'risograph') {
      const dotCount = Math.max(180, Math.round(width * height / 4200));
      for (let index = 0; index < dotCount; index += 1) {
        context.fillStyle = 'rgba(25, 23, 21,' + (alpha * (0.25 + random() * 0.55)).toFixed(3) + ')';
        const size = type === 'risograph' ? 1 + random() * 1.8 : 0.5 + random();
        context.fillRect(random() * width, random() * height, size, size);
      }
    }
    context.restore();
    return canvas;
  }
}
