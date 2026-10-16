import type { MandarinCoachCurriculumLesson, MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';

export type LearnerLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE';
export type CareerGoalId =
  | 'BASIC_COMMUNICATION'
  | 'UNDERSTAND_INSTRUCTIONS'
  | 'REPORT_PROGRESS'
  | 'SALES_NEGOTIATION'
  | 'WAREHOUSE_LOGISTICS'
  | 'CONSTRUCTION_SAFETY'
  | 'OFFICE_COMMUNICATION'
  | 'CUSTOM';
export type OccupationId = 'FACTORY' | 'SALES' | 'LOGISTICS' | 'CONSTRUCTION' | 'OFFICE' | 'HOSPITALITY' | 'OTHER' | 'SKIPPED';
export type MasteryDimension = 'UNDERSTANDING' | 'RECALL' | 'PRONUNCIATION' | 'LISTENING' | 'APPLICATION';
export type WorkTaskIntent = 'RECEPTION' | 'QUESTION' | 'REPORT' | 'EXPLAIN' | 'CONFIRM' | 'REFUSE' | 'REQUEST_HELP' | 'SALES' | 'LOGISTICS' | 'SAFETY';
export type CareerLearningIntentStatus = 'ALLOW_LANGUAGE_LEARNING' | 'CLARIFY_NEUTRALLY' | 'BLOCK_HARMFUL_REQUEST';

export type LearnerProfileV1 = {
  version: 1;
  onboardingCompleted: boolean;
  skipped: boolean;
  occupation: OccupationId;
  occupationLabel: string;
  jobRole: string;
  goal: CareerGoalId;
  customGoal: string;
  customScenario: string;
  selfReportedLevel: LearnerLevel;
  observedLevel: LearnerLevel;
  dailyMinutes: 5 | 10;
  evidenceCount: number;
  successCount: number;
  needsSupport: MasteryDimension[];
  updatedAt: string;
};

export type MasteryEvidence = {
  expressionId: string;
  lessonId: string;
  dimension: MasteryDimension;
  success: boolean;
  occurredAt: string;
  source: 'GUIDED' | 'RECALL' | 'ROLEPLAY' | 'REVIEW';
  assessmentMode: 'MEANING_CHOICE' | 'STT_INTELLIGIBILITY' | 'STT_RECALL' | 'ROLEPLAY_TASK' | 'ACOUSTIC_PRONUNCIATION';
};

export type LearningEvidenceActivity = 'TEXT_MEANING_CHOICE' | 'AUDIO_MEANING_CHOICE' | 'GUIDED_STT' | 'ACTIVE_RECALL_STT' | 'ROLEPLAY_TASK';

export function evidenceDefinitionForActivity(activity: LearningEvidenceActivity): Pick<MasteryEvidence, 'dimension' | 'source' | 'assessmentMode'> {
  if (activity === 'TEXT_MEANING_CHOICE') return { dimension: 'UNDERSTANDING', source: 'GUIDED', assessmentMode: 'MEANING_CHOICE' };
  if (activity === 'AUDIO_MEANING_CHOICE') return { dimension: 'LISTENING', source: 'GUIDED', assessmentMode: 'MEANING_CHOICE' };
  if (activity === 'ACTIVE_RECALL_STT') return { dimension: 'RECALL', source: 'RECALL', assessmentMode: 'STT_RECALL' };
  if (activity === 'ROLEPLAY_TASK') return { dimension: 'APPLICATION', source: 'ROLEPLAY', assessmentMode: 'ROLEPLAY_TASK' };
  return { dimension: 'PRONUNCIATION', source: 'GUIDED', assessmentMode: 'STT_INTELLIGIBILITY' };
}

export type DimensionMastery = { successes: number; failures: number; level: 0 | 1 | 2 | 3 | 4; lastEvidenceAt: string | null; acousticVerified: boolean };
export type MasteryRecord = {
  expressionId: string;
  lessonId: string;
  dimensions: Record<MasteryDimension, DimensionMastery>;
  overallLevel: 0 | 1 | 2 | 3 | 4;
  nextReviewAt: string;
  evidenceCount: number;
};

export type CareerGoalMap = {
  label: string;
  focus: string[];
  preferredDays: number[];
  scenarioTerms: string[];
  customTerms: string[];
  taskIntents: WorkTaskIntent[];
  contentGapReasons: string[];
  learningIntentStatus: CareerLearningIntentStatus;
  clarification: string;
};

export type SevenDayPlanItem = {
  dayIndex: number;
  lessonId: string;
  expressionIds: string[];
  durationMinutes: 5 | 10;
  focus: MasteryDimension[];
  reason: string;
};

export type SevenDayPlan = {
  version: 1;
  generatedAt: string;
  profileUpdatedAt: string;
  goalLabel: string;
  items: SevenDayPlanItem[];
  contentGaps: string[];
};

export type PersonalizationStateV1 = {
  version: 1;
  profile: LearnerProfileV1;
  mastery: Record<string, MasteryRecord>;
  completedLessonIds: string[];
  plan: SevenDayPlan | null;
};

const dimensions: MasteryDimension[] = ['UNDERSTANDING', 'RECALL', 'PRONUNCIATION', 'LISTENING', 'APPLICATION'];
const goalDays: Record<CareerGoalId, number[]> = {
  BASIC_COMMUNICATION: [1, 2, 3, 5, 7, 8, 14],
  UNDERSTAND_INSTRUCTIONS: [2, 9, 10, 11, 14, 31, 32, 33, 34, 37],
  REPORT_PROGRESS: [12, 15, 20, 21, 35, 38, 39, 46, 49],
  SALES_NEGOTIATION: [3, 7, 16, 20, 23, 25, 26, 42],
  WAREHOUSE_LOGISTICS: [4, 5, 16, 18, 23, 41, 42, 46, 49],
  CONSTRUCTION_SAFETY: [9, 10, 14, 20, 51, 52, 53, 54, 59, 60],
  OFFICE_COMMUNICATION: [7, 8, 11, 12, 20, 21, 22, 25, 27],
  CUSTOM: [],
};

const occupationDays: Record<OccupationId, number[]> = {
  FACTORY: [9, 10, 12, 15, 17, 18, 19, 20, 24, 43, 44, 45, 46, 49],
  SALES: [3, 7, 16, 20, 21, 23, 25, 26, 42, 46],
  LOGISTICS: [4, 5, 10, 16, 18, 23, 41, 42, 46, 49],
  CONSTRUCTION: [9, 10, 14, 20, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
  OFFICE: [7, 8, 11, 12, 20, 21, 22, 25, 27],
  HOSPITALITY: [1, 2, 3, 5, 7, 8, 11, 14, 28],
  OTHER: [1, 2, 3, 7, 8, 11, 14],
  SKIPPED: [1, 2, 3, 7, 8, 11, 14],
};

const goalLabels: Record<CareerGoalId, string> = {
  BASIC_COMMUNICATION: 'Komunikasi Mandarin dasar',
  UNDERSTAND_INSTRUCTIONS: 'Memahami instruksi kerja',
  REPORT_PROGRESS: 'Melaporkan progres dan masalah',
  SALES_NEGOTIATION: 'Penjualan, harga, dan pemasok',
  WAREHOUSE_LOGISTICS: 'Gudang, stok, dan pengiriman',
  CONSTRUCTION_SAFETY: 'Konstruksi dan keselamatan kerja',
  OFFICE_COMMUNICATION: 'Komunikasi kantor',
  CUSTOM: 'Skenario kerja pilihan kamu',
};

const emptyDimension = (): DimensionMastery => ({ successes: 0, failures: 0, level: 0, lastEvidenceAt: null, acousticVerified: false });

const taskRules: Array<{ intent: WorkTaskIntent; pattern: RegExp; days: number[] }> = [
  { intent: 'RECEPTION', pattern: /接待|访客|tamu|pengunjung|visitor|reception|resepsionis|gereja|教堂|satpam|security|保安|门卫/i, days: [1, 3, 7, 8, 11, 14, 25] },
  { intent: 'QUESTION', pattern: /询问|提问|bertanya|menanyakan|tanya|question|问|咨询|konsultasi/i, days: [8, 11, 21] },
  { intent: 'REPORT', pattern: /报告|汇报|melapor|lapor|report|progres|progress|情况|状态/i, days: [12, 15, 17, 20, 35, 46, 49] },
  { intent: 'EXPLAIN', pattern: /解释|说明|menjelaskan|jelaskan|explain|edukasi|教育|介绍|memperkenalkan/i, days: [3, 11, 21, 25, 28] },
  { intent: 'CONFIRM', pattern: /确认|核对|审核|konfirmasi|memastikan|periksa|cek|audit|sertifikasi|认证/i, days: [5, 12, 18, 36] },
  { intent: 'REFUSE', pattern: /拒绝|menolak|refuse|tidak boleh|不可以/i, days: [5, 13, 14] },
  { intent: 'REQUEST_HELP', pattern: /求助|帮助|minta bantuan|bantuan|tolong|help|听不懂|tidak mengerti|tidak paham/i, days: [10, 14, 17, 22] },
  { intent: 'SALES', pattern: /销售|采购|sales|penjualan|harga|pelanggan|customer|pemasok|supplier/i, days: [3, 7, 16, 20, 23, 25, 26, 42] },
  { intent: 'LOGISTICS', pattern: /仓库|库存|物流|gudang|stok|logistik|pengiriman|barang/i, days: [4, 5, 10, 16, 18, 23, 41, 42, 46, 49] },
  { intent: 'SAFETY', pattern: /安全|危险|keselamatan|bahaya|safety|konstruksi|建筑|工地/i, days: [9, 10, 14, 20, 51, 52, 53, 54, 59, 60] },
];

const specializedDomainRules: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /妇科|妇产科|ginekolog|dokter kandungan|vagina|阴道|生殖器|性传播感染|infeksi menular seksual/i, label: 'istilah medis khusus' },
  { pattern: /心理咨询|心理创伤|家庭暴力|性侵害|psikolog|konselor|trauma psikologis|kekerasan rumah tangga|kekerasan seksual/i, label: 'istilah psikologi profesional' },
  { pattern: /清真|halal|sertifikasi halal/i, label: 'istilah audit dan sertifikasi halal' },
  { pattern: /教堂|gereja|宗教|agama|节日休假|cuti hari raya/i, label: 'istilah layanan dan kegiatan keagamaan' },
];

