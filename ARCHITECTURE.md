# Still Scenes Architecture

## Product boundary

Still Scenes contains two cooperating products and one optional processing boundary:

- **Still Scenes Studio** is a deterministic, local-first browser composer. It loads a source image, renders paper layouts, fits locked copy, compiles a brief and prompt, measures deterministic quality properties, and exports RGB PNG or bleed-packaged RGB PDF files.
- **Still Scenes Skill** is the AI-assisted planning, generation, transformation, inspection, and recovery workflow under the canonical `skills/still-scenes-postcard/` package. The original `skills/still-scenes-postcard-zine/` package remains available for compatibility.
- **Optional generation gateway** is a separately loaded page with an explicit network CSP. It is disabled until the user supplies an endpoint and consents to the disclosed transfer.

The core Studio page does not call an image model and retains `connect-src 'none'`. Only the user's explicit Generate action opens `network.html`, which receives a one-time in-memory request from the same-origin Studio and calls the configured endpoint. The Skill must inspect runtime capabilities before promising generation, editing, exact typography, inspection, or export.

## Browser runtime graph

~~~text
index.html
  └── src/main.js
      ├── state.js ───────── provenance and copy ownership
      ├── scene-graph.js ──── compact declared scene relationships
      ├── scene-contract.js ─ locks, paths, reduction maps
      ├── mutation-budget.js  qualitative permissions + lock precedence
      ├── source-boundary.js  scene-anchor/evidence/reference separation
      ├── layout-solver.js ── graph- and constraint-derived layout plans
      ├── material-logic.js ─ reasoned treatment selection
      ├── scene-delta.js ──── expected and verification-updated changes
      ├── art-direction.js ── explainable external decision record
      ├── scene-intelligence.js  governed-plan orchestration
      ├── distillation.js ───── six-stage source-free conceptual plan
      ├── variation.js ────── meaningful axes + similarity guard
      ├── memory-sequence.js  current-request pacing and narrative roles
      ├── collection-dna.js ─ explicit family resemblance
      ├── collection-recipe.js  renderable variation adaptation
      ├── collection-state.js  isolated per-artwork session state
      ├── collection-ui.js ── collection controls and ordered item strip
      ├── collection-export.js  contact-sheet geometry and private manifest
      ├── memory-evidence.js ─ authority ledger, caption ladder, claim audit
      ├── image-loader.js ─── bounded decode and resource lifecycle
      ├── layout.js ───────── dimensions, views, safe geometry
      ├── typography.js ───── exact wrapping, fitting, collision checks
      ├── textures.js ─────── stable seeded cached texture layers
      ├── render/ ─────────── split, front, back, duplex, and zine drawing
      ├── prompt-compiler.js ─ route-aware brief and Prompt Compiler V3
      ├── alt-text.js ─────── route-aware canvas descriptions
      ├── quality.js ──────── verified/declared/warning/failed/N/A gates
      ├── export.js ───────── blob-based RGB PNG output
      ├── export-print.js ─── dependency-free raster PDF + bleed packaging
      ├── provenance.js ───── SHA-256 records and PNG iTXt embedding
      ├── provenance-reader.js  read-only embedded-record extraction
      ├── verify.js ───────── palette, dHash, and surface-ratio evidence
      ├── generate.js ─────── adapter contract and bounded image transfer
      ├── adapters/ ───────── generic JSON and OpenAI Images-compatible shapes
      └── accessibility.js ── focus, tabs, clipboard, announcements

network.html
  └── src/network-gateway.js ─ explicit-consent fetch in a separate CSP boundary

provenance.html
  └── src/provenance-reader-ui.js ─ local, read-only PNG inspection
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
sha256
description
~~~

Each locked-copy field separately records `owner: blank | preset | user` and `dirty`. Loading a preset initializes a complete recipe and marks its copy as preset-owned. A successful user upload clears only untouched preset-owned copy, removes preset provenance and description, and preserves fields the user edited. Validation failure leaves the previous active source unchanged and reports that behavior.

