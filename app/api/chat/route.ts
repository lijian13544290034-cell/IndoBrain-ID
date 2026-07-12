import { NextResponse } from 'next/server';
import { aiProviderStatus, generateAiReply } from '@/lib/ai-provider';
import { saveToSupabase } from '@/lib/supabase-server';

const prompts: Record<string, string> = {
  driver: 'You help Chinese users communicate with Indonesian drivers. Use natural WhatsApp Indonesian. Solve the immediate problem first. Reply with a short Indonesian message followed by a concise Chinese explanation.',
  nanny: 'You help Chinese users communicate with Indonesian household helpers (ART). Use natural respectful WhatsApp Indonesian. Solve the immediate problem first. Reply with a short Indonesian message followed by a concise Chinese explanation.',
  factory: 'You help Chinese factory managers communicate in Indonesian factories. Use real factory vocabulary and concise operational Indonesian. Reply with a short Indonesian message followed by a concise Chinese explanation.',
  free: 'You are IndoBrain, a practical Indonesia life assistant for Chinese users. Reply in natural Indonesian with a concise Chinese explanation. Prioritize the immediate problem.',
};

export async function POST(request: Request) {
  const body = await request.json();
  const { session_id, role_type, messages = [] } = body as { session_id?: string; role_type?: string; messages?: Array<{ role: string; content: string }> };
  const user_message = messages.at(-1)?.content?.trim();
  if (!session_id || !role_type || !user_message) return NextResponse.json({ error: 'Invalid chat request' }, { status: 400 });
  const status = aiProviderStatus();
  if (!status.configured) return NextResponse.json({ configured: false, message: 'AI Provider Not Configured. 请在 .env.local 设置 AI_PROVIDER 和对应的 API Key。' }, { status: 503 });
  try {
    const assistant_message = await generateAiReply(prompts[role_type] || prompts.free, messages);
    const database = await saveToSupabase('conversations', { session_id, role_type, user_message, assistant_message });
    return NextResponse.json({ configured: true, provider: status.provider, assistant_message, database });
  } catch {
    return NextResponse.json({ error: 'AI 暂时无法回答，请检查 Provider 配置后重试。' }, { status: 502 });
  }
}
