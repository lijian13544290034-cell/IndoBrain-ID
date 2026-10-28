import 'server-only';

import { gateway, generateText, Output } from 'ai';
import { z } from 'zod';
import { isValidatedSpokenChinese } from '@/lib/mandarin-coach-speech';
import type { NativeCoachBreakdown } from '@/lib/server/mandarin-native-coach-v1';

const BREAKDOWN_MODEL = process.env.NATIVE_COACH_MODEL || 'google/gemini-2.5-flash';
const PURE_CHINESE = /^[\u3400-\u9FFF\u3000-\u303F，。！？、；：“”‘’（）…·\s—–-]+$/u;
const HAS_TONE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň]/u;
const VALID_PINYIN = /^[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň\s'’,.?!-]+$/u;

const wordSchema = z.object({
  text: z.string().min(1).max(30).regex(PURE_CHINESE),
  pinyin: z.string().min(1).max(80).regex(VALID_PINYIN),
  indonesian: z.string().min(1).max(160),
});

const breakdownSchema = z.object({
  sentence: z.string().min(1).max(120).regex(PURE_CHINESE),
  pinyin: z.string().min(1).max(180).regex(HAS_TONE),
  indonesian: z.string().min(1).max(240),
  words: z.array(wordSchema).min(1).max(12),
});

function fallbackCost(inputTokens: number, outputTokens: number) {
  return inputTokens * 0.30 / 1_000_000 + outputTokens * 2.50 / 1_000_000;
}

function providerCost(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return 0;
  const gatewayMetadata = (metadata as Record<string, unknown>).gateway;
  if (!gatewayMetadata || typeof gatewayMetadata !== 'object') return 0;
  const value = (gatewayMetadata as Record<string, unknown>).cost;
  const cost = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(cost) ? cost : 0;
}

function normalizeChinese(value: string) {
  return value.replace(/[\s，。！？、；：“”‘’（）…·—–-]/gu, '');
}

/** A separate model call is made only after the learner explicitly requests 拆词. */
export async function createMandarinWordBreakdown(input: {
  text: string;
  context?: string;
  sessionId: string;
}) {
  const startedAt = Date.now();
  const text = input.text.trim();
  if (!isValidatedSpokenChinese(text)) throw new Error('INVALID_CHINESE_TARGET');

  const result = await generateText({
    model: gateway(BREAKDOWN_MODEL),
    system: [
      'Analyze the exact Simplified Chinese expression selected by an Indonesian beginner.',
      'Return natural word segmentation, not mechanical character-by-character splitting.',
      'Keep personal names, place names, fixed expressions, separable words, and meaningful multi-character words together.',
      'Use the reading that fits the supplied sentence context, especially for polyphonic characters.',
      'Give standard Hanyu Pinyin with tone marks and short natural Bahasa Indonesia meanings.',
      'Do not invent words that are absent from the selected Chinese expression.',
    ].join('\n'),
    prompt: `Selected Chinese: ${text}\nVisible conversation context: ${(input.context || 'none').slice(0, 800)}`,
    output: Output.object({ schema: breakdownSchema, name: 'mandarin_word_breakdown' }),
    maxOutputTokens: 700,
    temperature: 0.1,
    reasoning: 'none',
    maxRetries: 1,
    providerOptions: {
      gateway: {
        tags: ['indobrain', 'native-coach-v1', 'on-demand-breakdown'],
        user: input.sessionId.slice(0, 96),
      },
    },
  });

  const output = result.output as NativeCoachBreakdown;
  const original = normalizeChinese(text);
  const returned = normalizeChinese(output.sentence);
  const segmented = normalizeChinese(output.words.map((word) => word.text).join(''));
  if (returned !== original || segmented !== original) throw new Error('BREAKDOWN_MISMATCH');
  if (!isValidatedSpokenChinese(output.sentence) || output.words.some((word) => !isValidatedSpokenChinese(word.text))) {
    throw new Error('INVALID_BREAKDOWN_SPEECH');
  }

  const tokenInput = result.usage.inputTokens || 0;
  const tokenOutput = result.usage.outputTokens || 0;
  return {
    breakdown: output,
    usage: {
      token_input: tokenInput,
      token_output: tokenOutput,
      model_calls: 1,
      estimated_ai_cost: providerCost(result.providerMetadata) || fallbackCost(tokenInput, tokenOutput),
      model_used: result.response.modelId || BREAKDOWN_MODEL,
    },
    latencyMs: Date.now() - startedAt,
  };
}

