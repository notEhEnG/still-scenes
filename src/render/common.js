import { PAPER_PALETTES } from '../constants.js';

export function fontFamily(state, role) {
  if (role === 'mono') return 'ui-monospace, SFMono-Regular, Consolas, monospace';
  if (role === 'serif') {
    if (state.fontPairing === 'typewriter') return 'ui-monospace, SFMono-Regular, Consolas, monospace';
    if (state.fontPairing === 'newsreader') return 'Charter, Georgia, serif';
    return 'Georgia, Times New Roman, serif';
  }
  return 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
}

export function paperPalette(state) {
  return PAPER_PALETTES[state.paperTone] || PAPER_PALETTES['warm-archive'];
}

export function mutedInk(state, alpha = 0.68) {
  return state.paperTone === 'charcoal'
    ? 'rgba(240,234,223,' + alpha + ')'
    : 'rgba(42,39,36,' + alpha + ')';
}

export function drawPaper(context, dimensions, state) {
  const palette = paperPalette(state);
  context.fillStyle = palette.color;
  context.fillRect(0, 0, dimensions.width, dimensions.height);
}

export function drawImageCover(context, image, rect, options = {}) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = rect.width / rect.height;
  let sourceX = 0;
  let sourceY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
    const alignment = options.alignment || 'center';
    sourceX = alignment === 'left' ? 0 : alignment === 'right' ? sourceWidth - cropWidth : (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / targetRatio;
    sourceY = options.verticalAlignment === 'top' ? 0 : options.verticalAlignment === 'bottom' ? sourceHeight - cropHeight : (sourceHeight - cropHeight) / 2;
  }
  context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, rect.x, rect.y, rect.width, rect.height);
}

function drawImageFit(context, image, rect) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(rect.width / sourceWidth, rect.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = rect.x + (rect.width - width) / 2;
  const y = rect.y + (rect.height - height) / 2;
  context.drawImage(image, x, y, width, height);
}

export function cropPolicyUsesFit(policy) {
  return String(policy || '').startsWith('fit');
}

export function drawPlaceholder(context, rect, state) {
  const palette = paperPalette(state);
  context.fillStyle = state.paperTone === 'charcoal' ? '#383a3f' : '#d8d2c8';
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  context.strokeStyle = state.accentColor;
  context.lineWidth = Math.max(1, rect.width * 0.003);
  context.beginPath();
  context.moveTo(rect.x + rect.width * 0.28, rect.y + rect.height * 0.62);
  context.lineTo(rect.x + rect.width * 0.44, rect.y + rect.height * 0.42);
  context.lineTo(rect.x + rect.width * 0.58, rect.y + rect.height * 0.55);
  context.lineTo(rect.x + rect.width * 0.72, rect.y + rect.height * 0.35);
  context.stroke();
  context.fillStyle = palette.ink;
  context.font = Math.max(11, Math.round(rect.width * 0.025)) + 'px ' + fontFamily(state, 'sans');
  context.textAlign = 'center';
  context.fillText('SELECT A PHOTOGRAPH', rect.x + rect.width / 2, rect.y + rect.height * 0.76);
}

function insetRect(rect, share) {
  const insetX = rect.width * share;
  const insetY = rect.height * share;
  return { x: rect.x + insetX, y: rect.y + insetY, width: rect.width - insetX * 2, height: rect.height - insetY * 2 };
}

