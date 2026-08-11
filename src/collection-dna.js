export function buildCollectionDNA(input = {}) {
  const deliberateBreak = input.breakCollection === true;
  return {
    schema: 'still-scenes/collection-dna/v1',
    name: String(input.name || 'Untitled collection'),
    mode: deliberateBreak ? 'deliberate-break' : 'belong',
    shared_principles: [...(input.sharedPrinciples || ['one authoritative scene per artifact', 'quiet copy hierarchy'])],
    paper_family: input.paperFamily || 'warm-archive',
    typography_family: input.typographyFamily || 'editorial',
    caption_voice: input.captionVoice || 'observational',
    typical_text_density: input.typicalTextDensity || 'very-low',
    typical_scene_scale: input.typicalSceneScale || 'medium',
    quietness: input.quietness || 'high',
    accent_logic: input.accentLogic || 'source resonance',
    recurring_mark: input.recurringMark || 'none',
    preferred_materials: [...(input.preferredMaterials || ['clean photograph', 'soft film', 'reduction print'])],
    avoided_materials: [...(input.avoidedMaterials || ['arbitrary torn paper', 'decorative sticker clutter'])],
    transformation_bias: { preserve: 'preferred', reduce: 'frequent', hybrid: 'occasional', distill: 'declared when requested', ...(input.transformationBias || {}) },
    recurring_layout_logic: input.recurringLayoutLogic || 'protect the scene-defined quiet field without repeating coordinates',
    recurring_edge_logic: input.recurringEdgeLogic || 'clean or source-derived edges',
    rhythm_preferences: [...(input.rhythmPreferences || ['wide', 'close', 'detail', 'quiet'])],
    variable_axes: [...(input.variableAxes || ['layout', 'crop', 'image scale', 'caption placement', 'texture'])],
    deliberate_break: deliberateBreak ? String(input.breakReason || 'user requested a deliberate departure') : null,
    memory_scope: 'current request or explicitly supplied collection only'
  };
}

export function validateCollectionDNA(collection) {
  const errors = [];
  if (collection?.memory_scope !== 'current request or explicitly supplied collection only') errors.push('Collection DNA must not imply hidden cross-session memory.');
  if (!Array.isArray(collection?.variable_axes) || collection.variable_axes.length < 3) errors.push('Collection DNA needs at least three meaningful variation axes.');
  if (collection?.mode === 'deliberate-break' && !collection.deliberate_break) errors.push('A deliberate collection break needs an explicit reason.');
  return { valid: errors.length === 0, errors };
}
