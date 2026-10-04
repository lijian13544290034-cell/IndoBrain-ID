import { createHash } from 'node:crypto';
import { AI_COACH_COURSE_ID, type CoachEventName } from '@/lib/mandarin-ai-coach';
import { saveCoachTelemetryEvent } from '@/lib/server/mandarin-coach-analytics';

export const runtime = 'nodejs';

const allowedEvents = new Set<CoachEventName>([
  'start_session', 'finish_session', 'expression_started', 'expression_pass', 'expression_retry',
  'expression_failed', 'audio_play', 'voice_attempt', 'comprehension_correct', 'comprehension_wrong',
  'roleplay_started', 'roleplay_completed', 'coach_conversation_opened', 'coach_question_submitted',
  'coach_answer_received', 'coach_answer_helpful', 'coach_answer_unresolved',
  'expression_saved_for_review', 'coach_slow_audio_requested', 'coach_skill_gap', 'coach_response_audio_play',
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { sessionId?: unknown; event?: unknown; data?: unknown } | null;
  if (!body || typeof body.sessionId !== 'string' || !body.sessionId.startsWith('coach-') || typeof body.event !== 'string' || !allowedEvents.has(body.event as CoachEventName)) {
    return Response.json({ error: 'Invalid telemetry event.' }, { status: 400 });
  }
  const safeData = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  const sessionKey = createHash('sha256').update(body.sessionId).digest('hex').slice(0, 16);
  console.info('[mandarin-ai-coach-event]', {
    course: AI_COACH_COURSE_ID,
    event: body.event,
    sessionKey,
    ...safeData,
  });
  const database = await saveCoachTelemetryEvent({ sessionId: body.sessionId, event: body.event, data: safeData as Record<string, unknown> });
  return Response.json({ accepted: true, recorded: database.saved ? 'supabase+vercel-observability' : 'vercel-observability' });
}
