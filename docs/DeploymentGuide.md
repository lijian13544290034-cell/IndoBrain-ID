# Vercel Deployment Guide

## Prerequisites

- A Vercel account with access to the target project.
- A Supabase project with the IndoBrain schema applied.
- One configured AI provider, or an intentional unconfigured beta mode.

## Environment Variables

Copy `.env.example` to `.env.local` for local development. Add the same required values in Vercel Project Settings before deployment.

Do not place any API key in source code, client-side variables, screenshots, or documentation.

## Deploy

1. Sign in to Vercel using the project owner account.
2. Import the IndoBrain repository or run the Vercel CLI from the project root.
3. Set the production environment variables.
4. Confirm the Next.js framework preset.
5. Deploy to production.
6. Run the Public Beta Checklist against the production URL.

## Post-Deployment Verification

- Open Home, Driver, ART, Factory, Chat, and Pattern pages.
- Verify an unconfigured AI provider shows the safe status message.
- Verify configured AI replies remain server-side.
- Verify anonymous events, feedback, and conversations reach Supabase.
- Test mobile browser behavior.
