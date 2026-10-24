import 'server-only';

import { NoObjectGeneratedError, Output, gateway, generateText, jsonSchema } from 'ai';

const FAST_MODEL = process.env.FAST_MODEL || 'google/gemini-2.5-flash-lite';
const SMART_MODEL = process.env.SMART_MODEL || 'google/gemini-2.5-flash';

export type FreeTeachingMode = 'TEACH' | 'TEST' | 'CORRECT' | 'REVIEW' | 'FREE_QA' | 'ROLEPLAY';

export type SpokenChinese = {
  text: string;
  pinyin: string;
  indonesian: string;
  purpose: string;
};

export type FreeTeachingAnswer = {
  responseMode: FreeTeachingMode;
  answer: string;
  spokenChinese: SpokenChinese[];
  followUp: string;
  assessment: {
    status: 'NOT_ASSESSED' | 'CORRECT' | 'NEEDS_WORK';
    evidence: string;
  };
  difficulty: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE';
  contextSummary: string;
  courseReferenceUsed: boolean;
};

export type FreeTeachingUsage = {
  token_input: number;
  token_output: number;
  model_calls: number;
  estimated_ai_cost: number;
  model_used: string;
  structured_retries: number;
};

const answerSchema = jsonSchema<FreeTeachingAnswer>({
  type: 'object',
  additionalProperties: false,
  required: ['responseMode', 'answer', 'spokenChinese', 'followUp', 'assessment', 'difficulty', 'contextSummary', 'courseReferenceUsed'],
  properties: {
    responseMode: { type: 'string', enum: ['TEACH', 'TEST', 'CORRECT', 'REVIEW', 'FREE_QA', 'ROLEPLAY'] },
    answer: { type: 'string', minLength: 1, maxLength: 1200 },
    spokenChinese: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'pinyin', 'indonesian', 'purpose'],
        properties: {
          text: { type: 'string', minLength: 1, maxLength: 120 },
          pinyin: { type: 'string', maxLength: 240 },
          indonesian: { type: 'string', maxLength: 320 },
          purpose: { type: 'string', maxLength: 160 },
        },
      },
    },
    followUp: { type: 'string', maxLength: 400 },
    assessment: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'evidence'],
      properties: {
        status: { type: 'string', enum: ['NOT_ASSESSED', 'CORRECT', 'NEEDS_WORK'] },
        evidence: { type: 'string', maxLength: 400 },
      },
    },
    difficulty: { type: 'string', enum: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'] },
    contextSummary: { type: 'string', maxLength: 500 },
    courseReferenceUsed: { type: 'boolean' },
  },
});

function fallbackCost(model: string, inputTokens: number, outputTokens: number) {
  if (model === 'google/gemini-2.5-flash') return inputTokens * 0.30 / 1_000_000 + outputTokens * 2.50 / 1_000_000;
  return inputTokens * 0.10 / 1_000_000 + outputTokens * 0.40 / 1_000_000;
}

function providerCost(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return 0;
  const gatewayMetadata = (metadata as Record<string, unknown>).gateway;
  if (!gatewayMetadata || typeof gatewayMetadata !== 'object') return 0;
  const cost = (gatewayMetadata as Record<string, unknown>).cost;
  const numeric = typeof cost === 'number' ? cost : Number(cost);
  return Number.isFinite(numeric) ? numeric : 0;
}

function usageOf(result: { usage: { inputTokens?: number; outputTokens?: number }; providerMetadata?: unknown }, model: string): FreeTeachingUsage {
  const tokenInput = result.usage.inputTokens || 0;
  const tokenOutput = result.usage.outputTokens || 0;
  return {
    token_input: tokenInput,
    token_output: tokenOutput,
    model_calls: 1,
    estimated_ai_cost: providerCost(result.providerMetadata) || fallbackCost(model, tokenInput, tokenOutput),
    model_used: model,
    structured_retries: 0,
  };
}

function failedUsage(error: unknown, model: string): FreeTeachingUsage {
  if (!NoObjectGeneratedError.isInstance(error) || !error.usage) {
    return { token_input: 0, token_output: 0, model_calls: 0, estimated_ai_cost: 0, model_used: model, structured_retries: 0 };
  }
  const tokenInput = error.usage.inputTokens || 0;
  const tokenOutput = error.usage.outputTokens || 0;
  return {
    token_input: tokenInput,
    token_output: tokenOutput,
    model_calls: 1,
    estimated_ai_cost: fallbackCost(model, tokenInput, tokenOutput),
    model_used: model,
    structured_retries: 0,
  };
}

