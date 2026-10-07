import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';

export type CareerFamily =
  | 'WAREHOUSE_LOGISTICS' | 'FACTORY_PRODUCTION' | 'PURCHASING' | 'SALES'
  | 'CUSTOMER_SERVICE' | 'ADMIN_OFFICE' | 'HR_RECRUITMENT'
  | 'CONSTRUCTION_ENGINEERING' | 'DRIVER_FIELD_WORK';

export type MandarinLevel = 'ZERO' | 'BEGINNER' | 'BASIC';
export type LearningPurpose = 'CURRENT_JOB' | 'NEW_JOB' | 'CHINESE_BOSS' | 'BUSINESS' | 'OTHER';
export type MasteryState = 'NEW' | 'EXPOSED' | 'PRACTICING' | 'WEAK' | 'USABLE' | 'MASTERED' | 'REVIEW_DUE';
export type NextBestAction = 'LEARN_NEW' | 'RETRY' | 'SIMPLIFY' | 'EXPLAIN' | 'PRONUNCIATION' | 'LISTENING' | 'ROLEPLAY' | 'VARIATION' | 'REVIEW' | 'MOVE_ON' | 'FAVORITE_AND_SKIP';

export type AdaptiveLearnerProfile = {
  currentJob: string;
  desiredJob: string;
  purpose: LearningPurpose;
  mandarinLevel: MandarinLevel;
  immediateProblem: string;
  dailyStudyMinutes: 5 | 15 | 30;
  targetDate: string | null;
  careerFamily: CareerFamily | null;
  priorCareerFamilies: CareerFamily[];
  updatedAt: string;
};

export type MasteryDimensions = {
  meaning: MasteryState;
  reading: MasteryState;
  listening: MasteryState;
  speaking: MasteryState;
  realSceneUsage: MasteryState;
};

export type AdaptiveMasteryRecord = {
  expressionId: string;
  lessonId: string;
  dimensions: MasteryDimensions;
  successes: number;
  failures: number;
  skips: number;
  hintLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  lastSeenAt: string | null;
  nextReviewAt: string | null;
};

export type AdaptiveMistake = {
  expressionId: string;
  kind: 'PRONUNCIATION' | 'MEANING' | 'LISTENING' | 'WORD_ORDER' | 'MEASURE_WORD' | 'SCENE_USAGE';
  count: number;
  lastSeenAt: string;
};

export type AdaptiveCourseState = {
  version: 1;
  sessionId: string;
  learner: AdaptiveLearnerProfile | null;
  mastery: AdaptiveMasteryRecord[];
  mistakes: AdaptiveMistake[];
  generatedCandidates: AdaptiveCandidate[];
  lastPlan: PersonalLearningPlan | null;
};

export type AdaptiveKnowledgeUnit = {
  expressionId: string;
  lessonId: string;
  sourceType: 'VERIFIED_COURSE' | 'VERIFIED_SCENE' | 'VERIFIED_KB';
  verificationStatus: 'VERIFIED';
  sourceReference: string;
  day: number | null;
  chinese: string;
  pinyin: string;
  indonesianMeaning: string;
  tags: string[];
  locked: boolean;
};

export type AdaptiveCandidate = {
  id: string;
  requestedCapability: string;
  sourceType: 'AI_PERSONAL_CANDIDATE';
  verificationStatus: 'CANDIDATE_FOR_REVIEW';
  personalOnly: true;
  demandCount: number;
  createdAt: string;
};

export type PlanUnit = AdaptiveKnowledgeUnit & {
  capability: string;
  priority: number;
  reason: string;
};

export type PersonalLearningPlan = {
  id: string;
  careerFamily: CareerFamily | null;
  careerLabel: string;
  urgent: boolean;
  needsClarification: boolean;
  currentFocus: string;
  today: PlanUnit[];
  review: PlanUnit[];
  mastered: PlanUnit[];
  gaps: AdaptiveCandidate[];
  generatedAt: string;
  modelLevel: 0;
};

