'use client';

import { AI_COACH_COURSE_ID, createCoachProfile, emptyCoachProfile, type CoachProfile } from '@/lib/mandarin-ai-coach';
import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';

const LEGACY_STORAGE_KEY = 'indobrain:mandarin-ai-coach-day1:v1';
const EVENT_NAME = 'indobrain:mandarin-ai-coach-profile';
const storageKey = (lesson?: MandarinCoachCurriculumLesson) => lesson ? `indobrain:mandarin-ai-coach:${lesson.id}:v1` : LEGACY_STORAGE_KEY;

export function readCoachProfile(lesson?: MandarinCoachCurriculumLesson): CoachProfile {
  const fresh = lesson ? createCoachProfile(lesson) : emptyCoachProfile();
  if (typeof window === 'undefined') return fresh;
  try {
    type StoredProfile = Omit<Partial<CoachProfile>, 'version' | 'conversation' | 'learning'> & { version?: 1 | 2 | 3 | 4; conversation?: CoachProfile['conversation']; learning?: CoachProfile['learning'] };
    const key = storageKey(lesson);
    const legacy = lesson?.day === 1 ? localStorage.getItem(LEGACY_STORAGE_KEY) : null;
    const parsed = JSON.parse(localStorage.getItem(key) || legacy || 'null') as StoredProfile | null;
    const correctLesson = lesson ? parsed?.lessonId === lesson.id || (!parsed?.lessonId && lesson.day === 1 && parsed?.course === AI_COACH_COURSE_ID) : parsed?.course === AI_COACH_COURSE_ID;
    if ((parsed?.version === 1 || parsed?.version === 2 || parsed?.version === 3 || parsed?.version === 4) && correctLesson && Array.isArray(parsed.expressions)) {
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
  } catch {
    // A malformed local draft is replaced with a clean isolated profile.
  }
  localStorage.setItem(storageKey(lesson), JSON.stringify(fresh));
  return fresh;
}

export function saveCoachProfile(profile: CoachProfile) {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  localStorage.setItem(`indobrain:mandarin-ai-coach:${profile.lessonId}:v1`, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
  return next;
}

export function subscribeCoachProfile(listener: () => void) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export function resetCoachProfile(lesson?: MandarinCoachCurriculumLesson) {
  const fresh = lesson ? createCoachProfile(lesson) : emptyCoachProfile();
  localStorage.setItem(storageKey(lesson), JSON.stringify(fresh));
  window.dispatchEvent(new Event(EVENT_NAME));
  return fresh;
}
