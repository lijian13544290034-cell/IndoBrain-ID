import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'indobrain_account_session';

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hasLearningAccess(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return false;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const tokenHash = await sha256(token);
  const sessionResponse = await fetch(`${url}/rest/v1/account_sessions?token_hash=eq.${tokenHash}&revoked_at=is.null&select=expires_at,users(account_status,expires_at,membership_code)&limit=1`, { headers, cache: 'no-store' });
  if (!sessionResponse.ok) return false;
  const [session] = await sessionResponse.json() as Array<{ expires_at: string; users: { account_status: string; expires_at: string | null; membership_code: string } | null }>;
  if (!session?.users || new Date(session.expires_at) <= new Date() || session.users.account_status !== 'ACTIVE') return false;
  if (session.users.expires_at && new Date(session.users.expires_at) <= new Date()) return false;
  const permissionResponse = await fetch(`${url}/rest/v1/membership_permissions?membership_code=eq.${session.users.membership_code}&permission_key=eq.learning.access&is_allowed=eq.true&select=permission_key&limit=1`, { headers, cache: 'no-store' });
  return permissionResponse.ok && (await permissionResponse.json() as unknown[]).length > 0;
}

export async function proxy(request: NextRequest) {
  if (process.env.AUTH_REQUIRED !== 'true') return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && await hasLearningAccess(token)) return NextResponse.next();
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/driver/:path*', '/nanny/:path*', '/factory/:path*', '/life/:path*', '/social/:path*', '/patterns/:path*', '/module/:path*', '/chat/:path*',
  ],
};
