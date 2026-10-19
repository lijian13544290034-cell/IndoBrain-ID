# AI Coach Phase 0.1 — Test Case Normalization

## Result

- Original corpus: received and preserved, SHA-256 `4e909e473d0f6ad6df8a14852fa0e49a707f1fbdf78ae65394ceb2d9a9eb0a2e`
- Original cases: 100
- Normalized cases: 100
- Original IDs preserved: 100 unique IDs
- Status: `NORMALIZED_PENDING_HUMAN_REVIEW`

The normalized derivative is `teaching-test-cases.normalized.v1.json`; the source remains byte-identical. `SCHEMA_FIELD_MAPPING_V1.md` documents every old/new field.

## Classification

Classification uses explicit deterministic signals and remains pending human review:

- `VOICE_RELIABILITY`: voice input, ASR failure behavior, or ASR/TTS/fallback assertion.
- `COURSE_CONTENT`: linguistic/course correctness assertion such as exact form, pinyin, semantic gap, word order or tone.
- `TEACHING_STRATEGY`: primary concern is teaching action, interaction strategy, recovery or progression.

Counts are generated from the derivative and are not forced to match an earlier planning ratio.

## Course-reference verification

Only a full normalized target expression found in the specifically referenced source/day counts as exact. The verifier rejects arbitrary substrings. It distinguishes:

- exact target in referenced Day;
- target/reference conflict;
- learning-direction mismatch;
- technical code reference that does not prove course-content existence.

All conflicts are listed in `COURSE_REFERENCE_CONFLICTS_V1.md` and remain unresolved rather than silently substituted.

## Evaluation boundary

- Deterministic format/count/exact-field checks may be machine assertions.
- Semantics, pedagogy, pragmatics and safety meaning are `HUMAN_REQUIRED` unless a separately approved judge exists.
- Hybrid rules expose a measurable surface but still require human judgment of quality.
- P0-4 high-stakes misjudgment remains contextual and human-required.
- No assertion result or TIS result is fabricated in Phase 0.1.
