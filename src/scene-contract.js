import { getCanvasProfile } from './layout.js';
import { resolveSourceRole } from './source-boundary.js';

const PROFILE_ALIASES = Object.freeze({
  native: {
    label: 'native Scene Contract',
    identity: 'declared by explicit locks',
    geometry: 'declared by explicit locks',
    spatial: 'Scene DNA relations',
    palette: 'source-resonant',
    defaultPath: 'preserve'
  },
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

export function resolveContractProfile(level) {
  const profile = PROFILE_ALIASES[level];
  if (!profile) throw new Error('Unknown preservation alias: ' + level);
  return { ...profile, compatibilityAlias: level };
}

export function mapLegacyPreservation(level) {
  return resolveContractProfile(level);
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
    architecture: [
      'preserve the building silhouette, defining rooflines, and important openings',
      'retain one to three structural rhythms without inventing floors or impossible geometry',
      'simplify repetitive windows, signs, and surface detail before structural edges'
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
    interior: [
      'retain doorway, window, furniture, and light-source relations that identify the room',
      'merge surface clutter before changing architectural edges',
      'keep the anchor object on its declared depth plane'
    ],
    vehicles: [
      'preserve vehicle silhouette, orientation, wheel count, and major window and light geometry',
      'keep visible construction and component count ahead of decorative style',
      'simplify road, traffic, and background texture before the vehicle'
    ],
    night: [
      'retain the distribution of lit and unlit fields',
      'protect isolated light anchors and their count',
      'remove sensor noise before changing the darkness relation'
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
  const profile = resolveContractProfile(state.preservationLevel);
  const surfaceProfile = getCanvasProfile(state.aspectRatio);
  const path = state.transformationPath || profile.defaultPath;
  const sourceRole = resolveSourceRole(state, path);
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
  if (profile.geometry === 'strong') forbidden.push('changed object count, proportions, silhouette, or construction');

  const nativeProfile = state.preservationLevel === 'native';
  const sourceFreeNative = nativeProfile && (state.source.kind === 'none' || path === 'distill');
  const identityLocks = Array.isArray(state.identityLocks)
    ? [...state.identityLocks]
    : profile.identity === 'not retained' || sourceFreeNative ? [] : ['preserve identity according to the declared anchor and visible source evidence'];
  const geometryLocks = Array.isArray(state.geometryLocks)
    ? [...state.geometryLocks]
    : profile.geometry === 'relation only' || sourceFreeNative ? [] : ['preserve defining shape, proportions, silhouette, and construction'];
  const spatialLocks = Array.isArray(state.spatialLocks)
    ? [...state.spatialLocks]
    : ['preserve declared Scene DNA relationships and anchor position'];
  const countLocks = Array.isArray(state.countLocks)
    ? [...state.countLocks]
    : profile.geometry === 'strong' || (nativeProfile && path !== 'distill' && ['person', 'product'].includes(state.subjectCategory)) ? ['preserve visible subject and component count'] : [];
  if ((geometryLocks.length || countLocks.length)
      && !forbidden.includes('changed object count, proportions, silhouette, or construction')) {
    forbidden.push('changed object count, proportions, silhouette, or construction');
  }

  return {
    contract_version: 3,
    anchor,
    scene_dna: dna.length ? dna : ['Scene DNA requires user declaration or visual inspection'],
    identity_locks: identityLocks,
    geometry_locks: geometryLocks,
    spatial_locks: spatialLocks,
    palette_locks: [profile.palette, ...(state.paletteSamples || [])],
    count_locks: countLocks,
    text_locks: lockedCopy(state),
    allowed_mutations: allowedByPath[path] || allowedByPath.preserve,
    forbidden_mutations: forbidden,
    transformation_path: path,
    reduction_level: state.reductionLevel,
    source_role: sourceRole,
    source_evidence_only: sourceRole === 'scene-evidence',
    surface: {
      route: state.route,
      aspect_ratio: state.aspectRatio,
      width: surfaceProfile.width,
      height: surfaceProfile.height
    },
    privacy_constraints: [
      'do not inspect or infer EXIF GPS',
      'print a location only when explicitly entered',
      'keep user uploads inside the current browser session'
    ],
    compatibility_alias: nativeProfile ? null : state.preservationLevel,
    profile: 'native Scene Contract',
    compatibility_profile: profile.label
  };
}
