# AI Coach Teaching Intelligence V1 — MVP Integration Plan

## 1. Document status

- Project: IndoBrain / 尼会说
- Audited branch: `codex/indobrain-v1-2-rc2-integration`
- Audited commit: `244eb83a689b0309eff5b7ac0732361c903c419c`
- Scope: contract integration and implementation planning only
- Production, Supabase, environment variables, permissions, domains and `main`: unchanged
- Deployment: none

### Decision

**GO** for a small contract-first engineering batch that fixes the proven API/mastery contract conflicts and introduces inert Teaching Engine interfaces behind flags.

**NO-GO** for claiming a completed three-party source integration or starting all 12 Teaching Skills. The repository does not contain WorkBuddy A/B's original artifacts, so their exact skill identifiers, evidence table, 100 cases, TIS rubric, Quick Speak specification and mobile acceptance data cannot yet be normalized or traced line by line.

## 2. Evidence and verification boundary

The following evidence was obtained directly from the current repository:

- The requested branch and full commit match, and the worktree was clean before this document was created.
- `a86dde06bba542356a9778cb8304f5b1df3126c7` is an ancestor of the current integration commit. The range contains four commits and 22 changed files: C1 import tooling/contracts, C2 inactive runtime/components, and favorites/day-deep-link fixes.
- The core AI Coach API, routing, skills, pronunciation, personalization and review files are byte-identical between `a86dde0` and the current integration commit.
- Current automated verifications passed for Mandarin AI Coach, personalization, conversation access, send reliability, curriculum, C1 import validation and C2 runtime.
- Current inventory reported by the checked-in validator: 60 Day lessons, 523 Day expressions, one additional topic with 6 expressions, 61 coach lessons and 529 coach expressions in total.

These are repository/automation results, not real-account, real-model, real-microphone or human teaching-quality validation.

## 3. WorkBuddy source files required before true three-party integration

Import the original files without editing their substantive content, then assign immutable source versions and hashes:

1. WorkBuddy A skill manifest containing S01–S12 names, intent, preconditions, actions, evidence requirements, fallbacks and examples.
2. WorkBuddy A teaching evidence table, including the exact meaning of success, failure, no evidence and delayed transfer evidence.
3. WorkBuddy A bidirectional teaching example library with direction, learner language, target language, explanation language, expected pinyin and content references.
4. WorkBuddy B's complete 100-case corpus, including case IDs, old expected results and referenced course/expression IDs.
5. WorkBuddy B TIS rubric, scoring anchors, reviewer instructions and minimum passing score.
6. WorkBuddy B Quick Speak interaction specification, especially microphone, timeout, retry, skip and error behavior.
7. WorkBuddy B mobile specification and device/browser matrix.
8. WorkBuddy B real-user protocol, consent/privacy constraints and raw result template.

Until these files are present, S02/S03/S04/S05/S07/S08 remain opaque external IDs. Their candidate roles in section 12 are provisional and must be replaced by the authoritative WorkBuddy A mapping.

## 4. Old baseline reconciliation

### 4.1 What changed after `a86dde0`

The RC2 integration adds:

- C1 course intake schema, inventory and validation tools.
- C2 supplemental runtime types for `PUBLIC_HIGH_FREQUENCY`, `PRACTICAL_SENTENCE` and `CAREER_SCENARIO`.
- A deliberately empty reviewed-package registry.
- Human approval metadata and `day: null` supplemental content semantics; no Day 61.
- Server-side filtering of Level 2 course bodies and a catalog that may expose only locked metadata.
- Favorite/deep-link fixes for canonical Day content.

It does **not** change the existing Mandarin AI Coach prompt, model routing, STT/TTS, conversation API, five-dimensional mastery or review implementation.

### 4.2 Required revalidation of WorkBuddy B cases

Every imported case must be rebound to the current contracts:

- Canonical Day references must resolve against the current Day 1–60 catalog.
- Supplemental references must include `reviewStatus=HUMAN_APPROVED`, a non-empty `reviewReference`, stable course/expression IDs and `day=null`.
- No test may assume unreviewed C2 content is visible; the current reviewed registry is empty.
- A Level 2 test may assert locked metadata, but must never receive protected expressions without server authorization.
- Favorite deep links must use the current validated Day selection behavior and must not mutate learning progress.
- API cases must assert the current route response contract rather than the old baseline's UI assumptions.

## 5. Direction contract

