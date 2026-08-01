const defaultBaseUrl = 'https://indobrain-01-prd-prd-v0-1.vercel.app';

function normalizedBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

function defaultBaseForEnvironment(requestOrigin?: string) {
  if (process.env.VERCEL_ENV === 'preview' && requestOrigin) return requestOrigin;
  return defaultBaseUrl;
}

export function getBrandReferralUrl(requestOrigin?: string) {
  return `${normalizedBaseUrl(process.env.REFERRAL_QR_BASE_URL || defaultBaseForEnvironment(requestOrigin))}/r/learn`;
}

export function getReferralLandingUrl(requestOrigin?: string) {
  return process.env.REFERRAL_LANDING_URL || `${normalizedBaseUrl(defaultBaseForEnvironment(requestOrigin))}/`;
}

export function referralCookieMaxAge() {
  const configured = Number(process.env.REFERRAL_COOKIE_MAX_AGE_SECONDS);
  return Number.isFinite(configured) && configured > 0 ? configured : 60 * 60 * 24 * 30;
}

// Personal referral codes intentionally remain unavailable until a verified server-side
// account identity is restored. Device IDs and local learning profiles are never used here.
export function isKnownReferralCode(code: string) {
  return code === 'learn';
}
