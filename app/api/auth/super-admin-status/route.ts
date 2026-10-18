import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';

export async function GET() {
  try {
    await requireSuperAdmin();
    return NextResponse.json({ isSuperAdmin: true });
  } catch {
    return NextResponse.json({ isSuperAdmin: false }, { status: 401 });
  }
}

