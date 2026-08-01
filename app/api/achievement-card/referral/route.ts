import { NextResponse } from 'next/server';
import { getBrandReferralUrl } from '@/lib/achievement-card/referral';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // The current release supports anonymous learning. Never manufacture a personal
  // referral identity from localStorage, a device ID, or a browser session.
  return NextResponse.json({
    kind: 'brand',
    qrUrl: getBrandReferralUrl(new URL(request.url).origin),
    message: '登录后可生成你的专属推荐二维码。',
  });
}
