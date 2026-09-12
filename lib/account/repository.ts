import { createHash, randomBytes } from 'crypto';
import { accountServerKey, isAccountDatabaseConfigured } from './config';
import type { AccountRole, AccountSession, AccountUser, AdminStats, LearningDirection, LoginHistoryEntry, MembershipLevel } from './types';

type Row = Record<string, unknown>;

function environment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = accountServerKey();
  if (!url || !serviceRole) throw new Error('ACCOUNT_DATABASE_NOT_CONFIGURED');
  return { url, serviceRole };
}

async function request(path: string, init?: RequestInit) {
  const { url, serviceRole } = environment();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`ACCOUNT_DATABASE_${response.status}`);
  return response;
}

function encode(value: string) {
  return encodeURIComponent(value);
}

export function normalizePhone(phone: string) {
  const normalized = phone.trim().replace(/[\s()-]/g, '');
  if (!/^\+[1-9]\d{6,14}$/.test(normalized)) throw new Error('INVALID_PHONE');
  return normalized;
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

async function first<T>(path: string) {
  const response = await request(path);
  const rows = (await response.json()) as T[];
  return rows[0] ?? null;
}

async function count(path: string) {
  const response = await request(path, { headers: { Prefer: 'count=exact', Range: '0-0' } });
  const contentRange = response.headers.get('content-range');
  return Number(contentRange?.split('/')[1] ?? 0);
}

async function dailyActivityTotal(eventType: 'LEARNING_SECONDS' | 'EXPERIENCE_COMPLETED' | 'FAVORITE_ADDED', since: string) {
  const response = await request(`account_activity_events?event_type=eq.${eventType}&occurred_at=gte.${encode(since)}&select=quantity`);
  const rows = (await response.json()) as Array<{ quantity: number }>;
  return rows.reduce((total, row) => total + row.quantity, 0);
}

export async function findUserByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return first<(AccountUser & { password_hash: string })>(
    `users?phone=eq.${encode(normalized)}&deleted_at=is.null&select=*&limit=1`,
  );
}

export async function findUserById(userId: string, includeDeleted = false) {
  return first<AccountUser>(`users?id=eq.${encode(userId)}${includeDeleted ? '' : '&deleted_at=is.null'}&select=*&limit=1`);
}

export async function createUser(input: {
  phone: string;
  passwordHash: string;
  displayName?: string;
  membership: MembershipLevel;
  learningDirection: LearningDirection;
  expiresAt?: string | null;
  accountStatus?: 'ACTIVE' | 'SUSPENDED';
  registerSource?: string;
  createdBy?: string;
  mustChangePassword?: boolean;
  createdByBatchId?: string | null;
}) {
  const response = await request('users', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      phone: normalizePhone(input.phone),
      display_name: input.displayName?.trim() || null,
      password_hash: input.passwordHash,
      membership_code: input.membership,
      learning_direction: input.learningDirection,
      account_status: input.accountStatus ?? 'ACTIVE',
      expires_at: input.expiresAt ?? null,
      register_source: input.registerSource ?? 'ADMIN',
      created_by: input.createdBy ?? null,
      updated_by: input.createdBy ?? null,
      must_change_password: input.mustChangePassword ?? false,
      created_by_batch_id: input.createdByBatchId ?? null,
      initial_password_issued_at: input.mustChangePassword ? new Date().toISOString() : null,
    }),
  });
  const rows = (await response.json()) as AccountUser[];
  const user = rows[0];
  await assignRole(user.id, 'USER');
  return user;
}

export async function createStudentImportBatch(input: { actorUserId: string; sourceFileName?: string | null; totalRows: number }) {
  const response = await request('student_import_batches', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ actor_user_id: input.actorUserId, source_file_name: input.sourceFileName ?? null, total_rows: input.totalRows }),
  });
  return ((await response.json()) as Array<{ id: string }>)[0];
}

