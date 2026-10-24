import 'server-only';

import { cookies } from 'next/headers';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { isStatelessPreviewTestMode } from '@/lib/account/config';
import { getUserRoles, hasMembershipPermission } from '@/lib/account/repository';
import { previewQaCookieName, verifyPreviewQaSession } from '@/lib/account/preview-qa';
import { currentGuestSession } from '@/lib/server/guest-auth';
import { MANDARIN_LEVEL2_PERMISSION } from '@/lib/mandarin-work-level2-catalog';

export type MandarinLevel2Access = {
  state: 'anonymous' | 'locked' | 'authorized';
  source: 'none' | 'membership' | 'super-admin' | 'preview-qa' | 'guest';
};

export async function getMandarinLevel2Access(): Promise<MandarinLevel2Access> {
  if (isStatelessPreviewTestMode()) return { state: 'authorized', source: 'preview-qa' };

  // Mode Tamu：公开访客可试用全部 30 天课程（额度由 guest-quota 单独限制）。
  // 紧跟在无状态预览之后判断，避免访客请求去碰账号库（该实例可能无 Supabase 变量）。
  if (await currentGuestSession()) return { state: 'authorized', source: 'guest' };

  const previewToken = (await cookies()).get(previewQaCookieName())?.value;
  if (await verifyPreviewQaSession(previewToken)) return { state: 'authorized', source: 'preview-qa' };

  const user = await getCurrentAccountUser();
  if (!user) return { state: 'anonymous', source: 'none' };

  const roles = await getUserRoles(user.id).catch(() => []);
  if ((roles as string[]).includes('SUPER_ADMIN')) return { state: 'authorized', source: 'super-admin' };

  const entitled = await hasMembershipPermission(user.membership_code, MANDARIN_LEVEL2_PERMISSION).catch(() => false);
  return entitled ? { state: 'authorized', source: 'membership' } : { state: 'locked', source: 'none' };
}
