import 'server-only';

import { NoObjectGeneratedError, NoTranscriptGeneratedError, Output, transcribe, gateway, generateText, jsonSchema } from 'ai';
import { DAY_ONE_EXPRESSIONS, type CoachBrainSkillId, type CoachDetectedLanguage, type CoachIntent, type CoachSkill, type CoachVerdict, type ExpressionId, type FeedbackId, type UserInitiatedMemory } from '@/lib/mandarin-ai-coach';
import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';
import { composeKnownCoachResponse, planCoachTurn, routeCoachInput, type CoachBrainAnswer } from '@/lib/server/mandarin-coach-brain';
import { buildTeacherSkillSystem, emptyStudentSessionMemory, MANDARIN_TEACHER_SKILL_VERSION, type StudentSessionMemory } from '@/lib/server/mandarin-teacher-skill';

const FAST_MODEL = process.env.FAST_MODEL || 'google/gemini-2.5-flash-lite';
const SMART_MODEL = process.env.SMART_MODEL || 'google/gemini-2.5-flash';
const STT_MODEL = process.env.STT_MODEL || 'openai/gpt-4o-mini-transcribe';

/** 极简会话学习记忆：当前测试会话内记住目标/职业/水平/当前课/最近错误（TTL 内有效，不落库）。 */
const sessionMemories = new Map<string, { memory: StudentSessionMemory; expiresAt: number }>();
const SESSION_MEMORY_TTL_MS = 6 * 60 * 60 * 1000;
const SESSION_MEMORY_MAX = 1000;

function extractSessionMemoryUpdate(message: string, currentLessonId: string): Partial<StudentSessionMemory> {
  const update: Partial<StudentSessionMemory> = {};
  const occupation =
    /pabrik|factory|produksi|mesin|operator/i.test(message) ? 'pabrik/factory' :
    /sales|penjualan|jualan|marketing|toko|pelanggan/i.test(message) ? 'sales' :
    /admin|kantor|office|sekretaris|\bhr\b/i.test(message) ? 'admin/kantor' :
    /gudang|logistik|ekspedisi|pengiriman|stok/i.test(message) ? 'gudang/logistik' :
    /konstruksi|bangunan|proyek/i.test(message) ? 'konstruksi' :
    /restoran|hotel|tamu|cafe|pelayan/i.test(message) ? 'hospitality' : null;
  if (occupation) update.occupation = occupation;
  const goalMatch = message.match(/(?:mau|ingin|pengin|bisa)\s+(?:bisa\s+)?(?:kerja|bekerja)\s+di\s+([^.,!?;]{2,60})/i);
  if (goalMatch) update.goal = `kerja di ${goalMatch[1].trim()}`;
  if (/belum bisa|pemula|zero|baru mulai|nggak bisa.{0,12}mandarin/i.test(message)) update.level = 'BEGINNER';
  if (currentLessonId) update.currentLessonId = currentLessonId;
  return update;
}

function rememberSession(sessionId: string, update: Partial<StudentSessionMemory>, errorTarget: string | null): StudentSessionMemory {
  const now = Date.now();
  if (sessionMemories.size > SESSION_MEMORY_MAX) {
    for (const [key, value] of sessionMemories) { if (value.expiresAt < now) sessionMemories.delete(key); }
    if (sessionMemories.size > SESSION_MEMORY_MAX) { const first = sessionMemories.keys().next().value; if (first) sessionMemories.delete(first); }
  }
  const existing = sessionMemories.get(sessionId);
  const memory: StudentSessionMemory = existing && existing.expiresAt > now
    ? { ...emptyStudentSessionMemory(), ...existing.memory }
    : emptyStudentSessionMemory();
  Object.assign(memory, update);
  if (errorTarget && !memory.recentErrors.includes(errorTarget)) memory.recentErrors = [...memory.recentErrors, errorTarget].slice(-5);
  sessionMemories.set(sessionId, { memory, expiresAt: now + SESSION_MEMORY_TTL_MS });
  return memory;
}

type StructuredDecision = {
  verdict: CoachVerdict;
  feedbackId: FeedbackId;
  nextAction: 'CONTINUE' | 'REPEAT' | 'SHOW_BREAKDOWN';
  confidence: number;
};

