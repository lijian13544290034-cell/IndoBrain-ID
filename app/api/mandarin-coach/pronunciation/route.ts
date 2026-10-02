import { FEEDBACK_COPY, isExpressionId } from '@/lib/mandarin-ai-coach';
import { evaluateCoachAttempt, transcribeMandarin } from '@/lib/server/mandarin-ai-coach';

export const runtime = 'nodejs';

const allowedAudioTypes = new Set(['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']);
const sessionAttempts = new Map<string, { date: string; count: number }>();
const dailyAttemptLimit = 40;

function allowAttempt(sessionId: string) {
  const date = new Date().toISOString().slice(0, 10);
  const current = sessionAttempts.get(sessionId);
  if (!current || current.date !== date) {
    sessionAttempts.set(sessionId, { date, count: 1 });
    return true;
  }
  if (current.count >= dailyAttemptLimit) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const audio = form.get('audio');
    const expressionId = form.get('expressionId');
    const sessionId = form.get('sessionId');
    const attempts = Number(form.get('attempts') || 0);
    const masteryLevel = Number(form.get('masteryLevel') || 0);
    const skill = form.get('skill') === 'ROLEPLAY' ? 'ROLEPLAY' : 'PRONUNCIATION';
    if (!(audio instanceof File) || !allowedAudioTypes.has(audio.type) || audio.size < 128 || audio.size > 5_000_000) return Response.json({ error: 'Rekaman audio tidak valid.' }, { status: 400 });
    if (!isExpressionId(expressionId) || typeof sessionId !== 'string' || !sessionId.startsWith('coach-')) return Response.json({ error: 'Permintaan latihan tidak valid.' }, { status: 400 });
    if (!allowAttempt(sessionId)) return Response.json({ error: 'Batas latihan harian sudah tercapai. Lanjutkan besok.' }, { status: 429 });

    const transcription = await transcribeMandarin(new Uint8Array(await audio.arrayBuffer()), sessionId);
    if (!transcription.transcript) return Response.json({ error: 'Suara belum terdengar jelas. Silakan coba lagi.' }, { status: 422 });
    const evaluation = await evaluateCoachAttempt({ skill, expressionId, transcript: transcription.transcript, attempts, masteryLevel, sessionId });
    return Response.json({
      transcript: transcription.transcript,
      verdict: evaluation.decision.verdict,
      feedback: FEEDBACK_COPY[evaluation.decision.feedbackId],
      feedbackId: evaluation.decision.feedbackId,
      nextAction: evaluation.decision.nextAction,
      confidence: evaluation.decision.confidence,
      usage: {
        ...evaluation.usage,
        stt_seconds: transcription.durationInSeconds,
        stt_model: transcription.model,
        estimated_ai_cost: evaluation.usage.estimated_ai_cost + transcription.estimatedCost,
      },
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : 'UnknownError';
    console.error('[mandarin-coach-pronunciation]', { name });
    return Response.json({ error: 'Pelatih AI belum dapat memeriksa suara. Coba lagi sebentar.' }, { status: 503 });
  }
}
