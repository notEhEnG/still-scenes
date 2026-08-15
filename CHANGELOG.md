# Changelog

## 3.2.0 — 2026-08-15

### Memory Authority

- Added a first-party Memory Evidence Ledger that keeps user-declared observations, remembered context, uncertainty, and forbidden invention in separate authority classes.
- Added an explicit influence policy: remembered context is caption-only by default and may shape visible artwork only after the user selects artwork-and-caption influence.
- Added exact cross-class conflict detection and a separate Memory Authority quality gate so ambiguity cannot silently become fact.

### Caption authorship and privacy

- Added a deterministic zero-fabrication caption ladder with literal, memory-note, and paired-fragment options assembled character-for-character from user evidence.
- Added caption claim audits with source entry IDs and explicit separation between wording traceability and real-world truth.
- Added MEMORY AUTHORITY to Prompt Compiler V3 and count-only compact provenance so private evidence text is not embedded in PNG/PDF provenance.

### Skill and tests

- Extended the canonical and compatibility Skills with the Memory Authority reference and upgraded their eval suites to 58 and 45 scenarios.
- Added unit coverage for authority classification, caption traceability, conflict failures, compiler boundaries, and provenance redaction.

## 3.1.0 — 2026-08-15

### Collection Studio

- Added an in-browser Collection workspace for 2–12 photographs with isolated item state, upload-order sequencing, accessible reordering, Collection DNA, and rendered-axis variation planning.
- Added per-item editing and PNG export, contact-sheet PNG export, and a complete collection manifest that excludes raw source bytes, EXIF, credentials, inferred locations, and original filenames.
- Added requested-versus-resolved collection recipes so Scene Contract and extreme-ratio crop overrides remain visible.

### Quality and testing

- Corrected primary-action and helper-text contrast, added a semantic page heading, and associated the dynamic canvas description with the canvas.
- Added unit coverage for collection state, recipe variation, manifest privacy, and contact-sheet geometry, plus Playwright browser coverage for the complete collection workflow and WCAG AA contrast.

## 3.0.0 — 2026-08-11

### Scene Intelligence

- Added a compact Scene Graph for nodes, relations, direction, depth, quiet fields, focal hierarchy, density, and evidence status.
- Added a qualitative Mutation Budget with explicit lock precedence and a distinct `scene-evidence` source role for source-free Distill.
- Added constraint-based layout solving, reasoned Material Logic, expected/observed Scene Delta records, and explainable art-direction records.
- Added current-request Memory Sequence, Collection DNA, meaningful variation, and three-axis similarity guarding without cross-session memory claims.

### Compiler, verification, and provenance

- Rebuilt the production compiler as Prompt Compiler V3 with source role, Scene Graph, Mutation Budget, layout, material, source-boundary, and Scene Delta sections.
- Migrated returned-image reports to `declared`, `verified`, `warning`, `failed`, and `not-applicable`, with identity, geometry, spatial, palette, count, text, source-boundary, layout, and export families reported independently.
- Extended portable provenance to schema v2 with whitelisted Scene Intelligence and Scene Delta signatures while continuing to exclude raw source bytes, full prompts, credentials, EXIF, and inferred location.

### Skill and tests

- Upgraded the canonical Skill and preserved legacy compatibility package to V3 reasoning, references, and status semantics.
- Expanded the canonical eval suite from 30 to 53 cases and added behavior tests for graphs, budgets, layout, materials, deltas, sequence, collections, similarity, and source boundaries.

## 2.1.0 — 2026-08-11

### Verification and generation

- Added dependency-free returned-image verification using dominant-palette distance, a 64-bit perceptual hash, and Scene Contract surface geometry.
- Added an optional bring-your-own-endpoint gateway with generic JSON and OpenAI Images-compatible adapters, explicit consent, in-memory credentials, and a separate network CSP.
- Kept the default Studio page fail-closed with `connect-src 'none'` and no telemetry.

### Presets, print, and provenance

- Wired all 34 documented artworks into the existing preset model, including all 27 U-series manifest rows.
- Added an RGB PDF 1.7 export with configurable 3 mm default bleed, trim/bleed boxes, and explicit no-CMYK/no-certification reporting.
- Added PNG iTXt and PDF XMP provenance, matching JSON sidecars, copyable records, and a local PNG provenance reader.

### Documentation and deployment

- Added a source → Scene Contract → result README hero using author-owned U11, U18, and U26 photography.
- Added a dependency-free GitHub Pages workflow and `.nojekyll` marker.
- Added the canonical lean `skills/still-scenes-postcard/` package while preserving the original skill package for compatibility and historical artifacts.

## 2.0.0 — 2026-08-10

### Studio correctness

- Added provenance and per-field copy ownership so user uploads cannot inherit untouched preset metadata.
- Removed Pontian, the demo date, and demo caption from initial custom state.
- Added route-compatible views and separate duplex front/back rendering and export.
- Replaced split-only brief, prompt, and alt text with route-aware compilers.
- Replaced unsafe interpolated YAML with machine-safe JSON.
- Made framed, film, specimen, halftone, and silhouette treatments observable.
- Made Distill source-free in the browser through procedural Scene-DNA and palette composition.

### Privacy and security

- Removed Google Fonts and all external runtime dependencies.
- Added a restrictive Content Security Policy and a verified local-session privacy statement.
- Added bounded MIME, signature, file-size, dimension, and pixel-count validation.
- Replaced upload data URLs with `createImageBitmap` or temporary object URLs and explicit resource release.
- Replaced dynamic `innerHTML` status updates with text APIs and added clipboard failure handling.

### Rendering and export

- Added requestAnimationFrame scheduling, an art/copy layer split, seeded cached texture, and deliberate texture regeneration.
- Added exact-copy wrapping, fitting, Unicode handling, overflow checks, and collision checks.
- Replaced `canvas.toDataURL()` with blob-based export.
- Added exact dimension, physical-size, PPI, and RGB limitation reporting.

### Skill and visual system

- Introduced the Still Scenes Scene Contract and preserve/reduce/hybrid/distill paths.
- Added scene-dependent reduction intelligence, reference grammar/residue, capability-aware fallbacks, six paper families, and purposeful accent logic.
- Retained high/medium/low and `$still-scenes-postcard-zine` as compatibility aliases.
- Expanded evals from 12 to 30 adversarial cases.

### Accessibility and testing

- Added keyboard-operable routes, upload, views, zoom, inspector tabs, focus trap, Escape handling, focus return, visible focus, canvas description, and live status.
- Added dependency-free Node tests for state, privacy, uploads, Scene Contracts, prompts, typography, routes, quality, export, and static network boundaries.

### Preserved history

- Retained `app.js` unchanged apart from a provenance banner. It is not loaded by the V2 page.
- No existing image, source photograph, demo, prompt record, or manifest entry was removed or rewritten.
