# Prompt Library

Read this reference for Create, Prompt-only, Analyze + Create, and Batch Set routes. Replace every bracketed field. Do not send unresolved placeholders to image generation.

## Prompt Compiler V2

Compile visible instructions in this order:

1. Output contract.
2. Scene Contract.
3. Scene DNA.
4. Transformation path.
5. Composition.
6. Material language.
7. Scene-dependent reduction map.
8. Color function.
9. Locked-copy strategy.
10. Reproduction.
11. Privacy and source boundary.
12. Hard failures.

Do not rely on vague words such as beautiful, artistic, balanced, minimal, or aesthetic without renderable constraints.

### Reduction intelligence

Choose only the map relevant to the actual scene:

- Dense foliage: retain canopy direction and one to three branch gestures; merge leaves into two to five masses; remove about 80–95% of micro-detail when simplified.
- Clouds: retain silhouette, light direction, and the dominant warm/cool relationship; merge small fragments.
- Cities: retain skyline or horizon and one to three identifying structural rhythms; remove repetitive windows and street clutter.
- People: preserve declared identity locks; simplify the environment before the person.
- Products: geometry, construction, proportions, and count locks outrank style.
- Landscapes: preserve horizon, dominant path, depth layers, and major color fields.

Never substitute “apply minimalism” for a scene-dependent reduction map.

## User invocation prompts

### Supplied-photo postcard

~~~text
Use $still-scenes-postcard-zine with my attached photo as the scene anchor. Make a landscape split postcard. Build a Scene Contract that locks [identity, geometry, spatial relation, palette, and count]. Use the preserve path and the exact caption “[caption]”, location “[location]”, and date “[date]”. Return the artifact, final prompt, recipe, Scene Contract, capability record, and alt text.
~~~

### Generated-picture postcard

~~~text
Use $still-scenes-postcard-zine to generate the picture and make a [front / split / duplex] postcard. The picture should show [subject, place, time, weather, viewpoint, key detail]. Use the exact caption “[caption]”. Choose a restrained paper and typography recipe that supports [mood].
~~~

### Caption-assisted flow

~~~text
Use $still-scenes-postcard-zine with this photo. First give me three captions in a [observational / reflective / diary / minimal] voice, each under [word count] words. Wait for my selection, then make a [surface] postcard with the selected wording locked exactly.
~~~

### Scene distillation

~~~text
Use $still-scenes-postcard-zine to distill this photo into a new zine artwork. Do not retain the photograph itself. Preserve only the relation “[relation or feeling]”. Use [language] for one short caption and avoid copying any source text or exact composition.
~~~

### Prompt-only

~~~text
Use $still-scenes-postcard-zine in Prompt-only mode. Build a production-ready prompt for a [surface] card about [scene]. The exact copy is “[copy]”. Do not generate an image and do not imply that one was generated.
~~~

### Batch

~~~text
Use $still-scenes-postcard-zine to make [count] related cards from these images. Map one chosen image to each card, keep [shared identity], vary at least the layout, crop, and caption placement between adjacent cards, and return a variation ledger.
~~~

## Image-generation templates

### A. Text-free generated scene layer

Use this first when exact copy will be composed separately.

~~~text
Create a [ratio, orientation] scene image for a personal postcard. Show [specific subject] in [specific place or spatial setting], at [time and light], viewed from [viewpoint and framing]. Preserve [key relation or object count]. Use [palette] with [exact accent] and a [emotional temperature] atmosphere.

Compose the image so the postcard layout has usable quiet space at [location], occupying about [percentage] of the frame. Keep the scene photographic or illustrated as specified: [rendering mode and material]. The focal subject should occupy about [percentage] and remain legible at thumbnail size.

Generate no words, letters, numbers, logos, signatures, watermarks, borders, stamp marks, or UI elements. Do not add invented people, objects, or landmarks. Avoid [relevant style drift].
~~~

### B. Preserve-path scene-anchor layer

~~~text
Use the supplied photograph as the scene anchor on the preserve path. Enforce these Scene Contract locks: [identity locks], [geometry and count locks], [spatial locks], and [palette locks]. Prefer the actual photo crop or a faithful printed-photo fragment; do not redraw or replace the subject.

Permit changes only to [crop limits, scale, surrounding paper, surface treatment, optional color wash]. Stage the photo at [position and share] inside a [ratio, orientation] postcard composition with [paper tone] and [border treatment]. Reserve [percentage and position] as clean paper for later exact typography.

Apply only [subtle film grain / soft print / restrained halftone] outside identity-critical detail. Generate no required text, logos, watermarks, fake postage, or unrelated decorations. Avoid face drift, changed markings, changed geometry, missing objects, added objects, aggressive crop, glossy mockup, commercial advertising, and dense scrapbook styling.
~~~

### C. Field-note split postcard

Use this when text rendering is reliable or a deterministic compositor will add the locked copy.

~~~text
Create a landscape 3:2 personal split postcard on warm [paper tone] matte paper. Use an outer safe inset of about 3% of the short edge. Place a framed [supplied photo / generated scene] in the left [44–49]% of the canvas, a [3–5]% gutter, and a calm writing field on the right. Keep the whole result as a flat front-facing paper composition, not a photographed mockup.

[If supplied photo: Use the supplied photograph as the scene anchor with the declared Scene Contract. Enforce [locks] and permit only [allowed mutations].] [If generated: Show [scene description] with [viewpoint, light, palette, and relation].] Use a clean paper mat around the picture and preserve the focal subject at thumbnail size.

In the right field, reserve the upper-left for location “[location]” and date “[date]”, the upper-right for one small [accent color] camera outline or empty stamp frame, and the middle for [six to nine faint writing rules / exact short message]. Place the exact caption “[caption]” at [position]. Use [editorial serif] for the primary line and [small utility sans or mono] for metadata. Keep all locked wording character-for-character; if exact text cannot be guaranteed, leave clean text zones for deterministic composition.

