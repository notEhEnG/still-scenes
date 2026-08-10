# Still Scenes

Still Scenes is a personal postcard and scene-zine system built around one rule: the user's selected picture and exact words remain authoritative.

The repository contains two related products:

1. A dependency-free browser studio that composes uploaded photographs into postcard and zine layouts.
2. A reusable Codex skill that plans, prompts, generates, edits, reviews, and documents personal paper artifacts.

![Geometric postcard made from a user-supplied urban sunset](demos/user-photo-styles/generated/demo-u11-wires-geometric.png)

## What is included

- Six skill routes: Postcard Create, Scene Zine Create, Prompt-only, Reference Analysis, Analyze + Create, and Batch Set.
- Five surfaces: image front, writable back, split card, duplex pair, and zine page.
- Explicit image roles: edit target, reference-only image, supporting insert, or no image.
- High, medium, and low preservation modes with visible source invariants.
- Locked caption, message, location, and date handling.
- Caption assistance, alt text, production records, and reusable generation prompts.
- Source-safe batch variation and privacy rules that never infer a printable location from photo metadata.
- A static Canvas-based web studio with local image upload and client-side PNG export.
- 34 distinct rendered demos: seven original generated scenes and 27 source-preserving transformations.
- Three treatments for each of the nine supplied photographs, with exact prompts and SHA-256 provenance.
- Twelve evaluation scenarios covering routing, source handling, exact copy, print surfaces, batches, and failure reporting.

## Quick start: browser studio

No package installation or build step is required.

~~~bash
cd /path/to/still-scenes
python3 -m http.server 8000
~~~

Open `http://localhost:8000/`.

Serving the directory over HTTP is preferable to opening `index.html` directly because browser file-origin restrictions can affect preset images and clipboard access.

### Browser-studio features

- Split postcard, image front, writable back, duplex, and distilled-zine routes.
- 3:2, 2:3, 4:5, 3:5, and A6 landscape output ratios.
- Click-to-upload and drag-and-drop local images; uploaded images remain in browser memory.
- Live location, date, caption, writing-rule, paper, accent, typography, postal-mark, and texture controls.
- Composite, text-free base, and writable-back views.
- Structured YAML brief, compiled prompt, and accessibility-alt-text inspector.
- Client-side RGB PNG export.
- Three built-in presets using the first three generated demos.

The browser studio is a deterministic layout composer and prompt workbench. It does not call an AI model or generate a new scene; raster generation and photo transformation happen through the Codex skill and image-generation workflow.

## Use the Codex skill

The portable skill package is [`skills/still-scenes-postcard-zine/`](skills/still-scenes-postcard-zine/).

Copy that directory into a new, non-conflicting directory under your Codex skills location, then invoke:

~~~text
$still-scenes-postcard-zine
~~~

Example request:

~~~text
Use $still-scenes-postcard-zine to turn my photo or scene idea into a postcard or zine artwork with a custom caption.
~~~

The skill returns the artifact or output path, final prompt, route and surface recipe, image role, preservation level, locked-copy record, accessibility alt text, and any retry or limitation note.

## Personal-photo collection: three styles per source

| Source | Style 1 | Style 2 | Style 3 |
|---|---|---|---|
| Urban sunset and wires | U01 split card | U10 newsprint | U11 geometric collage |
| Sea sunset | U02 full bleed | U12 watercolor | U13 darkroom contact print |
| Banded sunset | U03 triptych | U14 accordion strips | U15 monoprint |
| Crescent moon | U04 risograph | U16 silver gelatin | U17 celestial field note |
| Hillside garden | U05 botanical field note | U18 woven jacquard | U19 map fold |
| Blue hillside house | U06 paper collage | U20 blueprint | U21 colored pencil |
| White cloud tower | U07 Swiss editorial | U22 lithograph | U23 paper relief |
| Cloud and one bird | U08 cyanotype | U24 screenprint | U25 dry pastel |
| Orange-lit cloud | U09 vintage duotone | U26 stained glass | U27 encaustic transfer |

The complete, source-mapped prompt galleries are:

- [`demos/USER_PHOTO_STYLE_DEMOS.md`](demos/USER_PHOTO_STYLE_DEMOS.md) — U01–U09.
- [`demos/USER_PHOTO_STYLE_DEMOS_EXPANSION.md`](demos/USER_PHOTO_STYLE_DEMOS_EXPANSION.md) — U10–U27.
- [`demos/user-photo-styles/MANIFEST.csv`](demos/user-photo-styles/MANIFEST.csv) — source files, review references, output files, dimensions, styles, captions, and SHA-256 hashes.

## Representative generated examples and exact prompts

The following images are included directly in this README. Each prompt is the exact prompt used for the displayed output.

### U11 — Geometric urban sunset

![Urban sunset and utility wires in a geometric editorial layout](demos/user-photo-styles/generated/demo-u11-wires-geometric.png)