type CallUsage = {
  token_input: number;
  token_output: number;
  model_calls: number;
  estimated_ai_cost: number;
  model_used: string;
  structured_retries: number;
  safe_fallbacks: number;
  retry_token_input: number;
  retry_token_output: number;
  retry_estimated_cost: number;
};

type ConversationClassification = {
  intent: CoachIntent;
  intents: CoachIntent[];
  detectedLanguage: CoachDetectedLanguage;
  skillIds: CoachBrainSkillId[];
  targetChinese: string;
  normalizedInput: string;
  modelTier: 'FAST' | 'SMART';
  answerCategory: 'EXPLANATION' | 'EXAMPLE' | 'PRONUNCIATION_COACHING' | 'ROLEPLAY' | 'STUDY_SUPPORT' | 'OFF_TOPIC';
};

type ConversationAnswer = CoachBrainAnswer;

const decisionSchema = jsonSchema<StructuredDecision>({
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'feedbackId', 'nextAction', 'confidence'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'RETRY', 'BREAKDOWN'] },
    feedbackId: { type: 'string', enum: ['pronunciation_pass', 'pronunciation_retry', 'pronunciation_breakdown', 'comprehension_pass', 'comprehension_retry', 'roleplay_pass', 'roleplay_retry'] },
    nextAction: { type: 'string', enum: ['CONTINUE', 'REPEAT', 'SHOW_BREAKDOWN'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
});

const classificationSchema = jsonSchema<ConversationClassification>({
  type: 'object',
  additionalProperties: false,
  required: ['intent', 'intents', 'detectedLanguage', 'skillIds', 'targetChinese', 'normalizedInput', 'modelTier', 'answerCategory'],
  properties: {
    intent: { type: 'string', enum: ['VOCABULARY', 'PRONUNCIATION', 'MEANING', 'CORRECTION', 'EXAMPLE', 'CONVERSATION', 'WORKPLACE', 'REVIEW', 'ROLEPLAY', 'GRAMMAR', 'OFF_TOPIC', 'STUDY_PLANNING', 'COMMUNICATION_REQUEST'] },
    intents: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string', enum: ['VOCABULARY', 'PRONUNCIATION', 'MEANING', 'CORRECTION', 'EXAMPLE', 'CONVERSATION', 'WORKPLACE', 'REVIEW', 'ROLEPLAY', 'GRAMMAR', 'OFF_TOPIC', 'STUDY_PLANNING', 'COMMUNICATION_REQUEST'] } },
    detectedLanguage: { type: 'string', enum: ['INDONESIAN', 'CHINESE', 'MIXED'] },
    skillIds: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string', enum: ['VOCABULARY', 'PRONUNCIATION', 'MEANING', 'CORRECTION', 'EXAMPLE', 'CONVERSATION', 'WORKPLACE', 'REVIEW', 'STUDY_PLANNING', 'COMMUNICATION_REQUEST'] } },
    targetChinese: { type: 'string', maxLength: 80 },
    normalizedInput: { type: 'string', maxLength: 500 },
    modelTier: { type: 'string', enum: ['FAST', 'SMART'] },
    answerCategory: { type: 'string', enum: ['EXPLANATION', 'EXAMPLE', 'PRONUNCIATION_COACHING', 'ROLEPLAY', 'STUDY_SUPPORT', 'OFF_TOPIC'] },
  },
});

const conversationAnswerSchema = jsonSchema<ConversationAnswer>({
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'chinese', 'pinyin', 'indonesian', 'followUp', 'summary', 'ttsRate', 'teachingStrategy', 'rememberTarget', 'targetChinese', 'targetPinyin', 'targetMeaning', 'skillGap', 'skillGapReason'],
  properties: {
    answer: { type: 'string', minLength: 1, maxLength: 800 },
    chinese: { type: 'string', maxLength: 120 },
    pinyin: { type: 'string', maxLength: 240 },
    indonesian: { type: 'string', maxLength: 400 },
    followUp: { type: 'string', maxLength: 320 },
    summary: { type: 'string', maxLength: 400 },
    ttsRate: { type: 'string', enum: ['normal', 'slow'] },
    teachingStrategy: { type: 'string', maxLength: 80 },
    rememberTarget: { type: 'boolean' },
    targetChinese: { type: 'string', maxLength: 120 },
    targetPinyin: { type: 'string', maxLength: 180 },
    targetMeaning: { type: 'string', maxLength: 240 },
    skillGap: { type: 'boolean' },
    skillGapReason: { type: 'string', maxLength: 240 },
  },
});

