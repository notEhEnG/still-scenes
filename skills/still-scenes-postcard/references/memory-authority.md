# Memory Authority and Evidence-Bound Captions

Use this reference whenever a request contains recollection, uncertainty, missing context, damaged or ambiguous source evidence, assisted captions, or an explicit prohibition against invention.

## Governing rule

Treat visual evidence, user memory, uncertainty, and prohibition as different authority classes. Never smooth them into one confident scene description.

~~~yaml
memory_evidence:
  schema: still-scenes/memory-evidence/v1
  influence: caption-only | art-and-caption
  entries:
    - id:
      kind: observed | remembered | uncertain | forbidden
      authority:
      text:
  policy:
    observed:
    remembered:
    uncertain:
    forbidden:
~~~

## Authority classes

- **Observed:** a fact the user declares visible or a capable inspection actually observes. Record which source applies. A user declaration remains declared rather than visually verified.
- **Remembered:** context supplied from the user's memory. Use it in captions by default. Add it to visible artwork only when the user explicitly chooses `art-and-caption`.
- **Uncertain:** a possibility that must remain ambiguous. Never turn it into a depicted object, event, place, emotion, or declarative caption.
- **Forbidden:** a hard negative fact or boundary. Do not depict, imply, name, or use it as decorative inspiration.

If the same wording appears in multiple classes, stop compilation and ask the user to resolve that exact conflict. Do not pick the most convenient class.

## Zero-fabrication caption ladder

When the user asks for evidence-bound captions, offer up to three choices assembled character-for-character from their entries:

1. **Literal:** one observed entry.
2. **Memory note:** one remembered entry.
3. **Paired fragment:** one observed entry, a line break, then one remembered entry.

Locked location and date may form an archival option. Do not add connective prose, mood, biography, weather, relationship, or place. Record the source entry IDs behind each option. If there is insufficient evidence, ask for one concrete observation or recollection instead of inventing filler.

An exact match proves wording traceability only. It does not prove the real-world truth of the memory or observation. A user-authored caption that does not match the ledger remains locked and declared; never claim that its facts were verified.

## Prompt boundary

Compile a MEMORY AUTHORITY section immediately after SCENE CONTRACT. State:

- observed declarations that may shape the artifact;
- remembered context and its selected influence;
- uncertain details that must remain ambiguous;
- forbidden details as hard failures;
- the distinction between user declaration and visual verification.

Keep the same boundary in the Scene Delta and art-direction record. A generated result cannot upgrade remembered context into observed evidence.

## Privacy and provenance

Treat recollections and uncertainty as potentially sensitive. A reproducible authoring brief may contain their exact wording, but compact embedded provenance should store only the ledger schema, influence policy, per-class counts, and `rawTextEmbedded: false`. The production-prompt hash may commit to the complete prompt without exposing it.

Warn before sharing any full collection manifest because its reproducibility record can include the complete brief and prompt.

## Quality gate

Report Memory Authority independently:

- **Verified:** a selected caption matches a deterministic ledger option character-for-character.
- **Declared:** authority classes are recorded, or a custom caption remains unmapped.
- **Warning:** available evidence is incomplete for the requested claim.
- **Failed:** the same exact detail has conflicting classes, a forbidden detail entered the artifact, or an uncertain detail became an asserted fact.
- **Not applicable:** no memory evidence or caption claim is active.

Never use `verified` to claim that a recollection is historically true.
