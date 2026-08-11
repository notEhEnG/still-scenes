import { QUALITY_STATUS, VIEW_COMPATIBILITY } from './constants.js';
import { buildSceneContract } from './scene-contract.js';
import { buildSceneIntelligence } from './scene-intelligence.js';
import { auditSourceBoundary } from './source-boundary.js';
import { hasPresetCopyLeak } from './state.js';

function result(id, label, status, detail) {
  return { id, label, status, detail };
}

function sourceCheck(state) {
  if (state.route === 'back' || (state.route === 'duplex' && state.viewMode === 'back')) {
    return result('source', 'Source', QUALITY_STATUS.NOT_APPLICABLE, 'Writable back does not require a photograph.');
  }
  if (state.transformationPath === 'distill' && state.source.kind === 'none') {
    return result('source', 'Source', QUALITY_STATUS.NOT_APPLICABLE, 'Source-free procedural distillation can use a declared Scene Contract without a loaded raster.');
  }
  if (state.imageResource && state.source.kind !== 'none') {
    return result('source', 'Source', QUALITY_STATUS.VERIFIED, 'A bounded, decoded source with known provenance is loaded.');
  }
  return result('source', 'Source', QUALITY_STATUS.WARNING, 'No source photograph is loaded; the stage uses a placeholder.');
}

function contractCheck(state) {
  const contract = buildSceneContract(state);
  const intelligence = buildSceneIntelligence(state, contract);
  const undeclared = contract.anchor === 'Undeclared scene anchor' || contract.scene_dna[0].startsWith('Scene DNA requires');
  if (undeclared) return result('contract', 'Scene Contract', QUALITY_STATUS.WARNING, 'Declare the anchor and Scene DNA for a complete contract.');
  if (!intelligence.graphValidation.valid) return result('contract', 'Scene Contract', QUALITY_STATUS.FAILED, intelligence.graphValidation.errors.join(' '));
  const graphWarning = intelligence.graphValidation.warnings.length ? ' Scene Graph warning: ' + intelligence.graphValidation.warnings.join(' ') : '';
  return result('contract', 'Scene Contract', QUALITY_STATUS.DECLARED, 'Scene Graph, locks, mutation budget, layout, and material logic are declared; visual identity is not automatically verified.' + graphWarning);
}

function copyCheck(state, diagnostics) {
  const required = ['location', 'date', 'caption'].filter((field) => state[field] !== '');
  if (!required.length || state.viewMode === 'base') {
    return result('copy', 'Locked Copy', QUALITY_STATUS.NOT_APPLICABLE, required.length ? 'Text-free base intentionally omits locked copy.' : 'No locked copy requested.');
  }
  const entries = diagnostics.copy || [];
  const missing = required.filter((field) => !entries.some((entry) => entry.field === field));
  const mismatch = entries.some((entry) => entry.source !== entry.renderedSource || (state[entry.field] !== undefined && entry.source !== state[entry.field]));
  const overflow = entries.some((entry) => entry.overflow);
  const collisions = diagnostics.collisions || [];
  if (missing.length || mismatch) return result('copy', 'Locked Copy', QUALITY_STATUS.FAILED, 'A required field was not rendered character-for-character.');
  if (overflow || collisions.length) return result('copy', 'Locked Copy', QUALITY_STATUS.WARNING, 'Copy is exact but does not fit safely without overflow or collision.');
  return result('copy', 'Locked Copy', QUALITY_STATUS.VERIFIED, 'Requested and rendered source strings match with no measured overflow or collision.');
}

function routeCheck(state, diagnostics) {
  if (!VIEW_COMPATIBILITY[state.route].includes(state.viewMode)) {
    return result('route', 'Route', QUALITY_STATUS.FAILED, 'The active view is incompatible with the selected route.');
  }
  const contract = buildSceneContract(state);
  const intelligence = buildSceneIntelligence(state, contract);
  if (state.transformationPath === 'distill' && diagnostics.sourcePixelsUsed) {
    return result('route', 'Source Boundary', QUALITY_STATUS.FAILED, 'A distilled output contains source-photo pixels.');
  }
  if (intelligence.sourceBoundary.role === 'scene-evidence') {
    const audit = auditSourceBoundary(intelligence.sourceBoundary, state.generatedResource ? {} : { sourcePixelsUsed: diagnostics.sourcePixelsUsed });
    if (audit.status === QUALITY_STATUS.FAILED) return result('route', 'Source Boundary', QUALITY_STATUS.FAILED, audit.violations.join(' '));
    if (state.generatedResource) return result('route', 'Source Boundary', QUALITY_STATUS.DECLARED, 'A returned scene-evidence image is active. Source-raster absence is declared until capable visual inspection verifies it.');
    return result('route', 'Source Boundary', QUALITY_STATUS.VERIFIED, 'The local procedural preview used no source-photo raster.');
  }
  return result('route', 'Route', QUALITY_STATUS.VERIFIED, 'The active view, renderer, brief, and prompt use the selected route.');
}

function privacyCheck(state) {
  if (hasPresetCopyLeak(state)) {
    return result('privacy', 'Privacy', QUALITY_STATUS.FAILED, 'Preset-owned copy remains attached to a user upload.');
  }
  if (state.source.kind === 'user-upload') {
    if (state.capability.imageGeneration) {
      return result('privacy', 'Privacy', QUALITY_STATUS.WARNING, 'Preset isolation is verified, but the optional endpoint gateway was enabled; the third-party endpoint privacy policy is not verified here.');
    }
    return result('privacy', 'Privacy', QUALITY_STATUS.VERIFIED, 'User upload has custom provenance, no preset-owned copy, and remains in the local composer path.');
  }
  return result('privacy', 'Privacy', QUALITY_STATUS.NOT_APPLICABLE, 'No user-owned upload is active.');
}

function exportCheck(state, dimensions, diagnostics) {
  const safe = diagnostics.safeArea !== false;
  if (!dimensions.width || !dimensions.height) return result('export', 'Export', QUALITY_STATUS.FAILED, 'Output dimensions are invalid.');
  if (!safe) return result('export', 'Export', QUALITY_STATUS.WARNING, 'At least one required element falls outside the declared safe area.');
  return result('export', 'Export', QUALITY_STATUS.VERIFIED, dimensions.width + ' × ' + dimensions.height + ' RGB pixels; bleed and CMYK are not certified.');
}

export function evaluateQuality(state, diagnostics, dimensions) {
  return [
    sourceCheck(state),
    contractCheck(state),
    copyCheck(state, diagnostics),
    routeCheck(state, diagnostics),
    privacyCheck(state),
    exportCheck(state, dimensions, diagnostics)
  ];
}