export function drawSourceFreeField(context, state, rect) {
  const colors = state.paletteSamples && state.paletteSamples.length >= 4
    ? state.paletteSamples
    : ['#25272a', '#f0ede4', '#d8643b', '#6d7478'];
  context.save();
  const sceneCode = Array.from(state.sceneAnchor + ':' + state.sceneDNA)
    .reduce((sum, character) => (sum + character.codePointAt(0)) % 997, 0) / 997;
  context.beginPath();
  context.rect(rect.x, rect.y, rect.width, rect.height);
  context.clip();
  context.fillStyle = colors[1];
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  context.fillStyle = colors[3];
  context.fillRect(rect.x, rect.y + rect.height * 0.18, rect.width * 0.72, rect.height * 0.22);
  context.fillStyle = colors[0];
  context.beginPath();
  context.moveTo(rect.x, rect.y + rect.height * 0.78);
  context.quadraticCurveTo(rect.x + rect.width * 0.46, rect.y + rect.height * 0.52, rect.x + rect.width, rect.y + rect.height * 0.7);
  context.lineTo(rect.x + rect.width, rect.y + rect.height);
  context.lineTo(rect.x, rect.y + rect.height);
  context.closePath();
  context.fill();
  context.fillStyle = state.accentColor || colors[2];
  context.beginPath();
  context.arc(rect.x + rect.width * (0.68 + sceneCode * 0.14), rect.y + rect.height * (0.28 + sceneCode * 0.12), Math.max(10, rect.width * 0.065), 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export function drawPhotoTreatment(context, state, rect) {
  if (state.transformationPath === 'distill') {
    drawSourceFreeField(context, state, rect);
    return { sourcePixelsUsed: false, drawnRect: rect };
  }
  const image = state.imageResource && state.imageResource.image;
  if (!image) {
    drawPlaceholder(context, rect, state);
    return { sourcePixelsUsed: false, drawnRect: rect };
  }

  let imageRect = rect;
  context.save();
  if (state.photoTreatment === 'framed') {
    context.fillStyle = '#fffdfa';
    context.shadowColor = 'rgba(20, 18, 16, 0.12)';
    context.shadowBlur = Math.max(5, rect.width * 0.012);
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.shadowBlur = 0;
    imageRect = insetRect(rect, 0.035);
  } else if (state.photoTreatment === 'specimen') {
    context.fillStyle = 'rgba(255,255,255,0.42)';
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    imageRect = {
      x: rect.x + rect.width * 0.16,
      y: rect.y + rect.height * 0.12,
      width: rect.width * 0.68,
      height: rect.height * 0.63
    };
    context.strokeStyle = state.accentColor;
    context.lineWidth = Math.max(1, rect.width * 0.003);
    context.strokeRect(imageRect.x - 5, imageRect.y - 5, imageRect.width + 10, imageRect.height + 10);
  }

  context.beginPath();
  context.rect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);
  context.clip();

  if (state.photoTreatment === 'film') context.filter = 'sepia(0.16) saturate(0.82) contrast(0.94) brightness(1.02)';
  if (state.photoTreatment === 'halftone') context.filter = 'grayscale(0.75) contrast(1.22) saturate(0.65)';
  if (state.photoTreatment === 'silhouette') context.filter = 'grayscale(1) contrast(4.5) brightness(0.7)';
  if (cropPolicyUsesFit(state.layoutPlan?.crop_policy)) drawImageFit(context, image, imageRect);
  else drawImageCover(context, image, imageRect, { alignment: state.layoutPlan?.photo_alignment || 'center' });
  context.filter = 'none';

  if (state.photoTreatment === 'film') {
    const vignette = context.createRadialGradient(
      imageRect.x + imageRect.width / 2, imageRect.y + imageRect.height / 2, imageRect.width * 0.16,
      imageRect.x + imageRect.width / 2, imageRect.y + imageRect.height / 2, imageRect.width * 0.72
    );
    vignette.addColorStop(0, 'rgba(255,225,190,0.04)');
    vignette.addColorStop(1, 'rgba(28,20,18,0.24)');
    context.fillStyle = vignette;
    context.fillRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);
  }

  if (state.photoTreatment === 'halftone') {
    const step = Math.max(7, Math.round(imageRect.width / 95));
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = 'rgba(28,32,36,0.18)';
    for (let y = imageRect.y; y < imageRect.y + imageRect.height; y += step) {
      for (let x = imageRect.x; x < imageRect.x + imageRect.width; x += step) {
        context.beginPath();
        context.arc(x, y, step * 0.16, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  if (state.photoTreatment === 'silhouette') {
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = 'rgba(25,24,28,0.38)';
    context.fillRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);
  }
  if (state.transformationPath === 'reduce') {
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = state.accentColor + '1f';
    context.fillRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);
  }
  if (state.transformationPath === 'hybrid') {
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = state.accentColor;
    context.lineWidth = Math.max(2, imageRect.width * 0.008);
    context.beginPath();
    context.moveTo(imageRect.x + imageRect.width * 0.62, imageRect.y + imageRect.height * 0.12);
    context.lineTo(imageRect.x + imageRect.width * 0.92, imageRect.y + imageRect.height * 0.45);
    context.stroke();
  }
  context.restore();
  return { sourcePixelsUsed: true, drawnRect: imageRect };
}

export function drawPostalMark(context, state, x, y, size) {
  if (state.postalMark === 'none') return;
  context.save();
  context.strokeStyle = state.accentColor;
  context.fillStyle = state.accentColor;
  context.lineWidth = Math.max(1.25, size * 0.05);
  if (state.postalMark === 'camera') {
    context.strokeRect(x, y + size * 0.18, size, size * 0.65);
    context.beginPath();
    context.arc(x + size * 0.5, y + size * 0.5, size * 0.17, 0, Math.PI * 2);
    context.stroke();
    context.fillRect(x + size * 0.32, y, size * 0.35, size * 0.12);
  } else if (state.postalMark === 'stamp') {
    context.setLineDash([size * 0.12, size * 0.1]);
    context.strokeRect(x, y, size * 0.78, size);
  } else {
    context.beginPath();
    context.arc(x + size * 0.5, y + size * 0.5, size * 0.18, 0, Math.PI * 2);
    context.fill();
    context.fillRect(x + size * 0.7, y + size * 0.48, size * 0.62, Math.max(1, size * 0.04));
  }
  context.restore();
}

export function drawBrandMark(context, state, x, y, align = 'right') {
  context.save();
  context.fillStyle = paperPalette(state).ink;
  context.globalAlpha = 0.48;
  context.font = '600 11px ' + fontFamily(state, 'sans');
  context.textAlign = align;
  context.fillText('STILL SCENES', x, y);
  context.restore();
}
