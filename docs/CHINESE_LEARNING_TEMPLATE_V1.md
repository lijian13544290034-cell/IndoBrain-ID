# Chinese Learning Template V1

Status: Template demo only. Not exposed from the homepage. Production release is not part of this task.

## Product philosophy

For Indonesian learners, IndoBrain Chinese learning follows:

Visual / real meaning → Chinese sound → Hanzi → pinyin → Indonesian support → real use.

Indonesian is support text. It should help the learner confirm meaning, but it should not become the main learning object.

This is not a mechanical reversal of the Indonesian-learning module.

## Demo scope

Route:

`/learn-chinese`

Category:

`基础中文 / Bahasa Mandarin Dasar`

Subcategory:

`数量 / Jumlah`

The first demo keeps the object stable: apple. The visual variable is quantity.

## Runtime schema

Implemented in:

`lib/chinese-learning.ts`

Core types:

- `ChineseConcept`
- `ChineseLearningGroup`
- `ChineseRealUse`
- `ChineseRealUseItem`

Each `ChineseLearningGroup` has exactly one `realUseId`.

Real Use supports the same abstraction proven in Basic Essentials:

- `phrase`
- `sentence`
- `micro_scene`

V1 uses phrase Real Use because quantity learning is more natural as short phrases than as a forced dialogue.

## UI hierarchy

Implemented in:

`components/ChineseLearningExperience.tsx`

Visual priority:

1. Visual meaning
2. Hanzi
3. Chinese audio
4. Pinyin
5. Indonesian support

The UI intentionally avoids:

- large grammar explanations
- long pinyin paragraphs
- internal labels like `realUseId` or `conceptIds`
- childish decoration

## TTS architecture

Chinese TTS is separated from the existing Indonesian TTS.

Existing Indonesian TTS remains:

- Route: `/api/tts`
- Voice: `id-ID-GadisNeural`
- Env: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`

Chinese TTS V1 uses:

- Route: `/api/chinese-tts`
- Voice: `zh-CN-XiaoxiaoNeural`
- Azure credentials: shared existing `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`
- Component: `components/ChineseSpeechButton.tsx`

The Chinese voice is isolated behind a single code constant so it can be replaced later without changing the route, data model, or Indonesian TTS provider.

Chinese TTS input must be Hanzi, not pinyin. Browser fallback only runs when a Chinese / Mandarin voice is detected. It fails closed instead of using a non-Chinese default voice.

## Visual model

The first visual model uses simple CSS-rendered apple shapes. No generated images are required.

The schema keeps `visualKey` and `visual` separate so future lessons can upgrade visuals for:

- objects
- actions
- positions
- quantity
- size
- color
- feelings
- people
- food
- home
- transport

## Demo data

Concept count: 11

Learning groups: 2

Real Use units: 2

Real Use items: 7

Group 1:

- 一
- 两
- 三
- 个
- 苹果

Real Use:

- 一个苹果
- 两个苹果
- 三个苹果

Group 2:

- 几个
- 一些
- 很多
- 所有
- 少
- 多
- 苹果

Real Use:

- 几个苹果？
- 一些苹果
- 很多苹果
- 所有苹果

## Verification

Script:

`npm run verify:chinese-learning`

Integrated into:

`npm run verify:indobrain`

The verifier checks:

- Chinese concepts are valid
- Hanzi exists
- pinyin exists and uses tone marks rather than tone numbers
- Indonesian support exists
- TTS text exists
- no duplicate IDs
- learning group bindings are valid
- exactly one Real Use per group
- Real Use references are valid
- Chinese TTS route is separate
- existing Indonesian TTS route and `id-ID-GadisNeural` are preserved

## Future extension path

Future Chinese lessons can add new categories and groups without changing the UI:

- objects
- colors
- size
- position
- action
- feelings
- people
- home
- transport

Adult or business-oriented content can reuse the same schema and route pattern with different content and presentation emphasis.
