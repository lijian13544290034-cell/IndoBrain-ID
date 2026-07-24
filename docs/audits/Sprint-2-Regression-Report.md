# IndoBrain Sprint 2 Regression Report

## Inventory comparison

| Module | Before | Added | Modified | Removed | After |
| --- | ---: | ---: | ---: | ---: | ---: |
| Driver | 40 | 0 | 0 | 0 | 40 |
| Nanny | 60 | 0 | 0 | 0 | 60 |
| Factory Manager | 50 | 0 | 50 patterns added | 0 | 50 |
| Factory roles | 99 | 20 | 119 patterns added | 0 | 119 |
| Social | 50 | 20 | 0 | 0 | 70 |
| Total | 299 | 40 | Pattern support added | 0 | 339 |

## Protection checks

- Driver, Nanny, Factory, and Social source collections remain available.
- All 339 lessons have Indonesian text, Chinese explanation, and Harvest entries.
- All 169 Factory lessons have a reusable spoken Pattern.
- All 70 Social lessons have an IndoBrain Insight.
- No placeholder text or missing Harvest entry was detected.
- Existing Azure TTS remains a shared `IndonesianSpeechButton` implementation used by Experience sentences and Harvest vocabulary.
- Pattern page remains available with its original three interactive templates.

## Existing intentional or legacy duplicates

The duplicate audit records five exact Indonesian-line groups. No new duplicate was introduced in Sprint 2. The Social `Sudah makan belum?` pair is retained because it serves different contexts: everyday greeting and cultural explanation.

