# Still Scenes Privacy Model

## Studio promise

> By default, uploaded images remain in this browser session. The core Studio does not transmit them over the network.

This statement applies to the shipped core page at the current revision. The optional bring-your-own-endpoint feature is a separate, explicit processing path described below. It does not automatically apply to browser extensions, modified forks, hosting infrastructure, endpoint operators, or a user's operating system.

## Verified browser boundaries

The shipped core page uses:

- no analytics or trackers;
- no remote scripts, styles, fonts, images, or APIs;
- no `fetch`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon` path in its own CSP boundary;
- system font stacks only;
- a Content Security Policy with `connect-src 'none'`;
- same-origin preset images;
- local `File` decoding through `createImageBitmap` or a temporary object URL fallback;
- in-memory state only.

The Studio never asks for a location from EXIF, filename, or visual inference. A printable location exists only when the user types it or explicitly chooses a preset that contains it.

## Optional endpoint boundary

Bring-your-own-endpoint generation is off by default. The endpoint and API-key fields alone send nothing. A request occurs only after the user:

1. opens the optional section;
2. enters an HTTP/HTTPS endpoint;
3. checks the explicit transfer-consent box; and
4. presses **Generate through endpoint**.

The core page retains `connect-src 'none'`. The Generate action opens same-origin `network.html`, a narrowly scoped gateway page whose CSP permits HTTP/HTTPS connections. The gateway accepts only a same-origin message from its opener and makes the single requested call.

Exactly the following application data leaves the browser for the configured endpoint:

- the API key as a bearer authorization header, when supplied;
- the compiled production prompt, which may contain copy the user typed;
- the requested model, image size, and PNG output format;
- for routes that use a source photograph, a bounded PNG re-encoding of that image, sent as base64 JSON or a multipart file named `source.png`;
- normal connection metadata supplied by the browser and network, such as the user's IP address and an `Origin` header.

The original local filename, source SHA-256, provenance record, verification report, and unrelated Studio state are not sent. The request uses `credentials: 'omit'` and `referrerPolicy: 'no-referrer'`; it does not send Studio cookies or a referring page URL. The endpoint operator may still store or process received data under its own terms.

The endpoint URL, key, request, and returned image are kept only in current page/window memory. They are not written to `localStorage`, `sessionStorage`, IndexedDB, cookies, a service worker, console logs, provenance, or analytics. The **Clear key** button blanks the key field; refreshing or closing the page ends the session. The gateway accepts returned images only up to 25 MB and the Studio decodes them through the same bounded loader used for manual uploads.

Browser security still applies. Endpoints must permit the Studio origin through CORS. When the Studio is hosted over HTTPS, the browser blocks insecure HTTP endpoints as mixed content.

## Upload validation

User files are treated as untrusted. The loader:

1. accepts only declared JPEG, PNG, WebP, and browser-supported AVIF;
2. rejects zero-byte files and files above 25 MB;
3. checks file signatures instead of trusting extensions;
4. validates decoded width, height, and a 40-megapixel ceiling;
5. reports malformed or unsupported files without replacing the previous valid source;
6. releases replaced `ImageBitmap` and temporary object-URL resources.

The loader decodes pixels but does not parse EXIF or request GPS metadata.

## Preset isolation

Presets can legitimately carry demo-specific copy. The default document does not select a preset and contains no Pontian location, demo date, or demo caption.

When a user upload succeeds:

- preset ID and description are removed;
- untouched preset-owned location, date, and caption are cleared;
- manually edited fields survive;
- source provenance becomes `user-upload` and `userOwned: true`.

The quality strip fails the privacy gate if preset-owned copy is ever attached to a user upload.

## Persistence and export

The Studio has no database, local-storage, cookie, service-worker, or telemetry path. Refreshing the page ends the document session. Single and Collection workspace images remain in memory only. PNG and PDF export create browser blob URLs, trigger local downloads, and release the temporary URLs afterward.

Each export also writes a local JSON sidecar. PNG carries the same record in an iTXt chunk; PDF carries it in XMP metadata. Provenance schema v2 deliberately includes user-entered text locks, a whitelisted Scene Graph and Scene Delta signature, Mutation Budget values, layout/material decisions, source-boundary role/status, and a count-only Memory Evidence signature. Exact observed, remembered, uncertain, and forbidden evidence text is not embedded; only the ledger schema, influence policy, per-class counts, and `rawTextEmbedded: false` are stored. When a returned AI image is active, provenance also includes the generation-time contract and intelligence summary. It records source SHA-256 when known, prompt hashes, timestamps, and output geometry. It does **not** include raw source bytes, original filename, raw Memory Evidence text, full compiled prompt, hidden reasoning, EXIF, API key, endpoint URL, inferred location, or verification pixel samples. Users who consider their caption or declared scene descriptions sensitive should review the sidecar before sharing it. See [`PROVENANCE.md`](PROVENANCE.md).

Collection export additionally creates an explicitly requested `still-scenes/collection-manifest/v1` JSON file. Unlike the compact provenance sidecar, this authoring manifest includes each structured brief and full compiled prompt so the set can be reproduced. It allow-lists source metadata to SHA-256, MIME type, and dimensions, and excludes original filenames, raw source bytes, EXIF, API keys, endpoint URLs, and inferred locations. Because prompts can contain user-entered captions, locations, dates, scene descriptions, memories, uncertainties, and do-not-invent boundaries, users should review the collection manifest before sharing it.

## Repository photographs

The repository itself contains nine full-resolution source photographs taken by Bryan, the repository owner and author. Publishing or cloning the repository distributes those committed files independently of the Studio privacy model. Their provenance and hashes are documented in `demos/user-photo-styles/MANIFEST.csv`.

## Skill and external model boundary

Using the Still Scenes Skill with an image-generation or image-editing service is a separate processing path. Before sending a personal photo to such a service, use the runtime's disclosure and consent model. The Skill must include the real edit target when required, must not infer hidden location, and must state when inspection or deterministic typography is unavailable.

## GitHub Pages hosting

The Pages workflow publishes static same-origin HTML, CSS, JavaScript, and documented demo images. `.nojekyll` disables Jekyll processing. The application loads no remote fonts, third-party scripts, or analytics. Visiting any hosted site necessarily sends ordinary request metadata such as IP address and user agent to the host, but selecting or uploading a photograph does not send that photograph to GitHub Pages. Only the separate opt-in endpoint action transmits the fields listed above.
