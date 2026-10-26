import 'server-only';

import { gateway, generateText } from 'ai';

const SMART_MODEL = process.env.SMART_MODEL || 'google/gemini-2.5-flash';

/**
 * Free Model Native V2 — 极简通道。
 * 不做意图分类、不注入教学 Skill、不强制结构化 JSON。
 * 唯一附加能力：从自由文本里抽出可朗读的完整中文句子，供现有 /api/chinese-tts 播放。
 */
const NATIVE_SYSTEM = [
  'You are a helpful, friendly AI Mandarin tutor for Indonesian learners. Understand and respond to the learner\'s actual request naturally. Use Indonesian for explanations and Chinese when useful. You may teach, chat, plan lessons, correct mistakes, or roleplay according to the conversation. Do not force a fixed curriculum or exercise. Follow the learner\'s goals and context.',
  // 以下四条属于语言方向 / 系统权限 / 可播放性要求，不构成教学编排，也不限制回答正文的写法。
  'Reply in plain, natural Indonesian, quoting Simplified Mandarin wherever it helps. Never output JSON, and never use a fixed lesson or exercise template.',
  'If the learner asks for a plan or lessons for a job (e.g. working in a Chinese restaurant or factory), answer with a short plan and ask what their exact role or situation is. Do not open with greeting drills such as 你好 or 欢迎光临 unless they asked for greetings.',
  'Whenever you explain or plan something practical, include at least one concrete Mandarin sentence the learner can actually use, with its pinyin and meaning.',
  'Never claim to hear or score the learner\'s pronunciation: you only receive text.',
  'MANDATORY AUDIO LIST — your reply must end with this list, and every Chinese sentence that appears anywhere in your reply must also appear here exactly once, with all three parts filled:',
  '[[AUDIO]]',
  '老板，我明天想请假。 ||| Lǎobǎn, wǒ míngtiān xiǎng qǐngjià. ||| Bos, saya mau minta izin besok.',
  '请问您想点什么？ ||| Qǐngwèn nín xiǎng diǎn shénme? ||| Permisi, Anda mau pesan apa?',
  '[[/AUDIO]]',
  'List rules: Simplified Chinese sentence ||| standard Hanyu Pinyin with tone marks on every syllable that has one (never tone numbers, never toneless pinyin) ||| natural Bahasa Indonesia meaning. The three parts must describe the same sentence. Use exactly the ||| separator, one sentence per line, max 8 lines. If your reply contains no Chinese at all, still write the [[AUDIO]] and [[/AUDIO]] tags with nothing between them.',
].join('\n');

export type NativeChineseSentence = { text: string; pinyin: string; indonesian: string };

export type NativeChatUsage = {
  token_input: number;
  token_output: number;
  model_calls: number;
  estimated_ai_cost: number;
  model_used: string;
};

const han = /[\u3400-\u9FFF]/;
const latin = /[A-Za-z\u00C0-\u024F]/;

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

function hanCount(text: string) {
  return (text.match(/[\u3400-\u9FFF]/g) || []).length;
}

