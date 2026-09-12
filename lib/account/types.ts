export const MEMBERSHIP_LEVELS = ['BASIC', 'PRO', 'VIP', 'ENTERPRISE', 'SVIP'] as const;
export const LEARNING_DIRECTIONS = ['ZH_TO_ID', 'ID_TO_ZH'] as const;
export const ACCOUNT_STATUSES = ['ACTIVE', 'SUSPENDED', 'DELETED'] as const;
export const ACCOUNT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'USER'] as const;

export type MembershipLevel = (typeof MEMBERSHIP_LEVELS)[number];
export type LearningDirection = (typeof LEARNING_DIRECTIONS)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export type AccountUser = {
  id: string;
  public_id: string;
  phone: string;
  display_name?: string | null;
  membership_code: MembershipLevel;
  member_level?: MembershipLevel;
  learning_direction: LearningDirection;
  account_status: AccountStatus;
  expires_at: string | null;
  expire_at?: string | null;
  device_id: string | null;
  last_login_at: string | null;
  consecutive_learning_days: number;
  completed_experiences: number;
  favorites_count: number;
  scene_contributions: number;
  register_source: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
  must_change_password?: boolean;
  created_by_batch_id?: string | null;
  initial_password_issued_at?: string | null;
  created_at: string;
};

export type AccountSession = {
  id: string;
  user_id: string;
  expires_at: string;
  revoked_at: string | null;
  users: AccountUser | AccountUser[] | null;
};

export type MembershipPlan = {
  code: MembershipLevel;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type AdminStats = {
  totalUsers: number;
  onlineUsers: number;
  activeUsersToday: number;
  activeUsersSevenDays: number;
  newUsers: number;
  membershipDistribution: Record<MembershipLevel, number>;
  expiringWithin30Days: number;
  expiredMembers: number;
  loginsToday: number;
  loginsThisWeek: number;
  learningTimeToday: number;
  completedExperiencesToday: number;
  favoritesToday: number;
  sceneContributionsToday: number;
  pendingReviews: number;
};

export type LoginHistoryEntry = {
  id: string;
  user_id: string | null;
  phone: string;
  login_at: string;
  logout_at: string | null;
  session_duration_seconds: number | null;
  device_id: string | null;
  browser: string | null;
  operating_system: string | null;
  ip_address: string | null;
  country: string | null;
  login_status: 'SUCCESS' | 'FAILED';
  failure_reason: string | null;
};
