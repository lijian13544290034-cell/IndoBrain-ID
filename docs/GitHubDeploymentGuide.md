# GitHub and Vercel Dashboard Deployment Guide

## 1. Create a GitHub Repository

1. Sign in to GitHub.
2. Select **New repository**.
3. Name the repository `indobrain` or another preferred name.
4. Choose **Private** for the first public beta preparation stage.
5. Do not add a README, `.gitignore`, or license during repository creation.

## 2. Push the Local Project

Install Git for Windows if the `git` command is not available. Then run these commands in the IndoBrain project folder:

```bash
git status
git add .
git commit -m "Prepare IndoBrain public beta"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

Before committing, confirm that `.env.local` does not appear in `git status`.

## 3. Import into Vercel

1. Sign in to the Vercel dashboard.
2. Select **Add New** → **Project**.
3. Import the GitHub repository.
4. Select the repository root as the project root.
5. Confirm the detected framework is **Next.js**.

## 4. Build Settings

Use the Vercel defaults:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | Leave empty |
| Node.js Version | Vercel default or current LTS |

## 5. Environment Variables

For the first public interface test, these variables may remain empty:

- `AI_PROVIDER`
- `AI_MODEL`
- All AI provider keys
- All Supabase variables

With no AI configuration, Chat safely shows `AI Provider Not Configured`. With no Supabase configuration, event and feedback writes safely degrade without blocking the interface.

To enable real AI and data collection later, add the selected provider key and Supabase credentials in **Project Settings** → **Environment Variables**. Never place production keys in GitHub.

## 6. Deploy

1. Click **Deploy**.
2. Wait for the Vercel build to complete.
3. Open the generated production URL.
4. Test Home, Driver, ART, Factory, Chat, and Pattern.
5. Record the URL and build result in the deployment report.
