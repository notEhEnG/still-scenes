const PROFILE_ALIASES = Object.freeze({
  high: {
    label: 'identity-and-geometry locked',
    identity: 'strong',
    geometry: 'strong',
    spatial: 'strong',
    palette: 'recognizable',
    defaultPath: 'preserve'
  },
  medium: {
    label: 'scene-DNA locked',
    identity: 'contextual',
    geometry: 'defining forms only',
    spatial: 'strong',
    palette: 'source-resonant',
    defaultPath: 'reduce'
  },
  low: {
    label: 'reference-grammar only',
    identity: 'not retained',
    geometry: 'relation only',
    spatial: 'gesture only',
    palette: 'evidence-based',
    defaultPath: 'distill'
  }
});

export function mapLegacyPreservation(level) {
  const profile = PROFILE_ALIASES[level];
  if (!profile) throw new Error('Unknown preservation alias: ' + level);
  return { ...profile, compatibilityAlias: level };
}

export function parseSceneDNA(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getReductionMap(subjectCategory) {
  const maps = {
    foliage: [
      'retain canopy direction and one to three dominant branch gestures',
      'merge leaves into two to five large masses',
      'remove roughly 80–95% of leaf micro-detail when simplified'
    ],
    clouds: [
      'retain the dominant cloud silhouette and light direction',
      'preserve the warm/cool relationship',
      'merge small fragments into the primary weather mass'
    ],
    city: [
      'retain skyline or horizon and one to three identifying structural rhythms',
      'preserve directional infrastructure such as roads, rails, or wires',
      'remove repetitive windows, signage, and street clutter'
    ],
    person: [
      'preserve identity, pose, gaze, clothing anchors, and body proportions',
      'simplify the environment before simplifying the person',
      'do not convert an identifiable face into a generic symbol'
    ],
    product: [
      'preserve component count, construction, silhouette, and proportions',
      'geometry locks outrank decorative style',
      'simplify only the surrounding field unless explicitly permitted'
    ],
    landscape: [
      'preserve horizon, dominant path, depth layers, and major color fields',
      'simplify texture before changing spatial relations',
      'retain the directional gesture that makes the place recognizable'
    ],
    general: [
      'retain the anchor and the smallest recognizable relation',
      'merge secondary detail into quiet shape fields',
      'remove clutter before changing the anchor'
    ]
  };
  return [...(maps[subjectCategory] || maps.general)];
}

function lockedCopy(state) {
  return ['caption', 'location', 'date']
    .filter((field) => state[field] !== '')
    .map((field) => ({ field, value: state[field] }));
}

export function buildSceneContract(state) {
  const legacy = mapLegacyPreservation(state.preservationLevel);
  const path = state.transformationPath || legacy.defaultPath;
  const sourceRole = path === 'distill'
    ? 'reference-grammar'
    : state.source.kind === 'none' ? 'none' : 'scene-anchor';
  const anchor = state.sceneAnchor || state.source.description || 'Undeclared scene anchor';
  const dna = parseSceneDNA(state.sceneDNA);

  const allowedByPath = {
    preserve: ['crop within safe bounds', 'paper framing', 'deterministic typography', 'restrained print treatment'],
    reduce: ['merge secondary detail', 'simplify texture', 'paper framing', 'source-derived color fields'],
    hybrid: ['retain one real photographic anchor', 'extend source geometry with paper, ink, line, or halftone'],
    distill: ['use palette evidence', 'use dominant gesture', 'use the declared relation', 'build source-free procedural shapes']
  };

  const forbidden = [
    'invented location or hidden metadata',
    'rewritten locked copy',
    'extra logos, signatures, watermarks, or official postal marks',
    'unrequested people or objects'
  ];
  if (path === 'distill') forbidden.push('recognizable source-photo raster');
  if (legacy.geometry === 'strong') forbidden.push('changed object count, proportions, silhouette, or construction');

  return {
    anchor,
    scene_dna: dna.length ? dna : ['Scene DNA requires user declaration or visual inspection'],
    identity_locks: [legacy.identity],
    geometry_locks: [legacy.geometry],
    spatial_locks: [legacy.spatial],
    palette_locks: [legacy.palette],
    count_locks: legacy.geometry === 'strong' ? ['preserve visible subject and component count'] : [],
    text_locks: lockedCopy(state),
    allowed_mutations: allowedByPath[path] || allowedByPath.preserve,
    forbidden_mutations: forbidden,
    transformation_path: path,
    reduction_level: state.reductionLevel,
    source_role: sourceRole,
    privacy_constraints: [
      'do not inspect or infer EXIF GPS',
      'print a location only when explicitly entered',
      'keep user uploads inside the current browser session'
    ],
    compatibility_alias: state.preservationLevel,
    profile: legacy.label
  };
}
