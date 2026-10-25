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

export type NaturalLearnerAct = 'QUESTION' | 'REQUEST' | 'ATTEMPT' | 'PRACTICE' | 'CONFUSION' | 'SESSION_END';
export type NaturalTeachingStrategy = 'DIRECT_ANSWER' | 'EXPLAIN' | 'MODEL' | 'CONTRAST' | 'SCAFFOLD' | 'ROLEPLAY' | 'RECALL' | 'REVIEW';

export type NaturalConversationAnswer = FreeTeachingAnswer & {
  learnerAct: NaturalLearnerAct;
  teachingStrategy: NaturalTeachingStrategy;
  corrections: Array<{ issue: string; explanation: string; modelChinese: string }>;
  task: null | { type: 'ANSWER' | 'TRANSLATE' | 'ROLEPLAY' | 'RECALL' | 'REFORMULATE'; prompt: string };
  learningEvidence: {
    weakExpressions: Array<{ expression: string; evidence: string }>;
    independentUses: Array<{ expression: string; learnerEvidence: string }>;
  };
  sessionWrapUp: null | {
    recap: string;
    weakFocus: string[];
    recallExercises: string[];
  };
};

export type NaturalConversationState = {
  consecutiveFailures: number;
  lastTeachingStrategy: NaturalTeachingStrategy | '';
  sameTaskRepeatCount: number;
  lastTaskPrompt: string;
  weakExpressions: string[];
  independentUses: string[];
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

const naturalAnswerSchema = jsonSchema<NaturalConversationAnswer>({
  type: 'object',
  additionalProperties: false,
  required: [
    'responseMode', 'answer', 'spokenChinese', 'followUp', 'assessment', 'difficulty', 'contextSummary', 'courseReferenceUsed',
    'learnerAct', 'teachingStrategy', 'corrections', 'task', 'learningEvidence', 'sessionWrapUp',
  ],
  properties: {
    ...answerSchema.jsonSchema.properties,
    learnerAct: { type: 'string', enum: ['QUESTION', 'REQUEST', 'ATTEMPT', 'PRACTICE', 'CONFUSION', 'SESSION_END'] },
    teachingStrategy: { type: 'string', enum: ['DIRECT_ANSWER', 'EXPLAIN', 'MODEL', 'CONTRAST', 'SCAFFOLD', 'ROLEPLAY', 'RECALL', 'REVIEW'] },
    corrections: {
      type: 'array', maxItems: 2,
      items: {
        type: 'object', additionalProperties: false, required: ['issue', 'explanation', 'modelChinese'],
        properties: {
          issue: { type: 'string', minLength: 1, maxLength: 180 },
          explanation: { type: 'string', minLength: 1, maxLength: 320 },
          modelChinese: { type: 'string', maxLength: 120 },
        },
      },
    },
    task: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object', additionalProperties: false, required: ['type', 'prompt'],
          properties: {
            type: { type: 'string', enum: ['ANSWER', 'TRANSLATE', 'ROLEPLAY', 'RECALL', 'REFORMULATE'] },
            prompt: { type: 'string', minLength: 1, maxLength: 360 },
          },
        },
      ],
    },
    learningEvidence: {
      type: 'object', additionalProperties: false, required: ['weakExpressions', 'independentUses'],
      properties: {
        weakExpressions: {
          type: 'array', maxItems: 2,
          items: {
            type: 'object', additionalProperties: false, required: ['expression', 'evidence'],
            properties: { expression: { type: 'string', maxLength: 80 }, evidence: { type: 'string', maxLength: 240 } },
          },
        },
        independentUses: {
          type: 'array', maxItems: 2,
          items: {
            type: 'object', additionalProperties: false, required: ['expression', 'learnerEvidence'],
            properties: { expression: { type: 'string', maxLength: 80 }, learnerEvidence: { type: 'string', maxLength: 240 } },
          },
        },
      },
    },
    sessionWrapUp: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object', additionalProperties: false, required: ['recap', 'weakFocus', 'recallExercises'],
          properties: {
            recap: { type: 'string', minLength: 1, maxLength: 500 },
            weakFocus: { type: 'array', maxItems: 5, items: { type: 'string', maxLength: 100 } },
            recallExercises: { type: 'array', minItems: 3, maxItems: 5, items: { type: 'string', maxLength: 240 } },
          },
        },
      ],
    },
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

