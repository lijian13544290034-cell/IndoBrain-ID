# Public Beta Checklist

Date: 2026-07-12

## Build Status

- [x] Production build completes successfully.
- [x] Home, Factory, Pattern, Chat, API, and Experience routes are generated or resolved.
- [x] No deployment was performed.

## Product Surfaces

### Home

- [x] Four entry points are present: Sopir, ART, Pabrik, and Chat Bebas.
- [x] Pattern entry is available from the MVP navigation.

### Driver

- [x] Experience list and detail routes are available.
- [x] Previous and next navigation is available.
- [x] Copy and feedback actions are available.
- [ ] Canonical Driver source content should be reviewed before public testing.

### Nanny

- [x] Experience list and detail routes are available.
- [x] Previous and next navigation is available.
- [x] Copy and feedback actions are available.
- [ ] Canonical ART source content should be reviewed before public testing.

### Factory

- [x] Factory Manager Experience pages are available through Experience 050.
- [x] Workflow, copy, feedback, and navigation are available.
- [ ] Other Factory roles remain intentionally marked as Coming Soon.

### Chat

- [x] Driver, ART, Factory, and Free Chat modes are available.
- [x] AI Provider Adapter keeps provider-specific code outside business pages.
- [x] Missing credentials return a safe `AI Provider Not Configured` state.
- [ ] Test at least one real response after configuring a production provider key.

### Pattern

- [x] Three initial sentence templates are available.
- [x] Variables update the generated Indonesian sentence.
- [x] Generated Indonesian can be copied.

## Responsive Layout

- [x] Primary pages use mobile-first width, spacing, and grid classes.
- [ ] Complete manual testing on a physical phone before inviting public users.
- [ ] Check browser copy permission behavior on iOS and Android.

## Error Handling

- [x] Invalid module and Experience routes use the Next.js not-found behavior.
- [x] Chat remains usable when an AI Provider is not configured.
- [x] Supabase event and feedback requests safely degrade when configuration is absent.
- [ ] Add production error monitoring after the first beta feedback cycle.

## Environment Variables

- [x] `.env.example` lists AI Provider and Supabase variables.
- [x] Provider API keys are server-side only.
- [x] Supabase service-role key is server-side only.
- [ ] Create `.env.local` for local testing.
- [ ] Configure the same required variables in Vercel before deployment.

## Supabase Readiness

- [x] Schema is available in `docs/supabase-schema.sql`.
- [x] Tables cover conversations, Experience events, feedback, and learning progress.
- [ ] Run the schema in the target Supabase project.
- [ ] Confirm database access policies and retention expectations before public data collection.
- [ ] Verify a real anonymous conversation, event, feedback, and learning-progress write.

## Deployment Readiness

- [x] Next.js production build passes.
- [x] The project is structured for Vercel deployment.
- [ ] Configure the selected AI Provider.
- [ ] Configure Supabase and run the schema.
- [ ] Complete mobile browser testing.
- [ ] Complete canonical Driver and ART Experience content review.
- [ ] Obtain approval before connecting a production Vercel project.

## Public Beta Decision

Current status: **Not ready to deploy yet.**

The application is build-ready, but production credentials, Supabase verification, mobile validation, and final Driver/ART content review remain required beta gates.
