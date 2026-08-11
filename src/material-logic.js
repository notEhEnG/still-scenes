const DESTRUCTIVE = new Set(['silhouette', 'halftone', 'specimen']);

function identitySensitive(contract) {
  const text = [...(contract.identity_locks || []), ...(contract.geometry_locks || []), ...(contract.count_locks || [])].join(' ').toLowerCase();
  return Boolean(text && !/not retained|not applicable/.test(text));
}

export function chooseMaterialLogic(state, sceneContract, mutationBudget) {
  const explicit = state.materialPreference && state.materialPreference !== 'auto'
    ? state.materialPreference
    : state.photoTreatment;
  let treatment = explicit || 'framed';
  const warnings = [];
  const sensitive = identitySensitive(sceneContract);
  const forbiddenMaterials = sensitive ? [...DESTRUCTIVE] : [];
  if (sceneContract.transformation_path === 'distill') treatment = 'source-free-paper-forms';
  else if (sensitive && DESTRUCTIVE.has(treatment) && mutationBudget.values.material !== 'free') {
    warnings.push(treatment + ' would obscure identity or geometry locks, so the plan falls back to framed.');
    treatment = 'framed';
  }
  const reasons = {
    framed: 'Keeps the photographic anchor legible while separating it from locked copy.',
    film: 'Softens reproduction without changing scene construction.',
    specimen: 'Supports a small declared detail when geometry is not identity-sensitive.',
    halftone: 'Reduces tonal micro-detail into a reproducible field when the mutation budget permits it.',
    silhouette: 'Uses only when identity and internal geometry are not protected.',
    'source-free-paper-forms': 'Translates scene evidence into new paper forms while prohibiting source raster.'
  };
  return {
    schema: 'still-scenes/material-logic/v1',
    requested: explicit,
    treatment,
    selected_material: treatment,
    paper_family: state.paperTone,
    texture: state.printTexture,
    source_relation: sceneContract.source_role === 'scene-evidence' ? 'source-free translation of declared scene evidence' : 'supports the visible source anchor within its locks',
    emotional_function: 'No symbolic emotion is inferred; material follows the declared scene and user choice.',
    structural_function: reasons[treatment] || 'Supports the declared layout and transformation path.',
    forbidden_materials: forbiddenMaterials,
    reason: reasons[treatment] || 'Applies the explicit material choice within the mutation budget.',
    user_override: Boolean(state.materialPreference && state.materialPreference !== 'auto'),
    warnings,
    locked_copy_layer: 'clean deterministic layer'
  };
}
