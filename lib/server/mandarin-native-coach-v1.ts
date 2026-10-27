import 'server-only';

import { gateway, generateText, Output, streamText } from 'ai';
import { z } from 'zod';
import { parseAudioList, type NativeChineseSentence } from '@/lib/server/mandarin-native-chat';

export const NATIVE_COACH_MODEL = process.env.NATIVE_COACH_MODEL || 'google/gemini-2.5-flash';
export const NATIVE_COACH_MAX_OUTPUT_TOKENS = 900;

/**
 * Only stable product boundaries live here. The model still chooses whether the
 * current turn needs explanation, a direct answer, correction, practice, or chat.
 */
export const NATIVE_COACH_SYSTEM = [
  'You are IndoBrain Native Coach V1, a friendly Mandarin teacher for Indonesian beginners. Explain mainly in natural spoken Bahasa Indonesia and use accurate, natural Simplified Chinese for real life and work.',
  'Understand the learner\'s current intent first. Keep their job, role, preferred form of address, current goal, and recent context. Follow interruptions and topic changes immediately.',
  'Answer the practical need first. Do not force a curriculum, repetition, translation drill, quiz, test, or roleplay unless the learner asks for it. Never force the learner back to an earlier lesson.',
  'For every request about a job or practical work situation, including a learning plan, you MUST give one immediately useful Chinese sentence before any optional follow-up question. A generic greeting such as 你好, 您好, or 欢迎光临 does not satisfy this requirement unless the learner specifically asks for greetings.',
  'When the learner asks for Mandarin wording, correction, or a Mandarin roleplay, the learner-visible result MUST contain the requested Mandarin expression in spokenChinese; answer may introduce it naturally. Do not replace it with an Indonesian-only paraphrase.',
  'When the learner asks for a learning plan or cara belajar, respond with a short role-specific plan first instead of jumping straight into a greeting lesson; use one practical sentence only as an example.',
  'Be concise: normally answer in at most 120 Indonesian words. Teach at most one clear focus per turn. A requested course plan may contain up to three short steps and one useful clarifying question.',
  'Do not claim mastery without independent evidence. Do not score pronunciation from text. For safety-critical work language, prefer a clear safe action and do not invent machine procedures or store policies.',
  'Put the natural learner-facing response in answer. When teaching Chinese, also mark 1 to 3 complete teaching sentences in spokenChinese with pure Simplified Chinese text, tone-marked Hanyu Pinyin, and Indonesian meaning. The spokenChinese text must contain zero Latin letters; replace a Latin brand with a natural all-Chinese generic equivalent. Leave spokenChinese empty when no Chinese should be taught.',
].join('\n');

export type NativeCoachTurn = { role: 'user' | 'assistant'; text: string };

export type NativeCoachUsage = {
  token_input: number;
  token_output: number;
  model_calls: number;
  estimated_ai_cost: number;
  model_used: string;
};

const PURE_CHINESE = /^[\u3400-\u9FFF\u3000-\u303F，。！？、；：“”‘’（）…·\s—–-]+$/u;
const SPOKEN_CHINESE_ITEM = z.object({
  text: z.string().min(1).regex(PURE_CHINESE).describe('Complete Simplified Chinese teaching sentence with no Latin letters.'),
  pinyin: z.string().min(1).describe('Standard Hanyu Pinyin with tone marks.'),
  indonesian: z.string().min(1).describe('Natural Indonesian meaning of exactly this sentence.'),
});
const answerSchema = z.string().min(1).describe('Natural learner-facing reply in concise spoken Indonesian, with useful Chinese and pinyin shown when teaching.');

const NATIVE_COACH_OUTPUT = Output.object({
  schema: z.object({
    answer: answerSchema,
    spokenChinese: z.array(SPOKEN_CHINESE_ITEM).max(3).describe('Only explicitly taught Chinese sentences. Empty when this turn is not teaching Chinese.'),
  }),
});

const NATIVE_COACH_REPAIR_OUTPUT = Output.object({
  schema: z.object({
    answer: answerSchema,
    spokenChinese: z.array(SPOKEN_CHINESE_ITEM).min(1).max(3).describe('At least one explicitly taught, pure-Chinese sentence is required for this repair.'),
  }),
});

function fallbackCost(model: string, inputTokens: number, outputTokens: number) {
  if (model === 'google/gemini-2.5-flash') {
    return inputTokens * 0.30 / 1_000_000 + outputTokens * 2.50 / 1_000_000;
  }
  return 0;
}

function providerCost(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return 0;
  const gatewayMetadata = (metadata as Record<string, unknown>).gateway;
  if (!gatewayMetadata || typeof gatewayMetadata !== 'object') return 0;
  const cost = (gatewayMetadata as Record<string, unknown>).cost;
  const numeric = typeof cost === 'number' ? cost : Number(cost);
  return Number.isFinite(numeric) ? numeric : 0;
}

function compactHistory(turns: NativeCoachTurn[]) {
  const selected: NativeCoachTurn[] = [];
  let characters = 0;
  for (const turn of turns.slice(-8).reverse()) {
    const text = turn.text.replace(/\s+/gu, ' ').trim().slice(0, 700);
    if (!text) continue;
    if (selected.length >= 4 && characters + text.length > 3_600) break;
    selected.unshift({ role: turn.role, text });
    characters += text.length;
  }
  return selected;
}