export async function completeStudentImportBatch(batchId: string, values: { validRows: number; createdRows: number; failedRows: number; skippedRows: number; failureRecords: unknown[] }) {
  await request(`student_import_batches?id=eq.${encode(batchId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ valid_rows: values.validRows, created_rows: values.createdRows, failed_rows: values.failedRows, skipped_rows: values.skippedRows, failure_records: values.failureRecords, completed_at: new Date().toISOString() }),
  });
}

export async function updateUser(userId: string, values: Row, updatedBy?: string) {
  const response = await request(`users?id=eq.${encode(userId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...values, ...(updatedBy ? { updated_by: updatedBy } : {}) }),
  });
  const rows = (await response.json()) as AccountUser[];
  return rows[0] ?? null;
}

export async function listUsers(query = '', includeDeleted = false) {
  const filter = query
    ? `&or=(phone.ilike.*${encode(query)}*,public_id.ilike.*${encode(query)}*)`
    : '';
  const deleted = includeDeleted ? '' : '&deleted_at=is.null';
  const response = await request(`users?select=*&order=created_at.desc&limit=100${deleted}${filter}`);
  return (await response.json()) as AccountUser[];
}

export async function createServerSession(userId: string, deviceId: string | null, metadata?: { browser: string; operating_system: string; ip_address: string | null; country: string | null }) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const response = await request('account_sessions', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: userId,
      token_hash: hashSessionToken(token),
      device_id: deviceId,
      browser: metadata?.browser ?? null,
      operating_system: metadata?.operating_system ?? null,
      ip_address: metadata?.ip_address ?? null,
      country: metadata?.country ?? null,
      expires_at: expiresAt,
    }),
  });
  const rows = (await response.json()) as AccountSession[];
  return { token, expiresAt, sessionId: rows[0].id };
}

export async function findSession(token: string) {
  return first<AccountSession>(
    `account_sessions?token_hash=eq.${encode(hashSessionToken(token))}&select=*,users(*)&limit=1`,
  );
}

export async function revokeSessionsForUser(userId: string) {
  await request(`account_sessions?user_id=eq.${encode(userId)}&revoked_at=is.null`, {
    method: 'PATCH',
    body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });
}

export async function revokeSession(sessionId: string) {
  await request(`account_sessions?id=eq.${encode(sessionId)}&revoked_at=is.null`, {
    method: 'PATCH', body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });
}

export async function touchSession(sessionId: string) {
  await request(`account_sessions?id=eq.${encode(sessionId)}&revoked_at=is.null`, {
    method: 'PATCH', body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
  });
}

export async function bindDevice(userId: string, deviceId: string | null) {
  if (!deviceId) return;
  await request('user_devices?on_conflict=user_id,device_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ user_id: userId, device_id: deviceId, last_seen_at: new Date().toISOString(), unbound_at: null }),
  });
}

export async function unbindDevice(userId: string) {
  await request(`user_devices?user_id=eq.${encode(userId)}&unbound_at=is.null`, {
    method: 'PATCH',
    body: JSON.stringify({ unbound_at: new Date().toISOString() }),
  });
}

/** Release a device only after the account has explicitly signed out or an administrator has recovered it. */
export async function releaseDeviceBinding(userId: string) {
  await updateUser(userId, { device_id: null });
  await unbindDevice(userId);
}

/** A stale device field must never block a new login; only another live session may do that. */
export async function hasActiveSessionOnOtherDevice(userId: string, deviceId: string | null) {
  if (!deviceId) return false;
  const now = new Date().toISOString();
  const response = await request(
    `account_sessions?user_id=eq.${encode(userId)}&revoked_at=is.null&expires_at=gt.${encode(now)}&device_id=neq.${encode(deviceId)}&select=id&limit=1`,
  );
  return ((await response.json()) as Array<{ id: string }>).length > 0;
}

