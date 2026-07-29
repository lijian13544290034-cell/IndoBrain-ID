import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';
import { listUserDevices } from '@/lib/account/repository';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireSuperAdmin();
    const { userId } = await params;
    return NextResponse.json({ devices: await listUserDevices(userId) });
  } catch {
    return NextResponse.json({ error: 'Administrator permission is required.' }, { status: 403 });
  }
}
