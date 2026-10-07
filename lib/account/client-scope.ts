'use client';

export const LEARNING_SCOPE_POINTER = 'indobrain_learning_profile_scope';

export function currentLearningScope() {
  if (typeof window === 'undefined') return 'guest';
  return (localStorage.getItem(LEARNING_SCOPE_POINTER) || 'guest').replace(/[^a-zA-Z0-9:_-]/g, '_').slice(0, 160);
}

export function scopedClientStorageKey(base: string) {
  return `${base}:${currentLearningScope()}`;
}
