import { drawBackArt, drawBackCopy } from './back.js';
import { drawFrontArt, drawFrontCopy } from './front.js';
import { drawSplitArt, drawSplitCopy } from './split.js';
import { drawZineArt, drawZineCopy } from './zine.js';

function routeRenderer(state) {
  if (state.route === 'duplex') return state.viewMode === 'back'
    ? { art: drawBackArt, copy: drawBackCopy }
    : { art: drawFrontArt, copy: drawFrontCopy };
  if (state.route === 'back') return { art: drawBackArt, copy: drawBackCopy };
  if (state.route === 'front') return { art: drawFrontArt, copy: drawFrontCopy };
  if (state.route === 'zine') return { art: drawZineArt, copy: drawZineCopy };
  return { art: drawSplitArt, copy: drawSplitCopy };
}

export function drawRouteArt(context, dimensions, state) {
  return routeRenderer(state).art(context, dimensions, state);
}

export function drawRouteCopy(context, dimensions, state) {
  if (state.viewMode === 'base') return { copy: [], collisions: [] };
  return routeRenderer(state).copy(context, dimensions, state);
}
