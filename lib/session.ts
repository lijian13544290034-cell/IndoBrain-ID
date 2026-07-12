export const sessionStorageKey = 'indobrain_session_id';

export function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(sessionStorageKey);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(sessionStorageKey, id);
  }
  return id;
}
