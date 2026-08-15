# Still Scenes — Design Specification

## 1. Product definition

Still Scenes is a scene-preservation system with two coordinated surfaces: a deterministic local browser Studio and an AI-assisted Codex Skill. Together they turn a supplied photograph, scene description, or small reference set into a personal paper artifact. Supported surfaces include image fronts, split photo-and-message cards, writable backs, true duplex pairs, and scene-zine pages.

The product promise is simple:

> The user chooses the picture and the words. The skill turns both into a coherent, inspectable paper composition without silently changing either.

This is a system, not a fixed visual template. Both products share Scene Intelligence, exact-copy handling, deliberate variation, route-aware prompts, and truthful quality language. Still Scenes understands what makes a scene yours, controls what may change, and records what actually changed.

## 2. Source study and originality boundary

The design was informed by two public projects:

- [Gathered Scenes Zine Skill](https://github.com/Zeejay0/gathered-scenes-zine-skill) describes two useful conceptual paths: preserve a real scene as the visual anchor, or distill its meaning into an original paper artwork.
- [GC Minimal Zine Poster](https://github.com/LiamGvchi/gc-minimal-zine-poster) demonstrates strong request routing, photo-role classification, measurable prompt construction, visual-system analysis, variation, and post-generation quality gates.

This package does not copy upstream assets, unavailable skill text, author branding, example compositions, captions, or source-specific identity. The Gathered Scenes repository currently publishes a personal non-commercial license and has withdrawn its skill documents; only the high-level ideas visible in its public overview are treated as research context. GC Minimal Zine Poster is MIT-licensed, but this package still uses independently written structure and language.

Still Scenes is MIT-licensed. Do not represent it as affiliated with or endorsed by either upstream author. No substantial copied upstream implementation or prose was identified, so a third-party notice is not required for the current code; retain this research provenance rather than hiding it.

## 3. Goals

### Primary goals

- Let the user explicitly choose a supplied photo or request a newly generated picture.
- Let the user lock an exact caption, message, location, date, and language.
- Keep visible evidence, remembered context, uncertainty, and forbidden invention in separate authority classes.
- Offer captions that can be traced character-for-character to the user's evidence without claiming that a memory is historically verified.
- Preserve recognizable people, pets, products, objects, and keepsakes when requested.
- Support postcard front, back, split, duplex, and zine surfaces.
- Generate usable images by default and production-ready prompts on request.
- Make assumptions, source roles, native Scene Contract locks, legacy preservation aliases, and recipes visible.
- Keep a family of outputs coherent without repeating one template.
- Protect private location data and avoid copying reference-specific identity.

### Non-goals

- Full postal addressing, postage calculation, or mail fulfillment.
- Automatic use of EXIF GPS or hidden metadata.
- Long-form typesetting inside an image-generation model.
- Brand-campaign or advertisement generation.
- Pixel-perfect reproduction of a reference image.
- Claiming print readiness without checking dimensions, safe areas, and text.

## 4. Core user stories

1. “Use this flower photo. Make a landscape split postcard and print ‘Pontian, Johor, Malaysia’ with the date and my exact caption.”
2. “Generate a quiet rainy bus-stop picture, then use ‘Some waits become memories.’ as the caption.”
3. “Keep my dog recognizable but turn the surroundings into a faded summer paper collage.”
4. “Make a postcard front and a separate writable back.”
5. “Turn this scene into a zine page without retaining the original photograph.”
6. “Analyze these references and give me a reusable prompt only.”
7. “Create four cards from these trip photos that feel related but do not reuse the same layout.”
8. “Give me three caption options before generating the card.”
9. “The photo shows one porch light. I remember waiting there, but I am unsure whether it was raining. Do not invent another person.”

## 5. Experience principles

### User authority

The selected picture and locked copy outrank style defaults. Never replace a supplied photo with a newly generated look-alike unless the user explicitly requests reinterpretation.

### Inspect before inventing

Inspect real image files before making claims about subjects, ratios, visible text, color, or preservation requirements. State limitations when files are missing or unreadable.

### One meaningful question

Infer safe defaults. Ask only when two plausible choices would produce materially different results, such as choosing among unrelated photos or changing an identifiable face.

### Exact copy is a data contract

Treat caption, message, location, and date as immutable strings. Image generation and text composition are separate production concerns.

### Memory has an authority boundary

Observed declarations, remembered context, uncertainty, and prohibited invention are not interchangeable. Remembered context affects captions by default; it affects visible artwork only after explicit opt-in. Deterministic caption traceability proves where the words came from, not whether the memory is historically true.

### Personal, not promotional

Favor observed detail, quiet hierarchy, tactile paper, and restrained marks. Avoid calls to action, campaign layouts, commercial headline systems, fake logos, and glossy mockups.

### Honest output

If the generation model cannot preserve a subject or spell locked text, say so. Return a clean art layer and placement specification instead of claiming success.

## 6. Request model

Every run compiles a creation brief:

~~~yaml
route: postcard-create
surface: split
image_source: supplied
reference_role: scene-anchor
subject_or_scene: user-selected photograph
exact_caption: "Moon."
message: ""
location: ""
date: ""
language: en
orientation: landscape
output_target: both
scene_contract:
  anchor: user-selected photograph
  scene_dna:
    - declared visual relation
  identity_locks: []
  geometry_locks:
    - defining source silhouette
  spatial_locks:
    - focal relation and horizon
  palette_locks:
    - recognizable source colors
  count_locks: []
  text_locks:
    - "Moon."
  allowed_mutations:
    - paper framing
    - deterministic typography
  forbidden_mutations:
    - invented location
    - rewritten locked copy
  transformation_path: preserve
  reduction_level: none
  source_role: scene-anchor
  privacy_constraints:
    - no metadata-derived location
memory_evidence:
  influence: caption-only
  observed: []
  remembered: []
  uncertain: []
  forbidden: []
caption_ladder:
  mode: zero-fabrication
  options: []
caption_authority:
style_recipe:
  layout: field-note-split
  paper: warm-archive
  typography: editorial-serif-plus-small-sans
  accent: warm-orange
  texture: subtle-scan-grain
privacy_notes:
  use_embedded_location: false
~~~

Required fields are route, surface, image source, subject or selected image, Scene Contract anchor, transformation path, and privacy boundary. The remainder may use declared defaults. High, medium, and low remain accepted only as compatibility aliases for contract lock profiles.

## 7. Request routes

| Route | Input | Output |
| --- | --- | --- |
| Postcard Create | Photo or scene idea, optional copy | Card image, final prompt, recipe, copy record |
| Scene Zine Create | Photo, theme, or scene | Zine raster, final prompt, recipe, interpretation |
| Prompt-only | Any creation brief | Final prompt, recipe, negative constraints |
| Reference Analysis | One or more reference images | Evidence, fixed/variable rules, residue, prompt |
| Analyze + Create | References plus new content | Analysis followed by a new composition |
| Batch Set | Multiple scenes or requested count | Coherent set plus variation ledger |

## 8. Surface system

### Front

Image-led keepsake. Use one photo or generated scene with a short caption, optional location/date, and restrained paper margin. Suitable for visual sharing or the front of a duplex card.

### Back

Message-led postal surface. Use a clear writing field, optional address area, stamp or camera mark, location/date, and quiet footer. Do not fabricate postal barcodes, official marks, or postage.

### Split

Single landscape composition inspired by the supplied example:

- Overall ratio near 3:2.
- Left image zone approximately 44%–49% of width.
- Right writing zone approximately 47%–52% of width.
- Warm off-white paper across both fields.
- Framed photo with generous inner border.
- Location and date near the upper-left of the writing field.
- Small stamp or camera placeholder near the upper-right.
- Six to nine writing rules or a short exact caption.
- Low-contrast footer line and optional personal mark.

The split proportions are a recipe, not a required clone. Preserve the same functional hierarchy across portrait or alternate-ratio variants.

### Duplex

Return two separate, same-size artifacts:

- Front: image-led, minimal copy.
- Back: writable/message-led with safe postal zones.

Do not merge the pair into one file unless the user requests a proof sheet.

### Zine

Editorial paper artwork with one visual event. It may retain a source-photo crop or translate a scene into illustration, silhouette, printed texture, or a small spatial relation.

## 9. Visual system

### Shared identity

- Tactile matte paper rather than a screen-white UI surface.
- One primary scene or visual relation.
- Clear quiet area around the focal material.
- Restrained typography with one editorial voice and one utility voice.
- One purposeful accent tied to the scene or postal function.
- Print or scan character without artificial damage overwhelming the image.

### Postcard range

- Ratios: 3:2 landscape, 2:3 portrait, 4:3 digital, A6 print.
- Paper families: warm archive, clean natural, dusk gray, flax, sun-aged, charcoal presentation.
- Image treatments: documentary frame, quiet film, specimen crop, halftone field, dry-ink silhouette, and Skill-only material interpretations when supported.
- Accent: orange, vermilion, cobalt, leaf green, or a sampled flower/sky color.
- Marks: camera outline, stamp frame, fine rule, date dot, tiny coordinates only when user supplied.

### Zine range

- Ratios: 3:5 vertical by default, 4:5 or A-series by request.
- Open paper: roughly 65%–88%.
- Main cluster: roughly 10%–30%.
- Reproduction: risograph grain, halftone, dry ink, letterpress softness, paper fiber, subtle misregistration.
- Text: short caption, note, date, or fragment rather than a campaign headline.

### Anti-identity

Avoid commercial advertising, CTA buttons, fake brands, glossy product mockups, cinematic depth, hard shadows, 3D rendering, neon, dense scrapbooks, multicolor template kits, arbitrary stickers, copied reference text, and exact source composition.

## 10. Scene Contract and source roles

Every supplied image receives one source role:

- Scene anchor: the real photo or recognizable subject organizes the artifact.
- Scene evidence: the user's Scene DNA, palette, gesture, depth, relation, and emotional temperature inform a source-free result while recognizable source raster is prohibited.
- Reference grammar: only reusable visual behavior may transfer.
- Supporting fragment: one selected source fragment remains real inside a new composition.
- Generated scene: the subject is newly made from user-authored instructions.

The compact Scene Graph records anchor and supporting nodes, relations, direction, depth layers, quiet fields, focal hierarchy, density, and evidence status. The Scene Contract records identity, geometry, spatial, palette, count, and text locks; permitted and forbidden mutations; transformation path; reduction level; source role; and privacy constraints.

The Mutation Budget then assigns `locked`, `tight`, `restrained`, `flexible`, `free`, or `not-applicable` to identity, geometry, spatial relation, palette, count, background detail, crop, scale, texture, material, typography, composition, abstraction, symbolic interpretation, added elements, removal, and source raster. Contract locks always override the budget.

The layout solver consumes graph, locks, budget, crop pressure, copy pressure, quiet fields, gaze, horizon, scene density, and subject sensitivity. Material Logic chooses a reasoned treatment and refuses destructive treatments that conflict with identity or geometry. The Scene Delta records retained, simplified, transformed, removed, added, and unexpected changes without claiming unobserved evidence.

The four transformation paths are preserve, reduce, hybrid, and distill. A distilled result contains no recognizable source raster. High, medium, and low remain compatibility aliases that seed respectively strong locks/preserve, Scene-DNA locks/reduce, and a flexible distill profile. A user photograph on Distill uses scene-evidence; an external style source remains reference-grammar.

Native Distill follows observation → residue → relation → optional declared tension → paper-native form → opening. Tension is never invented as decorative interpretation; an undeclared tension remains empty in the plan.

For identifiable people, pets, artworks, products, or keepsakes, explicit identity, geometry, spatial, palette, and count locks are required unless the user permits reinterpretation. A changed face, object count, distinctive marking, or product component is a contract failure, but it is only **verified** when an available inspection process compares the result.

## 11. Caption and message system

Before assisted captioning, the Memory Evidence Ledger separates observed declarations, remembered context, uncertain details, and forbidden invention. The zero-fabrication ladder can then offer a literal observed line, an exact memory note, and a two-line paired fragment without adding connective prose. Each option records source entry IDs. A custom caption remains exact locked copy even when its claims cannot be mapped automatically.

### Copy modes

- Locked: use exact supplied wording.
- Assisted: propose three short options, then use the selected one.
- Inferred: generate one understated caption when the user delegates.
- Writable: omit a fixed message and preserve blank rules.

### Caption heuristics

- Prefer 2–12 words for image fronts.
- Prefer one or two short sentences for split cards.
- Put longer personal messages on the back.
- Match the user’s language.
- Avoid generic travel slogans, hashtags, marketing language, and sentimental exaggeration.
- Keep location/date separate from the emotional caption.

### Text rendering strategy

Generate art and exact type in separate passes when possible. The image model should create the scene and paper material; a deterministic composition step should place required text. If only image generation is available, keep text short and verify every character.

## 12. Prompt architecture

Prompt Compiler V3 compiles prompts in this order:

1. Output contract.
2. Source role.
3. Scene Graph.
4. Scene Contract.
5. Memory Authority.
6. Mutation Budget.
7. Transformation path.
8. Layout plan.
9. Scene-dependent reduction map.
10. Material logic.
11. Color function.
12. Locked-copy strategy.
13. Reproduction.
14. Privacy and reference boundary.
15. Hard failures.
16. Scene Delta expectation.

The prompt must specify visible decisions rather than aesthetic adjectives alone.

## 13. Quality gates

### Content

- Correct photo or generated subject is used.
- Every source role, Scene Graph relation, Scene Contract lock, Mutation Budget decision, transformation path, and capability is recorded.
- Exact caption, location, date, and message match character-for-character.
- No private metadata is exposed.
- No reference-specific brand, signature, watermark, or exact layout is copied.

### Composition

- Surface choice is visually obvious.
- Picture and text fields do not compete.
- Writing rules remain usable.
- Type is inside safe areas and legible at intended size.
- Decorative marks stay subordinate.

### Postcard

- Output ratio and orientation match the brief.
- Print outputs include safe margins and sufficient pixel dimensions.
- Duplex sides match in size and orientation.
- No fake official postage or routing marks appear.

### Zine

- One scene or relation anchors the page.
- Quiet paper remains structurally important.
- Texture belongs to the print world rather than a mockup.
- The page does not drift into advertising or dense collage.

### Failure response

Retry at most once when tightening the prompt has a clear chance of fixing preservation, hierarchy, or style. If a hard requirement still fails, provide the best clean layer, the exact copy and placement recipe, and a concise limitation.

Every gate reports **verified**, **declared**, **warning**, **failed**, or **not applicable**. A high lock is a declaration, not evidence that an AI edit preserved identity.

## 14. Performance strategy

- Load only route-relevant references.
- Inspect each source image once and retain the observation record during the run.
- Separate picture ideation from caption ideation so one does not repeatedly invalidate the other.
- Compile one final prompt from structured fields instead of repeatedly appending adjectives.
- Use deterministic text composition for exact copy instead of regenerating the full scene.
- For batches, plan all recipes before generation to prevent accidental repetition.
- Regenerate only for hard failures, not small subjective preferences.
- In the Studio, schedule through `requestAnimationFrame`, cache stable seeded texture and the art layer, and redraw the locked-copy layer independently during ordinary typing.

## 15. Accessibility and privacy

- Provide alt text describing subject, composition, color, and visible text.
- Maintain strong enough contrast for required copy; texture must not reduce legibility.
- Do not infer sensitive traits from people in photos.
- Do not read, store, or publish EXIF GPS unless the user explicitly asks and understands the consequence.
- Treat personal photos as task-scoped references. The core Studio keeps them in memory with `connect-src 'none'`; only the separate opt-in gateway transmits the precisely disclosed prompt, credential, and required source image after explicit consent.
- Ship no analytics, trackers, remote fonts, remote images, remote APIs, or telemetry; enforce `connect-src 'none'` in the browser Content Security Policy.
- Track preset-owned versus user-owned copy so a custom photo cannot inherit demo location, date, caption, description, or provenance.
- Flag when handwritten or tiny decorative text may be unreadable.

## 16. Output contract

Every creation response returns:

1. Generated artifact or absolute local path.
2. Final prompt actually used.
3. Recipe and surface.
4. Picture source, source role, Scene Graph, Scene Contract, Mutation Budget, transformation path, and capabilities.
5. Locked-copy record.
6. One short interpretation.
7. Any retry or limitation.
8. Explainable art-direction record and Scene Delta.
9. Concise alt text.

Prompt-only responses omit the artifact and make no generation claim. Reference analysis returns evidence, reference grammar, variables, reference residue, a reusable prompt, and confidence limits.

## 17. Evaluation scenarios

The canonical V3 suite contains 58 scenarios. It covers the original routing and source cases plus Memory Authority, zero-fabrication caption traceability, authority conflicts, Scene Graph validation, scene-evidence separation, lock/budget precedence, gaze and horizon layout, material conflicts, Scene Delta honesty, four- and eight-part memory sequences, Collection DNA, similarity guarding, per-lock verification, hostile files, Unicode copy, privacy, source-free distillation, capability loss, hybrid work, and reduction. Only three cases are an explicit legacy-alias group.

- One supplied landscape photo, exact location/date/caption, split layout.
- One front-only portrait of an identifiable person with native identity, geometry, spatial, palette, and count locks.
- Generated scene with user-selected subject and assisted caption options.
- Multiple unrelated photos where selection is ambiguous.
- Duplex front/back with a long message moved to the back.
- Prompt-only request with no generation claim.
- Single reference analysis with cautious confidence.
- Four-card batch with a variation ledger and no adjacent template repetition.
- Private-location test where the file contains metadata but the user supplies no location.
- Text-failure test where the model misspells a locked caption and the workflow reports or corrects it.

## 18. Package map

See `ARCHITECTURE.md` for the shipped Studio module graph, provenance flow, render invalidation model, and Skill boundary. The legacy `app.js` monolith remains as a non-loaded historical reference; `index.html` loads `src/main.js`.

Additional implemented demo assets:

- `demos/EXTRA_DEMOS.md` and `demos/generated/demo-04-*.png` through `demo-07-*.png` cover still life, image-led front, minimal night zine, and writable back routes.
- `demos/USER_PHOTO_STYLE_DEMOS.md` and `demos/USER_PHOTO_STYLE_DEMOS_EXPANSION.md` document 27 source-preserving transformations: three treatments for each of nine supplied photographs.
- `demos/user-photo-styles/source-photos/` preserves the nine supplied originals; `review-previews/` contains reduced inspection references; `generated/` contains the nine styled outputs; and `MANIFEST.csv` records source/output hashes.
- `skills/still-scenes-postcard-zine/assets/demos/` and `assets/user-photo-demos/` hold reusable, byte-identical copies of all 34 distinct rendered examples.

## 19. Future enhancements

- Semantic, local vision assistance for Scene DNA suggestions without location inference.
- Contact-sheet selection when many images are supplied.
- Script-aware font packaging with clear licensing for broader multilingual glyph coverage.
- CMYK-aware proof export, printer profiles, and automated press certification.
- Caption tone presets based on user-provided examples rather than generic labels.
- Sequence planning for travel diaries and seasonal card sets.
- Editable SVG or layered export when the runtime supports it.
