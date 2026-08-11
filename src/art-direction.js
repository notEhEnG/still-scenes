export function buildArtDirectionRecord({ sceneGraph, sceneContract, mutationBudget, layoutPlan, materialLogic, sourceBoundary, sceneDelta, distillationPlan = null }) {
  return {
    schema: 'still-scenes/art-direction/v1',
    anchor: sceneContract.anchor,
    source_role: sourceBoundary.role,
    transformation_path: sceneContract.transformation_path,
    scene_read: {
      focal_position: sceneGraph.directions.focal_position,
      dominant_gesture: sceneGraph.directions.dominant_gesture,
      quiet_fields: sceneGraph.quiet_fields,
      density: sceneGraph.density
    },
    decisions: [
      { choice: 'layout', value: layoutPlan.family, reason: layoutPlan.rationale.join(' ') || 'Selected from the declared route and scene constraints.' },
      { choice: 'material', value: materialLogic.treatment, reason: materialLogic.reason },
      { choice: 'mutation profile', value: mutationBudget.profile, reason: mutationBudget.rule }
    ],
    warnings: [...materialLogic.warnings],
    distillation: distillationPlan,
    scene_delta: sceneDelta,
    disclosure: 'This record explains declared inputs and resulting design decisions. It is not hidden chain-of-thought or a claim of visual observation.'
  };
}
