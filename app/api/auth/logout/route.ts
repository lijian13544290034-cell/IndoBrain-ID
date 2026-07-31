import { NextResponse } from 'next/server';
import { accountSessionCookieName } from '@/lib/account/config';
import { previewTestCookieName } from '@/lib/preview-test-session';
import { closeLoginHistory, findSession, releaseDeviceBinding, revokeSessionsForUser } from '@/lib/account/repository';

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(new RegExp(`${accountSessionCookieName()}=([^;]+)`))?.[1];
  if (token) {
    try {
      const session = await findSession(token);
      if (session) {
        await revokeSessionsForUser(session.user_id);
        await closeLoginHistory(session.id);
        await releaseDeviceBinding(session.user_id);
      }
    } catch { /* Logout always clears the local cookie. */ }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(accountSessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });
  response.cookies.set(previewTestCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });
  return response;
}
