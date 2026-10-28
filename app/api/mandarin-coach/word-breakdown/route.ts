import { randomUUID } from 'node:crypto';
import { isNativeCoachV1Enabled } from '@/lib/account/native-coach-v1';
import { isValidatedSpokenChinese } from '@/lib/mandarin-coach-speech';
import { guestCountCookie, resolveGuestScope } from '@/lib/server/guest-auth';
import { consumeGuestTurn, recordGuestError } from '@/lib/server/guest-quota';
import { createMandarinWordBreakdown } from '@/lib/server/mandarin-native-word-breakdown';

export const runtime = 'nodejs';
export const maxDuration = 30;

function safeBody(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 120) : '';
  const context = typeof body.context === 'string' ? body.context.trim().slice(0, 800) : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 120) : '';
  if (!sessionId.startsWith('free-') || !isValidatedSpokenChinese(text)) return null;
  return { text, context, sessionId };
}

export async function POST(request: Request) {
  let guestActive = false;
  try {
    if (!isNativeCoachV1Enabled()) return Response.json({ error: 'Native Coach V1 belum tersedia.' }, { status: 404 });
    if (Number(request.headers.get('content-length') || 0) > 8_000) {
      return Response.json({ error: 'Permintaan terlalu besar.' }, { status: 413 });
    }
    const input = safeBody(await request.json().catch(() => null));
    if (!input) return Response.json({ error: 'Pilih teks Mandarin yang valid untuk diurai.' }, { status: 400 });

    const guestScope = await resolveGuestScope(input.sessionId);
    guestActive = Boolean(guestScope);
    if (!guestScope) return Response.json({ error: 'Mulai sesi tamu terlebih dahulu.', code: 'GUEST_SESSION_REQUIRED' }, { status: 401 });
    const quota = consumeGuestTurn(guestScope.session.id, guestScope.session.conversations);
    if (!quota.allowed) return Response.json({ error: 'Batas percobaan gratis sudah tercapai.', code: quota.reason }, { status: 429 });

    const result = await createMandarinWordBreakdown({
      text: input.text,
      context: input.context,
      sessionId: guestScope.sessionId,
    });
    console.info('[native-coach-word-breakdown]', {
      request_id: randomUUID(),
      chinese_characters: [...input.text].length,
      word_count: result.breakdown.words.length,
      token_input: result.usage.token_input,
      token_output: result.usage.token_output,
      estimated_ai_cost: result.usage.estimated_ai_cost,
      latency_ms: result.latencyMs,
    });
    return Response.json(result, { headers: { 'Cache-Control': 'no-store', 'Set-Cookie': guestCountCookie(guestScope.session) } });
  } catch (error) {
    if (guestActive) recordGuestError();
    console.error('[native-coach-word-breakdown-error]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      code: error instanceof Error ? error.message.slice(0, 80) : undefined,
    });
    return Response.json({ error: 'Rincian kata belum bisa dibuat. Kamu tetap bisa membaca jawaban di atas.' }, { status: 503 });
  }
}