function numericCost(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return 0;
  const gatewayMetadata = (metadata as Record<string, unknown>).gateway;
  if (!gatewayMetadata || typeof gatewayMetadata !== 'object') return 0;
  const cost = (gatewayMetadata as Record<string, unknown>).cost;
  if (typeof cost === 'number' && Number.isFinite(cost)) return cost;
  if (typeof cost === 'string' && Number.isFinite(Number(cost))) return Number(cost);
  return 0;
}

function fallbackTextCost(model: string, input: number, output: number) {
  if (model === 'google/gemini-2.5-flash') return input * 0.30 / 1_000_000 + output * 2.50 / 1_000_000;
  return input * 0.10 / 1_000_000 + output * 0.40 / 1_000_000;
}

function usageFromResult(result: { usage: { inputTokens?: number; outputTokens?: number }; providerMetadata?: unknown }, model: string): CallUsage {
  const tokenInput = result.usage.inputTokens || 0;
  const tokenOutput = result.usage.outputTokens || 0;
  return {
    token_input: tokenInput,
    token_output: tokenOutput,
    model_calls: 1,
    estimated_ai_cost: numericCost(result.providerMetadata) || fallbackTextCost(model, tokenInput, tokenOutput),
    model_used: model,
    structured_retries: 0,
    safe_fallbacks: 0,
    retry_token_input: 0,
    retry_token_output: 0,
    retry_estimated_cost: 0,
  };
}

function usageFromStructuredError(error: unknown, model: string): CallUsage {
  if (!NoObjectGeneratedError.isInstance(error) || !error.usage) {
    return { token_input: 0, token_output: 0, model_calls: 0, estimated_ai_cost: 0, model_used: model, structured_retries: 0, safe_fallbacks: 0, retry_token_input: 0, retry_token_output: 0, retry_estimated_cost: 0 };
  }
  const tokenInput = error.usage.inputTokens || 0;
  const tokenOutput = error.usage.outputTokens || 0;
  return {
    token_input: tokenInput,
    token_output: tokenOutput,
    model_calls: 1,
    estimated_ai_cost: fallbackTextCost(model, tokenInput, tokenOutput),
    model_used: model,
    structured_retries: 0,
    safe_fallbacks: 0,
    retry_token_input: 0,
    retry_token_output: 0,
    retry_estimated_cost: 0,
  };
}

function mergeUsage(first: CallUsage, second: CallUsage): CallUsage {
  return {
    token_input: first.token_input + second.token_input,
    token_output: first.token_output + second.token_output,
    model_calls: first.model_calls + second.model_calls,
    estimated_ai_cost: first.estimated_ai_cost + second.estimated_ai_cost,
    model_used: `${first.model_used} → ${second.model_used}`,
    structured_retries: first.structured_retries + second.structured_retries,
    safe_fallbacks: first.safe_fallbacks + second.safe_fallbacks,
    retry_token_input: first.retry_token_input + second.retry_token_input,
    retry_token_output: first.retry_token_output + second.retry_token_output,
    retry_estimated_cost: first.retry_estimated_cost + second.retry_estimated_cost,
  };
}

function safeErrorDetails(error: unknown) {
  if (!NoObjectGeneratedError.isInstance(error)) {
    return { name: error instanceof Error ? error.name : 'UnknownError' };
  }
  return {
    name: error.name,
    cause: error.cause instanceof Error ? error.cause.name : undefined,
    finishReason: error.finishReason,
    rawTextLength: error.text?.length || 0,
  };
}

function safeTeachingFallback(plan: ReturnType<typeof routeCoachInput>, classification: ConversationClassification, summary: string): ConversationAnswer {
  const target = classification.targetChinese || plan.targetChinese || '';
  return {
    answer: target
      ? 'Mari kita fokus pada satu bagian dulu. Kirim frasa ini lagi jika kamu ingin arti atau cara bacanya.'
      : 'Saya belum bisa menyusun jawaban lengkap. Coba tanyakan satu frasa Mandarin, arti, atau cara bacanya.',
    chinese: target,
    pinyin: '',
    indonesian: '',
    followUp: target ? `Apa yang ingin kamu pelajari dari “${target}”?` : 'Frasa Mandarin mana yang ingin kamu pelajari?',
    summary: summary.slice(0, 280),
    ttsRate: plan.slowSpeech ? 'slow' : 'normal',
    teachingStrategy: 'SAFE_PLAIN_TEXT_FALLBACK',
    rememberTarget: false,
    targetChinese: '',
    targetPinyin: '',
    targetMeaning: '',
    skillGap: true,
    skillGapReason: 'Structured teaching response unavailable after one controlled repair attempt.',
  };
}

