import { computeQuietFieldShare, getSafeRect } from '../layout.js';
import { createSeededRandom } from '../textures.js';
import { detectTextCollision, drawLockedText } from '../typography.js';
import { drawPaper, drawPhotoTreatment, drawPostalMark, fontFamily, mutedInk, paperPalette } from './common.js';

function geometry(dimensions, state) {
  const safe = getSafeRect(dimensions, Math.max(0.05, state.marginSize));
  const quiet = state.layoutPlan?.quiet_field_share || computeQuietFieldShare(state);
  const clusterWidth = safe.width * Math.max(0.28, 1 - quiet);
  const clusterHeight = safe.height * (state.transformationPath === 'distill' ? 0.28 : 0.42);
  return {
    safe,
    cluster: {
      x: state.layoutPlan?.photo_alignment === 'right' ? safe.x + safe.width - Math.min(safe.width * 0.58, clusterWidth) : safe.x + safe.width * 0.08,
      y: safe.y + safe.height * 0.48,
      width: Math.min(safe.width * 0.58, clusterWidth),
      height: clusterHeight
    },
    copy: {
      x: safe.x + safe.width * 0.46,
      y: safe.y + safe.height * 0.12,
      width: safe.width * 0.5,
      height: safe.height * 0.24
    }
  };
}

function drawDistilledCluster(context, state, rect) {
  const colors = state.paletteSamples && state.paletteSamples.length >= 4
    ? state.paletteSamples
    : ['#25272a', '#f0ede4', '#d8643b', '#6d7478'];
  const random = createSeededRandom(state.documentSeed + ':' + state.textureRevision + ':' + state.sceneAnchor + ':' + state.sceneDNA);
  context.save();
  context.translate(rect.x, rect.y);

  context.fillStyle = colors[0];
  context.beginPath();
  context.moveTo(0, rect.height * 0.76);
  context.bezierCurveTo(rect.width * 0.22, rect.height * (0.52 + random() * 0.12), rect.width * 0.64, rect.height * 0.84, rect.width, rect.height * 0.58);
  context.lineTo(rect.width, rect.height);
  context.lineTo(0, rect.height);
  context.closePath();
  context.fill();

  context.fillStyle = colors[3];
  context.globalAlpha = 0.86;
  context.fillRect(rect.width * 0.08, rect.height * 0.2, rect.width * 0.58, rect.height * 0.22);

  context.globalAlpha = 1;
  context.fillStyle = state.accentColor || colors[2];
  context.beginPath();
  context.arc(rect.width * (0.72 + random() * 0.08), rect.height * 0.3, Math.max(12, rect.width * 0.07), 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = colors[0];
  context.lineWidth = Math.max(2, rect.width * 0.012);
  context.beginPath();
  context.moveTo(rect.width * 0.2, rect.height * 0.12);
  context.quadraticCurveTo(rect.width * 0.42, rect.height * 0.38, rect.width * 0.5, rect.height * 0.72);
  context.stroke();
  context.restore();
}

export function drawZineArt(context, dimensions, state) {
  drawPaper(context, dimensions, state);
  const layout = geometry(dimensions, state);
  if (state.transformationPath === 'distill') {
    drawDistilledCluster(context, state, layout.cluster);
    drawPostalMark(context, state, layout.safe.x + layout.safe.width - 26, layout.safe.y + layout.safe.height - 32, 22);
    return { sourcePixelsUsed: false, safeArea: true, proceduralDistillation: true };
  }

  const photo = drawPhotoTreatment(context, state, layout.cluster);
  if (state.transformationPath === 'hybrid') {
    context.strokeStyle = state.accentColor;
    context.lineWidth = Math.max(2, dimensions.width * 0.004);
    context.beginPath();
    context.moveTo(layout.cluster.x + layout.cluster.width * 0.72, layout.cluster.y + layout.cluster.height * 0.18);
    context.lineTo(layout.safe.x + layout.safe.width * 0.86, layout.safe.y + layout.safe.height * 0.38);
    context.stroke();
  }
  if (state.transformationPath === 'reduce') {
    context.fillStyle = state.accentColor + '33';
    context.fillRect(layout.cluster.x + layout.cluster.width * 0.58, layout.cluster.y - 12, layout.cluster.width * 0.35, 24);
  }
  drawPostalMark(context, state, layout.safe.x + layout.safe.width - 26, layout.safe.y + layout.safe.height - 32, 22);
  return { sourcePixelsUsed: photo.sourcePixelsUsed, safeArea: true, proceduralDistillation: false };
}

export function drawZineCopy(context, dimensions, state) {
  const layout = geometry(dimensions, state);
  const ink = paperPalette(state).ink;
  const entries = [];
  let y = layout.copy.y;
  if (state.caption) {
    const entry = drawLockedText(context, {
      field: 'caption', text: state.caption, x: layout.copy.x, y,
      maxWidth: layout.copy.width, maxHeight: layout.copy.height * 0.66,
      minFontSize: 12, maxFontSize: 27, lineHeight: 1.24,
      fontFamily: fontFamily(state, 'serif'), fontStyle: 'italic', fontWeight: '500', color: ink
    });
    entries.push(entry);
    y += entry.bounds.height + 10;
  }
  if (state.location) {
    const entry = drawLockedText(context, {
      field: 'location', text: state.location, x: layout.copy.x, y,
      maxWidth: layout.copy.width, maxHeight: 32, minFontSize: 9, maxFontSize: 12,
      lineHeight: 1.15, fontFamily: fontFamily(state, 'sans'), fontWeight: '600', color: ink
    });
    entries.push(entry);
    y += entry.bounds.height + 4;
  }
  if (state.date) {
    entries.push(drawLockedText(context, {
      field: 'date', text: state.date, x: layout.copy.x, y,
      maxWidth: layout.copy.width, maxHeight: 32, minFontSize: 9, maxFontSize: 12,
      lineHeight: 1.15, fontFamily: fontFamily(state, 'mono'), fontWeight: '500', color: mutedInk(state, 0.72)
    }));
  }
  return { copy: entries, collisions: detectTextCollision(entries, 3) };
}
