# Testing Still Scenes

## Automated suite

Still Scenes uses Node's built-in test runner for deterministic modules. The production Studio has no runtime dependencies.

~~~bash
npm test
~~~

The suite covers:

- route-to-view compatibility and normalization;
- initial blank custom state and removal of the Pontian default;
- preset copy clearing on successful custom upload;
- preservation of user-edited copy;
- source provenance classification;
- legacy preservation-to-Scene-Contract mapping;
- Scene Graph nodes, relations, direction, horizon, density, quiet fields, and validation;
- scene-evidence versus reference-grammar source boundaries;
- Mutation Budget lock precedence and material-conflict fallback;
- constraint-based layout response to edge anchors, gaze, horizon, scene density, and long copy;
- expected-versus-observed Scene Delta status semantics, including measured divergence becoming explicit unexpected entries;
- six-stage source-free Distill planning without invented tension;
- extreme source/output ratios choosing a non-destructive fit-with-border strategy;
- Memory Sequence order/pacing and deterministic auto-editing, Collection DNA scope and deliberate breaks, and three-axis similarity guarding;
- collection state isolation, accessible reordering, rendered-axis recipe differences, manifest privacy allow-listing, and contact-sheet geometry;
- source-free distill failures;
- scene-dependent reduction rules;
- route-specific prompt compilation;
- safe JSON for quotes, newlines, CJK, and emoji;
- route- and orientation-aware alt text;
- multiline, CJK, emoji, overflow, and collision typography behavior;
- MIME, zero-byte, file-size, magic-byte, and decoded-pixel rejection;
- A6 dimensions, physical size, PPI, and duplex matching;
- safe export filenames;
- truthful declared-versus-verified quality status;
- returned-image palette distance, perceptual-hash structure, surface-ratio failure cases, and independent lock-family status vocabulary;
- generation-adapter request/response contracts using mocked `fetch` only;
- all 34 built-in presets and U-series manifest row parity;
- all 34 canonical portable-skill assets matching the repository galleries byte-for-byte;
- dependency-free PDF page, 3 mm bleed, RGB, trim-box, and XMP output;
- PNG provenance embed/read round trips and schema privacy allow-listing;
- CSP separation, remote-dependency absence, and the V3 module entry point.

## Browser acceptance suite

Playwright is a development-only dependency. Install it and its Chromium test browser, then run:

~~~bash
npm install
npx playwright install chromium
npm run test:browser
~~~

The browser suite uploads multiple local photographs, preserves and changes collection order, runs deterministic planning, exports and inspects the collection manifest, exercises contact-sheet downloads, rejects filename and credential leakage, confirms the core page makes only same-origin requests, and measures WCAG AA contrast for primary actions and helper text.

## Skill validation

~~~bash
python3 -B /path/to/skill-creator/scripts/quick_validate.py skills/still-scenes-postcard
~~~

The canonical V3 eval file contains 58 cases. It adds Memory Authority, zero-fabrication caption traceability, authority conflicts, Scene Graph, scene-evidence, Mutation Budget, layout, material, Scene Delta, sequence, Collection DNA, similarity, source-boundary, and independent verification cases while retaining hostile uploads, Unicode copy, privacy, products, portraits, capability loss, hybrid work, and reduction. Only three cases form the explicit legacy-alias group. The preserved legacy package carries a smaller 45-case compatibility suite.

## Static checks

~~~bash
node --check src/main.js
node -e "const e=require('./skills/still-scenes-postcard/evals/evals.json'); if(e.version !== 3 || e.evals.length !== 58) process.exit(1)"
~~~

Confirm that the core page keeps its fail-closed CSP and does not directly transmit data:

~~~bash
rg -n "connect-src 'none'" index.html provenance.html
rg -n "fetch\(|XMLHttpRequest|WebSocket|sendBeacon" src/main.js src/render src/state.js src/image-loader.js
~~~

The second command should return no transmitting API call. `network.html`, `src/network-gateway.js`, `src/generate.js`, and `src/adapters/` are the intentionally network-capable opt-in boundary and are covered by adapter tests with mocked `fetch`; automated tests never contact a real endpoint.

## Manual browser review

Serve the repository with `python3 -m http.server 8000`, then verify:

1. custom mode opens with blank location, date, and caption;
2. the selector contains all 34 documented presets, including all 27 U-series manifest rows, and each one fully initializes its recipe;
3. editing one preset field and uploading a custom image preserves only the edited field;
4. invalid, oversized, and renamed files show an error while the previous image remains;
5. every route shows only compatible views;
6. all five photo treatments are visibly distinct;
7. built-in procedural Distill contains no source-photo raster, while a returned Distill image remains declared rather than falsely verified;
8. long, multiline, emoji, and CJK copy either fits or produces a warning without rewritten text;
9. Fit and 100% zoom work with keyboard focus;
10. the modal traps focus, closes on Escape, and returns focus;
11. duplex exports separate same-size front and back PNGs;
12. loading a returned image runs palette, dHash, and geometry checks and a deliberately shifted/wrong-ratio image does not silently pass;
13. PNG export contains an extractable provenance record and downloads the matching JSON sidecar; `provenance.html` reads the record locally;
14. PDF export adds the configured bleed, reports RGB limitations, and downloads the matching JSON sidecar;
15. browser network inspection shows no third-party request during default composition, preview, verification, or export;
16. entering endpoint details without consent sends nothing;
17. explicit generation opens the separate gateway and sends only the fields documented in `PRIVACY.md`;
18. at 1440 px and narrow mobile widths, header controls remain reachable and the artwork/sidebar remain usable.
19. changing focal position, gaze, horizon, density, or quiet field changes the art-direction layout record and the relevant browser render allocation;
20. Distill with a loaded photo reports `scene-evidence`, prohibits recognizable source raster, and never substitutes `reference-grammar`;
21. returned-image lock families use only `declared`, `verified`, `warning`, `failed`, or `not-applicable`, with identity/count/text never inferred from palette, dHash, or ratio;
22. the Art Direction tab explains declared inputs, layout/material decisions, source boundary, and Scene Delta without claiming hidden reasoning or unobserved pixels.
23. Collection mode accepts 2–12 valid photographs, preserves valid items when another file fails, and keeps each item's copy and Scene Contract state isolated;
24. reorder controls work by keyboard, planning records a quiet close and at least three rendered-axis differences, and only Front, Split, and Zine surfaces remain available;
25. collection contact-sheet and JSON exports preserve visible order while excluding source filenames, raw source bytes, EXIF, credentials, and inferred locations.
26. Memory Evidence keeps observed, remembered, uncertain, and forbidden entries distinct; an exact cross-class conflict fails the authority gate.
27. caption-ladder buttons reuse evidence character-for-character, retain line breaks, and report wording traceability without claiming historical truth.
28. compact PNG/PDF provenance contains Memory Evidence counts and influence but none of the raw remembered, uncertain, or forbidden wording.
