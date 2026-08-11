import { PRESETS } from './constants.js';
import { announce, copyTextFromElement, createModalController, setupTabs } from './accessibility.js';
import { buildAltText } from './alt-text.js';
import { exportCanvasPNGWithProvenance } from './export-provenance.js';
import { exportCanvasPrintPdf } from './export-print.js';
import { base64ToBlob, generationSizeForAspect, imageToBase64, validateEndpoint } from './generate.js';
import { ImageValidationError, loadPresetImage, loadUserImage, releaseImageResource } from './image-loader.js';
import { getCanvasProfile, getPrintSpecification, getSafeRect, isInsideRect } from './layout.js';
import { buildCreationBrief, compilePrompt, serializeCreationBrief } from './prompt-compiler.js';
import { createProvenanceRecord, provenanceJson, sha256Bytes } from './provenance.js';
import { evaluateQuality } from './quality.js';
import { drawRouteArt, drawRouteCopy } from './render/index.js';
import { buildSceneContract } from './scene-contract.js';
import { buildSceneIntelligence } from './scene-intelligence.js';
import { applyVerificationToSceneDelta } from './scene-delta.js';
import { auditSourceBoundary } from './source-boundary.js';
import {
  applyPreset,
  clearGeneratedState,
  compatibleViews,
  createInitialState,
  leavePresetForCustom,
  listPresets,
  normalizeViewForRoute,
  setRoute,
  setTransformationPath,
  transitionToUserUpload,
  updateCopyField,
  updateSceneField
} from './state.js';
import { TextureCache } from './textures.js';
import { verifyImages, verifyOutputWithoutSource } from './verify.js';

const byId = (id) => document.getElementById(id);

function createSessionSeed() {
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const values = new Uint32Array(2);
    window.crypto.getRandomValues(values);
    return 'session-' + values[0].toString(16) + values[1].toString(16);
  }
  return 'session-' + Date.now().toString(36);
}

const state = createInitialState(createSessionSeed());
const canvas = byId('studioCanvas');
const context = canvas.getContext('2d');
const artLayer = document.createElement('canvas');
const textureCache = new TextureCache();
let artCacheKey = '';
let artDiagnostics = { sourcePixelsUsed: false, safeArea: true };
let lastDiagnostics = { sourcePixelsUsed: false, safeArea: true, copy: [], collisions: [] };
let renderFrame = 0;
let presetRequest = 0;
let generationRequest = 0;
let generationGateway = null;
let pendingGeneration = null;
let lastProvenanceRecord = null;

function effectiveRenderState(snapshot = state) {
  const contract = buildSceneContract(snapshot);
  const intelligence = buildSceneIntelligence(snapshot, contract);
  const materialTreatment = ['framed', 'film', 'specimen', 'halftone', 'silhouette'].includes(intelligence.materialLogic.treatment)
    ? intelligence.materialLogic.treatment
    : snapshot.photoTreatment;
  const planned = { ...snapshot, layoutPlan: intelligence.layoutPlan, materialLogic: intelligence.materialLogic, photoTreatment: materialTreatment };
  if (!snapshot.generatedResource) return planned;
  return {
    ...planned,
    imageResource: snapshot.generatedResource,
    transformationPath: snapshot.transformationPath === 'distill' ? 'preserve' : snapshot.transformationPath,
    source: { ...snapshot.source, description: 'an AI-generated or returned transformation' }
  };
}

function artKey() {
  const copyLength = state.caption.length + state.location.length + state.date.length;
  const effectiveView = state.route === 'duplex' ? state.viewMode : state.route === 'back' ? 'back' : 'front';
  return JSON.stringify({
    route: state.route,
    effectiveView,
    aspectRatio: state.aspectRatio,
    splitRatio: state.splitRatio,
    marginSize: state.marginSize,
    transformationPath: state.transformationPath,
    reductionLevel: state.reductionLevel,
    subjectCategory: state.subjectCategory,
    photoTreatment: state.photoTreatment,
    paperTone: state.paperTone,
    accentColor: state.accentColor,
    accentReason: state.accentReason,
    postalMark: state.postalMark,
    printTexture: state.printTexture,
    writingRulesCount: state.writingRulesCount,
    source: state.source.filename + ':' + state.source.loadedAt,
    generated: state.generatedResource ? state.generatedResource.name + ':' + state.generatedAt : '',
    sceneAnchor: state.sceneAnchor,
    sceneDNA: state.sceneDNA,
    sceneRelationships: state.sceneRelationships,
    sceneFocalPosition: state.sceneFocalPosition,
    sceneDirection: state.sceneDirection,
    sceneGazeDirection: state.sceneGazeDirection,
    sceneDensity: state.sceneDensity,
    strongHorizon: state.strongHorizon,
    quietField: state.quietField,
    sourceRole: state.sourceRole,
    mutationProfile: state.mutationProfile,
    materialPreference: state.materialPreference,
    palette: state.paletteSamples,
    copyDensityBucket: Math.floor(copyLength / 80),
    documentSeed: state.documentSeed,
    textureRevision: state.textureRevision
  });
}

