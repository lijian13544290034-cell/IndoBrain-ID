import { randomUUID } from 'node:crypto';
import { isNativeCoachV1Enabled } from '@/lib/account/native-coach-v1';
import { buildExplicitChineseSpeechSegments, coachSpeechMetrics, isValidatedSpokenChinese } from '@/lib/mandarin-coach-speech';
import { guestCountCookie, resolveGuestScope } from '@/lib/server/guest-auth';
import { consumeGuestTurn, recordGuestError } from '@/lib/server/guest-quota';
import { anonymizeLearningQuestion } from '@/lib/server/mandarin-ai-coach';
import { createNativeCoachGeneration, type NativeCoachTurn } from '@/lib/server/mandarin-native-coach-v1';

export const runtime = 'nodejs';
export const maxDuration = 60;

const encoder = new TextEncoder();
const AUDIO_MARKER = '[[AUDIO]]';

function safeBody(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 500) : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 120) : '';
  if (!message || !sessionId.startsWith('free-')) return null;
  const recentTurns = Array.isArray(body.recentTurns) ? body.recentTurns.flatMap((item): NativeCoachTurn[] => {
    if (!item || typeof item !== 'object') return [];
    const turn = item as Record<string, unknown>;
    if ((turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.text !== 'string') return [];
    return [{ role: turn.role, text: turn.text.slice(0, 1_200) }];
  }).slice(-8) : [];
  return { message, sessionId, recentTurns };
}

function event(type: string, payload: Record<string, unknown>) {
  return encoder.encode(`${JSON.stringify({ type, ...payload })}\n`);
}

export async function POST(request: Request) {
  const acceptedAt = Date.now();
  let guestActive = false;
  try {
    if (!isNativeCoachV1Enabled()) {
      return Response.json({ error: 'Native Coach V1 belum tersedia.' }, { status: 404 });
    }
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 64_000) return Response.json({ error: 'Permintaan terlalu besar.' }, { status: 413 });
    const input = safeBody(await request.json().catch(() => null));
    if (!input) return Response.json({ error: 'Permintaan percakapan tidak valid.' }, { status: 400 });

    const guestScope = await resolveGuestScope(input.sessionId);
    guestActive = Boolean(guestScope);
    if (!guestScope) return Response.json({ error: 'Mulai sesi tamu terlebih dahulu.', code: 'GUEST_SESSION_REQUIRED' }, { status: 401 });
    const quota = consumeGuestTurn(guestScope.session.id, guestScope.session.conversations);
    if (!quota.allowed) {
      const message = quota.reason === 'GLOBAL_DAILY_BUDGET'
        ? 'Kuota uji coba gratis hari ini sudah terpakai semua. Coba lagi besok ya.'
        : 'Batas percakapan uji coba gratis sudah tercapai. Terima kasih sudah mencoba IndoBrain!';
      return Response.json({ error: message, code: quota.reason }, { status: 429 });
    }

    const generation = createNativeCoachGeneration({
      message: input.message,
      sessionId: guestScope.sessionId,
      recentTurns: input.recentTurns,
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let pending = '';
        let audioBlockStarted = false;
        let firstTextAt: number | null = null;
        let streamedText = '';
        const emitText = (text: string) => {
          if (!text) return;
          firstTextAt ??= Date.now();
          streamedText += text;
          controller.enqueue(event('text-delta', { text }));
        };

        controller.enqueue(event('accepted', { acceptedAt: new Date(acceptedAt).toISOString() }));
        try {
          for await (const delta of generation.result.textStream) {
            if (audioBlockStarted) continue;
            pending += delta;
            const markerIndex = pending.indexOf(AUDIO_MARKER);
            if (markerIndex >= 0) {
              emitText(pending.slice(0, markerIndex));
              pending = '';
              audioBlockStarted = true;
              continue;
            }
            // Keep enough tail to catch a marker split across provider chunks.
            if (pending.length > AUDIO_MARKER.length) {
              const safeLength = pending.length - AUDIO_MARKER.length;
              emitText(pending.slice(0, safeLength));
              pending = pending.slice(safeLength);
            }
          }
          if (!audioBlockStarted) emitText(pending);

          const finalized = await generation.finalize();
          if (generation.getStreamError() && !finalized.answer) throw generation.getStreamError();
          const spokenChinese = finalized.spokenChinese.filter((item) => isValidatedSpokenChinese(item.text));
          const speechSegments = buildExplicitChineseSpeechSegments(spokenChinese.map((item) => item.text));
          const speechMetrics = coachSpeechMetrics(speechSegments);
          const completedAt = Date.now();
          const performance = {
            timeToFirstTextMs: firstTextAt ? firstTextAt - acceptedAt : null,
            fullResponseMs: completedAt - acceptedAt,
            modelTimeToFirstOutputMs: finalized.modelTimeToFirstOutputMs,
          };

          console.info('[native-coach-v1]', {
            question_id: randomUUID(),
            user_question: anonymizeLearningQuestion(input.message),
            model: finalized.usage.model_used,
            token_input: finalized.usage.token_input,
            token_output: finalized.usage.token_output,
            estimated_ai_cost: finalized.usage.estimated_ai_cost,
            answer_chars: finalized.answer.length,
            tts_eligible_requests: speechMetrics.eligibleRequestCount,
            tts_billable_characters: speechMetrics.billableCharacters,
            tts_rejected_items: finalized.spokenChinese.length - spokenChinese.length,
            answer_truncated: finalized.truncated,
            time_to_first_text_ms: performance.timeToFirstTextMs,
            full_response_ms: performance.fullResponseMs,
            model_time_to_first_output_ms: performance.modelTimeToFirstOutputMs,
            stream_text_matches_final: streamedText.trim() === finalized.answer.trim(),
          });

          controller.enqueue(event('complete', {
            experiment: 'NATIVE_COACH_V1',
            answer: finalized.answer,
            spokenChinese,
            speechSegments,
            tts: {
              policy: 'EXPLICIT_VALIDATED_CHINESE_ONLY',
              ...speechMetrics,
              rejectedItems: finalized.spokenChinese.length - spokenChinese.length,
            },
            usage: finalized.usage,
            performance,
            truncated: finalized.truncated,
            generationId: finalized.generationId,
            skillVersion: 'NATIVE_COACH_V1',
          }));
        } catch (error) {
          recordGuestError();
          console.error('[native-coach-v1-stream-error]', {
            name: error instanceof Error ? error.name : 'UnknownError',
            message: error instanceof Error ? error.message.slice(0, 240) : undefined,
          });
          controller.enqueue(event('error', {
            error: 'Jawaban terputus. Pesanmu tetap aman—coba kirim lagi.',
            retryable: true,
          }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Accel-Buffering': 'no',
        'Set-Cookie': guestCountCookie(guestScope.session),
      },
    });
  } catch (error) {
    if (guestActive) recordGuestError();
    console.error('[native-coach-v1-error]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message.slice(0, 240) : undefined,
    });
    return Response.json({ error: 'Guru AI belum dapat menjawab. Coba lagi sebentar.' }, { status: 503 });
  }
}
