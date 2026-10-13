import 'server-only';

import { createHash } from 'node:crypto';
import { getCurrentAccountUser } from '@/lib/account/auth';

const CLIENT_SESSION_PATTERN = /^[a-zA-Z0-9:_-]{8,180}$/;

export function scopedServerSessionId(userId: string | null, clientSessionId: string) {
  const owner = userId ? `account:${userId}` : 'anonymous';
  return `scope-${createHash('sha256').update(`${owner}:session:${clientSessionId}`).digest('hex').slice(0, 32)}`;
}

export async function resolveRequestAccountScope(clientSessionId: string) {
  if (!CLIENT_SESSION_PATTERN.test(clientSessionId)) return null;
  const user = await getCurrentAccountUser();
  if (process.env.AUTH_REQUIRED === 'true' && !user) return null;
  return { user, sessionId: scopedServerSessionId(user?.id || null, clientSessionId) };
}
