import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';
import { hashPassword, validatePassword } from '@/lib/account/password';
import { audit, createUser, listUsers } from '@/lib/account/repository';
import { LEARNING_DIRECTIONS, MEMBERSHIP_LEVELS } from '@/lib/account/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    return NextResponse.json({ users: await listUsers(new URL(request.url).searchParams.get('query') ?? '') });
  } catch {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireSuperAdmin();
    const body = (await request.json()) as { phone?: string; password?: string; membership?: string; learningDirection?: string; expiresAt?: string; accountStatus?: string };
    if (!body.phone || !body.password) return NextResponse.json({ error: 'Phone and initial password are required.' }, { status: 400 });
    const passwordError = validatePassword(body.password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (!MEMBERSHIP_LEVELS.includes(body.membership as (typeof MEMBERSHIP_LEVELS)[number])) {
      return NextResponse.json({ error: 'Choose a valid membership.' }, { status: 400 });
    }
    if (!LEARNING_DIRECTIONS.includes(body.learningDirection as (typeof LEARNING_DIRECTIONS)[number])) {
      return NextResponse.json({ error: 'Choose a valid learning direction.' }, { status: 400 });
    }
    const user = await createUser({
      phone: body.phone,
      passwordHash: await hashPassword(body.password),
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
