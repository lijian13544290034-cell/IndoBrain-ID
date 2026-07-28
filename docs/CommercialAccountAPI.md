# IndoBrain V2 Commercial Account API

All endpoints are same-origin JSON route handlers. Administrator endpoints require an authenticated administrator session.

## Controlled Auth Rollout

When `AUTH_REQUIRED=false`, the middleware is a no-op and every current public learning route behaves exactly as it does today. When an approved non-production environment sets `AUTH_REQUIRED=true`, middleware validates the opaque session server-side, verifies account status and expiry, then checks the database-backed `learning.access` permission before allowing access. A missing or invalid session redirects to `/login`. Production must stay false until explicit approval.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Phone/password login; establishes an HttpOnly server session. |
| `POST` | `/api/auth/logout` | Removes the browser session cookie. |
| `POST` | `/api/auth/change-password` | Changes the current user password and invalidates other sessions. |
| `POST` | `/api/auth/presence` | Refreshes the current server session activity timestamp. |
| `GET` | `/api/admin/stats` | Returns administrator dashboard metrics. |
| `GET` | `/api/admin/users?query=` | Searches up to 100 users by phone or IndoBrain ID. |
| `POST` | `/api/admin/users` | Creates a user and the administrator-created initial password. |
| `PATCH` | `/api/admin/users/:userId` | Resets password, changes membership, extends membership, suspends/reactivates, unbinds device, or changes learning direction. |
| `GET` | `/api/admin/login-history?userId=` | Returns server-recorded successful and failed login history. |

## Login Request

```json
{ "phone": "+628123456789", "password": "ExamplePassword123", "deviceId": "browser-device-id" }
```

The phone is normalized and validated to E.164 format. When the device differs from the active binding, the request is rejected. An administrator must explicitly unbind the device before login can continue.

## Membership Authorization

Routes must query `membership_permissions` server-side for entitlement checks. Frontend labels may display a plan, but must never authorize content, features, or administrative actions.
