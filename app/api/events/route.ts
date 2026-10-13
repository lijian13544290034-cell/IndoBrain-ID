import { NextResponse } from 'next/server';
import { resolveRequestAccountScope } from '@/lib/server/request-account-scope';
import { saveToSupabase } from '@/lib/supabase-server';

const ALLOWED_ACTIONS = new Set(['viewed', 'favorite', 'unfavorite', 'completed', 'next_clicked', 'previous_clicked', 'tts_played', 'experience_copied']);

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const clientSessionId = typeof body.session_id === 'string' ? body.session_id : '';
    const experienceId = typeof body.experience_id === 'string' ? body.experience_id : '';
    const action = typeof body.action === 'string' ? body.action : '';
    if (!experienceId || experienceId.length > 120 || !ALLOWED_ACTIONS.has(action)) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    const scope = await resolveRequestAccountScope(clientSessionId);
    if (!scope) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const result = await saveToSupabase('experience_events', { session_id: scope.sessionId, experience_id: experienceId, action });
    if (action === 'viewed') {
      const moduleType = experienceId.split('-')[1]?.toLowerCase() || 'unknown';
      await saveToSupabase('learning_progress', { session_id: scope.sessionId, module_type: moduleType.slice(0, 80), experience_id: experienceId, progress_value: 1 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ saved: false, error: 'Unable to save event' }, { status: 500 });
  }
}
