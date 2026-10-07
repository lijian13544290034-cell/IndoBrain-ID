'use client';

import { assemblePersonalPlan, buildAdaptiveKnowledge, judgeMastery, profileLearner, type AdaptiveCourseState, type AdaptiveLearnerProfile, type AdaptiveMistake, type MandarinLevel, type LearningPurpose } from '@/lib/mandarin-adaptive-course';
import type { MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';

const STORAGE_KEY = 'indobrain:mandarin-adaptive-course:v1';
const EVENT_NAME = 'indobrain:mandarin-adaptive-course';

export const emptyAdaptiveCourseState = (): AdaptiveCourseState => ({ version: 1, sessionId: `coach-adaptive-${crypto.randomUUID()}`, learner: null, mastery: [], mistakes: [], generatedCandidates: [], lastPlan: null });

export function readAdaptiveCourseState(): AdaptiveCourseState {
  if (typeof window === 'undefined') return emptyAdaptiveCourseState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as AdaptiveCourseState | null;
    if (parsed?.version === 1 && parsed.sessionId?.startsWith('coach-') && Array.isArray(parsed.mastery) && Array.isArray(parsed.mistakes)) return parsed;
  } catch { /* Invalid local learning memory is replaced, never merged. */ }
  const fresh = emptyAdaptiveCourseState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveAdaptiveCourseState(state: AdaptiveCourseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_NAME));
  return state;
}

export function updateAdaptiveLearner(input: {
  currentJob: string; desiredJob: string; purpose: LearningPurpose; mandarinLevel: MandarinLevel;
  immediateProblem: string; dailyStudyMinutes: 5 | 15 | 30; targetDate: string | null;
}, curriculum: MandarinCoachCurriculumPayload) {
  const state = readAdaptiveCourseState();
  const learner = profileLearner(input, state.learner);
  const lockedIds = new Set(curriculum.catalog.filter((entry) => entry.locked).map((entry) => entry.id));
  const knowledge = buildAdaptiveKnowledge(curriculum.lessons, lockedIds);
  const plan = assemblePersonalPlan({ profile: learner, knowledge, mastery: state.mastery, mistakes: state.mistakes });
  const existingCandidates = new Map(state.generatedCandidates.map((candidate) => [candidate.id, candidate]));
  for (const gap of plan.gaps) {
    const existing = existingCandidates.get(gap.id);
    existingCandidates.set(gap.id, existing ? { ...existing, demandCount: existing.demandCount + 1 } : gap);
  }
  return saveAdaptiveCourseState({ ...state, learner, lastPlan: plan, generatedCandidates: [...existingCandidates.values()] });
}

export function refreshAdaptivePlan(curriculum: MandarinCoachCurriculumPayload) {
  const state = readAdaptiveCourseState();
  if (!state.learner) return state;
  const lockedIds = new Set(curriculum.catalog.filter((entry) => entry.locked).map((entry) => entry.id));
  const knowledge = buildAdaptiveKnowledge(curriculum.lessons, lockedIds);
  const lastPlan = assemblePersonalPlan({ profile: state.learner, knowledge, mastery: state.mastery, mistakes: state.mistakes });
  return saveAdaptiveCourseState({ ...state, lastPlan });
}

export function recordAdaptiveResult(input: {
  expressionId: string; lessonId: string; dimension: 'meaning' | 'reading' | 'listening' | 'speaking' | 'realSceneUsage';
  success: boolean; changedContext?: boolean; hintLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6; skipped?: boolean;
  mistakeKind?: AdaptiveMistake['kind'];
}) {
  const state = readAdaptiveCourseState();
  const previous = state.mastery.find((record) => record.expressionId === input.expressionId);
  const record = judgeMastery({ ...input, previous });
  const mastery = [...state.mastery.filter((item) => item.expressionId !== input.expressionId), record];
  let mistakes = state.mistakes;
  if (!input.success && input.mistakeKind) {
    const existing = mistakes.find((item) => item.expressionId === input.expressionId && item.kind === input.mistakeKind);
    const next: AdaptiveMistake = { expressionId: input.expressionId, kind: input.mistakeKind, count: (existing?.count ?? 0) + 1, lastSeenAt: new Date().toISOString() };
    mistakes = [...mistakes.filter((item) => !(item.expressionId === input.expressionId && item.kind === input.mistakeKind)), next];
  }
  return saveAdaptiveCourseState({ ...state, mastery, mistakes });
}

export function subscribeAdaptiveCourse(listener: () => void) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export type AdaptiveProfileForm = Omit<AdaptiveLearnerProfile, 'careerFamily' | 'priorCareerFamilies' | 'updatedAt'>;