Use subtle paper fiber, low-contrast rules, diffuse flat light, and [mood]. Avoid commercial headline hierarchy, CTA, fake logo, fake official postage, glossy mockup, hard shadow, 3D depth, dense decoration, extra text, misspelled text, and copied reference identity.
~~~

### D. Image-led front

~~~text
Create a [ratio, orientation] image-led personal postcard front. Use [paper tone] with a [border width] paper margin. Place [supplied or generated picture description] across [70–90]% of the canvas, preserving [invariants] and the scene relation. Keep [quiet-space position] open for the caption.

Treat the image as [clean photo / faded film print / torn insert / halftone illustration] with [subtle reproduction detail]. Add only one [exact accent] mark tied to [scene or postal function].

Place the exact short caption “[caption]” at [position] in [typographic role], with optional location “[location]” and date “[date]” in smaller utility type. Preserve all wording exactly or leave a clean copy zone for deterministic placement.

Flat front-facing paper object, diffuse light, [mood]. Avoid ad layout, CTA, logo, glossy mockup, long text, arbitrary stickers, hard shadow, 3D, dense collage, and altered subject identity.
~~~

### E. Writable back

~~~text
Create a [ratio, orientation] writable postcard back on [paper tone] matte stock. Keep a safe inset of [percentage]. Allocate [52–62]% of the width to a message field and [30–40]% to a recipient field, with an optional fine divider. Put an empty decorative stamp frame at the upper-right.

Use [six to nine] low-contrast writing rules in the message field. Add the exact location “[location]” and date “[date]” at [position], with optional exact footer “[credit]”. If a message is supplied, typeset “[message]” character-for-character and wrap it at natural phrase boundaries; otherwise keep the field writable.

Use one restrained [accent color] utility mark and subtle paper fiber. Keep typography quiet, functional, and readable. Do not invent an address, postage value, barcode, tracking mark, postal certification, logo, or extra wording.
~~~

### F. Duplex pair

~~~text
Plan one shared [ratio, orientation], [paper family], [typographic family], [accent family], and edge treatment. Run two separate generation or composition steps so each side becomes its own artifact.

FRONT PROMPT: Create the image-led front using [scene], [reference role], [Scene Contract], [transformation path], and short locked caption “[caption]”. Use the shared family and reserve no address field.

BACK PROMPT: Create the writable back using exact message “[message]”, location “[location]”, date “[date]”, and an empty decorative stamp placeholder. Use the shared family and do not repeat the front image unless requested.

Verify that front and back dimensions and orientation match. Export them as separate artifacts. Do not ask one image-generation call to render both sides, and do not combine them into a proof sheet unless the user requests one.
~~~

### G. Distilled zine page

~~~text
Create a [ratio] vertical paper zine page with [65–88]% open paper and one visual cluster occupying [10–30]% at [position]. Use [paper tone] with restrained [fiber, scan, or print character], flat front-facing reproduction, and no mockup.

Do not include the source photograph. Translate the scene relation “[relation]” into [one concrete new metaphor or spatial relation]. Render it as [printed illustration / silhouette / paper fragment / texture window / two-panel relation] with [material treatment]. Create a clearly new composition.

Use the exact short caption “[caption]” at [position] in [type role], plus optional [date or note] in small utility type. Add one [exact hue] accent through [subject, ink block, line, or fragmented type], occupying a small but thumbnail-visible share.

Keep the mood [mood]. Avoid full illustrated scene, commercial headline, product ad, logo, CTA, glossy mockup, cinematic depth, hard shadow, 3D, neon, dense scrapbook, multicolor chaos, source wording, and exact source composition.
~~~

## Caption-generation prompt

~~~text
Write three caption options for a personal postcard based only on this observed scene: [scene facts]. Use [language] and a [tone] voice. Keep each option between [minimum] and [maximum] words. Make each option materially different: one observational, one reflective, and one minimal. Do not invent a relationship, event, location, weather, or emotion not supported by the user. Avoid hashtags, slogans, clichés, and marketing language. Return only a numbered list.
~~~

## Reference-analysis prompt

~~~text
Inspect every supplied reference and separate observation from interpretation. For each usable image, record dimensions when available, ratio, picture share, quiet space, paper, typography, palette, reproduction, marks, hierarchy, and source-specific text or identity.

Synthesize reference grammar that repeats, variables that can change, and reference residue that must not be reused. With one reference, report only observed traits and confidence limits. Produce a reusable Still Scenes prompt that creates a new subject and composition without copying source text, branding, watermark, signature, date, location, person, or exact layout.
~~~

## Compact avoid bank

Select only relevant items:

~~~text
commercial advertisement, CTA, fake logo, brand campaign, glossy paper mockup, clean UI card, cinematic lighting, hard shadow, depth of field on typography, 3D render, neon, cyberpunk, anime poster, cute sticker sheet, fashion editorial drama, dense scrapbook, too many objects, multicolor template palette, arbitrary decoration, fake official postage, invented address, tracking barcode, long image-model text, misspelled locked copy, changed face, changed markings, changed product geometry, copied watermark, copied signature, copied wording, copied composition
~~~

## Final prompt checks

- No unresolved bracketed fields remain.
- The exact picture or scene is named.
- Reference role, Scene Contract locks, transformation path, and source boundary are explicit.
- The reduction map is specific to the actual scene rather than generic minimalism.
- Locked copy is separated from optional decorative type.
- Layout includes ratio, placement, and approximate shares.
- Accent hue and material carrier are explicit.
- The text strategy acknowledges image-model limitations.
- Avoids are relevant rather than exhaustive.
