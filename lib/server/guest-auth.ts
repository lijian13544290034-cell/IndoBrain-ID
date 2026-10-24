import 'server-only';

import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import { guestLimits, guestSessionCookieName, isGuestModeEnabled } from '@/lib/account/guest-mode';
import { anonymousGuestId, reissueGuestToken, signedSessionId, verifyGuestToken, type GuestSession } from '@/lib/server/guest-session';

export function guestCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // 勾选「记住我」→ 持久 Cookie（同 12 小时有效期内重开仍可继续）；
    // 否则为会话 Cookie，关闭浏览器即失效。
    ...(remember ? { maxAge: guestLimits().ttlSeconds } : {}),
  };
}

/** 仅为把令牌内计数 +1 而回写的 Cookie（保留原有有效期策略，不延长会话）。 */
export function guestCountCookie(session: GuestSession) {
  const parts = [
    `${guestSessionCookieName()}=${reissueGuestToken({ ...session, conversations: session.conversations + 1 })}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function guestIpKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  // 只保存哈希，不落地明文 IP。
  return createHash('sha256').update(`guest-ip:${ip}`).digest('hex').slice(0, 24);
}

export async function currentGuestSession(): Promise<GuestSession | null> {
  if (!isGuestModeEnabled()) return null;
  const token = (await cookies()).get(guestSessionCookieName())?.value;
  return verifyGuestToken(token);
}

/** 访客身份 id（用于统计去重与计数键）；非访客返回 null。 */
export async function currentGuestId() {
  const session = await currentGuestSession();
  return session ? anonymousGuestId(session.id) : null;
}

/**
 * 解析本次请求的会话作用域：
 * - 有合法访客令牌 → 返回基于访客 id 派生的服务端会话键（与账号会话键空间不同）；
 * - 否则返回 null，由调用方决定回退到原有的匿名/账号逻辑。
 */
export async function resolveGuestScope(clientSessionId: string) {
  const session = await currentGuestSession();
  if (!session) return null;
  return { session, sessionId: signedSessionId(session.id, clientSessionId) };
}
