import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/account/auth';
import { getAdminStats } from '@/lib/account/repository';

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getAdminStats());
  } catch {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 401 });
  }
}
