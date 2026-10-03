import { createHash, randomUUID } from 'node:crypto';
import { isExpressionId, type CoachSkill, type ExpressionId, type UserInitiatedMemory } from '@/lib/mandarin-ai-coach';
import { anonymizeLearningQuestion, answerCoachConversation, transcribeMandarin } from '@/lib/server/mandarin-ai-coach';

export const runtime = 'nodejs';

const allowedAudioTypes = new Set(['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']);
const dailyConversationLimit = 30;
const sessionTurns = new Map<string, { date: string; count: number }>();
const allowedSkills = new Set<CoachSkill>(['TEACH', 'PRONUNCIATION', 'COMPREHENSION', 'ROLEPLAY', 'MEMORY']);

function allowConversation(sessionId: string) {
  const date = new Date().toISOString().slice(0, 10);
  const current = sessionTurns.get(sessionId);
  if (!current || current.date !== date) {
    sessionTurns.set(sessionId, { date, count: 1 });
    return true;
  }
  if (current.count >= dailyConversationLimit) return false;
  current.count += 1;
  return true;
}

function safeContext(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(typeof value === 'string' ? value : '{}') as Record<string, unknown>;
    const expression = isExpressionId(parsed.currentExpression) ? parsed.currentExpression : null;
    const skill = typeof parsed.currentSkill === 'string' && allowedSkills.has(parsed.currentSkill as CoachSkill) ? parsed.currentSkill as CoachSkill : 'TEACH';
    const masteryState = Array.isArray(parsed.masteryState) ? parsed.masteryState.filter((item): item is { expressionId: ExpressionId; masteryLevel: number } => {
      if (!item || typeof item !== 'object') return false;
      const record = item as Record<string, unknown>;
      return isExpressionId(record.expressionId) && typeof record.masteryLevel === 'number';
    }) : [];
    const reviewQueue = Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue.filter(isExpressionId) : [];
    const recentTurns = Array.isArray(parsed.recentTurns) ? parsed.recentTurns.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      if ((record.role !== 'user' && record.role !== 'assistant') || typeof record.text !== 'string') return [];
      return [{ role: record.role as 'user' | 'assistant', text: record.text.slice(0, 240) }];
    }) : [];
    const userInitiatedMemory = Array.isArray(parsed.userInitiatedMemory) ? parsed.userInitiatedMemory.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      if (typeof record.expression !== 'string' || typeof record.pinyin !== 'string' || typeof record.meaning_id !== 'string') return [];
      return [{
        id: typeof record.id === 'string' ? record.id.slice(0, 120) : `user-${record.expression.slice(0, 24)}`,
        expression: record.expression.slice(0, 120), pinyin: record.pinyin.slice(0, 180), meaning_id: record.meaning_id.slice(0, 240), source: 'USER_INITIATED' as const,
        first_seen_at: typeof record.first_seen_at === 'string' ? record.first_seen_at : '', last_seen_at: typeof record.last_seen_at === 'string' ? record.last_seen_at : '',
        last_attempt_at: typeof record.last_attempt_at === 'string' ? record.last_attempt_at : null, last_success_at: typeof record.last_success_at === 'string' ? record.last_success_at : null,
        mastery_level: typeof record.mastery_level === 'number' && record.mastery_level >= 0 && record.mastery_level <= 4 ? record.mastery_level as 0 | 1 | 2 | 3 | 4 : 0,
        pronunciation_status: ['NOT_STARTED', 'PASS', 'RETRY', 'BREAKDOWN', 'NEEDS_REVIEW'].includes(String(record.pronunciation_status)) ? record.pronunciation_status as UserInitiatedMemory['pronunciation_status'] : 'NOT_STARTED',
        fail_count: typeof record.fail_count === 'number' ? Math.max(0, record.fail_count) : 0, review_count: typeof record.review_count === 'number' ? Math.max(0, record.review_count) : 0,
        saved_for_review: record.saved_for_review === true,
      } satisfies UserInitiatedMemory];
    }) : [];
    return {
      currentDay: 1,
      currentExpression: expression,
      currentSkill: skill,
      userLevel: typeof parsed.userLevel === 'string' ? parsed.userLevel.slice(0, 80) : 'absolute beginner',
      recentMistakes: Array.isArray(parsed.recentMistakes) ? parsed.recentMistakes.filter((item): item is string => typeof item === 'string').slice(0, 5) : [],
      masteryState,
      reviewQueue,
      conversationMode: parsed.conversationMode === 'COACH_CONVERSATION' ? 'COACH_CONVERSATION' as const : 'GUIDED_TRAINING' as const,
      learningGoal: typeof parsed.learningGoal === 'string' ? parsed.learningGoal.slice(0, 160) : 'Mandarin praktis untuk kerja',
      preferredExplanationLanguage: parsed.preferredExplanationLanguage === 'MIXED' ? 'MIXED' as const : 'INDONESIAN' as const,
      userInitiatedMemory: userInitiatedMemory.slice(-20),
      recentConversationSummary: typeof parsed.recentConversationSummary === 'string' ? parsed.recentConversationSummary.slice(0, 280) : '',
      recentTurns: recentTurns.slice(-6),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const sessionId = form.get('sessionId');
    const audio = form.get('audio');
    const text = typeof form.get('message') === 'string' ? String(form.get('message')).trim() : '';
    const context = safeContext(form.get('context'));
    if (typeof sessionId !== 'string' || !sessionId.startsWith('coach-') || !context) return Response.json({ error: 'Permintaan percakapan tidak valid.' }, { status: 400 });
    if (!allowConversation(sessionId)) return Response.json({ error: 'Batas percakapan harian sudah tercapai. Lanjutkan besok.' }, { status: 429 });

    let message = text;
    let transcription: Awaited<ReturnType<typeof transcribeMandarin>> | null = null;
    if (audio instanceof File) {
      const audioType = audio.type.toLowerCase().split(';', 1)[0].trim();
      if (!allowedAudioTypes.has(audioType) || audio.size < 128 || audio.size > 5_000_000) return Response.json({ error: 'Rekaman audio tidak valid.' }, { status: 400 });
      transcription = await transcribeMandarin(new Uint8Array(await audio.arrayBuffer()), sessionId);
      message = transcription.transcript;
    }
    if (!message || message.length > 500) return Response.json({ error: 'Tulis atau ucapkan pertanyaan singkat.' }, { status: 400 });

    const result = await answerCoachConversation({ message, sessionId, context });
    const questionId = randomUUID();
    const timestamp = new Date().toISOString();
    const sessionKey = createHash('sha256').update(sessionId).digest('hex').slice(0, 16);
    console.info('[mandarin-ai-coach-learning-insight]', {
      course: 'mandarin-ai-coach-day1',
      question_id: questionId,
      sessionKey,
      user_question: anonymizeLearningQuestion(message),
      detected_language: result.classification.detectedLanguage,
      input_language: result.classification.detectedLanguage,
      detected_intents: result.classification.intents,
      target_chinese: result.classification.targetChinese || null,
      skill_used: result.classification.skillIds,
      current_day: context.currentDay,
      current_expression: context.currentExpression,
      answer_category: result.classification.answerCategory,
      answer_type: result.answer.teachingStrategy,
      resolved: null,
      continued_follow_up: context.recentTurns.length > 0,
      slow_request: /pelan|lambat|perlahan|慢一点|慢点/i.test(message),
      skill_gap: result.answer.skillGap,
      timestamp,
    });
    return Response.json({
      questionId,
      transcript: transcription?.transcript || null,
      detectedLanguage: result.classification.detectedLanguage,
      intent: result.classification.intent,
      intents: result.classification.intents,
      skillIds: result.classification.skillIds,
      normalizedInput: result.classification.normalizedInput,
      answerCategory: result.classification.answerCategory,
      ...result.answer,
      usage: {
        ...result.usage,
        stt_seconds: transcription?.durationInSeconds || 0,
        stt_model: transcription?.model || null,
        estimated_ai_cost: result.usage.estimated_ai_cost + (transcription?.estimatedCost || 0),
      },
      timestamp,
    });
  } catch (error) {
    const details = error && typeof error === 'object' ? error as { name?: unknown; message?: unknown; statusCode?: unknown } : {};
    console.error('[mandarin-coach-conversation]', {
      name: typeof details.name === 'string' ? details.name : 'UnknownError',
      message: typeof details.message === 'string' ? details.message.slice(0, 240) : undefined,
      statusCode: typeof details.statusCode === 'number' ? details.statusCode : undefined,
    });
    return Response.json({ error: 'AI Coach belum dapat menjawab. Coba lagi sebentar.' }, { status: 503 });
  }
}
