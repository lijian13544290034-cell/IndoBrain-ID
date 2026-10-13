import { NextResponse } from 'next/server';
import { aiProviderStatus, generateAiReply } from '@/lib/ai-provider';
import { resolveRequestAccountScope } from '@/lib/server/request-account-scope';
import { saveToSupabase } from '@/lib/supabase-server';

const prompts: Record<string, string> = {
  driver: 'You help Chinese users communicate with Indonesian drivers. Use natural WhatsApp Indonesian. Solve the immediate problem first. Reply with a short Indonesian message followed by a concise Chinese explanation.',
  nanny: 'You help Chinese users communicate with Indonesian household helpers (ART). Use natural respectful WhatsApp Indonesian. Solve the immediate problem first. Reply with a short Indonesian message followed by a concise Chinese explanation.',
  factory: 'You help Chinese factory managers communicate in Indonesian factories. Use real factory vocabulary and concise operational Indonesian. Reply with a short Indonesian message followed by a concise Chinese explanation.',
  free: 'You are IndoBrain, a practical Indonesia life assistant for Chinese users. Reply in natural Indonesian with a concise Chinese explanation. Prioritize the immediate problem.',
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
  const status = aiProviderStatus();
  if (!status.configured) return NextResponse.json({ configured: false, message: 'AI Provider Not Configured. 请在 .env.local 设置 AI_PROVIDER 和对应的 API Key。' }, { status: 503 });
  try {
    const assistantMessage = await generateAiReply(prompts[roleType], messages);
    const database = await saveToSupabase('conversations', { session_id: scope.sessionId, role_type: roleType, user_message: userMessage.slice(0, 2000), assistant_message: assistantMessage.slice(0, 4000) });
    return NextResponse.json({ configured: true, message: assistantMessage, database });
  } catch {
    return NextResponse.json({ configured: true, message: 'AI service is temporarily unavailable. 请稍后再试。' }, { status: 503 });
  }
}
