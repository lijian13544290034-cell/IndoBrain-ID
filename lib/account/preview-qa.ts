const PREVIEW_QA_COOKIE = 'indobrain_preview_qa';
const encoder = new TextEncoder();

type PreviewQaPayload = { version: 1; learningDirection: 'ZH_TO_ID' };

function isPreviewEnvironment() {
  return process.env.VERCEL_ENV === 'preview' && process.env.ENABLE_PREVIEW_QA === 'true';
}

function secret() {
  return process.env.PREVIEW_QA_SESSION_SECRET;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function signingKey() {
  const value = secret();
  if (!value) return null;
  return crypto.subtle.importKey('raw', encoder.encode(value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export function previewQaCookieName() {
  return PREVIEW_QA_COOKIE;
}

export function isPreviewQaEnabled() {
  return isPreviewEnvironment() && Boolean(secret());
}

export async function createPreviewQaSession() {
  const key = await signingKey();
  if (!key || !isPreviewEnvironment()) return null;
  const payload: PreviewQaPayload = { version: 1, learningDirection: 'ZH_TO_ID' };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload));
  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyPreviewQaSession(token: string | undefined) {
  const key = await signingKey();
  if (!key || !token || !isPreviewEnvironment()) return false;
  const [encodedPayload, encodedSignature, ...extra] = token.split('.');
  if (!encodedPayload || !encodedSignature || extra.length) return false;
  try {
    const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(encodedSignature), encoder.encode(encodedPayload));
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as PreviewQaPayload;
    return payload.version === 1 && payload.learningDirection === 'ZH_TO_ID';
  } catch {
    return false;
  }
}
