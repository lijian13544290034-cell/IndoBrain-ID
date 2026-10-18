# ID_TO_ZH supplemental course integration specification (V1)

Status: RC2-C1 preparation only. No supplemental course content is included or imported by this change.

## Verified current inventory

The figures below are generated from the current canonical TypeScript sources by `npm run audit:mandarin-course-inventory`. They are not hand-maintained UI counts.

| Scope | Verified count | Counting rule |
| --- | ---: | --- |
| Day courses | 2 | Level 1 (Day 1–30) and Level 2 (Day 31–60) |
| Day lessons | 60 | 30 Level 1 + 30 Level 2 |
| Level 1 raw item records | 296 | `allMandarinWorkItems()`; repeated dialogue references are included |
| Level 1 AI Coach expressions | 280 | Per-lesson normalized-Chinese de-duplication, matching the production adapter |
| Level 2 core item records | 93 | `lesson.items` |
| Level 2 listening-recognition records | 119 | `lesson.recognition` |
| Level 2 dialogue records | 43 | `lesson.dialogue` |
| Level 2 AI Coach expressions | 243 | Core, recognition and dialogue after per-lesson de-duplication |
| Day 1–60 AI Coach expressions | 523 | Level 1 + Level 2 adapter output |
| Unique normalized Chinese across Day 1–60 | 395 | Punctuation and whitespace ignored, cross-lesson duplicates collapsed |
| Level 1 foundational word IDs | 157 | Unique `coreWordIds`; Level 2 has no equivalent canonical word-ID field |
| Day 1–14 foundational expressions | 119 | Unique normalized learner expressions in the existing foundation period |
| Occupational day scenes | 60 | One scenario/module assignment per Day |
| Distinct scenario/module keys | 33 | 30 Level 1 scenarios + 3 Level 2 modules |
| Existing non-Day topics | 1 | Golden quantity topic |
| Topic AI Coach expressions | 6 | Per-topic de-duplicated expressions |
| All current AI Coach lessons | 61 | 60 Days + 1 topic |
| All current AI Coach expressions | 529 | 523 Day expressions + 6 topic expressions |

“Expression” means a learner-visible entry produced by the current AI Coach curriculum adapter. Raw records, unique sentences and core-word IDs are deliberately reported separately; they are not interchangeable metrics.

## Current dependency contract

| Concern | Existing source/contract | Requirement for future supplemental content |
| --- | --- | --- |
| Day 1–30 | `lib/mandarin-work-course.ts` | Immutable Day and item IDs; do not append supplemental content to a Day |
| Day 31–60 | `lib/server/mandarin-work-level2.ts` | Server-only payload; retain `mandarin.level2.access` gating |
| AI Coach | `lib/server/mandarin-coach-curriculum.ts` | Add a reviewed adapter only after approval; catalog may advertise locked content but payload must remain server-gated |
| TTS | Chinese text passed to the existing Mandarin speech path | `ttsText` must equal reviewed Chinese and continue to use zh-CN; no locale fallback is introduced here |
| Favorites | Stable expression ID stored by existing scoped local profile | IDs are immutable after release; a future resolver must resolve the new namespace without copying content |
| Review | Scoped snapshots join records back to expression and lesson IDs | Stable IDs and resolvable lesson IDs are mandatory; merely opening content must not create review evidence |
| Progress | Existing `currentDay`, `completedDays`, and Day item progress | Supplemental completion must use a separate namespace; never write Day 61 or mutate Day completion |
| Pinyin | Tone-marked Hanyu Pinyin shown with Chinese | Tone numbers are rejected; human review remains required for sandhi and polyphonic characters |

## Approved package shapes

Two independent supplemental types are reserved:

1. `PUBLIC_HIGH_FREQUENCY`: shared high-frequency Mandarin not already present in canonical lessons. It is always `FREE`.
2. `CAREER_SCENARIO`: a reviewed occupational scenario. It may be `FREE` or `LEVEL_2`; Level 2 must use the existing `mandarin.level2.access` permission.

Both use `lib/mandarin-course-import-types.ts` and `schemas/mandarin-course-import-v1.schema.json`. Required controls include:

- `direction: ID_TO_ZH` and `version: 1`;
- `reviewStatus: HUMAN_APPROVED` plus a non-empty human review reference;
- supplemental course IDs (`mandarin-public-*` or `mandarin-career-*`), never a Day number;
- stable expression IDs (`CN-HF-*` or `CN-CAREER-*`);
- reviewed Chinese, tone-marked pinyin, natural Indonesian, difficulty 1–3 and non-empty tags;
- explicit access tier and the exact existing Level 2 permission where applicable;
- optional placement only through existing prerequisite/recommendation lesson IDs.

## Duplicate detection

`npm run validate:mandarin-course-import -- <file.json>` rejects:

- duplicate course or expression IDs;
- duplicate expression IDs within one package;
- exact normalized-Chinese duplicates within the package or current canonical catalog;
- punctuation/spacing variants of existing Chinese (Chinese punctuation and whitespace are removed before comparison).

Normalization intentionally does not claim semantic equivalence. Near-duplicates, synonyms, different word order and context-specific senses require human review; the validator must not automatically merge them.

Validation is non-mutating. A PASS means the reviewed file conforms to the intake contract, not that it was imported or published.

## Future learning-path integration

After a separate content approval and implementation authorization:

1. Store reviewed supplemental packages separately from Day 1–60 canonical sources.
2. Expose them as “high-frequency” or “career scenario” shelves and as recommendations after an existing lesson.
3. Keep `day: null`; do not allocate Day 61+, renumber Days, or alter existing course progress.
4. Keep original Day learning available in its current order.
5. Gate Level 2 packages on the server before sending expression content.
6. Extend AI Coach/favorite/review resolvers using stable supplemental IDs, with no migration of existing local profiles.
7. Track any future supplemental completion in a versioned, separate key so existing `completedDays`, favorites and mastery evidence remain intact.

## Intake workflow

1. GPT or an editor supplies candidate JSON conforming to the schema.
2. A human reviews Chinese, Indonesian, pinyin, pedagogical difficulty, cultural/occupational fit and access tier.
3. Set `HUMAN_APPROVED` and record the review reference only after that review.
4. Run the inventory audit and import validator against the latest target branch.
5. Resolve all exact duplicates; manually review near-duplicates.
6. In a separately authorized task, add the reviewed package and runtime adapter, then run TTS, access, favorites, review, mobile and regression checks.

## Known integration risks

- Existing Level 2 recognition/dialogue records may have an empty Indonesian explanation in the AI Coach adapter; new packages must not copy that exception and must include Indonesian.
- Changing released IDs would orphan favorite/review references.
- Client-only gating can leak paid expressions; supplemental Level 2 content must remain server-filtered.
- Exact normalization cannot detect semantic duplication or incorrect translations/pinyin.
- Adding a supplemental source to the AI Coach source union, favorite resolver and review resolver is future runtime work, not part of RC2-C1.
- Anonymous and signed-in local scopes must continue to be isolated when supplemental progress is eventually introduced.