const foundationDaysByTask: Record<WorkTaskIntent, number[]> = {
  RECEPTION: [1, 3, 7, 8], QUESTION: [1, 3, 8, 11], REPORT: [1, 7, 11, 12], EXPLAIN: [1, 3, 11],
  CONFIRM: [1, 3, 5, 11, 12], REFUSE: [1, 5, 13, 14], REQUEST_HELP: [1, 8, 10, 14], SALES: [1, 3, 4, 7],
  LOGISTICS: [1, 4, 5, 8, 10], SAFETY: [1, 8, 9, 10, 14],
};

export function createDefaultLearnerProfile(now = new Date().toISOString()): LearnerProfileV1 {
  return {
    version: 1, onboardingCompleted: false, skipped: false, occupation: 'SKIPPED', occupationLabel: '', jobRole: '',
    goal: 'BASIC_COMMUNICATION', customGoal: '', customScenario: '', selfReportedLevel: 'BEGINNER', observedLevel: 'BEGINNER',
    dailyMinutes: 5, evidenceCount: 0, successCount: 0, needsSupport: [], updatedAt: now,
  };
}

export function createPersonalizationState(now = new Date().toISOString()): PersonalizationStateV1 {
  return { version: 1, profile: createDefaultLearnerProfile(now), mastery: {}, completedLessonIds: [], plan: null };
}

