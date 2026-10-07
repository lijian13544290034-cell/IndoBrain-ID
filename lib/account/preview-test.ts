import type { AccountUser } from './types';

export const PREVIEW_TEST_REGISTER_SOURCE = 'PREVIEW_TEST';

export function isPreviewTestRuntime() {
  return process.env.VERCEL_ENV === 'preview';
}

export function isPreviewTestAccount(user: Pick<AccountUser, 'account_status' | 'register_source' | 'deleted_at'>) {
  return isPreviewTestRuntime()
    && user.account_status === 'SUSPENDED'
    && user.register_source === PREVIEW_TEST_REGISTER_SOURCE
    && !user.deleted_at;
}

export function isAccountAllowedAtRuntime(user: Pick<AccountUser, 'account_status' | 'register_source' | 'deleted_at'>) {
  return (!user.deleted_at && user.account_status === 'ACTIVE') || isPreviewTestAccount(user);
}