const TONE_MARKS = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň]/gu;
const PINYIN_CHARS = /^[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň\s'’,.\-]+$/u;

/**
 * 校验「拼音 ↔ 中文」对应关系（启发式，不引入词典依赖）：
 * - 必须是带声调符号的 Hanyu Pinyin，不接受数字声调 / 无声调拼音
 * - 只允许拼音字母、ü、声调符号与分隔符，避免把印尼语混进朗读
 * - 声调符号数量应接近汉字数（轻声无符号，允许少量偏差）
 */
function normalizePinyin(raw: string, chinese: string) {
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  // 数字声调不是 Hanyu Pinyin 的展示标准 → 直接判定无效
  if (/[0-9]/u.test(trimmed)) return '';
  // 去掉句末感叹号、问号、引号等标点后再校验（模型常写成 "Nín hǎo!"）
  const pinyin = trimmed
    .replace(/[^a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň\s'\-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!pinyin || !PINYIN_CHARS.test(pinyin)) return '';
  const marks = pinyin.match(TONE_MARKS)?.length || 0;
  if (marks === 0) return '';
  const hans = hanCount(chinese);
  if (marks < hans - 2 || marks > hans + 1) return '';
  return pinyin;
}

/** 从自由回答里摘出音频清单：[[AUDIO]] 块 + 正文里的三元组行；正文保留模型原话（只剔除清单行）。 */
function splitAudioList(answer: string) {
  const blockPattern = /\[\[\s*AUDIO\s*\]\]([\s\S]*?)(?:\[\[\s*\/\s*AUDIO\s*\]\]|$)/i;
  const stripTags = (value: string) => value.replace(/\[\[\s*\/?\s*AUDIO\s*\]\]/gi, '').trim();
  const hasSeparator = /(?:\|\|\||｜｜｜)/u;
  const blockMatch = answer.match(blockPattern);
  const blockLines = blockMatch ? blockMatch[1].split(/\r?\n/u) : [];
  const outside = blockMatch ? answer.replace(blockPattern, '') : answer;
  // 正文里手写的三元组同样视为清单行，并从展示正文中剔除（中文由四层卡片承载）。
  const outsideLines = outside.split(/\r?\n/u);
  const inlineLines = outsideLines.filter((line) => hasSeparator.test(line));
  // 正文里若有手写三元组，只保留中文句本身，避免拼音/语义串进正文，也避免句子被整段删掉。
  const body = stripTags(outsideLines
    .map((line) => (hasSeparator.test(line) ? line.split(/\s*(?:\|\|\||｜｜｜)\s*/u)[0] : line))
    .join('\n'));
  const lines = [...inlineLines, ...blockLines].map((line) => line.trim()).filter(Boolean);
  // 用于判断某句是否属于本轮回答（防止模型把上一轮的句子照抄进清单）。
  return { body, lines, rawForMatch: stripTags(outside) };
}

export function parseAudioList(lines: string[]): NativeChineseSentence[] {
  const out: NativeChineseSentence[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const parts = line.split(/\s*(?:\|\|\||｜｜｜|\|\|)\s*/u);
    if (parts.length < 2) continue;
    const chinese = parts[0].replace(/^[\s\u3000]+|[\s\u3000]+$/gu, '').replace(/^[|｜]+|[|｜]+$/gu, '').trim();
    if (!chinese || latin.test(chinese) || hanCount(chinese) < 1 || [...chinese].length > 120) continue;
    if (seen.has(chinese)) continue;
    seen.add(chinese);
    out.push({
      text: chinese,
      pinyin: normalizePinyin((parts[1] || '').replace(/^[|｜]+|[|｜]+$/gu, ''), chinese),
      indonesian: (parts[2] || '').replace(/^[|｜]+|[|｜]+$/gu, '').replace(/\s+/g, ' ').trim().slice(0, 200),
    });
    if (out.length >= 8) break;
  }
  return out;
}

/** 把过长的中文串按标点切成 <= 110 字的片段。 */
function chunkLongSentence(sentence: string) {
  if ([...sentence].length <= 110) return [sentence];
  const pieces = sentence.split(/(?<=[，、；：,;:])/u).map((piece) => piece.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';
  for (const piece of pieces) {
    if ([...`${buffer}${piece}`].length > 110) {
      if (buffer) chunks.push(buffer);
      buffer = piece;
    } else {
      buffer += piece;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

/**
 * 从模型自由文本中提取可直接送 TTS 的中文句。
 * - 只保留含汉字的片段；拼音 / 印尼语 / 英文因为含拉丁字母被排除
 * - 中印混排行（如 "Katakan: 老板，我明天请假。"）只取中文部分
 * - 不调用第二次模型；不改变模型原回答
 */
export function extractChineseSentences(answer: string, options?: { max?: number }): NativeChineseSentence[] {
  const max = options?.max ?? 8;
  const cleaned = answer
    .replace(/\r/g, '')
    .replace(/[*_`#>]/g, ' ')
    .replace(/[\u201C\u201D]/g, '"');
  const out: string[] = [];
  const seen = new Set<string>();

  for (const rawPart of cleaned.split(/(?<=[。！？!?\n])/u)) {
    for (const run of rawPart.match(/[\u3400-\u9FFF][\u3400-\u9FFF0-9\u3000-\u303F\s]*/g) ?? []) {
      let sentence = run.replace(/^[\s\u3000]+/u, '').replace(/[\s\u3000]+$/u, '');
      // 去掉句尾的逗号/顿号等非终止标点，保留 。！？
      sentence = sentence.replace(/[，、；：,;:]+$/u, '').trim();
      if (hanCount(sentence) < 2 || latin.test(sentence)) continue;
      for (const chunk of chunkLongSentence(sentence)) {
        const text = chunk.replace(/^[\s\u3000]+|[\s\u3000]+$/gu, '');
        if (hanCount(text) < 2 || latin.test(text) || [...text].length > 120 || seen.has(text)) continue;
        seen.add(text);
        out.push(text);
        if (out.length >= max) return out.map((sentence) => ({ text: sentence, pinyin: '', indonesian: '' }));
      }
    }
  }
  return out.map((sentence) => ({ text: sentence, pinyin: '', indonesian: '' }));
}

export async function answerNativeChat(input: {
  message: string;
  sessionId: string;
  recentTurns: Array<{ role: 'user' | 'assistant'; text: string }>;
  modelTier?: 'FAST' | 'SMART';
}) {
  const model = input.modelTier === 'FAST' ? (process.env.FAST_MODEL || 'google/gemini-2.5-flash-lite') : SMART_MODEL;

  // 客户端会把当前这句也放进 recentTurns，这里去掉避免重复入参。
  const history = input.recentTurns.slice(-10).map((turn) => ({ role: turn.role, content: turn.text.slice(0, 1200) }));
  const last = history.at(-1);
  if (last && last.role === 'user' && last.content.trim() === input.message.trim()) history.pop();

  const result = await generateText({
    model: gateway(model),
    system: NATIVE_SYSTEM,
    messages: [
      ...history,
      // 提示词尾部再强调一次清单要求：模型在长对话中容易漏掉，这行只约束格式，不约束回答内容。
      { role: 'user' as const, content: `${input.message.slice(0, 500)}\n\n[Format reminder: answer naturally in Indonesian, then always end with the [[AUDIO]] list — one line per Chinese sentence, Chinese ||| pinyin with tone marks ||| Indonesian meaning.]` },
    ],
    maxOutputTokens: 2200,
    temperature: 0.6,
    maxRetries: 0,
    providerOptions: {
      gateway: {
        tags: ['indobrain', 'free-model-native-v2'],
        user: input.sessionId.slice(0, 96),
      },
    },
  });

  const tokenInput = result.usage.inputTokens || 0;
  const tokenOutput = result.usage.outputTokens || 0;
  const usage: NativeChatUsage = {
    token_input: tokenInput,
    token_output: tokenOutput,
    model_calls: 1,
    estimated_ai_cost: providerCost(result.providerMetadata) || fallbackCost(model, tokenInput, tokenOutput),
    model_used: model,
  };

  const { body, lines, rawForMatch } = splitAudioList(result.text);
  const parsed = parseAudioList(lines);
  // 只保留本轮真正出现过的中文句，避免模型把上一轮句子照抄进清单。
  const current = parsed.filter((item) => rawForMatch.includes(item.text.replace(/[。！？，、；：\s]+$/u, '')));
  const spokenChinese = current.length ? current : (parsed.length ? parsed : extractChineseSentences(body));

  return {
    answer: body,
    spokenChinese,
    usage,
    audioListFound: spokenChinese.some((item) => item.pinyin && item.indonesian),
    // 输出被 token 上限截断时，语音清单可能不完整 —— 显式上报，便于测试与日志发现。
    truncated: result.finishReason === 'length',
  };
}
