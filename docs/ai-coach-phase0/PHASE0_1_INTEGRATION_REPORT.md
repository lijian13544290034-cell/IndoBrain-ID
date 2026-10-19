# AI Coach Phase 0.1 Integration Report

## Outcome

The three providers' 16 handed-off files are received and hash-verified. WorkBuddy A Skills and WorkBuddy B cases/rubric are parsed into traceable derivatives. Human review is not complete, so the result is **not READY for Phase 1 runtime implementation**.

## Mechanical results

- Original files: 16/16 SHA-256 PASS.
- WorkBuddy A Skills: 12/12 extracted with source line locators; all pending human confirmation.
- WorkBuddy B cases: 100/100 IDs and source order preserved.
- Case categories: 65 teaching strategy, 16 course content, 19 voice reliability.
- Evaluation mode: 68 hybrid, 32 human, 0 fully machine-only cases.
- Assertion rules: 127/127 have provisional TIS/P0/Skill rows; 61 rules have no safe Skill assignment and 13 cases therefore have no safe Skill association yet.
- Human review: 100/100 cases pending.

## Exact course-reference audit

- 15 exact full-expression matches in the specifically referenced Day/source.
- 19 target-not-exact conflicts.
- 1 source/Day ownership conflict.
- 27 learning-direction mismatches (ZH_TO_ID targets pointing at ID_TO_ZH Mandarin course sources).
- 38 implementation-code references that do not prove course-content existence.

The old arbitrary-substring method is rejected. No partial substring is accepted as course proof.

## Contract conflicts retained for review

1. WorkBuddy A S07 calls independent recall the sole mastery criterion; current IndoBrain uses five evidence dimensions. A versioned compatibility decision is required.
2. WorkBuddy B's prose describes a fixed DSL count that does not match the 127 distinct rule names in the corpus. The provisional mapping is not an executable judge.
3. TIS P0-4 is contextual; no safe exact assertion rule exists, so it remains `HUMAN_REQUIRED`.
4. `/api/chat` currently produces `message` while `ChatWorkspace` consumes `assistant_message`.
5. Legacy STT success can increment numeric mastery; it must not become `independent` or `mastered` without qualifying evidence.

## Phase 1 status

**NO-GO** until the Skill map, rule aggregation, exact-reference conflicts, response-field compatibility and mastery policy receive human approval. See `PHASE1_CONTRACT_SPEC_V1.md` and `PHASE1_MINIMAL_RECOMMENDATIONS_V1.md`.
