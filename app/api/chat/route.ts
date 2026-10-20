import { NextResponse } from 'next/server';
import { aiProviderStatus, generateAiReply } from '@/lib/ai-provider';
import { resolveRequestAccountScope } from '@/lib/server/request-account-scope';
import { saveToSupabase } from '@/lib/supabase-server';
import { evaluateTeachingIntent, teachingIntentGuardReply } from '@/lib/teaching-intent-guard';

const prompts: Record<string, string> = {
  driver: 'You teach Chinese users practical Indonesian for communicating with drivers. Use natural WhatsApp Indonesian with a concise Chinese explanation. Stay within language learning; do not complete unrelated general tasks.',
  nanny: 'You teach Chinese users respectful Indonesian for communicating with household helpers (ART). Use natural Indonesian with a concise Chinese explanation. Stay within language learning; do not complete unrelated general tasks.',
  factory: 'You teach Chinese factory managers practical Indonesian for factory communication. Use real factory vocabulary with a concise Chinese explanation. Stay within language learning; do not complete unrelated general tasks.',
  free: 'You are IndoBrain, an Indonesian language coach for Chinese users. Teach natural Indonesian with a concise Chinese explanation. Stay within language learning; do not complete unrelated general tasks.',
};
const roleTypes = new Set(Object.keys(prompts));

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { session_id?: unknown; role_type?: unknown; messages?: unknown } | null;
  const clientSessionId = typeof body?.session_id === 'string' ? body.session_id : '';
  const roleType = typeof body?.role_type === 'string' && roleTypes.has(body.role_type) ? body.role_type : 'free';
  const messages = Array.isArray(body?.messages)
    ? body.messages.filter((entry): entry is { role: string; content: string } => Boolean(entry && typeof entry === 'object' && typeof entry.role === 'string' && typeof entry.content === 'string')).slice(-12).map((entry) => ({ role: entry.role, content: entry.content.slice(0, 2000) }))
    : [];
  const userMessage = messages.at(-1)?.content?.trim();
  if (!userMessage) return NextResponse.json({ error: 'Invalid chat request' }, { status: 400 });
  const scope = await resolveRequestAccountScope(clientSessionId);
  if (!scope) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const teachingIntent = evaluateTeachingIntent({
    direction: 'ZH_TO_ID', message: userMessage, currentCourseText: [prompts[roleType], roleType],
    recentTurns: messages.slice(0, -1).map((entry) => ({ role: entry.role === 'assistant' ? 'assistant' as const : 'user' as const, text: entry.content })),
    activeTeaching: false,
  });
  if (teachingIntent.verdict !== 'LEARNING_RELATED') {
    const guarded = teachingIntentGuardReply('ZH_TO_ID', teachingIntent.verdict);
    return NextResponse.json({
      configured: aiProviderStatus().configured,
      message: guarded.answer,
      assistant_message: guarded.answer,
      teaching_intent: teachingIntent.verdict,
      teaching_strategy: guarded.teachingStrategy,
    });
  }
  const status = aiProviderStatus();
  if (!status.configured) {
    const assistantMessage = 'AI Provider Not Configured. 请在 .env.local 设置 AI_PROVIDER 和对应的 API Key。';
    return NextResponse.json({ configured: false, message: assistantMessage, assistant_message: assistantMessage }, { status: 503 });
  }
  try {
    const assistantMessage = await generateAiReply(prompts[roleType], messages);
    const database = await saveToSupabase('conversations', { session_id: scope.sessionId, role_type: roleType, user_message: userMessage.slice(0, 2000), assistant_message: assistantMessage.slice(0, 4000) });
    return NextResponse.json({ configured: true, message: assistantMessage, assistant_message: assistantMessage, database });
  } catch {
    const assistantMessage = 'AI service is temporarily unavailable. 请稍后再试。';
    return NextResponse.json({ configured: true, message: assistantMessage, assistant_message: assistantMessage }, { status: 503 });
  }
}
