# Still Scenes Scene Contract

Use this reference for every route. The Scene Contract states what remains authoritative, what may change, and what counts as failure.

## Contract schema

~~~yaml
scene_contract:
  anchor:
  scene_dna: []
  identity_locks: []
  geometry_locks: []
  spatial_locks: []
  palette_locks: []
  count_locks: []
  text_locks: []
  allowed_mutations: []
  forbidden_mutations: []
  transformation_path: preserve | reduce | hybrid | distill
  reduction_level: none | restrained | simplified | distilled
  source_role: scene-anchor | scene-evidence | reference-grammar | supporting-fragment | generated-scene | none
  privacy_constraints: []
  memory_evidence:
    schema: still-scenes/memory-evidence/v1
    influence: caption-only | art-and-caption
    entries: []
    policy: {}
  memory_evidence_validation:
    valid:
    conflicts: []
~~~

Use `scene-evidence` for a user's source photograph when Scene DNA, palette, gesture, depth, or relation may inform a Distill result but recognizable source raster is prohibited. Keep it distinct from external `reference-grammar`. Build the qualitative Mutation Budget from `scene-intelligence.md`; locks always override permission.

Classify recollection and ambiguity through `memory-authority.md`. Default remembered context to caption-only influence, keep uncertain details ambiguous, and append every forbidden entry to hard failures. An exact cross-class conflict makes the contract invalid until the user resolves it.

## Field meanings

### Anchor

Name the one scene, subject, object, relation, or photograph that organizes the artifact. Do not substitute a more fashionable subject.

### Scene DNA

Record the smallest observable relationships that make this scene recognizable. Prefer spatial facts over adjectives.

Examples:

- crescent moon slightly left of center;
- branches entering mainly from upper-right and lower-right;
- large uninterrupted cobalt sky field;
- orange cloud rising from a dark lower cloud mass;
- person facing away toward the shoreline.

### Identity locks

Record traits that must not change for people, pets, artworks, products, and keepsakes: facial structure, markings, pose, garment anchors, authorship marks that the user wants retained, or other defining identity.

### Geometry and count locks

Record silhouette, proportions, construction, object count, component count, and shape. Product geometry outranks style. Never hide a changed component behind texture.

### Spatial locks

Record relative position, direction, horizon, gaze, overlap, scale relation, and foreground/middle/background structure.

### Palette locks

Record source colors that must remain recognizable. A palette lock does not prohibit restrained reproduction changes unless it says so.

### Text locks

Record exact strings with casing, punctuation, Unicode, and required line breaks. Never rewrite locked wording to make it fit.

### Allowed and forbidden mutations

Make permissions and failures explicit. Do not use “stylize freely.” Examples of allowed changes include crop within stated bounds, surrounding paper, secondary-detail reduction, one source-derived accent, or deterministic typography. Examples of forbidden changes include an altered face, extra moon, missing bird, changed product construction, invented location, or copied reference wording.

## Transformation paths

### Preserve

Use the actual source photograph. Do not redraw defining subjects. Permit only declared crop, margin, paper, framing, typography, restrained overlays, or print treatment.

### Reduce

Keep source photography recognizable while merging secondary visual noise. Preserve Scene DNA before surface detail.

Reduction maps:

- Dense foliage: retain canopy direction and one to three branch gestures; merge leaves into two to five masses; remove about 80–95% of micro-detail when simplified.
- Clouds: retain silhouette, light direction, and warm/cool relation; merge small fragments.
- Cities: retain skyline or horizon and one to three structural rhythms; remove repetitive windows and street clutter.
- People: preserve identity according to the contract; simplify the environment first.
- Products: preserve construction, count, silhouette, and proportions before applying style.
- Landscapes: preserve horizon, dominant path, depth layers, and major color fields.

### Hybrid

Keep one real photographic anchor or fragment. Extend only source-derived geometry with paper, ink, line, halftone, simplified shape, or color field. Make the boundary intentional.

### Distill

Include no recognizable source-photo raster. Use only Scene DNA, palette evidence, dominant gesture, relation, semantic subject, and emotional temperature. A crop of the source photograph is not distillation.

## Compatibility aliases

Accept old preservation values without making them the core model:

| Legacy value | Scene Contract mapping | Default path |
| --- | --- | --- |
| high | strong identity, geometry, count, and spatial locks | preserve |
| medium | strong Scene DNA; flexible crop, material, and secondary detail | reduce |
| low | reference grammar or a declared relation only | distill |

## Contract examples

### Identifiable portrait

Lock face shape, defining marks, pose, gaze, clothing anchor, and body proportion. Permit surrounding paper and background reduction. Forbid face drift, changed gaze, changed garment color when color is defining, and silhouette treatment unless explicitly approved.

### Product

Lock component count, physical construction, silhouette, proportion, labels that must remain, and recognizably accurate color. Permit background and paper changes. Forbid invented buttons, missing ports, changed seams, or impossible geometry.

### Distilled moon scene

Lock a small crescent, its orientation, approximate visual region, cobalt field, and edge-framing branch gesture. Permit source-free paper shapes and ink. Forbid source raster, stars not present, additional moons, or a changed phase.

## Verification language

Use these states:

- **Declared:** the contract records a requirement, but output fidelity has not been measured.
- **Verified:** an available deterministic or inspection process measured the requirement.
- **Warning:** evidence is incomplete or a soft issue remains.
- **Failed:** a measured hard requirement is violated.
- **Not applicable:** the requirement does not apply to this route.

Never call identity, preservation, or semantic fidelity verified merely because the brief declares a high lock.
