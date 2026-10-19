# AI Coach Phase 0 — Test Case Normalization V1

## Current result

- Expected WorkBuddy B cases: 100
- Imported original cases: 0
- Normalized cases: 0
- Status: `BLOCKED_SOURCE`

No placeholder case is presented as an original test. When the corpus arrives, each original ID and source locator must be preserved.

## Categories

### `TEACHING_STRATEGY`

Use for state transitions, one-task behavior, hint/retry policy, correction strategy, difficulty changes, evidence decisions and mastery transitions.

- Machine: schema, direction, selected Skill/version, transition, evidence outcome, bounded retry, no completion-to-mastery shortcut.
- Human: pedagogical appropriateness, cognitive load, natural encouragement, usefulness of correction/hint and TIS rating.

### `COURSE_CONTENT`

Use when correctness depends on an approved expression, course ID, pinyin, translation, scenario or access tier.

- Machine: reference resolution, C1/C2 approval, Level 2 filtering, visible-pinyin rule and no invented IDs.
- Human: naturalness, pragmatics, translation, pinyin, beginner suitability and scenario authenticity.

### `VOICE_RELIABILITY`

Use when success depends on recording, upload, STT, TTS, audio playback, rate or mobile browser behavior.

- Machine: HTTP/result state, configured language, technical failure=`NO_EVIDENCE`, matching TTS route, no prohibited fallback.
- Human: actual audible output, natural voice, rate distinction, interaction clarity and perceived latency.

## Direction correction rules

- `ZH_TO_ID`: Chinese explanation; Indonesian teaching target; `id-ID` STT/TTS; no Mandarin pinyin assertion.
- `ID_TO_ZH`: Indonesian explanation; Simplified Chinese target; tone-marked Hanyu Pinyin; `zh-CN` STT/TTS only.
- Input language or mixed input never silently changes the learning direction.

## Normalization procedure

1. Hash and register the original corpus.
2. Copy each original case without rewriting it.
3. Create a normalized record referencing its original case ID and locator.
4. Assign exactly one primary category; secondary concerns go in notes.
5. Assign `MACHINE`, `HUMAN` or `BOTH` based on what can genuinely be measured.
6. Resolve all course/expression/API references against commit `244eb83...`.
7. Mark unresolved cases `BLOCKED_REFERENCE`; do not silently substitute a different lesson.
8. Mark source contradictions `CONFLICT` and preserve both expectations for review.
9. Generate summary counts from normalized records, not manually maintained totals.
10. Integration is complete only at 100 traceable records and zero `BLOCKED_SOURCE`.

## Planned distribution

The earlier 45 strategy / 30 content / 25 voice split is a planning target only. Actual counts will be derived from the original corpus and must not be forced by relabeling cases.
