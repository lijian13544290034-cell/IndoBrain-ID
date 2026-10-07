import { createHash } from 'node:crypto';
import { AI_COACH_COURSE_ID, type CoachEventName } from '@/lib/mandarin-ai-coach';
import { saveCoachTelemetryEvent } from '@/lib/server/mandarin-coach-analytics';
import { getCurrentAccountUser } from '@/lib/account/auth';

export const runtime = 'nodejs';

const allowedEvents = new Set<CoachEventName>([
  'start_session', 'finish_session', 'expression_started', 'expression_pass', 'expression_retry',
  'expression_failed', 'audio_play', 'voice_attempt', 'comprehension_correct', 'comprehension_wrong',
  'roleplay_started', 'roleplay_completed', 'coach_conversation_opened', 'coach_question_submitted',
  'coach_answer_received', 'coach_answer_helpful', 'coach_answer_unresolved',
  'expression_saved_for_review', 'coach_slow_audio_requested', 'coach_skill_gap', 'coach_response_audio_play',
  'learner_profile_updated', 'personal_plan_generated', 'knowledge_gap_demand',
  'adaptive_mastery_updated', 'next_best_action_selected', 'career_goal_changed',
  'first_coach_message',
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { sessionId?: unknown; event?: unknown; data?: unknown } | null;
  if (!body || typeof body.sessionId !== 'string' || !body.sessionId.startsWith('coach-') || typeof body.event !== 'string' || !allowedEvents.has(body.event as CoachEventName)) {
    return Response.json({ error: 'Invalid telemetry event.' }, { status: 400 });
  }
  const safeData = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  const lessonId = 'lesson_id' in safeData && typeof safeData.lesson_id === 'string' ? safeData.lesson_id.slice(0, 120) : AI_COACH_COURSE_ID;
  const sessionKey = createHash('sha256').update(body.sessionId).digest('hex').slice(0, 16);
  console.info('[mandarin-ai-coach-event]', {
    course: lessonId,
    event: body.event,
    sessionKey,
    ...safeData,
  });
  const currentUser = await getCurrentAccountUser();
  const database = await saveCoachTelemetryEvent({ sessionId: body.sessionId, userId: currentUser?.id || null, event: body.event, data: safeData as Record<string, unknown> });
  return Response.json({ accepted: true, recorded: database.saved ? 'supabase+vercel-observability' : 'vercel-observability' });
}