function applyTexture(targetContext, dimensions, targetState) {
  if (targetState.printTexture === 'clean') return;
  const seed = targetState.documentSeed + ':' + targetState.textureRevision;
  const texture = textureCache.get(dimensions.width, dimensions.height, targetState.printTexture, seed);
  targetContext.save();
  targetContext.globalCompositeOperation = 'multiply';
  targetContext.drawImage(texture, 0, 0);
  targetContext.restore();
}

function rebuildArtLayer(dimensions) {
  artLayer.width = dimensions.width;
  artLayer.height = dimensions.height;
  const artContext = artLayer.getContext('2d');
  artContext.clearRect(0, 0, dimensions.width, dimensions.height);
  const renderState = effectiveRenderState();
  artDiagnostics = drawRouteArt(artContext, dimensions, renderState);
  if (state.generatedResource && state.transformationPath === 'distill') {
    artDiagnostics = { ...artDiagnostics, sourcePixelsUsed: false, generatedDistillation: true };
  }
  applyTexture(artContext, dimensions, renderState);
  artCacheKey = artKey();
}

function renderNow() {
  renderFrame = 0;
  const profile = getCanvasProfile(state.aspectRatio);
  const dimensions = { width: profile.width, height: profile.height };
  if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) {
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
  }
  if (artCacheKey !== artKey() || artLayer.width !== dimensions.width || artLayer.height !== dimensions.height) {
    rebuildArtLayer(dimensions);
  }

  context.clearRect(0, 0, dimensions.width, dimensions.height);
  context.drawImage(artLayer, 0, 0);
  const copyDiagnostics = drawRouteCopy(context, dimensions, state);
  const safeRect = getSafeRect(dimensions, state.marginSize);
  const copyInsideSafeArea = (copyDiagnostics.copy || []).every((entry) => isInsideRect(entry.bounds, safeRect));
  lastDiagnostics = { ...artDiagnostics, ...copyDiagnostics, safeArea: artDiagnostics.safeArea !== false && copyInsideSafeArea };

  updateInspector();
  updateQuality(dimensions);
  updateCanvasDescription();
  updateDimensionLabel(dimensions);
}

function scheduleRender() {
  lastProvenanceRecord = null;
  byId('codeProvenance').textContent = '';
  if (renderFrame) return;
  renderFrame = window.requestAnimationFrame(renderNow);
}

function renderStandalone(viewMode) {
  const profile = getCanvasProfile(state.aspectRatio);
  const output = document.createElement('canvas');
  output.width = profile.width;
  output.height = profile.height;
  const outputContext = output.getContext('2d');
  const snapshot = effectiveRenderState({ ...state, viewMode });
  drawRouteArt(outputContext, { width: profile.width, height: profile.height }, snapshot);
  applyTexture(outputContext, { width: profile.width, height: profile.height }, snapshot);
  drawRouteCopy(outputContext, { width: profile.width, height: profile.height }, snapshot);
  return output;
}

function updateInspector() {
  const brief = buildCreationBrief(state);
  const intelligence = buildSceneIntelligence(state, brief.scene_contract);
  const boundaryEvidence = !state.generatedResource && intelligence.sourceBoundary.role === 'scene-evidence'
    ? { sourcePixelsUsed: lastDiagnostics.sourcePixelsUsed }
    : {};
  const sourceAudit = auditSourceBoundary(intelligence.sourceBoundary, boundaryEvidence);
  const observedDelta = applyVerificationToSceneDelta(intelligence.sceneDelta, state.verificationReport, sourceAudit);
  const artDirection = { ...intelligence.artDirection, scene_delta: observedDelta, source_boundary_audit: sourceAudit };
  byId('codeBrief').textContent = serializeCreationBrief(state);
  byId('codePrompt').textContent = compilePrompt(state);
  byId('codeArtDirection').textContent = JSON.stringify(artDirection, null, 2);
  byId('codeAlt').textContent = buildAltText(state);
}

function updateQuality(dimensions) {
  evaluateQuality(state, lastDiagnostics, dimensions).forEach((gate) => {
    const element = byId('gate' + gate.id.charAt(0).toUpperCase() + gate.id.slice(1));
    if (!element) return;
    element.className = 'gate-pill gate-' + gate.status;
    const label = gate.status === 'not-applicable' ? 'N/A' : gate.status.toUpperCase();
    element.textContent = gate.label.toUpperCase() + ' · ' + label;
    element.title = gate.detail;
  });
}

