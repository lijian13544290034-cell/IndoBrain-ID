import { NextResponse } from 'next/server';
import { accountSessionCookieName } from '@/lib/account/config';
import { bindDevice, clearLoginFailures, createServerSession, findUserByPhone, getLoginLock, getUserRoles, hasActiveSessionOnOtherDevice, normalizePhone, recordLoginHistory, registerLoginFailure, releaseDeviceBinding, updateUser } from '@/lib/account/repository';
import { verifyPassword } from '@/lib/account/password';
import { requestMetadata } from '@/lib/account/request-metadata';

export const runtime = 'nodejs';

function safeErrorDetails(error: unknown) {
  const name = error instanceof Error ? error.name : typeof error;
  const rawMessage = error instanceof Error ? error.message : 'Unknown error';
  const message = rawMessage
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+){1,2}\b/g, '[redacted-token]')
    .slice(0, 240);
  const objectCode = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code
    : null;
  const code = (objectCode ?? (/^[A-Z][A-Z0-9_]*(?:_\d{3})?$/.test(rawMessage) ? rawMessage : null))?.slice(0, 80) ?? null;
  return { name, code, message };
}

export async function POST(request: Request) {
  const traceId = request.headers.get('x-vercel-id') || crypto.randomUUID();
  let stage = 'parse-request';
  try {
    const body = (await request.json()) as { phone?: string; password?: string; deviceId?: string };
    stage = 'validate-input';
    if (!body.phone || !body.password) return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 });

    stage = 'normalize-phone';
    const phone = normalizePhone(body.phone);
    stage = 'request-metadata';
    const metadata = requestMetadata(request);
    stage = 'login-lock:read';
    const lockedUntil = await getLoginLock(phone);
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      stage = 'login-history:locked';
      await recordLoginHistory({ user_id: null, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: 'TEMPORARY_LOCKED', ...metadata });
      return NextResponse.json({ error: 'Too many failed attempts. Try again after 15 minutes.' }, { status: 429 });
    }
    stage = 'user:load';
    const user = await findUserByPhone(phone);
    let passwordValid = false;
    if (user) {
      stage = 'password:verify';
      passwordValid = await verifyPassword(body.password, user.password_hash);
    }
    if (!user || !passwordValid) {
      stage = 'login-failure:register';
      const newLock = await registerLoginFailure(phone);
      stage = 'login-history:invalid-credentials';
      await recordLoginHistory({ user_id: user?.id ?? null, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: newLock ? 'TEMPORARY_LOCKED' : 'INVALID_CREDENTIALS', ...metadata });
      return NextResponse.json({ error: newLock ? 'Too many failed attempts. Try again after 15 minutes.' : 'Phone number or password is incorrect.' }, { status: newLock ? 429 : 401 });
    }
    stage = 'account-status:check';
    if (user.account_status !== 'ACTIVE') {
      stage = 'login-history:suspended';
      await recordLoginHistory({ user_id: user.id, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: 'ACCOUNT_SUSPENDED', ...metadata });
      return NextResponse.json({ error: 'This account is suspended.' }, { status: 403 });
    }
    stage = 'membership-expiry:check';
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      stage = 'login-history:expired';
      await recordLoginHistory({ user_id: user.id, phone, login_at: new Date().toISOString(), device_id: body.deviceId?.trim() || null, login_status: 'FAILED', failure_reason: 'MEMBERSHIP_EXPIRED', ...metadata });
      return NextResponse.json({ error: 'This membership has expired.' }, { status: 403 });
    }

    stage = 'roles:load';
    const roles = await getUserRoles(user.id);
    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const deviceId = body.deviceId?.trim() || null;
    stage = 'device-session:check';
    if (!isSuperAdmin && await hasActiveSessionOnOtherDevice(user.id, deviceId)) {
      stage = 'login-history:device-bound';
      await recordLoginHistory({ user_id: user.id, phone, login_at: new Date().toISOString(), device_id: deviceId, login_status: 'FAILED', failure_reason: 'DEVICE_BOUND', ...metadata });
      return NextResponse.json({ error: 'This account is bound to another device. Ask an administrator to unbind it.' }, { status: 409 });
    }

    // An explicit logout, expired session, or old browser must not leave a permanent device lock.
    stage = 'device-binding:release';
    await releaseDeviceBinding(user.id);
    stage = 'session:create';
    const session = await createServerSession(user.id, deviceId, metadata);
    stage = 'login-failures:clear';
    await clearLoginFailures(phone);
    stage = 'user:update';
    await updateUser(user.id, { device_id: deviceId, last_login_at: new Date().toISOString() });
    stage = 'device:bind';
    await bindDevice(user.id, deviceId);
    stage = 'login-history:success';
    await recordLoginHistory({ user_id: user.id, phone, session_id: session.sessionId, login_at: new Date().toISOString(), device_id: deviceId, login_status: 'SUCCESS', failure_reason: null, ...metadata });

    stage = 'response';
    const response = NextResponse.json({
      user: {
        publicId: user.public_id,
        membership: user.membership_code,
        learningDirection: user.learning_direction,
        isSuperAdmin,
        mustChangePassword: Boolean(user.must_change_password),
      },
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
    const details = safeErrorDetails(error);
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      traceId,
      errorName: details.name,
      errorCode: details.code,
      errorMessage: details.message,
      stage,
      path: '/api/auth/login',
    }));
    const message = error instanceof Error && error.message === 'INVALID_PHONE'
      ? 'Use an international phone number, for example +628123456789.'
      : 'Account login is not configured yet.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