async function callDecisionModel(model: string, input: {
  skill: CoachSkill;
  expressionId: ExpressionId;
  target: { chinese: string; pinyin: string; indonesian: string };
  transcript: string;
  attempts: number;
  masteryLevel: number;
  sessionId: string;
}) {
  const result = await generateText({
    model: gateway(model),
    output: Output.object({ schema: decisionSchema, name: 'mandarin_coach_decision' }),
    maxOutputTokens: 100,
    temperature: 0,
    maxRetries: 1,
    providerOptions: { gateway: { tags: ['indobrain', 'mandarin-ai-coach', input.skill.toLowerCase()], user: input.sessionId.slice(0, 96) } },
    system: [
      'You are a strict Mandarin learning evaluator for Indonesian absolute beginners.',
      'Return only the requested structured object. Never teach content beyond the supplied target.',
      'Judge meaning and intelligibility, not accent perfection. Be encouraging.',
      'Use pronunciation feedback IDs for PRONUNCIATION, roleplay IDs for ROLEPLAY.',
      'PASS when the transcript clearly matches the target meaning. RETRY for a close or recoverable attempt.',
      'BREAKDOWN only after repeated difficulty or an unintelligible attempt with attempts >= 2.',
    ].join(' '),
    prompt: JSON.stringify({
      skill: input.skill,
      target: input.target,
      learnerTranscript: input.transcript.slice(0, 120),
      attempts: Math.min(5, Math.max(0, input.attempts)),
      masteryLevel: Math.min(4, Math.max(0, input.masteryLevel)),
    }),
  });
  const tokenInput = result.usage.inputTokens || 0;
  const tokenOutput = result.usage.outputTokens || 0;
  const gatewayCost = numericCost(result.providerMetadata);
  return {
    decision: result.output,
    usage: {
      token_input: tokenInput,
      token_output: tokenOutput,
      model_calls: 1,
      estimated_ai_cost: gatewayCost || fallbackTextCost(model, tokenInput, tokenOutput),
      model_used: model,
      structured_retries: 0,
      safe_fallbacks: 0,
      retry_token_input: 0,
      retry_token_output: 0,
      retry_estimated_cost: 0,
    } satisfies CallUsage,
  };
}

export async function evaluateCoachAttempt(input: {
  skill: Extract<CoachSkill, 'PRONUNCIATION' | 'ROLEPLAY'>;
  expressionId: ExpressionId;
  target: { chinese: string; pinyin: string; indonesian: string };
  transcript: string;
  attempts: number;
  masteryLevel: number;
  sessionId: string;
}) {
  let firstUsage: CallUsage;
  let repairingStructuredFailure = false;
  try {
    const first = await callDecisionModel(FAST_MODEL, input);
    if (first.decision.confidence >= 0.67) return first;
    firstUsage = first.usage;
  } catch (error) {
    firstUsage = usageFromStructuredError(error, FAST_MODEL);
    repairingStructuredFailure = true;
    console.warn('[mandarin-coach-pronunciation-repair]', safeErrorDetails(error));
  }

  try {
    const second = await callDecisionModel(SMART_MODEL, input);
    const usage = mergeUsage(firstUsage, second.usage);
    return {
      decision: second.decision,
      usage: repairingStructuredFailure ? {
        ...usage,
        structured_retries: 1,
        retry_token_input: second.usage.token_input,
        retry_token_output: second.usage.token_output,
        retry_estimated_cost: second.usage.estimated_ai_cost,
      } : usage,
    };
  } catch (error) {
    const failedRepair = usageFromStructuredError(error, SMART_MODEL);
    const usage = mergeUsage(firstUsage, failedRepair);
    console.warn('[mandarin-coach-pronunciation-safe-fallback]', safeErrorDetails(error));
    const breakdown = input.attempts >= 2;
    return {
      decision: {
        verdict: breakdown ? 'BREAKDOWN' as const : 'RETRY' as const,
        feedbackId: input.skill === 'PRONUNCIATION'
          ? (breakdown ? 'pronunciation_breakdown' as const : 'pronunciation_retry' as const)
          : 'roleplay_retry' as const,
        nextAction: breakdown ? 'SHOW_BREAKDOWN' as const : 'REPEAT' as const,
        confidence: 0,
      },
      usage: {
        ...usage,
        structured_retries: repairingStructuredFailure ? 1 : 0,
        safe_fallbacks: 1,
        retry_token_input: repairingStructuredFailure ? failedRepair.token_input : 0,
        retry_token_output: repairingStructuredFailure ? failedRepair.token_output : 0,
        retry_estimated_cost: repairingStructuredFailure ? failedRepair.estimated_ai_cost : 0,
      },
    };
  }
}