export function replaceLearnerProfileAndPlan(current: PersonalizationStateV1, profile: LearnerProfileV1, plan: SevenDayPlan): PersonalizationStateV1 {
  return { ...current, profile, plan };
}

function tokenize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ').split(' ').filter((token) => token.length > 2);
}

export function assessCareerLearningIntent(value: string): { status: CareerLearningIntentStatus; clarification: string } {
  const normalized = value.trim();
  if (!normalized) return { status: 'ALLOW_LANGUAGE_LEARNING', clarification: '' };
  const targetsProtectedGroup = /宗教|agama|muslim|islam|kristen|christian|佛教|hindu|kelompok agama/i.test(normalized);
  const asksForAbuse = /侮辱|仇恨|攻击|menghina|kebencian|menyerang|propaganda|merendahkan/i.test(normalized);
  if (targetsProtectedGroup && asksForAbuse) {
    return { status: 'BLOCK_HARMFUL_REQUEST', clarification: 'Permintaan yang menghina atau menyerang kelompok agama tidak dapat dijadikan materi belajar.' };
  }
  const acronymOnly = /^[A-Z]{2,8}$/.test(normalized);
  if (acronymOnly) return { status: 'CLARIFY_NEUTRALLY', clarification: `Singkatan “${normalized}” belum cukup jelas. Jelaskan tugas kerjanya tanpa data pribadi pihak lain.` };
  return { status: 'ALLOW_LANGUAGE_LEARNING', clarification: '' };
}

