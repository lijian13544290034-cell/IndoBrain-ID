import 'server-only';

import { createHash } from 'node:crypto';
import { anonymizeLearningQuestion } from '@/lib/server/mandarin-ai-coach';
import { readFromSupabase, saveToSupabase } from '@/lib/supabase-server';

const interactionRole = 'mandarin_coach_v1';
const eventRole = 'mandarin_coach_event';

type StoredConversation = {
  session_id: string;
  role_type: string;
  user_message: string;
  assistant_message: string;
  created_at: string;
};

export function anonymousCoachId(sessionId: string) {
  return createHash('sha256').update(sessionId).digest('hex').slice(0, 20);
}

function safeJson(value: unknown) {
  try { return JSON.stringify(value); } catch { return '{}'; }
}

export async function saveCoachInteraction(input: {
  sessionId: string;
  userId?: string | null;
  inputMode: 'VOICE' | 'TEXT';
  userMessage: string;
  assistantMessage: string;
  detectedLanguage: string;
  intent: string;
  skills: string[];
  currentDay: number;
  currentExpression: string | null;
  answerCategory: string;
  targetChinese: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  structuredRetries: number;
  safeFallbacks: number;
  sttSeconds: number;
  responseLatencyMs: number;
  messageCount: number;
  sessionDurationSeconds: number;
  offTopic: boolean;
}) {
  const anonymousId = anonymousCoachId(input.sessionId);
  const userPayload = {
    version: 1,
    anonymous_id: anonymousId,
    user_id: input.userId || null,
    input_mode: input.inputMode,
    input_language: input.detectedLanguage,
    user_message: anonymizeLearningQuestion(input.userMessage),
    intent: input.intent,
    skill_used: input.skills,
    day: input.currentDay,
    current_expression: input.currentExpression,
    target_chinese: input.targetChinese,
    off_topic: input.offTopic,
    speech_duration: input.sttSeconds,
    message_count: input.messageCount,
    session_duration: input.sessionDurationSeconds,
  };
  const assistantPayload = {
    version: 1,
    ai_response: anonymizeLearningQuestion(input.assistantMessage),
    answer_category: input.answerCategory,
    model: input.model,
    input_tokens: input.inputTokens,
    output_tokens: input.outputTokens,
    estimated_cost: input.estimatedCost,
    structured_retries: input.structuredRetries,
    safe_fallbacks: input.safeFallbacks,
    response_latency: input.responseLatencyMs,
  };
  try {
    return await saveToSupabase('conversations', {
      session_id: anonymousId,
      role_type: interactionRole,
      user_message: safeJson(userPayload),
      assistant_message: safeJson(assistantPayload),
    });
  } catch (error) {
    console.warn('[mandarin-coach-analytics-write]', { kind: 'interaction', message: error instanceof Error ? error.message : 'unknown' });
    return { saved: false, reason: 'write_failed' as const };
  }
}

export async function saveCoachTelemetryEvent(input: { sessionId: string; event: string; data: Record<string, unknown> }) {
  const anonymousId = anonymousCoachId(input.sessionId);
  try {
    return await saveToSupabase('conversations', {
      session_id: anonymousId,
      role_type: eventRole,
      user_message: safeJson({ version: 1, anonymous_id: anonymousId, event: input.event, ...input.data }),
      assistant_message: '{}',
    });
  } catch (error) {
    console.warn('[mandarin-coach-analytics-write]', { kind: 'event', message: error instanceof Error ? error.message : 'unknown' });
    return { saved: false, reason: 'write_failed' as const };
  }
}

function parse(value: string) {
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function top(values: string[], limit = 8) {
  const counts = new Map<string, number>();
  for (const value of values.map((item) => item.trim()).filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, limit);
}

export async function readCoachAnalytics() {
  const query = 'conversations?role_type=in.(mandarin_coach_v1,mandarin_coach_event)&select=session_id,role_type,user_message,assistant_message,created_at&order=created_at.desc&limit=1000';
  const result = await readFromSupabase<StoredConversation>(query);
  if (!result.configured) return { configured: false as const };
  const rows = result.rows;
  const todayKey = new Date().toISOString().slice(0, 10);
  const interactions = rows.filter((row) => row.role_type === interactionRole).map((row) => ({ row, user: parse(row.user_message), assistant: parse(row.assistant_message) }));
  const events = rows.filter((row) => row.role_type === eventRole).map((row) => ({ row, data: parse(row.user_message) }));
  const today = interactions.filter(({ row }) => row.created_at.slice(0, 10) === todayKey);
  const todayEvents = events.filter(({ row }) => row.created_at.slice(0, 10) === todayKey);
  const todaySessions = new Set(today.map(({ row }) => row.session_id));
  const allSessionDates = new Map<string, Set<string>>();
  for (const { row } of interactions) {
    if (!allSessionDates.has(row.session_id)) allSessionDates.set(row.session_id, new Set());
    allSessionDates.get(row.session_id)!.add(row.created_at.slice(0, 10));
  }
  const returning = [...allSessionDates.values()].filter((dates) => dates.size > 1).length;
  const sessionDurations = todayEvents.filter(({ data }) => data.event === 'finish_session').map(({ data }) => Number(data.session_duration || 0)).filter(Number.isFinite);
  const costs = today.reduce((sum, { assistant }) => sum + Number(assistant.estimated_cost || 0), 0);
  const recentUsers = [...new Set(interactions.map(({ row }) => row.session_id))].slice(0, 20).map((id) => {
    const userRows = interactions.filter(({ row }) => row.session_id === id);
    const userEvents = events.filter(({ row }) => row.session_id === id);
    return {
      anonymousId: id,
      lastSeen: userRows[0]?.row.created_at || '',
      learningDays: new Set(userRows.map(({ row }) => row.created_at.slice(0, 10))).size,
      interactions: userRows.length,
      commonIntents: top(userRows.map(({ user }) => String(user.intent || '')), 3),
      favorites: userEvents.filter(({ data }) => data.event === 'expression_saved_for_review').length,
      recentQuestions: userRows.slice(0, 5).map(({ user }) => String(user.user_message || '')).filter(Boolean),
    };
  });
  return {
    configured: true as const,
    today: {
      activeUsers: todaySessions.size,
      newUsers: [...todaySessions].filter((id) => (allSessionDates.get(id)?.size || 0) === 1).length,
      conversationUsers: todaySessions.size,
      interactions: today.length,
      interactionsPerUser: todaySessions.size ? Number((today.length / todaySessions.size).toFixed(1)) : 0,
      voiceInteractions: today.filter(({ user }) => user.input_mode === 'VOICE').length,
      textInteractions: today.filter(({ user }) => user.input_mode === 'TEXT').length,
      averageSessionSeconds: sessionDurations.length ? Math.round(sessionDurations.reduce((sum, item) => sum + item, 0) / sessionDurations.length) : 0,
      returningUsers: returning,
      offTopic: today.filter(({ user }) => user.off_topic === true).length,
      estimatedCost: Number(costs.toFixed(6)),
    },
    topQuestions: top(interactions.map(({ user }) => String(user.user_message || ''))),
    topChinese: top(interactions.map(({ user }) => String(user.target_chinese || ''))),
    topIntents: top(interactions.map(({ user }) => String(user.intent || ''))),
    topErrors: top(events.filter(({ data }) => ['expression_retry', 'expression_failed'].includes(String(data.event))).map(({ data }) => String(data.expression_id || ''))),
    favorites: top(events.filter(({ data }) => data.event === 'expression_saved_for_review').map(({ data }) => String(data.expression_id || ''))),
    recentUsers,
  };
}
