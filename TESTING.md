# Testing Still Scenes

## Automated suite

Still Scenes uses Node's built-in test runner and has no test dependencies.

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
- CSP, remote-dependency absence, and the V2 module entry point.

## Skill validation

~~~bash
python3 -B /path/to/skill-creator/scripts/quick_validate.py skills/still-scenes-postcard-zine
~~~

The V2 eval file contains 30 cases, including oversized or disguised files, Unicode copy, extreme crop conflict, private filenames, copyrighted reference residue, products, portraits, source-free distillation, capability loss, hybrid work, and foliage reduction.

## Static checks

~~~bash
node --check src/main.js
node -e "const e=require('./skills/still-scenes-postcard-zine/evals/evals.json'); if(e.evals.length !== 30) process.exit(1)"
~~~

Search the shipped runtime for external or transmitting code:

~~~bash
rg -n "https?://|fetch\(|XMLHttpRequest|WebSocket|sendBeacon" index.html styles.css src
~~~

Documentation links are expected to contain `https://`; the shipped HTML, CSS, and `src/` runtime should not.

## Manual browser review

Serve the repository with `python3 -m http.server 8000`, then verify:

1. custom mode opens with blank location, date, and caption;
2. each preset fully initializes its recipe;
3. editing one preset field and uploading a custom image preserves only the edited field;
4. invalid, oversized, and renamed files show an error while the previous image remains;
5. every route shows only compatible views;
6. all five photo treatments are visibly distinct;
7. Distill contains no recognizable source pixels;
8. long, multiline, emoji, and CJK copy either fits or produces a warning without rewritten text;
9. Fit and 100% zoom work with keyboard focus;
10. the modal traps focus, closes on Escape, and returns focus;
11. duplex exports separate same-size front and back PNGs;
12. browser network inspection shows no third-party request.
