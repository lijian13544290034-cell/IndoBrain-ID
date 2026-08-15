# IndoBrain TTS Quality Gate

This rule applies to every Golden Scene, Experience dialogue, short phrase, template, learning card, or UI block that uses `IndonesianSpeechButton`, “听一听”, or IndoBrain TTS.

## Architecture rule

TTS is a platform-level shared capability.

- All Golden Scenes must use the existing shared `IndonesianSpeechButton`.
- All real audio requests must go through the existing `/api/tts` route.
- No Golden Scene batch may implement its own TTS provider, key handling, speech route, or per-batch voice config.
- Golden Scene content work must not be blocked by missing localhost Azure secrets.

Production primary TTS is Azure Speech with the official Indonesian voice:

`id-ID-GadisNeural`

## PASS standard

Never mark TTS as PASS only because:

- the component exists;
- the button exists;
- the API route exists;
- TypeScript passes;
- the production build passes;
- some sound plays but the language is wrong.

TTS may be marked `PASS` only when a real user click produces real Indonesian audio for the exact Indonesian text attached to that button.

## Correct voice standard

Indonesian audio must use:

- language: `id-ID`;
- primary voice: `id-ID-GadisNeural`;
- no Chinese voice for Indonesian text;
- no English voice for Indonesian text;
- no default browser/system voice unless it is explicitly Indonesian / `id-ID`.

If browser fallback cannot find a voice whose language/name clearly matches `id-ID`, `id`, `Indonesian`, or `Indonesia`, it must show:

`语音暂不可用`

Wrong-language audio is worse than no audio.

## Call priority

1. Primary: existing `/api/tts` + Azure Speech.
2. Fallback: browser `speechSynthesis`, only when an Indonesian voice is explicitly detected.

The browser fallback must not use the system default voice as Indonesian.

## Local development rule

If localhost does not have `AZURE_SPEECH_KEY`, do not mark Golden Scene content development as blocked.

Record:

`LOCAL_AZURE_TTS: NOT CONFIGURED`

Then continue content development and content/component review.

Do not export Vercel Production Sensitive Secrets just to unblock a Golden Scene batch.

## Startup self-check

Local development and review sessions must make the TTS state visible:

- `Azure TTS: Ready`
- `Azure TTS: Not configured`
- `Browser Indonesian voice: Ready`
- `Browser Indonesian voice: Not available`
- `TTS REAL AUDIO: BLOCKED`

If Azure is not configured and there is no Indonesian browser voice, the scene can still enter content review, but it must not be reported as `TTS Real Audio: PASS`.

## Permanent smoke test

IndoBrain keeps one fixed Indonesian smoke-test sentence:

`Selamat pagi, hari ini kita belajar bahasa Indonesia.`

The smoke test must verify:

- `/api/tts` responds correctly when Azure is configured;
- `Content-Type` is audio for successful TTS;
- `X-IndoBrain-TTS-Voice` is `id-ID-GadisNeural`;
- Azure unavailable fails closed with `503`;
- no wrong-language browser fallback is allowed.

## Production secret safety

Do not export Vercel Production Sensitive Secrets for routine Golden Scene content development.

After explicit user approval, production values may be used only for a dedicated secure real-audio integration review:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

Rules:

- never output the full key;
- never write the key to logs;
- never commit `.env.local` or any secret file;
- never modify production secrets while doing local review;
- never write secrets into source code or scene data.

`.env.local` and other `.env*` files must remain ignored by Git.

## Golden Scene review layers

Golden Scene TTS review has two separate layers.

### A. Content / component review

This can pass without localhost Azure secrets when:

- Indonesian text is correctly passed into `IndonesianSpeechButton`;
- all approved “听一听” buttons exist;
- the button text matches the Indonesian text it should speak;
- no Chinese text is sent to TTS;
- wrong-language browser fallback is blocked.

Passing this layer means the Golden Scene can enter human content review.

### B. Real Audio integration review

This must happen in a secure environment that has Azure Speech variables configured.

Confirm:

- real sound;
- Indonesian language;
- exact text;
- no sentence mixing;
- no previous line replay;
- voice is `id-ID-GadisNeural`.

This layer does not require each Golden Scene batch to re-export or reconfigure Azure secrets.

## Golden Scene real-audio minimum

When Real Audio integration review is in scope:

- every scene must have at least 3 different Indonesian expressions clicked and heard;
- confirm real sound;
- confirm Indonesian language;
- confirm exact text;
- confirm no sentence mixing;
- confirm no Chinese text is sent to TTS;
- confirm no previous line is replayed;
- confirm no wrong voice is used.

Any failure makes that scene:

`TTS Real Audio: FAIL`

## Required report fields

Every Golden Scene handoff report must separate:

- `Content: PASS / FAIL`
- `Interaction: PASS / FAIL`
- `TTS Code Integration: PASS / FAIL`
- `TTS Real Audio: PASS / FAIL`
- `Build: PASS / FAIL`
- `Human Review Ready: YES / NO`

Never write: “button is integrated, therefore TTS PASS.”
