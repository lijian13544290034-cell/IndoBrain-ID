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

const STORAGE_KEY = 'indobrain:mandarin-coach-personalization:v1';
const EVENT_NAME = 'indobrain:mandarin-coach-personalization';

export function readPersonalizationState(): PersonalizationStateV1 {
  const fresh = createPersonalizationState();
  if (typeof window === 'undefined') return fresh;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Partial<PersonalizationStateV1> | null;
    if (parsed?.version === 1 && parsed.profile?.version === 1 && parsed.mastery && typeof parsed.mastery === 'object') {
      return {
        ...fresh,
        ...parsed,
        profile: { ...fresh.profile, ...parsed.profile },
        mastery: parsed.mastery,
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds.filter((item): item is string => typeof item === 'string').slice(-100) : [],
        plan: parsed.plan?.version === 1 ? parsed.plan : null,
      };
    }
  } catch {
    // Invalid local-only personalization is replaced with a safe default.
  }
  return fresh;
}

export function savePersonalizationState(state: PersonalizationStateV1) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

