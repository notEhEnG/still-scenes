# Still Scenes Architecture

## Product boundary

Still Scenes contains two cooperating products:

- **Still Scenes Studio** is a deterministic, local-first browser composer. It loads a source image, renders paper layouts, fits locked copy, compiles a brief and prompt, measures deterministic quality properties, and exports RGB PNG files.
- **Still Scenes Skill** is the AI-assisted planning, generation, transformation, inspection, and recovery workflow under `skills/still-scenes-postcard-zine/`.

The Studio does not call an image model. The Skill must inspect runtime capabilities before promising generation, editing, exact typography, inspection, or export.

## Browser runtime graph

~~~text
index.html
  └── src/main.js
      ├── state.js ───────── provenance and copy ownership
      ├── scene-contract.js ─ locks, paths, reduction maps
      ├── image-loader.js ─── bounded decode and resource lifecycle
      ├── layout.js ───────── dimensions, views, safe geometry
      ├── typography.js ───── exact wrapping, fitting, collision checks
      ├── textures.js ─────── stable seeded cached texture layers
      ├── render/ ─────────── split, front, back, duplex, and zine drawing
      ├── prompt-compiler.js ─ route-aware brief and Prompt V2
      ├── alt-text.js ─────── route-aware canvas descriptions
      ├── quality.js ──────── verified/declared/warning/failed/N/A gates
      ├── export.js ───────── blob-based RGB PNG output
      └── accessibility.js ── focus, tabs, clipboard, announcements
~~~

`app.js` is the preserved V1 monolith. It is not referenced by `index.html` and is outside the shipped runtime graph.

## State and provenance

The initial document is custom mode with blank location, date, and caption. Source state records:

~~~text
kind: none | preset | user-upload
presetId
filename
mimeType
userOwned
loadedAt
width / height
description
~~~

Each locked-copy field separately records `owner: blank | preset | user` and `dirty`. Loading a preset initializes a complete recipe and marks its copy as preset-owned. A successful user upload clears only untouched preset-owned copy, removes preset provenance and description, and preserves fields the user edited. Validation failure leaves the previous active source unchanged and reports that behavior.

## Scene Contract

`scene-contract.js` maps legacy high/medium/low values into explicit identity, geometry, spatial, palette, count, and text locks. The four transformation paths are independent of the compatibility alias:

- Preserve uses source photography.
- Reduce keeps source photography recognizable while merging secondary detail.
- Hybrid keeps a real source anchor and extends source-derived geometry.
- Distill draws no source-photo raster.

Browser Distill uses user-declared Scene DNA, source-derived palette samples, a stable seed, and procedural shapes. It is intentionally narrower than semantic model-based distillation.

## Render and invalidation model

The renderer separates an art layer from a locked-copy layer. The art cache key includes route, active duplex side, dimensions, source identity, treatment, transformation, paper, accent, texture, and coarse text-density thresholds. Typing normally redraws only the copy layer. Art redraw occurs when an art input changes or a text-density threshold materially changes layout allocation.

Texture is generated from a document-session seed and cached. It does not run full-frame random pixel mutation on each keystroke. “Regenerate Texture” increments the seed revision deliberately.

Route-compatible views are enforced in state:

| Route | Views |
| --- | --- |
| split | composite, text-free base |
| front | composite, text-free base |
| back | back |
| duplex | front, back |
| zine | composite, text-free base |

## Quality semantics

The Studio verifies only properties it measures: bounded source loaded, source provenance, preset-copy isolation, route/view agreement, exact input strings passed to deterministic drawing, measured overflow/collision, source-free procedural distillation, canvas dimensions, and declared safe geometry.

Scene identity and AI preservation remain **declared**, not verified, because the Studio has no semantic vision model. Print output is described as RGB and print-sized only when physical dimensions and PPI are known.

## Static deployment

The production app has no build step and no runtime package dependency. Serve the repository over HTTP so ES modules and local preset images use a normal same-origin context:

~~~bash
python3 -m http.server 8000
~~~
