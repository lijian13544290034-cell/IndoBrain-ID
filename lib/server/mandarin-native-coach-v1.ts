import 'server-only';

import { gateway, streamText } from 'ai';
import { parseAudioList, type NativeChineseSentence } from '@/lib/server/mandarin-native-chat';

export const NATIVE_COACH_MODEL = process.env.NATIVE_COACH_MODEL || 'google/gemini-2.5-flash';
export const NATIVE_COACH_MAX_OUTPUT_TOKENS = 900;

/**
 * Only stable product boundaries live here. The model still chooses whether the
 * current turn needs explanation, a direct answer, correction, practice, or chat.
 */
export const NATIVE_COACH_SYSTEM = [
  'You are IndoBrain Native Coach V1, a friendly Mandarin learning assistant for Indonesian beginners.',
  'Understand the learner\'s current request and the real conversation context. Respond mainly in natural spoken Bahasa Indonesia.',
  'You may naturally teach, explain, correct, plan learning, roleplay, answer directly, or chat according to what the learner asks. The learner decides the direction; do not force a curriculum, repetition, translation drill, quiz, test, or roleplay.',
  'When Chinese is useful, use accurate natural Simplified Chinese and include standard tone-marked pinyin plus a brief Indonesian meaning in the response. Do not add Chinese merely to fill a format.',
  'Resolve references such as “yang tadi” from the actual visible history. If the reference does not identify exactly one prior expression, do not guess: ask one brief clarification.',
  'Do not claim mastery without evidence and do not score pronunciation from text. Keep safety-critical work guidance conservative.',
].join('\n');

export type NativeCoachTeachingItem = NativeChineseSentence;
export type NativeCoachBreakdown = {
  sentence: string;
  pinyin: string;
  indonesian: string;
  words: NativeChineseSentence[];
};
export type NativeCoachTurn = {
  role: 'user' | 'assistant';
  text: string;
  teaching?: NativeCoachTeachingItem[];
  breakdowns?: NativeCoachBreakdown[];
};

export type NativeCoachUsage = {
  token_input: number;
  token_output: number;
  model_calls: number;
  estimated_ai_cost: number;
  model_used: string;
};

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

function compactHistory(turns: NativeCoachTurn[], learningReferences: NativeCoachTeachingItem[]) {
  const selected: NativeCoachTurn[] = [];
  let characters = 0;
  for (const turn of turns.slice(-8).reverse()) {
    const body = turn.text.replace(/\s+/gu, ' ').trim().slice(0, 900);
    const references = [
      ...(turn.teaching ?? []),
      ...(turn.breakdowns ?? []).flatMap((item) => [
        { text: item.sentence, pinyin: item.pinyin, indonesian: item.indonesian },
        ...item.words,
      ]),
    ].filter((item, index, items) => item.text && items.findIndex((candidate) => candidate.text === item.text) === index)
      .filter((item) => !(body.includes(item.text) && body.includes(item.pinyin) && body.includes(item.indonesian)))
      .slice(0, 8)
      .map((item) => `${item.text} | ${item.pinyin} | ${item.indonesian}`);
    const text = `${body}${references.length ? `\n[Learning content actually shown: ${references.join(' ; ')}]` : ''}`.slice(0, 1_600);
    if (!text) continue;
    if (selected.length >= 4 && characters + text.length > 5_000) break;
    selected.unshift({ role: turn.role, text });
    characters += text.length;
  }
  const visible = selected.map((turn) => turn.text).join('\n');
  const earlier = learningReferences
    .filter((item, index, items) => item.text && items.findIndex((candidate) => candidate.text === item.text) === index)
    .filter((item) => !visible.includes(item.text))
    .slice(-8)
    .map((item) => `${item.text} | ${item.pinyin} | ${item.indonesian}`);
  if (earlier.length) selected.unshift({ role: 'assistant', text: `[Earlier learning references actually shown: ${earlier.join(' ; ')}]` });
  return selected;
}

export function extractNaturalTeachingItems(answer: string) {
  const clean = answer.replace(/[*_`#>]/gu, ' ');
  const lines: string[] = [];
  // Only explicit teaching rows become cards. Natural prose such as “kata 爱 (ài) tadi”
  // remains clickable text but is not misread as a Chinese/pinyin/meaning triple.
  const inline = /^\s*(?:[-*]\s*|\d+[.)]\s*)?\**([\u3400-\u9FFF][\u3400-\u9FFF0-9，。！？、；：“”‘’（）…·\s—–-]{0,119})\s*[（(]([A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň\s'’,.?!-]{2,180})[）)]\**\s*(?:[—–-]|:|：)\s*([^\n]{2,200})$/gmu;
  for (const match of clean.matchAll(inline)) lines.push(`${match[1].trim()} ||| ${match[2].trim()} ||| ${match[3].trim()}`);

  const labelled = /(?:中文|Mandarin)\s*[:：]\s*([^\n]+)\n\s*(?:拼音|Pinyin)\s*[:：]\s*([^\n]+)\n\s*(?:印尼语|Arti(?:nya)?)\s*[:：]\s*([^\n]+)/giu;
  for (const match of clean.matchAll(labelled)) lines.push(`${match[1].trim()} ||| ${match[2].trim()} ||| ${match[3].trim()}`);

  return parseAudioList(lines)
    .filter((item): item is NativeChineseSentence => Boolean(item.pinyin && item.indonesian))
    .slice(0, 4);
}

export function createNativeCoachGeneration(input: {
  message: string;
  sessionId: string;
  recentTurns: NativeCoachTurn[];
  learningReferences?: NativeCoachTeachingItem[];
}) {
  const history = compactHistory(input.recentTurns, input.learningReferences ?? []);
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
    maxOutputTokens: NATIVE_COACH_MAX_OUTPUT_TOKENS,
    temperature: 0.45,
    reasoning: 'none',
    maxRetries: 1,
    streamRetries: 1,
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
      const [answer, usage, finishReason, finalStep] = await Promise.all([
        result.text,
        result.usage,
        result.finishReason,
        result.finalStep,
      ]);
      const tokenInput = usage.inputTokens || 0;
      const tokenOutput = usage.outputTokens || 0;
      const providerMetadata = finalStep.providerMetadata;
      const usageSummary: NativeCoachUsage = {
        token_input: tokenInput,
        token_output: tokenOutput,
        model_calls: 1,
        estimated_ai_cost: providerCost(providerMetadata)
          || fallbackCost(NATIVE_COACH_MODEL, tokenInput, tokenOutput),
        model_used: finalStep.response.modelId || NATIVE_COACH_MODEL,
      };
      return {
        answer: answer.trim(),
        spokenChinese: extractNaturalTeachingItems(answer),
        usage: usageSummary,
        finishReason,
        truncated: finishReason === 'length',
        modelTimeToFirstOutputMs: finalStep.performance.timeToFirstOutputMs ?? null,
        generationId: typeof providerMetadata?.gateway?.generationId === 'string'
          ? providerMetadata.gateway.generationId
          : null,
      };
    },
  };
}
