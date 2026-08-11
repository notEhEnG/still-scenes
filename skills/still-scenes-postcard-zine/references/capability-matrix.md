# Capability-Aware Production

Read this before promising a generated, edited, inspected, typeset, or exported result.

## Capability record

Record each capability independently:

~~~yaml
capabilities:
  image_generation: available | unavailable | unknown
  image_editing: available | unavailable | unknown
  deterministic_text_composition: available | unavailable | unknown
  file_export: available | unavailable | unknown
  image_inspection: available | unavailable | unknown
  metadata_inspection: available | unavailable | unknown
~~~

Do not infer image editing from image generation. Do not infer deterministic text from image generation. Do not infer verification from successful tool completion.

## Required behavior by capability

### Image generation unavailable

Return Prompt-only output, the Scene Contract, recipe, locked-copy record, and limitations. Do not imply that an artifact exists.

### Image editing unavailable

For a required source-photo edit, do not reconstruct the image from prose. Ask the user to reattach it to a runtime that can include the actual image, or return a prompt and deterministic placement plan.

### Deterministic text unavailable

Generate a text-free artwork layer. Return exact strings and measurable placement specifications. Mark exact copy declared or warning, never verified. Keep long messages out of image-model text.

### File export unavailable

Return the generated artifact through the available interface and a target export specification. Do not claim a saved path or file.

### Image inspection unavailable

Do not claim identity, object count, exact copy, text legibility, watermark absence, or layout safety is verified. Mark those checks declared, warning, failed, or not-applicable as evidence permits.

### Metadata inspection unavailable

Do not claim that EXIF was removed or absent. Still prohibit location inference and print no location unless the user explicitly supplies it.

## Honest fallbacks

| Requested outcome | Missing capability | Fallback |
| --- | --- | --- |
| exact-caption artifact | deterministic text | text-free art + exact placement spec |
| source-preserving edit | image editing/reference attachment | request reattachment; do not reconstruct |
| verified identity | inspection | keep locks declared and disclose the missing comparison |
| duplex files | export | two resolved side specifications or visible artifacts, no file claim |
| press-ready output | CMYK/proofing/bleed validation | call it print-sized RGB |

## Browser Studio boundary

The core browser Studio is a deterministic local composer with an explicit opt-in endpoint gateway. It can compose, verify coarse returned-image signals, and export RGB PNG/PDF, but it cannot prove identity or count preservation, perform OCR verification, convert to CMYK, or certify press readiness.
