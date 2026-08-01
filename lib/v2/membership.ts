import type { MembershipTier } from '@/lib/v2/content-foundation';

export type SystemRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
export type LearningDirection = 'ZH_TO_ID' | 'ID_TO_ZH';
export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
export type MembershipSource = 'PAID_OFFLINE' | 'ADMIN_GRANTED' | 'LEGACY_UPGRADE' | 'ENTERPRISE_ASSIGNED' | 'PROMOTION';
export type EnterpriseRole = 'OWNER' | 'MANAGER' | 'MEMBER';

export type MembershipProfileV2 = {
  membershipTier: MembershipTier;
  membershipStatus: MembershipStatus;
  membershipStartedAt?: string;
  membershipExpiresAt?: string;
  membershipSource?: MembershipSource;
  role: SystemRole;
  learningDirection: LearningDirection;
  organizationId?: string;
  enterpriseRole?: EnterpriseRole;
  commissionOwnerAccountId?: string;
  referralSourceMemberId?: string;
};

export const membershipTierRank: Record<MembershipTier, number> = { TRIAL: 0, PRO: 1, VIP: 2, ENTERPRISE: 3 };
export const trialQuota = { experience: 50, pattern: 20, vocabulary: 200, favorites: 100, search: 50 } as const;
export const membershipTimezone = 'Asia/Jakarta';

export function meetsMembershipTier(current: MembershipTier, required: MembershipTier) {
  return membershipTierRank[current] >= membershipTierRank[required];
}

/** Server code must pass its trusted clock; browser time must never be the authority. */
export function isMembershipActive(profile: MembershipProfileV2, serverNow: Date) {
  if (profile.membershipStatus !== 'ACTIVE') return false;
  if (!profile.membershipExpiresAt) return true;
  return serverNow.getTime() < new Date(profile.membershipExpiresAt).getTime();
}

/** Add calendar months, not a fixed number of days. Asia/Jakarta has no DST. */
export function addTrialMembershipMonths(startedAt: Date, months = 6) {
  const year = startedAt.getUTCFullYear();
  const month = startedAt.getUTCMonth() + months;
  const day = Math.min(startedAt.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
  return new Date(Date.UTC(year, month, day, startedAt.getUTCHours(), startedAt.getUTCMinutes(), startedAt.getUTCSeconds(), startedAt.getUTCMilliseconds()));
}

export type UniqueResourceUsage = { resourceType: 'EXPERIENCE' | 'PATTERN' | 'VOCABULARY' | 'FAVORITE' | 'SEARCH'; resourceKey: string; firstUsedAt: string };

/** A unique (accountId, resourceType, resourceKey) database index enforces this same rule server-side. */
export function recordUniqueUsage(existing: readonly UniqueResourceUsage[], candidate: UniqueResourceUsage) {
  const alreadyRecorded = existing.some((entry) => entry.resourceType === candidate.resourceType && entry.resourceKey === candidate.resourceKey);
  return { added: !alreadyRecorded, usage: alreadyRecorded ? [...existing] : [...existing, candidate] };
}
