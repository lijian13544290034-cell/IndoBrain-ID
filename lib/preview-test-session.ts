import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const previewTestCookieName = 'indobrain_preview_test_session';
const tokenVersion = 'preview-v1';

export function isPreviewTestLoginEnabled() {
  return process.env.VERCEL_ENV === 'preview'
    && process.env.ENABLE_PREVIEW_TEST_LOGIN === 'true'
    && Boolean(process.env.PREVIEW_TEST_SESSION_SECRET);
}

function signature(payload: string) {
  const secret = process.env.PREVIEW_TEST_SESSION_SECRET;
  if (!secret) throw new Error('PREVIEW_TEST_SESSION_SECRET_MISSING');
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createPreviewTestSession() {
  if (!isPreviewTestLoginEnabled()) throw new Error('PREVIEW_TEST_LOGIN_DISABLED');
  const payload = `${tokenVersion}.${Math.floor(Date.now() / 1000) + 8 * 60 * 60}`;
  return `${payload}.${signature(payload)}`;
}

export function isValidPreviewTestSession(token?: string | null) {
  if (!isPreviewTestLoginEnabled() || !token) return false;
  const [version, expiry, received] = token.split('.');
  if (version !== tokenVersion || !expiry || !received || !/^\d+$/.test(expiry) || Number(expiry) <= Math.floor(Date.now() / 1000)) return false;
  const expected = signature(`${version}.${expiry}`);
  return received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export async function hasPreviewTestSession() {
  return isValidPreviewTestSession((await cookies()).get(previewTestCookieName)?.value);
}