function inferTaskIntents(value: string, goal: CareerGoalId): WorkTaskIntent[] {
  const inferred = taskRules.filter((rule) => rule.pattern.test(value)).map((rule) => rule.intent);
  const goalDefaults: Partial<Record<CareerGoalId, WorkTaskIntent[]>> = {
    UNDERSTAND_INSTRUCTIONS: ['CONFIRM', 'REQUEST_HELP'], REPORT_PROGRESS: ['REPORT', 'EXPLAIN'], SALES_NEGOTIATION: ['SALES', 'QUESTION', 'CONFIRM'],
    WAREHOUSE_LOGISTICS: ['LOGISTICS', 'CONFIRM', 'REPORT'], CONSTRUCTION_SAFETY: ['SAFETY', 'CONFIRM', 'REQUEST_HELP'],
    OFFICE_COMMUNICATION: ['QUESTION', 'REPORT', 'CONFIRM'], BASIC_COMMUNICATION: ['RECEPTION', 'QUESTION'],
  };
  return [...new Set([...inferred, ...(goalDefaults[goal] ?? [])])];
}

export function mapCareerGoal(profile: LearnerProfileV1): CareerGoalMap {
  const custom = `${profile.occupationLabel} ${profile.jobRole} ${profile.customGoal} ${profile.customScenario}`.trim();
  const scenarioTerms = tokenize(custom);
  const customTerms = tokenize(`${profile.customGoal} ${profile.customScenario}`);
  const taskIntents = inferTaskIntents(custom, profile.goal);
  const taskDays = taskIntents.flatMap((intent) => taskRules.find((rule) => rule.intent === intent)?.days ?? []);
  const specializedGaps = specializedDomainRules.filter((rule) => rule.pattern.test(custom)).map((rule) => `Materi canonical saat ini belum mencakup ${rule.label}; rencana hanya memakai kemampuan komunikasi dasar yang relevan.`);
  const intentAssessment = assessCareerLearningIntent(`${profile.customGoal} ${profile.customScenario}`.trim());
  const focus = [goalLabels[profile.goal]];
  if (profile.occupation !== 'SKIPPED') focus.push(profile.occupationLabel || profile.occupation.toLowerCase());
  if (profile.customScenario) focus.push(profile.customScenario);
  return {
    label: profile.goal === 'CUSTOM' && profile.customGoal ? profile.customGoal : goalLabels[profile.goal],
    focus,
    preferredDays: [...new Set([...taskDays, ...goalDays[profile.goal], ...occupationDays[profile.occupation]])],
    scenarioTerms,
    customTerms,
    taskIntents,
    contentGapReasons: specializedGaps,
    learningIntentStatus: intentAssessment.status,
    clarification: intentAssessment.clarification,
  };
}

