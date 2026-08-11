# Postcard Surface System

Read this reference for postcard and print-target routes.

## Default decisions

- Use 3:2 landscape for a split card or landscape front.
- Use 2:3 portrait for a portrait-led front.
- Use A6 landscape or portrait when the user asks for a standard printable postcard.
- Use split when one landscape photo and a message are supplied without a surface choice.
- Use front when the request is image-led and copy is short.
- Use duplex when the user wants a polished front and a writable or addressed back.

## Output sizes

Use the user’s printer or platform specification when supplied. Otherwise:

| Target | Ratio or physical size | Suggested raster |
| --- | --- | --- |
| Digital landscape | 3:2 | 1800 × 1200 px |
| Digital portrait | 2:3 | 1200 × 1800 px |
| Social portrait | 4:5 | 1600 × 2000 px |
| A6 landscape print | 148 × 105 mm | 1748 × 1240 px at 300 ppi |
| A6 portrait print | 105 × 148 mm | 1240 × 1748 px at 300 ppi |
| 6 × 4 inch print | 6 × 4 in | 1800 × 1200 px at 300 ppi |

When a printer requires bleed, use its specification. If none is supplied, do not silently claim bleed-ready output. A common proof assumption is 3 mm bleed and at least 5 mm safe area, but label that as an assumption.

## Layout recipes

Treat these as compatibility fallbacks. V3 layouts are solved from the Scene Graph, Scene Contract, Mutation Budget, crop and copy pressure, gaze, horizon, quiet fields, and focal sensitivity.

### Field-note split

Best for a supplied landscape photograph plus place, date, caption, or message.

- Canvas: 3:2 landscape.
- Outer safe inset: 2.5%–4% of short edge.
- Photo field: 44%–49% of width.
- Gutter: 3%–5% of width.
- Writing field: remaining width.
- Photo: centered inside a warm paper mat with an inner border.
- Header: location at top-left of writing field; date below.
- Utility mark: small stamp frame or camera outline at top-right.
- Message: six to nine faint writing rules, or one short typeset message.
- Footer: low-contrast divider plus optional personal mark.

The design reference behind this recipe used a landscape image close to 3:2 and demonstrated the hierarchy well. Treat its place, date, accent, footer, and subject as reference residue rather than defaults.

### Image front

Best for a keepsake or duplex front.

- Canvas: chosen ratio.
- Photo or generated scene: 70%–90% of canvas, framed or full field with paper margin.
- Caption: one short line at bottom, side edge, or outside the photo.
- Location/date: optional and smaller than caption.
- Marks: zero to two.

### Writable back

Best for a physical card or message-first digital composition.

- Left area: message field occupying 52%–62%.
- Right area: address or recipient field occupying 30%–40%.
- Center divider: optional fine rule.
- Stamp area: upper-right, visibly a placeholder or decorative frame.
- Footer: tiny date, edition, or personal mark.

Do not fabricate postage value, tracking codes, official postal marks, or mailing eligibility.

### Caption band

Best for a strong image with minimal copy.

- Image: 72%–84% of height.
- Paper caption band: 16%–28%.
- Caption: one or two lines.
- Location/date: optional microtype aligned away from the caption.

### Small-window memory

Best for low-resolution photos or quiet zine-like cards.

- Open paper: 55%–75%.
- Image window: 18%–35%.
- Caption: distant counterweight rather than a large title.
- Accent: one tiny but purposeful printed mark.

### Duplex pair

Build front and back as two separate same-size canvases. Match:

- width and height;
- orientation;
- paper family;
- edge treatment;
- accent family;
- export profile.

Return a proof sheet only when requested.

## Picture selection

When one image is supplied, use it as the scene anchor unless the user assigns it to reference grammar only. When several are supplied:

1. Prefer an explicitly named file or numbered choice.
2. If the user describes a visible subject that uniquely identifies one image, use it.
3. If two or more unrelated candidates remain, ask which image to use.
4. For a batch, map one image to each card and report the mapping.

Do not choose based on hidden metadata or private location.

## Crop rules

- Preserve faces, hands, defining markings, and the scene relation.
- Do not crop through eyes, mouths, or the focal object without intent.
- Leave visual breathing room in the direction a subject faces or moves.
- For flowers or objects, keep at least one complete defining form when possible.
- For a scene anchor with strong geometry or identity locks, prefer fit-with-border over aggressive crop.
- Report when the requested ratio requires a meaningful crop.

## Copy placement

Treat these strings as separate locked fields:

~~~text
caption
message
location
date
credit
~~~

Use the user’s line breaks when explicitly supplied. Otherwise wrap at natural phrase boundaries. Never silently correct spelling or translate locked copy.

Recommended hierarchy:

1. Location or short emotional caption.
2. Message or writing field.
3. Date.
4. Credit or footer.

## Postal and camera marks

Marks must be decorative and non-deceptive:

- camera outline;
- empty stamp frame;
- date dot;
- fine divider;
- tiny registration cross;
- simple hand-drawn curve;
- one scene-derived color block.

Use zero to two by default. Remove marks before reducing copy legibility or image space.

## Print review

Before calling a file print-ready, verify:

- final pixel dimensions;
- requested physical size and ppi;
- bleed assumption;
- safe-area clearance;
- no required text below practical reading size;
- duplex orientation;
- color profile limitation;
- no accidental transparency;
- exact-copy match.

If CMYK conversion or printer-specific proofing is unavailable, say that the output is print-sized rather than press-certified.
