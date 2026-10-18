'use client';

import { MANDARIN_WORK_NAMESPACE } from '@/lib/mandarin-work-course';
import { emptyMandarinWorkProfile, type MandarinWorkProfile } from '@/lib/mandarin-work-profile';
import { readCoachProfileSnapshots } from '@/lib/mandarin-ai-coach-profile';
import { readPersonalizationStateSnapshot } from '@/lib/mandarin-coach-personalization-profile';
import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';
import { currentMandarinLearningScope } from '@/lib/mandarin-learning-storage-scope';

function readMandarinWorkProfileSnapshot(scope: string): MandarinWorkProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(`${MANDARIN_WORK_NAMESPACE}:profile:${scope}`);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<MandarinWorkProfile>;
    const fresh = emptyMandarinWorkProfile();
    return {
      completedDays: Array.isArray(value.completedDays) ? [...new Set(value.completedDays.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 60))] : fresh.completedDays,
      currentDay: typeof value.currentDay === 'number' ? Math.min(60, Math.max(1, value.currentDay)) : fresh.currentDay,
      completedItems: Array.isArray(value.completedItems) ? [...new Set(value.completedItems.filter((item): item is string => typeof item === 'string'))] : fresh.completedItems,
      favorites: Array.isArray(value.favorites) ? [...new Set(value.favorites.filter((item): item is string => typeof item === 'string'))] : fresh.favorites,
    };
  } catch {
    return null;
  }
}

/** Side-effect-free input for the future Favorites, Review and Progress views. */
export function readMandarinLearningLocalSnapshot(lessons: MandarinCoachCurriculumLesson[], scope = currentMandarinLearningScope()) {
  return {
    scope,
    course: readMandarinWorkProfileSnapshot(scope),
    coach: readCoachProfileSnapshots(lessons, scope),
    personalization: readPersonalizationStateSnapshot(scope),
  };
}

