# Developer Standards

Version: v1.0

## Purpose

Define the baseline engineering standards for IndoBrain.

## Principles

- Keep the MVP small, readable, and testable.
- Prefer simple solutions over premature abstraction.
- Keep provider credentials on the server and outside source control.
- Preserve existing Experience content when making UI or data changes.
- Add verification for every user-facing change.

## Code Standards

- Use TypeScript for application code.
- Use clear names that describe intent.
- Keep components focused on one responsibility.
- Keep business logic independent from AI provider implementations.
- Use environment variables for external services.

## Quality Checks

- Run the production build before delivery.
- Check mobile layouts for primary pages.
- Verify empty and unconfigured states.
- Do not commit secrets, local environment files, or generated credentials.

## Change Discipline

- Limit each sprint to its defined scope.
- Do not modify unrelated files.
- Record user-visible changes in the changelog.
