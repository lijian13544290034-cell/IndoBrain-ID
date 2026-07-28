# IndoBrain V2 Commercial Account Architecture

## Scope

This foundation adds phone-and-password accounts, server-side sessions, membership authorization, a single active device policy, learning direction preferences, role-based administrator operations, login history, and online status. It does not change learning content, Azure TTS, existing modules, payment, or production deployment.

## Layers

1. **Next.js account routes** provide login, account profile, and administrator pages.
2. **Route Handlers** validate requests, enforce server-side sessions, and evaluate membership and administrator permissions.
3. **Account domain layer** owns password hashing, session token hashing, phone normalization, and database access.
4. **Supabase PostgreSQL** stores normalized account, device, session, membership, permission, organization, and audit data.

The browser never receives a service key, password hash, or membership decision authority. Account sessions use an opaque, random HttpOnly cookie. Only its SHA-256 digest is stored in the database.

## Future Compatibility

- `learning_direction` supports both Chinese-to-Indonesian and Indonesian-to-Chinese UI directions while using the same content base.
- `membership_plans` and `membership_permissions` keep entitlement rules in data rather than frontend conditionals.
- `roles`, `role_permissions`, and `user_roles` support Super Admin, Admin, Reviewer, and User without client-side authorization rules.
- `login_history` and session `last_seen_at` support security review, online users, active today, active seven days, and multi-platform presence.
- `account_activity_events` and `account_scene_contributions` provide database-backed daily commercial metrics and a review queue without changing existing learning data.
- `organizations` and `organization_members` reserve a normalized enterprise path.
- `register_source` and `referrer_user_id` reserve acquisition and referral tracking.
- The session and API boundaries work for web, mobile, and future AI services.

## Required Environment Variables

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ACCOUNT_SESSION_SECRET=
```

`ACCOUNT_SESSION_SECRET` is reserved for future signed session metadata. The current opaque-token design does not expose it to the client. Do not set any of these variables with a `NEXT_PUBLIC_` prefix except the Supabase URL.

`AUTH_REQUIRED=false` is the safe rollout default. Existing public learning routes remain unchanged until an authorized release explicitly enables it in a non-production environment and completes QA. It must remain false in Production until approval.

## Bootstrap

1. Run `docs/commercial-account-schema.sql` in the target Supabase project.
2. Run `docs/migrations/20260727_account_security_and_local_migration.sql` when applying to an already-created non-production test project.
3. Run the local bootstrap script with non-production credentials to create the first user and assign `SUPER_ADMIN`.
4. Use `/admin` to create and manage subsequent users.
5. Keep the service role key server-only in local environment files or hosting provider settings.

## Security Decisions

- Passwords use salted Node.js `scrypt` hashes.
- Password reset invalidates all existing server sessions.
- Device unbind invalidates all server sessions before the next device is bound.
- Suspended accounts cannot start sessions.
- Five failed password attempts within fifteen minutes create a fifteen-minute server-side lock.
- Every administrator mutation writes an audit event.
- Membership and administrator checks execute in server-side route handlers.

## Existing Local Learning Data Migration

After a customer signs in, the account page detects the existing `indobrain_learning_profile_v1` value on that device. It asks the customer before sending any data. On approval, the server stores an immutable, user-scoped import keyed by a SHA-256 payload hash, so the same source is never imported twice. Imported scene submissions are created once in the server-side review queue. The browser localStorage is never cleared or altered; a failed import leaves it untouched. The initial import preserves favorites, completed experiences, streak values, and scene contributions as an auditable snapshot for later normalized synchronization.
