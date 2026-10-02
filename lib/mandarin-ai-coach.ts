export const AI_COACH_COURSE_ID = 'mandarin-ai-coach-day1';

export const DAY_ONE_EXPRESSIONS = [
  { id: 'AI-D1-01', chinese: '你好', pinyin: 'Nǐ hǎo', indonesian: 'Halo', chunks: [{ chinese: '你', pinyin: 'nǐ' }, { chinese: '好', pinyin: 'hǎo' }] },
  { id: 'AI-D1-02', chinese: '谢谢', pinyin: 'Xiè xie', indonesian: 'Terima kasih', chunks: [{ chinese: '谢', pinyin: 'xiè' }, { chinese: '谢', pinyin: 'xie' }] },
  { id: 'AI-D1-03', chinese: '好的', pinyin: 'Hǎo de', indonesian: 'Baik / Oke', chunks: [{ chinese: '好', pinyin: 'hǎo' }, { chinese: '的', pinyin: 'de' }] },
] as const;

export type ExpressionId = (typeof DAY_ONE_EXPRESSIONS)[number]['id'];
export type CoachSkill = 'TEACH' | 'PRONUNCIATION' | 'COMPREHENSION' | 'ROLEPLAY' | 'MEMORY';
export type CoachVerdict = 'PASS' | 'RETRY' | 'BREAKDOWN';
export type CoachEventName =
  | 'start_session' | 'finish_session' | 'expression_started' | 'expression_pass'
  | 'expression_retry' | 'expression_failed' | 'audio_play' | 'voice_attempt'
  | 'comprehension_correct' | 'comprehension_wrong' | 'roleplay_started' | 'roleplay_completed';

export type ExpressionMemory = {
  expression_id: ExpressionId;
  chinese: string;
  pinyin: string;
  indonesian: string;
  attempts: number;
  correct_count: number;
  wrong_count: number;
  pronunciation_status: 'NOT_STARTED' | CoachVerdict;
  comprehension_status: 'NOT_STARTED' | 'PASS' | 'RETRY';
  last_seen: string | null;
  mastery_level: 0 | 1 | 2 | 3 | 4;
};

export type CoachUsage = {
  token_input: number;
  token_output: number;
  stt_seconds: number;
  tts_calls: number;
  model_calls: number;
  estimated_ai_cost: number;
};

export type CoachProfile = {
  version: 1;
  course: typeof AI_COACH_COURSE_ID;
  sessionId: string;
  startedAt: string;
  updatedAt: string;
  expressions: ExpressionMemory[];
  usage: CoachUsage;
  completed: boolean;
};

export const FEEDBACK_COPY = {
  pronunciation_pass: 'Bagus! Pengucapanmu sudah bisa dipahami.',
  pronunciation_retry: 'Hampir benar. Dengarkan sekali lagi, lalu coba ulangi dengan santai.',
  pronunciation_breakdown: 'Kita pecah menjadi bagian kecil. Ucapkan setiap bagian secara perlahan.',
  comprehension_pass: 'Benar. Kamu sudah memahami artinya.',
  comprehension_retry: 'Belum tepat. Dengarkan dan lihat artinya sekali lagi.',
  roleplay_pass: 'Mantap! Jawabanmu cocok untuk situasi kerja ini.',
  roleplay_retry: 'Coba lagi dengan salah satu ungkapan yang baru dipelajari.',
} as const;

export type FeedbackId = keyof typeof FEEDBACK_COPY;

export function emptyCoachProfile(): CoachProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    course: AI_COACH_COURSE_ID,
    sessionId: `coach-${crypto.randomUUID()}`,
    startedAt: now,
    updatedAt: now,
    expressions: DAY_ONE_EXPRESSIONS.map((item) => ({
      expression_id: item.id,
      chinese: item.chinese,
      pinyin: item.pinyin,
      indonesian: item.indonesian,
      attempts: 0,
      correct_count: 0,
      wrong_count: 0,
      pronunciation_status: 'NOT_STARTED',
      comprehension_status: 'NOT_STARTED',
      last_seen: null,
      mastery_level: 0,
    })),
    usage: { token_input: 0, token_output: 0, stt_seconds: 0, tts_calls: 0, model_calls: 0, estimated_ai_cost: 0 },
    completed: false,
  };
}

export function isExpressionId(value: unknown): value is ExpressionId {
  return typeof value === 'string' && DAY_ONE_EXPRESSIONS.some((item) => item.id === value);
}

export function getExpression(id: ExpressionId) {
  return DAY_ONE_EXPRESSIONS.find((item) => item.id === id)!;
}
