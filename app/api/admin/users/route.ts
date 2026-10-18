import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';
import { hashPassword, validatePassword } from '@/lib/account/password';
import { audit, createUser, listUsers } from '@/lib/account/repository';
import { LEARNING_DIRECTIONS, MEMBERSHIP_LEVELS } from '@/lib/account/types';
import { parseAdminDirection } from '@/lib/account/admin-direction';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const url = new URL(request.url);
    const rawDirection = url.searchParams.get('direction');
    const direction = parseAdminDirection(rawDirection);
    if (rawDirection && !direction) return NextResponse.json({ error: 'Choose a valid learning direction.' }, { status: 400 });
    return NextResponse.json({ users: await listUsers(url.searchParams.get('query') ?? '', false, direction ?? undefined) });
  } catch {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireSuperAdmin();
    const rawDirection = new URL(request.url).searchParams.get('direction');
    const scopedDirection = parseAdminDirection(rawDirection);
    if (rawDirection && !scopedDirection) return NextResponse.json({ error: 'Choose a valid learning direction.' }, { status: 400 });
    const body = (await request.json()) as { name?: string; phone?: string; password?: string; membership?: string; learningDirection?: string; expiresAt?: string; accountStatus?: string };
    if (!body.phone || !body.password) return NextResponse.json({ error: 'Phone and initial password are required.' }, { status: 400 });
    const passwordError = validatePassword(body.password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (!MEMBERSHIP_LEVELS.includes(body.membership as (typeof MEMBERSHIP_LEVELS)[number])) {
      return NextResponse.json({ error: 'Choose a valid membership.' }, { status: 400 });
    }
    if (!LEARNING_DIRECTIONS.includes(body.learningDirection as (typeof LEARNING_DIRECTIONS)[number])) {
      return NextResponse.json({ error: 'Choose a valid learning direction.' }, { status: 400 });
    }
    if (scopedDirection && body.learningDirection !== scopedDirection) {
      return NextResponse.json({ error: 'The account direction must match the selected administrator view.' }, { status: 400 });
    }
    const user = await createUser({
      phone: body.phone,
      passwordHash: await hashPassword(body.password),
      displayName: body.name,
      membership: body.membership as (typeof MEMBERSHIP_LEVELS)[number],
      learningDirection: body.learningDirection as (typeof LEARNING_DIRECTIONS)[number],
      expiresAt: body.expiresAt || null,
      accountStatus: body.accountStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      createdBy: admin.id,
    });
    await audit(admin.id, 'USER_CREATED', user.id, { membership: user.membership_code });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message === 'INVALID_PHONE' ? 'Use an international phone number.' : 'Unable to create user.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
