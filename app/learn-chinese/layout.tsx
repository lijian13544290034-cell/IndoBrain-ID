import type { ReactNode } from 'react';
import MandarinLearningScopeBoundary from '@/components/MandarinLearningScopeBoundary';
import MandarinLearningNavigation from '@/components/MandarinLearningNavigation';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { MANDARIN_LEARNING_GUEST_SCOPE, mandarinLearningScopeForAccount } from '@/lib/mandarin-learning-storage-scope';
import { currentGuestId } from '@/lib/server/guest-auth';

export const dynamic = 'force-dynamic';

export default async function LearnChineseLayout({ children }: { children: ReactNode }) {
  // 学习进度优先保存在本机浏览器。访客使用独立的存储作用域，
  // 与账号作用域（`<publicId>:ID_TO_ZH`）分开，互不污染。
  const user = await getCurrentAccountUser().catch(() => null);
  const guestId = user ? null : await currentGuestId();
  const scope = user?.public_id
    ? mandarinLearningScopeForAccount(user.public_id)
    : guestId
      ? `${guestId}:ID_TO_ZH`
      : MANDARIN_LEARNING_GUEST_SCOPE;
  return <MandarinLearningScopeBoundary scope={scope}>
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {children}
      <MandarinLearningNavigation />
    </div>
  </MandarinLearningScopeBoundary>;
}