/** 极简"继续上课"上下文：学生说 lanjut/mulai 时，取当前课的下一句（或第一句）作为确定性续教内容。 */
function buildContinueContext(message: string, context: { courseLesson: MandarinCoachCurriculumLesson; currentExpression: ExpressionId | null }): { lessonId: string; lessonTitle: string; next: { chinese: string; pinyin: string; indonesian: string } | null } | null {
  if (!/^(?:lanjut(?:kan)?|continue|next(?:\s+lesson)?|terus(?:kan)?|pelajaran berikutnya|lanjut belajar|mulai(?:\s+(?:pelajaran|belajar|aja|dong))?|ayo\s+mulai)[\s!?.]*$/i.test(message.trim())) return null;
  const lesson = context.courseLesson;
  if (!lesson?.expressions?.length) return { lessonId: lesson?.id ?? '', lessonTitle: lesson?.title ?? '', next: null };
  const index = context.currentExpression ? lesson.expressions.findIndex((item) => item.id === context.currentExpression) : -1;
  const nextItem = index < 0 ? lesson.expressions[0] : index < lesson.expressions.length - 1 ? lesson.expressions[index + 1] : null;
  return {
    lessonId: lesson.id, lessonTitle: lesson.title,
    next: nextItem ? { chinese: nextItem.chinese, pinyin: nextItem.pinyin, indonesian: nextItem.indonesian } : null,
  };
}