<details>
<summary>Exact U11 prompt</summary>

~~~text
Use case: image editing / geometric modernist collage
Asset type: user-photo demo U11 for the Still Scenes Postcard Zine skill
Primary request: Recompose the supplied urban sunset as a landscape 3:2 geometric photo-collage postcard, keeping its infrastructure and dusk unmistakably recognizable.
Reference handling: Use only the supplied photo. Preserve the main tree silhouettes, power tower, lamps, poles, wires, and saturated sunset strip. Do not erase or redraw the wires; let their real diagonals organize the composition.
Composition: Flat cream paper. Place the full photograph in a wide central rectangle occupying 74% of the card. Overlay only three simple translucent shapes—a rust circle behind the tower, a narrow cobalt rectangle near one lamp, and a cream semicircle at the lower edge—without covering the defining scene. Add two hairline grid rules and generous margins.
Style/medium: 1920s-inspired geometric editorial design interpreted as contemporary matte photo collage, crisp shapes, subtle paper grain, no historical logos.
Text (verbatim): "LINES CROSSING THE EVENING."; "STILL SCENES U11".
Typography: First sentence exactly once in dark charcoal uppercase geometric sans along the upper-left margin. Second exactly once in tiny uppercase sans at lower right. No other readable text.
Color palette: cream, charcoal, source coral-pink, rust, cobalt blue.
Mood: rhythmic, graphic, still recognizably documentary.
Constraints: source scene and wire network remain identifiable; exact text; no people, vehicles, logos, URL, date, location, watermark, or postal marks.
Avoid: abstracting away the photograph, extra geometric clutter, constructivist propaganda, glossy mockup, 3D shadow, neon, extra words, misspellings.
~~~

</details>

### U18 — Woven hillside garden

![Hillside garden transformed into a woven jacquard postcard](demos/user-photo-styles/generated/demo-u18-garden-jacquard.png)

<details>
<summary>Exact U18 prompt</summary>

~~~text
Use case: image editing / woven textile interpretation
Asset type: user-photo demo U18 for the Still Scenes Postcard Zine skill
Primary request: Transform the supplied hillside garden photograph into a landscape 3:2 woven-textile scene postcard while retaining the real landscape structure.
Reference handling: Use the supplied image as the sole scene source. Preserve the large shaded tree at left, tall narrow conifers, blue sky and clouds, layered hillside, paths and fences, architecture glimpses, and small red foliage accents. Do not replace the garden with a generic forest.
Composition: Flat warm flax-paper card. A large rectangular woven image occupies 84% of the surface with a narrow cream selvedge. Use a simple caption strip underneath and one short red stitched bar; no decorative border pattern.
Style/medium: Fine jacquard tapestry translated from photography, visible interlaced threads, controlled tonal weaving, matte natural fibers, contemporary textile sample.
Text (verbatim): "THE HILLSIDE WOVE ITSELF."; "STILL SCENES U18".
Typography: First sentence exactly once in dark forest-green uppercase serif at bottom left. Second exactly once in tiny uppercase sans at bottom right. No other text.
Color palette: moss, pine, fern, sky blue, flax, small woven red accents.
Mood: dense, tactile, sheltered.
Constraints: source depth, trees, structures, and color anchors remain recognizable; exact text; no people, fantasy animals, logo, URL, date, location, watermark, or postal marks.
Avoid: decorative folk motifs, carpet border, generic jungle, resort imagery, glossy mockup, 3D folded fabric, extra words, misspellings.
~~~

</details>

### U26 — Stained-glass cloud

![Orange-lit cloud transformed into contemporary stained glass](demos/user-photo-styles/generated/demo-u26-cloud-stained-glass.png)

<details>
<summary>Exact U26 prompt</summary>

~~~text
Use case: image editing / stained-glass interpretation
Asset type: user-photo demo U26 for the Still Scenes Postcard Zine skill
Primary request: Transform the supplied orange-lit cloud photograph into a landscape 3:2 stained-glass scene postcard while preserving the real cloud mass.
Reference handling: Use only the supplied photo. Preserve the central billowing cloud glowing orange, darker surrounding cloud layers, low shadowed base, and source framing. Translate actual tonal boundaries into glass pieces without adding sun, landscape, figures, or symbols.
Composition: Flat front-facing warm-charcoal card. A broad rounded-rectangle glass panel fills 86% of the surface. Use fine dark lead lines that follow major cloud lobes and surrounding strata, with a narrow cream caption strip below.
Style/medium: Hand-cut translucent stained glass photographed straight-on, subtle material glow, fine leadwork, contemporary secular art panel.
Text (verbatim): "LIGHT GATHERED IN THE CLOUD."; "STILL SCENES U26".
Typography: First sentence exactly once in dark umber uppercase serif at lower left. Second exactly once in tiny uppercase sans at lower right. No other text.
Color palette: amber, burnt orange, smoke gray, charcoal, muted cream.
Mood: luminous, weighty, reverent without religious symbolism.
Constraints: recognizable source cloud silhouette and lighting; exact readable text; no crosses, religious icons, flames, explosions, people, logo, URL, date, location, watermark, or postal marks.
Avoid: church window motifs, kaleidoscope clutter, literal fire, disaster imagery, glossy product mockup, 3D room scene, extra words, misspellings.
~~~

