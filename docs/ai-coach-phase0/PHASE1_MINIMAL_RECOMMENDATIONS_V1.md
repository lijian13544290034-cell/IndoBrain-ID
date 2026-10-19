# Phase 1 Minimal Recommendations V1

Phase 1 is **not implemented** by Phase 0.1.

1. `/api/chat` contract: return canonical `assistant_message` while temporarily retaining `message` as a deprecated alias. Add producer, consumer and malformed-response regression tests before removing the alias.
2. Mastery compatibility: define `practiced`, `independent`, `mastered` as the public progression and preserve the existing five evidence dimensions. A single STT success may contribute intelligibility evidence only; it must never set `mastered`.
3. Technical failures: normalize ASR/model/network/schema failures to `NO_EVIDENCE`; do not write learning failure or mastery gain.
4. First Skills MVP: implement only approved S02/S03/S04/S05/S07/S08 policies through one registry/orchestrator, not six model calls.
5. Judge bridge: approve the 127-rule map, then implement only deterministic checks as machine assertions. Keep semantic teaching quality and P0-4 human-required.
6. Course authority: resolve the exact-reference conflict list before using affected cases as content assertions. Never relax exact matching to substring search.

Go gate: human approval of Skill mapping, assertion aggregation, contract compatibility and mastery semantics. Until then Phase 1 remains **NO-GO**.
