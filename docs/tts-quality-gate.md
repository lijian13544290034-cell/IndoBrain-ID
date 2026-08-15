# IndoBrain TTS Quality Gate

This rule applies to every Golden Scene, Experience dialogue, short phrase, template, learning card, or UI block that uses `IndonesianSpeechButton`, `听一听`, or IndoBrain TTS.

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
- primary voice: the existing Azure Indonesian voice configured in production;
- no Chinese voice for Indonesian text;
- no English voice for Indonesian text;
- no default browser/system voice unless it is explicitly Indonesian / `id-ID`.

If browser fallback cannot find a voice whose language/name clearly matches `id-ID`, `id`, `Indonesian`, or `Indonesia`, it must show `语音暂不可用`.

Wrong-language audio is worse than no audio.

## Call priority

1. Primary: existing `/api/tts` + Azure Speech.
2. Fallback: browser `speechSynthesis`, only when an Indonesian voice is explicitly detected.

The browser fallback must not use the system default voice as Indonesian.

## Startup self-check

Local development and review sessions must make the TTS state visible:

- `Azure TTS: Ready`
- `Azure TTS: Not configured`
- `Browser Indonesian voice: Ready`
- `Browser Indonesian voice: Not available`
- `TTS REAL AUDIO: BLOCKED`

If Azure is not configured and there is no Indonesian browser voice, no scene may be reported as fully ready for human review.

## Production secret safety

After explicit user approval, production values may be pulled only for localhost review:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

Rules:

- never output the full key;
- never write the key to logs;
- never commit `.env.local` or any secret file;
- never modify production secrets while doing local review;
- never write secrets into source code or scene data.

`.env.local` and other `.env*` files must remain ignored by Git.

## Golden Scene review minimum

For each Golden Scene batch:

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

Never write: "button is integrated, therefore TTS PASS."
