const POSITIONS = new Set(['far-left', 'left', 'center', 'right', 'far-right', 'auto']);
const DIRECTIONS = new Set(['left', 'right', 'up', 'down', 'inward', 'outward', 'static', 'auto']);
const DENSITIES = new Set(['sparse', 'balanced', 'dense']);

function lines(value) {
  return String(value || '').split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
}

function normalizedChoice(value, allowed, fallback) {
  return allowed.has(value) ? value : fallback;
}

function inferredDepth(subjectCategory) {
  if (['landscape', 'city'].includes(subjectCategory)) return ['foreground', 'middle-ground', 'background'];
  if (['person', 'product'].includes(subjectCategory)) return ['anchor plane', 'supporting background'];
  if (subjectCategory === 'clouds') return ['weather mass', 'open sky field'];
  return ['anchor plane', 'supporting field'];
}

function oppositeField(position) {
  if (['far-left', 'left'].includes(position)) return 'right';
  if (['far-right', 'right'].includes(position)) return 'left';
  return 'outer field';
}

function depthStructure(layers) {
  return {
    foreground: layers.filter((layer) => /foreground|anchor plane/.test(layer)),
    middle: layers.filter((layer) => /middle|supporting|weather mass/.test(layer)),
    background: layers.filter((layer) => /background|sky field/.test(layer))
  };
}

export function buildSceneGraph(state) {
  const anchor = String(state.sceneAnchor || state.source?.description || '').trim();
  const dna = lines(state.sceneDNA);
  const relationships = lines(state.sceneRelationships);
  const focalPosition = normalizedChoice(state.sceneFocalPosition, POSITIONS, 'auto');
  const dominantDirection = normalizedChoice(state.sceneDirection, DIRECTIONS, 'auto');
  const gazeDirection = normalizedChoice(state.sceneGazeDirection, DIRECTIONS, 'auto');
  const density = normalizedChoice(state.sceneDensity, DENSITIES, 'balanced');
  const quietFields = lines(state.quietField).map((region) => ({ region, importance: 'high', source: 'declared' }));
  const nodes = [];
  if (anchor) nodes.push({
    id: 'anchor', type: state.subjectCategory || 'scene', role: 'anchor', label: anchor,
    visual_weight: 'primary', source_region: focalPosition, locked: true, safe_to_simplify: false, source: 'declared'
  });
  dna.forEach((label, index) => nodes.push({
    id: 'dna-' + (index + 1), type: 'scene-fact', role: 'scene-dna', label,
    visual_weight: index === 0 ? 'secondary' : 'supporting', source_region: 'declared-in-copy',
    locked: true, safe_to_simplify: false, source: 'declared'
  }));
  const depthLayers = inferredDepth(state.subjectCategory);
  const resolvedQuietFields = quietFields.length
    ? quietFields
    : [{ region: oppositeField(focalPosition), importance: 'derived', source: 'derived-from-declared-focal-position' }];
  const eyePath = [resolvedQuietFields[0]?.region, nodes[0]?.id, meaningfulDirection(gazeDirection) || meaningfulDirection(dominantDirection)]
    .filter(Boolean);
  return {
    schema: 'still-scenes/scene-graph/v1',
    nodes,
    relations: relationships.map((label, index) => ({
      id: 'relation-' + (index + 1),
      from: nodes[0]?.id || null,
      to: nodes[index + 1]?.id || null,
      subject: nodes[0]?.id || 'undeclared-anchor',
      relation: 'declared-relation',
      object: nodes[index + 1]?.id || label,
      strength: 'declared',
      label,
      source: 'declared'
    })),
    directions: {
      focal_position: focalPosition,
      dominant_gesture: dominantDirection,
      gaze_or_motion: gazeDirection,
      eye_path: eyePath,
      motion_vector: meaningfulDirection(gazeDirection) || meaningfulDirection(dominantDirection) || 'not-declared',
      horizon: state.strongHorizon ? 'strong' : 'not-declared'
    },
    depth_layers: depthLayers,
    depth: depthStructure(depthLayers),
    quiet_fields: resolvedQuietFields,
    focal_hierarchy: nodes.map((node, index) => ({ node: node.id, rank: index + 1 })),
    focal_structure: { primary: nodes[0]?.id || null, secondary: nodes.slice(1).map((node) => node.id) },
    density,
    source_evidence: {
      source_kind: state.source?.kind || 'none',
      dimensions: state.source?.width && state.source?.height ? [state.source.width, state.source.height] : null,
      palette: [...(state.paletteSamples || [])],
      declared: [anchor, ...dna, ...relationships].filter(Boolean),
      observed: [],
      inferred: [],
      observation_status: 'declared'
    }
  };
}

function meaningfulDirection(value) {
  return ['left', 'right', 'up', 'down', 'inward', 'outward'].includes(value) ? value : null;
}

export function graphReductionGuidance(graph) {
  const guidance = [];
  if (graph.density === 'dense') guidance.push('reduce secondary micro-detail before changing the anchor or protected relations');
  if (graph.directions.horizon === 'strong') guidance.push('keep the declared horizon level and uninterrupted while simplifying texture around it');
  if (meaningfulDirection(graph.directions.gaze_or_motion)) guidance.push('keep the ' + graph.directions.gaze_or_motion + ' gaze or motion path open');
  for (const field of graph.quiet_fields || []) guidance.push('protect the quiet field at ' + field.region + ' from added clutter');
  for (const relation of graph.relations || []) guidance.push('retain the declared relation: ' + relation.label);
  return guidance;
}

export function validateSceneGraph(graph) {
  const errors = [];
  const warnings = [];
  if (!graph || graph.schema !== 'still-scenes/scene-graph/v1') errors.push('Unsupported or missing Scene Graph schema.');
  if (!Array.isArray(graph?.nodes) || !graph.nodes.some((node) => node.role === 'anchor')) warnings.push('No declared anchor node.');
  const ids = new Set();
  for (const node of graph?.nodes || []) {
    if (!node.id || ids.has(node.id)) errors.push('Scene Graph node IDs must be present and unique.');
    ids.add(node.id);
  }
  for (const relation of graph?.relations || []) {
    if (relation.from && !ids.has(relation.from)) errors.push('Relation ' + relation.id + ' has an unknown source node.');
    if (relation.to && !ids.has(relation.to)) warnings.push('Relation ' + relation.id + ' has no resolved target node.');
  }
  if (!POSITIONS.has(graph?.directions?.focal_position)) errors.push('Invalid focal position.');
  if (!DENSITIES.has(graph?.density)) errors.push('Invalid scene density.');
  return { valid: errors.length === 0, errors, warnings };
}

export function sceneGraphSummary(graph) {
  const anchor = graph.nodes.find((node) => node.role === 'anchor')?.label || 'undeclared anchor';
  const relations = graph.relations.map((relation) => relation.label);
  return {
    anchor,
    relations,
    focalPosition: graph.directions.focal_position,
    dominantGesture: graph.directions.dominant_gesture,
    gazeOrMotion: graph.directions.gaze_or_motion,
    horizon: graph.directions.horizon,
    quietFields: graph.quiet_fields,
    density: graph.density
  };
}
