# IndoBrain Mandarin Course V2 runtime architecture

Status: RC2-C2 infrastructure only. The reviewed-package registry is intentionally empty and no V2 course is visible in the application.

## Modules

| Product module | Contract type | Runtime component | Access |
| --- | --- | --- | --- |
| Kosakata Penting | `PUBLIC_HIGH_FREQUENCY` | `MandarinV2VocabularyModule` | Always FREE |
| Kalimat Praktis | `PRACTICAL_SENTENCE` | `MandarinV2SentenceModule` | FREE or existing Level 2 gate |
| Situasi Singkat | `CAREER_SCENARIO` | `MandarinV2ScenarioModule` | FREE or existing Level 2 gate |
| AI Coach | Tool, not a content type | Future ID-based association | Only references content present in the authorized runtime payload |

`PRACTICAL_SENTENCE` is an additive extension to C1 schema version 1. Existing `PUBLIC_HIGH_FREQUENCY` and `CAREER_SCENARIO` packages require no migration and remain valid.

## Runtime boundary

1. Only packages explicitly present in `lib/server/mandarin-v2-reviewed-packages.ts` are considered.
2. The runtime adapter rejects anything not marked `HUMAN_APPROVED`, not `ID_TO_ZH`, not supplemental, or with inconsistent access metadata.
3. Catalog metadata and course bodies are separate. Locked Level 2 metadata may be listed, but its expressions and scenario are absent from `courses` until the existing server access check authorizes the request.
4. Every V2 course has `day: null`. Day 1–60 data, numbering and progress remain unchanged.
5. There is no page route or navigation link in RC2-C2. An empty registry therefore produces an empty catalog and cannot activate content accidentally.

## Stable identity and existing systems

- Course and expression IDs retain the C1 rules. Practical sentences add `mandarin-practical-*` and `CN-SENT-*`.
- Favorites use `mandarin-v2:<expressionId>` in the existing account-scoped Mandarin profile. No existing favorite is migrated or rewritten.
- TTS reuses `ChineseSpeechButton`; reviewed `ttsText` continues through the existing zh-CN-only service/fail-closed browser path.
- Display components receive serialized, server-filtered courses. They never fetch a course by a client-provided access flag.
- Review integration is deferred. Future review resolution must join the stable V2 expression ID without treating playback or page views as evidence.
- Existing Day progress is never read or written by the V2 adapter.

## Micro-scene structure

Scenario metadata contains occupation labels and role labels, while every learner-visible utterance remains a reviewed expression. Dialogue turns, common questions and variable-replacement exercises reference expression IDs from the same package. This prevents unreviewed text from being hidden in auxiliary scenario fields.

## AI Coach association

`buildMandarinV2CoachReferences` produces only course IDs, content types and expression IDs from the already authorized runtime payload. A future, separately approved AI Coach adapter can resolve these IDs. RC2-C2 does not add the new source to the existing AI Coach curriculum union, prompts, memory, learning logic or user interface.

## Activation checklist for a future reviewed package

1. Human content review and a recorded `reviewReference`.
2. Run the C1 import validator and the V2 runtime verification.
3. Add the reviewed package to the server-only registry.
4. Add a server-rendered route that calls `getMandarinV2Runtime`; never serialize the registry directly.
5. Integrate the matching display module and, separately, the favorite/review resolvers.
6. Verify guest/account isolation, Level 2 response payloads, zh-CN TTS, mobile layout and regressions.
7. Add navigation only after the content and route are approved.

## Compatibility and risks

- C1 schema version stays at 1; the new enum and optional scenario block are backward compatible.
- JSON Schema checks shape, while the validator enforces ID patterns, access policy, duplicates and cross-field scenario references.
- Stable IDs are immutable after activation or favorite/review links may become orphaned.
- Locked metadata must not accidentally acquire learner text; keep titles and counts only in catalog entries.
- The current empty registry is a deliberate release safety control, not placeholder course content.
