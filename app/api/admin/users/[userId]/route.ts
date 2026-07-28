import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/account/auth';
import { hashPassword, validatePassword } from '@/lib/account/password';
import { assignRole, audit, findUserById, revokeSessionsForUser, unbindDevice, updateUser } from '@/lib/account/repository';
import { ACCOUNT_ROLES, LEARNING_DIRECTIONS, MEMBERSHIP_LEVELS } from '@/lib/account/types';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const admin = await requirePermission('users.manage');
    const { userId } = await params;
    const body = (await request.json()) as { action?: string; password?: string; membership?: string; expiresAt?: string | null; learningDirection?: string; role?: string };
    const values: Record<string, unknown> = {};

    if (body.action === 'reset_password') {
      if (!body.password) return NextResponse.json({ error: 'New password is required.' }, { status: 400 });
      const validation = validatePassword(body.password);
      if (validation) return NextResponse.json({ error: validation }, { status: 400 });
      values.password_hash = await hashPassword(body.password);
      await revokeSessionsForUser(userId);
    } else if (body.action === 'change_membership' && MEMBERSHIP_LEVELS.includes(body.membership as (typeof MEMBERSHIP_LEVELS)[number])) {
      values.membership_code = body.membership;
    } else if (body.action === 'extend_membership') {
      values.expires_at = body.expiresAt || null;
    } else if (body.action === 'suspend') {
      values.account_status = 'SUSPENDED';
      await revokeSessionsForUser(userId);
    } else if (body.action === 'reactivate') {
      values.account_status = 'ACTIVE';
    } else if (body.action === 'unbind_device') {
      values.device_id = null;
      await revokeSessionsForUser(userId);
      await unbindDevice(userId);
    } else if (body.action === 'learning_direction' && LEARNING_DIRECTIONS.includes(body.learningDirection as (typeof LEARNING_DIRECTIONS)[number])) {
      values.learning_direction = body.learningDirection;
    } else if (body.action === 'assign_role' && ACCOUNT_ROLES.includes(body.role as (typeof ACCOUNT_ROLES)[number])) {
      await requirePermission('roles.assign');
      await assignRole(userId, body.role as (typeof ACCOUNT_ROLES)[number]);
    } else {
      return NextResponse.json({ error: 'Unsupported administrator action.' }, { status: 400 });
    }

    const user = Object.keys(values).length ? await updateUser(userId, values) : await findUserById(userId);
    await audit(admin.id, body.action, userId, { ...values, password_hash: undefined });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === 'ADMIN_AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Administrator permission is required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Unable to update user.' }, { status: 503 });
  }
}
