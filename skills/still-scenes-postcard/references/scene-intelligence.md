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

Use a compact graph, not a verbose scene description:

~~~yaml
scene_graph:
  nodes:
    - id:
      role: anchor | scene-dna | supporting
      label:
      source: declared | observed
  relations:
    - from:
      to:
      label:
  directions:
    focal_position: far-left | left | center | right | far-right | auto
    dominant_gesture: left | right | up | down | inward | outward | static | auto
    gaze_or_motion: left | right | up | down | inward | outward | static | auto
    horizon: strong | not-declared
  depth_layers: []
  quiet_fields: []
  focal_hierarchy: []
  density: sparse | balanced | dense
  source_evidence:
~~~

Fix unknown node references and duplicate IDs before compiling. Mark user-provided relations as declared. Use observed only after actual image inspection.

## Source roles

- **scene-anchor:** recognizable source pixels or the actual source subject organize the result.
- **scene-evidence:** extract Scene DNA, palette, gesture, depth, relation, and emotional temperature; prohibit recognizable source raster. Use primarily for Distill.
- **reference-grammar:** extract reusable visual behavior from a style reference; prohibit reference residue.
- **supporting-fragment:** retain one explicitly named real fragment.
- **generated-scene:** follow user-authored scene instructions without a source photo.
- **none:** use only declared scene instructions.

Do not treat scene-evidence as reference-grammar. The former belongs to the user's scene; the latter belongs to an external visual reference.

## Mutation Budget

Assign each dimension one qualitative permission:

`locked | tight | restrained | flexible | free | not-applicable`

Record at least identity, geometry, spatial relation, palette, count, background detail, crop, material, typography, symbolic interpretation, added elements, removal, and source raster.

Scene Contract locks always override mutation freedom. Examples:

- a count lock forces count to locked even in an expressive profile;
- exact copy forces typography to locked;
- identity-sensitive portrait or product locks prevent destructive silhouette or specimen treatment;
- scene-evidence and Distill force source raster to locked, meaning prohibited from appearing.

## Constraint-based layout

Derive layout from the graph, locks, budget, output, crop pressure, and copy pressure.

- Reserve breathing room in the direction of gaze or motion.
- Keep a strong horizon level and uninterrupted.
- Keep locked identity or geometry inside a fit-safe area when a crop would cut it.
- Give dense scenes more picture area before reducing secondary detail.
- Give long locked copy more measured text area without rewriting it.
- Keep quiet fields free of decorative clutter and unrelated type.
- Treat a writable back as a utility surface rather than pretending it has a picture composition.

Return the chosen layout family, image and quiet-field share, crop policy, alignment, breathing direction, caption placement, focal protection, constraints, and concise rationale.

## Material Logic

Every material choice needs a source- or contract-grounded reason. Explicit user choice wins unless it conflicts with a lock or hard failure.

- Frame or quiet film preserves a photographic anchor.
- Halftone or reduction print may merge tonal micro-detail only when the budget permits.
- Silhouette is incompatible with protected facial identity or internal product geometry unless the user explicitly unlocks them.
- Distill uses source-free paper, ink, relief, line, or color forms derived from scene evidence.
- Required text stays on a clean deterministic layer.

## Distill reasoning

For Distill, reason through this visible production ladder:

1. **observation:** only what was actually inspected or explicitly declared;
2. **residue:** source-specific raster, text, person, brand, signature, or layout that must not transfer;
3. **relation:** the smallest spatial or emotional relationship that makes the scene specific;
4. **tension:** the directional, scale, light, or proximity contrast to preserve;
5. **form:** a new paper/ink/shape system that carries the relation;
6. **opening:** the quiet field that lets the relation breathe.

Do not crop, mask, trace, or blur the photograph and call the result source-free.

## Scene Delta

Create an expected delta before generation and an observed delta after inspection:

~~~yaml
scene_delta:
  observation_status: expected | heuristically-compared | inspected
  retained: []
  simplified: []
  transformed: []
  removed: []
  added: []
  unexpected: []
  lock_verification:
    identity: declared | verified | warning | failed | not-applicable
    geometry: declared | verified | warning | failed | not-applicable
    spatial: declared | verified | warning | failed | not-applicable
    palette: declared | verified | warning | failed | not-applicable
    count: declared | verified | warning | failed | not-applicable
    text: declared | verified | warning | failed | not-applicable
    source_boundary: declared | verified | warning | failed | not-applicable
    layout_safety: declared | verified | warning | failed | not-applicable
~~~

Use only those five status terms. Palette distance, dHash, and aspect ratio may update the relevant heuristic fields, but do not convert them into identity, count, OCR, or semantic proof.

## Memory Sequence

For multiple scenes, preserve user order unless the user permits reordering. Assign each item a narrative role such as establishing, observed detail, human trace, transition, or quiet close. Vary pace, scale, and orientation intentionally. Keep the final item quiet when no other ending is requested.

Mixed photos, generated scenes, and text-only moments may share a sequence. Record each input's source role independently.

## Collection DNA

Build family resemblance from explicit current-request inputs:

- shared paper family;
- typography family;
- accent logic;
- recurring mark when useful;
- shared scene-preservation principles;
- at least three variable axes.

Never claim hidden cross-session memory. Reuse Collection DNA only when it was supplied in the current request or explicitly carried forward by the user.

## Meaningful variation and similarity guard

Adjacent outputs must differ on at least three meaningful axes unless the user requests deliberate consistency. Axes include layout family, crop policy, image scale, caption placement, accent function, material, texture, and narrative role.

Compare candidate recipes with every prior recipe in the current request. If fewer than three axes differ, change the candidate before generation. Coordinate jitter does not count as meaningful variation.

## Prompt Compiler V3

Compile concise visual instructions in this exact order:

1. OUTPUT CONTRACT
2. SOURCE ROLE
3. SCENE GRAPH
4. SCENE CONTRACT
5. MEMORY AUTHORITY
6. MUTATION BUDGET
7. TRANSFORMATION PATH
8. LAYOUT PLAN
9. REDUCTION MAP
10. MATERIAL LOGIC
11. COLOR FUNCTION
12. LOCKED COPY STRATEGY
13. REPRODUCTION
14. PRIVACY / REFERENCE BOUNDARY
15. HARD FAILURES
16. SCENE DELTA EXPECTATION

Do not paste raw YAML into the production prompt. Translate graph and contract fields into concrete instructions.

## Explainable art direction

Return a concise record of inputs, choices, values, reasons, warnings, and Scene Delta. This is an external decision record, not hidden chain-of-thought. Do not invent internal deliberation or unobserved evidence.
