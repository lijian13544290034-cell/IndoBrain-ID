// Guest Mode（Mode Tamu）开关与配置。
// 只有显式打开 GUEST_MODE_ENABLED=true 且不在 Production 环境时才可用，
// 避免公开访客入口意外在正式站生效。
const GUEST_COOKIE = 'indobrain_guest_session';

export const GUEST_SESSION_PREFIX = 'guest-';
export const GUEST_TTL_SECONDS = 12 * 60 * 60;

export function isGuestModeEnabled() {
  if (process.env.VERCEL_ENV === 'production') return false;
  return process.env.GUEST_MODE_ENABLED === 'true';
}

export function guestSessionCookieName() {
  return GUEST_COOKIE;
}

export function guestSessionSecret() {
  return process.env.GUEST_SESSION_SECRET || process.env.PREVIEW_QA_SESSION_SECRET || '';
}

export function guestLimits() {
  const number = (raw: string | undefined, fallback: number) => {
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
  };
  return {
    // 单个访客（一张浏览器）在会话有效期内的 AI 对话轮数
    conversationPerSession: number(process.env.GUEST_MAX_CONVERSATIONS, 30),
    // 单日全站访客对话总轮数（模型额度硬上限）
    conversationPerDay: number(process.env.GUEST_DAILY_CONVERSATION_BUDGET, 600),
    // 单日新建访客会话数
    sessionsPerDay: number(process.env.GUEST_DAILY_SESSION_BUDGET, 300),
    // 同一 IP 每日最多新建会话数（基础滥用保护）
    sessionsPerIpPerDay: number(process.env.GUEST_IP_DAILY_SESSIONS, 6),
    // 会话有效期（秒）
    ttlSeconds: number(process.env.GUEST_SESSION_TTL_SECONDS, GUEST_TTL_SECONDS),
  };
}
