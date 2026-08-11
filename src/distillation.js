function labels(values) {
  return (values || []).map((value) => typeof value === 'string' ? value : value.label || value.region || '').filter(Boolean);
}

export function buildDistillationPlan({ state, sceneGraph, sceneContract, sourceBoundary }) {
  if (sceneContract.transformation_path !== 'distill') return null;
  const relations = labels(sceneGraph.relations);
  const quietFields = labels(sceneGraph.quiet_fields);
  const observation = labels(sceneGraph.nodes);
  const residue = [sceneContract.anchor, ...sceneContract.scene_dna].filter(Boolean);
  const form = relations.length
    ? ['translate the declared relation into separated or intersecting paper-native forms without tracing source contours']
    : ['isolate the declared anchor as a new paper-native form inside the protected quiet field'];
  return {
    schema: 'still-scenes/distillation-plan/v1',
    evidence_status: 'declared',
    observation,
    residue,
    relation: relations,
    tension: [],
    tension_policy: 'Do not invent emotional or symbolic tension; add it only when the user explicitly declares it.',
    form,
    opening: quietFields.length ? quietFields : ['leave one unresolved quiet field around the primary relation'],
    source_raster: 'prohibited',
    source_role: sourceBoundary.role,
    limitation: state.source?.kind === 'none'
      ? 'The plan uses user declarations because no source raster is loaded.'
      : 'The source may supply scene evidence, but recognizable source raster and traced contours are prohibited.'
  };
}