</details>

## Demo documentation

- [`demos/DEMO.md`](demos/DEMO.md) — three foundational generated routes.
- [`demos/EXTRA_DEMOS.md`](demos/EXTRA_DEMOS.md) — four additional generated scenes and surfaces.
- [`demos/USER_PHOTO_STYLE_DEMOS.md`](demos/USER_PHOTO_STYLE_DEMOS.md) — first source-preserving treatment for each supplied photo.
- [`demos/USER_PHOTO_STYLE_DEMOS_EXPANSION.md`](demos/USER_PHOTO_STYLE_DEMOS_EXPANSION.md) — second and third treatments for each supplied photo.

## Repository structure

~~~text
.
├── README.md
├── DESIGN.md
├── index.html
├── app.js
├── styles.css
├── demos/
│   ├── DEMO.md
│   ├── EXTRA_DEMOS.md
│   ├── USER_PHOTO_STYLE_DEMOS.md
│   ├── USER_PHOTO_STYLE_DEMOS_EXPANSION.md
│   ├── generated/                         # 7 original generated demos
│   └── user-photo-styles/
│       ├── source-photos/                 # 9 preserved camera originals
│       ├── review-previews/               # 9 reduced inspection references
│       ├── generated/                     # U01–U27
│       └── MANIFEST.csv
└── skills/still-scenes-postcard-zine/
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── evals/evals.json
    ├── references/
    │   ├── style-system.md
    │   ├── postcard-system.md
    │   ├── prompt-library.md
    │   └── quality-gates.md
    └── assets/
        ├── demos/                          # mirrored 7 generated demos
        └── user-photo-demos/               # mirrored U01–U27
~~~

## Source handling and privacy

- Full-resolution source photographs remain unchanged in `demos/user-photo-styles/source-photos/`.
- Reduced review copies were used as image-generation references because the camera-sized JPEGs exceeded the image service input limit.
- The manifest records source and output hashes for integrity checks.
- One source JPEG reports recoverable decoder marker warnings but remains readable and passes ZIP integrity testing; it was not rewritten.
- No EXIF GPS fields were detected during inspection. The original photographs and timestamp-based filenames may still reveal personal context if this repository is published.
- Do not infer or print a private location from metadata. Only use a location explicitly supplied or approved by the user.

## Validation

Skill metadata:

~~~bash
python3 -B /path/to/skill-creator/scripts/quick_validate.py skills/still-scenes-postcard-zine
~~~

Web JavaScript syntax:

~~~bash
node --check app.js
~~~

Evaluation JSON:

~~~bash
python3 -c 'import json; json.load(open("skills/still-scenes-postcard-zine/evals/evals.json", encoding="utf-8")); print("evals: valid JSON")'
~~~

Image inspection:

~~~bash
identify demos/generated/*.png demos/user-photo-styles/generated/*.png
~~~

The completed workspace validation also compares every gallery image with its mirrored skill asset, checks all image dimensions, and rejects empty files or unexpected symlinks.

## Current browser-studio limitations

- Only demos 01–03 are connected to the preset dropdown; all 34 distinct outputs remain available through the documentation galleries.
- Duplex mode exports one currently viewed surface per PNG rather than automatically producing two files.
- Photo-treatment and preservation controls currently influence the brief and status labels more than the renderer itself.
- Quality-gate badges are illustrative rather than a complete automated visual audit.
- Fit and 100% zoom buttons do not yet have JavaScript handlers.
- Prompt and alt-text compiler wording is optimized for the default split route and can be generic on other surfaces.
- Uploaded images are not persisted after refresh.
- The interface is desktop-first and has no narrow-screen breakpoint.
- Google Fonts require network access; local font fallbacks are defined.
- Export is RGB PNG only—there is no CMYK, PDF, bleed, or print-production verification.

## Design references and originality

The design study refers to:

- [Gathered Scenes Zine Skill](https://github.com/Zeejay0/gathered-scenes-zine-skill)
- [GC Minimal Zine Poster](https://github.com/LiamGvchi/gc-minimal-zine-poster)

Still Scenes is independently written. It does not copy upstream assets, branding, source wording, or exact compositions, and it is not affiliated with or endorsed by either upstream project. Links in the demo research notes are visual-research cues only; the rendered demo assets are generated originals or transformations of the user's supplied photographs.

## License

No project license has been selected. Until the repository owner adds one, do not assume permission to redistribute the code, generated assets, or personal source photographs.
