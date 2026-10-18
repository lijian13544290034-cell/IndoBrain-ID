import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';
import { listLoginHistory } from '@/lib/account/repository';
import { parseAdminDirection } from '@/lib/account/admin-direction';

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') ?? undefined;
    const rawDirection = url.searchParams.get('direction');
    const direction = parseAdminDirection(rawDirection);
    if (rawDirection && !direction) return NextResponse.json({ error: 'Choose a valid learning direction.' }, { status: 400 });
    return NextResponse.json({ history: await listLoginHistory(userId, direction ?? undefined) });
  } catch {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 401 });
  }
}
