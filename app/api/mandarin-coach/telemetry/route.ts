import { AI_COACH_COURSE_ID, type CoachEventName } from '@/lib/mandarin-ai-coach';
import { saveToSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const allowedEvents = new Set<CoachEventName>([
  'start_session', 'finish_session', 'expression_started', 'expression_pass', 'expression_retry',
  'expression_failed', 'audio_play', 'voice_attempt', 'comprehension_correct', 'comprehension_wrong',
  'roleplay_started', 'roleplay_completed',
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { sessionId?: unknown; event?: unknown; data?: unknown } | null;
  if (!body || typeof body.sessionId !== 'string' || !body.sessionId.startsWith('coach-') || typeof body.event !== 'string' || !allowedEvents.has(body.event as CoachEventName)) {
    return Response.json({ error: 'Invalid telemetry event.' }, { status: 400 });
  }
  const safeData = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  try {
    const result = await saveToSupabase('conversations', {
      session_id: body.sessionId.slice(0, 120),
      role_type: 'mandarin-ai-coach-event',
      user_message: body.event,
      assistant_message: JSON.stringify({ course: AI_COACH_COURSE_ID, ...safeData }).slice(0, 8000),
    });
    return Response.json({ accepted: true, persisted: result.saved });
  } catch {
    return Response.json({ accepted: true, persisted: false });
  }
}