function verificationDetail(check, kind) {
  if (!check || check.unavailable) return check?.method || 'Not run.';
  const confidence = Math.round((check.confidence || 0) * 100) + '% confidence';
  if (kind === 'palette') return 'distance ' + check.distance + ' · ' + confidence;
  if (kind === 'structure') return 'dHash distance ' + check.hammingDistance + '/64 · ' + confidence;
  return check.actual + ' · expected ' + check.expected + ' · ' + confidence;
}

function setVerificationRow(id, check, kind) {
  const element = byId(id);
  const status = check?.status || 'warning';
  element.className = 'verification-row verification-' + status;
  const label = status === 'not-applicable' ? 'N/A' : status.toUpperCase();
  element.textContent = label + ' · ' + verificationDetail(check, kind);
}

function updateLockFamilyReport(lockFamilies = null) {
  const container = byId('verificationLockFamilies');
  container.replaceChildren();
  if (!lockFamilies) {
    const item = document.createElement('li');
    item.textContent = 'Lock families have not been compared.';
    container.append(item);
    return;
  }
  Object.entries(lockFamilies).forEach(([name, check]) => {
    const item = document.createElement('li');
    item.className = 'verification-' + check.status;
    const label = check.status === 'not-applicable' ? 'N/A' : check.status.toUpperCase();
    item.textContent = name.replace(/([A-Z])/g, ' $1') + ': ' + label + ' — ' + check.evidence;
    container.append(item);
  });
}

function updateVerificationPanel() {
  const report = state.verificationReport;
  const overall = byId('verificationOverall');
  byId('btnClearGenerated').hidden = !state.generatedResource;
  if (!report) {
    overall.className = 'verification-overall verification-idle';
    overall.textContent = 'NOT RUN';
    byId('verificationIntro').textContent = 'Load a returned image or use the opt-in generator to compare it with the current source and Scene Contract.';
    setVerificationRow('verifyPalette', null, 'palette');
    setVerificationRow('verifyStructure', null, 'structure');
    setVerificationRow('verifyGeometry', null, 'geometry');
    updateLockFamilyReport();
    byId('verificationJson').textContent = '';
    return;
  }
  overall.className = 'verification-overall verification-' + report.overallStatus;
  overall.textContent = report.overallStatus.toUpperCase() + ' · ' + Math.round(report.overallConfidence * 100) + '%';
  byId('verificationIntro').textContent = report.limitation;
  setVerificationRow('verifyPalette', report.paletteMatch, 'palette');
  setVerificationRow('verifyStructure', report.structuralSimilarity, 'structure');
  setVerificationRow('verifyGeometry', report.geometry, 'geometry');
  updateLockFamilyReport(report.lockFamilies);
  byId('verificationJson').textContent = JSON.stringify(report, null, 2);
}

function updateCanvasDescription() {
  const alt = buildAltText(state);
  canvas.setAttribute('aria-label', alt);
  byId('canvasDescription').textContent = alt;
}

function updateDimensionLabel(dimensions) {
  const print = getPrintSpecification(state.aspectRatio);
  const physical = print.physicalSize ? ' · ' + print.physicalSize + ' at ' + print.ppi + ' PPI' : '';
  byId('dimIndicator').textContent = dimensions.width + ' × ' + dimensions.height + ' px · ' + state.aspectRatio + physical;
}

function setControlValue(id, value) {
  const control = byId(id);
  if (control && control.value !== String(value)) control.value = String(value);
}

