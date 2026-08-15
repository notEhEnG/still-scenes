import { COPY_FIELDS, PRESETS, ROUTES, TRANSFORMATION_PATHS, VIEW_COMPATIBILITY } from './constants.js';

function createCopyMeta(owner) {
  return COPY_FIELDS.reduce((result, field) => {
    result[field] = { owner, dirty: false };
    return result;
  }, {});
}

const SCENE_INTELLIGENCE_DEFAULTS = Object.freeze({
  sourceRole: 'auto',
  sceneRelationships: '',
  sceneFocalPosition: 'auto',
  sceneDirection: 'auto',
  sceneGazeDirection: 'auto',
  sceneDensity: 'balanced',
  strongHorizon: false,
  quietField: '',
  mutationProfile: 'governed',
  materialPreference: 'auto'
});

export function createInitialState(documentSeed = 'still-scenes-v3') {
  return {
    route: 'split',
    aspectRatio: '3:2',
    splitRatio: 0.46,
    marginSize: 0.04,
    preservationLevel: 'native',
    transformationPath: 'preserve',
    reductionLevel: 'none',
    subjectCategory: 'general',
    photoTreatment: 'framed',
    ...SCENE_INTELLIGENCE_DEFAULTS,
    sceneAnchor: '',
    sceneDNA: '',
    observedEvidence: '',
    rememberedEvidence: '',
    uncertainEvidence: '',
    forbiddenEvidence: '',
    memoryInfluence: 'caption-only',
    sceneFieldsDirty: false,
    location: '',
    date: '',
    caption: '',
    copyMeta: createCopyMeta('blank'),
    writingRulesCount: 7,
    fontPairing: 'editorial',
    paperTone: 'warm-archive',
    accentColor: '#e05a36',
    accentReason: 'source resonance',
    postalMark: 'camera',
    printTexture: 'subtle',
    viewMode: 'composite',
    zoomMode: 'fit',
    source: {
      kind: 'none',
      presetId: null,
      filename: '',
      mimeType: '',
      userOwned: false,
      loadedAt: null,
      width: 0,
      height: 0,
      sha256: '',
      description: ''
    },
    imageResource: null,
    generatedResource: null,
    generatedPrompt: '',
    generatedContract: null,
    generatedIntelligence: null,
    generatedAt: null,
    verificationReport: null,
    paletteSamples: ['#35566f', '#f0ede4', '#d8643b', '#25272a'],
    variationRecipe: null,
    documentSeed,
    textureRevision: 0,
    uploadError: '',
    capability: {
      imageGeneration: false,
      imageEditing: false,
      deterministicTextComposition: true,
      fileExport: true,
      imageInspection: true,
      metadataInspection: false
    }
  };
}

export function compatibleViews(route) {
  return VIEW_COMPATIBILITY[route] ? [...VIEW_COMPATIBILITY[route]] : ['composite'];
}

export function listPresets() {
  return Object.entries(PRESETS).map(([id, preset]) => ({
    id,
    label: preset.label || id,
    imagePath: preset.imagePath,
    manifestId: preset.manifestId || null
  }));
}

export function normalizeViewForRoute(route, viewMode) {
  const views = compatibleViews(route);
  return views.includes(viewMode) ? viewMode : views[0];
}

export function setRoute(state, route) {
  if (!ROUTES.includes(route)) throw new Error('Unsupported route: ' + route);
  state.route = route;
  state.viewMode = normalizeViewForRoute(route, state.viewMode);
  if (route === 'zine' && state.aspectRatio === '3:2') state.aspectRatio = '3:5';
  return state;
}

export function setTransformationPath(state, path) {
  if (!TRANSFORMATION_PATHS.includes(path)) throw new Error('Unsupported transformation path: ' + path);
  state.transformationPath = path;
  const reductionByPath = {
    preserve: 'none',
    reduce: 'simplified',
    hybrid: 'restrained',
    distill: 'distilled'
  };
  state.reductionLevel = reductionByPath[path];
  return state;
}

export function updateCopyField(state, field, value) {
  if (!COPY_FIELDS.includes(field)) throw new Error('Unsupported copy field: ' + field);
  state[field] = String(value);
  state.copyMeta[field] = { owner: 'user', dirty: true };
  return state;
}

