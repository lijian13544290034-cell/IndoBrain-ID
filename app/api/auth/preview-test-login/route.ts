import { NextResponse } from 'next/server';
import { createPreviewTestSession, isPreviewTestLoginEnabled, previewTestCookieName } from '@/lib/preview-test-session';

export const runtime = 'nodejs';

export async function POST() {
  if (!isPreviewTestLoginEnabled()) return NextResponse.json({ error: 'Preview test access is unavailable.' }, { status: 404 });
  const response = NextResponse.json({ mode: 'PREVIEW_TEST', learningDirection: 'ZH_TO_ID' });
  // Session cookies disappear when the browser closes; no user or database record is created.
  response.cookies.set(previewTestCookieName, createPreviewTestSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return response;
}
