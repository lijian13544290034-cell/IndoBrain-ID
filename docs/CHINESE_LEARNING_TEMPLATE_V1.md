# Chinese Learning Engine V1 — Golden Template 01: Jumlah

This document records the frozen implementation contract for the isolated Chinese-learning demo.

## Route

- Route: `/learn-chinese`
- Exposure: isolated route only
- Homepage: unchanged
- Existing Indonesian learning modules: unchanged

## Audience

Indonesian primary-school beginners learning Mandarin Chinese.

The product mode is a school-textbook support tool. It is not a reverse copy of IndoBrain's Indonesian-learning interface.

## UI language

- Interface language: Bahasa Indonesia
- Target language: Mandarin Chinese
- Pronunciation support: Pinyin
- Meaning support: visual + Bahasa Indonesia

During the active Chinese lesson, the global bottom navigation is hidden so Chinese-learning mode stays immersive.

## Lesson

- Lesson: `Jumlah`
- Target result: child can understand, recognize, hear, and imitate:
  - `一个苹果`
  - `两个苹果`
  - `三个苹果`

Do not teach grammar theory, radicals, stroke order, classifier terminology, speech scoring, XP, leaderboards, or sharing in this template.

## Flow

Golden Template 01 implements:

1. Entry
2. Paham
3. Dengar
4. Lihat
5. Ucapkan
6. Temukan
7. Pakai
8. Aku Bisa
9. Completion

The 7-step acquisition framework is represented as a learning loop, not as a future requirement that every lesson must use identical pages.

## Data architecture

Lesson content lives in `lib/chinese-learning.ts`, separated from React UI.

Core structures:

- `ChineseVisualObject`
- `ChineseVisualState`
- `ChinesePinyinToken`
- `ChineseQuantityExpression`
- `ChinesePakaiLine`
- `ChineseGoldenLesson`

Pinyin is structured by Hanzi, base syllable, tone, display pinyin, and word block. It must not collapse into a flat string-only model.

## Visual Library V1

Visual object:

- `apple`
- renderer: `css-apple`
- quantity states: `1`, `2`, `3`

Future variables are reserved in the object model but not taught in this lesson:

- color
- size
- position
- action

## State rules

### Entry

Shows only:

- Kembali
- Jumlah
- subtitle
- 1/2/3 apple visuals
- Mulai

No Hanzi, no Pinyin, no concept counts, no XP, no global bottom nav.

### Paham

Shows only quantity change with the same apple object. No Chinese text, no Pinyin, no Indonesian number words, no audio.

### Dengar

Shows visual object and child-triggered Chinese audio only. No Hanzi, no Pinyin, no Indonesian translation, no autoplay.

### Lihat

Shows visual, Hanzi, precise Pinyin alignment, word blocks, Bahasa Indonesia support, and audio.

### Ucapkan

Shows the focused expression, audio, and a light imitation cue. No microphone and no scoring.

### Temukan

Asks `Mana yang benar?` for the missing `两个苹果`. Wrong answers receive gentle support and retry, never harsh punishment.

### Pakai

The approved dialogue is exactly:

- `你要几个？` — `Kamu mau berapa?`
- `两个。` — `Dua.`
- `给你。` — `Ini untukmu.`

Do not add greetings, extra dialogue, or grammar explanation.

### Aku Bisa

Test A: visual → Hanzi.

Test B: sound → meaning.

No Pinyin or Indonesian target translation is shown in the test choices.

### Completion

Calm success feedback:

- `Hebat!`
- `3 ungkapan Mandarin sudah kamu kuasai`

## Chinese TTS

- Endpoint: `/api/chinese-tts`
- Azure credentials: shared existing `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`
- Voice constant: `zh-CN-XiaoxiaoNeural`
- Input: Hanzi only
- Header: `X-IndoBrain-Chinese-TTS-Voice`

Do not create `CHINESE_AZURE_SPEECH_KEY` or `CHINESE_AZURE_SPEECH_REGION`.

Existing Indonesian TTS remains:

- Endpoint: `/api/tts`
- Voice: `id-ID-GadisNeural`

## Verification

`npm run verify:chinese-learning` must check:

- route wiring
- complete lesson state flow
- apple visual states
- Hanzi content
- Pinyin token alignment
- tone values
- word-block grouping
- Hanzi-only TTS input
- no pinyin-as-TTS
- Dengar text hidden
- Lihat text/alignment visible
- Pakai exact dialogue
- Aku Bisa support removed from tests
- Chinese TTS shared Azure config
- Indonesian TTS unchanged

`npm run verify:indobrain` must remain PASS.
