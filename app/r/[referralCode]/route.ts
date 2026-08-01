import { NextResponse } from 'next/server';
import { getReferralLandingUrl, isKnownReferralCode, referralCookieMaxAge } from '@/lib/achievement-card/referral';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ referralCode: string }> }) {
  const { referralCode } = await params;
  const response = NextResponse.redirect(new URL(getReferralLandingUrl(new URL(request.url).origin)));

  if (isKnownReferralCode(referralCode)) {
    response.cookies.set('indobrain_referral_source', 'brand', {
      httpOnly: true,
      sameSite: 'lax',
      secure: new URL(request.url).protocol === 'https:',
      maxAge: referralCookieMaxAge(),
      path: '/',
    });
    response.cookies.set('indobrain_referral_first_touch_at', new Date().toISOString(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: new URL(request.url).protocol === 'https:',
      maxAge: referralCookieMaxAge(),
      path: '/',
    });
  }

  return response;
}
