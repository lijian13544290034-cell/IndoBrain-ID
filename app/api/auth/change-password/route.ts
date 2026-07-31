import { NextResponse } from 'next/server';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { hashPassword, validatePassword, verifyPassword } from '@/lib/account/password';
import { findUserByPhone, revokeSessionsForUser, updateUser } from '@/lib/account/repository';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const current = await getCurrentAccountUser();
    if (!current) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    const body = (await request.json()) as { currentPassword?: string; newPassword?: string; initialPasswordChange?: boolean };
    if (!body.newPassword || (!current.must_change_password && !body.currentPassword)) return NextResponse.json({ error: 'Both passwords are required.' }, { status: 400 });
    const passwordError = validatePassword(body.newPassword);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    const storedUser = await findUserByPhone(current.phone);
    if (!storedUser || (!current.must_change_password && !(await verifyPassword(body.currentPassword!, storedUser.password_hash)))) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }
    await updateUser(current.id, { password_hash: await hashPassword(body.newPassword), must_change_password: false }, current.id);
    if (!current.must_change_password) await revokeSessionsForUser(current.id);
    return NextResponse.json({ ok: true, message: current.must_change_password ? 'Password updated.' : 'Password updated. Please sign in again.' });
  } catch {
    return NextResponse.json({ error: 'Unable to update password.' }, { status: 503 });
  }
}