```ts
type LearningDirection = 'ZH_TO_ID' | 'ID_TO_ZH';

type DirectionContract = {
  direction: LearningDirection;
  learnerLanguage: 'zh-CN' | 'id-ID';
  targetLanguage: 'id-ID' | 'zh-CN';
  explanationLanguage: 'zh-CN' | 'id-ID';
  targetScript: 'LATIN_INDONESIAN' | 'SIMPLIFIED_CHINESE_WITH_PINYIN';
  sttLanguage: 'id-ID' | 'zh-CN';
  ttsLanguage: 'id-ID' | 'zh-CN';
  contentNamespace: 'zh-to-id' | 'id-to-zh';
  progressNamespace: 'ZH_TO_ID' | 'ID_TO_ZH';
};
```

| Direction | Explanation | Teaching target | Display | STT | TTS |
| --- | --- | --- | --- | --- | --- |
| `ZH_TO_ID` | Chinese | Indonesian | Indonesian; Chinese explanation | `id-ID` | `id-ID` |
| `ID_TO_ZH` | Indonesian | Simplified Mandarin | Chinese + tone-marked Hanyu Pinyin + Indonesian explanation | `zh-CN` | `zh-CN` only |

Rules:

- Input language detection does not change the configured learning direction.
- A Chinese question in `ID_TO_ZH` still receives an Indonesian beginner explanation unless the learner explicitly requests otherwise.
- Pinyin is required for learner-visible Mandarin teaching targets, except deliberate unknown-input listening challenges. Pinyin must never be asserted for Indonesian targets.
- Mixed output must be segmented and sent only to its matching TTS route. No cross-language voice fallback is allowed.
- Direction, content IDs, progress, favorites, review, conversation memory and analytics keys must be namespaced and must not be inferred from a client-supplied direction alone.

## 6. Proven API contract defect

`POST /api/chat` currently returns:

```json
{ "configured": true, "message": "...", "database": {} }
```

`components/ChatWorkspace.tsx` reads `data.assistant_message`. This is a real field mismatch, not a hypothetical risk. The minimum correction is to define one shared response schema and make both producer and consumer use `message`; during a bounded compatibility window the client may safely accept `message ?? assistant_message`, but the server must not maintain two undocumented contracts indefinitely.

Acceptance gate:

- A successful ZH_TO_ID request renders a non-empty assistant message.
- 400/401/403/429/500 and malformed JSON render a visible localized error.
- Contract tests cover route output and consumer parsing from the same fixture/schema.

## 7. Evidence and mastery contract

### 7.1 Normalized states

```ts
type LearningStatus = 'not_started' | 'practiced' | 'independent' | 'mastered';
type EvidenceOutcome = 'SUCCESS' | 'FAILURE' | 'NO_EVIDENCE';
type EvidenceKind =
  | 'MODEL_EXPOSURE'
  | 'GUIDED_REPETITION'
  | 'MEANING_RECOGNITION'
  | 'ACTIVE_RECALL'
  | 'STT_INTELLIGIBILITY'
  | 'ACOUSTIC_PRONUNCIATION'
  | 'LISTENING_RECOGNITION'
  | 'GUIDED_APPLICATION'
  | 'INDEPENDENT_TRANSFER';
```

- `practiced`: at least one valid learning interaction. Exposure, playback, guided repetition or a single STT-understandable attempt may reach this state, but never higher by itself.
- `independent`: the learner succeeds without answer exposure or direct content hints in a valid recall, listening or transfer task. A recognition choice and a guided repetition are not independent evidence.
- `mastered`: repeated independent success across at least two occasions, including delayed evidence and a changed prompt/context. Relevant dimensions must meet their policy threshold. Course/session completion is stored separately.
- A technical failure, missing transcript, network error, unsupported audio, parser error or provider error produces `NO_EVIDENCE` and never increments failures or attempts used for pedagogical escalation.
- Overall mastery is not inferred from a numeric value alone; it is derived from dimension evidence and policy version.

### 7.2 Pronunciation boundary

- STT supplies only transcription and intelligibility-related evidence.
- Without acoustic evidence, the system must not claim phoneme, initial/final, tone contour or tonal accuracy.
- `STT_INTELLIGIBILITY SUCCESS` may mark pronunciation as `practiced`, never `mastered`.
- Only a separately validated acoustic assessor may emit `ACOUSTIC_PRONUNCIATION` evidence.
- Empty STT and provider/recording failures are `NO_EVIDENCE`, with retry/skip guidance.

### 7.3 Existing conflict and migration rule

Two models currently coexist:

1. Legacy `mastery_level: 0..4`, which gains `+2` after one STT PASS and `+1` after a correct comprehension answer; review code can label level 4 `MASTERED`.
2. Five-dimensional mastery (`UNDERSTANDING`, `RECALL`, `PRONUNCIATION`, `LISTENING`, `APPLICATION`), which caps non-acoustic pronunciation and applies breadth/application constraints.

They can contradict each other. The MVP must not rewrite local data. Add a read adapter that treats legacy values as historical practice hints only. New status decisions come from versioned evidence; legacy level 4 alone cannot produce `mastered`. Existing fields remain readable until a later, separately approved migration.

## 8. Teaching state and action contracts

```ts
type TeachingState =
  | 'DIAGNOSE' | 'MODEL' | 'SPEAK' | 'EVALUATE'
  | 'HINT' | 'RETRY' | 'ADVANCE' | 'TRANSFER_TEST' | 'COMPLETE';

type TeachingAction =
  | { type: 'DEMONSTRATE'; contentRef: AuthorizedContentRef; rate: 'normal' | 'slow' }
  | { type: 'PROMPT_ONE_TASK'; instruction: string; expectedEvidence: EvidenceKind }
  | { type: 'CORRECT'; focus: 'meaning' | 'form' | 'intelligibility'; model: string }
  | { type: 'CHUNK'; chunks: string[] }
  | { type: 'LOWER_DIFFICULTY'; reason: string }
  | { type: 'RAISE_DIFFICULTY'; reason: string }
  | { type: 'VARY_PROMPT'; contentRef: AuthorizedContentRef }
  | { type: 'SCHEDULE_REVIEW'; expressionId: string; reason: string }
  | { type: 'ALLOW_SKIP'; preserveForReview: boolean };

type TeachingTurnResult = {
  contractVersion: 'teaching-turn.v1';
  direction: LearningDirection;
  state: TeachingState;
  nextState: TeachingState;
  action: TeachingAction;
  learnerTask: string; // exactly one clear task
  explanationLanguage: 'zh-CN' | 'id-ID';
  targetLanguage: 'id-ID' | 'zh-CN';
  contentRefs: AuthorizedContentRef[];
  evidence: EvidenceRecord[];
  statusBefore: LearningStatus;
  statusAfter: LearningStatus;
  speechSegments: Array<{ language: 'zh-CN' | 'id-ID'; text: string; rate: 'normal' | 'slow' }>;
  fallback: { used: boolean; reason?: string };
};
```

State rules:

- `DIAGNOSE`: determine one immediate target, prior evidence and whether clarification is needed.
- `MODEL`: show/listen to an authorized short target; no mastery credit.
- `SPEAK`: issue one clear production/recall task.
- `EVALUATE`: validate evidence source before judging. Technical failures route to retry service guidance with `NO_EVIDENCE`.
- `HINT`: reveal the smallest useful hint allowed by the current task.
- `RETRY`: retry with changed support; never an indefinite identical loop.
- `ADVANCE`: move after success or learner skip; skip is not PASS.
- `TRANSFER_TEST`: change cue/context and remove direct answer support.
- `COMPLETE`: finish the session; completion is not mastery.

## 9. Conditional teaching policy

Absolute pedagogical wording must be replaced by explicit conditions:

- Correction: use a brief recast for an intelligible, low-risk form issue; use explicit correction when meaning changes, the learner asks why, or the same valid error repeats. Correct only one priority issue per beginner turn.
- Encouragement: praise demonstrated effort, strategy use or valid improvement. Do not say “correct/mastered” without matching evidence. On technical failure, acknowledge the service problem rather than evaluating the learner.
- Hint gradient: no hint in transfer test; then semantic/category cue; then first chunk/contrast; then complete model. Reset only after a changed task, not by repeating identical prompts.
- Retry: a pedagogical failure increments retry count; `NO_EVIDENCE` does not. After repeated valid failures, change modality or difficulty and always allow save/skip.
- Review: schedule from evidence strength, recency, failures and learner choice. Do not mark reviewed merely for opening a page, playing audio or navigating to a lesson.
- Difficulty: lower when valid failures cluster or task prerequisites are missing; raise only after independent evidence, not after imitation.

Every policy decision must record `policyId`, `policyVersion`, condition inputs and selected action.

## 10. Model routing, fallback, latency and logs

Reuse the existing tiers:

- Level 0: deterministic routing, authorization, content lookup, state transition, evidence validation, fixed off-topic response and known response cache.
- FAST: ambiguity classification, simple explanation/translation, low-risk correction formatting.
- SMART: complex adaptive explanation, multi-turn roleplay and transfer prompt generation.

Limits:

- One primary model call per turn; at most one bounded structured repair.
- Authorization and approved content resolution occur before any protected content enters a model prompt.
- Parsed output is schema-validated, direction-validated and content-reference-validated.
- If repair fails, return a safe localized teaching fallback with one actionable next step; never return an empty answer or internal error.

Minimum metrics:

- route, skill IDs/versions, policy version, state transition, content reference IDs, evidence kind/outcome, model tier, structured retries, fallback count, input/output tokens, STT seconds, TTS characters, total latency and stage latencies.
- No raw sensitive personal or third-party data in teaching logs. Production personal-learning persistence remains disabled until separately approved identity/RLS/privacy work is complete.

## 11. C1/C2 content authority

- Existing Day 1–60 canonical content remains immutable and keeps its current IDs/progress.
- Supplemental content is accepted only through the C1 schema and validator.
- C2 runtime exposes only packages with `HUMAN_APPROVED` and a review reference.
- `PUBLIC_HIGH_FREQUENCY` is FREE; protected packages require existing Level 2 authorization.
- Unauthorized clients may receive locked catalog metadata, never expressions/dialogue bodies.
- AI Coach receives only server-authorized content references. It may not invent IDs or convert an unreviewed draft into visible teaching content.
- User-initiated questions may receive an ephemeral explanation, but it is not canonical curriculum and must be labeled separately from approved course references.

## 12. Six-skill MVP scope

Authoritative names for S02/S03/S04/S05/S07/S08 are blocked on the WorkBuddy A manifest. The provisional capability mapping below is for estimation only:

| External ID | Provisional MVP responsibility | Machine gate |
| --- | --- | --- |
| S02 | diagnose one learning need and prerequisites | valid direction, one goal, no protected content leak |
| S03 | model one approved target | correct explanation/target language, pinyin rules, TTS route |
| S04 | request one speaking/recall action | one task, valid evidence expectation, skip available |
| S05 | evidence-based evaluation/correction | `NO_EVIDENCE` boundary, no acoustic overclaim |
| S07 | adaptive hint/retry/difficulty | changed strategy after valid repeated failures, bounded retries |
| S08 | transfer/review/next action | independent evidence required; no completion=mastery |

Do not implement this mapping until the source manifest confirms or replaces each responsibility.

## 13. Reclassification of the 100 cases

The original cases must keep their IDs and source text, then receive the following metadata. No case is considered migrated until its current course/API references resolve.

### A. Strategy tests

Machine assertions: direction, state transition, one-task limit, selected skill/policy version, evidence outcome, retry bound, mastery transition and fallback behavior.

Human evaluation: appropriateness of correction, cognitive load, usefulness of hint, natural encouragement, difficulty adjustment and TIS score.

### B. Course-content tests

Machine assertions: canonical/approved reference exists, direction is correct, Level 2 filtering works, visible Mandarin has approved pinyin, and expected content is not invented or duplicated.

Human evaluation: translation naturalness, usage/pragmatics, pinyin and language quality, beginner suitability and scenario realism.

### C. Voice-reliability tests

Machine assertions: microphone/upload lifecycle, HTTP status, STT language, `NO_EVIDENCE` on technical failure, matching TTS route, no overlap, fail closed and playable audio response.

Human evaluation: actual audibility, natural voice, rate difference, mobile interaction clarity and perceived latency.

An initial planning split is 45 strategy / 30 content / 25 voice cases. This is a target allocation, not a completed migration; it must be reconciled with the original 100 files. Each case declares `evaluationMode: MACHINE | HUMAN | BOTH` and must never let a string assertion stand in for human audio or teaching-quality judgment.

## 14. Minimal file changes for the first engineering batch

New files:

- `lib/teaching-engine/contracts.ts`
- `lib/teaching-engine/direction-policy.ts`
- `lib/teaching-engine/evidence-policy.ts`
- `lib/teaching-engine/mastery-policy.ts`
- `lib/teaching-engine/skill-registry.ts`
- `lib/teaching-engine/state-machine.ts`
- `lib/teaching-engine/response-schema.ts`
- `scripts/verify-teaching-engine-contracts.mjs`
- `scripts/verify-teaching-direction-contracts.mjs`
- `scripts/verify-teaching-evidence-policy.mjs`

Minimal adapter changes:

