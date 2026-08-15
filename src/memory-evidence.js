const EVIDENCE_FIELDS = Object.freeze([
  { stateKey: 'observedEvidence', kind: 'observed', authority: 'user-declared-observation' },
  { stateKey: 'rememberedEvidence', kind: 'remembered', authority: 'user-memory' },
  { stateKey: 'uncertainEvidence', kind: 'uncertain', authority: 'preserve-ambiguity' },
  { stateKey: 'forbiddenEvidence', kind: 'forbidden', authority: 'hard-prohibition' }
]);

function lines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function comparable(value) {
  return String(value).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

export function buildMemoryEvidence(state) {
  const entries = EVIDENCE_FIELDS.flatMap(({ stateKey, kind, authority }) =>
    lines(state[stateKey]).map((text, index) => ({
      id: kind + '-' + (index + 1),
      kind,
      authority,
      text
    }))
  );
  const influence = state.memoryInfluence === 'art-and-caption' ? 'art-and-caption' : 'caption-only';
  return {
    schema: 'still-scenes/memory-evidence/v1',
    influence,
    entries,
    policy: {
      observed: 'May shape the artifact and evidence-bound captions; remains a user declaration until visually inspected.',
      remembered: influence === 'art-and-caption'
        ? 'May shape the artifact and captions because the user explicitly enabled memory influence.'
        : 'May shape captions only; do not add it to the visible scene.',
      uncertain: 'Preserve as ambiguity. Never convert it into a visible or textual fact.',
      forbidden: 'Hard prohibition. Do not depict, imply, or state it.'
    }
  };
}

export function evidenceCounts(ledger) {
  return ['observed', 'remembered', 'uncertain', 'forbidden'].reduce((result, kind) => {
    result[kind] = (ledger?.entries || []).filter((entry) => entry.kind === kind).length;
    return result;
  }, {});
}

export function validateMemoryEvidence(ledger) {
  const byText = new Map();
  (ledger?.entries || []).forEach((entry) => {
    const key = comparable(entry.text);
    const existing = byText.get(key) || [];
    existing.push(entry);
    byText.set(key, existing);
  });
  const conflicts = [...byText.values()]
    .filter((entries) => new Set(entries.map((entry) => entry.kind)).size > 1)
    .map((entries) => ({ text: entries[0].text, kinds: [...new Set(entries.map((entry) => entry.kind))] }));
  return {
    valid: conflicts.length === 0,
    conflicts,
    warnings: ledger?.entries?.length ? [] : ['No memory evidence has been declared.']
  };
}

function addCandidate(candidates, option) {
  if (!option.value || candidates.some((candidate) => candidate.value === option.value)) return;
  candidates.push(option);
}

export function buildCaptionLadder(state, ledger = buildMemoryEvidence(state)) {
  const observed = ledger.entries.filter((entry) => entry.kind === 'observed');
  const remembered = ledger.entries.filter((entry) => entry.kind === 'remembered');
  const candidates = [];

  if (observed[0]) addCandidate(candidates, {
    id: 'literal', label: 'Literal', value: observed[0].text,
    sourceEntryIds: [observed[0].id], authority: 'observed'
  });
  if (remembered[0]) addCandidate(candidates, {
    id: 'memory-note', label: 'Memory note', value: remembered[0].text,
    sourceEntryIds: [remembered[0].id], authority: 'remembered'
  });
  if (observed[0] && remembered[0]) addCandidate(candidates, {
    id: 'paired-fragment', label: 'Paired fragment', value: observed[0].text + '\n' + remembered[0].text,
    sourceEntryIds: [observed[0].id, remembered[0].id], authority: 'observed-and-remembered'
  });
  if (candidates.length < 3 && observed[1]) addCandidate(candidates, {
    id: 'second-observation', label: 'Second detail', value: observed[1].text,
    sourceEntryIds: [observed[1].id], authority: 'observed'
  });
  const metadata = [state.location, state.date].filter(Boolean).join(' · ');
  if (candidates.length < 3 && metadata) addCandidate(candidates, {
    id: 'archive-line', label: 'Archive line', value: metadata,
    sourceEntryIds: [], authority: 'locked-metadata'
  });

  return {
    schema: 'still-scenes/caption-ladder/v1',
    mode: 'zero-fabrication',
    options: candidates.slice(0, 3)
  };
}

export function auditCaptionAuthority(state, ledger = buildMemoryEvidence(state), ladder = buildCaptionLadder(state, ledger)) {
  const caption = String(state.caption || '');
  if (!caption) return { status: 'not-applicable', source: 'none', sourceEntryIds: [], detail: 'No caption is requested.' };
  const option = ladder.options.find((candidate) => candidate.value === caption);
  if (option) {
    return {
      status: 'verified',
      source: 'evidence-ladder',
      sourceEntryIds: [...option.sourceEntryIds],
      detail: 'The caption is a character-for-character deterministic assembly of declared evidence or locked metadata; this verifies authorship traceability, not real-world truth.'
    };
  }
  const direct = ledger.entries.find((entry) => entry.text === caption && ['observed', 'remembered'].includes(entry.kind));
  if (direct) {
    return {
      status: 'verified', source: direct.kind, sourceEntryIds: [direct.id],
      detail: 'The caption matches one declared evidence entry character-for-character; this verifies authorship traceability, not real-world truth.'
    };
  }
  return {
    status: 'declared', source: 'user-authored-unmapped', sourceEntryIds: [],
    detail: 'The exact caption is user-authored and locked, but the Studio cannot map its claims to the evidence ledger automatically.'
  };
}

export function memoryEvidencePromptSummary(ledger) {
  const select = (kind) => ledger.entries.filter((entry) => entry.kind === kind).map((entry) => entry.text);
  const format = (values) => values.length ? values.join('; ') : 'not declared';
  return 'Observed declarations: ' + format(select('observed')) + '. Remembered context: ' + format(select('remembered')) +
    '. Uncertain details: ' + format(select('uncertain')) + '. Do not invent: ' + format(select('forbidden')) +
    '. Memory influence: ' + ledger.influence + '. ' + ledger.policy.remembered + ' ' + ledger.policy.uncertain + ' ' + ledger.policy.forbidden;
}