function requiredFoundationDays(goalMap: CareerGoalMap) {
  return [...new Set([1, ...goalMap.taskIntents.flatMap((intent) => foundationDaysByTask[intent])])];
}

function lessonText(lesson: MandarinCoachCurriculumLesson) {
  return `${lesson.courseTitleId} ${lesson.group} ${lesson.title} ${lesson.scenario} ${lesson.expressions.map((item) => `${item.chinese} ${item.indonesian}`).join(' ')}`.toLowerCase();
}

function lessonScore(lesson: MandarinCoachCurriculumLesson, profile: LearnerProfileV1, goalMap: CareerGoalMap) {
  let score = 0;
  if (lesson.day != null) {
    const preferredIndex = goalMap.preferredDays.indexOf(lesson.day);
    if (preferredIndex >= 0) score += 100 - preferredIndex;
    if (profile.selfReportedLevel === 'BEGINNER' && lesson.day <= 14) score += 40;
    if (profile.selfReportedLevel === 'BEGINNER' && lesson.day > 14) score -= 500;
    if (profile.selfReportedLevel === 'ELEMENTARY' && lesson.day > 30) score += 12;
  }
  const text = lessonText(lesson);
  score += goalMap.scenarioTerms.filter((term) => text.includes(term)).length * 30;
  return score;
}

