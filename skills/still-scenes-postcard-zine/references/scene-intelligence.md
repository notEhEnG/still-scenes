# Scene Intelligence V3

Read this reference for every Still Scenes creation, analysis, batch, sequence, or verification request.

## Governing rule

The selected scene and the user's exact words remain authoritative. Build all downstream decisions in this order:

1. Scene Graph
2. Scene Contract
3. Mutation Budget
4. source boundary
5. layout plan
6. material logic
7. expected Scene Delta
8. generation or deterministic composition
9. observed verification and final Scene Delta

Never claim an observation that the available tools did not make.

Run the Memory Evidence Ledger before graph compilation whenever recollection, uncertainty, assisted captions, or a do-not-invent boundary appears. Keep observed declarations, remembered context, uncertainty, and forbidden invention separate. See `memory-authority.md`.

## Scene Graph

Use a compact graph with nodes, relations, directions, depth layers, quiet fields, focal hierarchy, density, and source evidence. Mark user-provided information as declared and use observed only after actual inspection. Fix duplicate IDs and unresolved relation targets before compiling.

## Source roles

- **scene-anchor:** recognizable source pixels or the actual source subject organize the result.
- **scene-evidence:** extract Scene DNA, palette, gesture, depth, relation, and emotional temperature; prohibit recognizable source raster. Use primarily for Distill.
- **reference-grammar:** extract reusable visual behavior from a style reference; prohibit reference residue.
- **supporting-fragment:** retain one explicitly named real fragment.
- **generated-scene:** follow user-authored scene instructions without a source photo.
- **none:** use only declared scene instructions.

Do not treat scene-evidence as reference-grammar.

## Mutation Budget

Assign `locked | tight | restrained | flexible | free | not-applicable` to identity, geometry, spatial relation, palette, count, background detail, crop, material, typography, symbolic interpretation, added elements, removal, and source raster. Scene Contract locks always override mutation freedom. Exact copy locks typography; Distill locks source raster out of the output.

## Layout and material logic

Derive layout from the Scene Graph, locks, Mutation Budget, output, crop pressure, and copy pressure. Respect gaze, horizon, quiet fields, edge anchors, dense scenes, and long locked copy. Give every material choice a reason. Refuse destructive treatment when it conflicts with protected identity, geometry, or count.

## Distill and Scene Delta

For Distill, use observation → residue → relation → tension → form → opening. Do not crop, mask, trace, or blur a photograph and call it source-free.

Record retained, simplified, transformed, removed, added, unexpected, and per-lock verification. Use only `declared | verified | warning | failed | not-applicable`. Do not turn palette, dHash, or ratio evidence into identity, count, OCR, or semantic proof.

## Sequences, collections, and variation

Preserve user order unless reordering is permitted. Use narrative roles and pacing. Build Collection DNA only from current-request or explicitly supplied context; never claim hidden cross-session memory. Adjacent outputs must differ on at least three meaningful axes unless deliberate consistency is requested. Coordinate jitter does not count.

## Prompt Compiler V3

Compile concise visual instructions in this exact order: OUTPUT CONTRACT → SOURCE ROLE → SCENE GRAPH → SCENE CONTRACT → MEMORY AUTHORITY → MUTATION BUDGET → TRANSFORMATION PATH → LAYOUT PLAN → REDUCTION MAP → MATERIAL LOGIC → COLOR FUNCTION → LOCKED COPY STRATEGY → REPRODUCTION → PRIVACY / REFERENCE BOUNDARY → HARD FAILURES → SCENE DELTA EXPECTATION.

Return a concise, external art-direction record of inputs, choices, reasons, warnings, and Scene Delta. Do not expose or invent hidden chain-of-thought.
