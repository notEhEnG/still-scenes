const NARRATIVE_ROLES = ['establishing', 'observed-detail', 'human-trace', 'transition', 'quiet-close'];

function autoSequence(items) {
  const scaleRank = { wide: 0, medium: 1, close: 2, detail: 3 };
  return [...items].sort((left, right) => {
    const priority = Number(left.sequencePriority ?? 0) - Number(right.sequencePriority ?? 0);
    if (priority) return priority;
    if (left.closingPotential !== right.closingPotential) return left.closingPotential ? 1 : -1;
    return (scaleRank[left.shotScale] ?? 1) - (scaleRank[right.shotScale] ?? 1);
  });
}

export function planMemorySequence(items, options = {}) {
  if (!Array.isArray(items) || items.length < 2) throw new Error('A memory sequence requires at least two items.');
  const preserveOrder = options.preserveOrder !== false;
  const ordered = preserveOrder ? [...items] : autoSequence(items);
  const planned = ordered.map((item, index) => {
    const final = index === ordered.length - 1;
    const role = item.narrativeRole || (final ? 'quiet-close' : NARRATIVE_ROLES[Math.min(index, NARRATIVE_ROLES.length - 2)]);
    return {
      id: item.id || 'scene-' + (index + 1),
      sourceKind: item.sourceKind || 'unknown',
      narrativeRole: role,
      pace: final ? 'rest' : index % 3 === 0 ? 'wide' : 'close',
      orientation: item.orientation || (index % 2 ? 'portrait' : 'landscape'),
      sceneAnchor: item.sceneAnchor || '',
      transformationPath: item.transformationPath || 'preserve',
      cropStrategy: item.cropStrategy || (item.orientation === 'portrait' ? 'portrait-safe-fit' : 'scene-aware-fit'),
      layoutFamily: item.layoutFamily || (index % 2 ? 'relational-cluster' : 'scene-weighted-front'),
      captionRole: item.captionRole || (final ? 'closing-note' : 'observational'),
      visualDensity: item.visualDensity || (final ? 'sparse' : index % 3 === 0 ? 'balanced' : 'restrained'),
      accentRole: item.accentRole || (index ? 'recurring cue' : 'establishing cue'),
      userOrder: index
    };
  });
  return {
    schema: 'still-scenes/memory-sequence/v1',
    title: String(options.title || 'Untitled memory sequence'),
    total_items: planned.length,
    sequence_logic: preserveOrder ? 'explicit user order with paced roles' : 'deterministic wide-to-detail edit with quiet closing potential',
    shared_identity: options.collectionDNA || null,
    orderPolicy: preserveOrder ? 'user order preserved' : 'deterministic planning order',
    items: planned,
    pacing: planned.map((item) => item.pace),
    transitions: planned.slice(1).map((item, index) => planned[index].id + ' → ' + item.id + ': ' + planned[index].pace + ' to ' + item.pace),
    limitation: 'Sequence planning uses only the inputs in this request and does not claim cross-session memory.'
  };
}
