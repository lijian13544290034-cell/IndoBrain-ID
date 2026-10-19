# AI Coach Phase 0.1 — Source Inventory

## Status

- Baseline: `af52eae64390f331fef4ab8ac432b0d268fee4a3`
- Intake date: 2026-10-19
- Three-party originals: **RECEIVED (16/16 files)**
- Independent SHA-256 verification: **PASS (0 mismatches)**
- Parsing: **COMPLETE for Phase 0.1 derivatives**
- Human review: **PENDING**
- Overall: **SOURCES_RECEIVED_NORMALIZATION_PENDING_HUMAN_REVIEW**

“Received”, “parsed” and “reviewed” are independent states. No artifact is considered approved merely because it was received or parsed.

## Provenance

The byte-identical handoff is preserved under `docs/ai-coach-phase0/handoff-v1/received/original/`. The complete 16-file inventory, byte counts, provider, artifact type and raw SHA-256 are in `docs/ai-coach-phase0/handoff-v1/data/handoff-manifest.json`.

| Provider | Files | Received | Parsed | Human-reviewed |
| --- | ---: | --- | --- | --- |
| Codex | 4 | Yes | Yes | Yes (historical Phase 0 documents) |
| WorkBuddy A | 4 | Yes | Yes | No |
| WorkBuddy B | 8 | Yes | Yes | No |

The file named `ai-coach-teaching-eval-v1.zip` is a tar archive despite its extension. It is preserved unchanged and is not used as a second source of truth; the separately handed-off files are hashed and parsed directly.

## Derived artifacts

- `skills-mapping.v1.json` / `SKILL_MAPPING_V1.md`: S01–S12 extraction with source lines and pending-review status.
- `teaching-test-cases.normalized.v1.json`: all 100 original IDs preserved with new schema fields.
- `rule-tis-skill-map.v1.json`: 127 assertion rules mapped provisionally to TIS/P0/Skills.
- `COURSE_REFERENCE_CONFLICTS_V1.md`: exact-source/day validation results.
- `teaching-test-case-intake.v1.json`: machine-readable intake summary.

## Remaining review gates

1. Confirm the prose-derived S01–S12 mapping.
2. Approve or amend the 127 rule-to-TIS/Skill mappings.
3. Resolve course-reference conflicts; substring matches are explicitly rejected.
4. Define the executable aggregation/pass rule for per-case assertions.
5. Keep P0-4 high-stakes judgment human-required unless a separately approved contract is supplied.
