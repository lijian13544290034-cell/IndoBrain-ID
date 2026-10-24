const PREVIEW_QA_COOKIE = 'indobrain_preview_qa';
const PREVIEW_QA_TTL_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

type PreviewQaPayload = {
  version: 1;
  learningDirection: 'ID_TO_ZH';
  expiresAt: number;
};

// 公开访客部署的保护：一旦 GUEST_MODE_ENABLED=true（即这条链接会对外分发），
// 内部 Preview QA 绕过入口默认关闭，避免同一部署既给访客开放、又留下一个
// 不限额度的内部绕过通道。需要保留 QA 时显式设置 PREVIEW_QA_ALLOW_ON_GUEST=true。
function guestDeploymentBlocksQa() {
  return process.env.GUEST_MODE_ENABLED === 'true' && process.env.PREVIEW_QA_ALLOW_ON_GUEST !== 'true';
}

function isPreviewEnvironment() {
  return process.env.VERCEL_ENV === 'preview' && process.env.ENABLE_PREVIEW_QA === 'true' && !guestDeploymentBlocksQa();
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

export function previewQaCookieMaxAge() {
  return PREVIEW_QA_TTL_SECONDS;
}

export function isPreviewQaEnabled() {
  return isPreviewEnvironment() && Boolean(secret());
}

export async function createPreviewQaSession() {
  const key = await signingKey();
  if (!key || !isPreviewEnvironment()) return null;
  const payload: PreviewQaPayload = {
    version: 1,
    learningDirection: 'ID_TO_ZH',
    expiresAt: Date.now() + PREVIEW_QA_TTL_SECONDS * 1000,
  };
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
    return payload.version === 1
      && payload.learningDirection === 'ID_TO_ZH'
      && Number.isFinite(payload.expiresAt)
      && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}
