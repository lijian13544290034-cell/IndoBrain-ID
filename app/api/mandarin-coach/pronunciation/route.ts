import { FEEDBACK_COPY } from '@/lib/mandarin-ai-coach';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { getMandarinCoachExpression } from '@/lib/server/mandarin-coach-curriculum';
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
    const lessonId = form.get('lessonId');
    const sessionId = form.get('sessionId');
    const attempts = Number(form.get('attempts') || 0);
    const masteryLevel = Number(form.get('masteryLevel') || 0);
    const skill = form.get('skill') === 'ROLEPLAY' ? 'ROLEPLAY' : 'PRONUNCIATION';
    if (!(audio instanceof File)) return Response.json({ error: 'Rekaman audio tidak valid.' }, { status: 400 });
    const audioType = audio.type.toLowerCase().split(';', 1)[0].trim();
    if (!allowedAudioTypes.has(audioType) || audio.size < 128 || audio.size > 5_000_000) return Response.json({ error: 'Rekaman audio tidak valid.' }, { status: 400 });
    if (typeof expressionId !== 'string' || typeof lessonId !== 'string' || typeof sessionId !== 'string' || !sessionId.startsWith('coach-')) return Response.json({ error: 'Permintaan latihan tidak valid.' }, { status: 400 });
    const curriculumTarget = getMandarinCoachExpression(expressionId);
    if (!curriculumTarget || curriculumTarget.lesson.id !== lessonId) return Response.json({ error: 'Materi latihan tidak ditemukan.' }, { status: 404 });
    if (curriculumTarget.lesson.source === 'MANDARIN_WORK_LEVEL_2' && (await getMandarinLevel2Access()).state !== 'authorized') return Response.json({ error: 'Akses Level 2 diperlukan.' }, { status: 403 });
    if (!allowAttempt(sessionId)) return Response.json({ error: 'Batas latihan harian sudah tercapai. Lanjutkan besok.' }, { status: 429 });

    const transcription = await transcribeMandarin(new Uint8Array(await audio.arrayBuffer()), sessionId);
    if (!transcription.transcript) return Response.json({ error: 'Suara belum terdengar jelas. Silakan coba lagi.' }, { status: 422 });
    const evaluation = await evaluateCoachAttempt({ skill, expressionId, target: curriculumTarget.expression, transcript: transcription.transcript, attempts, masteryLevel, sessionId });
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
    const details = error && typeof error === 'object' ? error as { name?: unknown; message?: unknown; type?: unknown; statusCode?: unknown; generationId?: unknown; cause?: unknown } : {};
    const cause = details.cause && typeof details.cause === 'object' ? details.cause as { name?: unknown; message?: unknown; statusCode?: unknown } : {};
    console.error('[mandarin-coach-pronunciation]', {
      name: typeof details.name === 'string' ? details.name : 'UnknownError',
      message: typeof details.message === 'string' ? details.message.slice(0, 240) : undefined,
      type: typeof details.type === 'string' ? details.type : undefined,
      statusCode: typeof details.statusCode === 'number' ? details.statusCode : undefined,
      generationId: typeof details.generationId === 'string' ? details.generationId : undefined,
      causeName: typeof cause.name === 'string' ? cause.name : undefined,
      causeMessage: typeof cause.message === 'string' ? cause.message.slice(0, 240) : undefined,
      causeStatusCode: typeof cause.statusCode === 'number' ? cause.statusCode : undefined,
    });
    return Response.json({ error: 'Pelatih AI belum dapat memeriksa suara. Coba lagi sebentar.' }, { status: 503 });
  }
}