type Capability = { id: string; label: string; tags: string[]; urgency: number; relevance: number };

const immediateCapabilities: Array<{ pattern: RegExp; capability: Capability }> = [
  {
    pattern: /interview|wawancara|面试/i,
    capability: { id: 'JOB_INTERVIEW', label: 'persiapan interview kerja', tags: ['verified-job-interview-content-not-yet-available'], urgency: 5, relevance: 5 },
  },
];

const careerDefinitions: Record<CareerFamily, { label: string; keywords: string[]; capabilities: Capability[] }> = {
  WAREHOUSE_LOGISTICS: { label: 'Gudang / Logistik', keywords: ['gudang', 'warehouse', 'logistik', 'logistics', '仓库', '库存'], capabilities: [
    { id: 'ASK_DELIVERY_STATUS', label: 'status barang dan pengiriman', tags: ['warehouse-logistics', '货', '到了', '发货'], urgency: 5, relevance: 5 },
    { id: 'QUANTITY_STOCK', label: 'jumlah dan stok', tags: ['quantity', '库存', '数量', '多少'], urgency: 4, relevance: 5 },
    { id: 'REPORT_PROBLEM', label: 'melaporkan masalah barang', tags: ['problem-report', '不对', '坏了'], urgency: 4, relevance: 4 },
  ] },
  FACTORY_PRODUCTION: { label: 'Pabrik / Produksi', keywords: ['pabrik', 'factory', 'produksi', 'production', 'operator', '工厂', '生产'], capabilities: [
    { id: 'PRODUCTION_INSTRUCTION', label: 'instruksi produksi', tags: ['production', '机器', '开始', '停'], urgency: 5, relevance: 5 },
    { id: 'WORK_PROGRESS', label: 'progres pekerjaan', tags: ['work-progress', 'work-status', '好了', '正在做'], urgency: 4, relevance: 5 },
    { id: 'QUALITY_REWORK', label: 'kualitas dan perbaikan', tags: ['quality-check', 'rework', '检查', '重做'], urgency: 4, relevance: 5 },
  ] },
  PURCHASING: { label: 'Purchasing', keywords: ['purchasing', 'purchase', 'procurement', 'buyer', '采购', 'supplier', '供应商'], capabilities: [
    { id: 'ASK_PRICE', label: 'harga dan quotation', tags: ['procurement', '价格', '报价', '多少钱'], urgency: 5, relevance: 5 },
    { id: 'SUPPLIER_FOLLOWUP', label: 'follow-up supplier', tags: ['供应商', '问一下', '发货'], urgency: 4, relevance: 5 },
    { id: 'DELIVERY_STOCK', label: 'pengiriman dan stok', tags: ['warehouse-logistics', '货到了', '库存'], urgency: 4, relevance: 5 },
  ] },
  SALES: { label: 'Sales', keywords: ['sales', 'penjualan', '销售', 'marketing'], capabilities: [
    { id: 'PRICE_QUOTE', label: 'harga dan penawaran', tags: ['procurement', '价格', '报价', '多少钱'], urgency: 4, relevance: 5 },
    { id: 'CUSTOMER_GREETING', label: 'menyapa dan merespons', tags: ['greeting', '你好', '谢谢'], urgency: 3, relevance: 4 },
    { id: 'DELIVERY_FOLLOWUP', label: 'status pengiriman', tags: ['warehouse-logistics', '发货', '到了'], urgency: 4, relevance: 4 },
  ] },
  CUSTOMER_SERVICE: { label: 'Customer Service', keywords: ['customer service', 'cs', 'layanan pelanggan', '客服', 'pelanggan'], capabilities: [
    { id: 'GREETING', label: 'sapaan dan respons', tags: ['greeting', '你好', '谢谢'], urgency: 5, relevance: 5 },
    { id: 'CLARIFY', label: 'meminta penjelasan', tags: ['self-rescue', '什么意思', '再说一次'], urgency: 4, relevance: 5 },
    { id: 'HANDLE_PROBLEM', label: 'menangani masalah', tags: ['problem-report', '有问题', '为什么'], urgency: 4, relevance: 4 },
  ] },
  ADMIN_OFFICE: { label: 'Admin / Kantor', keywords: ['admin', 'office', 'kantor', '办公室', 'administrasi', 'export import'], capabilities: [
    { id: 'DOCUMENT', label: 'dokumen dan file', tags: ['office', '文件', '表格', '发给我'], urgency: 5, relevance: 5 },
    { id: 'SCHEDULE', label: 'waktu dan jadwal', tags: ['schedule', 'time', '今天', '明天', '几点'], urgency: 4, relevance: 5 },
    { id: 'REPORT_PROGRESS', label: 'laporan progres', tags: ['work-progress', 'work-status', '好了'], urgency: 4, relevance: 4 },
  ] },
  HR_RECRUITMENT: { label: 'HR / Rekrutmen', keywords: ['hr', 'human resource', 'recruitment', 'rekrutmen', '面试', '人事'], capabilities: [
    { id: 'INTRODUCE_SELF', label: 'perkenalan diri', tags: ['greeting', '我叫', '你好'], urgency: 5, relevance: 5 },
    { id: 'PEOPLE', label: 'orang dan jabatan', tags: ['people-collaboration', '经理', '老板', '同事'], urgency: 4, relevance: 5 },
    { id: 'ATTENDANCE', label: 'jam kerja dan kehadiran', tags: ['attendance', '上班', '请假'], urgency: 3, relevance: 4 },
  ] },
  CONSTRUCTION_ENGINEERING: { label: 'Konstruksi / Engineering', keywords: ['construction', 'konstruksi', 'proyek', 'engineering', 'teknik', '建筑', '工地'], capabilities: [
    { id: 'SITE_DIRECTION', label: 'arah dan instruksi lokasi', tags: ['construction', '方向位置', '这里', '那里'], urgency: 5, relevance: 5 },
    { id: 'MOVE_MEASURE', label: 'memindahkan dan mengukur', tags: ['construction', '搬运移动', '测量尺寸'], urgency: 5, relevance: 5 },
    { id: 'SITE_SAFETY', label: 'keselamatan kerja', tags: ['construction', '工地安全'], urgency: 5, relevance: 5 },
  ] },
  DRIVER_FIELD_WORK: { label: 'Driver / Pekerjaan Lapangan', keywords: ['driver', 'sopir', 'lapangan', 'field work', '司机'], capabilities: [
    { id: 'DIRECTION', label: 'arah dan lokasi', tags: ['movement', 'people-location', '来', '去', '这里', '那里'], urgency: 5, relevance: 5 },
    { id: 'TIME', label: 'waktu dan jadwal', tags: ['time', 'schedule', '几点', '今天', '明天'], urgency: 4, relevance: 5 },
    { id: 'DELIVERY', label: 'barang dan pengiriman', tags: ['warehouse-logistics', '货', '发货'], urgency: 4, relevance: 4 },
  ] },
};

