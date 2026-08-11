import { getSafeRect } from '../layout.js';
import { detectTextCollision, drawLockedText } from '../typography.js';
import { drawPaper, drawPhotoTreatment, drawPostalMark, fontFamily, mutedInk, paperPalette } from './common.js';

function geometry(dimensions, state) {
  const safe = getSafeRect(dimensions, state.marginSize);
  const band = Math.max(110, safe.height * 0.18);
  return {
    safe,
    photo: { x: safe.x, y: safe.y, width: safe.width, height: safe.height - band - 16 },
    band: { x: safe.x, y: safe.y + safe.height - band, width: safe.width, height: band }
  };
}

export function drawFrontArt(context, dimensions, state) {
  drawPaper(context, dimensions, state);
  const layout = geometry(dimensions, state);
  const photo = drawPhotoTreatment(context, state, layout.photo);
  context.fillStyle = state.accentColor;
  context.fillRect(layout.band.x, layout.band.y + layout.band.height - 8, Math.min(96, layout.band.width * 0.16), 4);
  drawPostalMark(context, state, layout.photo.x + layout.photo.width - 30, layout.photo.y + 8, 22);
  return { sourcePixelsUsed: photo.sourcePixelsUsed, safeArea: true };
}

export function drawFrontCopy(context, dimensions, state) {
  const layout = geometry(dimensions, state);
  const ink = paperPalette(state).ink;
  const entries = [];
  if (state.caption) {
    entries.push(drawLockedText(context, {
      field: 'caption', text: state.caption, x: layout.band.x, y: layout.band.y + 12,
      maxWidth: layout.band.width * 0.64, maxHeight: layout.band.height - 28,
      minFontSize: 12, maxFontSize: 25, lineHeight: 1.2,
      fontFamily: fontFamily(state, 'serif'), fontStyle: 'italic', fontWeight: '500', color: ink
    }));
  }
  let metadataY = layout.band.y + 12;
  if (state.location) {
    const entry = drawLockedText(context, {
      field: 'location', text: state.location, x: layout.band.x + layout.band.width, y: metadataY,
      maxWidth: layout.band.width * 0.32, maxHeight: (layout.band.height - 26) / 2,
      minFontSize: 9, maxFontSize: 13, lineHeight: 1.15,
      fontFamily: fontFamily(state, 'sans'), fontWeight: '600', color: mutedInk(state, 0.78), align: 'right'
    });
    entries.push(entry);
    metadataY += entry.bounds.height + 5;
  }
  if (state.date) {
    entries.push(drawLockedText(context, {
      field: 'date', text: state.date, x: layout.band.x + layout.band.width, y: metadataY,
      maxWidth: layout.band.width * 0.32, maxHeight: (layout.band.height - 26) / 2,
      minFontSize: 9, maxFontSize: 12, lineHeight: 1.15,
      fontFamily: fontFamily(state, 'sans'), fontWeight: '500', color: mutedInk(state, 0.68), align: 'right'
    }));
  }
  return { copy: entries, collisions: detectTextCollision(entries, 4) };
}