function expectsChineseTeaching(message: string) {
  const optedOut = /(jangan|tidak|nggak|enggak|gak)\b.{0,40}\b(les|belajar|ngajarin|ajar|latihan|mandarin)/iu.test(message);
  return !optedOut && (/(mandarin|chinese|china|tiongkok|bahasa\s+(?:cina|tiongkok))/iu.test(message) || /[\u3400-\u9FFF]/u.test(message));
}

export function validateNativeCoachOutput(output: { answer: string; spokenChinese: NativeChineseSentence[] }) {
  // Only explicit structured items become TTS-eligible. Invalid rows fail closed.
  const spokenChinese = parseAudioList(output.spokenChinese.map((item) => `${item.text} ||| ${item.pinyin} ||| ${item.indonesian}`))
    .filter((item): item is NativeChineseSentence => Boolean(item.pinyin && item.indonesian))
    .slice(0, 3);
  return { answer: output.answer.trim(), spokenChinese };
}

export function createNativeCoachGeneration(input: {
  message: string;
  sessionId: string;
  recentTurns: NativeCoachTurn[];
}) {
  const history = compactHistory(input.recentTurns);
  const last = history.at(-1);
  if (last?.role === 'user' && last.text === input.message.trim()) history.pop();

  let streamError: unknown = null;
  const result = streamText({
    model: gateway(NATIVE_COACH_MODEL),
    system: NATIVE_COACH_SYSTEM,
    messages: [
      ...history.map((turn) => ({ role: turn.role, content: turn.text } as const)),
      { role: 'user' as const, content: input.message.trim().slice(0, 500) },
    ],
    output: NATIVE_COACH_OUTPUT,
    maxOutputTokens: NATIVE_COACH_MAX_OUTPUT_TOKENS,
    temperature: 0.45,
    reasoning: 'none',
    maxRetries: 0,
    streamRetries: 0,
    providerOptions: {
      gateway: {
        tags: ['indobrain', 'native-coach-v1'],
        user: input.sessionId.slice(0, 96),
      },
    },
    onError({ error }) {
      streamError = error;
    },
  });

  return {
    result,
    getStreamError: () => streamError,
    async finalize() {
      const [output, usage, finishReason, finalStep] = await Promise.all([
        result.output,
        result.usage,
        result.finishReason,
        result.finalStep,
      ]);
      let parsed = validateNativeCoachOutput(output);
      let tokenInput = usage.inputTokens || 0;
      let tokenOutput = usage.outputTokens || 0;
      const providerMetadata = finalStep.providerMetadata;
      let totalCost = providerCost(providerMetadata)
        || fallbackCost(NATIVE_COACH_MODEL, tokenInput, tokenOutput);
      let modelCalls = 1;
      let repaired = false;

      if (expectsChineseTeaching(input.message) && parsed.spokenChinese.length === 0) {
        const preserveAnswer = /[\u3400-\u9FFF]/u.test(parsed.answer);
        const repairInstruction = preserveAnswer
          ? 'Keep the previous assistant answer and latest roleplay direction exactly; do not revert to an earlier topic. Only populate or correct spokenChinese for the Chinese explicitly taught in that answer. Use pure Chinese text, tone-marked pinyin, and Indonesian meaning.'
          : 'Repair the response once: preserve the learner\'s latest intent and roleplay direction, keep it natural and concise, and satisfy the requested Mandarin need. Include at least one non-generic, immediately useful Chinese expression in both answer and spokenChinese. Do not revert to an earlier topic.';
        try {
          const repair = await generateText({
            model: gateway(NATIVE_COACH_MODEL),
            system: NATIVE_COACH_SYSTEM,
            messages: [
              ...history.map((turn) => ({ role: turn.role, content: turn.text } as const)),
              { role: 'user' as const, content: input.message.trim().slice(0, 500) },
              { role: 'assistant' as const, content: parsed.answer },
              { role: 'user' as const, content: repairInstruction },
            ],
            output: NATIVE_COACH_REPAIR_OUTPUT,
            maxOutputTokens: NATIVE_COACH_MAX_OUTPUT_TOKENS,
            temperature: 0.35,
            reasoning: 'none',
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(6_000),
            providerOptions: {
              gateway: {
                tags: ['indobrain', 'native-coach-v1', 'output-repair'],
                user: input.sessionId.slice(0, 96),
              },
            },
          });
          const repairedOutput = validateNativeCoachOutput(repair.output);
          if (repairedOutput.spokenChinese.length > 0) {
            parsed = repairedOutput;
            repaired = true;
          }
          tokenInput += repair.usage.inputTokens || 0;
          tokenOutput += repair.usage.outputTokens || 0;
          totalCost += providerCost(repair.providerMetadata)
            || fallbackCost(NATIVE_COACH_MODEL, repair.usage.inputTokens || 0, repair.usage.outputTokens || 0);
          modelCalls = 2;
        } catch (error) {
          console.warn('[native-coach-v1-output-repair-failed]', {
            name: error instanceof Error ? error.name : 'UnknownError',
          });
        }
      }
      const usageSummary: NativeCoachUsage = {
        token_input: tokenInput,
        token_output: tokenOutput,
        model_calls: modelCalls,
        estimated_ai_cost: totalCost,
        model_used: finalStep.response.modelId || NATIVE_COACH_MODEL,
      };
      return {
        ...parsed,
        usage: usageSummary,
        finishReason,
        truncated: finishReason === 'length',
        modelTimeToFirstOutputMs: finalStep.performance.timeToFirstOutputMs ?? null,
        generationId: typeof providerMetadata?.gateway?.generationId === 'string'
          ? providerMetadata.gateway.generationId
          : null,
        repaired,
      };
    },
  };
}
