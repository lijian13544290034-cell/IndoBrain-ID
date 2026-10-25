# Natural Conversation Skill V1 — capability audit

Baseline: `f39c224042177b22c96271ac728ff77a5e8e6a3b` on `codex/ai-free-teaching-v1`.

The skill remains a behavior layer inside the existing Free Teaching request. It does not create a second coach, course engine, mastery engine, or skill registry.

| Rule | Baseline status | Evidence / minimum V1 action |
| --- | --- | --- |
| Understand intent before correction | Partial | Baseline asks Gemini to infer intent, but has no explicit learner-act field. V1 adds `learnerAct` and prevents correction outside `ATTEMPT`. |
| Correct at most 1–2 key errors | Not implemented | V1 adds a schema-limited `corrections` array (`maxItems: 2`) and prompt rule. |
| Never score without an answer | Implemented with risk | Baseline requires `NOT_ASSESSED` for questions/requests. V1 makes this observable through `learnerAct` and applies a server normalization guard. |
| Prioritize current request | Implemented | Baseline already states latest request overrides unfinished work. No duplicate routing logic added. |
| Do not mechanically repeat over twice | Not implemented | V1 sends a small session counter and tells the model to change task/strategy after two repeats. No state machine added. |
| Change method after repeated failure | Partial | Baseline says adjust difficulty but carries no failure/strategy state. V1 adds bounded `consecutiveFailures` and `lastTeachingStrategy`. |
| One clear task per turn | Partial | Baseline can place tasks in answer/follow-up. V1 adds a single nullable structured `task`. |
| Natural concise Indonesian | Partial | Baseline asks for clear Indonesian and focused teaching. V1 strengthens conversational brevity. |
| Record weak and independently used expressions | Not implemented in Free Teaching | Existing AI Coach mastery is course/expression scoped and cannot be safely reused for arbitrary free-teaching expressions. V1 stores session-local evidence only and explicitly excludes shadowing from independent evidence. Cross-device durable memory remains missing. |
| End with recap and 3–5 recall exercises | Not implemented | V1 adds `sessionWrapUp` with schema-enforced 3–5 exercises for `SESSION_END`. |
| Chinese-only zh-CN TTS | Implemented | Existing explicit `spokenChinese` allowlist, server validation, Azure endpoint, and cache remain unchanged. |
| No acoustic score from STT text | Not applicable to text-first Free Teaching, but boundary required | Free Teaching has no recorder/STT path. V1 explicitly forbids acoustic claims from transcript text. Existing AI Coach has real recording/STT, but its evaluator still consumes transcript, so it is not reused or claimed as acoustic scoring here. |

## Existing capabilities checked but not coupled

- AI Coach profile and personalization stores are lesson/expression scoped and can track evidence dimensions, but arbitrary free-conversation phrases do not have stable curriculum IDs. Reuse now would mix course mastery with experimental chat evidence.
- `AiCoachRecorder` and the pronunciation route provide manual recording and STT for the existing coach. Free Teaching V1 remains text-first; it has no turn detection, end-of-speech detection, automatic waiting, or duplex voice.
- Azure Chinese TTS and its validation/cache path are already reusable and remain the only speech output path for this experiment.
- Free Teaching recovery currently uses browser-local recent turns, context summary, and session-local evidence. It is not account-level long-term memory.

## Minimum integration

1. Keep the same page, API route, model selection, guest/auth boundary, quota, logging, TTS allowlist, and cost accounting.
2. Add structured learner act, teaching strategy, up to two corrections, one task, session evidence, and optional wrap-up.
3. Persist only bounded session evidence in the existing Free Teaching local storage object.
4. Expose a Preview-only A/B request selector to the evaluation script; the learner UI always uses `NATURAL_V1`.
5. Do not import the course teaching state machine or mastery profile into Free Teaching.

## Explicit non-PASS items

- Acoustic pronunciation scoring: not implemented.
- Automatic speech-turn completion / waiting: not implemented.
- Real-time two-way voice: not implemented.
- Durable account-level weak-expression memory across devices: not implemented.
- Validated mastery from transfer over time: not implemented; V1 records session evidence only.
