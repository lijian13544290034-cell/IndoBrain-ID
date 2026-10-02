import 'server-only';

import { Output, experimental_transcribe as transcribe, gateway, generateText, jsonSchema } from 'ai';
import { DAY_ONE_EXPRESSIONS, type CoachDetectedLanguage, type CoachIntent, type CoachSkill, type CoachVerdict, type ExpressionId, type FeedbackId, getExpression } from '@/lib/mandarin-ai-coach';

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
};

type ConversationClassification = {
  intent: CoachIntent;
  detectedLanguage: CoachDetectedLanguage;
  modelTier: 'FAST' | 'SMART';
  answerCategory: 'EXPLANATION' | 'EXAMPLE' | 'PRONUNCIATION_COACHING' | 'ROLEPLAY' | 'STUDY_SUPPORT' | 'OFF_TOPIC';
};

type ConversationAnswer = {
  answer: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  followUp: string;
  summary: string;
};

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
  required: ['intent', 'detectedLanguage', 'modelTier', 'answerCategory'],
  properties: {
    intent: { type: 'string', enum: ['LEARNING_RELATED', 'ROLEPLAY', 'PRONUNCIATION', 'MEANING', 'GRAMMAR', 'WORKPLACE_CHINESE', 'GENERAL_CHINESE', 'OFF_TOPIC'] },
    detectedLanguage: { type: 'string', enum: ['INDONESIAN', 'CHINESE', 'MIXED'] },
    modelTier: { type: 'string', enum: ['FAST', 'SMART'] },
    answerCategory: { type: 'string', enum: ['EXPLANATION', 'EXAMPLE', 'PRONUNCIATION_COACHING', 'ROLEPLAY', 'STUDY_SUPPORT', 'OFF_TOPIC'] },
  },
});

const conversationAnswerSchema = jsonSchema<ConversationAnswer>({
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'chinese', 'pinyin', 'indonesian', 'followUp', 'summary'],
  properties: {
    answer: { type: 'string', minLength: 1, maxLength: 320 },
    chinese: { type: 'string', maxLength: 120 },
    pinyin: { type: 'string', maxLength: 180 },
    indonesian: { type: 'string', maxLength: 300 },
    followUp: { type: 'string', maxLength: 160 },
    summary: { type: 'string', maxLength: 280 },
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
  };
}

function mergeUsage(first: CallUsage, second: CallUsage): CallUsage {
  return {
    token_input: first.token_input + second.token_input,
    token_output: first.token_output + second.token_output,
    model_calls: first.model_calls + second.model_calls,
    estimated_ai_cost: first.estimated_ai_cost + second.estimated_ai_cost,
    model_used: `${first.model_used} → ${second.model_used}`,
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
    recentConversationSummary: string;
    recentTurns: Array<{ role: 'user' | 'assistant'; text: string }>;
  };
}) {
  const generateClassification = (model: string, maxOutputTokens: number) => generateText({
    model: gateway(model),
    output: Output.object({ schema: classificationSchema, name: 'mandarin_coach_intent' }),
    maxOutputTokens,
    temperature: 0,
    maxRetries: 1,
    providerOptions: { gateway: { tags: ['indobrain', 'mandarin-ai-coach', 'intent'], user: input.sessionId.slice(0, 96) } },
    system: [
      'Classify a message sent to a Mandarin coach for Indonesian beginners.',
      'Questions about Mandarin language, pronunciation, work/life Mandarin, Chinese workplace pragmatics, roleplay, or study difficulty are in scope.',
      'Do not mark a real Mandarin learning question OFF_TOPIC merely because it mentions a boss, interview, work, or Chinese culture.',
      'Use SMART only for grammar, nuanced workplace pragmatics, or open-ended roleplay; otherwise FAST.',
      'Return only the structured object.',
    ].join(' '),
    prompt: input.message.slice(0, 500),
  });
  let classificationModel = FAST_MODEL;
  let classificationResult;
  try {
    classificationResult = await generateClassification(FAST_MODEL, 120);
  } catch {
    classificationModel = SMART_MODEL;
    classificationResult = await generateClassification(SMART_MODEL, 140);
  }
  const classification = classificationResult.output;
  const classificationUsage = usageFromResult(classificationResult, classificationModel);

  if (classification.intent === 'OFF_TOPIC') {
    return {
      classification,
      answer: {
        answer: 'Maaf, saya fokus membantu kamu belajar Mandarin 😊',
        chinese: '',
        pinyin: '',
        indonesian: 'Kalau ada pertanyaan tentang bahasa Mandarin, pekerjaan, percakapan, atau pengucapan, tanya saya ya.',
        followUp: 'Kembali Belajar',
        summary: input.context.recentConversationSummary.slice(0, 280),
      } satisfies ConversationAnswer,
      usage: classificationUsage,
    };
  }

  const answerModel = classification.modelTier === 'SMART' ? SMART_MODEL : FAST_MODEL;
  const answerSystem = [
      'You are IndoBrain AI Mandarin Coach for Indonesian absolute beginners.',
      'Stay strictly within Mandarin learning, pronunciation, grammar, work/life Mandarin, roleplay, study methods, and directly relevant language culture or pragmatics.',
      'The learner is an absolute beginner. The complete default reply MUST stay within 1-3 short sentences in simple Indonesian. Expand only when the learner explicitly requests detail.',
      'When teaching a Chinese expression, put it in chinese, provide accurate tone-marked Hanyu Pinyin in pinyin, and a concise Indonesian meaning in indonesian.',
      'Use only Simplified Chinese and standard Mainland Mandarin. Teaching explanations must be in simple Indonesian, never English.',
      'If the learner says they do not understand, asks for slower speech, or says it is difficult, pause the lesson, reassure them, and split only the current expression into smaller pieces. Do not add phonology theory unless asked.',
      'For roleplay, respond naturally in beginner-level Simplified Chinese, while allowing an Indonesian meaning question to pause and resume the roleplay.',
      'The locked Day 1 target data is authoritative. Never contradict its Chinese, pinyin, tones, or Indonesian meaning.',
      'For 谢谢, the first 谢 is fourth tone xiè and the second 谢 is neutral-tone xie; never claim both syllables are fourth tone.',
      'Never pretend to know personal facts outside the supplied structured memory.',
      'Return only the structured object. Empty strings are allowed when a field is not needed.',
      `Locked Day 1 expressions: ${JSON.stringify(COACH_DAY_ONE_TARGETS)}.`,
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
      },
    });
  const generateConversationAnswer = (model: string, maxOutputTokens: number) => generateText({
    model: gateway(model),
    output: Output.object({ schema: conversationAnswerSchema, name: 'mandarin_coach_answer' }),
    maxOutputTokens,
    temperature: 0.2,
    maxRetries: 1,
    providerOptions: { gateway: { tags: ['indobrain', 'mandarin-ai-coach', 'conversation', classification.intent.toLowerCase()], user: input.sessionId.slice(0, 96) } },
    system: answerSystem,
    prompt: answerPrompt,
  });
  let usedAnswerModel = answerModel;
  let answerResult;
  try {
    answerResult = await generateConversationAnswer(answerModel, 220);
  } catch {
    usedAnswerModel = SMART_MODEL;
    answerResult = await generateConversationAnswer(SMART_MODEL, 240);
  }
  return {
    classification,
    answer: answerResult.output,
    usage: mergeUsage(classificationUsage, usageFromResult(answerResult, usedAnswerModel)),
  };
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
