# AI Coach Phase 1 — Minimum Contract Specification

Phase 1 is not approved for implementation. This document defines the smallest proposed change set and gates.

## 1. `/api/chat` compatibility

Proven baseline behavior:

- Producer: `{ configured, message, database }`
- Consumer: reads `data.assistant_message`

Proposal:

1. Define `ChatApiResponseV1` with canonical success field `message`.
2. Server continues returning `message`.
3. Client uses `message`; for one compatibility release it may read `message ?? assistant_message`.
4. Log/telemetry counts legacy-field consumption without logging message contents.
5. Remove the compatibility read only after no supported response uses the legacy field.

Required tests:

- A 200 response renders a non-empty assistant message.
- Canonical and legacy compatibility fixtures both render during the compatibility window.
- Empty/malformed success responses fail visibly rather than adding an empty turn.
- 400/401/403/429/500/network failures show localized retry guidance.

## 2. Mastery compatibility

No automatic data migration is proposed in Phase 1.

- Keep existing `mastery_level` fields readable and writable only through the legacy adapter required by current UI.
- Treat legacy levels as historical practice/review hints, never authoritative proof of `independent` or `mastered`.
- New normalized status: `not_started | practiced | independent | mastered`.
- One guided repetition, one recognition answer, one STT transcript or course completion can produce at most `practiced`.
- `independent` requires a valid unaided recall/listening/application/transfer success.
- `mastered` requires repeated independent evidence across occasions, including delayed and varied transfer evidence.
- The five dimensions remain the evidence detail model; overall status is derived by a versioned policy.
- Existing local records are not deleted, claimed by another account or rewritten on read.

## 3. `NO_EVIDENCE`

The following are technical outcomes, not learner failures:

- microphone denied or unavailable
- unsupported/empty/too-large audio
- empty STT transcript
- network timeout/failure
- provider error or rate-limit response
- malformed structured model output after bounded repair
- TTS generation/playback failure

They must:

- emit `NO_EVIDENCE`
- leave success/failure/mastery counters unchanged
- not trigger harsher pedagogical correction
- present a localized retry, text alternative or skip action
- remain observable as reliability metrics separate from learning metrics

STT can support intelligibility evidence only. It cannot assert phoneme or tone accuracy. Acoustic claims require a separately validated acoustic assessor.

## 4. Minimum Phase 1 file list

New contract-only modules:

- `lib/teaching-engine/contracts.ts`
- `lib/teaching-engine/direction-policy.ts`
- `lib/teaching-engine/evidence-policy.ts`
- `lib/teaching-engine/mastery-policy.ts`
- `lib/teaching-engine/response-schema.ts`

Minimal adapters:

- `app/api/chat/route.ts`
- `components/ChatWorkspace.tsx`
- `lib/mandarin-ai-coach.ts`
- `lib/mandarin-coach-personalization.ts`
- `lib/mandarin-coach-review.ts`
- `lib/server/mandarin-ai-coach.ts`
- `app/api/mandarin-coach/conversation/route.ts`
- `components/MandarinAiCoachExperience.tsx`

Test preparation:

- shared response contract tests
- direction matrix tests
- evidence/mastery transition tests
- legacy compatibility tests
- technical-failure tests

## 5. Acceptance gates

1. ZH_TO_ID and ID_TO_ZH direction matrices pass without shared progress/content keys.
2. `/api/chat` renders the canonical field end to end and handles legacy fixtures temporarily.
3. A single STT PASS never produces `independent` or `mastered`.
4. Technical failures emit `NO_EVIDENCE` and do not alter learning counters.
5. Guided imitation, recognition and course completion cannot produce mastered.
6. Level 2 and C1/C2 content authorization remains server-side and unchanged.
7. Existing automated suites remain green.
8. Real audio and TIS results remain `NOT VERIFIED` until human/device evaluation occurs.

## 6. Risks

- Legacy UI may still display numeric mastery; an adapter must avoid contradictory labels during transition.
- Compatibility aliases can become permanent unless removal criteria are explicit.
- Per-process limits are not distributed and must not be represented as a global quota guarantee.
- Missing WorkBuddy source semantics can invalidate provisional Skill mapping.
- Real microphone/STT/TTS behavior cannot be certified by static fixtures.
