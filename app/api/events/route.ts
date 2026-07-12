import { NextResponse } from 'next/server';
import { saveToSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.session_id || !body.experience_id || !body.action) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }
    const result = await saveToSupabase('experience_events', body);
    if (body.action === 'viewed') {
      const module_type = String(body.experience_id).split('-')[1]?.toLowerCase() || 'unknown';
      await saveToSupabase('learning_progress', { session_id: body.session_id, module_type, experience_id: body.experience_id, progress_value: 1 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ saved: false, error: 'Unable to save event' }, { status: 500 });
  }
}
