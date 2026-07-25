# IndoBrain Sprint 2.1 — Life Module QA

## Scope

- Social is upgraded to the user-facing **Life（生活）** module.
- Existing Friends content is retained with its original `EXP-SOC-001` to `EXP-SOC-070` IDs.
- New Life content uses `EXP-LIF-071` to `EXP-LIF-103`.

## Categories

| Category | Chinese | Lessons |
| --- | --- | ---: |
| Teman | 朋友 | 70 |
| Dasar | 基础 | 12 |
| Supermarket | 超市 | 10 |
| Restoran | 餐厅 | 11 |

## Content integrity

- Life lessons: 103
- All Life lessons include a Chinese title, spoken Indonesian, Chinese explanation, Harvest, and reusable Pattern.
- Experience pages use the shared Azure Indonesian TTS button through `ExperienceDetail`.
- No placeholder or missing Harvest entry was found.
- The duplicate scan found no new duplicate Chinese title, Indonesian sentence, or complete Harvest set.

## Compatibility and regression protection

- `/life`, `/life/[id]`, and `/life/essentials` are the new public routes.
- `/social`, `/social/[id]`, and `/social/essentials` redirect to the equivalent Life route.
- Driver, Factory, and Nanny files were not modified in this sprint.

## Build verification

- `npm run build`: passed.
- Life routes are included in the production route manifest.

