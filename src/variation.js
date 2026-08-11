const AXES = Object.freeze({
  layout: ['scene-weighted-front', 'relational-cluster', 'horizon-split', 'small-window-memory'],
  crop: ['fit-within-safe-area', 'scene-aware-cover', 'edge-anchored-fit', 'wide-context-fit'],
  imageScale: ['small', 'medium', 'large'],
  pictureShare: ['restrained', 'balanced', 'dominant'],
  captionPlacement: ['left counterfield', 'right counterfield', 'lower band', 'upper margin'],
  accentFunction: ['source resonance', 'temperature counterpoint', 'spatial counterweight', 'directional cue'],
  edgeBehavior: ['clean border', 'asymmetric extension', 'contained fragment', 'full field'],
  material: ['clean photograph', 'soft film', 'reduction print', 'paper relief'],
  transformationPath: ['preserve', 'reduce', 'hybrid', 'distill'],
  texture: ['subtle', 'film', 'risograph', 'clean']
});

function choice(axis, index, offset = 0) {
  const values = AXES[axis];
  return values[(index + offset) % values.length];
}

export function recipeDifferences(left, right) {
  return Object.keys(AXES).filter((axis) => left[axis] !== right[axis]);
}

export function similarityGuard(candidate, existing, minimumChangedAxes = 3) {
  const comparisons = existing.map((recipe) => ({ recipe, changedAxes: recipeDifferences(candidate, recipe) }));
  const collision = comparisons.find((entry) => entry.changedAxes.length < minimumChangedAxes);
  return {
    passes: !collision,
    minimumChangedAxes,
    closestDifferenceCount: comparisons.length ? Math.min(...comparisons.map((entry) => entry.changedAxes.length)) : Object.keys(AXES).length,
    collision: collision ? { changedAxes: collision.changedAxes } : null
  };
}

export function generateVariationSet(count, base = {}, collectionDNA = null) {
  const total = Math.max(1, Math.min(24, Number(count) || 1));
  const recipes = [];
  for (let index = 0; index < total; index += 1) {
    let offset = 0;
    let candidate;
    do {
      candidate = {
        layout: choice('layout', index, offset),
        crop: choice('crop', index * 2, offset),
        imageScale: choice('imageScale', index, offset),
        pictureShare: choice('pictureShare', index * 2, offset),
        captionPlacement: choice('captionPlacement', index * 3, offset),
        accentFunction: choice('accentFunction', index * 2, offset),
        edgeBehavior: choice('edgeBehavior', index * 3, offset),
        material: choice('material', index * 2, offset),
        transformationPath: choice('transformationPath', index, offset),
        texture: choice('texture', index * 3, offset),
        paperFamily: collectionDNA?.paper_family || base.paperFamily || 'warm-archive',
        typographyFamily: collectionDNA?.typography_family || base.typographyFamily || 'editorial',
        narrativeRole: base.narrativeRole || null
      };
      offset += 1;
    } while (!similarityGuard(candidate, recipes).passes && offset < 12);
    recipes.push(candidate);
  }
  return {
    schema: 'still-scenes/variation-set/v1',
    scope: 'current request only',
    recipes,
    guard: recipes.map((recipe, index) => similarityGuard(recipe, recipes.slice(0, index)))
  };
}
