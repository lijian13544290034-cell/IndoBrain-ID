import { randomUUID } from 'node:crypto';
import { isAiFreeTeachingEnabled } from '@/lib/account/ai-free-teaching';
import { buildExplicitChineseSpeechSegments, coachSpeechMetrics, isValidatedSpokenChinese } from '@/lib/mandarin-coach-speech';
import { guestCountCookie, resolveGuestScope } from '@/lib/server/guest-auth';
import { consumeGuestTurn, recordGuestError } from '@/lib/server/guest-quota';
import { anonymizeLearningQuestion } from '@/lib/server/mandarin-ai-coach';
import { answerNativeChat } from '@/lib/server/mandarin-native-chat';

export const runtime = 'nodejs';

type RecentTurn = { role: 'user' | 'assistant'; text: string };

function safeBody(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 500) : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 120) : '';
  if (!message || !sessionId.startsWith('free-')) return null;
  const recentTurns = Array.isArray(body.recentTurns) ? body.recentTurns.flatMap((item): RecentTurn[] => {
    if (!item || typeof item !== 'object') return [];
    const turn = item as Record<string, unknown>;
    if ((turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.text !== 'string') return [];
    return [{ role: turn.role, text: turn.text.slice(0, 1200) }];
  }).slice(-10) : [];
  return {
    message,
    sessionId,
    recentTurns,
    modelTier: body.modelTier === 'FAST' ? 'FAST' as const : 'SMART' as const,
  };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let guestActive = false;
  try {
    if (!isAiFreeTeachingEnabled()) return Response.json({ error: 'Eksperimen ini tidak tersedia.' }, { status: 404 });
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 64_000) return Response.json({ error: 'Permintaan terlalu besar.' }, { status: 413 });

    const input = safeBody(await request.json().catch(() => null));
    if (!input) return Response.json({ error: 'Permintaan percakapan tidak valid.' }, { status: 400 });

    const guestScope = await resolveGuestScope(input.sessionId);
    guestActive = Boolean(guestScope);
    if (!guestScope) return Response.json({ error: 'Mulai sesi tamu terlebih dahulu.', code: 'GUEST_SESSION_REQUIRED' }, { status: 401 });
    const turn = consumeGuestTurn(guestScope.session.id, guestScope.session.conversations);
    if (!turn.allowed) {
      const message = turn.reason === 'GLOBAL_DAILY_BUDGET'
        ? 'Kuota uji coba gratis hari ini sudah terpakai semua. Coba lagi besok ya.'
        : 'Batas percakapan uji coba gratis sudah tercapai. Terima kasih sudah mencoba IndoBrain!';
      return Response.json({ error: message, code: turn.reason }, { status: 429 });
    }

    const result = await answerNativeChat({
      message: input.message,
      sessionId: guestScope.sessionId,
      recentTurns: input.recentTurns,
      modelTier: input.modelTier,
    });

    const spoken = result.spokenChinese.filter((item) => isValidatedSpokenChinese(item.text));
    const speechSegments = buildExplicitChineseSpeechSegments(spoken.map((item) => item.text));
    const speechMetrics = coachSpeechMetrics(speechSegments);
    const responseLatencyMs = Date.now() - startedAt;

    console.info('[free-model-native-v2]', {
      question_id: randomUUID(),
      user_question: anonymizeLearningQuestion(input.message),
      model: result.usage.model_used,
      token_input: result.usage.token_input,
      token_output: result.usage.token_output,
      estimated_ai_cost: result.usage.estimated_ai_cost,
      answer_chars: result.answer.length,
      tts_eligible_requests: speechMetrics.eligibleRequestCount,
      tts_billable_characters: speechMetrics.billableCharacters,
      tts_rejected_items: result.spokenChinese.length - spoken.length,
      audio_list_found: result.audioListFound,
      answer_truncated: result.truncated,
      response_latency_ms: responseLatencyMs,
      skill_version: 'NATIVE_V2',
    });

    return Response.json({
      experiment: 'FREE_MODEL_NATIVE_V2',
      answer: result.answer,
      spokenChinese: spoken,
      speechSegments,
      tts: {
        policy: 'EXTRACTED_CHINESE_ONLY',
        ...speechMetrics,
        rejectedItems: result.spokenChinese.length - spoken.length,
        audioListFound: result.audioListFound,
      },
      usage: { ...result.usage, response_latency_ms: responseLatencyMs },
      truncated: result.truncated,
      skillVersion: 'NATIVE_V2',
      timestamp: new Date().toISOString(),
    }, { headers: { 'Set-Cookie': guestCountCookie(guestScope.session) } });
  } catch (error) {
    if (guestActive) recordGuestError();
    console.error('[free-model-native-v2-error]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message.slice(0, 240) : undefined,
    });
    return Response.json({ error: 'Guru AI belum dapat menjawab. Coba lagi sebentar.' }, { status: 503 });
  }
}
