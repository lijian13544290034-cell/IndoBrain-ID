# V2.0 Student Account Batch Management

## Environment

Set `INITIAL_STUDENT_PASSWORD` only in the development Preview environment. It must meet the existing policy: at least 10 characters and include letters and numbers. `123456` is not valid under this policy.

The value is read only on the server when a Super Admin confirms a bulk import or resets a student password. It is not returned by API routes, stored in audit metadata, written to logs, or committed to Git.

## Import template

Use the protected template endpoints from `/admin`:

- `name`
- `phone` — international E.164 format, for example `+628123456789`
- `learningDirection` — `ZH_TO_ID` or `ID_TO_ZH`
- `membershipStatus` — `BASIC`, `PRO`, `VIP`, `ENTERPRISE`, or `SVIP`
- `membershipExpiresAt` — optional ISO date/time

CSV and XLSX are accepted. Files are limited to 2 MB and 500 data rows. Existing accounts and duplicate phone numbers are skipped; existing passwords and learning records are never overwritten.

## Required migration

Run `docs/migrations/20260731_bulk_student_account_management.sql` in the non-production Supabase project before testing this version. Do not run it in Production.