- `app/api/chat/route.ts` and `components/ChatWorkspace.tsx`: shared response contract fix.
- `lib/mandarin-ai-coach.ts`: add versioned normalized status/evidence fields while preserving legacy reads.
- `lib/mandarin-coach-personalization.ts`: emit/consume normalized evidence and stop treating legacy numeric level as authoritative.
- `lib/mandarin-coach-review.ts`: derive status from normalized evidence; retain legacy data as a review hint.
- `lib/server/mandarin-coach-brain.ts`: use direction/skill policy adapters while retaining Level 0/FAST/SMART behavior.
- `lib/server/mandarin-ai-coach.ts`: validate structured teaching response and pronunciation evidence boundary.
- `app/api/mandarin-coach/conversation/route.ts`: attach verified direction/content references and telemetry versions.
- `components/MandarinAiCoachExperience.tsx`: consume normalized decisions without changing canonical course content.

Do not alter TTS/STT providers, Supabase, course text or C1/C2 approval mechanics in this batch.

## 15. Automated acceptance gates

1. Direction matrix: both directions use the correct explanation, target, STT and TTS languages; cross-direction data keys fail closed.
2. Response schema: valid structured output passes; malformed output gets one repair then a localized safe fallback.
3. `/api/chat`: one shared response field is rendered end to end.
4. Evidence: playback, exposure, page completion and guided repetition cannot produce independent/mastered.
5. STT: empty/error/timeout/unsupported audio is `NO_EVIDENCE`; a transcript can contribute intelligibility only.
6. Mastery: one STT PASS cannot produce mastered; mastery requires delayed independent transfer evidence.
7. State machine: every turn emits exactly one learner task and a valid transition; retries are bounded and change strategy.
8. Permissions: Day 1–30 anonymous rules remain; Day 31–60 and C2 Level 2 bodies remain server-gated.
9. Content authority: invalid/unreviewed IDs are rejected; empty C2 registry remains invisible.
10. Local data: guest/account/direction namespaces remain isolated; reading causes no profile creation.
11. Regression: existing AI Coach, personalization, conversation access, send reliability, curriculum, favorites, review, C1 and C2 verification suites pass.
12. Human gates: bilingual teaching quality, pinyin, real microphone, actual audio, Quick Speak and TIS are marked NOT VERIFIED until WorkBuddy evidence is run.

## 16. Implementation sequence and effort

### Phase 0 — Source intake and test normalization (1–2 engineer-days)

- Import/hash WorkBuddy A/B artifacts.
- Confirm S02/S03/S04/S05/S07/S08 names and policy semantics.
- Rebind all 100 cases to current course/API contracts and flag invalid references.

### Phase 1 — Contract defects and compatibility adapters (1–2 days)

- Fix `/api/chat` response mismatch.
- Add direction, evidence and normalized mastery contracts.
- Add legacy read adapter without migrating or deleting local data.

### Phase 2 — Inert engine core and six-skill registry (3–4 days)

- State machine, action contracts, policy conditions and skill versions.
- Keep behind local/development flags; no Production rollout.

### Phase 3 — ID_TO_ZH adapter and regression (2–3 days)

- Integrate with current AI Coach, Level 0/FAST/SMART, permissions, C1/C2 references and local evidence.
- Preserve TTS/STT services and current guided flow as fallback.

### Phase 4 — ZH_TO_ID adapter (2–3 days)

- Fix current chat contract, then add Chinese explanation/Indonesian teaching adapter without sharing ID_TO_ZH progress or content.

### Phase 5 — Automated and human gates (3–5 days)

- Run normalized 100-case suite, mobile/Quick Speak checks, real microphone/TTS and TIS review.

Estimated total: **12–19 engineer-days**, excluding content corrections found by human review and any future server-side memory/privacy project.

## 17. Risks and blockers

- **Blocker:** WorkBuddy A/B raw artifacts are absent; exact three-party traceability and skill-ID semantics cannot be certified.
- **P0 defect:** `/api/chat` and `ChatWorkspace` disagree on the successful response field.
- **P0 semantic conflict:** legacy numeric mastery can overstate learning and conflict with five-dimensional evidence.
- Existing per-process rate-limit maps are not distributed; this is acceptable only as a known MVP limitation, not a security guarantee.
- Real provider, microphone, audio, mobile and current account-isolation behavior are not established by static tests.
- ZH_TO_ID is currently a general scenario chat, not a full teaching engine; it needs an adapter, not reuse of Mandarin-specific prompts.
- C2 reviewed registry is empty. Tests that expect new visible V2 content are invalid until human-approved packages exist.
- Production server-side personal learning persistence remains out of scope and must stay disabled.

## 18. Approval requested

Approve only Phase 0 and Phase 1 first. Do not authorize all 12 Skills. Development of the six-skill MVP should begin only after the WorkBuddy A manifest confirms the provisional ID mapping and the WorkBuddy B cases are normalized against the current RC2 contracts.
