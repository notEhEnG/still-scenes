import { buildSceneContract } from './scene-contract.js';
import { classifyImageSource } from './state.js';
import { computeQuietFieldShare, getOrientation, getPrintSpecification } from './layout.js';
import { buildSceneIntelligence } from './scene-intelligence.js';
import { sceneGraphSummary } from './scene-graph.js';
import { auditCaptionAuthority, buildCaptionLadder, memoryEvidencePromptSummary } from './memory-evidence.js';

function list(values) {
  return values.length ? values.map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join('; ') : 'not applicable';
}

function lockedCopySummary(contract) {
  if (!contract.text_locks.length) return 'No required copy.';
  return contract.text_locks.map((entry) => entry.field + '=' + JSON.stringify(entry.value)).join('; ');
}

function compositionFor(state, layoutPlan) {
  const quiet = Math.round(computeQuietFieldShare(state) * 100);
  const split = Math.round(state.splitRatio * 100);
  const routes = {
    split: 'Use the ' + layoutPlan.family + ' plan: photograph about ' + Math.round(layoutPlan.image_share * 100) + '% of width, aligned ' + layoutPlan.photo_alignment + '; reserve the ' + layoutPlan.breathing_direction + ' counterfield for locked copy and writing rules.',
    front: 'Use the ' + layoutPlan.family + ' plan: image share about ' + Math.round(layoutPlan.image_share * 100) + '%, ' + layoutPlan.crop_policy + ', with caption in the ' + layoutPlan.caption_placement + '. Keep about ' + quiet + '% quiet field.',
    back: 'Build a writable back: message field about 58%, recipient field about 34%, one fine divider, and an empty decorative stamp frame. Do not invent an address or official postage.',
    duplex: 'Produce two separate, same-size artifacts. Front: image-led and nearly textless. Back: writable with locked message metadata. Match orientation, paper family, edge treatment, and accent family.',
    zine: 'Use one ' + layoutPlan.family + ' paper event with about ' + quiet + '% quiet field. Anchor the cluster ' + layoutPlan.photo_alignment + ' and preserve breathing room toward ' + layoutPlan.breathing_direction + '.'
  };
  return routes[state.route];
}

function materialFor(state, materialLogic) {
  if (state.route === 'back') return 'Paper family: ' + state.paperTone + '. Writable rules and decorative postal utility only; no source-photo treatment applies.';
  if (state.transformationPath === 'distill') return 'Use ' + materialLogic.treatment + ' on ' + materialLogic.paper_family + ' paper with ' + materialLogic.texture + ' texture. ' + materialLogic.reason + ' Keep required copy on ' + materialLogic.locked_copy_layer + '.';
  return 'Use ' + materialLogic.treatment + ' on ' + materialLogic.paper_family + ' paper with ' + materialLogic.texture + ' texture. ' + materialLogic.reason + ' Keep required copy on ' + materialLogic.locked_copy_layer + '.';
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
  const intelligence = buildSceneIntelligence(state, contract);
  const captionLadder = buildCaptionLadder(state, contract.memory_evidence);
  return {
    schema_version: 3,
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
    caption_ladder: captionLadder,
    caption_authority: auditCaptionAuthority(state, contract.memory_evidence, captionLadder),
    scene_graph: intelligence.sceneGraph,
    mutation_budget: intelligence.mutationBudget,
    layout_plan: intelligence.layoutPlan,
    material_logic: intelligence.materialLogic,
    source_boundary: intelligence.sourceBoundary,
    reduction_map: intelligence.reductionMap,
    distillation_plan: intelligence.distillationPlan,
    scene_delta: intelligence.sceneDelta,
    art_direction_record: intelligence.artDirection,
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
      network_transmission: state.capability.imageGeneration ? 'optional-generation-endpoint-enabled' : 'none-in-core-studio',
      network_payload: state.capability.imageGeneration
        ? ['compiled prompt', 'API key', 'model and size request', ...(state.capability.imageEditing ? ['selected source image'] : [])]
        : [],
      session_only_source: state.source.kind === 'user-upload',
      memory_evidence_in_embedded_provenance: 'counts-and-policy-only'
    }
  };
}

export function serializeCreationBrief(state) {
  return JSON.stringify(buildCreationBrief(state), null, 2);
}

