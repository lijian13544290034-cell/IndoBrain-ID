import { randomUUID } from 'node:crypto';
import { isAiFreeTeachingEnabled } from '@/lib/account/ai-free-teaching';
import { buildExplicitChineseSpeechSegments, coachSpeechMetrics, isValidatedSpokenChinese } from '@/lib/mandarin-coach-speech';
import { guestCountCookie, resolveGuestScope } from '@/lib/server/guest-auth';
import { consumeGuestTurn, recordGuestError } from '@/lib/server/guest-quota';
import { anonymizeLearningQuestion } from '@/lib/server/mandarin-ai-coach';
import { answerFreeTeaching, type FreeTeachingAnswer, type NaturalConversationAnswer } from '@/lib/server/mandarin-free-teacher';

export const runtime = 'nodejs';

type RecentTurn = { role: 'user' | 'assistant'; text: string };

function isNaturalAnswer(answer: FreeTeachingAnswer | NaturalConversationAnswer): answer is NaturalConversationAnswer {
  return 'learnerAct' in answer && 'learningEvidence' in answer;
}

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
    return [{ role: turn.role, text: turn.text.slice(0, 800) }];
  }).slice(-12) : [];
  const rawState = body.coachingState && typeof body.coachingState === 'object' ? body.coachingState as Record<string, unknown> : {};
  const strategies = new Set(['DIRECT_ANSWER', 'EXPLAIN', 'MODEL', 'CONTRAST', 'SCAFFOLD', 'ROLEPLAY', 'RECALL', 'REVIEW']);
  const textList = (candidate: unknown) => Array.isArray(candidate)
    ? candidate.filter((item): item is string => typeof item === 'string').map((item) => item.slice(0, 80)).slice(-12)
    : [];
  return {
    message,
    sessionId,
    recentTurns,
    contextSummary: typeof body.contextSummary === 'string' ? body.contextSummary.slice(0, 500) : '',
    modelTier: body.modelTier === 'FAST' ? 'FAST' as const : 'SMART' as const,
    skillVersion: body.skillVersion === 'BASELINE' ? 'BASELINE' as const : 'NATURAL_V1' as const,
    coachingState: {
      consecutiveFailures: Math.min(5, Math.max(0, Number(rawState.consecutiveFailures) || 0)),
      lastTeachingStrategy: typeof rawState.lastTeachingStrategy === 'string' && strategies.has(rawState.lastTeachingStrategy) ? rawState.lastTeachingStrategy as 'DIRECT_ANSWER' | 'EXPLAIN' | 'MODEL' | 'CONTRAST' | 'SCAFFOLD' | 'ROLEPLAY' | 'RECALL' | 'REVIEW' : '' as const,
      sameTaskRepeatCount: Math.min(3, Math.max(0, Number(rawState.sameTaskRepeatCount) || 0)),
      lastTaskPrompt: typeof rawState.lastTaskPrompt === 'string' ? rawState.lastTaskPrompt.slice(0, 360) : '',
      weakExpressions: textList(rawState.weakExpressions),
      independentUses: textList(rawState.independentUses),
    },
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

    // Visitor-only: no account fallback and no internal QA bypass.
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

    const result = await answerFreeTeaching({
      message: input.message,
      sessionId: guestScope.sessionId,
      recentTurns: input.recentTurns,
      contextSummary: input.contextSummary,
      modelTier: input.modelTier,
      skillVersion: input.skillVersion,
      coachingState: input.coachingState,
    });
    const spokenChinese = result.answer.spokenChinese.filter((item) => isValidatedSpokenChinese(item.text));
    const rejectedSpokenChinese = result.answer.spokenChinese.length - spokenChinese.length;
    const speechSegments = buildExplicitChineseSpeechSegments(spokenChinese.map((item) => item.text));
    const speechMetrics = coachSpeechMetrics(speechSegments);
    const questionId = randomUUID();
    const responseLatencyMs = Date.now() - startedAt;
    const natural = isNaturalAnswer(result.answer) ? result.answer : null;
    const textOnlyPronunciationRequest = /(?:stt|transkrip|transkripsi|transcript)/i.test(input.message)
      && /(?:nada|pengucapan|pronunciation|lafal|发音)/i.test(input.message);
    const skillChecks = natural ? {
      assessmentRequiresAttempt: natural.learnerAct === 'ATTEMPT' || natural.assessment.status === 'NOT_ASSESSED',
      correctionLimit: natural.corrections.length <= 2,
      oneExplicitTask: natural.task === null || typeof natural.task.prompt === 'string',
      independentEvidenceRequiresAttempt: natural.learnerAct === 'ATTEMPT' || natural.learningEvidence.independentUses.length === 0,
      textTranscriptNotAcousticallyScored: !textOnlyPronunciationRequest
        || (natural.assessment.status === 'NOT_ASSESSED' && /tidak bisa menilai pengucapan/i.test(natural.answer)),
      strategyChangedAfterRepeatedFailure: input.coachingState.consecutiveFailures < 2
        || !input.coachingState.lastTeachingStrategy
        || natural.teachingStrategy !== input.coachingState.lastTeachingStrategy,
      sessionWrapUpValid: natural.learnerAct === 'SESSION_END'
        ? Boolean(natural.sessionWrapUp && natural.sessionWrapUp.recallExercises.length >= 3 && natural.sessionWrapUp.recallExercises.length <= 5)
        : natural.sessionWrapUp === null,
    } : null;

    console.info('[ai-free-teaching-v1]', {
      question_id: questionId,
      user_question: anonymizeLearningQuestion(input.message),
      response_mode: result.answer.responseMode,
      assessment: result.answer.assessment.status,
      model: result.usage.model_used,
      token_input: result.usage.token_input,
      token_output: result.usage.token_output,
      estimated_ai_cost: result.usage.estimated_ai_cost,
      tts_policy: 'EXPLICIT_CHINESE_ONLY',
      tts_eligible_requests: speechMetrics.eligibleRequestCount,
      tts_billable_characters: speechMetrics.billableCharacters,
      tts_rejected_items: rejectedSpokenChinese,
      response_latency_ms: responseLatencyMs,
      skill_version: input.skillVersion,
      skill_checks_passed: skillChecks ? Object.values(skillChecks).every(Boolean) : undefined,
    });

    return Response.json({
      experiment: 'AI_FREE_TEACHING_V1',
      questionId,
      ...result.answer,
      spokenChinese,
      speechSegments,
      tts: {
        policy: 'EXPLICIT_CHINESE_ONLY',
        ...speechMetrics,
        rejectedItems: rejectedSpokenChinese,
      },
      usage: { ...result.usage, response_latency_ms: responseLatencyMs },
      skillVersion: input.skillVersion,
      skillChecks,
      timestamp: new Date().toISOString(),
    }, { headers: { 'Set-Cookie': guestCountCookie(guestScope.session) } });
  } catch (error) {
    if (guestActive) recordGuestError();
    console.error('[ai-free-teaching-v1-error]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message.slice(0, 240) : undefined,
    });
    return Response.json({ error: 'Guru AI belum dapat menjawab. Coba lagi sebentar.' }, { status: 503 });
  }
}

