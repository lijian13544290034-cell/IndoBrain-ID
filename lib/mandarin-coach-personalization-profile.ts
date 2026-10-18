'use client';

import {
  applyMasteryEvidence,
  createPersonalizationState,
  replaceLearnerProfileAndPlan,
  updateProfileFromEvidence,
  type LearnerProfileV1,
  type MasteryEvidence,
  type PersonalizationStateV1,
  type SevenDayPlan,
} from '@/lib/mandarin-coach-personalization';
import { currentMandarinLearningScope, readScopedMandarinJson, writeScopedMandarinJson } from '@/lib/mandarin-learning-storage-scope';

const STORAGE_KEY = 'indobrain:mandarin-coach-personalization:v1';
const EVENT_NAME = 'indobrain:mandarin-coach-personalization';

function restorePersonalizationState(parsed: Partial<PersonalizationStateV1> | null) {
  const fresh = createPersonalizationState();
  if (parsed?.version !== 1 || parsed.profile?.version !== 1 || !parsed.mastery || typeof parsed.mastery !== 'object') return null;
  return {
    ...fresh,
    ...parsed,
    profile: { ...fresh.profile, ...parsed.profile },
    mastery: parsed.mastery,
    completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds.filter((item): item is string => typeof item === 'string').slice(-100) : [],
    plan: parsed.plan?.version === 1 ? parsed.plan : null,
  } as PersonalizationStateV1;
}

/** Read existing scoped personalization without creating or changing local data. */
export function readPersonalizationStateSnapshot(scope = currentMandarinLearningScope()) {
  const parsed = readScopedMandarinJson(STORAGE_KEY, scope) as Partial<PersonalizationStateV1> | null;
  return restorePersonalizationState(parsed);
}

export function readPersonalizationState(): PersonalizationStateV1 {
  if (typeof window === 'undefined') return createPersonalizationState();
  return readPersonalizationStateSnapshot() ?? createPersonalizationState();
}

export function savePersonalizationState(state: PersonalizationStateV1) {
  writeScopedMandarinJson(STORAGE_KEY, state);
  window.dispatchEvent(new Event(EVENT_NAME));
  return state;
}

export function saveLearnerProfile(profile: LearnerProfileV1, plan: SevenDayPlan) {
  const current = readPersonalizationState();
  return savePersonalizationState(replaceLearnerProfileAndPlan(current, profile, plan));
}

export function recordPersonalizationEvidence(evidence: MasteryEvidence) {
  const current = readPersonalizationState();
  const mastery = { ...current.mastery, [evidence.expressionId]: applyMasteryEvidence(current.mastery[evidence.expressionId], evidence) };
  return savePersonalizationState({ ...current, profile: updateProfileFromEvidence(current.profile, evidence), mastery });
}

export function markPersonalizedLessonComplete(lessonId: string) {
  const current = readPersonalizationState();
  return savePersonalizationState({ ...current, completedLessonIds: [...new Set([...current.completedLessonIds, lessonId])].slice(-100) });
}

export function subscribePersonalization(listener: () => void) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

