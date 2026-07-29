# Production Checklist — Commercial Accounts

- [ ] Human Preview acceptance completed.
- [ ] Production Supabase migration reviewed and applied from a backup-approved change window.
- [ ] Production environment contains server-only account keys; no service key is public.
- [ ] `AUTH_REQUIRED` rollout decision approved.
- [ ] At least one Super Admin bootstrap account is stored securely and tested.
- [ ] Phone + password login, session, logout, device restriction, expiry, suspension, and recovery verified.
- [ ] Admin role permissions and audit records verified.
- [ ] Existing learning modules, Azure TTS, Favorites, About Me, and Scene Co-Creation pass smoke tests.
- [ ] Rollback owner and rollback commit are documented.
