---
name: still-scenes-postcard-zine
description: Create, analyze, verify, sequence, or prompt personal scene-preservation artwork from user photos, scene ideas, memories, uncertainties, exact captions, locations, dates, or visual references. Use for legacy postcard-zine invocation plus postcards, zines, Memory Evidence Ledgers, zero-fabrication caption ladders, caption claim audits, Scene Graphs, Scene Contracts, Mutation Budgets, scene-evidence distillation, Scene Deltas, memory sequences, Collection DNA, meaningful batches, verification, provenance, or production-ready prompts.
---

# Still Scenes

Turn a personally meaningful scene into a deliberate paper object. Let the user choose the image subject, source-photo treatment, exact caption, card surface, and mood while keeping the workflow fast when safe defaults are sufficient.

Keep the legacy `$still-scenes-postcard-zine` invocation working. Treat “Still Scenes Postcard Zine” as a compatibility package name; use “Still Scenes” for the product and visual system.

## Route the request

Choose the smallest route that satisfies the request:

- **Postcard Create — default for postcard requests:** create a front, back, split card, or duplex pair from a supplied photo or scene description.
- **Scene Zine Create:** turn a photo or scene idea into a quiet editorial paper artwork. Preserve the photo or distill it into a new illustration according to the request.
- **Prompt-only:** return production-ready prompts and a recipe only when the user explicitly asks not to generate.
- **Reference Analysis:** inspect supplied references and extract a reusable visual system without generating unless requested.
- **Analyze + Create:** analyze references first, then create a composition that follows the system without copying a source layout or text.
- **Batch Set:** create two or more related cards or zine pages with a shared identity and meaningful variation.

If the user says only “make this a postcard” with one attached photo, use a split postcard, treat the photo as the scene anchor, apply strong identity/geometry/spatial locks through the preserve path, keep supplied text exact, and infer a restrained caption only when none is supplied. Do not ask about choices that can be reversed or safely inferred.

## Load only the relevant references

- Read references/style-system.md for every route.
- Read references/scene-contract.md for every route.
- Read references/memory-authority.md whenever the request contains recollection, uncertainty, assisted captions, incomplete evidence, or a do-not-invent boundary.
- Read references/scene-intelligence.md for every route, sequence, collection, and verification request.
- Read references/capability-matrix.md before promising generation, editing, exact text, inspection, or export.
- Read references/postcard-system.md for Postcard Create and any print-ready request.
- Read references/prompt-library.md for Create, Prompt-only, and Batch Set routes.
- Read references/quality-gates.md before returning any prompt, analysis, or generated artifact.
- Read the repository-level DESIGN.md only when changing or extending this skill itself.

Packaged visual examples live in `assets/demos/` for generated-scene routes and `assets/user-photo-demos/` for source-preserving photo routes. Treat them as reference grammar only; never substitute a demo image for a user's scene anchor or reuse its reference residue or locked caption by default.

## Build the creation brief

Record these fields before generation. Infer unprovided optional fields and disclose the chosen values in the final recipe.

~~~yaml
route:
surface: front | back | split | duplex | zine
image_source: supplied | generated | hybrid
reference_role: scene-anchor | scene-evidence | reference-grammar | supporting-fragment | generated-scene | none
subject_or_scene:
exact_caption:
message:
location:
date:
language:
orientation: landscape | portrait
output_target: digital | print | both
scene_contract:
  anchor:
  scene_dna: []
  identity_locks: []
  geometry_locks: []
  spatial_locks: []
  palette_locks: []
  count_locks: []
  text_locks: []
  allowed_mutations: []
  forbidden_mutations: []
  transformation_path: preserve | reduce | hybrid | distill
  reduction_level: none | restrained | simplified | distilled
  source_role:
  privacy_constraints: []
memory_evidence:
  influence: caption-only | art-and-caption
  observed: []
  remembered: []
  uncertain: []
  forbidden: []
caption_ladder:
  mode: zero-fabrication
  options: []
caption_authority:
scene_graph:
mutation_budget:
source_boundary:
layout_plan:
material_logic:
scene_delta:
style_recipe:
privacy_notes:
~~~

Ask one concise question only when a required choice remains materially ambiguous, such as which of several unrelated photos to use, whether an identifiable person may be reinterpreted, or whether a private location should be printed. Otherwise proceed and state assumptions.

## Handle image input safely

Inspect every supplied image before describing or using it. Record visible subject, orientation, important identity traits, readable text or branding, and dimensions when available.

Assign each image one reference role:

- **Scene anchor:** the recognizable photo or subject must organize the result.
- **Scene evidence:** extract the user's Scene DNA, palette, gesture, depth, relation, and emotional temperature while prohibiting recognizable source raster; use mainly for Distill.
- **Reference grammar:** learn layout rhythm, paper character, typography role, reproduction process, or color relationship; do not transfer source-specific residue.
- **Supporting fragment:** preserve one specified person, object, flower, texture, or fragment inside a new composition.
- **Generated scene:** create a new scene from user-authored instructions.

Build the Scene Graph, Scene Contract, and Mutation Budget before style selection. Use `references/scene-contract.md` and `references/scene-intelligence.md`. Treat old preservation levels only as compatibility aliases that seed native locks:

- **High:** strong identity, geometry, count, and spatial locks; default to preserve.
- **Medium:** strong Scene DNA with flexible crop, material, and secondary detail; default to reduce.
- **Low:** reference grammar or a declared relation only; default to distill.

