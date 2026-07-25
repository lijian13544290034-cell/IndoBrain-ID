# IndoBrain Local Feature Report — About Me, Favorites and Scene Co-Creation

## Scope and branch

- Branch: `codex/about-me-favorites`
- Local-only implementation. No push, Preview deployment, or Production deployment was performed.

## Storage strategy

The project has anonymous sessions and optional Supabase event writes, but no authenticated user model or confirmed production database identity for profile data. This sprint therefore uses an isolated local-first schema in browser `localStorage`:

- favorites
- completed Experience IDs
- `lastLearningDate`, `currentStreak`, and `longestStreak`
- Scene Co-Creation submissions, including future-ready `helpedUserCount`

The schema is kept in `lib/learning-profile.ts` so it can later be replaced with server persistence keyed by a user or anonymous session. Data persists after refresh on the same browser but does not sync across devices.

## Implemented

- The footer entry formerly labeled Pattern practice is now `Tentang Saya（关于我）` and opens `/about`.
- About Me shows only Favorites, consecutive learning days, completed Experiences, and My Contributions.
- Every Experience has Copy, Favorite, and Scene Co-Creation as its bottom actions. Helpful / Not Helpful actions were removed.
- A separate completion action records an Experience once; views do not count as completion.
- Favorite records are unique and toggle on/off.
- Dynamic completed total comes from the current server-side content catalog: 360 available Experiences in this local build.
- Scene Co-Creation records source Experience ID, inferred module, timestamp, anonymous local browser identity via the existing session layer, `pending` status, and future-ready `helpedUserCount`.

## Analytics

Safe events are sent through the existing event endpoint where configured: `experience_copied`, `experience_favorited`, `experience_unfavorited`, `experience_completed`, `scene_cocreation_opened`, `scene_cocreation_submitted`, and `audio_played`.

There is no dedicated analytics provider in this sprint. If Supabase event storage is not configured, events are safely discarded and do not block the local-first features.

## Local QA

- About Me, Driver, Nanny, Factory Manager, Factory role, Life, Basics, and Pattern routes: HTTP 200 locally.
- Favorite toggle, refresh persistence, duplicate prevention, original link, copy action, and removal: passed.
- Completion counts once and persists after refresh: passed.
- First valid action creates a 1-day streak; additional same-day actions do not increase it: passed.
- Scene Co-Creation required fields, local persistence, pending status, and source Experience context: passed.
- Responsive no-overflow check for `/about`: 320, 375, 390, 414, 768, 1024, and 1366 px: passed.
- Azure controls are intentionally unavailable locally when Azure variables are absent; existing production audio code was preserved and no browser speech synthesis was introduced.

## Automated checks

- TypeScript: passed as part of `npm run build`.
- Production build: passed locally.
- No separate automated test command is defined in `package.json`.

## Known limitations

- Favorites, progress, and contributions are local to a browser/device.
- Contributions are stored locally and do not yet reach a review queue.
- Streak date behavior uses the browser's local calendar date.
