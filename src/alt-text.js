import { getOrientation } from './layout.js';

function copyDescription(state) {
  const parts = [];
  if (state.caption) parts.push('captioned ' + JSON.stringify(state.caption));
  if (state.location) parts.push('with location ' + JSON.stringify(state.location));
  if (state.date) parts.push('and date ' + JSON.stringify(state.date));
  return parts.length ? ', ' + parts.join(' ') : ', with no locked copy';
}

export function buildAltText(state) {
  const orientation = getOrientation(state.aspectRatio);
  const source = state.source.description || 'an empty image placeholder';
  const copy = copyDescription(state);

  if (state.route === 'split') {
    return orientation + ' split paper composition with ' + source + ' beside a writing field' + copy + '.';
  }
  if (state.route === 'front') {
    return orientation + ' image-led paper front featuring ' + source + copy + '.';
  }
  if (state.route === 'back') {
    return orientation + ' writable paper back with message rules, recipient lines, and a decorative empty stamp frame' + copy + '.';
  }
  if (state.route === 'duplex') {
    const side = state.viewMode === 'back' ? 'writable back' : 'image-led front';
    return orientation + ' duplex pair preview showing the ' + side + copy + '.';
  }
  if (state.transformationPath === 'distill') {
    return orientation + ' source-free scene-zine abstraction built from declared scene geometry and sampled colors' + copy + '.';
  }
  return orientation + ' scene-zine composition using ' + source + ' through the ' + state.transformationPath + ' path' + copy + '.';
}
