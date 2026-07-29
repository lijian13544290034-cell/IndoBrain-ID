import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { accountSessionCookieName } from '@/lib/account/config';
import { findSession, touchSession } from '@/lib/account/repository';
import { getCurrentAccountUser } from '@/lib/account/auth';

export async function POST() {
  try {
    const token = (await cookies()).get(accountSessionCookieName())?.value;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });
    if (!(await getCurrentAccountUser())) return NextResponse.json({ ok: false }, { status: 401 });
    const session = await findSession(token);
    if (!session || session.revoked_at || new Date(session.expires_at) <= new Date()) return NextResponse.json({ ok: false }, { status: 401 });
    await touchSession(session.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