function mergeUsage(first: FreeTeachingUsage, second: FreeTeachingUsage): FreeTeachingUsage {
  return {
    token_input: first.token_input + second.token_input,
    token_output: first.token_output + second.token_output,
    model_calls: first.model_calls + second.model_calls,
    estimated_ai_cost: first.estimated_ai_cost + second.estimated_ai_cost,
    model_used: first.model_used === second.model_used ? first.model_used : `${first.model_used} → ${second.model_used}`,
    structured_retries: first.structured_retries + second.structured_retries,
  };
}

const SYSTEM = [
  'You are the AI Free Teaching V1 teacher in IndoBrain. Teach Mainland Simplified Mandarin to Indonesian absolute beginners, mainly using clear Bahasa Indonesia.',
  'Infer the learner intent yourself. If they ask for a test, test them. If they ask for an explanation, explain. If they want practice or roleplay, begin it. If they answer an exercise, evaluate only against the exercise actually asked in the visible conversation.',
  'The learner’s latest explicit request overrides any unfinished test or exercise. A new roleplay request must begin roleplay in the same turn instead of continuing the old test.',
  'A test request must produce at least one concrete question or translation task in answer in the SAME turn; do not put the only task in followUp or merely announce that a test will begin. A request for a harder question must actually give a harder question and use responseMode TEST, not switch into a lecture.',
  'There is no mandatory lesson, target sentence, card, or state-machine progression. Never drag the learner back to an earlier lesson. “Jelaskan lagi” refers to the immediately preceding assistant topic; “继续刚才的练习” continues the immediately preceding practice.',
  'Adjust difficulty from the learner’s actual answers. Never claim mastery without direct evidence. A question, request, or “belum paham” is NOT an attempted answer and must use assessment.status NOT_ASSESSED.',
  'Do not say “benar”, “betul”, “bagus”, or equivalent praise unless assessment.status is CORRECT and assessment.evidence cites the learner answer that proves it. A request to continue is never evidence of correctness.',
  'Chinese must be accurate, natural, and useful in real workplace situations. Pinyin must use tone marks. Keep the teaching focused and interactive rather than producing a long syllabus.',
  'No course library is injected into this request. Use the learner’s current message, recent conversation, and prior context summary as the learning context. courseReferenceUsed must be false.',
  'spokenChinese is an explicit allowlist for zh-CN TTS and clickable sentence audio. Put only complete Chinese teaching text directly taught, explained, tested, or used in the current roleplay into spokenChinese[].text. Never add an unrelated example. Never put Indonesian, English, pinyin, labels, markdown, or UI copy in text. Do not collect every Han character from answer. If nothing should be spoken, return an empty array.',
  'answer and followUp are UI text and are never auto-read. Return only the structured object.',
].join(' ');

export async function answerFreeTeaching(input: {
  message: string;
  sessionId: string;
  recentTurns: Array<{ role: 'user' | 'assistant'; text: string }>;
  contextSummary: string;
  modelTier?: 'FAST' | 'SMART';
}) {
  const model = input.modelTier === 'FAST' ? FAST_MODEL : SMART_MODEL;
  const immediatePreviousAssistantTurn = [...input.recentTurns]
    .reverse()
    .find((turn) => turn.role === 'assistant')?.text.slice(0, 600) || '';
  const prompt = JSON.stringify({
    learnerMessage: input.message.slice(0, 500),
    recentTurns: input.recentTurns.slice(-8).map((turn) => ({ role: turn.role, text: turn.text.slice(0, 600) })),
    priorContextSummary: input.contextSummary.slice(0, 350),
    immediatePreviousAssistantTurn,
  });
  const generate = (repair?: string) => generateText({
    model: gateway(model),
    output: Output.object({ schema: answerSchema, name: 'indobrain_free_teacher_answer' }),
    maxOutputTokens: 1100,
    temperature: 0.25,
    maxRetries: 0,
    providerOptions: {
      gateway: {
        tags: ['indobrain', 'ai-free-teaching-v1', repair ? 'repair' : 'conversation'],
        user: input.sessionId.slice(0, 96),
      },
    },
    system: repair
      ? `${SYSTEM} This is one controlled repair. Convert the malformed candidate into the exact schema without adding facts.`
      : SYSTEM,
    prompt: repair ? JSON.stringify({ originalRequest: JSON.parse(prompt), malformedCandidate: repair.slice(0, 2200) }) : prompt,
  });

  try {
    const result = await generate();
    return { answer: result.output, usage: usageOf(result, model) };
  } catch (error) {
    const firstUsage = failedUsage(error, model);
    const malformed = NoObjectGeneratedError.isInstance(error) ? error.text || '' : '';
    const repaired = await generate(malformed);
    const repairUsage = usageOf(repaired, model);
    repairUsage.structured_retries = 1;
    return { answer: repaired.output, usage: mergeUsage(firstUsage, repairUsage) };
  }
}