export async function answerCoachConversation(input: {
  message: string;
  sessionId: string;
  context: {
    courseLesson: MandarinCoachCurriculumLesson;
    currentDay: number;
    currentExpression: ExpressionId | null;
    currentSkill: CoachSkill;
    userLevel: string;
    recentMistakes: string[];
    masteryState: Array<{ expressionId: ExpressionId; masteryLevel: number }>;
    reviewQueue: ExpressionId[];
    conversationMode: 'GUIDED_TRAINING' | 'COACH_CONVERSATION';
    learningGoal: string;
    preferredExplanationLanguage: 'INDONESIAN' | 'MIXED';
    userInitiatedMemory: UserInitiatedMemory[];
    recentConversationSummary: string;
    recentTurns: Array<{ role: 'user' | 'assistant'; text: string }>;
  };
}) {
  const teachingPlan = planCoachTurn(input.message);
  const brainPlan = teachingPlan.route;
  const generateClassification = (model: string, maxOutputTokens: number) => generateText({
    model: gateway(model),
    output: Output.object({ schema: classificationSchema, name: 'mandarin_coach_intent' }),
    maxOutputTokens,
    temperature: 0,
    maxRetries: 0,
    providerOptions: { gateway: { tags: ['indobrain', 'mandarin-ai-coach', 'intent'], user: input.sessionId.slice(0, 96) } },
    system: [
      'You are the Language and Teaching Intent Router for an Indonesian learner of Mandarin.',
      'Return one or more intents. Mixed Indonesian, Chinese, pinyin, slang and misspellings are normal.',
      'Input language does not determine explanation language. Workplace language and roleplay are in scope.',
      'Language-learning follow-ups such as why, repeat, slower, I do not understand, or I cannot do it remain in scope when the conversation or course supplies the target.',
      'A request to complete an unrelated full task stays OFF_TOPIC even when the learner asks for that task in Chinese or calls it language practice.',
      'Select one or more of the ten available skill IDs (STUDY_PLANNING for study-plan/career-goal requests, COMMUNICATION_REQUEST for what-should-I-say-to-someone requests). Use SMART only for nuanced grammar, correction, workplace pragmatics, roleplay, planning or communication requests.',
      'Never reject an in-scope word merely because it is absent from the current course.',
      'Return only the structured object and preserve a concise normalizedInput.',
    ].join(' '),
    prompt: JSON.stringify({ learnerInput: input.message.slice(0, 500), deterministicHints: brainPlan }),
  });
  const deterministicClassification: ConversationClassification = {
    intent: brainPlan.learningIntents[0], intents: brainPlan.learningIntents, detectedLanguage: brainPlan.inputLanguage,
    skillIds: brainPlan.skillIds, targetChinese: brainPlan.targetChinese || '', normalizedInput: brainPlan.normalizedInput,
    modelTier: brainPlan.modelTier, answerCategory: brainPlan.offTopic ? 'OFF_TOPIC' : brainPlan.learningIntents.includes('STUDY_PLANNING') ? 'STUDY_SUPPORT' : brainPlan.learningIntents.includes('COMMUNICATION_REQUEST') ? 'EXPLANATION' : brainPlan.learningIntents.includes('ROLEPLAY') ? 'ROLEPLAY' : brainPlan.skillIds.includes('PRONUNCIATION') ? 'PRONUNCIATION_COACHING' : brainPlan.skillIds.includes('EXAMPLE') || brainPlan.skillIds.includes('VOCABULARY') ? 'EXAMPLE' : 'EXPLANATION',
  };
  let classification = deterministicClassification;
  let classificationUsage: CallUsage = { token_input: 0, token_output: 0, model_calls: 0, estimated_ai_cost: 0, model_used: 'mandarin-coach-brain-v0.1', structured_retries: 0, safe_fallbacks: 0, retry_token_input: 0, retry_token_output: 0, retry_estimated_cost: 0 };
  const sessionMemory = rememberSession(
    input.sessionId,
    extractSessionMemoryUpdate(input.message, input.context.courseLesson?.id ?? ''),
    brainPlan.learningIntents.includes('CORRECTION') ? brainPlan.targetChinese : null,
  );
  const continueContext = buildContinueContext(input.message, input.context);
  const deterministicAnswer = composeKnownCoachResponse(brainPlan, input.context.userInitiatedMemory, continueContext);
  if (deterministicAnswer) {
    return {
      classification: deterministicClassification,
      answer: { ...deterministicAnswer, summary: deterministicAnswer.summary || input.context.recentConversationSummary.slice(0, 280) } satisfies ConversationAnswer,
      usage: classificationUsage,
    };
  }
  if (brainPlan.confidence < 0.8) {
    try {
      const classificationResult = await generateClassification(FAST_MODEL, 220);
      classification = classificationResult.output;
      classificationUsage = usageFromResult(classificationResult, FAST_MODEL);
    } catch (error) {
      classificationUsage = usageFromStructuredError(error, FAST_MODEL);
      console.warn('[mandarin-coach-structured-classification-fallback]', safeErrorDetails(error));
    }
  }

  const answerModel = classification.modelTier === 'SMART' ? SMART_MODEL : FAST_MODEL;
  const answerSystem = buildTeacherSkillSystem({
    courseLesson: input.context.courseLesson,
    currentExpression: input.context.currentExpression,
    currentSkill: input.context.currentSkill,
    learningGoal: input.context.learningGoal,
    userLevel: input.context.userLevel,
    masteryState: input.context.masteryState,
    recentMistakes: input.context.recentMistakes,
    reviewQueue: input.context.reviewQueue,
    userInitiatedMemory: input.context.userInitiatedMemory,
    recentTurns: input.context.recentTurns,
    recentConversationSummary: input.context.recentConversationSummary,
    sessionMemory,
  });
  const answerPrompt = JSON.stringify({
      classification,
      learnerMessage: input.message.slice(0, 500),
      context: {
        ...input.context,
        recentConversationSummary: input.context.recentConversationSummary.slice(0, 280),
        recentTurns: input.context.recentTurns.slice(-6).map((turn) => ({ role: turn.role, text: turn.text.slice(0, 240) })),
        recentMistakes: input.context.recentMistakes.slice(0, 5),
        masteryState: input.context.masteryState.slice(0, 10),
        reviewQueue: input.context.reviewQueue.slice(0, 10),
        userInitiatedMemory: input.context.userInitiatedMemory.slice(-12),
      },
    });
  const generateConversationAnswer = (model: string, maxOutputTokens: number, repairText?: string) => generateText({
    model: gateway(model),
    output: Output.object({ schema: conversationAnswerSchema, name: 'mandarin_coach_answer' }),
    maxOutputTokens,
    temperature: 0.2,
    maxRetries: 0,
    providerOptions: { gateway: { tags: ['indobrain', 'mandarin-ai-coach', 'conversation', classification.intent.toLowerCase()], user: input.sessionId.slice(0, 96) } },
    system: repairText
      ? `${answerSystem} This is one controlled repair attempt. Convert the prior malformed candidate into the exact requested object. Do not add commentary outside the object.`
      : answerSystem,
    prompt: repairText ? JSON.stringify({ originalRequest: JSON.parse(answerPrompt), malformedCandidate: repairText.slice(0, 1600) }) : answerPrompt,
  });
  let answerUsage = classificationUsage;
  try {
    const answerResult = await generateConversationAnswer(answerModel, 700);
    return {
      classification,
      answer: answerResult.output,
      usage: mergeUsage(classificationUsage, usageFromResult(answerResult, answerModel)),
    };
  } catch (error) {
    answerUsage = mergeUsage(classificationUsage, usageFromStructuredError(error, answerModel));
    console.warn('[mandarin-coach-structured-answer-failed]', { model: answerModel, ...safeErrorDetails(error) });
    try {
      const malformedCandidate = NoObjectGeneratedError.isInstance(error) ? error.text || '' : '';
      const repaired = await generateConversationAnswer(FAST_MODEL, 700, malformedCandidate);
      const repairUsage = usageFromResult(repaired, FAST_MODEL);
      repairUsage.structured_retries = 1;
      repairUsage.retry_token_input = repairUsage.token_input;
      repairUsage.retry_token_output = repairUsage.token_output;
      repairUsage.retry_estimated_cost = repairUsage.estimated_ai_cost;
      console.info('[mandarin-coach-structured-retry]', { fromModel: answerModel, repairModel: FAST_MODEL, success: true });
      return {
        classification,
        answer: repaired.output,
        usage: mergeUsage(answerUsage, repairUsage),
      };
    } catch (repairError) {
      const repairUsage = usageFromStructuredError(repairError, FAST_MODEL);
      repairUsage.structured_retries = 1;
      repairUsage.safe_fallbacks = 1;
      repairUsage.retry_token_input = repairUsage.token_input;
      repairUsage.retry_token_output = repairUsage.token_output;
      repairUsage.retry_estimated_cost = repairUsage.estimated_ai_cost;
      console.warn('[mandarin-coach-safe-fallback]', { repairModel: FAST_MODEL, ...safeErrorDetails(repairError) });
      return {
        classification,
        answer: safeTeachingFallback(brainPlan, classification, input.context.recentConversationSummary),
        usage: mergeUsage(answerUsage, repairUsage),
      };
    }
  }
}

