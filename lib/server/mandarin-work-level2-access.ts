import 'server-only';

import { cookies } from 'next/headers';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { getUserRoles, hasMembershipPermission } from '@/lib/account/repository';
import { previewQaCookieName, verifyPreviewQaSession } from '@/lib/account/preview-qa';
import { MANDARIN_LEVEL2_PERMISSION } from '@/lib/mandarin-work-level2-catalog';
import { isPreviewTestAccount } from '@/lib/account/preview-test';

export type MandarinLevel2Access = {
  state: 'anonymous' | 'locked' | 'authorized';
  source: 'none' | 'membership' | 'super-admin' | 'preview-qa' | 'preview-test';
};

export async function getMandarinLevel2Access(): Promise<MandarinLevel2Access> {
  const previewToken = (await cookies()).get(previewQaCookieName())?.value;
  if (await verifyPreviewQaSession(previewToken)) return { state: 'authorized', source: 'preview-qa' };

  const user = await getCurrentAccountUser();
  if (!user) return { state: 'anonymous', source: 'none' };
  if (isPreviewTestAccount(user)) return { state: 'authorized', source: 'preview-test' };

  const roles = await getUserRoles(user.id).catch(() => []);
  if ((roles as string[]).includes('SUPER_ADMIN')) return { state: 'authorized', source: 'super-admin' };

  const entitled = await hasMembershipPermission(user.membership_code, MANDARIN_LEVEL2_PERMISSION).catch(() => false);
  return entitled ? { state: 'authorized', source: 'membership' } : { state: 'locked', source: 'none' };
}
