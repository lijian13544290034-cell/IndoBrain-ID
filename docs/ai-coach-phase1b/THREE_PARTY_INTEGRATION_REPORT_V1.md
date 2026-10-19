# IndoBrain AI Coach Teaching Intelligence V1 — Phase 1B minimal integration

## Source traceability

| Source | SHA-256 | Status |
|---|---|---|
| Codex Phase 1A commit | `01507d57d21f4705b21429789b6d0b5374ae8965` | inspected from source |
| `IndoBrain-Teaching-Intelligence-V1.zip` | `59b7df8e3a82ddf0197427a7dbcca6aeb063bdd91f5a5d066b5ce64f01c0bd41` | README, integration guide, six Skill JSON files, task scripts and validator inspected |
| `ai-coach-ti-v1-test-engineering.zip` | `827a48d9977c246bb83849929d9fb02d4f1226b4b05ba8e76078370e0826dd9d` | README, contract, assertions, mock, mutation runner and case classification inspected |

The six WorkBuddy A JSON rule files are copied verbatim into `lib/teaching-engine/workbuddy-a/`. They remain `PROPOSED_FOR_INTEGRATION`; importing them does not approve them as Production policy.

## Contract mapping and resolved conflicts

| Concern | WorkBuddy A | Phase 1A / runtime | WorkBuddy B | Phase 1B decision |
|---|---|---|---|---|
| turn kind | nested rule context | explicit state-machine events | response `turnKind` | adapter requires an explicit source marker; no inference from answer text |
| evidence | state fields and rule assertions | typed five-dimensional evidence | `evidence.kind` | canonical runtime enum is `NONE / PROMPTED_ATTEMPT / INDEPENDENT_PRODUCTION` |
| technical failure | `NO_EVIDENCE` outcome | `NO_EVIDENCE`, ignored for learning | old mock used `TECH_FAILURE` evidence kind | normalized to `turnKind=TECH_FAILURE`, `evidence.kind=NONE`, no write/review queue |
| strategy history | session/turn state | no legacy structured history | response `history` | only structured caller history is accepted; current text-only `recentTurns` maps to empty with source `UNAVAILABLE_LEGACY_RECENT_TURNS` |
| rule result | guard + assertion | course/evidence gates | deterministic boolean checks | `PASS / VIOLATION / NOT_APPLICABLE`; missing paths never pass |
| unknown operator | validator treated conditional operators separately | not present | not applicable | throws `UnknownRuleOperatorError`; never silently allows |
| mastery | WorkBuddy rules contain proposed mastery assertions | Phase 1A evidence policy | mock has no authoritative mastery | only `mastery-policy.ts` derives `MASTERED` |
| language | per-direction output contract | ID_TO_ZH runtime | old B mock hard-coded explanation `ID` | ZH_TO_ID = Chinese explanation/Indonesian target; ID_TO_ZH = Indonesian explanation/Chinese target + pinyin |

Conditional WorkBuddy A operators return `NOT_APPLICABLE` until their explicit precondition is present. For example, `gte_for_scoring` needs `turn.scoringAttempted=true`; absence is not a pass.

## Runtime integration

- One pure `orchestrateTeachingTurn()` call evaluates all six Skill rule sets. It makes no model request.
- The ID_TO_ZH conversation route calls it only through `AI_COACH_TEACHING_ENGINE_V1=shadow`.
- The flag defaults off. No environment value is added in this branch.
- Rule results are observational metadata only; none of the 51 rules blocks runtime behavior.
- Level 2 authorization and canonical lesson resolution occur before the shadow adapter receives the lesson identifier/source.
- The current conversation route has no assessment event and no structured strategy history, so it truthfully emits `evidence.kind=NONE` and an empty strategy history. It does not manufacture evidence from chat text.
- `/api/chat` now returns both `message` and `assistant_message`; the client accepts the canonical field and falls back to the legacy field.

## 100-case status

The cases are not treated as one all-PASS suite:

| Group | Count | Automated use |
|---|---:|---|
| curriculum canonical / fragment | 15 | eligible for exact-reference checks only |
| user-initiated scenarios | 28 | strategy/scenario checks; not course coverage |
| guardrails | 7 | refusal/safety behavior checks |
| pending revision or note | 45 | retained, not accepted as ground truth |
| blocked content gaps | 5 | blocked; no content is invented |

Thirty-four cases still require native-language review and cannot be standard answers. Teaching quality remains `PENDING_HUMAN_REVIEW` even when deterministic contract checks pass.

## Verification results

| Check | Result | Meaning |
|---|---|---|
| Phase 1A deterministic suite | PASS | state machine, evidence and mastery compatibility remain intact |
| Phase 1B adapter suite | PASS | 51 rules loaded; three-state evaluation, unknown-operator error, authorization boundary and adapters verified |
| WorkBuddy A original validator | PASS | 6 Skills, 51 rules, 20 scripts, 83 turns and 1,115 assertion evaluations; 0 rule violations |
| WorkBuddy A fixture coverage | LIMITED | 41 rules have fixture evidence; 5 have none; 5 are conditional-only |
| WorkBuddy B GOOD mock | 300 PENDING | deterministic structure passed, but teaching quality was deliberately not marked PASS |
| WorkBuddy B mutation suite | PASS | all six defective variants were detected in all 60 sampled runs per variant |
| Phase 0.1 source/case verification | PASS | original source hashes and 100 normalized cases retained with human-review states |
| ID_TO_ZH authorization/curriculum regressions | PASS | anonymous Level 1 retained; Level 2 remains fail-closed; course direction and UNKNOWN_INPUT rules retained |
| TypeScript | PASS | `tsc --noEmit` |
| Production Build | PASS | Next.js optimized build completed outside the process-restricted sandbox |
| Real Preview browser, 375/390/430 | NOT VERIFIED | no isolated Preview deployment was created in this run |
| Real microphone, audible TTS and human teaching quality | NOT VERIFIED | requires device and human evaluation |

## Internal test gate

**GO** for local and isolated internal shadow testing after the Preview environment is confirmed isolated and the flag is enabled there only.

**NO-GO** for external testers or Production until all of these are verified:

1. Preview isolation, authorization and external-access behavior.
2. Real STT/TTS on mobile hardware; no automated browser result proves audible playback or microphone quality.
3. Native review of the 34 cases and resolution of the five content gaps.
4. Human teaching-quality scoring; deterministic tests do not prove teaching effectiveness.
