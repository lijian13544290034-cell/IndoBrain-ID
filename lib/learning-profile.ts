'use client';

import { getSessionId } from '@/lib/session';

export type SceneSubmissionStatus = 'pending' | 'accepted' | 'published' | 'rejected';
export type SceneSubmission = {
  id: string;
  experienceId: string;
  module: string;
  happened: string;
  wantedToSay: string;
  note?: string;
  submittedAt: string;
  status: SceneSubmissionStatus;
  helpedUserCount?: number;
};

export type LearningProfile = {
  version: 1;
  favorites: string[];
  completed: string[];
  lastLearningDate?: string;
  currentStreak: number;
  longestStreak: number;
  submissions: SceneSubmission[];
};

const storageKey = 'indobrain_learning_profile_v1';
const updateEvent = 'indobrain-learning-profile-updated';
export const createEmptyLearningProfile = (): LearningProfile => ({ version: 1, favorites: [], completed: [], currentStreak: 0, longestStreak: 0, submissions: [] });

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function previousDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() - 1);
  return value.toISOString().slice(0, 10);
}

export function inferModule(experienceId: string) {
  if (experienceId.startsWith('EXP-DRV')) return 'driver';
  if (experienceId.startsWith('EXP-NAN')) return 'nanny';
  if (experienceId.startsWith('EXP-LIF') || experienceId.startsWith('EXP-SOC')) return 'life';
  return 'factory';
}

export function readLearningProfile(): LearningProfile {
  if (typeof window === 'undefined') return createEmptyLearningProfile();
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return createEmptyLearningProfile();
    const parsed = JSON.parse(saved) as Partial<LearningProfile>;
    return { ...createEmptyLearningProfile(), ...parsed, favorites: Array.from(new Set(parsed.favorites ?? [])), completed: Array.from(new Set(parsed.completed ?? [])), submissions: parsed.submissions ?? [] };
  } catch { return createEmptyLearningProfile(); }
}

function save(profile: LearningProfile) {
  window.localStorage.setItem(storageKey, JSON.stringify(profile));
  window.dispatchEvent(new Event(updateEvent));
  return profile;
}

function recordLearningDay(profile: LearningProfile) {
  const today = localDate();
  if (profile.lastLearningDate === today) return profile;
  const currentStreak = profile.lastLearningDate === previousDate(today) ? profile.currentStreak + 1 : 1;
  return { ...profile, lastLearningDate: today, currentStreak, longestStreak: Math.max(profile.longestStreak, currentStreak) };
}

export function toggleFavorite(experienceId: string) {
  const profile = readLearningProfile();
  const exists = profile.favorites.includes(experienceId);
  const next = exists ? { ...profile, favorites: profile.favorites.filter((id) => id !== experienceId) } : recordLearningDay({ ...profile, favorites: [...profile.favorites, experienceId] });
  save(next);
  track(exists ? 'experience_unfavorited' : 'experience_favorited', experienceId);
  return { profile: next, favorited: !exists };
}

export function completeExperience(experienceId: string) {
  const profile = readLearningProfile();
  if (profile.completed.includes(experienceId)) return { profile, completed: false };
  const next = recordLearningDay({ ...profile, completed: [...profile.completed, experienceId] });
  save(next); track('experience_completed', experienceId);
  return { profile: next, completed: true };
}

export function submitScene(input: Omit<SceneSubmission, 'id' | 'submittedAt' | 'status'>) {
  const profile = readLearningProfile();
  const submission: SceneSubmission = { ...input, id: crypto.randomUUID(), submittedAt: new Date().toISOString(), status: 'pending' };
  const next = { ...profile, submissions: [submission, ...profile.submissions] };
  save(next); track('scene_cocreation_submitted', input.experienceId);
  return submission;
}

export function subscribeProfile(callback: () => void) {
  window.addEventListener(updateEvent, callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener(updateEvent, callback); window.removeEventListener('storage', callback); };
}

export function track(action: string, experienceId: string) {
  const body = JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, action });
  void fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => undefined);
}
