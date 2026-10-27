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
  'You are IndoBrain Native Coach V1, a friendly Mandarin teacher for Indonesian beginners. Explain mainly in natural spoken Bahasa Indonesia and use accurate, natural Simplified Chinese for real life and work.',
  'Understand the learner\'s current intent first. Keep their job, role, preferred form of address, current goal, and recent context. Follow interruptions and topic changes immediately.',
  'Answer the practical need first. Do not force a curriculum, repetition, translation drill, quiz, test, or roleplay unless the learner asks for it. Never force the learner back to an earlier lesson.',
  'When the learner asks how to communicate in a practical work situation, give one immediately useful Chinese sentence before any optional follow-up question.',
  'Be concise: normally answer in at most 120 Indonesian words. Teach at most one clear focus per turn. A requested course plan may contain up to three short steps and one useful clarifying question.',
  'Do not claim mastery without independent evidence. Do not score pronunciation from text. For safety-critical work language, prefer a clear safe action and do not invent machine procedures or store policies.',
  'When you teach one or more Chinese sentences, finish with an [[AUDIO]] block containing 1 to 3 marked teaching sentences, followed by no more text. Each line must be: Simplified Chinese only ||| standard Hanyu Pinyin with tone marks ||| natural Indonesian meaning. Put no Latin brand name, Indonesian, English, or pinyin in the Chinese field; replace a Latin brand with its natural generic Chinese equivalent in audio metadata. Do not add an audio block when no Chinese should be taught.',
  'The [[AUDIO]] block is metadata and is hidden from the learner. Do not mention it in the answer.',
].join('\n');

export type NativeCoachTurn = { role: 'user' | 'assistant'; text: string };

export type NativeCoachUsage = {
  token_input: number;
  token_output: number;
  model_calls: 1;
  estimated_ai_cost: number;
  model_used: string;
};

const AUDIO_BLOCK = /\[\[\s*AUDIO\s*\]\]([\s\S]*?)(?:\[\[\s*\/\s*AUDIO\s*\]\]|$)/iu;

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

export function parseNativeCoachAnswer(raw: string) {
  const block = raw.match(AUDIO_BLOCK);
  const answer = raw
    .replace(AUDIO_BLOCK, '')
    .replace(/\[\[\s*\/?\s*AUDIO\s*\]\]/giu, '')
    .trim();
  const lines = block?.[1]?.split(/\r?\n/gu).map((line) => line.trim()).filter(Boolean) ?? [];
  // Unmarked text is never made TTS-eligible. Invalid pinyin/meaning rows fail closed.
  const spokenChinese = parseAudioList(lines)
    .filter((item): item is NativeChineseSentence => Boolean(item.pinyin && item.indonesian))
    .slice(0, 3);
  return { answer, spokenChinese };
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
      const [raw, usage, finishReason, finalStep] = await Promise.all([
        result.text,
        result.usage,
        result.finishReason,
        result.finalStep,
      ]);
      const parsed = parseNativeCoachAnswer(raw);
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
        ...parsed,
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
