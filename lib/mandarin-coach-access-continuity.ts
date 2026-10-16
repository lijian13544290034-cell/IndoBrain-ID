export type RequestAccountScopePolicy = 'ACCOUNT_REQUIRED' | 'ANONYMOUS_TRIAL_ALLOWED' | 'EXTERNAL_ACCESS_VERIFIED';
export type SkippableCoachPhase = 'RECALL' | 'COMPREHENSION' | 'ROLEPLAY';
export type CoachPhaseAfterSkip = 'COMPREHENSION' | 'ROLEPLAY' | 'COMPLETE';

export function requestScopeAllowsAnonymous(policy: RequestAccountScopePolicy, statelessPreview: boolean) {
  return statelessPreview || policy === 'ANONYMOUS_TRIAL_ALLOWED' || policy === 'EXTERNAL_ACCESS_VERIFIED';
}

export function nextPhaseAfterSkippedAssessment(
  phase: SkippableCoachPhase,
  options: { hasMeaningOptions: boolean; hasRoleplay: boolean },
): CoachPhaseAfterSkip {
  if (phase === 'RECALL' && options.hasMeaningOptions) return 'COMPREHENSION';
  if (phase !== 'ROLEPLAY' && options.hasRoleplay) return 'ROLEPLAY';
  return 'COMPLETE';
}
