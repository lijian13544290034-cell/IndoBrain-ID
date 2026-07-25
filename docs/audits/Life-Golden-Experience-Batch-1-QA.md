# Life Golden Experience Batch 1 — QA

## Before / after inventory

- Driver: 40 lessons — unchanged.
- Nanny: 60 lessons — unchanged.
- Factory Manager: 50 lessons — unchanged.
- Factory role lessons: 119 — unchanged.
- Friends: 70 retained Social lessons.
- Life Golden Experiences: 21 retained scene-based lessons (10 Supermarket, 11 Restaurant).
- Life Basics: moved from 12 lesson-shaped entries to four reference sections with 83 bilingual, audio-ready items.

## Duplicate audit

The repository audit found no placeholders, no lessons without Harvest, and no Life lessons without a reusable Pattern. Existing cross-module duplicates remain documented in `Sprint-2-Duplicate-Report.md`; none were introduced by this batch.

## Golden Experiences

- Supermarket: `EXP-LIF-083` through `EXP-LIF-092` — 10 focused purchase and checkout situations.
- Restaurant: `EXP-LIF-093` through `EXP-LIF-102` — 10 focused ordering and payment situations.
- `EXP-LIF-103` is retained as the existing restaurant compliment lesson.

Each new/updated Golden Experience has Chinese source text, Indonesian dialogue, a Chinese explanation, Harvest terms taken from its dialogue, and a reusable Pattern.

## Basics coverage

- Numbers: 1–19, tens, 21 construction, hundreds, thousands, and common large amounts.
- Time: daily time words, clock times, durations, and the `jam setengah empat` convention.
- Money: Indonesian rupiah amounts and practical payment expressions including QRIS.
- Directions: position, turning, entering, exiting, crossroads, and relative locations.

Every Basics entry uses the existing `EssentialItemCard` and shared `IndonesianSpeechButton`; no browser speech synthesis was added.

## Functional and responsive QA

- Production build: passed.
- Local routes: `/life`, `/life/basics`, all four Basics topics, legacy `/life/071`, Supermarket, Restaurant, Driver, Factory, and Nanny: HTTP 200.
- Legacy Basics IDs `071`–`082` redirect to their corresponding reference category.
- Responsive no-overflow check: 320, 375, 390, 414, 768, 1024, 1366, 1440, and 1920 px: passed for the Numbers reference page.
- Local audio controls are intentionally hidden without Azure environment variables; production audio is verified after deployment.

## Regression scope

No Driver, Factory, or Nanny source files were modified.
