---
name: still-scenes-postcard-zine
description: Create, analyze, or prompt personal postcards and quiet scene-zine artwork from user photos, scene ideas, captions, locations, dates, moods, or reference images. Use when the user wants a postcard front, writable postcard back, split photo-and-message card, duplex card, memory card, travel card, minimal editorial zine poster, exact caption placement, photo-preserving transformation, scene distillation, batch variations, reference-style analysis, or production-ready image-generation prompts.
---

# Still Scenes Postcard Zine

Turn a personally meaningful scene into a deliberate paper object. Let the user choose the image subject, source-photo treatment, exact caption, card surface, and mood while keeping the workflow fast when safe defaults are sufficient.

## Route the request

Choose the smallest route that satisfies the request:

- **Postcard Create — default for postcard requests:** create a front, back, split card, or duplex pair from a supplied photo or scene description.
- **Scene Zine Create:** turn a photo or scene idea into a quiet editorial paper artwork. Preserve the photo or distill it into a new illustration according to the request.
- **Prompt-only:** return production-ready prompts and a recipe only when the user explicitly asks not to generate.
- **Reference Analysis:** inspect supplied references and extract a reusable visual system without generating unless requested.
- **Analyze + Create:** analyze references first, then create a composition that follows the system without copying a source layout or text.
- **Batch Set:** create two or more related cards or zine pages with a shared identity and meaningful variation.

If the user says only “make this a postcard” with one attached photo, use a split postcard, treat the photo as an edit target with high preservation, keep supplied text exact, and infer a restrained caption only when none is supplied. Do not ask about choices that can be reversed or safely inferred.

## Load only the relevant references

- Read references/style-system.md for every route.
- Read references/postcard-system.md for Postcard Create and any print-ready request.
- Read references/prompt-library.md for Create, Prompt-only, and Batch Set routes.
- Read references/quality-gates.md before returning any prompt, analysis, or generated artifact.
- Read the repository-level DESIGN.md only when changing or extending this skill itself.

Packaged visual examples live in `assets/demos/` for generated-scene routes and `assets/user-photo-demos/` for source-preserving photo routes. Treat them as layout and treatment examples only; never substitute a demo image for a user's supplied edit target or reuse its locked caption by default.

## Build the creation brief

Record these fields before generation. Infer unprovided optional fields and disclose the chosen values in the final recipe.

~~~text
route:
surface: front | back | split | duplex | zine
image_source: supplied | generated | hybrid
image_role: edit-target | reference-only | supporting-insert | none
preservation: high | medium | low
subject_or_scene:
exact_caption:
message:
location:
date:
language:
orientation: landscape | portrait
output_target: digital | print | both
style_recipe:
privacy_notes:
~~~

Ask one concise question only when a required choice remains materially ambiguous, such as which of several unrelated photos to use, whether an identifiable person may be reinterpreted, or whether a private location should be printed. Otherwise proceed and state assumptions.

## Handle image input safely

Inspect every supplied image before describing or using it. Record visible subject, orientation, important identity traits, readable text or branding, and dimensions when available.

Assign each image one role:

- **Edit target:** the recognizable photo or subject must appear in the result.
- **Reference-only:** learn color, texture, typography, or composition; do not carry over the exact subject, identity, text, brand, date, location, watermark, signature, or layout.
- **Supporting insert:** preserve one specified person, object, flower, texture, or fragment inside a new composition.

Set preservation deliberately:

- **High:** keep identity, face, body proportions, pose when relevant, defining markings, object geometry, object count, silhouette, and recognizable colors. Prefer an original-photo crop or printed fragment over redrawing.
- **Medium:** keep the subject and defining traits while permitting crop, scale, palette treatment, surface, and surrounding layout changes.
- **Low:** preserve only visual grammar or mood; create a new subject and composition.

Use high preservation for identifiable people, pets, products, artworks, and personal keepsakes unless the user explicitly permits reinterpretation. Never infer or print private location metadata from a file. Use only a location or date the user supplies or explicitly approves.

When generating or editing an image, include the actual target image through the runtime’s supported reference mechanism. If not every required target can be included, ask the user to reattach the missing image rather than relying on a textual reconstruction.

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

1. **Read the scene.** Identify the subject, spatial relation, visual weight, quiet area, emotional temperature, and the one detail that makes the memory specific.
2. **Choose the transformation.** Preserve the source photo, use a fragment, or distill the scene into a new visual metaphor.
3. **Select a recipe.** Choose surface, ratio, picture treatment, paper tone, typography, accent, texture, and optional postal marks from the relevant references.
4. **Compile the prompt.** Make every instruction visible and measurable. Name the picture, its position and scale, preservation invariants, locked text, palette, material treatment, and hard avoids.
5. **Generate.** Use the built-in image-generation capability for new raster art. For photo-based work, include the actual user image.
6. **Compose exact copy.** Use a deterministic text/layout pass when exact caption rendering matters.
7. **Inspect.** Apply references/quality-gates.md. Compare photo-based results with declared invariants and verify every locked string character-for-character.
8. **Retry once if useful.** Tighten preservation, simplify text, or reduce decorative elements. If a second attempt still fails a hard requirement, return the best honest partial result and explain the limitation.

## Vary a batch deliberately

Keep the set coherent through paper family, typographic family, tone, and recurring accent logic. Change at least three meaningful axes between adjacent outputs: scene crop, layout family, image scale, caption placement, accent material, or postal marks. Do not generate the same template with different coordinates.

For a sequence, optionally create a narrative order: establishing scene → observed detail → human trace → quiet closing image. Preserve the user’s requested order when provided.

## Analyze references without copying

Separate evidence from interpretation. Report observed canvas, picture scale, whitespace, typography, palette, paper, reproduction defects, marks, and hierarchy. Synthesize:

- **fixed system:** repeated traits required for family resemblance;
- **variable system:** safe axes of variation;
- **sample residue:** source-specific wording, branding, people, dates, locations, objects, or exact layouts that must not be reused.

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
- Picture choice and image role:
- Preservation and invariants:
- Locked copy:
- Layout / typography / palette / texture:
- Output target:

**Note**
[one short interpretation plus any limitation or retry]
~~~

For Prompt-only, omit the artifact and never imply generation occurred. For Reference Analysis, return evidence, fixed rules, variable rules, sample residue, reusable prompt, avoid list, and confidence limits.

## Non-negotiable outcome

The result must feel like a personal paper object built around one scene or memory, not a commercial advertisement, generic social template, dense scrapbook, or copied reference. The user’s selected picture and locked caption must remain authoritative.
