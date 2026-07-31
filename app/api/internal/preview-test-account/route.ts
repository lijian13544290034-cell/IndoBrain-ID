import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createUser, findUserByPhone, releaseDeviceBinding, revokeSessionsForUser, updateUser } from '@/lib/account/repository';
import { hashPassword, validatePassword } from '@/lib/account/password';

export const runtime = 'nodejs';

function hasValidBootstrapToken(request: Request) {
  const expected = process.env.PREVIEW_ACCOUNT_BOOTSTRAP_TOKEN;
  const received = request.headers.get('x-preview-bootstrap-token');
  if (!expected || !received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

/** One-time Preview-only account initialization. This route is removed immediately after use. */
export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview' || !hasValidBootstrapToken(request)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const body = (await request.json()) as { phone?: string; password?: string };
    if (!body.phone || !body.password || validatePassword(body.password)) {
      return NextResponse.json({ error: 'Invalid account details.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);
    const existing = await findUserByPhone(body.phone);
    const user = existing
      ? await updateUser(existing.id, {
        password_hash: passwordHash,
        membership_code: 'VIP',
        learning_direction: 'ZH_TO_ID',
        account_status: 'ACTIVE',
        expires_at: null,
      })
      : await createUser({
        phone: body.phone,
        passwordHash,
        membership: 'VIP',
        learningDirection: 'ZH_TO_ID',
        registerSource: 'PREVIEW_TEST',
      });

    if (!user) throw new Error('USER_NOT_AVAILABLE');
    await revokeSessionsForUser(user.id);
    await releaseDeviceBinding(user.id);

    return NextResponse.json({ phone: user.phone, learningDirection: user.learning_direction, membership: user.membership_code });
  } catch {
    return NextResponse.json({ error: 'Unable to initialize the Preview test account.' }, { status: 503 });
  }
}
