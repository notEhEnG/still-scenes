# Quality Gates

Read this reference before returning any generated artifact, final prompt, or reference analysis.

## Gate 1: Brief completeness

- Route and surface are explicit.
- Picture source is supplied, generated, or hybrid.
- Every supplied image has one role.
- Preservation level and visible invariants are recorded.
- Caption mode is locked, assisted, inferred, or writable.
- Orientation and output target are explicit.
- Privacy-sensitive location handling is recorded.

## Gate 2: Source handling

- Every material image was inspected.
- The actual edit target was included in generation.
- Reference-only images contributed grammar, not identity.
- No source watermark, signature, brand, caption, exact date, exact location, or exact composition was copied.
- No hidden GPS or metadata-derived location was printed without approval.

## Gate 3: Picture fidelity

For high preservation:

- identity remains recognizable;
- facial structure and defining markings do not drift;
- object or pet count remains correct;
- silhouette and product geometry remain stable;
- recognizable colors remain unless changes were permitted;
- focal relation survives the crop.

For medium preservation:

- subject and defining traits remain recognizable;
- permitted crop, palette, and paper treatment match the brief.

For low preservation:

- the new composition expresses the selected relation;
- the source subject and exact layout are not reproduced.

If a hard invariant fails, regenerate once with fewer permitted changes. If it fails again, state the limitation.

## Gate 4: Exact copy

Compare each field character-for-character:

~~~text
caption:
message:
location:
date:
credit:
~~~

Check spelling, punctuation, casing, diacritics, language, and required line breaks. Decorative or accidental model text fails the gate. If exact text cannot be corrected, return a text-free layer and precise placement instructions.

## Gate 5: Postcard composition

- Ratio and orientation match.
- The selected surface is visually obvious.
- Image, caption, and writing field have a clear hierarchy.
- Safe margins are consistent.
- Important subject details are not clipped.
- Writing rules remain usable and low contrast.
- Stamp or camera marks are subordinate.
- No fake official postage, address, routing code, or certification appears.
- The card reads at full size and thumbnail size.

For split cards:

- photo field is roughly 44%–49% of width unless a documented variant is used;
- writing field has adequate width;
- the gutter separates fields without feeling like a UI divider;
- location/date and utility mark do not collide;
- footer remains quiet.

For duplex:

- front and back dimensions match;
- orientation matches;
- paper and accent families correspond;
- files remain separate unless a proof sheet was requested.

## Gate 6: Zine composition

- One visual event or relation anchors the page.
- Open paper remains structurally important.
- The cluster is intentional and not a random pile of objects.
- Typography behaves like a note or fragment rather than an advertisement.
- One accent remains visible at thumbnail size.
- Texture belongs to the printed/scanned world.
- The result avoids full-scene, commercial, glossy, 3D, neon, and dense-scrapbook drift.

## Gate 7: Print target

Only claim print readiness after verifying:

- pixel dimensions;
- intended physical size;
- ppi;
- bleed assumption or printer specification;
- safe-area clearance;
- readable required type;
- duplex orientation;
- flattened or transparency behavior;
- color-profile limitation.

If CMYK or printer proofing is unavailable, describe the artifact as print-sized, not press-certified.

## Gate 8: Prompt-only

- No image was generated.
- The response makes no generation claim.
- No unresolved placeholders remain.
- The prompt includes surface, ratio, geometry, image contract, scene, typography strategy, accent, reproduction, and relevant avoids.
- The recipe and locked-copy record accompany the prompt.

## Gate 9: Reference analysis

- Observed and inferred claims are separated.
- Dimensions come from metadata when available.
- Single-sample traits are not presented as collection-wide rules.
- Fixed rules, variable rules, and sample residue are distinct.
- Reusable prompts create a new subject and composition.
- Confidence and file limitations are stated.

## Gate 10: Batch

- Image-to-card mapping is explicit.
- Shared family traits are visible.
- Adjacent outputs change at least three meaningful axes.
- Four or more outputs use at least three layout families.
- The same surface + picture-treatment pair is not repeated on adjacent cards.
- Locked copy remains correct for every item.

## Return checklist

Return:

- artifact or absolute path;
- final prompt;
- recipe;
- image-role and preservation record;
- locked-copy record;
- one short interpretation;
- retry or limitation;
- concise alt text.
