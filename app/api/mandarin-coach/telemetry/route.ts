import { AI_COACH_COURSE_ID, type CoachEventName } from '@/lib/mandarin-ai-coach';
import { saveCoachTelemetryEvent } from '@/lib/server/mandarin-coach-analytics';
import { resolveRequestAccountScope } from '@/lib/server/request-account-scope';

export const runtime = 'nodejs';

const allowedEvents = new Set<CoachEventName>([
  'start_session', 'finish_session', 'expression_started', 'expression_pass', 'expression_retry', 'expression_failed', 'audio_play', 'voice_attempt',
  'comprehension_correct', 'comprehension_wrong', 'roleplay_started', 'roleplay_completed', 'coach_conversation_opened', 'coach_question_submitted',
  'coach_answer_received', 'coach_answer_helpful', 'coach_answer_unresolved', 'expression_saved_for_review', 'coach_slow_audio_requested',
  'coach_skill_gap', 'coach_response_audio_play', 'first_coach_message',

]);
const reservedKeys = new Set(['anonymous_id', 'tester_id', 'user_id', 'session_id', 'event', 'created_at']);

function sanitizeData(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>).filter(([key]) => !reservedKeys.has(key)).slice(0, 32)) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(key)) continue;
    if (typeof item === 'string') result[key] = item.slice(0, 500);
    else if (typeof item === 'number' && Number.isFinite(item)) result[key] = item;
    else if (typeof item === 'boolean' || item === null) result[key] = item;
    else if (Array.isArray(item)) result[key] = item.slice(0, 30).map((entry) => String(entry).slice(0, 160));
  }
  return result;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { sessionId?: unknown; event?: unknown; data?: unknown } | null;
  if (!body || typeof body.sessionId !== 'string' || typeof body.event !== 'string' || !allowedEvents.has(body.event as CoachEventName)) return Response.json({ error: 'Invalid telemetry event.' }, { status: 400 });
  const scope = await resolveRequestAccountScope(body.sessionId);
  if (!scope) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  const safeData = sanitizeData(body.data);
  const lessonId = typeof safeData.lesson_id === 'string' ? safeData.lesson_id.slice(0, 120) : AI_COACH_COURSE_ID;
  console.info('[mandarin-ai-coach-event]', { course: lessonId, event: body.event, sessionKey: scope.sessionId.slice(-16) });
  const database = await saveCoachTelemetryEvent({ sessionId: scope.sessionId, userId: scope.user?.id || null, event: body.event, data: safeData });
  return Response.json({ accepted: true, recorded: database.saved ? 'supabase+vercel-observability' : 'vercel-observability' });
}
