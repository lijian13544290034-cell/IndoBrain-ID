import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';

export const AI_COACH_COURSE_ID = 'mandarin-ai-coach-day1';

export const DAY_ONE_EXPRESSIONS = [
  { id: 'AI-D1-01', chinese: '你好', pinyin: 'Nǐ hǎo', indonesian: 'Halo', chunks: [{ chinese: '你', pinyin: 'nǐ' }, { chinese: '好', pinyin: 'hǎo' }] },
  { id: 'AI-D1-02', chinese: '谢谢', pinyin: 'Xiè xie', indonesian: 'Terima kasih', chunks: [{ chinese: '谢', pinyin: 'xiè' }, { chinese: '谢', pinyin: 'xie' }] },
  { id: 'AI-D1-03', chinese: '好的', pinyin: 'Hǎo de', indonesian: 'Baik / Oke', chunks: [{ chinese: '好', pinyin: 'hǎo' }, { chinese: '的', pinyin: 'de' }] },
] as const;

export type ExpressionId = string;
export type CoachSkill = 'TEACH' | 'PRONUNCIATION' | 'COMPREHENSION' | 'ROLEPLAY' | 'MEMORY';
export type CoachVerdict = 'PASS' | 'RETRY' | 'BREAKDOWN';
export type CoachConversationMode = 'GUIDED_TRAINING' | 'COACH_CONVERSATION';
export type CoachBrainSkillId = 'VOCABULARY' | 'PRONUNCIATION' | 'MEANING' | 'CORRECTION' | 'EXAMPLE' | 'CONVERSATION' | 'WORKPLACE' | 'REVIEW';
export type CoachCapabilityId =
  | 'LANGUAGE_ROUTER'
  | 'TRANSLATION_EXPLANATION'
  | 'CHINESE_TEACHER'
  | 'CORRECTION'
  | 'ROLE_PLAY'
  | 'PRONUNCIATION_SPEAKING'
  | 'DIFFICULTY_CONTROL'
  | 'LEARNING_MEMORY';
export type CoachIntent = CoachBrainSkillId | 'ROLEPLAY' | 'GRAMMAR' | 'OFF_TOPIC';
export type CoachDetectedLanguage = 'INDONESIAN' | 'CHINESE' | 'MIXED';
export type CoachEventName =
  | 'start_session' | 'finish_session' | 'expression_started' | 'expression_pass'
  | 'expression_retry' | 'expression_failed' | 'audio_play' | 'voice_attempt'
  | 'comprehension_correct' | 'comprehension_wrong' | 'roleplay_started' | 'roleplay_completed'
  | 'coach_conversation_opened' | 'coach_question_submitted' | 'coach_answer_received'
  | 'coach_answer_helpful' | 'coach_answer_unresolved' | 'expression_saved_for_review'
  | 'coach_slow_audio_requested' | 'coach_skill_gap' | 'coach_response_audio_play';

export type CoachConversationTurn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  chinese?: string;
  pinyin?: string;
  indonesian?: string;
  intent?: CoachIntent;
  intents?: CoachIntent[];
  skillIds?: CoachBrainSkillId[];
  capabilityIds?: CoachCapabilityId[];
  speechSegments?: Array<{ language: 'zh-CN' | 'id-ID'; text: string }>;
  ttsRate?: 'normal' | 'slow';
  createdAt: string;
};

export type CoachQuestionMemory = {
  id: string;
  question: string;
  detected_language: CoachDetectedLanguage;
  intent: CoachIntent;
  detected_intents: CoachIntent[];
  target_chinese: string | null;
  skill_used: CoachBrainSkillId[];
  current_day: number;
  current_expression: ExpressionId | null;
  answer_category: string;
  resolved: boolean | null;
  follow_up: boolean;
  asked_at: string;
};

export type UserInitiatedMemory = {
  id: string;
  expression: string;
  pinyin: string;
  meaning_id: string;
  source: 'USER_INITIATED';
  first_seen_at: string;
  last_seen_at: string;
  last_attempt_at: string | null;
  last_success_at: string | null;
  mastery_level: 0 | 1 | 2 | 3 | 4;
  pronunciation_status: 'NOT_STARTED' | CoachVerdict | 'NEEDS_REVIEW';
  fail_count: number;
  review_count: number;
  saved_for_review: boolean;
};

export type ExpressionMemory = {
  expression_id: ExpressionId;
  chinese: string;
  pinyin: string;
  indonesian: string;
  attempts: number;
  correct_count: number;
  wrong_count: number;
  pronunciation_status: 'NOT_STARTED' | CoachVerdict | 'NEEDS_REVIEW';
  comprehension_status: 'NOT_STARTED' | 'PASS' | 'RETRY';
  last_seen: string | null;
  mastery_level: 0 | 1 | 2 | 3 | 4;
  saved_for_review: boolean;
  review_count: number;
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
  version: 4;
  course: string;
  lessonId: string;
  currentDay: number | null;
  sessionId: string;
  startedAt: string;
  updatedAt: string;
  expressions: ExpressionMemory[];
  usage: CoachUsage;
  conversation: {
    mode: CoachConversationMode;
    summary: string;
    recentTurns: CoachConversationTurn[];
    questions: CoachQuestionMemory[];
  };
  learning: {
    userLevel: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE';
    preferredExplanationLanguage: 'INDONESIAN' | 'MIXED';
    userInitiated: UserInitiatedMemory[];
  };
  completed: boolean;
};

export const COACH_RETRY_POLICY = {
  changeStrategyAt: 2,
  offerSaveAndSkipAt: 3,
} as const;

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

const defaultLesson: MandarinCoachCurriculumLesson = {
  id: 'mandarin-work-level-1-day-1',
  source: 'MANDARIN_WORK_LEVEL_1',
  courseTitle: '30天工作中文',
  courseTitleId: '30 Hari Bisa Mandarin untuk Kerja',
  group: 'Dasar kerja',
  day: 1,
  title: '第一次开口',
  scenario: 'greeting',
  expressions: DAY_ONE_EXPRESSIONS.map((item) => ({ ...item, kind: 'CORE' as const })),
  dialogue: [],
};

export function createCoachProfile(lesson: MandarinCoachCurriculumLesson): CoachProfile {
  const now = new Date().toISOString();
  return {
    version: 4,
    course: lesson.courseTitleId,
    lessonId: lesson.id,
    currentDay: lesson.day,
    sessionId: `coach-${crypto.randomUUID()}`,
    startedAt: now,
    updatedAt: now,
    expressions: lesson.expressions.map((item) => ({
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
      saved_for_review: false,
      review_count: 0,
    })),
    usage: { token_input: 0, token_output: 0, stt_seconds: 0, tts_calls: 0, model_calls: 0, estimated_ai_cost: 0 },
    conversation: { mode: 'GUIDED_TRAINING', summary: '', recentTurns: [], questions: [] },
    learning: { userLevel: 'BEGINNER', preferredExplanationLanguage: 'INDONESIAN', userInitiated: [] },
    completed: false,
  };
}

export function emptyCoachProfile(): CoachProfile {
  return createCoachProfile(defaultLesson);
}

export function isExpressionId(value: unknown): value is ExpressionId {
  return typeof value === 'string' && /^[A-Z0-9:-]{3,120}$/i.test(value);
}

export function getExpression(id: ExpressionId) {
  return DAY_ONE_EXPRESSIONS.find((item) => item.id === id)!;
}
