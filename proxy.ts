import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'indobrain_account_session';

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

type LearningDirection = 'ZH_TO_ID' | 'ID_TO_ZH';

type LearningAccess = {
  direction: LearningDirection;
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
};

async function getLearningAccess(token: string): Promise<LearningAccess | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const tokenHash = await sha256(token);
  const sessionResponse = await fetch(`${url}/rest/v1/account_sessions?token_hash=eq.${tokenHash}&revoked_at=is.null&select=expires_at,users(id,account_status,expires_at,membership_code,deleted_at,learning_direction)&limit=1`, { headers, cache: 'no-store' });
  if (!sessionResponse.ok) return null;
  const [session] = await sessionResponse.json() as Array<{ expires_at: string; users: { id: string; account_status: string; expires_at: string | null; membership_code: string; deleted_at?: string | null; learning_direction?: string | null; must_change_password?: boolean | null } | null }>;
  if (!session?.users || new Date(session.expires_at) <= new Date() || session.users.account_status !== 'ACTIVE' || session.users.deleted_at) return null;
  if (session.users.expires_at && new Date(session.users.expires_at) <= new Date()) return null;
  const permissionResponse = await fetch(`${url}/rest/v1/membership_permissions?membership_code=eq.${session.users.membership_code}&permission_key=eq.learning.access&is_allowed=eq.true&select=permission_key&limit=1`, { headers, cache: 'no-store' });
  if (!permissionResponse.ok || (await permissionResponse.json() as unknown[]).length === 0) return null;
  const direction = session.users.learning_direction;
  if (direction !== 'ZH_TO_ID' && direction !== 'ID_TO_ZH') return null;
  const rolesResponse = await fetch(`${url}/rest/v1/user_roles?user_id=eq.${session.users.id}&role_code=eq.SUPER_ADMIN&select=role_code&limit=1`, { headers, cache: 'no-store' });
  const isSuperAdmin = rolesResponse.ok && (await rolesResponse.json() as unknown[]).length > 0;
  return { direction, isSuperAdmin, mustChangePassword: Boolean(session.users.must_change_password) };
}

function isChineseLearningPath(pathname: string) {
  return pathname === '/chinese' || pathname.startsWith('/chinese/');
}

function isIndonesianLearningPath(pathname: string) {
  return pathname === '/' || [
    '/driver', '/nanny', '/factory', '/life', '/social', '/patterns', '/module', '/chat',
  ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectForDirection(request: NextRequest, direction: LearningDirection) {
  return NextResponse.redirect(new URL(direction === 'ID_TO_ZH' ? '/chinese' : '/', request.url));
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const access = token ? await getLearningAccess(token) : null;

  if (!access) {
    if (process.env.AUTH_REQUIRED !== 'true') return NextResponse.next();
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (access.mustChangePassword) return NextResponse.redirect(new URL('/change-initial-password', request.url));

  // Super Admin keeps the established unrestricted learning and admin access.
  if (access.isSuperAdmin) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (access.direction === 'ZH_TO_ID' && isChineseLearningPath(pathname)) return redirectForDirection(request, access.direction);
  if (access.direction === 'ID_TO_ZH' && isIndonesianLearningPath(pathname)) return redirectForDirection(request, access.direction);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', '/chinese/:path*', '/driver/:path*', '/nanny/:path*', '/factory/:path*', '/life/:path*', '/social/:path*', '/patterns/:path*', '/module/:path*', '/chat/:path*',
  ],
};
