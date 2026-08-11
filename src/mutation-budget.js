export const MUTATION_LEVELS = Object.freeze(['locked', 'tight', 'restrained', 'flexible', 'free', 'not-applicable']);

const DEFAULTS = Object.freeze({
  preserve: {
    identity: 'locked', geometry: 'locked', spatial: 'tight', palette: 'tight', count: 'locked',
    spatial_relation: 'tight', background_detail: 'restrained', crop: 'tight', scale: 'tight', texture: 'restrained',
    material: 'restrained', typography: 'restrained', composition: 'tight', abstraction: 'locked',
    symbolic_interpretation: 'locked', added_elements: 'locked', removal: 'tight', source_raster: 'locked'
  },
  reduce: {
    identity: 'locked', geometry: 'tight', spatial: 'tight', palette: 'restrained', count: 'locked',
    spatial_relation: 'tight', background_detail: 'flexible', crop: 'restrained', scale: 'restrained', texture: 'flexible',
    material: 'restrained', typography: 'restrained', composition: 'restrained', abstraction: 'restrained',
    symbolic_interpretation: 'tight', added_elements: 'tight', removal: 'flexible', source_raster: 'tight'
  },
  hybrid: {
    identity: 'locked', geometry: 'tight', spatial: 'restrained', palette: 'restrained', count: 'tight',
    spatial_relation: 'restrained', background_detail: 'flexible', crop: 'restrained', scale: 'restrained', texture: 'flexible',
    material: 'flexible', typography: 'restrained', composition: 'flexible', abstraction: 'restrained',
    symbolic_interpretation: 'restrained', added_elements: 'restrained', removal: 'restrained', source_raster: 'tight'
  },
  distill: {
    identity: 'not-applicable', geometry: 'flexible', spatial: 'restrained', palette: 'restrained', count: 'flexible',
    spatial_relation: 'restrained', background_detail: 'free', crop: 'not-applicable', scale: 'flexible', texture: 'free',
    material: 'free', typography: 'restrained', composition: 'flexible', abstraction: 'flexible',
    symbolic_interpretation: 'flexible', added_elements: 'flexible', removal: 'free', source_raster: 'locked'
  }
});

const PROFILE_OVERRIDES = Object.freeze({
  governed: {},
  conservative: { background_detail: 'tight', crop: 'tight', material: 'tight', added_elements: 'locked', removal: 'tight' },
  expressive: { background_detail: 'flexible', material: 'flexible', typography: 'flexible', symbolic_interpretation: 'flexible' },
  'source-free': { source_raster: 'locked', crop: 'not-applicable', background_detail: 'free', removal: 'free' }
});

function hasMeaningfulLock(values) {
  return Array.isArray(values) && values.some((value) => String(value).trim() && !/not retained|not applicable/i.test(String(value)));
}

export function buildMutationBudget(state, sceneContract) {
  const path = sceneContract.transformation_path || state.transformationPath || 'preserve';
  const profile = path === 'distill' ? 'source-free' : (state.mutationProfile || 'governed');
  const values = { ...(DEFAULTS[path] || DEFAULTS.preserve), ...(PROFILE_OVERRIDES[profile] || {}) };
  const precedence = [];
  const lock = (field, reason) => {
    if (values[field] !== 'locked') values[field] = 'locked';
    precedence.push({ field, decision: 'locked', reason });
  };
  if (hasMeaningfulLock(sceneContract.identity_locks)) lock('identity', 'Scene Contract identity locks override the mutation profile.');
  if (hasMeaningfulLock(sceneContract.geometry_locks)) lock('geometry', 'Scene Contract geometry locks override the mutation profile.');
  if (hasMeaningfulLock(sceneContract.spatial_locks)) {
    values.spatial = values.spatial === 'locked' ? 'locked' : 'tight';
    values.spatial_relation = values.spatial;
    precedence.push({ field: 'spatial', decision: values.spatial, reason: 'Scene Contract spatial locks cap spatial mutation.' });
  }
  if (hasMeaningfulLock(sceneContract.palette_locks)) {
    values.palette = ['locked', 'tight'].includes(values.palette) ? values.palette : 'tight';
    precedence.push({ field: 'palette', decision: values.palette, reason: 'Palette locks cap palette mutation.' });
  }
  if (hasMeaningfulLock(sceneContract.count_locks)) lock('count', 'Count locks override decorative or reduction freedom.');
  if (hasMeaningfulLock(sceneContract.text_locks)) lock('typography', 'Locked copy must remain character-for-character authoritative.');
  if (path === 'distill') lock('source_raster', 'Distill and scene-evidence roles prohibit recognizable source raster.');
  return {
    schema: 'still-scenes/mutation-budget/v1',
    profile,
    transformation_path: path,
    values,
    precedence,
    rule: 'Scene Contract locks always override mutation freedom.'
  };
}

export function mutationLevelAllows(level, requestedMinimum) {
  const rank = { locked: 0, tight: 1, restrained: 2, flexible: 3, free: 4, 'not-applicable': -1 };
  return rank[level] >= rank[requestedMinimum];
}
