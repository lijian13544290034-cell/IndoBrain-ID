import { cookies } from 'next/headers';
import { accountSessionCookieName } from './config';
import { findSession, hasRolePermission } from './repository';
import type { AccountUser } from './types';

function unwrapUser(value: AccountUser | AccountUser[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getCurrentAccountUser() {
  const token = (await cookies()).get(accountSessionCookieName())?.value;
  if (!token) return null;
  try {
    const session = await findSession(token);
    if (!session || session.revoked_at || new Date(session.expires_at) <= new Date()) return null;
    return unwrapUser(session.users);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  return requirePermission('admin.dashboard.view');
}

export async function requirePermission(permissionKey: string) {
  const user = await getCurrentAccountUser();
  if (!user || !(await hasRolePermission(user.id, permissionKey))) throw new Error('ADMIN_AUTH_REQUIRED');
  return user;
}
