import { PRESETS } from './constants.js';
import { announce, copyTextFromElement, createModalController, setupTabs } from './accessibility.js';
import { buildAltText } from './alt-text.js';
import { exportCanvasPNG } from './export.js';
import { ImageValidationError, loadPresetImage, loadUserImage, releaseImageResource } from './image-loader.js';
import { getCanvasProfile, getPrintSpecification, getSafeRect, isInsideRect } from './layout.js';
import { compilePrompt, serializeCreationBrief } from './prompt-compiler.js';
import { evaluateQuality } from './quality.js';
import { drawRouteArt, drawRouteCopy } from './render/index.js';
import {
  applyPreset,
  compatibleViews,
  createInitialState,
  leavePresetForCustom,
  normalizeViewForRoute,
  setRoute,
  setTransformationPath,
  transitionToUserUpload,
  updateCopyField,
  updateSceneField
} from './state.js';
import { TextureCache } from './textures.js';

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
    sceneAnchor: state.sceneAnchor,
    sceneDNA: state.sceneDNA,
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
  artDiagnostics = drawRouteArt(artContext, dimensions, state);
  applyTexture(artContext, dimensions, state);
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
  if (renderFrame) return;
  renderFrame = window.requestAnimationFrame(renderNow);
}

function renderStandalone(viewMode) {
  const profile = getCanvasProfile(state.aspectRatio);
  const output = document.createElement('canvas');
  output.width = profile.width;
  output.height = profile.height;
  const outputContext = output.getContext('2d');
  const snapshot = { ...state, viewMode };
  drawRouteArt(outputContext, { width: profile.width, height: profile.height }, snapshot);
  applyTexture(outputContext, { width: profile.width, height: profile.height }, snapshot);
  drawRouteCopy(outputContext, { width: profile.width, height: profile.height }, snapshot);
  return output;
}

function updateInspector() {
  byId('codeBrief').textContent = serializeCreationBrief(state);
  byId('codePrompt').textContent = compilePrompt(state);
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
}

function invalidateArt() {
  artCacheKey = '';
  scheduleRender();
}

async function loadSelectedPreset(presetId) {
  const requestId = ++presetRequest;
  const previousResource = state.imageResource;
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
    const resource = await loadUserImage(file);
    const previousResource = state.imageResource;
    transitionToUserUpload(state, {
      name: resource.name,
      type: resource.type,
      width: resource.width,
      height: resource.height
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
      setRoute(state, button.dataset.route);
      updateUIControls();
      invalidateArt();
    });
  });

  byId('demoSelect').addEventListener('change', (event) => {
    if (event.target.value === 'none') {
      presetRequest += 1;
      const previous = state.imageResource;
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
    setTransformationPath(state, event.target.value);
    updateUIControls();
    invalidateArt();
  });
  bindValueControl('subjectCategory', 'subjectCategory');
  bindValueControl('photoTreatment', 'photoTreatment');
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

  byId('btnExportImage').addEventListener('click', async () => {
    try {
      if (renderFrame) {
        window.cancelAnimationFrame(renderFrame);
        renderNow();
      }
      const side = state.route === 'duplex' ? '-' + state.viewMode : '';
      const record = await exportCanvasPNG(canvas, 'still-scenes-' + state.route + side + '.png');
      announce(byId('studioStatus'), 'Exported ' + record.filename + ' as print-sized RGB PNG.');
    } catch (error) {
      announce(byId('studioStatus'), 'Export failed: ' + error.message);
    }
  });

  byId('btnExportBoth').addEventListener('click', async () => {
    if (state.route !== 'duplex') return;
    try {
      const front = renderStandalone('front');
      const back = renderStandalone('back');
      await exportCanvasPNG(front, 'still-scenes-duplex-front.png');
      await exportCanvasPNG(back, 'still-scenes-duplex-back.png');
      announce(byId('studioStatus'), 'Exported separate, matching duplex front and back RGB PNG files.');
    } catch (error) {
      announce(byId('studioStatus'), 'Duplex export failed: ' + error.message);
    }
  });
}

function initialize() {
  bindEvents();
  updateUIControls();
  updateInspector();
  renderNow();
}

initialize();
