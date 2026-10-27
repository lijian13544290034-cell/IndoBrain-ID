import { isGuestModeEnabled } from '@/lib/account/guest-mode';

/**
 * Native Coach V1 is an isolated Preview experiment.
 * Production stays on Legacy even if the environment variable is copied by mistake.
 */
export function isNativeCoachV1Enabled() {
  return process.env.VERCEL_ENV === 'preview'
    && process.env.NATIVE_COACH_V1 === 'true'
    && isGuestModeEnabled();
}
