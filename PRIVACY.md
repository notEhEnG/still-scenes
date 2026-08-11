# Still Scenes Privacy Model

## Studio promise

> Uploaded images remain in this browser session. The Studio does not transmit them over the network.

This statement applies to the shipped browser Studio at the current revision. It does not automatically apply to separate AI-generation tools, browser extensions, modified forks, hosting infrastructure, or a user's operating system.

## Verified browser boundaries

The shipped page uses:

- no analytics or trackers;
- no remote scripts, styles, fonts, images, or APIs;
- no `fetch`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon` path;
- system font stacks only;
- a Content Security Policy with `connect-src 'none'`;
- same-origin preset images;
- local `File` decoding through `createImageBitmap` or a temporary object URL fallback;
- in-memory state only.

The Studio never asks for a location from EXIF, filename, or visual inference. A printable location exists only when the user types it or explicitly chooses a preset that contains it.

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

The Studio has no database, local-storage, cookie, service-worker, or telemetry path. Refreshing the page ends the document session. PNG export creates a browser blob URL, triggers a local download, and releases the temporary URL afterward.

## Repository photographs

The repository itself contains nine full-resolution source photographs taken by Bryan, the repository owner and author. Publishing or cloning the repository distributes those committed files independently of the Studio privacy model. Their provenance and hashes are documented in `demos/user-photo-styles/MANIFEST.csv`.

## Skill and external model boundary

Using the Still Scenes Skill with an image-generation or image-editing service is a separate processing path. Before sending a personal photo to such a service, use the runtime's disclosure and consent model. The Skill must include the real edit target when required, must not infer hidden location, and must state when inspection or deterministic typography is unavailable.
