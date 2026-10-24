import 'server-only';

import { guestLimits } from '@/lib/account/guest-mode';

// 访客限额与匿名统计（服务端内存计数，绑定当前 Serverless 实例）。
// 说明：Vercel Preview 为多实例，内存计数是「按实例」的软上限，
// 因此同时叠加了令牌内计数（跨实例、不可伪造的签名载荷）+ 单会话轮数上限，
// 单访客的额度在任何实例上都生效；全站日预算是额外的兜底熔断。
const MAX_TRACKED = 5000;

type DayBucket = { date: string; count: number };
type Metrics = { sessions: number; conversations: number; errors: number; activeSessions: Set<string>; sessionStartedAt: Map<string, number> };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function useBucket(map: Map<string, DayBucket>, key: string, limit: number) {
  const date = todayKey();
  const current = map.get(key);
  if (!current || current.date !== date) {
    map.set(key, { date, count: 1 });
    return { allowed: true, used: 1 };
  }
  if (current.count >= limit) return { allowed: false, used: current.count };
  current.count += 1;
  return { allowed: true, used: current.count };
}

const g = globalThis as unknown as {
  __ibGuest?: {
    dailySessions: Map<string, DayBucket>;
    dailyConversations: Map<string, DayBucket>;
    ipSessions: Map<string, DayBucket>;
    metrics: Metrics;
  };
};

function state() {
  if (!g.__ibGuest) {
    g.__ibGuest = {
      dailySessions: new Map(),
      dailyConversations: new Map(),
      ipSessions: new Map(),
      metrics: { sessions: 0, conversations: 0, errors: 0, activeSessions: new Set(), sessionStartedAt: new Map() },
    };
  }
  return g.__ibGuest;
}

function trim(map: Map<string, unknown>) {
  if (map.size <= MAX_TRACKED) return;
  for (const key of [...map.keys()].slice(0, map.size - MAX_TRACKED)) map.delete(key);
}

export function registerGuestSession(ipKey: string) {
  const limits = guestLimits();
  const store = state();
  const perIp = useBucket(store.ipSessions, ipKey, limits.sessionsPerIpPerDay);
  if (!perIp.allowed) return { allowed: false as const, reason: 'IP_DAILY_LIMIT' as const };
  const daily = useBucket(store.dailySessions, todayKey(), limits.sessionsPerDay);
  if (!daily.allowed) return { allowed: false as const, reason: 'GLOBAL_DAILY_SESSION_LIMIT' as const };
  store.metrics.sessions += 1;
  trim(store.ipSessions);
  return { allowed: true as const };
}

export function consumeGuestTurn(guestId: string, sessionTokenCount: number) {
  const limits = guestLimits();
  if (sessionTokenCount >= limits.conversationPerSession) {
    return { allowed: false as const, reason: 'SESSION_TURN_LIMIT' as const };
  }
  const store = state();
  const daily = useBucket(store.dailyConversations, todayKey(), limits.conversationPerDay);
  if (!daily.allowed) return { allowed: false as const, reason: 'GLOBAL_DAILY_BUDGET' as const };
  store.metrics.conversations += 1;
  store.metrics.activeSessions.add(guestId);
  if (!store.metrics.sessionStartedAt.has(guestId)) store.metrics.sessionStartedAt.set(guestId, Date.now());
  trim(store.metrics.sessionStartedAt);
  return { allowed: true as const };
}

export function recordGuestError() {
  state().metrics.errors += 1;
}

export function guestMetricsSnapshot() {
  const store = state();
  const limits = guestLimits();
  const today = todayKey();
  const conversationsToday = store.dailyConversations.get(today)?.date === today ? store.dailyConversations.get(today)!.count : 0;
  const sessionsToday = store.dailySessions.get(today)?.date === today ? store.dailySessions.get(today)!.count : 0;
  const now = Date.now();
  const durations = [...store.metrics.sessionStartedAt.values()].map((startedAt) => Math.round((now - startedAt) / 1000));
  const totalTurns = store.metrics.conversations;
  return {
    generatedAt: new Date().toISOString(),
    scope: 'runtime-instance',
    guests: {
      sessionsTotal: store.metrics.sessions,
      sessionsToday,
      activeSessions: store.metrics.activeSessions.size,
    },
    conversations: {
      total: totalTurns,
      today: conversationsToday,
      averagePerSession: store.metrics.sessions ? Number((totalTurns / store.metrics.sessions).toFixed(2)) : 0,
    },
    usage: {
      averageSessionSeconds: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0,
      longestSessionSeconds: durations.length ? Math.max(...durations) : 0,
    },
    errors: {
      total: store.metrics.errors,
      rate: totalTurns ? Number((store.metrics.errors / (totalTurns + store.metrics.errors)).toFixed(4)) : 0,
    },
    limits: {
      conversationPerSession: limits.conversationPerSession,
      conversationPerDay: limits.conversationPerDay,
      sessionsPerDay: limits.sessionsPerDay,
      sessionsPerIpPerDay: limits.sessionsPerIpPerDay,
      sessionTtlSeconds: limits.ttlSeconds,
      remainingGlobalTurnsToday: Math.max(0, limits.conversationPerDay - conversationsToday),
    },
  };
}
