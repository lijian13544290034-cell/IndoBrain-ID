import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { GUEST_SESSION_PREFIX, guestLimits, guestSessionSecret } from '@/lib/account/guest-mode';

// 访客会话（与账号系统完全隔离：不写 Supabase、不建用户、不用共享账号）
// 1. 服务端用 HMAC 签发短期访客令牌，浏览器只拿令牌，拿不到任何密钥；
// 2. 令牌格式 `<id>.<payloadB64>.<signature>`，载荷只含 v/iat/exp/n 四个数字字段，无个人信息；
// 3. 匿名 id = HMAC(令牌 id)，仅用于统计去重，不可反推；
// 4. 真实限额在服务端计数（见 guest-quota.ts），令牌内的 n 只用于展示。

export type GuestSession = {
  id: string;
  issuedAt: number;
  expiresAt: number;
  conversations: number;
};

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4), 'base64');
}

function sign(payload: string) {
  return toBase64Url(createHmac('sha256', guestSessionSecret()).update(payload).digest());
}

export function anonymousGuestId(tokenId: string) {
  return `guest-${createHmac('sha256', guestSessionSecret()).update(`guest-anon:${tokenId}`).digest('hex').slice(0, 24)}`;
}

export function signedSessionId(tokenId: string, clientSessionId: string) {
  return `scope-${createHash('sha256').update(`${anonymousGuestId(tokenId)}:session:${clientSessionId}`).digest('hex').slice(0, 32)}`;
}

function tokenFor(session: GuestSession) {
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify({ v: 1, iat: session.issuedAt, exp: session.expiresAt, n: session.conversations })));
  return `${session.id}.${payloadB64}.${sign(`${session.id}.${payloadB64}`)}`;
}

export function issueGuestToken() {
  const now = Date.now();
  const session: GuestSession = {
    id: `${GUEST_SESSION_PREFIX}${toBase64Url(crypto.getRandomValues(new Uint8Array(12)))}`,
    issuedAt: now,
    expiresAt: now + guestLimits().ttlSeconds * 1000,
    conversations: 0,
  };
  return { token: tokenFor(session), session };
}

export function reissueGuestToken(session: GuestSession) {
  return tokenFor(session);
}

export function verifyGuestToken(token: string | undefined | null): GuestSession | null {
  if (!token || !guestSessionSecret()) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [id, payloadB64, signature] = parts;
  if (!id.startsWith(GUEST_SESSION_PREFIX)) return null;
  const left = Buffer.from(signature);
  const right = Buffer.from(sign(`${id}.${payloadB64}`));
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(fromBase64Url(payloadB64).toString('utf8')) as { v?: number; iat?: number; exp?: number; n?: number };
    if (payload.v !== 1 || typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Date.now()) return null;
    return { id, issuedAt: payload.iat, expiresAt: payload.exp, conversations: Math.max(0, Math.floor(payload.n || 0)) };
  } catch {
    return null;
  }
}
