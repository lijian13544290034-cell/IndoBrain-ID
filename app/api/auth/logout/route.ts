import { NextResponse } from 'next/server';
import { accountSessionCookieName } from '@/lib/account/config';
import { closeLoginHistory, findSession, revokeSession } from '@/lib/account/repository';

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(new RegExp(`${accountSessionCookieName()}=([^;]+)`))?.[1];
  if (token) {
    try {
      const session = await findSession(token);
      if (session) { await revokeSession(session.id); await closeLoginHistory(session.id); }
    } catch { /* Logout always clears the local cookie. */ }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(accountSessionCookieName(), '', { httpOnly: true, expires: new Date(0), path: '/' });
  return response;
}