Returned-image state is separate from source state. It records the generated image resource, exact prompt, Scene Contract, Scene Intelligence snapshot, generation time, and latest verification report. Returning to the source releases the generated resource without mutating the source record.

Collection mode keeps 2–12 isolated editor snapshots in one in-memory workspace. The uploaded resources are referenced by their owning item rather than duplicated. Upload order is authoritative unless the user invokes the accessible reorder controls. Collection planning applies Collection DNA, Memory Sequence, and variation recipes before rendering; Scene Contract locks and extreme-ratio protections can override requested crop values, and both requested and resolved recipes remain inspectable.

Collection export produces a contact-sheet PNG with compact manifest-hash provenance and a separate complete JSON manifest. The manifest contains briefs and prompts but allow-lists source metadata to SHA-256, MIME type, and dimensions; local filenames, raw source bytes, EXIF, endpoint credentials, and inferred locations are excluded.

## Scene Intelligence pipeline

The browser builds one governed plan from deterministic state:

~~~text
declared source + copy
  → Memory Evidence Ledger
  → Scene Graph
  → Scene Contract
  → Mutation Budget
  → source boundary
  → constraint-based layout + material logic
  → expected Scene Delta
  → render / Prompt Compiler V3
  → heuristic returned-image report
  → verification-updated Scene Delta
~~~

`scene-graph.js` stores declared nodes, relations, direction, depth, quiet fields, focal hierarchy, density, and bounded source evidence. It labels a property observed only when an inspection path actually supplied that observation.

`memory-evidence.js` classifies exact user lines as observed declarations, remembered context, uncertainty, or forbidden invention. It detects exact cross-class conflicts, defaults memories to caption-only influence, assembles up to three zero-fabrication captions with source IDs, and audits wording traceability without making a truth claim. The Scene Contract and compiled prompt carry the full session ledger; compact provenance carries only its schema, influence policy, per-class counts, and `rawTextEmbedded: false`.

The graph is operational, not display-only: focal position and gaze drive alignment and breathing direction; horizon and source ratio constrain crop strategy; density changes image allocation; quiet fields become protected regions; and graph relations are appended to the scene-dependent reduction map and expected Scene Delta.

`mutation-budget.js` assigns `locked`, `tight`, `restrained`, `flexible`, `free`, or `not-applicable` per dimension. Scene Contract identity, geometry, spatial, palette, count, and text locks take precedence over profiles. Distill locks source raster out of the artifact.

`layout-solver.js` consumes the graph, route, copy pressure, crop pressure, horizon, gaze, density, quiet fields, and lock sensitivity. Renderers consume its image share, crop policy, and alignment; the prompt and art-direction record consume the same plan. `material-logic.js` records a reason and refuses destructive material when it conflicts with protected identity, geometry, or count.

`scene-delta.js` separates expected changes from observed or heuristic evidence. It records retained, simplified, transformed, removed, added, and unexpected entries plus independent lock-family statuses. The only status values are `declared`, `verified`, `warning`, `failed`, and `not-applicable`.

`variation.js`, `memory-sequence.js`, and `collection-dna.js` are pure current-request planners. The similarity guard compares every candidate with prior recipes and requires at least three meaningful axis changes unless consistency is intentional. Nothing claims hidden cross-session memory.

## Scene Contract and source roles

`scene-contract.js` accepts legacy high/medium/low values only as compatibility inputs that seed explicit locks. All V3 reasoning consumes the resulting native Scene Contract and Mutation Budget. The four transformation paths are independent of the alias:

- Preserve uses source photography.
- Reduce keeps source photography recognizable while merging secondary detail.
- Hybrid keeps a real source anchor and extends source-derived geometry.
- Distill draws no source-photo raster and uses `scene-evidence` when a personal photograph supplies the scene.