export function anonymizeLearningQuestion(value: string) {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/(?:\+?\d[\s().-]?){8,}/g, '[phone]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export async function transcribeMandarin(audio: Uint8Array, sessionId: string) {
  try {
    const result = await transcribe({
      model: gateway.transcriptionModel(STT_MODEL),
      audio,
      maxRetries: 1,
      providerOptions: { gateway: { tags: ['indobrain', 'mandarin-ai-coach', 'stt'], user: sessionId.slice(0, 96) } },
    });
    return {
      transcript: result.text.trim(),
      language: result.language,
      durationInSeconds: result.durationInSeconds || 0,
      model: STT_MODEL,
      estimatedCost: numericCost(result.providerMetadata),
      noTranscript: false,
    };
  } catch (error) {
    if (!NoTranscriptGeneratedError.isInstance(error)) throw error;
    console.info('[mandarin-coach-stt-empty]', { name: error.name });
    return {
      transcript: '',
      language: undefined,
      durationInSeconds: 0,
      model: STT_MODEL,
      estimatedCost: 0,
      noTranscript: true,
    };
  }
}

export function coachConfiguration() {
  return {
    fastModel: FAST_MODEL,
    smartModel: SMART_MODEL,
    sttModel: STT_MODEL,
    gatewayCredentialAvailable: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL),
  };
}

export const COACH_DAY_ONE_TARGETS = DAY_ONE_EXPRESSIONS.map(({ id, chinese, pinyin, indonesian }) => ({ id, chinese, pinyin, indonesian }));
