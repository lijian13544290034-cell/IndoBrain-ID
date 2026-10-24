import { NextResponse } from 'next/server';
import { guestLimits, guestSessionCookieName, isGuestModeEnabled } from '@/lib/account/guest-mode';
import { guestIpKey } from '@/lib/server/guest-auth';
import { anonymousGuestId, issueGuestToken } from '@/lib/server/guest-session';
import { registerGuestSession } from '@/lib/server/guest-quota';

export const runtime = 'nodejs';

// 公开访客入口（Mode Tamu）。只在 GUEST_MODE_ENABLED=true 且非 Production 时可用。
// 与内部 Preview QA 的区别：访客令牌单独签名、单独限流、只能用于中文学习页，
// 不共享也不暴露内部 QA 绕过能力。
export async function POST(request: Request) {
  if (!isGuestModeEnabled()) return NextResponse.json({ error: 'Mode Tamu belum tersedia.' }, { status: 404 });

  const body = await request.json().catch(() => null) as { remember?: unknown; next?: unknown } | null;
  const gate = registerGuestSession(guestIpKey(request));
  if (!gate.allowed) {
    const message = gate.reason === 'IP_DAILY_LIMIT'
      ? 'Batas sesi uji coba dari perangkat ini sudah tercapai hari ini. Coba lagi besok.'
      : 'Kuota uji coba gratis hari ini sudah terpakai semua. Coba lagi besok.';
    return NextResponse.json({ error: message, code: gate.reason }, { status: 429 });
  }

  const { token, session } = issueGuestToken();
  const requested = typeof body?.next === 'string' ? body.next : '';
  const freeTeachingPath = '/coba-gratis/ai-free-teaching';
  const reviewPath = requested === freeTeachingPath || requested === '/learn-chinese' || requested.startsWith('/learn-chinese/')
    ? requested
    : '/learn-chinese/ai-coach';
  const limits = guestLimits();

  const response = NextResponse.json({
    guest: true,
    anonymousId: anonymousGuestId(session.id),
    reviewPath,
    expiresAt: new Date(session.expiresAt).toISOString(),
    limits: {
      conversationPerSession: limits.conversationPerSession,
      sessionTtlSeconds: limits.ttlSeconds,
    },
  });
  response.cookies.set(guestSessionCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(body?.remember === true ? { maxAge: limits.ttlSeconds } : {}),
  });
  return response;
}
