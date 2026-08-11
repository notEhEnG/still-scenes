---
name: still-scenes-postcard-zine
description: Create, analyze, or prompt personal postcards and scene-preservation artwork from user photos, scene ideas, exact captions, locations, dates, or visual references. Use for postcard fronts, writable backs, split cards, duplex pairs, scene zines, deterministic locked copy, Scene Contracts, preserve/reduce/hybrid/distill transformations, source-safe reference analysis, batches, or production-ready image-generation prompts.
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
reference_role: scene-anchor | reference-grammar | supporting-fragment | generated-scene | none
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
style_recipe:
privacy_notes:
~~~

Ask one concise question only when a required choice remains materially ambiguous, such as which of several unrelated photos to use, whether an identifiable person may be reinterpreted, or whether a private location should be printed. Otherwise proceed and state assumptions.

## Handle image input safely

Inspect every supplied image before describing or using it. Record visible subject, orientation, important identity traits, readable text or branding, and dimensions when available.

Assign each image one reference role:

- **Scene anchor:** the recognizable photo or subject must organize the result.
- **Reference grammar:** learn layout rhythm, paper character, typography role, reproduction process, or color relationship; do not transfer source-specific residue.
- **Supporting fragment:** preserve one specified person, object, flower, texture, or fragment inside a new composition.
- **Generated scene:** create a new scene from user-authored instructions.

Build the Scene Contract before style selection. Use `references/scene-contract.md`. Treat old preservation levels only as compatibility aliases:

- **High:** strong identity, geometry, count, and spatial locks; default to preserve.
- **Medium:** strong Scene DNA with flexible crop, material, and secondary detail; default to reduce.
- **Low:** reference grammar or a declared relation only; default to distill.

For people, pets, products, artworks, and keepsakes, record explicit identity, geometry, spatial, palette, and count locks unless the user permits reinterpretation. Never infer or print private location metadata from a file. Use only a location or date the user supplies or explicitly approves.

When generating or editing an image, include the actual target image through the runtime’s supported reference mechanism. If not every required target can be included, ask the user to reattach the missing image rather than relying on a textual reconstruction.

## Check capabilities before promising output

Declare whether the runtime supports image generation, image editing with the actual source, deterministic text composition, file export, image inspection, and metadata inspection. Never infer one capability from another.

If deterministic typography is unavailable, generate text-free art, return exact placement specifications, and disclose the limitation. If the source image cannot be attached to an edit call, ask for reattachment rather than reconstructing it from prose. If the result cannot be inspected, mark preservation and quality as declared or unverified, never passed.

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

1. **Read the scene.** Identify the anchor, Scene DNA, spatial relation, visual weight, quiet field, emotional temperature, and specific evidence.
2. **Write the Scene Contract.** Record locks, permitted changes, forbidden mutations, source role, privacy constraints, and one transformation path.
3. **Select a recipe.** Choose surface, ratio, picture treatment, paper family, typography, purposeful accent, texture, and optional postal marks from the relevant references.
4. **Compile Prompt V2.** Order it as output contract → Scene Contract → Scene DNA → transformation path → composition → material language → reduction map → color function → locked-copy strategy → reproduction → privacy/source boundary → hard failures.
5. **Generate.** Use the built-in image-generation capability for new raster art. For photo-based work, include the actual user image.
6. **Compose exact copy.** Use a deterministic text/layout pass when exact caption rendering matters.
7. **Inspect.** Apply references/quality-gates.md. Compare photo-based results with declared locks and verify every locked string character-for-character only when inspection is available.
8. **Retry once if useful.** Tighten preservation, simplify text, or reduce decorative elements. If a second attempt still fails a hard requirement, return the best honest partial result and explain the limitation.

## Vary a batch deliberately

Keep the set coherent through paper family, typographic family, tone, and recurring accent logic. Change at least three meaningful axes between adjacent outputs: scene crop, layout family, image scale, caption placement, accent material, or postal marks. Do not generate the same template with different coordinates.

For a sequence, optionally create a narrative order: establishing scene → observed detail → human trace → quiet closing image. Preserve the user’s requested order when provided.

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

The result must feel like a personal paper object built around one scene or memory, not a commercial advertisement, generic social template, dense scrapbook, or copied reference. The user’s selected picture and locked caption must remain authoritative.