export async function listUserDevices(userId: string) {
  const response = await request(`user_devices?user_id=eq.${encode(userId)}&select=*&order=last_seen_at.desc`);
  return (await response.json()) as Array<{ id: string; device_id: string; device_label: string | null; last_seen_at: string; unbound_at: string | null; created_at: string }>;
}

export async function softDeleteUser(userId: string, actorUserId: string) {
  await revokeSessionsForUser(userId);
  await unbindDevice(userId);
  return updateUser(userId, {
    account_status: 'DELETED',
    device_id: null,
    deleted_at: new Date().toISOString(),
    deleted_by: actorUserId,
  }, actorUserId);
}

/** Use this only in server routes; plan labels are never authorization. */
export async function hasMembershipPermission(membership: MembershipLevel, permissionKey: string) {
  const permission = await first<{ is_allowed: boolean }>(
    `membership_permissions?membership_code=eq.${membership}&permission_key=eq.${encode(permissionKey)}&select=is_allowed&limit=1`,
  );
  return Boolean(permission?.is_allowed);
}

export async function assignRole(userId: string, role: AccountRole) {
  await request('user_roles?on_conflict=user_id,role_code', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ user_id: userId, role_code: role }),
  });
}

export async function getUserRoles(userId: string) {
  const response = await request(`user_roles?user_id=eq.${encode(userId)}&select=role_code`);
  return ((await response.json()) as Array<{ role_code: AccountRole }>).map((row) => row.role_code);
}

/** Role and permission resolution is always server-side. */
export async function hasRolePermission(userId: string, permissionKey: string) {
  const roles = await getUserRoles(userId);
  if (!roles.length) return false;
  const response = await request(`role_permissions?role_code=in.(${roles.join(',')})&permission_key=eq.${encode(permissionKey)}&is_allowed=eq.true&select=role_code&limit=1`);
  return ((await response.json()) as Row[]).length > 0;
}

export async function recordLoginHistory(entry: Omit<LoginHistoryEntry, 'id' | 'logout_at' | 'session_duration_seconds'> & { session_id?: string | null }) {
  await request('login_history', { method: 'POST', body: JSON.stringify(entry) });
}

async function rpc<T>(name: string, body: Row) {
  const response = await request(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
  // Mutation RPCs such as clear_login_failures intentionally return 204/empty.
  // Parsing an empty response turned a successful login into a false failure.
  const payload = await response.text();
  return (payload ? JSON.parse(payload) : undefined) as T;
}

export async function getLoginLock(phone: string) {
  return rpc<string | null>('get_login_lock', { p_phone: phone });
}

export async function registerLoginFailure(phone: string) {
  return rpc<string | null>('register_login_failure', { p_phone: phone });
}

export async function clearLoginFailures(phone: string) {
  await rpc('clear_login_failures', { p_phone: phone });
}

export async function importLocalLearningData(userId: string, sourceKey: string, sourceHash: string, payload: Row) {
  const response = await request('user_local_data_imports?on_conflict=user_id,source_key,source_hash', {
    method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify({ user_id: userId, source_key: sourceKey, source_hash: sourceHash, payload }),
  });
  // A duplicate is intentionally represented by an empty successful response.
  const raw = await response.text();
  const rows = (raw ? JSON.parse(raw) : []) as Row[];
  return { imported: rows.length > 0, importId: rows[0]?.id as string | undefined };
}

export async function createImportedSceneContributions(userId: string, sourceImportId: string, submissions: unknown[]) {
  if (!submissions.length) return;
  await request('account_scene_contributions', {
    method: 'POST',
    body: JSON.stringify(submissions.map((payload) => ({ user_id: userId, source_import_id: sourceImportId, payload, review_status: 'PENDING' }))),
  });
}

export async function closeLoginHistory(sessionId: string) {
  const row = await first<LoginHistoryEntry>(`login_history?session_id=eq.${encode(sessionId)}&logout_at=is.null&select=*&limit=1`);
  if (!row) return;
  const logoutAt = new Date().toISOString();
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(row.login_at).getTime()) / 1000));
  await request(`login_history?id=eq.${encode(row.id)}`, { method: 'PATCH', body: JSON.stringify({ logout_at: logoutAt, session_duration_seconds: seconds }) });
}

