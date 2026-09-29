'use client';

import { MANDARIN_WORK_NAMESPACE } from '@/lib/mandarin-work-course';

export type MandarinWorkProfile = { completedDays: number[]; currentDay: number; completedItems: string[]; favorites: string[] };
const eventName = 'mandarin-work-profile-updated';
const identityPointer = 'indobrain_learning_profile_scope';

function key() {
  const identity = typeof window === 'undefined' ? 'guest' : window.localStorage.getItem(identityPointer) || 'guest';
  return `${MANDARIN_WORK_NAMESPACE}:profile:${identity}`;
}

export function emptyMandarinWorkProfile(): MandarinWorkProfile { return { completedDays: [], currentDay: 1, completedItems: [], favorites: [] }; }
export function readMandarinWorkProfile(): MandarinWorkProfile {
  if (typeof window === 'undefined') return emptyMandarinWorkProfile();
  try {
    const value = JSON.parse(window.localStorage.getItem(key()) || '{}') as Partial<MandarinWorkProfile>;
    return { completedDays: [...new Set(value.completedDays ?? [])], currentDay: Math.min(60, Math.max(1, value.currentDay ?? 1)), completedItems: [...new Set(value.completedItems ?? [])], favorites: [...new Set(value.favorites ?? [])] };
  } catch { return emptyMandarinWorkProfile(); }
}
function save(profile: MandarinWorkProfile) { window.localStorage.setItem(key(), JSON.stringify(profile)); window.dispatchEvent(new Event(eventName)); return profile; }
export function completeMandarinItem(id: string) { const profile = readMandarinWorkProfile(); return save({ ...profile, completedItems: [...new Set([...profile.completedItems, id])] }); }
export function completeMandarinDay(day: number) { const profile = readMandarinWorkProfile(); return save({ ...profile, completedDays: [...new Set([...profile.completedDays, day])], currentDay: Math.min(60, Math.max(profile.currentDay, day + 1)) }); }
export function toggleMandarinFavorite(id: string) { const profile = readMandarinWorkProfile(); const exists = profile.favorites.includes(id); return save({ ...profile, favorites: exists ? profile.favorites.filter((item) => item !== id) : [...profile.favorites, id] }); }
export function subscribeMandarinWorkProfile(callback: () => void) { window.addEventListener(eventName, callback); window.addEventListener('storage', callback); return () => { window.removeEventListener(eventName, callback); window.removeEventListener('storage', callback); }; }
