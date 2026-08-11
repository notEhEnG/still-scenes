import { buildArtDirectionRecord } from './art-direction.js';
import { buildDistillationPlan } from './distillation.js';
import { chooseMaterialLogic } from './material-logic.js';
import { solveLayoutPlan } from './layout-solver.js';
import { buildMutationBudget } from './mutation-budget.js';
import { getReductionMap } from './scene-contract.js';
import { buildExpectedSceneDelta } from './scene-delta.js';
import { buildSceneGraph, graphReductionGuidance, validateSceneGraph } from './scene-graph.js';
import { buildSourceBoundary } from './source-boundary.js';

export function buildSceneIntelligence(state, sceneContract) {
  const sceneGraph = buildSceneGraph(state);
  const graphValidation = validateSceneGraph(sceneGraph);
  const mutationBudget = buildMutationBudget(state, sceneContract);
  const sourceBoundary = buildSourceBoundary(state, sceneContract);
  const layoutPlan = solveLayoutPlan({ state, sceneGraph, sceneContract, mutationBudget });
  const materialLogic = chooseMaterialLogic(state, sceneContract, mutationBudget);
  const reductionMap = [...getReductionMap(state.subjectCategory), ...graphReductionGuidance(sceneGraph)];
  const distillationPlan = buildDistillationPlan({ state, sceneGraph, sceneContract, sourceBoundary });
  const sceneDelta = buildExpectedSceneDelta({
    sceneContract,
    sceneGraph,
    mutationBudget,
    layoutPlan,
    materialLogic,
    reductionMap
  });
  const artDirection = buildArtDirectionRecord({
    sceneGraph,
    sceneContract,
    mutationBudget,
    layoutPlan,
    materialLogic,
    sourceBoundary,
    sceneDelta,
    distillationPlan
  });
  return { sceneGraph, graphValidation, mutationBudget, sourceBoundary, layoutPlan, materialLogic, reductionMap, distillationPlan, sceneDelta, artDirection };
}
