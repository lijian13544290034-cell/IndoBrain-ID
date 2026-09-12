# Security Checklist — Commercial Accounts

- [ ] Passwords are salted hashes only.
- [ ] Session tokens are random, hashed at rest, HTTP-only, and revocable.
- [ ] Membership and role authorization run on the server.
- [ ] Browser code has no service-role key or permission decision.
- [ ] Suspended, deleted, and expired accounts cannot authenticate or access protected learning routes.
- [ ] Device unbinding revokes active sessions.
- [ ] Login attempts are rate limited and recorded.
- [ ] Admin operations create audit entries.
- [ ] Production secrets are stored in deployment environment settings only.
