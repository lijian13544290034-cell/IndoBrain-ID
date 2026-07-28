import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/account/auth';
import { listLoginHistory } from '@/lib/account/repository';

export async function GET(request: Request) {
  try {
    await requirePermission('users.manage');
    const userId = new URL(request.url).searchParams.get('userId') ?? undefined;
    return NextResponse.json({ history: await listLoginHistory(userId) });
  } catch {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 401 });
  }
}