const foundationCapabilities: Capability[] = [
  { id: 'FOUNDATION_GREETING', label: 'sapaan dasar', tags: ['greeting'], urgency: 3, relevance: 4 },
  { id: 'FOUNDATION_SELF_RESCUE', label: 'meminta bantuan saat tidak mengerti', tags: ['self-rescue'], urgency: 5, relevance: 5 },
  { id: 'FOUNDATION_TIME', label: 'waktu dasar', tags: ['time', 'schedule'], urgency: 3, relevance: 3 },
];

const defaultDimensions = (): MasteryDimensions => ({ meaning: 'NEW', reading: 'NEW', listening: 'NEW', speaking: 'NEW', realSceneUsage: 'NEW' });
const normalized = (value: string) => value.trim().toLocaleLowerCase('id-ID');
const unique = <T,>(values: T[]) => Array.from(new Set(values));

export function inferCareerFamily(value: string): CareerFamily | null {
  const input = normalized(value);
  if (!input) return null;
  const matches = (Object.entries(careerDefinitions) as Array<[CareerFamily, typeof careerDefinitions[CareerFamily]]>)
    .map(([family, definition]) => ({ family, score: definition.keywords.filter((keyword) => input.includes(normalized(keyword))).length }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return matches[0]?.family ?? null;
}

export function profileLearner(input: Omit<AdaptiveLearnerProfile, 'careerFamily' | 'priorCareerFamilies' | 'updatedAt'>, previous?: AdaptiveLearnerProfile | null): AdaptiveLearnerProfile {
  const careerFamily = inferCareerFamily(input.desiredJob) ?? inferCareerFamily(`${input.currentJob} ${input.immediateProblem}`);
  const previousFamilies = previous?.careerFamily && previous.careerFamily !== careerFamily ? [previous.careerFamily, ...previous.priorCareerFamilies] : previous?.priorCareerFamilies ?? [];
  return { ...input, careerFamily, priorCareerFamilies: unique(previousFamilies), updatedAt: new Date().toISOString() };
}

export function buildAdaptiveKnowledge(lessons: MandarinCoachCurriculumLesson[], lockedLessonIds = new Set<string>()): AdaptiveKnowledgeUnit[] {
  return lessons.flatMap((lesson) => lesson.expressions.map((expression) => ({
    expressionId: expression.id,
    lessonId: lesson.id,
    sourceType: lesson.source === 'GOLDEN_QUANTITY' ? 'VERIFIED_KB' as const : 'VERIFIED_COURSE' as const,
    verificationStatus: 'VERIFIED' as const,
    sourceReference: `${lesson.source}:${lesson.id}`,
    day: lesson.day,
    chinese: expression.chinese,
    pinyin: expression.pinyin,
    indonesianMeaning: expression.indonesian,
    tags: unique([lesson.group, lesson.scenario, lesson.title, expression.kind, expression.chinese]),
    locked: lockedLessonIds.has(lesson.id),
  })));
}

export function mapCareerGoal(profile: AdaptiveLearnerProfile) {
  const definition = profile.careerFamily ? careerDefinitions[profile.careerFamily] : null;
  const urgentCapabilities = immediateCapabilities.filter(({ pattern }) => pattern.test(`${profile.immediateProblem} ${profile.desiredJob}`)).map(({ capability }) => capability);
  return {
    family: profile.careerFamily,
    label: definition?.label ?? 'Tujuan belum ditentukan',
    capabilities: definition ? [...urgentCapabilities, ...definition.capabilities, ...foundationCapabilities] : [...urgentCapabilities, ...foundationCapabilities],
    needsClarification: !definition,
  };
}

function stateWeight(state: MasteryState) {
  return ({ NEW: 5, EXPOSED: 4, PRACTICING: 3, WEAK: 5, USABLE: 1, MASTERED: -3, REVIEW_DUE: 5 } as const)[state];
}

function overallState(record?: AdaptiveMasteryRecord): MasteryState {
  if (!record) return 'NEW';
  const values = Object.values(record.dimensions);
  if (values.includes('REVIEW_DUE')) return 'REVIEW_DUE';
  if (values.includes('WEAK')) return 'WEAK';
  if (values.every((value) => value === 'MASTERED' || value === 'USABLE') && record.dimensions.realSceneUsage === 'MASTERED') return 'MASTERED';
  if (record.successes >= 2) return 'USABLE';
  if (record.failures > record.successes) return 'WEAK';
  return record.successes || record.failures ? 'PRACTICING' : 'EXPOSED';
}

function isUrgent(profile: AdaptiveLearnerProfile, now: Date) {
  if (/besok|tomorrow|明天|interview|面试/i.test(`${profile.immediateProblem} ${profile.desiredJob}`)) return true;
  if (!profile.targetDate) return false;
  const target = Date.parse(profile.targetDate);
  return Number.isFinite(target) && target - now.getTime() <= 14 * 86_400_000;
}

function matches(unit: AdaptiveKnowledgeUnit, tags: string[]) {
  const haystack = normalized(`${unit.tags.join(' ')} ${unit.chinese} ${unit.indonesianMeaning}`);
  return tags.some((tag) => haystack.includes(normalized(tag)));
}

export function assemblePersonalPlan(input: {
  profile: AdaptiveLearnerProfile;
  knowledge: AdaptiveKnowledgeUnit[];
  mastery: AdaptiveMasteryRecord[];
  mistakes: AdaptiveMistake[];
  now?: Date;
}): PersonalLearningPlan {
  const now = input.now ?? new Date();
  const career = mapCareerGoal(input.profile);
  const urgent = isUrgent(input.profile, now);
  const masteryById = new Map(input.mastery.map((record) => [record.expressionId, record]));
  const mistakeById = new Map(input.mistakes.map((mistake) => [mistake.expressionId, mistake.count]));
  const units: PlanUnit[] = [];
  for (const capability of career.capabilities) {
    for (const unit of input.knowledge) {
      if (unit.locked || !matches(unit, capability.tags)) continue;
      const record = masteryById.get(unit.expressionId);
      const state = overallState(record);
      const reviewDue = record?.nextReviewAt ? Date.parse(record.nextReviewAt) <= now.getTime() : false;
      const mistake = mistakeById.get(unit.expressionId) ?? 0;
      const speakingNeed = /bicara|ngomong|speaking|pengucapan|口语/i.test(input.profile.immediateProblem);
      const speakingPriority = speakingNeed && unit.tags.some((tag) => /dialogue|listening/i.test(tag)) ? 8 : 0;
      const levelPriority = input.profile.mandarinLevel === 'BASIC' ? (unit.day && unit.day >= 20 ? 5 : unit.day && unit.day <= 10 ? -5 : 0) : input.profile.mandarinLevel === 'ZERO' ? (unit.day && unit.day <= 14 ? 4 : 0) : 0;
      const sourcePriority = unit.sourceType === 'VERIFIED_COURSE' ? 3 : unit.sourceType === 'VERIFIED_SCENE' ? 2 : 1;
      const priority = capability.relevance * 4 + capability.urgency * (urgent ? 3 : 2) + stateWeight(reviewDue ? 'REVIEW_DUE' : state) * 2 + Math.min(6, mistake * 2) + speakingPriority + levelPriority + sourcePriority - (record?.skips ?? 0);
      units.push({ ...unit, capability: capability.id, priority, reason: reviewDue ? 'review_due' : mistake ? 'repeated_error' : urgent ? 'urgent_career_need' : 'career_relevance' });
    }
  }
  const deduped = [...new Map(units.sort((a, b) => b.priority - a.priority).map((unit) => [unit.expressionId, unit])).values()];
  const review = deduped.filter((unit) => ['WEAK', 'REVIEW_DUE'].includes(overallState(masteryById.get(unit.expressionId)))).slice(0, 3);
  const mastered = deduped.filter((unit) => overallState(masteryById.get(unit.expressionId)) === 'MASTERED').slice(0, 3);
  const todayLimit = input.profile.dailyStudyMinutes === 5 ? 3 : input.profile.dailyStudyMinutes === 15 ? 5 : 8;
  const today = deduped.filter((unit) => !mastered.some((item) => item.expressionId === unit.expressionId)).slice(0, todayLimit);
  const missingCapabilities = career.capabilities.filter((capability) => !input.knowledge.some((unit) => !unit.locked && matches(unit, capability.tags)));
  const gaps = missingCapabilities.map((capability) => ({
    id: `gap:${capability.id}`,
    requestedCapability: capability.id,
    sourceType: 'AI_PERSONAL_CANDIDATE' as const,
    verificationStatus: 'CANDIDATE_FOR_REVIEW' as const,
    personalOnly: true as const,
    demandCount: 1,
    createdAt: now.toISOString(),
  }));
  return {
    id: `plan-${now.getTime()}`,
    careerFamily: career.family,
    careerLabel: career.label,
    urgent,
    needsClarification: career.needsClarification,
    currentFocus: urgent ? 'Persiapan kebutuhan paling mendesak' : career.capabilities[0]?.label ?? 'Mandarin dasar untuk kerja',
    today,
    review,
    mastered,
    gaps,
    generatedAt: now.toISOString(),
    modelLevel: 0,
  };
}

function nextReview(state: MasteryState, now: Date) {
  const days = state === 'MASTERED' ? 14 : state === 'USABLE' ? 7 : state === 'WEAK' ? 1 : 2;
  return new Date(now.getTime() + days * 86_400_000).toISOString();
}

export function judgeMastery(input: {
  previous?: AdaptiveMasteryRecord;
  expressionId: string;
  lessonId: string;
  dimension: keyof MasteryDimensions;
  success: boolean;
  changedContext?: boolean;
  hintLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  skipped?: boolean;
  now?: Date;
}): AdaptiveMasteryRecord {
  const now = input.now ?? new Date();
  const previous = input.previous ?? { expressionId: input.expressionId, lessonId: input.lessonId, dimensions: defaultDimensions(), successes: 0, failures: 0, skips: 0, hintLevel: 0, lastSeenAt: null, nextReviewAt: null };
  const successes = previous.successes + (input.success ? 1 : 0);
  const failures = previous.failures + (input.success ? 0 : 1);
  const hintLevel = input.hintLevel ?? previous.hintLevel;
  let state: MasteryState = input.success ? 'PRACTICING' : failures >= 2 ? 'WEAK' : 'EXPOSED';
  if (input.success && hintLevel <= 2) state = successes >= 2 ? 'USABLE' : 'PRACTICING';
  if (input.success && input.changedContext && hintLevel === 0 && successes >= 2) state = 'MASTERED';
  return {
    ...previous,
    dimensions: { ...previous.dimensions, [input.dimension]: state },
    successes,
    failures,
    skips: previous.skips + (input.skipped ? 1 : 0),
    hintLevel,
    lastSeenAt: now.toISOString(),
    nextReviewAt: nextReview(state, now),
  };
}

export function decideNextBestAction(input: { record: AdaptiveMasteryRecord; repeatedFailures: number; recentSkips: number; reviewDue: boolean }): { action: NextBestAction; reason: string; level: 0 } {
  if (input.recentSkips >= 2) return { action: 'FAVORITE_AND_SKIP', reason: 'recent_fatigue_signal', level: 0 };
  if (input.repeatedFailures >= 3) return { action: 'SIMPLIFY', reason: 'repeated_error', level: 0 };
  if (input.repeatedFailures === 2) return { action: 'EXPLAIN', reason: 'needs_indonesian_support', level: 0 };
  if (input.repeatedFailures === 1) return { action: 'RETRY', reason: 'first_retry', level: 0 };
  if (input.reviewDue) return { action: 'REVIEW', reason: 'spaced_review_due', level: 0 };
  const state = overallState(input.record);
  if (state === 'MASTERED' || state === 'USABLE') return { action: 'VARIATION', reason: 'test_changed_context', level: 0 };
  return { action: 'LEARN_NEW', reason: 'highest_value_unmastered', level: 0 };
}

export function careerLabel(family: CareerFamily | null) {
  return family ? careerDefinitions[family].label : 'Belum ditentukan';
}