export async function listLoginHistory(userId?: string) {
  const filter = userId ? `&user_id=eq.${encode(userId)}` : '';
  const response = await request(`login_history?select=*&order=login_at.desc&limit=100${filter}`);
  return (await response.json()) as LoginHistoryEntry[];
}

export async function getOnlineUserIds() {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const response = await request(`account_sessions?revoked_at=is.null&last_seen_at=gte.${encode(cutoff)}&select=user_id`);
  return new Set(((await response.json()) as Array<{ user_id: string }>).map((row) => row.user_id));
}

export async function audit(actorUserId: string, action: string, targetUserId?: string, metadata?: Row) {
  await request('admin_audit_logs', {
    method: 'POST',
    body: JSON.stringify({ actor_user_id: actorUserId, action, target_user_id: targetUserId ?? null, metadata: metadata ?? {} }),
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  const blank: AdminStats = {
    totalUsers: 0, onlineUsers: 0, activeUsersToday: 0, activeUsersSevenDays: 0, newUsers: 0,
    membershipDistribution: { BASIC: 0, PRO: 0, VIP: 0, ENTERPRISE: 0, SVIP: 0 },
    expiringWithin30Days: 0, expiredMembers: 0, loginsToday: 0, loginsThisWeek: 0, learningTimeToday: 0, completedExperiencesToday: 0,
    favoritesToday: 0, sceneContributionsToday: 0, pendingReviews: 0,
  };
  if (!isAccountDatabaseConfigured()) return blank;
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const startOfToday = new Date(`${today}T00:00:00.000Z`).toISOString();
  const expiresWithin30Days = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const [users, onlineUserIds, expiringWithin30Days, expiredMembers, loginsToday, loginsThisWeek, learningSeconds, completedExperiencesToday, favoritesToday, sceneContributionsToday, pendingReviews] = await Promise.all([
    listUsers(),
    getOnlineUserIds(),
    count(`users?expires_at=gte.${encode(new Date(now).toISOString())}&expires_at=lte.${encode(expiresWithin30Days)}&select=id`),
    count(`users?expires_at=lt.${encode(new Date(now).toISOString())}&deleted_at=is.null&select=id`),
    count(`login_history?login_status=eq.SUCCESS&login_at=gte.${encode(startOfToday)}&select=id`),
    count(`login_history?login_status=eq.SUCCESS&login_at=gte.${encode(new Date(sevenDaysAgo).toISOString())}&select=id`),
    dailyActivityTotal('LEARNING_SECONDS', startOfToday),
    dailyActivityTotal('EXPERIENCE_COMPLETED', startOfToday),
    dailyActivityTotal('FAVORITE_ADDED', startOfToday),
    count(`account_scene_contributions?created_at=gte.${encode(startOfToday)}&select=id`),
    count('account_scene_contributions?review_status=eq.PENDING&select=id'),
  ]);
  for (const user of users) blank.membershipDistribution[user.membership_code] += 1;
  return {
    ...blank,
    totalUsers: users.length,
    onlineUsers: onlineUserIds.size,
    activeUsersToday: users.filter((user) => user.last_login_at?.slice(0, 10) === today).length,
    activeUsersSevenDays: users.filter((user) => user.last_login_at && new Date(user.last_login_at).getTime() >= sevenDaysAgo).length,
    newUsers: users.filter((user) => user.created_at.slice(0, 10) === today).length,
    expiringWithin30Days,
    expiredMembers,
    loginsToday,
    loginsThisWeek,
    learningTimeToday: Math.floor(learningSeconds / 60),
    completedExperiencesToday,
    favoritesToday,
    sceneContributionsToday,
    pendingReviews,
  };
}
