import type { ReactNode } from 'react';
import MandarinLearningScopeBoundary from '@/components/MandarinLearningScopeBoundary';
import MandarinLearningNavigation from '@/components/MandarinLearningNavigation';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { MANDARIN_LEARNING_GUEST_SCOPE, mandarinLearningScopeForAccount } from '@/lib/mandarin-learning-storage-scope';

export const dynamic = 'force-dynamic';

export default async function LearnChineseLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentAccountUser();
  const scope = user?.public_id ? mandarinLearningScopeForAccount(user.public_id) : MANDARIN_LEARNING_GUEST_SCOPE;
  return <MandarinLearningScopeBoundary scope={scope}>
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {children}
      <MandarinLearningNavigation />
    </div>
  </MandarinLearningScopeBoundary>;
}