`scene-evidence` differs from `reference-grammar`: scene evidence belongs to the user's scene and may contribute Scene DNA, palette, gesture, depth, relation, and emotional temperature; reference grammar belongs to an external visual reference and may contribute only reusable visual behavior.

Browser Distill uses user-declared Scene DNA, source-derived palette samples, a stable seed, and procedural shapes. It is intentionally narrower than semantic model-based distillation.

`distillation.js` makes the source-free conceptual path executable in the browser: observation → residue → relation → optional declared tension → paper-native form → opening. It leaves tension empty when none was explicitly supplied, and its output is compiled into the brief, prompt, art-direction record, Scene Delta plan, and portable provenance.

The contract also records its expected route, aspect-ratio label, and pixel dimensions. Those deterministic surface fields support post-generation geometry verification.

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

`verify.js` adds a post-generation evidence pass. It compares dominant color buckets from the source, returned image, and explicit hexadecimal palette locks; compares 64-bit grayscale dHashes; and measures returned-image aspect ratio against the contract surface. Each check reports `verified`, `warning`, `failed`, `declared`, or `not-applicable`, numeric confidence, and its raw distance. A lock-family map reports identity, geometry, spatial, palette, count, text, source boundary, layout safety, and export correctness independently.

This evidence is heuristic. It can flag a shifted palette, radically different coarse composition, or wrong surface ratio. It cannot recognize a person, prove product geometry, count semantic objects, perform OCR, prove source-raster absence, or establish that every Scene Contract lock was honored. Those lock families remain declared or not-applicable even when the three browser signals are verified.

## Optional generation boundary

The optional gateway has two browser-native adapters:

- `generic-json` sends a JSON body containing the compiled prompt, optional model, output format/size, and—when required—a base64 source image.
- `openai-images` sends a JSON generation request or multipart edit request and accepts a base64 or URL image result.

The endpoint URL and API key remain in the current page/window memory. They are never written to local storage, cookies, a service worker, logs, provenance, or exported files. Request credentials are omitted and referrer policy is `no-referrer`; the configured bearer key is the only authentication value added. The returned image is bounded to 25 MB, decoded through the existing safe image loader, composed as an art layer, and immediately passed to `verify.js` when source evidence exists.

The network page's CSP permits HTTP/HTTPS connections because a user-supplied host cannot be enumerated in a static policy. The core page's CSP is unchanged. On an HTTPS GitHub Pages deployment, normal browser mixed-content rules prevent calls to insecure HTTP endpoints. Endpoint operators may retain the prompt, key, and source image under their own policies.

## Export and portable provenance

PNG remains the default export. The export path inserts a `still-scenes:provenance` iTXt chunk after browser encoding and downloads a matching `.json` sidecar. The additional PDF path creates a one-page PDF 1.7 file around an edge-extended raster, with a configurable 3 mm default bleed, `/MediaBox`, `/BleedBox`, `/TrimBox`, and an XMP provenance field. Both formats remain RGB; the PDF writer performs no CMYK conversion, ICC proofing, or press certification.

Provenance schema v2 includes the source SHA-256 when known, a limited current Scene Contract and Scene Intelligence summary, count-only Memory Evidence signature, Scene Delta signature, compiled-prompt SHA-256, local timestamp, route/dimensions, bleed, and RGB declaration. When a returned AI image is active, a generation snapshot keeps its original contract, intelligence record, and prompt hash separate from later local composition edits. The schema excludes raw source bytes, raw Memory Evidence text, full prompts, EXIF, credentials, and inferred location. See `PROVENANCE.md`.

## Static deployment

The production app has no build step and no runtime package dependency. Serve the repository over HTTP so ES modules and local preset images use a normal same-origin context:

~~~bash
python3 -m http.server 8000
~~~

`.github/workflows/pages.yml` publishes the same static files to GitHub Pages on pushes to `main`. A `.nojekyll` marker prevents Jekyll processing. Preset assets, scripts, styles, and fonts remain local/same-origin; GitHub Pages does not add application analytics or grant the core page network access.
