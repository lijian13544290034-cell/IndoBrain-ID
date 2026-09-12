import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';
import { getAdminStats } from '@/lib/account/repository';

export async function GET() {
  try {
    await requireSuperAdmin();
    return NextResponse.json(await getAdminStats());
  } catch {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 401 });
  }
}
