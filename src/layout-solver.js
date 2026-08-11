function textPressure(state) {
  const length = String(state.caption || '').length + String(state.location || '').length + String(state.date || '').length;
  return Math.min(1, length / 260);
}

function meaningfulDirection(value) {
  return ['left', 'right', 'up', 'down', 'inward', 'outward'].includes(value) ? value : null;
}

function orientationFor(aspectRatio) {
  const match = String(aspectRatio).match(/^([0-9.]+):([0-9.]+)$/);
  if (!match) return aspectRatio === 'A6-land' ? 'landscape' : 'unknown';
  return Number(match[1]) >= Number(match[2]) ? 'landscape' : 'portrait';
}

export function solveLayoutPlan({ state, sceneGraph, sceneContract, mutationBudget }) {
  const route = state.route;
  const density = sceneGraph.density;
  const focal = sceneGraph.directions.focal_position;
  const gaze = meaningfulDirection(sceneGraph.directions.gaze_or_motion);
  const gesture = meaningfulDirection(sceneGraph.directions.dominant_gesture);
  const pressure = textPressure(state);
  const horizon = sceneGraph.directions.horizon === 'strong';
  const rationale = [];

  if (route === 'back') {
    return {
      schema: 'still-scenes/layout-plan/v1', route, ratio: state.aspectRatio, orientation: orientationFor(state.aspectRatio), family: 'writable-back', image_share: 0, text_share: 1,
      quiet_field_share: 0.58, photo_alignment: 'not-applicable', crop_policy: 'not-applicable',
      crop_strategy: 'not-applicable', focal_region: 'not-applicable', protected_regions: [], text_regions: ['message field', 'recipient field'], quiet_regions: ['writing field'],
      breathing_direction: 'message field', caption_placement: 'message header', focal_protection: [],
      alignment_logic: 'separate message and recipient utility fields', visual_entry: 'message header', visual_exit: 'recipient field',
      constraints: ['message and recipient fields stay separate', 'postal marks remain decorative'],
      rationale: ['The selected surface is a writable back, so source-scene composition is not applied.']
    };
  }

  let imageShare = route === 'split' ? Number(state.splitRatio || 0.46) : route === 'zine' ? 0.34 : 0.8;
  if (density === 'dense') {
    imageShare += route === 'zine' ? 0.06 : 0.04;
    rationale.push('Dense scene evidence receives additional image area before secondary detail is reduced.');
  }
  if (pressure > 0.55) {
    imageShare -= route === 'split' ? 0.05 : 0.08;
    rationale.push('Long locked copy receives additional measured text area without rewriting.');
  }
  if (horizon) rationale.push('A strong declared horizon stays level and receives uninterrupted width.');
  if (gaze) rationale.push('Breathing room is reserved in the declared gaze or motion direction.');
  if (sceneGraph.quiet_fields.length) rationale.push('Declared or focal-derived quiet fields remain low-density and free of decorative clutter.');

  const family = route === 'split'
    ? (horizon ? 'horizon-split' : 'scene-weighted-split')
    : route === 'zine' ? (horizon ? 'open-horizon-event' : 'relational-cluster')
      : horizon ? 'wide-horizon-front' : 'scene-weighted-front';
  const photoAlignment = ['far-right', 'right'].includes(focal) ? 'right' : ['far-left', 'left'].includes(focal) ? 'left' : 'center';
  const breathingDirection = gaze || gesture || (photoAlignment === 'left' ? 'right' : photoAlignment === 'right' ? 'left' : 'outer field');
  const cropPolicy = mutationBudget.values.crop === 'locked' || mutationBudget.values.geometry === 'locked'
    ? 'fit-within-safe-area'
    : horizon ? 'cover-with-level-horizon' : 'scene-aware-cover';
  const sourceRatio = state.source?.width && state.source?.height ? state.source.width / state.source.height : null;
  const targetPortrait = orientationFor(state.aspectRatio) === 'portrait';
  const extremeSourceMismatch = sourceRatio && ((sourceRatio > 2.4 && targetPortrait) || (sourceRatio < 0.42 && !targetPortrait));
  const resolvedCropPolicy = extremeSourceMismatch ? 'fit-with-border' : cropPolicy;
  if (extremeSourceMismatch) rationale.push('Extreme source/output ratio mismatch forces fit-with-border instead of a destructive center crop.');
  const quietShare = Math.max(0.12, Math.min(0.78, 1 - imageShare + (route === 'zine' ? 0.18 : 0)));
  const quietRegions = sceneGraph.quiet_fields.map((field) => field.region);

  return {
    schema: 'still-scenes/layout-plan/v1',
    route,
    ratio: state.aspectRatio,
    orientation: orientationFor(state.aspectRatio),
    family,
    image_share: Number(Math.max(0.22, Math.min(0.9, imageShare)).toFixed(3)),
    text_share: Number(Math.max(0.1, Math.min(0.78, 1 - imageShare)).toFixed(3)),
    quiet_field_share: Number(quietShare.toFixed(3)),
    photo_alignment: photoAlignment,
    crop_policy: resolvedCropPolicy,
    crop_strategy: resolvedCropPolicy,
    focal_region: focal,
    protected_regions: [focal, ...quietRegions, horizon ? 'declared horizon' : null].filter(Boolean),
    text_regions: [breathingDirection === 'right' ? 'left counterfield' : breathingDirection === 'left' ? 'right counterfield' : 'quiet counterfield'],
    quiet_regions: quietRegions,
    breathing_direction: breathingDirection,
    caption_placement: breathingDirection === 'right' ? 'left counterfield' : breathingDirection === 'left' ? 'right counterfield' : 'quiet counterfield',
    focal_protection: [sceneContract.anchor, ...sceneContract.spatial_locks].filter(Boolean),
    alignment_logic: 'Align the source anchor ' + photoAlignment + ' while protecting breathing room toward ' + breathingDirection + '.',
    visual_entry: quietRegions[0] || photoAlignment,
    visual_exit: breathingDirection,
    constraints: [
      'keep locked copy outside the declared focal anchor',
      'preserve safe margins',
      'do not crop identity, count, or geometry locks',
      horizon ? 'keep the declared horizon level' : 'preserve declared spatial relations'
    ],
    rationale
  };
}
