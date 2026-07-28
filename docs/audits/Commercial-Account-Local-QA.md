# IndoBrain V2 Commercial Account Foundation — Local QA

Date: 2026-07-27  
Scope: Commercial account foundation only. Existing learning modules, homepage layout, TTS, Harvest, Pattern, Favorites, About Me, and Scene Co-Creation were not modified.

## Static Checks

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | PASS |
| Production build (`npm run build`) | PASS |
| Password storage | PASS — salted Node.js `scrypt` hashes only |
| Session storage | PASS — opaque HttpOnly cookie; SHA-256 token digest stored server-side |
| Membership authorization boundary | PASS — server-only permission lookup is available; no frontend authorization logic |
| Role authorization boundary | PASS — `SUPER_ADMIN`, `ADMIN`, `REVIEWER`, and `USER` resolve through database permissions in server routes |
| Single-device policy | PASS — active device ID is checked at login; administrator unbind revokes sessions and device binding |
| Login history | PASS — schema and server routes capture successful/failed logins, device, browser, operating system, IP, country, logout, and duration |
| Online status | PASS — session heartbeat supports online-now, active-today, active-seven-days, and last-login metrics |

## Local Route Checks

| Route | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/driver` | HTTP 200 |
| `/nanny` | HTTP 200 |
| `/factory` | HTTP 200 |
| `/life` | HTTP 200 |
| `/patterns` | HTTP 200 |
| `/login` | HTTP 200; UI inspected; no console errors |
| `/account` without a session | HTTP 307 → `/login` |
| `/admin` without a session | HTTP 307 → `/login` |
| `POST /api/auth/login` without Supabase configuration | HTTP 503 with a controlled configuration message |

## Database-dependent QA — Pending Supabase Sign-in

The repository intentionally has no local Supabase service role credentials. The Supabase dashboard is currently at its sign-in screen. Full create/login/admin mutation tests require a dedicated non-production project, applying `docs/commercial-account-schema.sql`, and creating a `SUPER_ADMIN`. No Preview or Production deployment was created.

## Manual Local Test Script

1. Add a non-production Supabase URL and server role key to `.env.local`.
2. Apply `docs/commercial-account-schema.sql`.
3. Run `node scripts/create-super-admin.mjs <phone> <password>` with non-production environment variables to create the first `SUPER_ADMIN`.
4. Run the local app and sign in at `/login` with an E.164 phone number.
5. Open `/admin`; create a user; search by phone and `IB` ID.
6. Reset the user password, change membership, set expiry, suspend/reactivate, and unbind device.
7. Verify a second device is rejected until the administrator unbinds the first.
8. Confirm password change invalidates existing sessions.
9. Confirm failed credentials, expired memberships, suspended accounts, device conflicts, and successful sessions each appear in Login History.
10. Confirm the heartbeat changes Online Now and that Active Today / Active 7 Days are retained after logout.

## Deployment Status

Local implementation and local QA complete. Preview: not created. Production: unchanged.

## 2026-07-28 Final Non-Production E2E Result

The dedicated `IndoBrain-Test` project was used exclusively. Generated QA
accounts and passwords were used for every test and no credentials are stored
in this document, source control, or application logs.

| Area | Result |
| --- | --- |
| Schema and migration | PASS — account schema, security/local-data migration, metrics, and review queue are present |
| Database permissions | PASS — `service_role` has server-only schema/table/sequence access; RLS remains enabled for browser clients |
| SUPER_ADMIN | PASS — bootstrap, sign-in, stats access, user creation, password reset, membership changes, suspend/reactivate, and device unbind verified |
| ADMIN | PASS — role assignment, sign-in, and user creation verified; assigning a privileged role is correctly rejected with HTTP 403 |
| USER | PASS — E.164 phone/password sign-in verified |
| Password lifecycle | PASS — changed/reset temporary password works; prior password is rejected with HTTP 401 |
| Single device | PASS — a second device is rejected with HTTP 409 until an administrator unbinds the device |
| Sessions | PASS — heartbeat returns HTTP 200 while signed in; logout revokes the session; subsequent heartbeat returns HTTP 401 |
| Login history | PASS — successful and failed sign-ins are recorded and administrator history endpoint returns HTTP 200 |
| Online status | PASS — server-side statistics returned five active QA sessions during the final run |
| Membership permissions | PASS — all five plans have the server-side `learning.access` permission record |
| Local data migration | PASS — first import succeeds; identical re-import succeeds as a no-op |
| TypeScript | PASS — `npx tsc --noEmit` |
| Production build | PASS — `npm.cmd run build` completed successfully |

## Learning Regression Matrix

All of the following local routes returned HTTP 200: `/`, `/driver`,
`/driver/001`, `/driver/essentials`, `/nanny`, `/nanny/001`,
`/nanny/essentials`, `/factory`, `/factory/manager`, `/factory/manager/001`,
`/module/warehouse`, `/module/qc`, `/life`, `/life/001`, `/life/basics`,
`/life/basics/numbers`, `/life/essentials`, `/patterns`, `/chat/driver`, and
`/about`.

The Essentials search implementation remains client-side and unchanged. Azure
Speech credentials are intentionally absent from this local test environment,
so `/api/tts` returns its controlled HTTP 503 configuration response. The
existing audio implementation was not changed and must be rechecked with Azure
credentials before any Preview is created.

## 2026-07-27 Integration Update

### Completed Against the Dedicated Non-Production Database

- Dedicated project: `indobrain -test` (`axsyhtrkqszdetpvoldh`).
- The account schema, security/local-migration delta, and metrics/review-queue tables were applied successfully.
- RLS was verified for users, sessions, login history, login-attempt counters, local-data imports, activity events, and scene contributions.
- First test administrator: `IB000002` with `SUPER_ADMIN` role. Its password exists only in the temporary local test session and is never stored in source, Git, logs, or this report.
- Server-side login rate limiting was verified; the temporary test counter was removed afterward.
- TypeScript passed. The Next.js production build generated its build artifact.

### Remaining Local E2E Prerequisite

The repository has no `.env.local` and the current local process has no Supabase service-role credential. To run browser/API end-to-end tests safely, add only the **non-production** project values to the ignored `.env.local` file:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://axsyhtrkqszdetpvoldh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_non_production_service_role_key
AUTH_REQUIRED=false
```

Do not commit this file. After that, run the complete login, password, device-binding, membership, suspension/recovery, logout, local-data migration, administrator authorization, and responsive UI test matrix. No Preview or Production deployment has been created.

## Authentication-Enforced Regression Fix

### Root cause

The account routes were correct. Next.js 16.2.10's default Turbopack
development server failed to register the local account Route Handlers when
`AUTH_REQUIRED=true`, returning HTTP 404. The same source code under Webpack
development mode returned the expected API responses immediately. This was a
local development-server bundler issue, not an RLS, Supabase, or account logic
failure.

### Fix and verification

- The local `dev` script now explicitly uses `next dev --webpack`.
- The access guard uses the current Next.js 16 `proxy.ts` convention.
- In authentication-enforced Webpack mode: administrator, user, session,
  protected-page, suspension, expiry, extension, logout, and permission checks
  passed.
- In local production mode: anonymous `/driver` returns HTTP 307 to `/login`
  and `POST /api/auth/login` returns HTTP 401 for invalid credentials — proving
  the API route is present instead of returning HTTP 404.

## Preview Gate

**Ready for human Preview QA.** Local TypeScript, production build, normal
learning-route regression, and authentication-enforced E2E have passed. No
Preview was created and Production remains unchanged.
