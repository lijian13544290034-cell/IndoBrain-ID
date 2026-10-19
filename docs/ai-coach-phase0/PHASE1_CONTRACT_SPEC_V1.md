# AI Coach Phase 1 — Minimum Contract Specification

Phase 1 is not approved or implemented. This document records the smallest proposed compatibility work.

## 1. `/api/chat` compatibility

Proven current mismatch:

- Producer returns `{ configured, message, database }`.
- `ChatWorkspace` reads `data.assistant_message`.

Proposal:

1. Define a shared `ChatApiResponseV1` contract.
2. Use `assistant_message` as the canonical semantic field.
3. For one compatibility window, the server returns both `assistant_message` and deprecated alias `message` with identical content.
4. Consumers read `assistant_message ?? message` during the window.
5. Empty/malformed success bodies become a visible localized retry error, never an empty turn.
6. Remove `message` only after all supported consumers and fixtures are migrated.

Required tests cover canonical, compatibility alias, malformed 200, 400/401/403/429/500 and network failure.

## 2. Mastery compatibility

- Public progression: `practiced | independent | mastered` (plus not-started state where needed).
- Existing numeric `mastery_level` remains readable through a versioned legacy adapter and is never rewritten on read.
- Legacy completion is historical practice evidence, not proof of independence/mastery.
- Guided repetition, recognition, course completion or one STT transcript can produce at most `practiced`.
- `independent` requires valid unaided evidence; `mastered` requires repeated delayed/varied independent evidence.
- Existing five dimensions remain evidence detail; overall status is derived by a versioned policy.

## 3. `NO_EVIDENCE`

Microphone denial, invalid/empty audio, empty STT, timeout, provider error, rate limit, malformed model output after bounded repair, and TTS failure are technical outcomes. They emit `NO_EVIDENCE`, do not change learning counters, and do not trigger harsher correction. STT provides intelligibility-related evidence only, never phoneme or tone accuracy.

## 4. Minimum Phase 1 scope

- Shared response, direction, evidence and mastery contracts.
- One Skill registry/orchestrator for approved S02/S03/S04/S05/S07/S08 policies; no per-Skill model call.
- Compatibility adapters in `/api/chat`, `ChatWorkspace`, current Mandarin coach routes/components and review/mastery readers.
- Contract, direction, NO_EVIDENCE, legacy compatibility and transition tests.

## 5. Go gates

1. Human approval of S01–S12 mapping and the 127 rule mappings.
2. An approved assertion aggregation/pass contract.
3. Resolution of content-reference conflicts used by course assertions.
4. One STT success cannot become independent/mastered.
5. Technical failure cannot alter mastery.
6. Level 2 and C1/C2 server authorization remain unchanged.

Until these gates are approved, Phase 1 remains **NO-GO**.
