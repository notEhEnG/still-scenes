# Changelog

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
