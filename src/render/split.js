import { getSafeRect } from '../layout.js';
import { detectTextCollision, drawLockedText } from '../typography.js';
import { drawBrandMark, drawPaper, drawPhotoTreatment, drawPostalMark, fontFamily, mutedInk, paperPalette } from './common.js';

function geometry(dimensions, state) {
  const safe = getSafeRect(dimensions, state.marginSize);
  const photoWidth = safe.width * state.splitRatio;
  const gutter = safe.width * 0.045;
  return {
    safe,
    photo: { x: safe.x, y: safe.y, width: photoWidth, height: safe.height },
    copy: { x: safe.x + photoWidth + gutter, y: safe.y, width: safe.width - photoWidth - gutter, height: safe.height }
  };
}

export function drawSplitArt(context, dimensions, state) {
  drawPaper(context, dimensions, state);
  const layout = geometry(dimensions, state);
  const photo = drawPhotoTreatment(context, state, layout.photo);
  drawPostalMark(context, state, layout.copy.x + layout.copy.width - 42, layout.copy.y + 6, 30);
  context.strokeStyle = mutedInk(state, 0.2);
  context.lineWidth = 1;
  const ruleStart = layout.copy.y + layout.copy.height * 0.48;
  const spacing = Math.max(24, layout.copy.height * 0.055);
  for (let index = 0; index < state.writingRulesCount; index += 1) {
    const y = ruleStart + index * spacing;
    if (y > layout.copy.y + layout.copy.height - 48) break;
    context.beginPath();
    context.moveTo(layout.copy.x, y);
    context.lineTo(layout.copy.x + layout.copy.width, y);
    context.stroke();
  }
  const footerY = layout.copy.y + layout.copy.height - 24;
  context.beginPath();
  context.moveTo(layout.copy.x, footerY);
  context.lineTo(layout.copy.x + layout.copy.width, footerY);
  context.stroke();
  drawBrandMark(context, state, layout.copy.x + layout.copy.width, footerY - 8);
  return { sourcePixelsUsed: photo.sourcePixelsUsed, safeArea: true };
}

export function drawSplitCopy(context, dimensions, state) {
  const layout = geometry(dimensions, state);
  const ink = paperPalette(state).ink;
  const entries = [];
  let y = layout.copy.y + 8;
  const headerWidth = Math.max(80, layout.copy.width - 58);

  if (state.location) {
    const entry = drawLockedText(context, {
      field: 'location', text: state.location, x: layout.copy.x, y,
      maxWidth: headerWidth, maxHeight: 54, minFontSize: 12, maxFontSize: 20,
      lineHeight: 1.15, fontFamily: fontFamily(state, 'serif'), fontStyle: 'italic', fontWeight: '600', color: ink
    });
    entries.push(entry);
    y += entry.bounds.height + 8;
  }
  if (state.date) {
    const entry = drawLockedText(context, {
      field: 'date', text: state.date, x: layout.copy.x, y,
      maxWidth: headerWidth, maxHeight: 38, minFontSize: 10, maxFontSize: 14,
      lineHeight: 1.15, fontFamily: fontFamily(state, 'sans'), fontWeight: '500', color: mutedInk(state, 0.72)
    });
    entries.push(entry);
    y += entry.bounds.height + 16;
  }
  if (state.caption) {
    const entry = drawLockedText(context, {
      field: 'caption', text: state.caption, x: layout.copy.x, y,
      maxWidth: layout.copy.width, maxHeight: layout.copy.height * 0.24,
      minFontSize: 12, maxFontSize: 23, lineHeight: 1.24,
      fontFamily: fontFamily(state, 'serif'), fontStyle: 'italic', fontWeight: '500', color: ink
    });
    entries.push(entry);
  }
  return { copy: entries, collisions: detectTextCollision(entries, 3) };
}
