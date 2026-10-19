# AI Coach Phase 0 — Source Inventory V1

## Status

- Baseline: `244eb83a689b0309eff5b7ac0732361c903c419c`
- Inventory date: 2026-10-19
- Hash algorithm: SHA-256
- Three-party source integration: **INCOMPLETE**
- Reason: WorkBuddy A/B original artifacts are not present in the repository or adjacent project worktrees.

Absence means `MISSING`, not that an artifact is empty or approved. Skill IDs are opaque until the WorkBuddy A manifest is imported.

## Codex sources present

| Source | Version | SHA-256 |
| --- | --- | --- |
| `docs/AI_COACH_MVP_INTEGRATION_PLAN_V1.md` | Phase 0 planning draft | `2cbb4018b9d92a77cfe2e073ff5e52695d2c1caa34c4d3ac5ae6e2ab33aafa26` |
| `app/api/chat/route.ts` | baseline commit | `eeab2e3ad32fc91c82fc15471ac99b2f04c8a8740179141ae8485c0c211101d9` |
| `components/ChatWorkspace.tsx` | baseline commit | `f49418fd4a45021f205ff26d4cc49e94d79d1a1bf93f7324f09b3c389002d7f8` |
| `lib/mandarin-ai-coach.ts` | baseline commit | `b3441b966dafb7eba409e643b137f4e8d0d248c2559a36dc2d9cf851136cfdc4` |
| `lib/mandarin-coach-personalization.ts` | baseline commit | `458ca2c68b596825d5820f7b0b247e9d9dfe328dbeb68c77c48320dc2ab3afd6` |
| `lib/mandarin-coach-review.ts` | baseline commit | `29968b1c11dba9a3852ad16f415b9dad47e3148a39ed32aa05cf19d8010a1072` |
| `lib/mandarin-coach-skills.ts` | baseline commit | `76189db21755eb00efcbb75bf45d1648cb50b0e65c51f2dace61c3d65e0a8c66` |
| `lib/server/mandarin-coach-brain.ts` | baseline commit | `76c5cab832fe8fdeb6df7322495b89a03164aa4a9e8b4fdaf2a684e63fbd603f` |
| `lib/server/mandarin-ai-coach.ts` | baseline commit | `ef3640a2b7fa350bb8cf28a50c2b46a47449f8fb6084d1487b03ef4e2e8835fa` |
| `app/api/mandarin-coach/conversation/route.ts` | baseline commit | `5fc8128348acad1934f21ebdaf698586fe870b6bd4fd0a6269164eb042a9b3be` |
| `app/api/mandarin-coach/pronunciation/route.ts` | baseline commit | `0840c329ccc5d498daacb3c13eb4beb4700de6c181c0ce8644907fb2bb14cb63` |
| `lib/mandarin-course-import-types.ts` | baseline commit | `9c31156e4fccaffaf8d33334056e2e949deb273eb9178836b5f9d995ae8ccc3f` |
| `lib/mandarin-v2-runtime.ts` | baseline commit | `1b75c794d500a78264aa2359efcceb2fa1c176504ba9ff2676b72bc0c970b70b` |
| `lib/server/mandarin-v2-runtime.ts` | baseline commit | `c0b4fb0210b88e8b1a62a2f7258976e66c05bc507ce6712ec426dd8a238891bb` |
| `lib/server/mandarin-v2-reviewed-packages.ts` | baseline commit | `e344665bfa96771816b9953dac8e0634ef1f1cbf029ed67c5df0d7b00d1853e5` |

## WorkBuddy A sources missing

1. S01–S12 Teaching Skills manifest and authoritative ID/name mapping.
2. Teaching evidence table.
3. Bidirectional teaching examples library.

## WorkBuddy B sources missing

1. Complete 100-case source corpus.
2. TIS rubric, anchors and pass threshold.
3. Quick Speak specification.
4. Mobile acceptance specification/device matrix.
5. Real-user test protocol and result template.

## Intake rules

When an artifact arrives:

1. Preserve the original file byte-for-byte under an agreed source directory.
2. Record provider, original filename, received timestamp, declared version and SHA-256.
3. Do not renumber Skill IDs or test case IDs.
4. Create normalized derivatives separately and link every derivative to source artifact/hash and source record locator.
5. Mark contradictions; never silently rewrite source expectations.
6. Do not set integration status to complete until all required artifacts have a hash and all 100 source cases have a traceable normalized record.
