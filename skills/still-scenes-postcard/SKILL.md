---
name: still-scenes-postcard
description: Create, analyze, verify, sequence, or prompt personal scene-preservation artwork from user photos, scene ideas, exact captions, locations, dates, or visual references. Use for postcards, zines, Scene Graphs, Scene Contracts, Mutation Budgets, scene-evidence distillation, explainable art direction, Scene Deltas, memory sequences, Collection DNA, meaningful batches, heuristic output verification, portable provenance, or production-ready image-generation prompts.
---

# Still Scenes

Turn a personally meaningful scene into a deliberate paper object. Let the user choose the image subject, source-photo treatment, exact caption, card surface, and mood while keeping the workflow fast when safe defaults are sufficient.

Use `$still-scenes-postcard` as the canonical invocation. Keep the legacy `$still-scenes-postcard-zine` compatibility package working. Treat “Still Scenes Postcard Zine” as a historical package name; use “Still Scenes” for the product and visual system.

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
- Read references/scene-intelligence.md for every route, sequence, collection, and verification request.
- Read references/capability-matrix.md before promising generation, editing, exact text, inspection, or export.
- Read references/postcard-system.md for Postcard Create and any print-ready request.
- Read references/prompt-library.md for Create, Prompt-only, and Batch Set routes.
- Read references/quality-gates.md before returning any prompt, analysis, or generated artifact.
- Read the repository-level DESIGN.md only when changing or extending this skill itself.

Repository visual examples live under `../../demos/generated/` for generated-scene routes and `../../demos/user-photo-styles/generated/` for source-preserving photo routes. Treat them as reference grammar only; never substitute a demo image for a user's scene anchor or reuse its reference residue or locked caption by default. The legacy package retains its mirrored asset archive for compatibility; do not require that archive for normal skill operation.

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
scene_graph:
  nodes: []
  relations: []
  directions: {}
  depth_layers: []
  quiet_fields: []
  focal_hierarchy: []
mutation_budget:
  identity:
  geometry:
  spatial:
  palette:
  count:
  crop:
  material:
  typography:
  added_elements:
  removal:
  source_raster:
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

When the Still Scenes Studio verification pass is available, run it after a returned AI image. Report palette distance, 64-bit dHash Hamming distance, surface-ratio agreement, per-lock-family status, and numeric confidence. Use only declared, verified, warning, failed, and not-applicable. Treat measurements as divergence signals only: they cannot prove face identity, object count, semantic fidelity, OCR accuracy, source-boundary compliance, or full Scene Contract compliance.

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

1. **Read the scene.** Build the compact Scene Graph: anchor nodes, Scene DNA nodes, relations, direction, depth, quiet fields, focal hierarchy, and evidence status.
2. **Write the Scene Contract.** Record locks, permitted changes, forbidden mutations, source role, privacy constraints, and one transformation path.
3. **Set the Mutation Budget.** Assign qualitative freedom per dimension. Let every Scene Contract lock override requested freedom.
4. **Audit the source boundary.** Separate scene-anchor, scene-evidence, reference-grammar, supporting-fragment, generated-scene, and no-source behavior.
5. **Solve layout and material.** Derive the layout plan from graph, locks, copy pressure, crop pressure, and output. Give every material choice a reason.
6. **Write the expected Scene Delta.** Record retained, simplified, transformed, removed, and added elements without pretending the output has been observed.
7. **Compile Prompt V3.** Use the exact section order in references/scene-intelligence.md and translate data into concise visual instructions rather than raw YAML.
8. **Generate.** Include the actual user image for preserve, reduce, or hybrid work. For scene-evidence Distill, use it only as input evidence and prohibit recognizable source raster in the output.
9. **Compose exact copy.** Use a deterministic text/layout pass when exact caption rendering matters.
10. **Inspect and verify.** Apply references/quality-gates.md, update lock families independently, and record unexpected changes without inventing observations.
11. **Record provenance.** Preserve the source SHA-256 when known, Scene Contract and Scene Intelligence summaries, production-prompt hash, Scene Delta, timestamp, and output route. Never embed raw source bytes or inferred private metadata.
12. **Retry once if useful.** Tighten the relevant budget dimensions or simplify the request. If a second attempt fails a hard requirement, return the best honest partial result and explain the limitation.

## Vary a batch deliberately

Build Collection DNA from explicitly supplied current-request context. Keep the set coherent through paper family, typographic family, tone, and recurring accent logic. Change at least three meaningful axes between adjacent outputs: scene crop, layout family, image scale, caption placement, accent function, material, texture, narrative role, or postal marks. Run the similarity guard against every prior recipe in the current request. Do not generate the same template with different coordinates.

For a Memory Sequence, assign narrative roles and pace: establishing scene → observed detail → human trace → transition → quiet closing image. Preserve the user’s requested order when provided. Never claim hidden cross-session memory.

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
- Scene Graph, Scene Contract, Mutation Budget, and transformation path:
- Layout plan, material logic, and source boundary:
- Locked copy:
- Layout / typography / palette / texture:
- Output target:

**Art direction record**
[concise decisions and reasons; no hidden chain-of-thought]

**Scene Delta**
[retained / simplified / transformed / removed / added / unexpected / lock statuses]

**Note**
[one short interpretation plus any limitation or retry]
~~~

For Prompt-only, omit the artifact and never imply generation occurred. For Reference Analysis, return evidence, reference grammar, variables, reference residue, a reusable prompt, avoid list, and confidence limits.

## Non-negotiable outcome

Still Scenes understands what makes a scene yours, controls what may change, and records what actually changed. The result must feel like a personal paper object built around one scene or memory, not a commercial advertisement, generic social template, dense scrapbook, or copied reference. The user’s selected picture and locked caption remain authoritative.
