import { NextResponse } from 'next/server';
import { saveToSupabase } from '@/lib/supabase-server';

const EXPERIENCE_OPTIONS = new Set(['😊 Mudah dipahami', '🙂 Cukup baik', '😐 Biasa saja', '😕 Agak sulit']);
const IMPROVEMENT_OPTIONS = new Set(['🔊 Audio / pengucapan', '🔤 Pinyin', '🇨🇳 Materi Mandarin', '🇮🇩 Penjelasan Bahasa Indonesia', '📱 Tampilan', '📚 Tingkat kesulitan', '💡 Lainnya']);

function isMandarinWorkFeedback(body: Record<string, unknown>) {
  return body.course === 'mandarin-work-30d';
}

async function saveMandarinWorkFeedback(body: Record<string, unknown>) {
  const day = Number(body.day);
  const level = body.level == null ? (day > 30 ? 2 : 1) : Number(body.level);
  const itemId = body.itemId === null || body.itemId === undefined ? null : String(body.itemId);
  const page = String(body.page ?? '');
  const experience = String(body.experience ?? '');
  const improvements = Array.isArray(body.improvements) ? body.improvements.map(String) : [];
  const comment = String(body.comment ?? '').trim();
  const whatsapp = String(body.whatsapp ?? '').trim();

  const valid = Number.isInteger(day) && day >= 1 && day <= 60
    && (level === 1 || level === 2)
    && EXPERIENCE_OPTIONS.has(experience)
    && improvements.length <= IMPROVEMENT_OPTIONS.size
    && improvements.every((entry) => IMPROVEMENT_OPTIONS.has(entry))
    && comment.length <= 2000
    && whatsapp.length <= 60
    && page.startsWith('/learn-chinese')
    && (itemId === null || (itemId.startsWith('CN-WORK-') && itemId.length <= 80));
  if (!valid) return NextResponse.json({ saved: false, error: 'Invalid feedback' }, { status: 400 });

  const createdAt = new Date().toISOString();
  const result = await saveToSupabase('feedback', {
    session_id: crypto.randomUUID(),
    experience_id: `mandarin-work-30d:day-${day}`,
    helpful: experience === '😊 Mudah dipahami' || experience === '🙂 Cukup baik',
    comment: JSON.stringify({ course: 'mandarin-work-30d', level, day, itemId, page, createdAt, experience, improvements, comment, whatsapp: whatsapp || null }),
  });
  if (!result.saved) return NextResponse.json({ saved: false, error: 'Feedback storage unavailable' }, { status: 503 });
  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (isMandarinWorkFeedback(body)) return await saveMandarinWorkFeedback(body);
    if (!body.session_id || !body.experience_id || typeof body.helpful !== 'boolean') {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
    }
    const result = await saveToSupabase('feedback', body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ saved: false, error: 'Unable to save feedback' }, { status: 500 });
  }
}
