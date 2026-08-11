import { CANVAS_PROFILES, VIEW_COMPATIBILITY } from './constants.js';

export function getCanvasProfile(aspectRatio) {
  const profile = CANVAS_PROFILES[aspectRatio] || CANVAS_PROFILES['3:2'];
  return { ...profile };
}

export function getOrientation(aspectRatio) {
  const profile = getCanvasProfile(aspectRatio);
  return profile.height > profile.width ? 'portrait' : 'landscape';
}

export function isViewCompatible(route, viewMode) {
  return Boolean(VIEW_COMPATIBILITY[route] && VIEW_COMPATIBILITY[route].includes(viewMode));
}

export function getPrintSpecification(aspectRatio) {
  const profile = getCanvasProfile(aspectRatio);
  if (!profile.physical) {
    return {
      width: profile.width,
      height: profile.height,
      physicalSize: null,
      ppi: null,
      label: 'digital RGB raster; no physical size or PPI declared'
    };
  }
  return {
    width: profile.width,
    height: profile.height,
    physicalSize: profile.physical.widthMm + ' × ' + profile.physical.heightMm + ' mm',
    ppi: profile.physical.ppi,
    label: 'print-sized RGB; CMYK, bleed, and printer proofing are not included'
  };
}

export function getSafeRect(dimensions, marginSize) {
  const inset = Math.max(1, Math.round(Math.min(dimensions.width, dimensions.height) * marginSize));
  return {
    x: inset,
    y: inset,
    width: dimensions.width - inset * 2,
    height: dimensions.height - inset * 2
  };
}

export function computeQuietFieldShare(state) {
  if (Number.isFinite(state.layoutPlan?.quiet_field_share)) return state.layoutPlan.quiet_field_share;
  const base = {
    split: 0.43,
    front: 0.18,
    back: 0.58,
    duplex: state.viewMode === 'back' ? 0.58 : 0.18,
    zine: 0.68
  }[state.route] || 0.3;
  const copyPenalty = Math.min(0.12, (state.caption.length + state.location.length + state.date.length) / 1200);
  const densityAdjustment = ['city', 'foliage'].includes(state.subjectCategory) ? 0.04 : 0;
  return Math.max(0.12, Math.min(0.88, base - densityAdjustment + copyPenalty));
}

export function rectanglesOverlap(a, b, padding = 0) {
  return !(
    a.x + a.width + padding <= b.x ||
    b.x + b.width + padding <= a.x ||
    a.y + a.height + padding <= b.y ||
    b.y + b.height + padding <= a.y
  );
}

export function isInsideRect(inner, outer) {
  return inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height;
}

export function duplexProfilesMatch(frontProfile, backProfile) {
  return frontProfile.width === backProfile.width && frontProfile.height === backProfile.height;
}
