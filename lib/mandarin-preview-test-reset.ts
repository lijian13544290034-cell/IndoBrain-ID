'use client';

import { currentLearningScope } from '@/lib/account/client-scope';

export async function applyPreviewTestReset() {
  const response = await fetch('/api/mandarin-coach/reset-state', { cache: 'no-store' });
  if (!response.ok) return false;
  const { resetAt } = await response.json() as { resetAt: string | null };
  if (!resetAt) return false;
  const scope = currentLearningScope();
  const marker = `indobrain:preview-test-reset:${scope}`;
  if (localStorage.getItem(marker) === resetAt) return false;
  const exact = [
    `mandarin-work-30d:profile:${scope}`,
    `indobrain:mandarin-adaptive-course:v1:${scope}`,
    `indobrain_learning_profile_v1:${scope}`,
    `indobrain_session_id:${scope}`,
  ];
  for (const key of exact) localStorage.removeItem(key);
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(`indobrain:mandarin-ai-coach:${scope}:`)) localStorage.removeItem(key);
  }
  localStorage.setItem(marker, resetAt);
  return true;
}
