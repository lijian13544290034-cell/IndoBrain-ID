import { NextResponse } from 'next/server';
import { createPreviewQaSession, isPreviewQaEnabled, previewQaCookieName } from '@/lib/account/preview-qa';

export const runtime = 'nodejs';

export async function POST() {
  if (!isPreviewQaEnabled()) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const session = await createPreviewQaSession();
  if (!session) return NextResponse.json({ error: 'Preview QA Mode is unavailable.' }, { status: 503 });
  const response = NextResponse.json({ learningDirection: 'ZH_TO_ID' });
  response.cookies.set(previewQaCookieName(), session, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  return response;
}
