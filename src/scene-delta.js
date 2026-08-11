const STATUS_MAP = Object.freeze({
  pass: 'verified', verified: 'verified', warn: 'warning', warning: 'warning', fail: 'failed', failed: 'failed',
  declared: 'declared', 'not-applicable': 'not-applicable'
});

export function normalizeVerificationStatus(status, fallback = 'declared') {
  return STATUS_MAP[status] || fallback;
}

export function buildExpectedSceneDelta({ sceneContract, sceneGraph, mutationBudget, layoutPlan, materialLogic, reductionMap = [] }) {
  const path = sceneContract.transformation_path;
  return {
    schema: 'still-scenes/scene-delta/v1',
    observation_status: 'expected',
    retained: [sceneContract.anchor, ...sceneContract.scene_dna, ...sceneContract.identity_locks, ...sceneContract.geometry_locks, ...sceneContract.count_locks].filter(Boolean),
    simplified: path === 'reduce' || path === 'hybrid' ? [...reductionMap] : [],
    transformed: [
      'layout → ' + layoutPlan.family,
      'material → ' + materialLogic.treatment,
      'palette freedom → ' + mutationBudget.values.palette
    ],
    removed: path === 'distill' ? ['recognizable source-photo raster'] : path === 'reduce' ? ['secondary visual micro-detail'] : [],
    added: ['paper family: ' + materialLogic.paper_family, 'texture: ' + materialLogic.texture],
    unexpected: [],
    unexpected_changes: [],
    lock_verification: {
      identity: 'declared', geometry: 'declared', spatial: 'declared', palette: 'declared', count: 'declared',
      text: sceneContract.text_locks.length ? 'declared' : 'not-applicable', source_boundary: 'declared', layout_safety: 'declared'
    },
    limitation: 'This is an expected delta compiled from declared constraints; it is not an observation of generated pixels.'
  };
}

export function applyVerificationToSceneDelta(delta, report, sourceBoundaryAudit = null) {
  const next = JSON.parse(JSON.stringify(delta));
  next.observation_status = report ? 'heuristically-compared' : 'expected';
  if (report) {
    next.lock_verification.palette = normalizeVerificationStatus(report.paletteMatch?.status);
    next.lock_verification.spatial = normalizeVerificationStatus(report.structuralSimilarity?.status);
    next.lock_verification.geometry = normalizeVerificationStatus(report.geometry?.status);
    next.lock_verification.layout_safety = normalizeVerificationStatus(report.geometry?.status);
    next.lock_verification.identity = 'declared';
    next.lock_verification.count = 'declared';
    const addUnexpected = (message) => {
      if (!next.unexpected.includes(message)) next.unexpected.push(message);
      if (!next.unexpected_changes.includes(message)) next.unexpected_changes.push(message);
    };
    if (['warning', 'failed'].includes(report.paletteMatch?.status)) addUnexpected('Returned-image palette diverged from source or declared palette locks.');
    if (['warning', 'failed'].includes(report.structuralSimilarity?.status)) addUnexpected('Returned-image coarse spatial structure diverged from the source dHash.');
    if (['warning', 'failed'].includes(report.geometry?.status)) addUnexpected('Returned-image surface ratio diverged from the declared output geometry.');
  }
  if (sourceBoundaryAudit) {
    next.lock_verification.source_boundary = normalizeVerificationStatus(sourceBoundaryAudit.status);
    for (const violation of sourceBoundaryAudit.violations || []) {
      if (!next.unexpected.includes(violation)) next.unexpected.push(violation);
      if (!next.unexpected_changes.includes(violation)) next.unexpected_changes.push(violation);
    }
  }
  next.limitation = 'Palette, dHash, and geometry are heuristic signals. Identity, count, and semantic fidelity remain declared unless a capable inspection verifies them.';
  return next;
}
