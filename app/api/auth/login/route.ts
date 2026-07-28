import { NextResponse } from 'next/server';
import { accountSessionCookieName } from '@/lib/account/config';
import { bindDevice, clearLoginFailures, createServerSession, findUserByPhone, getLoginLock, normalizePhone, recordLoginHistory, registerLoginFailure, updateUser } from '@/lib/account/repository';
import { verifyPassword } from '@/lib/account/password';
import { requestMetadata } from '@/lib/account/request-metadata';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; password?: string; deviceId?: string };
    if (!body.phone || !body.password) return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 });

    const phone = normalizePhone(body.phone);
    const metadata = requestMetadata(request);
    const lockedUntil = await getLoginLock(phone);
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      await recordLoginHistory({ user_id: null, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: 'TEMPORARY_LOCKED', ...metadata });
      return NextResponse.json({ error: 'Too many failed attempts. Try again after 15 minutes.' }, { status: 429 });
    }
    const user = await findUserByPhone(phone);
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      const newLock = await registerLoginFailure(phone);
      await recordLoginHistory({ user_id: user?.id ?? null, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: newLock ? 'TEMPORARY_LOCKED' : 'INVALID_CREDENTIALS', ...metadata });
      return NextResponse.json({ error: newLock ? 'Too many failed attempts. Try again after 15 minutes.' : 'Phone number or password is incorrect.' }, { status: newLock ? 429 : 401 });
    }
    if (user.account_status !== 'ACTIVE') {
      await recordLoginHistory({ user_id: user.id, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: 'ACCOUNT_SUSPENDED', ...metadata });
      return NextResponse.json({ error: 'This account is suspended.' }, { status: 403 });
    }
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      await recordLoginHistory({ user_id: user.id, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: 'MEMBERSHIP_EXPIRED', ...metadata });
      return NextResponse.json({ error: 'This membership has expired.' }, { status: 403 });
    }

    const deviceId = body.deviceId?.trim() || null;
    if (user.device_id && deviceId && user.device_id !== deviceId) {
      await recordLoginHistory({ user_id: user.id, phone, login_at: new Date().toISOString(), device_id: deviceId, login_status: 'FAILED', failure_reason: 'DEVICE_BOUND', ...metadata });
      return NextResponse.json({ error: 'This account is bound to another device. Ask an administrator to unbind it.' }, { status: 409 });
    }

    const session = await createServerSession(user.id, deviceId, metadata);
    await clearLoginFailures(phone);
    await updateUser(user.id, { device_id: user.device_id ?? deviceId, last_login_at: new Date().toISOString() });
    await bindDevice(user.id, deviceId);
    await recordLoginHistory({ user_id: user.id, phone, session_id: session.sessionId, login_at: new Date().toISOString(), device_id: deviceId, login_status: 'SUCCESS', failure_reason: null, ...metadata });

    const response = NextResponse.json({
      user: { publicId: user.public_id, membership: user.membership_code, learningDirection: user.learning_direction },
    });
    response.cookies.set(accountSessionCookieName(), session.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(session.expiresAt),
      path: '/',
    });
    return response;
  } catch (error) {
    const message = error instanceof Error && error.message === 'INVALID_PHONE'
      ? 'Use an international phone number, for example +628123456789.'
      : 'Account login is not configured yet.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
