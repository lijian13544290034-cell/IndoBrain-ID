'use client';

export const publicCoreProfileStorageKey = 'mandarin-v2:public-core-30:profile:v1';
export const publicCoreProfileEvent = 'indobrain:mandarin-v2:public-core-30-profile';

export type PublicCoreProfile = {
  favorites: string[];
  learned: string[];
};

export function emptyPublicCoreProfile(): PublicCoreProfile {
  return { favorites: [], learned: [] };
}

function normalizeIds(value: unknown, pattern: RegExp) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && pattern.test(item)))];
}

export function readPublicCoreProfile(): PublicCoreProfile {
  if (typeof window === 'undefined') return emptyPublicCoreProfile();
  try {
    const stored = JSON.parse(window.localStorage.getItem(publicCoreProfileStorageKey) ?? '{}') as Partial<PublicCoreProfile>;
    return {
      favorites: normalizeIds(stored.favorites, /^mandarin-v2:CN-HF-\d{3}$/),
      learned: normalizeIds(stored.learned, /^CN-HF-\d{3}$/),
    };
  } catch {
    return emptyPublicCoreProfile();
  }
}

function writePublicCoreProfile(profile: PublicCoreProfile) {
  window.localStorage.setItem(publicCoreProfileStorageKey, JSON.stringify(profile));
  window.dispatchEvent(new Event(publicCoreProfileEvent));
  return profile;
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function togglePublicCoreFavorite(id: string) {
  const profile = readPublicCoreProfile();
  return writePublicCoreProfile({ ...profile, favorites: toggle(profile.favorites, `mandarin-v2:${id}`) });
}

export function togglePublicCoreLearned(id: string) {
  const profile = readPublicCoreProfile();
  return writePublicCoreProfile({ ...profile, learned: toggle(profile.learned, id) });
}

export function subscribePublicCoreProfile(listener: () => void) {
  const syncStorage = (event: StorageEvent) => {
    if (event.key === publicCoreProfileStorageKey) listener();
  };
  window.addEventListener('storage', syncStorage);
  window.addEventListener(publicCoreProfileEvent, listener);
  return () => {
    window.removeEventListener('storage', syncStorage);
    window.removeEventListener(publicCoreProfileEvent, listener);
  };
}
