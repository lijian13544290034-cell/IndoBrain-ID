'use client';

import { AI_COACH_COURSE_ID, createCoachProfile, emptyCoachProfile, type CoachProfile } from '@/lib/mandarin-ai-coach';
import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';
import { currentMandarinLearningScope, readScopedMandarinJson, scopedMandarinStorageKey, writeScopedMandarinJson } from '@/lib/mandarin-learning-storage-scope';

const LEGACY_STORAGE_KEY = 'indobrain:mandarin-ai-coach-day1:v1';
const EVENT_NAME = 'indobrain:mandarin-ai-coach-profile';
const storageBaseKey = (lesson?: MandarinCoachCurriculumLesson) => lesson ? `indobrain:mandarin-ai-coach:${lesson.id}:v1` : LEGACY_STORAGE_KEY;

type StoredProfile = Omit<Partial<CoachProfile>, 'version' | 'conversation' | 'learning'> & {
  version?: 1 | 2 | 3 | 4;
  conversation?: CoachProfile['conversation'];
  learning?: CoachProfile['learning'];
};

function restoreCoachProfile(parsed: StoredProfile | null, lesson?: MandarinCoachCurriculumLesson) {
  const fresh = lesson ? createCoachProfile(lesson) : emptyCoachProfile();
  const correctLesson = lesson
    ? parsed?.lessonId === lesson.id || (!parsed?.lessonId && lesson.day === 1 && parsed?.course === AI_COACH_COURSE_ID)
    : parsed?.course === AI_COACH_COURSE_ID;
  if (!(parsed?.version === 1 || parsed?.version === 2 || parsed?.version === 3 || parsed?.version === 4) || !correctLesson || !Array.isArray(parsed.expressions)) return null;
  const allowedIds = new Set(fresh.expressions.map((item) => item.expression_id));
  const storedExpressions = parsed.expressions.filter((item) => allowedIds.has(item.expression_id));
  return {
    ...fresh,
    ...(parsed as Omit<CoachProfile, 'version' | 'conversation' | 'learning' | 'expressions'>),
    version: 4,
    course: fresh.course,
    lessonId: fresh.lessonId,
    currentDay: fresh.currentDay,
    expressions: fresh.expressions.map((item) => {
      const stored = storedExpressions.find((entry) => entry.expression_id === item.expression_id);
      return stored ? { ...item, ...stored, saved_for_review: stored.saved_for_review || false, review_count: stored.review_count || 0 } : item;
    }),
    conversation: parsed.conversation || { mode: 'GUIDED_TRAINING', summary: '', recentTurns: [], questions: [] },
    learning: parsed.learning || { userLevel: 'BEGINNER', preferredExplanationLanguage: 'INDONESIAN', userInitiated: [] },
  } as CoachProfile;
}

/** Read an existing scoped profile without creating or changing local data. */
export function readCoachProfileSnapshot(lesson: MandarinCoachCurriculumLesson, scope = currentMandarinLearningScope()) {
  const parsed = readScopedMandarinJson(storageBaseKey(lesson), scope) as StoredProfile | null;
  return restoreCoachProfile(parsed, lesson);
}

/** Read only profiles which already exist; useful for future favorites/review aggregation. */
export function readCoachProfileSnapshots(lessons: MandarinCoachCurriculumLesson[], scope = currentMandarinLearningScope()) {
  return lessons.flatMap((lesson) => {
    const profile = readCoachProfileSnapshot(lesson, scope);
    return profile ? [{ lesson, profile }] : [];
  });
}

export function readCoachProfile(lesson?: MandarinCoachCurriculumLesson): CoachProfile {
  const fresh = lesson ? createCoachProfile(lesson) : emptyCoachProfile();
  if (typeof window === 'undefined') return fresh;
  const restored = lesson
    ? readCoachProfileSnapshot(lesson)
    : restoreCoachProfile(readScopedMandarinJson(storageBaseKey()) as StoredProfile | null);
  return restored ?? fresh;
}

export function saveCoachProfile(profile: CoachProfile) {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  const baseKey = `indobrain:mandarin-ai-coach:${profile.lessonId}:v1`;
  const key = scopedMandarinStorageKey(baseKey);
  let persisted = next;
  try {
    const previous = JSON.parse(localStorage.getItem(key) || 'null') as Partial<CoachProfile> | null;
    if (previous?.lessonId === profile.lessonId && Array.isArray(previous.expressions)) {
      const incoming = new Map(next.expressions.map((item) => [item.expression_id, item]));
      const preserved = previous.expressions.filter((item) => !incoming.has(item.expression_id));
      persisted = { ...next, expressions: [...preserved, ...next.expressions] };
    }
  } catch {
    // A malformed local draft is safely replaced by the current lesson state.
  }
  writeScopedMandarinJson(baseKey, persisted);
  window.dispatchEvent(new Event(EVENT_NAME));
  return next;
}

export function subscribeCoachProfile(listener: () => void) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export function resetCoachProfile(lesson?: MandarinCoachCurriculumLesson) {
  const fresh = lesson ? createCoachProfile(lesson) : emptyCoachProfile();
  writeScopedMandarinJson(storageBaseKey(lesson), fresh);
  window.dispatchEvent(new Event(EVENT_NAME));
  return fresh;
}