export function compilePrompt(state) {
  const contract = buildSceneContract(state);
  const intelligence = buildSceneIntelligence(state, contract);
  const graph = sceneGraphSummary(intelligence.sceneGraph);
  const budget = intelligence.mutationBudget.values;
  const sourceBoundary = intelligence.sourceBoundary;
  const sections = [
    ['OUTPUT CONTRACT', 'Create a flat ' + getOrientation(state.aspectRatio) + ' ' + state.aspectRatio + ' ' + state.route + ' artifact for Still Scenes. Output is RGB raster; do not claim CMYK or press certification.'],
    ['SOURCE ROLE', sourceBoundary.role + ' — use only: ' + list(sourceBoundary.permitted) + '. Prohibit: ' + list(sourceBoundary.prohibited) + '.'],
    ['SCENE GRAPH', 'Anchor: ' + graph.anchor + '. Focal position: ' + graph.focalPosition + '. Dominant gesture: ' + graph.dominantGesture + '. Gaze or motion: ' + graph.gazeOrMotion + '. Horizon: ' + graph.horizon + '. Density: ' + graph.density + '. Relations: ' + list(graph.relations) + '. Quiet fields: ' + list(graph.quietFields) + '.'],
    ['SCENE CONTRACT', 'Identity locks: ' + list(contract.identity_locks) + '. Geometry locks: ' + list(contract.geometry_locks) + '. Spatial locks: ' + list(contract.spatial_locks) + '. Count locks: ' + list(contract.count_locks) + '. Palette locks: ' + list(contract.palette_locks) + '.'],
    ['MEMORY AUTHORITY', memoryEvidencePromptSummary(contract.memory_evidence)],
    ['MUTATION BUDGET', 'Identity ' + budget.identity + '; geometry ' + budget.geometry + '; spatial relation ' + budget.spatial_relation + '; palette ' + budget.palette + '; count ' + budget.count + '; crop ' + budget.crop + '; scale ' + budget.scale + '; texture ' + budget.texture + '; material ' + budget.material + '; composition ' + budget.composition + '; abstraction ' + budget.abstraction + '; background detail ' + budget.background_detail + '; added elements ' + budget.added_elements + '; removal ' + budget.removal + '. Contract locks override all freedom.'],
    ['TRANSFORMATION PATH', state.transformationPath + ' — ' + transformationFor(state) + (intelligence.distillationPlan ? ' Distillation sequence: observation — ' + list(intelligence.distillationPlan.observation) + '; residue — ' + list(intelligence.distillationPlan.residue) + '; relation — ' + list(intelligence.distillationPlan.relation) + '; tension — ' + list(intelligence.distillationPlan.tension) + '; form — ' + list(intelligence.distillationPlan.form) + '; opening — ' + list(intelligence.distillationPlan.opening) + '.' : '')],
    ['LAYOUT PLAN', compositionFor(state, intelligence.layoutPlan) + ' Focal protection: ' + list(intelligence.layoutPlan.focal_protection) + '.'],
    ['REDUCTION MAP', state.transformationPath === 'preserve' ? 'No semantic reduction. Preserve defining source detail. ' + list(intelligence.reductionMap.filter((entry) => /protect|retain|keep/.test(entry))) : list(intelligence.reductionMap)],
    ['MATERIAL LOGIC', materialFor(state, intelligence.materialLogic)],
    ['COLOR FUNCTION', 'Use ' + state.accentColor + ' only for ' + state.accentReason + '. Preserve source-resonant palette evidence and avoid arbitrary accent blocks.'],
    ['LOCKED COPY STRATEGY', copyStrategy(state, contract)],
    ['REPRODUCTION', 'Flat front-facing paper object. Stable seeded texture. Keep locked copy free from aggressive grain, distortion, and misregistration.'],
    ['PRIVACY / REFERENCE BOUNDARY', 'Use only the declared source role. Never infer location from EXIF, filename, or visual recognition. Do not transfer reference residue. ' + list(sourceBoundary.privacy) + '.'],
    ['HARD FAILURES', list(contract.forbidden_mutations.concat(sourceBoundary.prohibited))],
    ['SCENE DELTA EXPECTATION', 'Retain: ' + list(intelligence.sceneDelta.retained) + '. Simplify: ' + list(intelligence.sceneDelta.simplified) + '. Transform: ' + list(intelligence.sceneDelta.transformed) + '. Remove: ' + list(intelligence.sceneDelta.removed) + '. This is an intended delta, not an unobserved claim.']
  ];

  return sections.map((section) => section[0] + '\n' + section[1]).join('\n\n');
}