export function updateSceneField(state, field, value) {
  if (!['sceneAnchor', 'sceneDNA', 'sceneRelationships', 'quietField', 'observedEvidence', 'rememberedEvidence', 'uncertainEvidence', 'forbiddenEvidence'].includes(field)) throw new Error('Unsupported scene field: ' + field);
  state[field] = String(value);
  state.sceneFieldsDirty = true;
  return state;
}

export function applyPreset(state, presetId) {
  const preset = PRESETS[presetId];
  if (!preset) throw new Error('Unknown preset: ' + presetId);

  Object.assign(state, SCENE_INTELLIGENCE_DEFAULTS);
  state.observedEvidence = '';
  state.rememberedEvidence = '';
  state.uncertainEvidence = '';
  state.forbiddenEvidence = '';
  state.memoryInfluence = 'caption-only';
  Object.entries(preset).forEach(([key, value]) => {
    if (!['imagePath', 'description'].includes(key)) state[key] = value;
  });

  state.copyMeta = createCopyMeta('preset');
  state.sceneFieldsDirty = false;
  state.source = {
    kind: 'preset',
    presetId,
    filename: preset.imagePath.split('/').pop(),
    mimeType: 'image/png',
    userOwned: false,
    loadedAt: new Date().toISOString(),
    width: 0,
    height: 0,
    sha256: preset.outputSha256 || preset.sourceSha256 || '',
    description: preset.description
  };
  state.viewMode = normalizeViewForRoute(state.route, state.viewMode);
  state.uploadError = '';
  return state;
}

export function transitionToUserUpload(state, fileMeta) {
  COPY_FIELDS.forEach((field) => {
    const meta = state.copyMeta[field];
    if (meta && meta.owner === 'preset' && !meta.dirty) {
      state[field] = '';
      state.copyMeta[field] = { owner: 'blank', dirty: false };
    }
  });

  if (!state.sceneFieldsDirty) {
    state.sceneAnchor = 'User-selected photograph';
    state.sceneDNA = '';
    state.sceneRelationships = '';
    state.quietField = '';
    state.observedEvidence = '';
    state.rememberedEvidence = '';
    state.uncertainEvidence = '';
    state.forbiddenEvidence = '';
    state.memoryInfluence = 'caption-only';
    state.sceneFocalPosition = 'auto';
    state.sceneDirection = 'auto';
    state.sceneGazeDirection = 'auto';
    state.sceneDensity = 'balanced';
    state.strongHorizon = false;
  }
  state.sourceRole = 'auto';

  state.source = {
    kind: 'user-upload',
    presetId: null,
    filename: fileMeta.name,
    mimeType: fileMeta.type,
    userOwned: true,
    loadedAt: fileMeta.loadedAt || new Date().toISOString(),
    width: fileMeta.width,
    height: fileMeta.height,
    sha256: fileMeta.sha256 || '',
    description: 'a user-selected photograph'
  };
  state.uploadError = '';
  return state;
}

export function leavePresetForCustom(state) {
  if (state.source.kind !== 'preset') return state;
  COPY_FIELDS.forEach((field) => {
    if (state.copyMeta[field].owner === 'preset') {
      state[field] = '';
      state.copyMeta[field] = { owner: 'blank', dirty: false };
    }
  });
  state.sceneAnchor = '';
  state.sceneDNA = '';
  state.observedEvidence = '';
  state.rememberedEvidence = '';
  state.uncertainEvidence = '';
  state.forbiddenEvidence = '';
  state.memoryInfluence = 'caption-only';
  Object.assign(state, SCENE_INTELLIGENCE_DEFAULTS);
  state.sceneFieldsDirty = false;
  state.source = {
    kind: 'none', presetId: null, filename: '', mimeType: '', userOwned: false,
    loadedAt: null, width: 0, height: 0, sha256: '', description: ''
  };
  state.imageResource = null;
  return state;
}

export function classifyImageSource(state) {
  if (state.source.kind === 'user-upload') return 'supplied';
  if (state.source.kind === 'preset') return 'preset';
  return 'none';
}

export function clearGeneratedState(state) {
  state.generatedResource = null;
  state.generatedPrompt = '';
  state.generatedContract = null;
  state.generatedIntelligence = null;
  state.generatedAt = null;
  state.verificationReport = null;
  return state;
}

export function hasPresetCopyLeak(state) {
  if (state.source.kind !== 'user-upload') return false;
  return COPY_FIELDS.some((field) => state.copyMeta[field] && state.copyMeta[field].owner === 'preset');
}