For people, pets, products, artworks, and keepsakes, record explicit identity, geometry, spatial, palette, and count locks unless the user permits reinterpretation. Never infer or print private location metadata from a file. Use only a location or date the user supplies or explicitly approves.

When generating or editing an image, include the actual target image through the runtime’s supported reference mechanism. If not every required target can be included, ask the user to reattach the missing image rather than relying on a textual reconstruction.

## Check capabilities before promising output

Declare whether the runtime supports image generation, image editing with the actual source, deterministic text composition, file export, image inspection, and metadata inspection. Never infer one capability from another.

If deterministic typography is unavailable, generate text-free art, return exact placement specifications, and disclose the limitation. If the source image cannot be attached to an edit call, ask for reattachment rather than reconstructing it from prose. If the result cannot be inspected, use declared, warning, failed, or not-applicable as appropriate; never invent verified status.

## Choose the surface and picture

Follow explicit choices. When the user has not chosen:

- Select **split** for a single landscape photo plus a message or caption.
- Select **front** for a visually led keepsake with one short caption.
- Select **back** for a writable or message-first card paired with an existing front.
- Select **duplex** when both a polished image front and a postal-style back are requested.
- Select **zine** when the request emphasizes editorial artwork, paper collage, visual metaphor, or scene distillation.

For a generated picture, first reduce the request to one imageable scene with a clear subject, time, weather or light, viewpoint, palette, and emotional temperature. Offer or generate caption options separately; do not let caption writing alter the chosen picture unless the user asks for a concept-caption pair.

## Preserve exact text

Treat exact_caption, message, location, and date as locked strings. Preserve spelling, punctuation, casing, language, and line breaks unless the user asks for editing.

Image models may distort text. For exact readable wording:

1. Generate the visual scene or paper texture without required text.
2. Add locked text in a deterministic composition step when the runtime supports one.
3. Inspect the final raster at full size and thumbnail size.
4. If exact wording cannot be guaranteed, return the clean visual plus placement specifications and state the limitation instead of claiming accuracy.

Keep generated in-image text short. Move long messages to a writable back or deterministic overlay.

## Create the artifact

1. **Classify memory authority.** Separate observed declarations, remembered context, uncertainty, and forbidden invention. Default remembered context to caption-only influence. Resolve exact cross-class conflicts before compilation.
2. **Read the scene.** Build the compact Scene Graph and label evidence as declared or observed.
3. **Write the Scene Contract.** Record locks, permitted changes, forbidden mutations, source role, privacy constraints, Memory Evidence Ledger, and one transformation path.
4. **Set the Mutation Budget.** Assign qualitative freedom per dimension; locks always override freedom.
5. **Audit the source boundary.** Keep scene-evidence distinct from reference-grammar and prohibit source raster for Distill.
6. **Solve layout and material.** Derive them from graph, locks, copy, crop, and output; state concise reasons.
7. **Write the expected Scene Delta.** Do not pretend it is observed.
8. **Compile Prompt V3.** Follow references/scene-intelligence.md exactly, including MEMORY AUTHORITY.
9. **Generate and compose.** Include actual edit targets when required and add locked copy deterministically. Build evidence-bound captions only from exact observed and remembered entries.
10. **Inspect and verify.** Update each lock family and Memory Authority independently using only declared, verified, warning, failed, or not-applicable. Caption traceability is not historical truth.
11. **Record provenance.** Include whitelisted Scene Intelligence and Scene Delta summaries. Store only Memory Evidence schema, influence, counts, and the false raw-text flag in compact provenance; never raw source bytes or recollections.
12. **Retry once if useful.** Tighten the relevant budget dimension. Report unresolved hard failures honestly.

## Vary a batch deliberately

Build Collection DNA only from explicit current-request context. Change at least three meaningful axes between adjacent outputs and run the similarity guard against every prior current-request recipe. Coordinate jitter does not count.

For a Memory Sequence, assign narrative roles and pace while preserving the user’s requested order. Never claim hidden cross-session memory.

## Analyze references without copying

Separate evidence from interpretation. Report observed canvas, picture scale, whitespace, typography, palette, paper, reproduction defects, marks, and hierarchy. Synthesize:

- **reference grammar:** repeated or confidently observed visual behavior that may guide a new work;
- **variable system:** safe axes of variation;
- **reference residue:** source-specific wording, branding, people, dates, locations, objects, or exact layouts that must not be reused.

With one reference, describe only observed traits and limitations. Do not claim collection-wide rules from a single sample.

## Return the production record

For a generated artifact, return:

~~~markdown
**Artifact**
[rendered image or absolute output path]

**Final prompt**
[prompt actually used]

**Recipe**
- Route / surface / orientation:
- Picture choice and reference role:
- Scene Contract and transformation path:
- Locked copy:
- Layout / typography / palette / texture:
- Output target:

**Note**
[one short interpretation plus any limitation or retry]
~~~

For Prompt-only, omit the artifact and never imply generation occurred. For Reference Analysis, return evidence, reference grammar, variables, reference residue, a reusable prompt, avoid list, and confidence limits.

## Non-negotiable outcome

Still Scenes understands what makes a scene yours, controls what may change, and records what actually changed. The result must feel like a personal paper object rather than an advertisement, generic social template, dense scrapbook, or copied reference. The user’s selected picture and locked caption remain authoritative.
