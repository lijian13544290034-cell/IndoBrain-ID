# AI Coach Teaching Intelligence V1 — Phase 1A Report

## Scope and status

Phase 1A defines an unconnected, deterministic Teaching Engine contract. It does not alter the current AI Coach, UI, prompts, courses, persistence, authorization, Supabase or deployment behavior.

Core Skills: `S02`, `S03`, `S04`, `S05`, `S07`, `S08`. Every registry entry has `runtimeEnabled: false`.

## Minimal file changes

- `lib/teaching-engine/contracts.ts`: shared stages, evidence, mastery and Skill contracts.
- `lib/teaching-engine/state-machine.ts`: pure transition table.
- `lib/teaching-engine/evidence-validator.ts`: `NO_EVIDENCE`, independent-evidence and course-assertion gates.
- `lib/teaching-engine/mastery-policy.ts`: legacy-compatible, evidence-derived mastery projection.
- `lib/teaching-engine/skill-registry.ts`: six static Skill definitions and deterministic policies.
- `scripts/verify-teaching-engine-phase1a.mjs`: pure-function and static contract tests.

## State machine

`DIAGNOSE → MODEL → SPEAK → EVALUATE → HINT / RETRY / ADVANCE → TRANSFER_TEST → COMPLETE`

- Invalid transitions return `null`.
- Learner errors can select `HINT`/retry and are explicitly marked as learner-failure evidence.
- Technical failure never records learner failure. It stays at the speaking/transfer boundary or uses a technical retry.
- The engine contains no UI or network side effects.

## Core Skill rules

### S02 Micro Speaking

- One approved target expression and one clear production task per turn.
- Guided repetition is practice evidence only; it cannot establish independence or mastery.

### S03 Scaffolding

- Prompt levels: `NONE`, `TASK_ONLY`, `SEMANTIC_CUE`, `FIRST_WORD`, `FULL_MODEL`.
- The policy may move one step, jump to `FULL_MODEL` after repeated learner errors, return toward less support, or remove prompts after sustained success.
- `NO_EVIDENCE` leaves the prompt level unchanged.

### S04 Adaptive Difficulty

- Valid consecutive success may increase one variable.
- Repeated learner error may reduce one variable.
- Technical failure keeps difficulty unchanged.

### S05 Corrective Feedback

- Strategy depends on learner level and error type: meaning, word order, word choice, intelligibility, or phoneme/tone.
- Beginner correction preserves correct content and retries one point.
- Phoneme/tone correction without acoustic evidence returns `REQUEST_ACOUSTIC_EVIDENCE`.

### S07 Independent Recall

- Requires success from `UNPROMPTED_RECALL` or `TRANSFER_TASK` with prompt level `NONE`.
- Guided repetition, ordinary STT intelligibility, a first-word hint or echo cannot prove independence.

### S08 Error Recovery

- First learner error: one targeted hint.
- Second consecutive learner error: change teaching strategy.
- Third or later: reduce task and offer a clean exit.
- Technical failure: retry or text fallback, never ability attribution.

## Evidence and mastery compatibility

Public states are `NOT_STARTED`, `PRACTICED`, `INDEPENDENT`, `MASTERED`.

- Five evidence dimensions remain: understanding, recall, pronunciation, listening and application.
- Legacy numeric `mastery_level` is retained as metadata. A legacy value above zero maps conservatively to `PRACTICED`, not automatically to `INDEPENDENT`/`MASTERED`.
- One or repeated STT intelligibility successes remain `PRACTICED`; pronunciation is capped at level 1 without acoustic evidence.
- `INDEPENDENT` requires valid unprompted recall or transfer evidence.
- `MASTERED` requires at least two independent successes on different dates and evidence across both recall and application.
- Technical failures become `NO_EVIDENCE`, increment only a reliability/no-evidence counter, and do not increase learner errors, reduce levels or change status.

## Course assertion gate

- Content assertions are allowed only for `EXACT_IN_REFERENCED_DAY` or `EXACT_SOURCE_LITERAL`.
- Direction mismatch and all non-exact references block content assertions.
- A strategy case may remain available for human review after its reference is corrected, but cannot prove course coverage meanwhile.
- No Phase 0.1 case is automatically marked PASS.

## `/api/chat` audit

Mismatch confirmed without runtime edits:

- `/api/chat` returns `message`.
- `ChatWorkspace` reads `assistant_message`.

Phase 1B proposal: define a shared response type, return canonical `assistant_message` plus temporary deprecated `message`, read `assistant_message ?? message`, add malformed/HTTP/network regression tests, then remove the alias only after all consumers migrate.

## Phase 1B recommendation

**GO only for an isolated Preview adapter**, after explicit approval, with these gates:

1. Wire one route behind a disabled-by-default feature flag; no Production enablement.
2. Keep the registry single-pass; do not create six model calls.
3. Add response-schema repair/fallback and `NO_EVIDENCE` telemetry without personal content.
4. Preserve existing Level 2/content authorization before any Skill sees course text.
5. Run strategy fixtures plus human TIS review; static tests are not real teaching-effect validation.

**NO-GO** for Production, server-side personal learning memory, all 12 Skills, or automatic approval of the 100-case corpus.
