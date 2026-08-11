export function resolveSourceRole(state, transformationPath = state.transformationPath) {
  if (state.sourceRole && state.sourceRole !== 'auto') return state.sourceRole;
  if (transformationPath === 'distill') return state.source?.kind === 'none' ? 'none' : 'scene-evidence';
  if (state.source?.kind === 'none') return 'none';
  return 'scene-anchor';
}

export function buildSourceBoundary(state, sceneContract) {
  const role = sceneContract.source_role || resolveSourceRole(state, sceneContract.transformation_path);
  const commonResidue = ['unapproved readable text', 'logos', 'signatures', 'watermarks', 'hidden dates', 'inferred location'];
  const boundaries = {
    'scene-anchor': {
      permitted: ['recognizable source pixels', 'declared crop', 'declared material treatment', 'Scene Graph relations'],
      prohibited: ['redrawing a locked anchor', ...commonResidue]
    },
    'scene-evidence': {
      permitted: ['declared Scene DNA', 'palette evidence', 'dominant gesture', 'depth relation', 'quiet-field relation', 'emotional temperature'],
      prohibited: ['recognizable source-photo raster', 'traced contour presented as source-free', 'source-specific layout residue', ...commonResidue]
    },
    'reference-grammar': {
      permitted: ['layout rhythm', 'paper character', 'typography role', 'reproduction process', 'color relationship'],
      prohibited: ['exact layout', 'source person', 'source object identity', ...commonResidue]
    },
    'supporting-fragment': {
      permitted: ['the explicitly named retained fragment', 'source-derived geometry around that fragment'],
      prohibited: ['substituting a generated look-alike for the retained fragment', ...commonResidue]
    },
    'generated-scene': { permitted: ['user-authored scene instructions'], prohibited: commonResidue },
    none: { permitted: ['user-authored scene instructions and declared Scene Graph'], prohibited: commonResidue }
  };
  return {
    schema: 'still-scenes/source-boundary/v1',
    role,
    ...(boundaries[role] || boundaries.none),
    must_preserve: [sceneContract.anchor, ...(sceneContract.identity_locks || []), ...(sceneContract.geometry_locks || []), ...(sceneContract.count_locks || [])].filter(Boolean),
    may_transform: [...(sceneContract.allowed_mutations || [])],
    may_reference: [...((boundaries[role] || boundaries.none).permitted)],
    must_not_transfer: [...((boundaries[role] || boundaries.none).prohibited)],
    privacy: ['do not inspect EXIF GPS', 'do not infer a printable location', 'do not transfer undeclared metadata'],
    status: 'declared'
  };
}

export function auditSourceBoundary(boundary, evidence = {}) {
  const violations = [];
  if (boundary.role === 'scene-evidence' && evidence.sourcePixelsUsed === true) violations.push('Recognizable source pixels were used by a scene-evidence output.');
  if (evidence.inferredLocation === true) violations.push('A printable location was inferred instead of explicitly supplied.');
  if (evidence.referenceResidueTransferred === true) violations.push('Reference residue was transferred into the output.');
  return {
    status: violations.length ? 'failed' : Object.keys(evidence).length ? 'verified' : 'declared',
    violations,
    checkedEvidence: Object.keys(evidence),
    limitation: Object.keys(evidence).length ? null : 'No output observation was supplied; the boundary is declared, not verified.'
  };
}
