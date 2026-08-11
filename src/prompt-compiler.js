import { buildSceneContract, getReductionMap } from './scene-contract.js';
import { classifyImageSource } from './state.js';
import { computeQuietFieldShare, getOrientation, getPrintSpecification } from './layout.js';

function list(values) {
  return values.length ? values.join('; ') : 'none declared';
}

function lockedCopySummary(contract) {
  if (!contract.text_locks.length) return 'No required copy.';
  return contract.text_locks.map((entry) => entry.field + '=' + JSON.stringify(entry.value)).join('; ');
}

function compositionFor(state) {
  const quiet = Math.round(computeQuietFieldShare(state) * 100);
  const split = Math.round(state.splitRatio * 100);
  const routes = {
    split: 'Place the photograph in a framed field occupying about ' + split + '% of the width. Use the remaining field for locked copy and usable writing rules, separated by a calm gutter.',
    front: 'Build an image-led front with a paper margin and a caption zone that remains subordinate to the scene. Reserve about ' + quiet + '% as quiet field.',
    back: 'Build a writable back: message field about 58%, recipient field about 34%, one fine divider, and an empty decorative stamp frame. Do not invent an address or official postage.',
    duplex: 'Produce two separate, same-size artifacts. Front: image-led and nearly textless. Back: writable with locked message metadata. Match orientation, paper family, edge treatment, and accent family.',
    zine: 'Build one editorial paper event with about ' + quiet + '% quiet field. Place one intentional visual cluster and keep typography note-like rather than promotional.'
  };
  return routes[state.route];
}

function materialFor(state) {
  if (state.route === 'back') return 'Paper family: ' + state.paperTone + '. Writable rules and decorative postal utility only; no source-photo treatment applies.';
  if (state.transformationPath === 'distill') return 'Paper family: ' + state.paperTone + '. Source-free procedural shapes derived from Scene DNA and palette evidence. Texture: ' + state.printTexture + '. Keep required copy on a clean deterministic layer.';
  return 'Paper family: ' + state.paperTone + '. Scene treatment: ' + state.photoTreatment + '. Texture: ' + state.printTexture + '. Keep required copy on a clean deterministic layer.';
}

function transformationFor(state) {
  const pathText = {
    preserve: 'Use the actual source photograph. Permit only declared crop, framing, paper, typography, and restrained print treatment.',
    reduce: 'Keep the photograph recognizable while merging secondary detail according to the reduction map.',
    hybrid: 'Keep one real photographic anchor and extend only source-derived geometry with paper, ink, line, halftone, or color field.',
    distill: 'Include no recognizable source-photo raster. Use only declared Scene DNA, palette evidence, dominant gesture, relation, and emotional temperature.'
  };
  return transformationForPath(state.transformationPath, pathText);
}

function transformationForPath(path, values) {
  return values[path] || values.preserve;
}

function copyStrategy(state, contract) {
  if (!contract.text_locks.length) return 'No locked strings are required. Do not invent text.';
  if (state.capability.deterministicTextComposition) {
    return 'Compose these strings deterministically after the art layer, preserving every character, line break, punctuation mark, and Unicode code point: ' + lockedCopySummary(contract);
  }
  return 'Return text-free artwork and exact placement specifications for: ' + lockedCopySummary(contract) + '. Do not claim exact rendering.';
}

export function buildCreationBrief(state) {
  const contract = buildSceneContract(state);
  return {
    schema_version: 2,
    product: 'Still Scenes Studio',
    route: state.route,
    orientation: getOrientation(state.aspectRatio),
    aspect_ratio: state.aspectRatio,
    source: {
      classification: classifyImageSource(state),
      provenance: state.source.kind,
      preset_id: state.source.presetId,
      filename: state.source.filename,
      user_owned: state.source.userOwned,
      dimensions: state.source.width && state.source.height ? [state.source.width, state.source.height] : null
    },
    scene_contract: contract,
    recipe: {
      treatment: state.photoTreatment,
      paper_family: state.paperTone,
      accent: state.accentColor,
      accent_reason: state.accentReason,
      texture: state.printTexture,
      typography: state.fontPairing,
      postal_mark: state.postalMark
    },
    output: getPrintSpecification(state.aspectRatio),
    capabilities: { ...state.capability },
    privacy: {
      location_is_user_entered: state.location !== '',
      metadata_location_allowed: false,
      network_transmission: false,
      session_only_source: state.source.kind === 'user-upload'
    }
  };
}

export function serializeCreationBrief(state) {
  return JSON.stringify(buildCreationBrief(state), null, 2);
}

export function compilePrompt(state) {
  const contract = buildSceneContract(state);
  const sections = [
    ['OUTPUT CONTRACT', 'Create a flat ' + getOrientation(state.aspectRatio) + ' ' + state.aspectRatio + ' ' + state.route + ' artifact for Still Scenes. Output is RGB raster; do not claim CMYK or press certification.'],
    ['SCENE CONTRACT', 'Anchor: ' + contract.anchor + '. Profile: ' + contract.profile + '. Identity locks: ' + list(contract.identity_locks) + '. Geometry locks: ' + list(contract.geometry_locks) + '. Spatial locks: ' + list(contract.spatial_locks) + '.'],
    ['SCENE DNA', list(contract.scene_dna)],
    ['TRANSFORMATION PATH', state.transformationPath + ' — ' + transformationFor(state)],
    ['COMPOSITION', compositionFor(state)],
    ['MATERIAL LANGUAGE', materialFor(state)],
    ['REDUCTION MAP', state.transformationPath === 'preserve' ? 'No semantic reduction. Preserve defining source detail.' : list(getReductionMap(state.subjectCategory))],
    ['COLOR FUNCTION', 'Use ' + state.accentColor + ' only for ' + state.accentReason + '. Preserve source-resonant palette evidence and avoid arbitrary accent blocks.'],
    ['LOCKED COPY STRATEGY', copyStrategy(state, contract)],
    ['REPRODUCTION', 'Flat front-facing paper object. Stable seeded texture. Keep locked copy free from aggressive grain, distortion, and misregistration.'],
    ['PRIVACY / SOURCE BOUNDARY', 'Use only the attached source when one is declared. Never infer location from EXIF, filename, or visual recognition. Reference grammar must not transfer source-specific text, people, brands, signatures, watermarks, dates, locations, or exact layout.'],
    ['HARD FAILURES', list(contract.forbidden_mutations)]
  ];

  return sections.map((section) => section[0] + '\n' + section[1]).join('\n\n');
}
