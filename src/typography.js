function tokenize(value) {
  if (value === '') return [];
  const spaced = value.match(/\S+\s*/gu);
  if (spaced && spaced.length > 1) return spaced;
  return Array.from(value);
}

function breakToken(token, measure, maxWidth) {
  const parts = [];
  let current = '';
  Array.from(token).forEach((character) => {
    const candidate = current + character;
    if (current && measure(candidate) > maxWidth) {
      parts.push(current);
      current = character;
    } else {
      current = candidate;
    }
  });
  if (current) parts.push(current);
  return parts;
}

export function wrapLockedText(value, measure, maxWidth) {
  const source = String(value);
  if (!source) return [''];
  const lines = [];

  source.split('\n').forEach((paragraph) => {
    if (paragraph === '') {
      lines.push('');
      return;
    }

    let line = '';
    tokenize(paragraph).forEach((token) => {
      const candidate = line + token;
      if (!line || measure(candidate) <= maxWidth) {
        line = candidate;
        return;
      }

      lines.push(line.replace(/\s+$/u, ''));
      if (measure(token) <= maxWidth) {
        line = token.replace(/^\s+/u, '');
        return;
      }

      const pieces = breakToken(token, measure, maxWidth);
      pieces.slice(0, -1).forEach((piece) => lines.push(piece));
      line = pieces[pieces.length - 1] || '';
    });
    lines.push(line.replace(/\s+$/u, ''));
  });

  return lines;
}

function buildFont(options, size) {
  const style = options.fontStyle || 'normal';
  const weight = options.fontWeight || '400';
  return style + ' ' + weight + ' ' + size + 'px ' + options.fontFamily;
}

export function fitLockedText(context, options) {
  const source = String(options.text);
  const minSize = options.minFontSize || 12;
  const maxSize = options.maxFontSize || 28;
  const lineHeightRatio = options.lineHeight || 1.25;
  let best = null;

  for (let size = maxSize; size >= minSize; size -= 1) {
    context.font = buildFont(options, size);
    const lines = wrapLockedText(source, (value) => context.measureText(value).width, options.maxWidth);
    const lineHeight = Math.round(size * lineHeightRatio);
    const height = Math.max(lineHeight, lines.length * lineHeight);
    const widest = lines.reduce((result, line) => Math.max(result, context.measureText(line).width), 0);
    const candidate = { source, lines, fontSize: size, lineHeight, width: widest, height };
    best = candidate;
    if (height <= options.maxHeight && widest <= options.maxWidth) {
      return { ...candidate, overflow: false };
    }
  }

  return { ...best, overflow: true };
}

export function measureLockedText(context, options) {
  return fitLockedText(context, options);
}

export function drawLockedText(context, options) {
  const fit = fitLockedText(context, options);
  context.save();
  context.font = buildFont(options, fit.fontSize);
  context.fillStyle = options.color;
  context.textAlign = options.align || 'left';
  context.textBaseline = 'top';

  fit.lines.forEach((line, index) => {
    context.fillText(line, options.x, options.y + index * fit.lineHeight);
  });
  context.restore();

  const boundsX = options.align === 'right' ? options.x - fit.width : options.x;
  return {
    field: options.field || 'copy',
    source: fit.source,
    renderedSource: fit.source,
    lines: fit.lines,
    fontSize: fit.fontSize,
    overflow: fit.overflow,
    bounds: { x: boundsX, y: options.y, width: fit.width, height: fit.height }
  };
}

export function detectTextOverflow(measurement) {
  return Boolean(measurement && measurement.overflow);
}

export function detectTextCollision(entries, padding = 0) {
  const collisions = [];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const a = entries[left].bounds;
      const b = entries[right].bounds;
      const overlap = !(
        a.x + a.width + padding <= b.x || b.x + b.width + padding <= a.x ||
        a.y + a.height + padding <= b.y || b.y + b.height + padding <= a.y
      );
      if (overlap) collisions.push([entries[left].field, entries[right].field]);
    }
  }
  return collisions;
}
