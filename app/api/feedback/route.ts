import { NextResponse } from 'next/server';
import { saveToSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.session_id || !body.experience_id || typeof body.helpful !== 'boolean') {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
    }
    const result = await saveToSupabase('feedback', body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ saved: false, error: 'Unable to save feedback' }, { status: 500 });
  }
}
