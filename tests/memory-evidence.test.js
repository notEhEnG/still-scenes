import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditCaptionAuthority,
  buildCaptionLadder,
  buildMemoryEvidence,
  evidenceCounts,
  memoryEvidencePromptSummary,
  validateMemoryEvidence
} from '../src/memory-evidence.js';
import { compilePrompt, serializeCreationBrief } from '../src/prompt-compiler.js';
import { createProvenanceRecord, provenanceJson } from '../src/provenance.js';
import { evaluateQuality } from '../src/quality.js';
import { createInitialState } from '../src/state.js';

function evidenceState() {
  const state = createInitialState('evidence-test');
  state.sceneAnchor = 'rainy bus stop';
  state.sceneDNA = 'one shelter light';
  state.observedEvidence = 'one red umbrella near the curb\nwet road reflects the shelter light';
  state.rememberedEvidence = 'we waited here after the last bus';
  state.uncertainEvidence = 'the shop may have been closed';
  state.forbiddenEvidence = 'no extra people\nno readable shop name';
  return state;
}

test('memory evidence preserves exact user wording and authority classes', () => {
  const ledger = buildMemoryEvidence(evidenceState());
  assert.deepEqual(evidenceCounts(ledger), { observed: 2, remembered: 1, uncertain: 1, forbidden: 2 });
  assert.equal(ledger.influence, 'caption-only');
  assert.equal(ledger.entries[2].text, 'we waited here after the last bus');
  assert.equal(validateMemoryEvidence(ledger).valid, true);
});

test('caption ladder is a zero-fabrication assembly with traceable sources', () => {
  const state = evidenceState();
  const ladder = buildCaptionLadder(state);
  assert.deepEqual(ladder.options.map((option) => option.value), [
    'one red umbrella near the curb',
    'we waited here after the last bus',
    'one red umbrella near the curb\nwe waited here after the last bus'
  ]);
  state.caption = ladder.options[2].value;
  const audit = auditCaptionAuthority(state);
  assert.equal(audit.status, 'verified');
  assert.deepEqual(audit.sourceEntryIds, ['observed-1', 'remembered-1']);
  assert.match(audit.detail, /not real-world truth/i);
});

test('custom exact copy stays authoritative without a false evidence claim', () => {
  const state = evidenceState();
  state.caption = 'My own unclassified line.';
  const audit = auditCaptionAuthority(state);
  assert.equal(audit.status, 'declared');
  assert.equal(audit.source, 'user-authored-unmapped');
});

test('conflicting evidence classifications fail the authority gate', () => {
  const state = evidenceState();
  state.uncertainEvidence = 'one red umbrella near the curb';
  const validation = validateMemoryEvidence(buildMemoryEvidence(state));
  assert.equal(validation.valid, false);
  assert.deepEqual(validation.conflicts[0].kinds, ['observed', 'uncertain']);
  const gate = evaluateQuality(state, { copy: [], collisions: [], safeArea: true }, { width: 1536, height: 1024 })
    .find((item) => item.id === 'authority');
  assert.equal(gate.status, 'failed');
});

test('prompt and brief preserve the memory authority boundary', () => {
  const state = evidenceState();
  const prompt = compilePrompt(state);
  const brief = JSON.parse(serializeCreationBrief(state));
  assert.match(prompt, /MEMORY AUTHORITY/);
  assert.match(prompt, /May shape captions only; do not add it to the visible scene/);
  assert.match(prompt, /Do not invent: no extra people; no readable shop name/);
  assert.equal(brief.scene_contract.memory_evidence.schema, 'still-scenes/memory-evidence/v1');
  assert.equal(brief.caption_ladder.mode, 'zero-fabrication');
  assert.equal(brief.privacy.memory_evidence_in_embedded_provenance, 'counts-and-policy-only');
  assert.match(memoryEvidencePromptSummary(brief.scene_contract.memory_evidence), /Preserve as ambiguity/);
});

test('portable provenance records evidence counts without private evidence text', async () => {
  const state = evidenceState();
  const brief = JSON.parse(serializeCreationBrief(state));
  const record = await createProvenanceRecord({
    sceneContract: brief.scene_contract,
    prompt: compilePrompt(state)
  });
  const serialized = provenanceJson(record);
  assert.deepEqual(record.sceneContract.memoryEvidence.counts, { observed: 2, remembered: 1, uncertain: 1, forbidden: 2 });
  assert.equal(record.sceneContract.memoryEvidence.rawTextEmbedded, false);
  assert.doesNotMatch(serialized, /we waited here after the last bus|shop may have been closed|no readable shop name/);
});
