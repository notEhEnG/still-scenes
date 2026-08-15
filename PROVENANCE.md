# Still Scenes Portable Provenance

Still Scenes exports a small, versioned transformation record with every PNG or PDF. The same record is also downloaded as a human-readable JSON sidecar with the artwork's base filename.

This record is local, self-asserted metadata. It is useful for tracing how an artifact was composed, but it is not a cryptographic signature, trusted timestamp, authorship certificate, or proof that the pixels have not subsequently changed.

## Collection exports

Collection contact sheets embed a compact `still-scenes/collection-provenance/v1` record containing the collection name, item count, order policy, and SHA-256 of the separately downloaded manifest. The full `still-scenes/collection-manifest/v1` file contains Collection DNA, Memory Sequence, variation guards, ordered item briefs, full compiled prompts, resolved recipes, quality status, allow-listed source facts, artifact geometry, and each item's ordinary provenance record.

The collection manifest never includes original filenames, raw source bytes, EXIF, API keys, endpoint URLs, or inferred locations. It does include user-entered copy and full prompts by design, so it should be reviewed before sharing.

## Schema

The current schema identifier is `still-scenes/provenance/v2`:

~~~json
{
  "schema": "still-scenes/provenance/v2",
  "createdAt": "2026-08-11T00:00:00.000Z",
  "generator": "Still Scenes Studio",
  "source": {
    "sha256": "64 lowercase hexadecimal characters, or null"
  },
  "sceneContract": {
    "anchor": "user-declared scene anchor",
    "transformationPath": "preserve | reduce | hybrid | distill",
    "identityLocks": [],
    "geometryLocks": [],
    "spatialLocks": [],
    "paletteLocks": [],
    "countLocks": [],
    "textLocks": [],
    "memoryEvidence": {
      "schema": "still-scenes/memory-evidence/v1",
      "influence": "caption-only | art-and-caption",
      "counts": {
        "observed": 0,
        "remembered": 0,
        "uncertain": 0,
        "forbidden": 0
      },
      "rawTextEmbedded": false
    },
    "surface": {
      "route": "split | front | back | duplex | zine",
      "aspectRatio": "3:2",
      "width": 1536,
      "height": 1024
    }
  },
  "sceneIntelligence": {
    "sceneGraph": {
      "nodes": [],
      "relations": [],
      "directions": {},
      "quietFields": []
    },
    "mutationBudget": {},
    "layoutPlan": {},
    "materialLogic": {},
    "distillationPlan": {
      "evidenceStatus": "declared",
      "observation": [],
      "residue": [],
      "relation": [],
      "tension": [],
      "form": [],
      "opening": [],
      "sourceRaster": "prohibited"
    },
    "sourceBoundary": {
      "role": "scene-anchor | scene-evidence | reference-grammar | supporting-fragment | generated-scene | none",
      "status": "declared"
    },
    "sceneDelta": {
      "retained": [],
      "simplified": [],
      "transformed": [],
      "removed": [],
      "added": [],
      "unexpected": [],
      "unexpectedChanges": [],
      "lockVerification": {}
    }
  },
  "compiledPrompt": {
    "sha256": "64 lowercase hexadecimal characters"
  },
  "artifact": {
    "format": "png | pdf",
    "route": "front",
    "width": 1536,
    "height": 1024,
    "bleedMm": 0,
    "colorSpace": "RGB"
  },
  "generation": {
    "completedAt": "2026-08-11T00:00:00.000Z",
    "sceneContract": {
      "anchor": "generation-time scene anchor",
      "transformationPath": "preserve",
      "identityLocks": [],
      "geometryLocks": [],
      "spatialLocks": [],
      "paletteLocks": [],
      "countLocks": [],
      "textLocks": [],
      "surface": {
        "route": "front",
        "aspectRatio": "3:2",
        "width": 1536,
        "height": 1024
      }
    },
    "compiledPrompt": {
      "sha256": "hash of the prompt sent for the returned AI image"
    }
  }
}
~~~

`createdAt` is the browser's local UTC timestamp. It has no external timestamp authority. The source hash is present only when the Studio can calculate or obtain it. The full production prompt is never embedded; only its SHA-256 digest is recorded. Memory Evidence uses the same privacy principle: the compact record stores schema, influence, counts, and a false raw-text flag, never the exact observed, remembered, uncertain, or forbidden lines.

`sceneContract`, `sceneIntelligence`, and `compiledPrompt` describe the current exported composition. Scene Intelligence is allow-listed to compact graph declarations, Mutation Budget values, layout/material decisions, source-boundary role/status, and the Scene Delta signature. The optional `generation` object appears only when a returned AI image is active; it preserves the generation-time contract, intelligence record, and prompt hash even if the user later changes local paper, layout, or locked copy.

## File containers

- **PNG:** uncompressed UTF-8 JSON in an `iTXt` chunk whose keyword is `still-scenes:provenance`.
- **PDF:** the JSON record inside an XMP `/Metadata` stream using the `https://still-scenes.local/provenance/2.0/` namespace.
- **Sidecar:** pretty-printed UTF-8 JSON at `<artwork-base-name>.json`.

The PNG chunk writer and reader are implemented in `src/provenance.js` and `src/provenance-reader.js` without external libraries. The PDF writer uses the same record so its embedded and sidecar histories agree.

## Reading an exported PNG

Serve the repository and open `provenance.html`, then select an exported PNG. Parsing happens in the browser; the reader page has `connect-src 'none'` and does not upload the file.

For programmatic use, import the read-only helper:

~~~js
import { extractPngProvenance } from './src/provenance-reader.js';

const record = await extractPngProvenance(file);
console.log(record);
~~~

`tests/provenance.test.js` demonstrates the complete PNG embed → re-read → exact-record round trip.

## Privacy boundary

The schema uses an explicit allow list. It does not include:

- raw uploaded image bytes or a base64 image;
- the original local filename;
- the full compiled prompt;
- exact Memory Evidence wording;
- EXIF or inferred GPS/location data;
- endpoint URLs, API keys, response headers, or model-service logs;
- the returned-image verification raster or raw pixel samples.

The Scene Delta may contain user-declared descriptions of retained or changed scene elements. It does not embed hidden reasoning, raw inspection imagery, or unbounded model output.

Scene Contract text locks may include a caption, date, location, or message that the user explicitly entered. Those values are part of the portable record by design. Review the JSON sidecar before sharing an export if that copy is sensitive. See [`PRIVACY.md`](PRIVACY.md) for the complete browser and optional-endpoint boundary.

## Integrity limitations

An editor can remove or replace embedded metadata, and a JSON sidecar can be separated from its artifact. Still Scenes currently does not sign the record or hash the final encoded artifact inside itself. Consumers should treat the record as useful workflow evidence, not independent authentication.
