import type { ReactNode } from 'react';
import MandarinLearningNavigation from '@/components/MandarinLearningNavigation';

export default function LearnChineseLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))]">
    {children}
    <MandarinLearningNavigation />
  </div>;
}
