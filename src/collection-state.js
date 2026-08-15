import { buildCollectionDNA, validateCollectionDNA } from './collection-dna.js';
import { generateStudioVariationSet } from './collection-recipe.js';
import { planMemorySequence } from './memory-sequence.js';

const COLLECTION_SCHEMA = 'still-scenes/collection-workspace/v1';

function cloneCopyMeta(copyMeta = {}) {
  return Object.fromEntries(Object.entries(copyMeta).map(([key, value]) => [key, { ...value }]));
}

export function captureEditorState(state) {
  return {
    ...state,
    source: { ...state.source },
    copyMeta: cloneCopyMeta(state.copyMeta),
    capability: { ...state.capability },
    paletteSamples: [...(state.paletteSamples || [])],
    variationRecipe: state.variationRecipe ? {
      ...state.variationRecipe,
      requested: { ...state.variationRecipe.requested },
      renderedAxes: [...(state.variationRecipe.renderedAxes || [])]
    } : null
  };
}

export function restoreEditorState(target, snapshot) {
  Object.assign(target, captureEditorState(snapshot));
  return target;
}

export function createCollectionWorkspace(options = {}) {
  const collectionDNA = buildCollectionDNA({
    name: options.name,
    paperFamily: options.paperFamily,
    typographyFamily: options.typographyFamily,
    captionVoice: options.captionVoice,
    accentLogic: options.accentLogic,
    sharedPrinciples: options.sharedPrinciples
  });
  return {
    schema: COLLECTION_SCHEMA,
    name: collectionDNA.name,
    mode: 'collection',
    defaultRoute: options.defaultRoute || 'front',
    orderPolicy: 'preserve-upload-order',
    selectedItemId: null,
    nextItemNumber: 1,
    collectionDNA,
    sequencePlan: null,
    variationSet: null,
    plannedAt: null,
    items: [],
    errors: []
  };
}

export function addCollectionItem(workspace, editorState, label = '') {
  if (workspace.items.length >= 12) throw new Error('A collection supports up to 12 artworks.');
  const itemNumber = workspace.nextItemNumber;
  const id = 'collection-item-' + itemNumber;
  workspace.nextItemNumber += 1;
  const item = {
    id,
    label: String(label || 'Artwork ' + itemNumber),
    state: captureEditorState(editorState),
    narrativeRole: null,
    pace: null,
    recipe: null,
    routeOverride: false,
    qualityStatus: 'not-run',
    error: ''
  };
  workspace.items.push(item);
  if (!workspace.selectedItemId) workspace.selectedItemId = id;
  return item;
}

export function selectedCollectionItem(workspace) {
  return workspace.items.find((item) => item.id === workspace.selectedItemId) || null;
}

export function saveSelectedCollectionItem(workspace, state) {
  const item = selectedCollectionItem(workspace);
  if (item) item.state = captureEditorState(state);
  return item;
}

export function selectCollectionItem(workspace, itemId) {
  if (!workspace.items.some((item) => item.id === itemId)) throw new Error('Unknown collection item: ' + itemId);
  workspace.selectedItemId = itemId;
  return selectedCollectionItem(workspace);
}

export function moveCollectionItem(workspace, itemId, direction) {
  const index = workspace.items.findIndex((item) => item.id === itemId);
  if (index < 0) throw new Error('Unknown collection item: ' + itemId);
  const nextIndex = Math.max(0, Math.min(workspace.items.length - 1, index + direction));
  if (nextIndex === index) return workspace.items;
  const current = workspace.items[index];
  workspace.items[index] = workspace.items[nextIndex];
  workspace.items[nextIndex] = current;
  return workspace.items;
}

export function updateCollectionIdentity(workspace, input = {}) {
  const next = buildCollectionDNA({
    name: input.name || workspace.name,
    paperFamily: input.paperFamily || workspace.collectionDNA.paper_family,
    typographyFamily: input.typographyFamily || workspace.collectionDNA.typography_family,
    captionVoice: input.captionVoice || workspace.collectionDNA.caption_voice,
    accentLogic: input.accentLogic || workspace.collectionDNA.accent_logic,
    sharedPrinciples: input.sharedPrinciples || workspace.collectionDNA.shared_principles
  });
  const validation = validateCollectionDNA(next);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  workspace.name = next.name;
  workspace.collectionDNA = next;
  if (input.defaultRoute) workspace.defaultRoute = input.defaultRoute;
  return next;
}

export function planCollection(workspace) {
  if (workspace.items.length < 2) throw new Error('Add at least two photographs before planning a collection.');
  workspace.variationSet = generateStudioVariationSet(
    workspace.items.length,
    {},
    workspace.collectionDNA,
    workspace.defaultRoute
  );
  workspace.sequencePlan = planMemorySequence(workspace.items.map((item) => ({
    id: item.id,
    sourceKind: item.state.source?.kind || 'photo',
    orientation: item.state.source?.width >= item.state.source?.height ? 'landscape' : 'portrait',
    sceneAnchor: item.state.sceneAnchor,
    transformationPath: item.state.transformationPath
  })), {
    preserveOrder: true,
    title: workspace.name,
    collectionDNA: workspace.collectionDNA
  });
  workspace.items.forEach((item, index) => {
    const sequenceItem = workspace.sequencePlan.items[index];
    item.recipe = workspace.variationSet.studioRecipes[index];
    item.narrativeRole = sequenceItem.narrativeRole;
    item.pace = sequenceItem.pace;
  });
  workspace.plannedAt = new Date().toISOString();
  return workspace;
}

export function collectionSummary(workspace) {
  return {
    schema: workspace.schema,
    name: workspace.name,
    itemCount: workspace.items.length,
    orderPolicy: workspace.orderPolicy,
    defaultRoute: workspace.defaultRoute,
    plannedAt: workspace.plannedAt
  };
}
