import 'server-only';

import { NoObjectGeneratedError, Output, experimental_transcribe as transcribe, gateway, generateText, jsonSchema } from 'ai';
import { DAY_ONE_EXPRESSIONS, type CoachBrainSkillId, type CoachDetectedLanguage, type CoachIntent, type CoachSkill, type CoachVerdict, type ExpressionId, type FeedbackId, type UserInitiatedMemory, getExpression } from '@/lib/mandarin-ai-coach';
import { buildSkillGrounding, composeKnownCoachResponse, routeCoachInput, type CoachBrainAnswer } from '@/lib/server/mandarin-coach-brain';

const FAST_MODEL = process.env.FAST_MODEL || 'google/gemini-2.5-flash-lite';
const SMART_MODEL = process.env.SMART_MODEL || 'google/gemini-2.5-flash';
const STT_MODEL = process.env.STT_MODEL || 'openai/gpt-4o-mini-transcribe';

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
    intent: { type: 'string', enum: ['VOCABULARY', 'PRONUNCIATION', 'MEANING', 'CORRECTION', 'EXAMPLE', 'CONVERSATION', 'WORKPLACE', 'REVIEW', 'ROLEPLAY', 'GRAMMAR', 'OFF_TOPIC'] },
    intents: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string', enum: ['VOCABULARY', 'PRONUNCIATION', 'MEANING', 'CORRECTION', 'EXAMPLE', 'CONVERSATION', 'WORKPLACE', 'REVIEW', 'ROLEPLAY', 'GRAMMAR', 'OFF_TOPIC'] } },
    detectedLanguage: { type: 'string', enum: ['INDONESIAN', 'CHINESE', 'MIXED'] },
    skillIds: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string', enum: ['VOCABULARY', 'PRONUNCIATION', 'MEANING', 'CORRECTION', 'EXAMPLE', 'CONVERSATION', 'WORKPLACE', 'REVIEW'] } },
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
    answer: { type: 'string', minLength: 1, maxLength: 320 },
    chinese: { type: 'string', maxLength: 120 },
    pinyin: { type: 'string', maxLength: 180 },
    indonesian: { type: 'string', maxLength: 300 },
    followUp: { type: 'string', maxLength: 160 },
    summary: { type: 'string', maxLength: 280 },
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
  transcript: string;
  attempts: number;
  masteryLevel: number;
  sessionId: string;
}) {
  const expression = getExpression(input.expressionId);
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
      target: { chinese: expression.chinese, pinyin: expression.pinyin, indonesian: expression.indonesian },
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
  transcript: string;
  attempts: number;
  masteryLevel: number;
  sessionId: string;
}) {
  const first = await callDecisionModel(FAST_MODEL, input);
  if (first.decision.confidence >= 0.67) return first;
  const second = await callDecisionModel(SMART_MODEL, input);
  return {
    decision: second.decision,
    usage: {
      token_input: first.usage.token_input + second.usage.token_input,
      token_output: first.usage.token_output + second.usage.token_output,
      model_calls: 2,
      estimated_ai_cost: first.usage.estimated_ai_cost + second.usage.estimated_ai_cost,
      model_used: `${FAST_MODEL} → ${SMART_MODEL}`,
      structured_retries: first.usage.structured_retries + second.usage.structured_retries,
      safe_fallbacks: first.usage.safe_fallbacks + second.usage.safe_fallbacks,
      retry_token_input: first.usage.retry_token_input + second.usage.retry_token_input,
      retry_token_output: first.usage.retry_token_output + second.usage.retry_token_output,
      retry_estimated_cost: first.usage.retry_estimated_cost + second.usage.retry_estimated_cost,
    } satisfies CallUsage,
  };
}

export async function answerCoachConversation(input: {
  message: string;
  sessionId: string;
  context: {
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
  const brainPlan = routeCoachInput(input.message);
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
      'Select one or more of the eight available skill IDs. Use SMART only for nuanced grammar, correction, workplace pragmatics or roleplay.',
      'Never reject an in-scope word merely because it is absent from the current course.',
      'Return only the structured object and preserve a concise normalizedInput.',
    ].join(' '),
    prompt: JSON.stringify({ learnerInput: input.message.slice(0, 500), deterministicHints: brainPlan }),
  });
  const deterministicClassification: ConversationClassification = {
    intent: brainPlan.learningIntents[0], intents: brainPlan.learningIntents, detectedLanguage: brainPlan.inputLanguage,
    skillIds: brainPlan.skillIds, targetChinese: brainPlan.targetChinese || '', normalizedInput: brainPlan.normalizedInput,
    modelTier: brainPlan.modelTier, answerCategory: brainPlan.offTopic ? 'OFF_TOPIC' : brainPlan.learningIntents.includes('ROLEPLAY') ? 'ROLEPLAY' : brainPlan.skillIds.includes('PRONUNCIATION') ? 'PRONUNCIATION_COACHING' : brainPlan.skillIds.includes('EXAMPLE') || brainPlan.skillIds.includes('VOCABULARY') ? 'EXAMPLE' : 'EXPLANATION',
  };
  let classification = deterministicClassification;
  let classificationUsage: CallUsage = { token_input: 0, token_output: 0, model_calls: 0, estimated_ai_cost: 0, model_used: 'mandarin-coach-brain-v0.1', structured_retries: 0, safe_fallbacks: 0, retry_token_input: 0, retry_token_output: 0, retry_estimated_cost: 0 };
  const deterministicAnswer = composeKnownCoachResponse(brainPlan, input.context.userInitiatedMemory);
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
  const skillGrounding = buildSkillGrounding({ ...brainPlan, learningIntents: classification.intents, skillIds: classification.skillIds, targetChinese: classification.targetChinese || brainPlan.targetChinese });
  const answerSystem = [
      'You are the Coach Decision and Response Composer for IndoBrain Mandarin Coach Brain V0.1.',
      'The course provides the main path; it is never the boundary of what Mandarin you can teach.',
      'Use the selected skill grounding below, then expose only one coherent final answer. Never expose router disagreement or an internal module error.',
      'For BEGINNER, use simple Bahasa Indonesia as the main explanation language even when the input is Chinese. Use Simplified Chinese as the learning target.',
      'The complete default reply MUST stay within 1-3 short Indonesian sentences. Put a teaching target in chinese, accurate tone-marked pinyin in pinyin, and its Indonesian meaning in indonesian.',
      'If a useful target was initiated by the learner, set rememberTarget and its three target fields. If reliable teaching is impossible, set skillGap instead of inventing facts.',
      'If slow speech is requested, set ttsRate=slow. Never claim to slow down without setting it.',
      'Use standard Mainland Mandarin only. Never suggest zh-TW, zh-HK or Cantonese.',
      'Never pretend to know personal facts outside supplied structured memory. Return only the structured object.',
      `Locked Day 1 expressions: ${JSON.stringify(COACH_DAY_ONE_TARGETS)}.`,
      `Selected Skill Layer: ${JSON.stringify(skillGrounding)}.`,
    ].join(' ');
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
    const answerResult = await generateConversationAnswer(answerModel, 480);
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
      const repaired = await generateConversationAnswer(FAST_MODEL, 480, malformedCandidate);
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
  };
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
