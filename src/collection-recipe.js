import { generateVariationSet, similarityGuard } from './variation.js';

const RENDERED_AXES = Object.freeze([
  'layout',
  'crop',
  'pictureShare',
  'material',
  'transformationPath',
  'texture'
]);

const MATERIAL_TREATMENTS = Object.freeze({
  'clean photograph': 'framed',
  'soft film': 'film',
  'reduction print': 'halftone',
  'paper relief': 'specimen'
});

const REDUCTION_BY_PATH = Object.freeze({
  preserve: 'none',
  reduce: 'simplified',
  hybrid: 'restrained',
  distill: 'distilled'
});

const IMAGE_SHARE_BY_ROUTE = Object.freeze({
  split: { restrained: 0.4, balanced: 0.48, dominant: 0.58 },
  front: { restrained: 0.62, balanced: 0.76, dominant: 0.88 },
  zine: { restrained: 0.24, balanced: 0.34, dominant: 0.44 }
});

const GUARANTEED_VALUES = Object.freeze({
  layout: ['scene-weighted-front', 'relational-cluster', 'horizon-split', 'small-window-memory'],
  pictureShare: ['restrained', 'balanced', 'dominant'],
  transformationPath: ['preserve', 'reduce', 'hybrid', 'distill'],
  texture: ['subtle', 'film', 'risograph', 'clean']
});

const GUARANTEED_RENDERED_AXES = Object.freeze(Object.keys(GUARANTEED_VALUES));

export function renderedRecipeDifferences(left, right) {
  return RENDERED_AXES.filter((axis) => left?.[axis] !== right?.[axis]);
}

function guaranteedDifferences(left, right) {
  return GUARANTEED_RENDERED_AXES.filter((axis) => left?.[axis] !== right?.[axis]);
}

function ensureRenderedVariation(recipes) {
  const adjusted = [];
  recipes.forEach((recipe, index) => {
    let resolved = null;
    for (let attempt = 0; attempt < 192 && !resolved; attempt += 1) {
      const candidate = {
        ...recipe,
        layout: GUARANTEED_VALUES.layout[(index + attempt) % GUARANTEED_VALUES.layout.length],
        pictureShare: GUARANTEED_VALUES.pictureShare[(index * 2 + Math.floor(attempt / 4)) % GUARANTEED_VALUES.pictureShare.length],
        transformationPath: GUARANTEED_VALUES.transformationPath[(index + Math.floor(attempt / 12)) % GUARANTEED_VALUES.transformationPath.length],
        texture: GUARANTEED_VALUES.texture[(index * 3 + Math.floor(attempt / 48)) % GUARANTEED_VALUES.texture.length]
      };
      const visiblyDistinct = adjusted.every((prior) => guaranteedDifferences(candidate, prior).length >= 3);
      if (visiblyDistinct && similarityGuard(candidate, adjusted).passes) resolved = candidate;
    }
    adjusted.push(resolved || recipe);
  });
  return adjusted;
}

export function adaptVariationRecipe(recipe, route = 'front') {
  const shares = IMAGE_SHARE_BY_ROUTE[route] || IMAGE_SHARE_BY_ROUTE.front;
  return {
    schema: 'still-scenes/studio-recipe/v1',
    requested: { ...recipe },
    layoutFamily: recipe.layout,
    cropPolicy: recipe.crop,
    imageShare: shares[recipe.pictureShare] || shares.balanced,
    photoTreatment: MATERIAL_TREATMENTS[recipe.material] || 'framed',
    transformationPath: recipe.transformationPath || 'preserve',
    printTexture: recipe.texture || 'subtle',
    paperTone: recipe.paperFamily || 'warm-archive',
    fontPairing: recipe.typographyFamily || 'editorial',
    accentReason: recipe.accentFunction || 'source resonance',
    captionPlacement: recipe.captionPlacement || 'quiet counterfield',
    renderedAxes: [...RENDERED_AXES]
  };
}

export function applyStudioRecipe(state, studioRecipe) {
  state.variationRecipe = studioRecipe;
  state.transformationPath = studioRecipe.transformationPath;
  state.reductionLevel = REDUCTION_BY_PATH[studioRecipe.transformationPath] || 'none';
  state.photoTreatment = studioRecipe.photoTreatment;
  state.printTexture = studioRecipe.printTexture;
  state.paperTone = studioRecipe.paperTone;
  state.fontPairing = studioRecipe.fontPairing;
  state.accentReason = studioRecipe.accentReason;
  if (state.route === 'split') state.splitRatio = studioRecipe.imageShare;
  return state;
}

export function generateStudioVariationSet(count, base = {}, collectionDNA = null, route = 'front') {
  const variationSet = generateVariationSet(count, base, collectionDNA);
  const recipes = ensureRenderedVariation(variationSet.recipes);
  const studioRecipes = recipes.map((recipe) => adaptVariationRecipe(recipe, route));
  const renderedGuard = studioRecipes.map((recipe, index) => {
    const prior = studioRecipes.slice(0, index);
    const comparisons = prior.map((entry) => guaranteedDifferences(recipe.requested, entry.requested));
    const closestDifferenceCount = comparisons.length
      ? Math.min(...comparisons.map((differences) => differences.length))
      : RENDERED_AXES.length;
    return {
      passes: closestDifferenceCount >= 3,
      minimumChangedAxes: 3,
      closestDifferenceCount
    };
  });
  return {
    ...variationSet,
    schema: 'still-scenes/studio-variation-set/v1',
    recipes,
    guard: recipes.map((recipe, index) => similarityGuard(recipe, recipes.slice(0, index))),
    studioRecipes,
    renderedGuard
  };
}

export function renderedAxes() {
  return [...RENDERED_AXES];
}
