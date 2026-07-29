import { NextResponse } from 'next/server';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { hashPassword, validatePassword, verifyPassword } from '@/lib/account/password';
import { findUserByPhone, revokeSessionsForUser, updateUser } from '@/lib/account/repository';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const current = await getCurrentAccountUser();
    if (!current) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    const body = (await request.json()) as { currentPassword?: string; newPassword?: string };
    if (!body.currentPassword || !body.newPassword) return NextResponse.json({ error: 'Both passwords are required.' }, { status: 400 });
    const passwordError = validatePassword(body.newPassword);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    const storedUser = await findUserByPhone(current.phone);
    if (!storedUser || !(await verifyPassword(body.currentPassword, storedUser.password_hash))) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }
    await updateUser(current.id, { password_hash: await hashPassword(body.newPassword) }, current.id);
    await revokeSessionsForUser(current.id);
    return NextResponse.json({ ok: true, message: 'Password updated. Please sign in again.' });
  } catch {
    return NextResponse.json({ error: 'Unable to update password.' }, { status: 503 });
  }
}