const BASE_SYSTEM = [
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

const NATURAL_CONVERSATION_SKILL_V1 = [
  BASE_SYSTEM,
  'Apply Natural Conversation Skill V1 as teaching behavior, not as a second agent or course system.',
  'First classify the learner’s real act: QUESTION, REQUEST, ATTEMPT, PRACTICE, CONFUSION, or SESSION_END. PRACTICE means explicit repetition or shadowing of an answer just supplied. Correct or score only an actual independent ATTEMPT. For every other act, assessment must be NOT_ASSESSED, corrections must be empty, and independentUses must be empty.',
  'Correct at most one or two errors that most affect meaning or naturalness. Do not list every imperfection. Keep Indonesian explanations natural, conversational, and brief.',
  'Give at most one explicit learning task per turn, represented only in task. followUp may invite the learner to continue but must not add another exercise.',
  'Never demand the same sentence mechanically more than twice. When consecutiveFailures is 2 or more, change teachingStrategy from lastTeachingStrategy and reduce difficulty by changing the explanation, hint, contrast, or situation. Do not repeat the same prompt.',
  'If the learner requests a new situation, switch in this turn. Their latest request overrides unfinished practice.',
  'Record a weak expression only from an actual failed attempt. Record independent use only when the learner produced the expression without being given the exact answer in the immediately preceding task. Repetition or shadowing is practice, never mastery evidence.',
  'After a genuinely CORRECT independent attempt, give one short transfer task in a different situation so understanding is checked beyond repetition.',
  'When learnerAct is SESSION_END, set sessionWrapUp with a short targeted recap and 3 to 5 recall exercises. Otherwise sessionWrapUp must be null.',
  'Mixed-language input is quoted evidence: every Chinese fragment inside an Indonesian message must be treated as a verbatim quotation. Quote it exactly as the learner wrote it — never merge, reorder, complete, or "fix" it into a different sentence — then give its pinyin and meaning. If the fragment is reported speech (e.g. the learner says the boss "bilang" something), the explanation must keep it as reported speech instead of restating it as a plain description. If the learner asks how to respond ("saya jawab apa"), also give one short natural Chinese reply with pinyin and its meaning.',
  'When the learner asks for a harder question (e.g. "kasih soal yang lebih sulit"), compare with the previous task in coachingState.lastTaskPrompt: the new task must use a different target sentence and be measurably harder (longer utterance, new structure, or two-step production), and answer must state briefly what makes it harder. Presenting the same or an easier sentence as "more difficult" is forbidden.',
  'This is text-first. Never claim acoustic pronunciation scoring, end-of-speech detection, automatic waiting, or real-time duplex voice. A transcript alone can support meaning feedback but never acoustic pronunciation claims.',
  'Use coachingState only as recent session evidence. It is not permanent memory and does not prove mastery.',
  'Return the exact structured object.',
].join(' ');

function normalizeNaturalAnswer(answer: NaturalConversationAnswer, input: { message: string; immediatePreviousAssistantTurn: string }) {
  const transcriptOnlyPronunciationRequest = /(?:stt|transkrip|transkripsi|transcript)/i.test(input.message)
    && /(?:nada|pengucapan|pronunciation|lafal|发音)/i.test(input.message);
  // R1-29 fix: a session-end/summary request must take priority over the follow-read heuristic.
  // "yang perlu saya ulang" contains "ulang" but is a wrap-up request, not repetition practice.
  const sessionEndRequest = /(?:sudah\s+selesai|saya\s+(?:sudah\s+)?selesai|selesai\s+(?:ya|dah|dulu)|akhiri(?:\s+sesi|\s+belajar)?|berhenti\s+(?:dulu|sini)|buat(?:kan)?\s+(?:saya\s+)?ringkasan|rangkum(?:kan)?|ringkas(?:an)?\s+(?:sesi|belajar)|总结|結束課程|下课)/i.test(input.message)
    && !/belum\s+selesai/i.test(input.message);
  const explicitRepetition = /(?:跟读|照着|ikut(?:i)?|mengikuti|ulang)/i.test(input.message)
    || (/[㐀-鿿]/.test(input.message) && input.immediatePreviousAssistantTurn.includes(input.message.replace(/^[^：:]*[：:]\s*/, '').trim()));
  if (transcriptOnlyPronunciationRequest) {
    return {
      ...answer,
      learnerAct: 'QUESTION' as const,
      answer: 'Saya tidak bisa menilai pengucapan atau nada hanya dari transkrip teks. Teks hanya dapat dipakai untuk memeriksa susunan kata dan arti; penilaian bunyi memerlukan rekaman audio yang benar-benar dianalisis.',
      spokenChinese: [],
      followUp: '',
      corrections: [],
      task: null,
      assessment: { status: 'NOT_ASSESSED' as const, evidence: '' },
      learningEvidence: { weakExpressions: [], independentUses: [] },
      sessionWrapUp: null,
    };
  }
  if (explicitRepetition && !sessionEndRequest) {
    return {
      ...answer,
      learnerAct: 'PRACTICE' as const,
      answer: 'Ini masih latihan mengikuti contoh, jadi saya belum menilai penguasaan atau pengucapanmu dari teks ini.',
      corrections: [],
      task: { type: 'REFORMULATE' as const, prompt: 'Sekarang, tanpa melihat contoh, gunakan ungkapan itu dalam situasi lain yang kamu pilih.' },
      assessment: { status: 'NOT_ASSESSED' as const, evidence: '' },
      learningEvidence: { weakExpressions: [], independentUses: [] },
    };
  }
  if (answer.learnerAct !== 'ATTEMPT') {
    return {
      ...answer,
      corrections: [],
      assessment: { status: 'NOT_ASSESSED' as const, evidence: '' },
      learningEvidence: { ...answer.learningEvidence, independentUses: [] },
    };
  }
  const correctedAnswer = answer.assessment.status === 'NEEDS_WORK'
    ? answer.answer.replace(/^(?:Bagus sekali|Benar sekali|Tepat sekali)[!,.\s]*/i, '')
    : answer.answer;
  return {
    ...answer,
    answer: correctedAnswer,
    corrections: answer.corrections.slice(0, 2),
    task: answer.assessment.status === 'CORRECT' && !answer.task
      ? { type: 'REFORMULATE' as const, prompt: 'Sekarang gunakan ungkapan itu dalam situasi berbeda tanpa melihat contoh.' }
      : answer.task,
  };
}

// R1-05 fix: detect a repeated target so a "harder question" request cannot be answered
// with (a variant of) the previous task. Comparison runs on normalized text across the
// task prompt and every taught Chinese sentence.
function normalizeTaskText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function sameTaskTarget(previousTaskPrompt: string, answer: NaturalConversationAnswer) {
  const previous = normalizeTaskText(previousTaskPrompt);
  if (previous.length < 4) return false;
  const candidates = [answer.task?.prompt || '', ...answer.spokenChinese.map((item) => item.text)].map(normalizeTaskText).filter(Boolean);
  return candidates.some((text) => text === previous
    || (text.length > 6 && previous.includes(text))
    || (previous.length > 6 && text.includes(previous)));
}

export async function answerFreeTeaching(input: {
  message: string;
  sessionId: string;
  recentTurns: Array<{ role: 'user' | 'assistant'; text: string }>;
  contextSummary: string;
  modelTier?: 'FAST' | 'SMART';
  skillVersion?: 'BASELINE' | 'NATURAL_V1';
  coachingState?: NaturalConversationState;
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
    ...(input.skillVersion === 'NATURAL_V1' ? { coachingState: input.coachingState } : {}),
  });
  const natural = input.skillVersion === 'NATURAL_V1';
  const normalizeInput = { message: input.message, immediatePreviousAssistantTurn };
  // R1-05 fix: explicit harder-question request enables the repeated-target comparison below.
  const harderRequest = natural && /(?:lebih\s+(?:sulit|susah|menantang)|soal\s+yang\s+lebih|harder|更难)/i.test(input.message);
  const generate = (repair?: string, promptOverride?: string) => generateText({
    model: gateway(model),
    output: natural
      ? Output.object({ schema: naturalAnswerSchema, name: 'indobrain_natural_conversation_answer' })
      : Output.object({ schema: answerSchema, name: 'indobrain_free_teacher_answer' }),
    maxOutputTokens: natural ? 1500 : 1100,
    temperature: natural ? 0.15 : 0.25,
    maxRetries: 0,
    providerOptions: {
      gateway: {
        tags: ['indobrain', natural ? 'natural-conversation-skill-v1' : 'ai-free-teaching-v1', repair ? 'repair' : 'conversation'],
        user: input.sessionId.slice(0, 96),
      },
    },
    system: repair
      ? `${natural ? NATURAL_CONVERSATION_SKILL_V1 : BASE_SYSTEM} This is one controlled repair. Convert the malformed candidate into the exact schema without adding facts.`
      : natural ? NATURAL_CONVERSATION_SKILL_V1 : BASE_SYSTEM,
    prompt: promptOverride || (repair ? JSON.stringify({ originalRequest: JSON.parse(prompt), malformedCandidate: repair.slice(0, 2200) }) : prompt),
  });

  try {
    const result = await generate();
    if (!natural) return { answer: result.output as FreeTeachingAnswer, usage: usageOf(result, model) };
    let answer = normalizeNaturalAnswer(result.output as NaturalConversationAnswer, normalizeInput);
    let usage = usageOf(result, model);
    // R1-05 fix: if a harder-question request still produced the previous task, make one
    // controlled retry that names the repeated task and demands a measurably harder one.
    if (harderRequest && answer.task && input.coachingState?.lastTaskPrompt
      && sameTaskTarget(input.coachingState.lastTaskPrompt, answer)) {
      const retryResult = await generate(undefined, JSON.stringify({
        ...JSON.parse(prompt),
        previousRepeatedTask: answer.task,
        correctionInstruction: 'The learner asked for a harder question, but the produced task repeats the previous task shown in previousRepeatedTask. Give ONE measurably harder task with a different target sentence (longer, new structure, or two-step production), and briefly state in answer what makes it harder.',
      }));
      usage = mergeUsage(usage, usageOf(retryResult, model));
      usage.structured_retries += 1;
      const retryAnswer = normalizeNaturalAnswer(retryResult.output as NaturalConversationAnswer, normalizeInput);
      if (!(retryAnswer.task && sameTaskTarget(input.coachingState.lastTaskPrompt, retryAnswer))) {
        answer = retryAnswer;
      }
    }
    return { answer, usage };
  } catch (error) {
    const firstUsage = failedUsage(error, model);
    const malformed = NoObjectGeneratedError.isInstance(error) ? error.text || '' : '';
    const repaired = await generate(malformed);
    const repairUsage = usageOf(repaired, model);
    repairUsage.structured_retries = 1;
    return { answer: normalizeNaturalAnswer(repaired.output as NaturalConversationAnswer, normalizeInput), usage: mergeUsage(firstUsage, repairUsage) };
  }
}

