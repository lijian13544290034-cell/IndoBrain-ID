export const MANDARIN_LEARNING_SCOPE_POINTER = 'indobrain_id_to_zh_profile_scope';
export const MANDARIN_LEARNING_SCOPE_EVENT = 'indobrain-id-to-zh-scope-updated';
export const MANDARIN_LEARNING_GUEST_SCOPE = 'guest';

export function mandarinLearningScopeForAccount(publicId: string) {
  const normalized = publicId.trim();
  if (!normalized) return MANDARIN_LEARNING_GUEST_SCOPE;
  return `${normalized}:ID_TO_ZH`;
}

export function currentMandarinLearningScope() {
  if (typeof window === 'undefined') return MANDARIN_LEARNING_GUEST_SCOPE;
  return window.sessionStorage.getItem(MANDARIN_LEARNING_SCOPE_POINTER) || MANDARIN_LEARNING_GUEST_SCOPE;
}

export function setMandarinLearningScope(scope: string) {
  if (typeof window === 'undefined') return;
  const normalized = scope.trim() || MANDARIN_LEARNING_GUEST_SCOPE;
  window.sessionStorage.setItem(MANDARIN_LEARNING_SCOPE_POINTER, normalized);
  window.dispatchEvent(new Event(MANDARIN_LEARNING_SCOPE_EVENT));
}

export function clearMandarinLearningScope() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(MANDARIN_LEARNING_SCOPE_POINTER);
  window.dispatchEvent(new Event(MANDARIN_LEARNING_SCOPE_EVENT));
}

export function scopedMandarinStorageKey(baseKey: string, scope = currentMandarinLearningScope()) {
  return `${baseKey}:scope:${encodeURIComponent(scope)}`;
}

export function readScopedMandarinJson(baseKey: string, scope = currentMandarinLearningScope()): unknown | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(scopedMandarinStorageKey(baseKey, scope));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeScopedMandarinJson(baseKey: string, value: unknown, scope = currentMandarinLearningScope()) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(scopedMandarinStorageKey(baseKey, scope), JSON.stringify(value));
}

export function removeScopedMandarinData(baseKey: string, scope = currentMandarinLearningScope()) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(scopedMandarinStorageKey(baseKey, scope));
}

