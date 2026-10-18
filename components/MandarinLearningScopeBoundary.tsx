'use client';

import { type ReactNode, useLayoutEffect, useState } from 'react';
import { setMandarinLearningScope } from '@/lib/mandarin-learning-storage-scope';

export default function MandarinLearningScopeBoundary({ scope, children }: { scope: string; children: ReactNode }) {
  const [activeScope, setActiveScope] = useState<string | null>(null);

  useLayoutEffect(() => {
    setMandarinLearningScope(scope);
    setActiveScope(scope);
  }, [scope]);

  // Do not mount local-profile consumers until the verified server scope is active.
  if (activeScope !== scope) return null;
  return <div key={scope}>{children}</div>;
}

