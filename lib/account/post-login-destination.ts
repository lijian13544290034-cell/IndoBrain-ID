import type { LearningDirection } from './types';

type PostLoginUser = {
  isSuperAdmin: boolean;
  learningDirection?: LearningDirection | string | null;
  mustChangePassword: boolean;
};

function defaultLearnerDestination(direction: PostLoginUser['learningDirection']) {
  return direction === 'ID_TO_ZH' ? '/learn-chinese' : '/';
}

/** Accept same-site page destinations only; never turn `next` into an open redirect. */
export function safePostLoginDestination(value?: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;

  try {
    const origin = 'https://indobrain.invalid';
    const parsed = new URL(value, origin);
    if (parsed.origin !== origin) return null;
    if (parsed.pathname === '/login' || parsed.pathname.startsWith('/login/')) return null;
    if (parsed.pathname === '/change-initial-password' || parsed.pathname.startsWith('/api/')) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function resolvePostLoginDestination(user: PostLoginUser, requestedDestination?: string | null) {
  if (user.mustChangePassword) return '/change-initial-password';

  const fallback = user.isSuperAdmin ? '/admin' : defaultLearnerDestination(user.learningDirection);
  const destination = safePostLoginDestination(requestedDestination);
  if (!destination) return fallback;

  const pathname = new URL(destination, 'https://indobrain.invalid').pathname;
  const requestsAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  if (requestsAdmin && !user.isSuperAdmin) return fallback;

  return destination;
}
