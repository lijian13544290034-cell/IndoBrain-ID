'use client';

import { AI_COACH_COURSE_ID, emptyCoachProfile, type CoachProfile } from '@/lib/mandarin-ai-coach';

const STORAGE_KEY = 'indobrain:mandarin-ai-coach-day1:v1';
const EVENT_NAME = 'indobrain:mandarin-ai-coach-profile';

export function readCoachProfile(): CoachProfile {
  if (typeof window === 'undefined') return emptyCoachProfile();
  try {
    type StoredProfile = Omit<Partial<CoachProfile>, 'version' | 'conversation' | 'learning'> & { version?: 1 | 2 | 3; conversation?: CoachProfile['conversation']; learning?: CoachProfile['learning'] };
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as StoredProfile | null;
    if ((parsed?.version === 1 || parsed?.version === 2 || parsed?.version === 3) && parsed.course === AI_COACH_COURSE_ID && Array.isArray(parsed.expressions)) {
      return {
        ...(parsed as Omit<CoachProfile, 'version' | 'conversation' | 'learning'>),
        version: 3,
        expressions: parsed.expressions.map((item) => ({ ...item, saved_for_review: item.saved_for_review || false, review_count: item.review_count || 0 })),
        conversation: parsed.conversation || { mode: 'GUIDED_TRAINING', summary: '', recentTurns: [], questions: [] },
        learning: parsed.learning || { userLevel: 'BEGINNER', preferredExplanationLanguage: 'INDONESIAN', userInitiated: [] },
      } as CoachProfile;
    }
  } catch {
    // A malformed local draft is replaced with a clean isolated profile.
  }
  const fresh = emptyCoachProfile();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveCoachProfile(profile: CoachProfile) {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
  return next;
}

export function subscribeCoachProfile(listener: () => void) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export function resetCoachProfile() {
  const fresh = emptyCoachProfile();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  window.dispatchEvent(new Event(EVENT_NAME));
  return fresh;
}