function updateUIControls() {
  setControlValue('aspectRatio', state.aspectRatio);
  setControlValue('splitRatio', Math.round(state.splitRatio * 100));
  byId('splitRatioVal').textContent = Math.round(state.splitRatio * 100) + '%';
  setControlValue('marginSize', Math.round(state.marginSize * 1000) / 10);
  byId('marginSizeVal').textContent = Math.round(state.marginSize * 1000) / 10 + '%';
  setControlValue('preservationLevel', state.preservationLevel);
  setControlValue('transformationPath', state.transformationPath);
  setControlValue('subjectCategory', state.subjectCategory);
  setControlValue('photoTreatment', state.photoTreatment);
  setControlValue('inputSceneAnchor', state.sceneAnchor);
  setControlValue('inputSceneDNA', state.sceneDNA);
  setControlValue('inputSceneRelationships', state.sceneRelationships);
  setControlValue('sceneFocalPosition', state.sceneFocalPosition);
  setControlValue('sceneDirection', state.sceneDirection);
  setControlValue('sceneGazeDirection', state.sceneGazeDirection);
  setControlValue('sceneDensity', state.sceneDensity);
  byId('strongHorizon').checked = state.strongHorizon;
  setControlValue('quietField', state.quietField);
  setControlValue('sourceRole', state.sourceRole);
  setControlValue('mutationProfile', state.mutationProfile);
  setControlValue('materialPreference', state.materialPreference);
  setControlValue('inputLocation', state.location);
  setControlValue('inputDate', state.date);
  setControlValue('inputCaption', state.caption);
  setControlValue('ruleCount', state.writingRulesCount);
  byId('ruleCountVal').textContent = String(state.writingRulesCount);
  setControlValue('fontPairing', state.fontPairing);
  setControlValue('paperTone', state.paperTone);
  setControlValue('accentColorPicker', state.accentColor);
  const accentPreset = byId('accentPreset');
  const matchingAccent = [...accentPreset.options].some((option) => option.value === state.accentColor);
  setControlValue('accentPreset', matchingAccent ? state.accentColor : 'custom');
  setControlValue('accentReason', state.accentReason);
  setControlValue('postalMark', state.postalMark);
  setControlValue('printTexture', state.printTexture);

  byId('splitWidthRow').hidden = state.route !== 'split';
  byId('writingRulesRow').hidden = !['split', 'back', 'duplex'].includes(state.route);
  byId('btnExportBoth').hidden = state.route !== 'duplex';
  byId('sourceControlGroup').hidden = state.route === 'back';
  byId('photoTreatment').disabled = state.transformationPath === 'distill';
  byId('photoTreatment').title = state.transformationPath === 'distill'
    ? 'Distill is source-free and does not apply a photo treatment.'
    : '';

  document.querySelectorAll('#routeNav .nav-btn').forEach((button) => {
    const active = button.dataset.route === state.route;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const allowedViews = compatibleViews(state.route);
  state.viewMode = normalizeViewForRoute(state.route, state.viewMode);
  document.querySelectorAll('.view-btn').forEach((button) => {
    const visible = allowedViews.includes(button.dataset.view);
    const active = state.viewMode === button.dataset.view;
    button.hidden = !visible;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const fit = state.zoomMode === 'fit';
  byId('paperContainer').classList.toggle('zoom-fit', fit);
  byId('paperContainer').classList.toggle('zoom-100', !fit);
  byId('btnZoomFit').setAttribute('aria-pressed', String(fit));
  byId('btnZoom100').setAttribute('aria-pressed', String(!fit));

  const sendsSource = state.route !== 'back' && Boolean(state.imageResource);
  byId('generationDisclosure').textContent = sendsSource
    ? 'Generate sends the compiled prompt, API key, and the currently loaded source image to your endpoint.'
    : 'Generate sends the compiled prompt and API key to your endpoint. No source image is currently included.';
  updateVerificationPanel();
}

function invalidateArt() {
  artCacheKey = '';
  scheduleRender();
}

function discardGeneratedOutput() {
  const generated = state.generatedResource;
  clearGeneratedState(state);
  if (generated) releaseImageResource(generated);
  lastProvenanceRecord = null;
  byId('codeProvenance').textContent = '';
  updateVerificationPanel();
}

async function loadSelectedPreset(presetId) {
  const requestId = ++presetRequest;
  const previousResource = state.imageResource;
  discardGeneratedOutput();
  applyPreset(state, presetId);
  state.imageResource = null;
  releaseImageResource(previousResource);
  updateUIControls();
  byId('uploadStatus').classList.remove('is-error');
  announce(byId('uploadStatus'), 'Loading ' + PRESETS[presetId].description + '.');
  invalidateArt();
  try {
    const resource = await loadPresetImage(PRESETS[presetId].imagePath);
    if (requestId !== presetRequest || state.source.presetId !== presetId) {
      releaseImageResource(resource);
      return;
    }
    state.imageResource = resource;
    state.paletteSamples = resource.palette;
    state.source.width = resource.width;
    state.source.height = resource.height;
    announce(byId('uploadStatus'), 'Preset source loaded: ' + resource.width + ' × ' + resource.height + ' px.');
    invalidateArt();
  } catch (error) {
    state.uploadError = error.message;
    byId('uploadStatus').classList.add('is-error');
    announce(byId('uploadStatus'), 'Preset could not be loaded: ' + error.message);
    invalidateArt();
  }
}

async function handleUpload(file) {
  const status = byId('uploadStatus');
  status.classList.remove('is-error');
  announce(status, 'Checking and decoding ' + (file.name || 'the selected image') + '.');
  try {
    const [resource, sourceSha256] = await Promise.all([loadUserImage(file), sha256Bytes(file)]);
    const previousResource = state.imageResource;
    discardGeneratedOutput();
    transitionToUserUpload(state, {
      name: resource.name,
      type: resource.type,
      width: resource.width,
      height: resource.height,
      sha256: sourceSha256
    });
    state.imageResource = resource;
    state.paletteSamples = resource.palette;
    byId('demoSelect').value = 'none';
    releaseImageResource(previousResource);
    announce(status, 'Custom image loaded: ' + resource.width + ' × ' + resource.height + ' px. Preset-owned copy was cleared; user-authored copy was preserved.');
    updateUIControls();
    invalidateArt();
  } catch (error) {
    const message = error instanceof ImageValidationError ? error.message : 'The image could not be loaded safely.';
    state.uploadError = message;
    status.classList.add('is-error');
    announce(status, message + ' The previous source, if any, remains active.');
  }
}

function populatePresetSelector() {
  const select = byId('demoSelect');
  const existing = new Map([...select.options].map((option) => [option.value, option]));
  listPresets().forEach((preset) => {
    if (existing.has(preset.id)) {
      existing.get(preset.id).textContent = preset.label;
      return;
    }
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.label;
    select.append(option);
  });
}

function contractSnapshot() {
  return JSON.parse(JSON.stringify(buildSceneContract(state)));
}

function intelligenceSnapshot(contract = buildSceneContract(state)) {
  return JSON.parse(JSON.stringify(buildSceneIntelligence(state, contract)));
}

function failedVerification(message) {
  const check = { status: 'failed', confidence: 0, method: message, unavailable: true };
  return {
    schemaVersion: 2,
    heuristic: true,
    paletteMatch: { ...check },
    structuralSimilarity: { ...check },
    geometry: { ...check, expected: 'unavailable', actual: 'unavailable' },
    lockFamilies: {
      identity: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      geometry: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      spatial: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      palette: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      count: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      text: { status: 'not-applicable', confidence: 0, evidence: 'No OCR is performed.' },
      sourceBoundary: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      layoutSafety: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' },
      exportCorrectness: { status: 'declared', confidence: 0, evidence: 'Verification did not run.' }
    },
    overallStatus: 'failed',
    overallConfidence: 0,
    limitation: 'The local heuristic verification could not run: ' + message
  };
}

function adoptGeneratedResource(resource, prompt, contract, intelligence) {
  const previous = state.generatedResource;
  if (previous) releaseImageResource(previous);
  state.generatedResource = resource;
  state.generatedPrompt = prompt;
  state.generatedContract = contract;
  state.generatedIntelligence = intelligence || intelligenceSnapshot(contract);
  state.generatedAt = new Date().toISOString();
  try {
    state.verificationReport = state.imageResource?.image
      ? verifyImages(state.imageResource.image, resource.image, contract)
      : verifyOutputWithoutSource(resource.image, contract);
  } catch (error) {
    state.verificationReport = failedVerification(error.message);
  }
  lastProvenanceRecord = null;
  byId('codeProvenance').textContent = '';
  byId('verificationPanel').open = true;
  updateVerificationPanel();
  invalidateArt();
}

async function handleReturnedImage(file, metadata = {}) {
  const status = byId('generationStatus');
  status.classList.remove('is-error');
  announce(status, 'Decoding the returned image locally before verification.');
  try {
    const resource = await loadUserImage(file);
    const contract = metadata.contract || contractSnapshot();
    adoptGeneratedResource(resource, metadata.prompt || compilePrompt(state), contract, metadata.intelligence || intelligenceSnapshot(contract));
    announce(status, 'Returned image loaded and checked. Open Verification for the heuristic report.');
  } catch (error) {
    status.classList.add('is-error');
    announce(status, 'Returned image could not be used: ' + error.message);
  }
}

function gatewayPost(gateway, requestId, config) {
  let sent = false;
  const send = () => {
    if (sent || gateway.closed) return;
    sent = true;
    gateway.postMessage({ type: 'still-scenes-generation-request', requestId, config }, window.location.origin);
    config.apiKey = '';
    if (config.sourceImage) config.sourceImage.base64 = '';
  };
  try {
    if (gateway.location.pathname.endsWith('/network.html') && gateway.document.readyState === 'complete') {
      window.setTimeout(send, 0);
    } else {
      gateway.addEventListener('load', send, { once: true });
    }
  } catch {
    gateway.addEventListener('load', send, { once: true });
  }
}

async function requestGeneration() {
  const status = byId('generationStatus');
  status.classList.remove('is-error');
  const endpoint = byId('generationEndpoint').value.trim();
  const apiKey = byId('generationApiKey').value;
  const adapterId = byId('generationAdapter').value;
  const model = byId('generationModel').value.trim();
  try {
    if (!byId('generationConsent').checked) throw new Error('Confirm the third-party data disclosure before generating.');
    validateEndpoint(endpoint);
    if (adapterId === 'openai-images' && !apiKey) throw new Error('The OpenAI Images-compatible adapter requires an API key.');
  } catch (error) {
    status.classList.add('is-error');
    announce(status, error.message);
    return;
  }

  const gateway = window.open('network.html', 'stillScenesNetworkGateway', 'popup,width=560,height=640');
  if (!gateway) {
    status.classList.add('is-error');
    announce(status, 'The browser blocked the opt-in gateway window. Allow this popup and try again.');
    return;
  }
  generationGateway = gateway;
  announce(status, 'Preparing the explicit third-party request. No data has been sent yet.');
  const prompt = compilePrompt(state);
  const contract = contractSnapshot();
  const intelligence = intelligenceSnapshot(contract);
  try {
    let sourceImage = null;
    if (state.route !== 'back' && state.imageResource?.image) {
      const encoded = await imageToBase64(state.imageResource.image);
      sourceImage = {
        base64: encoded.base64,
        mimeType: encoded.mimeType,
        name: 'source.png'
      };
    }
    const requestId = 'generation-' + (++generationRequest) + '-' + Date.now().toString(36);
    const config = {
      adapterId,
      endpoint,
      apiKey,
      model,
      prompt,
      sourceImage,
      size: generationSizeForAspect(state.aspectRatio)
    };
    pendingGeneration = { requestId, gateway, prompt, contract, intelligence };
    state.capability.imageGeneration = true;
    state.capability.imageEditing = Boolean(sourceImage);
    announce(status, 'Sending through the opt-in gateway. The endpoint now receives the disclosed fields.');
    gatewayPost(gateway, requestId, config);
  } catch (error) {
    status.classList.add('is-error');
    announce(status, 'The request was not sent: ' + error.message);
  }
}

async function acceptGatewayResult(message) {
  const pending = pendingGeneration;
  if (!pending || message.requestId !== pending.requestId) return;
  pendingGeneration = null;
  if (message.type === 'still-scenes-generation-error') {
    byId('generationStatus').classList.add('is-error');
    announce(byId('generationStatus'), message.message);
    return;
  }
  try {
    const blob = base64ToBlob(message.result.base64, message.result.mimeType);
    const extension = message.result.mimeType === 'image/jpeg' ? 'jpg' : message.result.mimeType.split('/')[1] || 'png';
    const file = new File([blob], 'generated-return.' + extension, { type: message.result.mimeType });
    await handleReturnedImage(file, { prompt: pending.prompt, contract: pending.contract, intelligence: pending.intelligence });
  } catch (error) {
    byId('generationStatus').classList.add('is-error');
    announce(byId('generationStatus'), 'The returned image could not be decoded: ' + error.message);
  }
}

async function buildCurrentProvenance(outputCanvas, format, options = {}) {
  const contract = contractSnapshot();
  const intelligence = intelligenceSnapshot(contract);
  const prompt = compilePrompt(state);
  const record = await createProvenanceRecord({
    sceneContract: contract,
    sceneIntelligence: intelligence,
    prompt,
    sourceSha256: state.source.sha256,
    artifact: {
      format,
      route: options.route || state.route,
      width: outputCanvas.width,
      height: outputCanvas.height,
      bleedMm: options.bleedMm || 0
    },
    generation: state.generatedContract ? {
      sceneContract: state.generatedContract,
      sceneIntelligence: state.generatedIntelligence,
      prompt: state.generatedPrompt,
      completedAt: state.generatedAt
    } : null
  });
  lastProvenanceRecord = record;
  byId('codeProvenance').textContent = provenanceJson(record);
  return record;
}

function bindValueControl(id, stateKey, eventName = 'change', artAffecting = true, transform = (value) => value) {
  byId(id).addEventListener(eventName, (event) => {
    state[stateKey] = transform(event.target.value);
    if (artAffecting) invalidateArt();
    else scheduleRender();
  });
}

function bindEvents() {
  document.querySelectorAll('#routeNav .nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      discardGeneratedOutput();
      setRoute(state, button.dataset.route);
      updateUIControls();
      invalidateArt();
    });
  });

  byId('demoSelect').addEventListener('change', (event) => {
    if (event.target.value === 'none') {
      presetRequest += 1;
      const previous = state.imageResource;
      discardGeneratedOutput();
      leavePresetForCustom(state);
      releaseImageResource(previous);
      announce(byId('uploadStatus'), 'Custom setup ready. No preset location, date, caption, or provenance is active.');
      updateUIControls();
      invalidateArt();
      return;
    }
    loadSelectedPreset(event.target.value);
  });

  bindValueControl('aspectRatio', 'aspectRatio');
  bindValueControl('splitRatio', 'splitRatio', 'input', true, (value) => Number(value) / 100);
  byId('splitRatio').addEventListener('input', (event) => { byId('splitRatioVal').textContent = event.target.value + '%'; });
  bindValueControl('marginSize', 'marginSize', 'input', true, (value) => Number(value) / 100);
  byId('marginSize').addEventListener('input', (event) => { byId('marginSizeVal').textContent = event.target.value + '%'; });
  bindValueControl('preservationLevel', 'preservationLevel');
  byId('transformationPath').addEventListener('change', (event) => {
    discardGeneratedOutput();
    setTransformationPath(state, event.target.value);
    updateUIControls();
    invalidateArt();
  });
  bindValueControl('subjectCategory', 'subjectCategory');
  bindValueControl('photoTreatment', 'photoTreatment');
  bindValueControl('sourceRole', 'sourceRole');
  bindValueControl('sceneFocalPosition', 'sceneFocalPosition');
  bindValueControl('sceneDirection', 'sceneDirection');
  bindValueControl('sceneGazeDirection', 'sceneGazeDirection');
  bindValueControl('sceneDensity', 'sceneDensity');
  bindValueControl('mutationProfile', 'mutationProfile');
  bindValueControl('materialPreference', 'materialPreference');
  byId('strongHorizon').addEventListener('change', (event) => {
    state.strongHorizon = event.target.checked;
    state.sceneFieldsDirty = true;
    invalidateArt();
  });
  bindValueControl('ruleCount', 'writingRulesCount', 'input', true, Number);
  byId('ruleCount').addEventListener('input', (event) => { byId('ruleCountVal').textContent = event.target.value; });
  bindValueControl('fontPairing', 'fontPairing');
  bindValueControl('paperTone', 'paperTone');
  bindValueControl('accentReason', 'accentReason');
  bindValueControl('postalMark', 'postalMark');
  bindValueControl('printTexture', 'printTexture');

  byId('accentColorPicker').addEventListener('input', (event) => {
    state.accentColor = event.target.value;
    const preset = byId('accentPreset');
    const match = [...preset.options].some((option) => option.value === state.accentColor);
    setControlValue('accentPreset', match ? state.accentColor : 'custom');
    invalidateArt();
  });
  byId('accentPreset').addEventListener('change', (event) => {
    if (event.target.value === 'custom') return;
    state.accentColor = event.target.value;
    setControlValue('accentColorPicker', state.accentColor);
    invalidateArt();
  });

  ['location', 'date', 'caption'].forEach((field) => {
    const id = { location: 'inputLocation', date: 'inputDate', caption: 'inputCaption' }[field];
    byId(id).addEventListener('input', (event) => {
      updateCopyField(state, field, event.target.value);
      scheduleRender();
    });
  });
  byId('inputSceneAnchor').addEventListener('input', (event) => {
    updateSceneField(state, 'sceneAnchor', event.target.value);
    invalidateArt();
  });
  byId('inputSceneDNA').addEventListener('input', (event) => {
    updateSceneField(state, 'sceneDNA', event.target.value);
    invalidateArt();
  });
  byId('inputSceneRelationships').addEventListener('input', (event) => {
    updateSceneField(state, 'sceneRelationships', event.target.value);
    invalidateArt();
  });
  byId('quietField').addEventListener('input', (event) => {
    updateSceneField(state, 'quietField', event.target.value);
    invalidateArt();
  });

  document.querySelectorAll('.view-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (!compatibleViews(state.route).includes(button.dataset.view)) return;
      state.viewMode = button.dataset.view;
      updateUIControls();
      invalidateArt();
    });
  });

  byId('btnZoomFit').addEventListener('click', () => {
    state.zoomMode = 'fit';
    updateUIControls();
  });
  byId('btnZoom100').addEventListener('click', () => {
    state.zoomMode = '100';
    updateUIControls();
  });
  byId('btnRegenerateTexture').addEventListener('click', () => {
    state.textureRevision += 1;
    announce(byId('studioStatus'), 'Texture regenerated with a new stable seed.');
    invalidateArt();
  });

  const imageInput = byId('imageInput');
  const dropZone = byId('dropZone');
  imageInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) handleUpload(file);
  });
  dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      imageInput.click();
    }
  });
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragging'));
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) handleUpload(file);
  });

  byId('generatedImageInput').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) handleReturnedImage(file);
  });
  byId('btnGenerateImage').addEventListener('click', requestGeneration);
  byId('btnClearGenerationKey').addEventListener('click', () => {
    byId('generationApiKey').value = '';
    announce(byId('generationStatus'), 'API key cleared from this tab.');
  });
  byId('btnClearGenerated').addEventListener('click', () => {
    discardGeneratedOutput();
    announce(byId('generationStatus'), 'Returned image released. The original source is active again.');
    invalidateArt();
  });
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || !pendingGeneration || event.source !== pendingGeneration.gateway) return;
    if (!['still-scenes-generation-result', 'still-scenes-generation-error'].includes(event.data?.type)) return;
    acceptGatewayResult(event.data);
  });

  createModalController(byId('briefModal'), byId('btnInspectBrief'), byId('btnCloseModal'));
  setupTabs(document.querySelector('.modal-tabs'));
  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const original = button.textContent;
      try {
        await copyTextFromElement(byId(button.dataset.target));
        button.textContent = 'Copied';
        announce(byId('studioStatus'), 'Inspector text copied.');
      } catch (error) {
        button.textContent = 'Copy unavailable';
        announce(byId('studioStatus'), error.message);
      }
      window.setTimeout(() => { button.textContent = original; }, 1800);
    });
  });

  byId('btnCopyProvenance').addEventListener('click', async () => {
    try {
      if (!lastProvenanceRecord) await buildCurrentProvenance(canvas, 'png');
      await copyTextFromElement(byId('codeProvenance'));
      announce(byId('studioStatus'), 'Provenance JSON copied.');
    } catch (error) {
      announce(byId('studioStatus'), 'Provenance copy failed: ' + error.message);
    }
  });

  byId('btnExportImage').addEventListener('click', async () => {
    try {
      if (renderFrame) {
        window.cancelAnimationFrame(renderFrame);
        renderNow();
      }
      const side = state.route === 'duplex' ? '-' + state.viewMode : '';
      const provenance = await buildCurrentProvenance(canvas, 'png', { route: state.route + side });
      const record = await exportCanvasPNGWithProvenance(canvas, 'still-scenes-' + state.route + side + '.png', provenance);
      announce(byId('studioStatus'), 'Exported ' + record.filename + ' with embedded provenance and a JSON sidecar.');
    } catch (error) {
      announce(byId('studioStatus'), 'Export failed: ' + error.message);
    }
  });

  byId('btnExportPdf').addEventListener('click', async () => {
    try {
      if (renderFrame) {
        window.cancelAnimationFrame(renderFrame);
        renderNow();
      }
      const bleedMm = Math.max(0, Math.min(12, Number(byId('printBleed').value) || 0));
      const side = state.route === 'duplex' ? '-' + state.viewMode : '';
      const provenance = await buildCurrentProvenance(canvas, 'pdf', { route: state.route + side, bleedMm });
      const profile = getCanvasProfile(state.aspectRatio);
      const record = await exportCanvasPrintPdf(canvas, 'still-scenes-' + state.route + side + '-print.pdf', {
        bleedMm,
        ppi: profile.physical?.ppi || 300,
        physicalWidthMm: profile.physical?.widthMm,
        physicalHeightMm: profile.physical?.heightMm,
        provenance
      });
      announce(byId('studioStatus'), 'Exported ' + record.filename + ' with ' + bleedMm + ' mm bleed and a JSON sidecar. It remains RGB, not CMYK-certified.');
    } catch (error) {
      announce(byId('studioStatus'), 'PDF export failed: ' + error.message);
    }
  });

  byId('btnExportBoth').addEventListener('click', async () => {
    if (state.route !== 'duplex') return;
    try {
      const front = renderStandalone('front');
      const back = renderStandalone('back');
      const frontProvenance = await buildCurrentProvenance(front, 'png', { route: 'duplex-front' });
      await exportCanvasPNGWithProvenance(front, 'still-scenes-duplex-front.png', frontProvenance);
      const backProvenance = await buildCurrentProvenance(back, 'png', { route: 'duplex-back' });
      await exportCanvasPNGWithProvenance(back, 'still-scenes-duplex-back.png', backProvenance);
      announce(byId('studioStatus'), 'Exported matching duplex PNGs with embedded provenance and one JSON sidecar per side.');
    } catch (error) {
      announce(byId('studioStatus'), 'Duplex export failed: ' + error.message);
    }
  });
}

function initialize() {
  populatePresetSelector();
  bindEvents();
  updateUIControls();
  updateInspector();
  updateVerificationPanel();
  renderNow();
}

initialize();
