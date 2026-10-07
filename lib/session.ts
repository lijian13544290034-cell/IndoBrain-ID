export const sessionStorageKey = 'indobrain_session_id';

function key() {
  if (typeof window === 'undefined') return `${sessionStorageKey}:guest`;
  const scope = window.localStorage.getItem('indobrain_learning_profile_scope') || 'guest';
  return `${sessionStorageKey}:${scope}`;
}

export function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(key());
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key(), id);
  }
  return id;
}
