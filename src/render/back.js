import { getSafeRect } from '../layout.js';
import { detectTextCollision, drawLockedText } from '../typography.js';
import { drawBrandMark, drawPaper, drawPostalMark, fontFamily, mutedInk, paperPalette } from './common.js';

function geometry(dimensions, state) {
  const safe = getSafeRect(dimensions, Math.max(state.marginSize, 0.04));
  const dividerX = safe.x + safe.width * 0.58;
  return {
    safe,
    message: { x: safe.x, y: safe.y, width: safe.width * 0.52, height: safe.height },
    recipient: { x: dividerX + safe.width * 0.05, y: safe.y, width: safe.x + safe.width - (dividerX + safe.width * 0.05), height: safe.height },
    dividerX
  };
}

export function drawBackArt(context, dimensions, state) {
  drawPaper(context, dimensions, state);
  const layout = geometry(dimensions, state);
  context.strokeStyle = mutedInk(state, 0.24);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(layout.dividerX, layout.safe.y);
  context.lineTo(layout.dividerX, layout.safe.y + layout.safe.height);
  context.stroke();

  const messageStart = layout.message.y + layout.message.height * 0.32;
  for (let index = 0; index < Math.max(4, state.writingRulesCount); index += 1) {
    const y = messageStart + index * Math.max(28, layout.message.height * 0.064);
    if (y > layout.message.y + layout.message.height - 52) break;
    context.beginPath();
    context.moveTo(layout.message.x, y);
    context.lineTo(layout.message.x + layout.message.width, y);
    context.stroke();
  }

  const stampWidth = Math.min(86, layout.recipient.width * 0.32);
  drawPostalMark(context, state, layout.recipient.x + layout.recipient.width - stampWidth, layout.recipient.y, stampWidth);

  const recipientStart = layout.recipient.y + layout.recipient.height * 0.44;
  context.strokeStyle = mutedInk(state, 0.24);
  for (let index = 0; index < 4; index += 1) {
    const y = recipientStart + index * Math.max(30, layout.recipient.height * 0.07);
    context.beginPath();
    context.moveTo(layout.recipient.x, y);
    context.lineTo(layout.recipient.x + layout.recipient.width, y);
    context.stroke();
  }
  drawBrandMark(context, state, layout.safe.x, layout.safe.y + layout.safe.height - 10, 'left');
  return { sourcePixelsUsed: false, safeArea: true };
}

export function drawBackCopy(context, dimensions, state) {
  const layout = geometry(dimensions, state);
  const ink = paperPalette(state).ink;
  const entries = [];
  let y = layout.message.y + 8;
  if (state.location) {
    const entry = drawLockedText(context, {
      field: 'location', text: state.location, x: layout.message.x, y,
      maxWidth: layout.message.width, maxHeight: 42, minFontSize: 11, maxFontSize: 17,
      lineHeight: 1.15, fontFamily: fontFamily(state, 'serif'), fontWeight: '600', color: ink
    });
    entries.push(entry);
    y += entry.bounds.height + 5;
  }
  if (state.date) {
    const entry = drawLockedText(context, {
      field: 'date', text: state.date, x: layout.message.x, y,
      maxWidth: layout.message.width, maxHeight: 34, minFontSize: 10, maxFontSize: 13,
      lineHeight: 1.15, fontFamily: fontFamily(state, 'sans'), fontWeight: '500', color: mutedInk(state, 0.72)
    });
    entries.push(entry);
    y += entry.bounds.height + 8;
  }
  if (state.caption) {
    entries.push(drawLockedText(context, {
      field: 'caption', text: state.caption, x: layout.message.x, y,
      maxWidth: layout.message.width, maxHeight: layout.message.height * 0.22,
      minFontSize: 11, maxFontSize: 19, lineHeight: 1.28,
      fontFamily: fontFamily(state, 'serif'), fontStyle: 'italic', fontWeight: '500', color: ink
    }));
  }
  return { copy: entries, collisions: detectTextCollision(entries, 3) };
}
