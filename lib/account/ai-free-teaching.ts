import { isGuestModeEnabled } from '@/lib/account/guest-mode';

/**
 * AI 自由教学实验只允许在 Vercel Preview 的访客模式中打开。
 * 即使误把环境变量带到 Production，本函数也会保持关闭。
 */
export function isAiFreeTeachingEnabled() {
  return process.env.VERCEL_ENV === 'preview'
    && process.env.AI_FREE_TEACHING === 'true'
    && isGuestModeEnabled();
}

