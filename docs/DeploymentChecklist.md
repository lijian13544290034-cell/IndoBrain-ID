# Deployment Checklist

## Before Deployment

- [x] Production build passes.
- [x] `.env.example` is present.
- [x] No API key is stored in source code.
- [ ] Vercel account is authenticated.
- [ ] Supabase schema is applied.
- [ ] Production environment variables are set in Vercel.

## Before Public Access

- [ ] Home, Driver, ART, Factory, Chat, and Pattern are verified on production.
- [ ] AI Provider Adapter is verified with the selected provider.
- [ ] Anonymous Supabase writes are verified.
- [ ] Mobile browser testing is complete.
- [ ] Canonical Experience content is reviewed.

## After Deployment

- [ ] Record the public Vercel URL.
- [ ] Run the Public Beta Checklist.
- [ ] Record the deployment date and owner.
