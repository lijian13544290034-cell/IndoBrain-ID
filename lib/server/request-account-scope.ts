import 'server-only';

import { createHash } from 'node:crypto';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { isStatelessPreviewTestMode } from '@/lib/account/config';
import { requestScopeAllowsAnonymous, type RequestAccountScopePolicy } from '@/lib/mandarin-coach-access-continuity';

const CLIENT_SESSION_PATTERN = /^[a-zA-Z0-9:_-]{8,180}$/;

export function scopedServerSessionId(userId: string | null, clientSessionId: string) {
  const owner = userId ? `account:${userId}` : 'anonymous';
  return `scope-${createHash('sha256').update(`${owner}:session:${clientSessionId}`).digest('hex').slice(0, 32)}`;
}

export async function resolveRequestAccountScope(clientSessionId: string, policy: RequestAccountScopePolicy = 'ACCOUNT_REQUIRED') {
  if (!CLIENT_SESSION_PATTERN.test(clientSessionId)) return null;
  const user = await getCurrentAccountUser();
  const statelessPreview = isStatelessPreviewTestMode();
  if (process.env.AUTH_REQUIRED === 'true' && !user && !requestScopeAllowsAnonymous(policy, statelessPreview)) return null;
  return { user, sessionId: scopedServerSessionId(user?.id || null, clientSessionId) };
}