export function generateSevenDayPlan(profile: LearnerProfileV1, curriculum: MandarinCoachCurriculumPayload, now = new Date().toISOString()): SevenDayPlan {
  const goalMap = mapCareerGoal(profile);
  const foundationDays = requiredFoundationDays(goalMap);
  const eligible = curriculum.lessons
    .filter((lesson) => lesson.expressions.length > 0)
    .filter((lesson) => profile.selfReportedLevel !== 'BEGINNER' || lesson.day == null || lesson.day <= 14)
    .filter((lesson) => profile.selfReportedLevel !== 'ELEMENTARY' || lesson.day == null || lesson.day <= 30)
    .map((lesson, index) => ({ lesson, index, score: lessonScore(lesson, profile, goalMap) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const selected: MandarinCoachCurriculumLesson[] = [];
  const foundationLimit = profile.selfReportedLevel === 'BEGINNER' ? 4 : 2;
  for (const day of foundationDays.slice(0, foundationLimit)) {
    const foundation = curriculum.lessons.find((lesson) => lesson.day === day && lesson.expressions.length > 0);
    if (foundation && !selected.some((lesson) => lesson.id === foundation.id)) selected.push(foundation);
  }
  for (const candidate of eligible) {
    if (selected.some((lesson) => lesson.id === candidate.lesson.id)) continue;
    selected.push(candidate.lesson);
    if (selected.length === 7) break;
  }
  const customMatched = !goalMap.customTerms.length || eligible.some((candidate) => goalMap.customTerms.some((term) => lessonText(candidate.lesson).includes(term)));
  const contentGaps = [
    ...goalMap.contentGapReasons,
    ...(!customMatched ? [`Belum ada materi canonical yang cocok langsung untuk: ${profile.customScenario || profile.customGoal || profile.jobRole}`] : []),
    ...(goalMap.learningIntentStatus !== 'ALLOW_LANGUAGE_LEARNING' && goalMap.clarification ? [goalMap.clarification] : []),
  ];
  return {
    version: 1, generatedAt: now, profileUpdatedAt: profile.updatedAt, goalLabel: goalMap.label, contentGaps,
    items: selected.map((lesson, index) => ({
      dayIndex: index + 1,
      lessonId: lesson.id,
      expressionIds: lesson.expressions.slice(0, profile.dailyMinutes === 5 ? 3 : 5).map((item) => item.id),
      durationMinutes: profile.dailyMinutes,
      focus: index % 3 === 0 ? ['UNDERSTANDING', 'PRONUNCIATION'] : index % 3 === 1 ? ['RECALL', 'LISTENING'] : ['APPLICATION'],
      reason: lesson.day == null ? `Topik yang mendukung ${goalMap.label}` : `Hari ${lesson.day} dipilih untuk ${goalMap.label}`,
    })),
  };
}

export function resolvePersonalizedLesson(curriculum: MandarinCoachCurriculumPayload, item: Pick<SevenDayPlanItem, 'lessonId' | 'expressionIds' | 'durationMinutes'>): MandarinCoachCurriculumLesson | null {
  const catalogEntry = curriculum.catalog.find((entry) => entry.id === item.lessonId);
  if (catalogEntry?.locked) return null;
  const lesson = curriculum.lessons.find((entry) => entry.id === item.lessonId);
  if (!lesson) return null;
  const maximum = item.durationMinutes === 5 ? 3 : 5;
  const requestedIds = item.expressionIds.slice(0, maximum);
  if (!requestedIds.length || requestedIds.some((id) => !lesson.expressions.some((expression) => expression.id === id))) return null;
  const expressions = requestedIds.map((id) => lesson.expressions.find((expression) => expression.id === id)).filter((expression): expression is MandarinCoachCurriculumLesson['expressions'][number] => Boolean(expression));
  if (!expressions.length) return null;
  const allowedChinese = new Set(expressions.map((expression) => expression.chinese.replace(/[？?。！!，,、…\s]/g, '')));
  return {
    ...lesson,
    expressions,
    dialogue: lesson.dialogue.filter((turn) => allowedChinese.has(turn.chinese.replace(/[？?。！!，,、…\s]/g, ''))),
  };
}

export function resolveCoachLessonSelection(curriculum: MandarinCoachCurriculumPayload, lessonId: string, expressionIds: string[] | null): MandarinCoachCurriculumLesson | null {
  const catalogEntry = curriculum.catalog.find((entry) => entry.id === lessonId);
  if (catalogEntry?.locked) return null;
  if (!expressionIds) return curriculum.lessons.find((entry) => entry.id === lessonId) ?? null;
  return resolvePersonalizedLesson(curriculum, { lessonId, expressionIds, durationMinutes: expressionIds.length <= 3 ? 5 : 10 });
}

function dimensionLevel(successes: number, failures: number): 0 | 1 | 2 | 3 | 4 {
  if (!successes) return 0;
  if (successes === 1) return 1;
  if (successes === 2) return failures > successes ? 1 : 2;
  if (successes < 5) return failures > successes ? 2 : 3;
  return failures > successes ? 3 : 4;
}

function reviewDelayDays(level: number, success: boolean) {
  if (!success) return 0;
  return [0, 1, 3, 7, 14][level] ?? 1;
}

export function applyMasteryEvidence(current: MasteryRecord | undefined, evidence: MasteryEvidence): MasteryRecord {
  const base: MasteryRecord = current ?? {
    expressionId: evidence.expressionId, lessonId: evidence.lessonId,
    dimensions: { UNDERSTANDING: emptyDimension(), RECALL: emptyDimension(), PRONUNCIATION: emptyDimension(), LISTENING: emptyDimension(), APPLICATION: emptyDimension() },
    overallLevel: 0, nextReviewAt: evidence.occurredAt, evidenceCount: 0,
  };
  const previous = base.dimensions[evidence.dimension];
  const successes = previous.successes + (evidence.success ? 1 : 0);
  const failures = previous.failures + (evidence.success ? 0 : 1);
  const acousticVerified = previous.acousticVerified || evidence.assessmentMode === 'ACOUSTIC_PRONUNCIATION';
  const rawLevel = dimensionLevel(successes, failures);
  const level = evidence.dimension === 'PRONUNCIATION' && !acousticVerified ? Math.min(1, rawLevel) as 0 | 1 : rawLevel;
  const updatedDimension: DimensionMastery = { successes, failures, level, lastEvidenceAt: evidence.occurredAt, acousticVerified };
  const updatedDimensions = { ...base.dimensions, [evidence.dimension]: updatedDimension };
  const practiced = dimensions.filter((dimension) => updatedDimensions[dimension].successes > 0);
  const average = practiced.length ? Math.floor(practiced.reduce((sum, dimension) => sum + updatedDimensions[dimension].level, 0) / practiced.length) : 0;
  const applicationCap = updatedDimensions.APPLICATION.successes > 0 ? 4 : 3;
  const breadthCap = practiced.length >= 3 ? 4 : practiced.length >= 2 ? 2 : 1;
  const overallLevel = Math.min(average, applicationCap, breadthCap) as 0 | 1 | 2 | 3 | 4;
  const nextReview = new Date(evidence.occurredAt);
  nextReview.setUTCDate(nextReview.getUTCDate() + reviewDelayDays(overallLevel, evidence.success));
  return { ...base, lessonId: evidence.lessonId, dimensions: updatedDimensions, overallLevel, nextReviewAt: nextReview.toISOString(), evidenceCount: base.evidenceCount + 1 };
}

export function updateProfileFromEvidence(profile: LearnerProfileV1, evidence: MasteryEvidence): LearnerProfileV1 {
  const evidenceCount = profile.evidenceCount + 1;
  const successCount = profile.successCount + (evidence.success ? 1 : 0);
  const failureRate = 1 - successCount / evidenceCount;
  const needsSupport = evidence.success
    ? profile.needsSupport.filter((dimension) => dimension !== evidence.dimension)
    : [...new Set([...profile.needsSupport, evidence.dimension])];
  const observedLevel: LearnerLevel = evidenceCount >= 20 && successCount / evidenceCount >= 0.85
    ? 'ELEMENTARY'
    : failureRate >= 0.45 ? 'BEGINNER' : profile.observedLevel;
  return { ...profile, evidenceCount, successCount, needsSupport, observedLevel, updatedAt: evidence.occurredAt };
}

export type NextBestAction =
  | { type: 'REVIEW_EXPRESSION'; lessonId: string; expressionId: string; reason: string }
  | { type: 'START_PLAN_LESSON'; lessonId: string; expressionId: null; reason: string }
  | { type: 'CONTINUE_CANONICAL'; lessonId: null; expressionId: null; reason: string };

export function selectNextBestAction(state: PersonalizationStateV1, now = new Date().toISOString()): NextBestAction {
  const due = Object.values(state.mastery)
    .filter((item) => item.nextReviewAt <= now && item.overallLevel < 4)
    .sort((a, b) => a.overallLevel - b.overallLevel || a.nextReviewAt.localeCompare(b.nextReviewAt))[0];
  if (due) return { type: 'REVIEW_EXPRESSION', lessonId: due.lessonId, expressionId: due.expressionId, reason: 'Latihan ini sudah jatuh tempo dan belum dikuasai penuh.' };
  const nextPlanItem = state.plan?.items.find((item) => !state.completedLessonIds.includes(item.lessonId));
  if (nextPlanItem) return { type: 'START_PLAN_LESSON', lessonId: nextPlanItem.lessonId, expressionId: null, reason: `Lanjutkan Hari ${nextPlanItem.dayIndex} dari rencana 7 hari.` };
  return { type: 'CONTINUE_CANONICAL', lessonId: null, expressionId: null, reason: 'Lanjutkan urutan Day 1–60 yang sudah ada.' };
}

