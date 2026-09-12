import { cookies } from 'next/headers';
import { accountSessionCookieName } from './config';
import { findSession, getUserRoles, hasRolePermission } from './repository';
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
    const user = unwrapUser(session.users);
    if (!user || user.account_status !== 'ACTIVE' || user.deleted_at) return null;
    if (user.expires_at && new Date(user.expires_at) <= new Date()) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  return requireSuperAdmin();
}

/** Commercial V1 deliberately exposes account administration to Super Admin only. */
export async function requireSuperAdmin() {
  const user = await getCurrentAccountUser();
  if (!user || !(await getUserRoles(user.id)).includes('SUPER_ADMIN')) throw new Error('ADMIN_AUTH_REQUIRED');
  return user;
}

export async function requirePermission(permissionKey: string) {
  const user = await getCurrentAccountUser();
  if (!user || !(await hasRolePermission(user.id, permissionKey))) throw new Error('ADMIN_AUTH_REQUIRED');
  return user;
}
