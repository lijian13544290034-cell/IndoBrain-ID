import assert from 'node:assert/strict';
import {
  applyMasteryEvidence,
  assessCareerLearningIntent,
  createDefaultLearnerProfile,
  createPersonalizationState,
  evidenceDefinitionForActivity,
  generateSevenDayPlan,
  mapCareerGoal,
  replaceLearnerProfileAndPlan,
  resolveCoachLessonSelection,
  resolvePersonalizedLesson,
  selectNextBestAction,
  updateProfileFromEvidence,
} from '../lib/mandarin-coach-personalization.ts';
import { mandarinWorkDays } from '../lib/mandarin-work-course.ts';
import { chineseTtsVoice, resolveChineseTtsRate } from '../lib/chinese-tts-provider.ts';

const lesson = (day, title, scenario, words = []) => ({
  id: `lesson-${day}`,
  source: day > 30 ? 'MANDARIN_WORK_LEVEL_2' : 'MANDARIN_WORK_LEVEL_1',
  courseTitle: '工作中文', courseTitleId: 'Mandarin untuk Kerja', group: day > 30 ? 'Level 2' : 'Level 1', day, title, scenario,
  expressions: (words.length ? words : [`表达${day}`]).map((chinese, index) => ({ id: `L${day}-E${index + 1}`, chinese, pinyin: 'test', indonesian: `${scenario} ${index + 1}`, chunks: [], kind: 'CORE' })),
  dialogue: [],
});

const lessons = Array.from({ length: 60 }, (_, index) => {
  const day = index + 1;
  if (day === 1) return lesson(day, '第一次开口', 'basic communication', ['你好', '谢谢', '好的', '再见', '请', '不客气']);
  if (day === 10) return lesson(day, '拿、给、放、找', 'factory instruction', ['拿这个', '放这里']);
  if (day === 15) return lesson(day, '工作进度', 'factory progress', ['正在做', '还没']);
  if (day === 23) return lesson(day, '仓库物流', 'warehouse logistics', ['库存多少', '今天发货']);
  if (day === 25) return lesson(day, '办公室', 'office communication', ['文件给我', '发给我']);
  if (day === 26) return lesson(day, '采购', 'sales price supplier', ['多少钱', '报价呢']);
  if (day === 46) return lesson(day, '工作进度', 'report progress', ['做到哪里了', '快做完了']);
  if (day === 59) return lesson(day, '工地安全', 'construction safety', ['戴安全帽', '这里危险']);
  return lesson(day, `Day ${day}`, day <= 14 ? 'basic communication' : 'general work');
});
const catalog = lessons.map((item) => ({ ...item, expressionCount: item.expressions.length, locked: item.day > 30 }));
const curriculum = { catalog, lessons, inventory: { direction: 'INDONESIAN_TO_MANDARIN', courses: 2, days: 60, topics: 0, lessons: 60, expressions: lessons.reduce((sum, item) => sum + item.expressions.length, 0) } };

const now = '2026-10-16T00:00:00.000Z';
const factoryBase = { ...createDefaultLearnerProfile(now), onboardingCompleted: true, occupation: 'FACTORY', occupationLabel: 'Pabrik / produksi', jobRole: 'operator mesin', selfReportedLevel: 'BEGINNER', dailyMinutes: 5 };
const salesBase = { ...createDefaultLearnerProfile(now), onboardingCompleted: true, occupation: 'SALES', occupationLabel: 'Sales / penjualan', jobRole: 'sales toko', goal: 'SALES_NEGOTIATION', selfReportedLevel: 'BEGINNER', dailyMinutes: 5 };
const factoryInstructions = { ...factoryBase, goal: 'UNDERSTAND_INSTRUCTIONS' };
const factoryReporting = { ...factoryBase, goal: 'REPORT_PROGRESS' };

const factoryPlan = generateSevenDayPlan(factoryInstructions, curriculum, now);
const salesPlan = generateSevenDayPlan(salesBase, curriculum, now);
const reportingPlan = generateSevenDayPlan(factoryReporting, curriculum, now);

assert.equal(factoryPlan.items.length, 7, 'factory plan must have seven days');
assert.equal(salesPlan.items.length, 7, 'sales plan must have seven days');
assert.notDeepEqual(factoryPlan.items.map((item) => item.lessonId), salesPlan.items.map((item) => item.lessonId), 'factory and sales plans must differ');
assert.notDeepEqual(factoryPlan.items.map((item) => item.lessonId), reportingPlan.items.map((item) => item.lessonId), 'same occupation with different goals must differ');
assert(factoryPlan.items.every((item) => Number(item.lessonId.replace('lesson-', '')) <= 14), 'beginner plan must stay inside the beginner foundation band');
const realLessonIds = new Set(lessons.map((item) => item.id));
const realExpressionIds = new Set(lessons.flatMap((item) => item.expressions.map((expression) => expression.id)));
for (const plan of [factoryPlan, salesPlan, reportingPlan]) {
  for (const item of plan.items) {
    assert(realLessonIds.has(item.lessonId), `unknown lesson id ${item.lessonId}`);
    assert(item.expressionIds.every((id) => realExpressionIds.has(id)), `plan ${item.lessonId} contains non-canonical expression`);
  }
}

assert(mapCareerGoal(factoryInstructions).preferredDays.includes(10), 'instruction mapper must prioritize instruction lessons');
assert(mapCareerGoal(salesBase).preferredDays.includes(26), 'sales mapper must prioritize procurement/price lessons');

const textChoice = evidenceDefinitionForActivity('TEXT_MEANING_CHOICE');
assert.equal(textChoice.dimension, 'UNDERSTANDING', 'text meaning choice may only score understanding');
assert.notEqual(textChoice.dimension, 'LISTENING', 'text meaning choice must not score listening');
assert.equal(evidenceDefinitionForActivity('GUIDED_STT').dimension, 'PRONUNCIATION', 'guided repetition may only score STT intelligibility pronunciation');
assert.equal(evidenceDefinitionForActivity('ACTIVE_RECALL_STT').dimension, 'RECALL', 'recall must come from an active recall task');
assert.equal(evidenceDefinitionForActivity('ROLEPLAY_TASK').dimension, 'APPLICATION', 'application must come from roleplay');

const fiveMinuteItem = { lessonId: 'lesson-1', expressionIds: lessons[0].expressions.slice(0, 3).map((item) => item.id), durationMinutes: 5 };
const tenMinuteItem = { lessonId: 'lesson-1', expressionIds: lessons[0].expressions.slice(0, 5).map((item) => item.id), durationMinutes: 10 };
const fiveMinuteLesson = resolvePersonalizedLesson(curriculum, fiveMinuteItem);
const tenMinuteLesson = resolvePersonalizedLesson(curriculum, tenMinuteItem);
assert.equal(fiveMinuteLesson?.expressions.length, 3, '5-minute personalized lesson must contain at most three selected expressions');
assert.equal(tenMinuteLesson?.expressions.length, 5, '10-minute personalized lesson must contain at most five selected expressions');
assert.equal(lessons[0].expressions.length, 6, 'personalized filtering must not mutate the canonical lesson');
assert.equal(resolvePersonalizedLesson(curriculum, { lessonId: 'lesson-31', expressionIds: ['L31-E1'], durationMinutes: 5 }), null, 'locked lessons must not be opened by a personalized plan');
assert.equal(resolvePersonalizedLesson(curriculum, { lessonId: 'lesson-1', expressionIds: ['NOT-CANONICAL'], durationMinutes: 5 }), null, 'invalid expression IDs must fail closed');
assert.equal(resolveCoachLessonSelection(curriculum, 'lesson-1', null)?.expressions.length, lessons[0].expressions.length, 'ordinary Day 1 entry must keep the full canonical lesson');
assert.equal(resolveCoachLessonSelection(curriculum, 'lesson-30', null)?.id, 'lesson-30', 'ordinary Day 30 entry must remain available');
assert.equal(resolveCoachLessonSelection(curriculum, 'lesson-60', null), null, 'ordinary Day 60 entry must remain locked without authorization');
const authorizedCurriculum = { ...curriculum, catalog: catalog.map((item) => ({ ...item, locked: false })) };
assert.equal(resolveCoachLessonSelection(authorizedCurriculum, 'lesson-60', null)?.id, 'lesson-60', 'authorized Day 60 entry must remain available as a full lesson');

const firstEvidence = { expressionId: 'L10-E1', lessonId: 'lesson-10', dimension: 'PRONUNCIATION', success: true, occurredAt: now, source: 'GUIDED', assessmentMode: 'STT_INTELLIGIBILITY' };
const once = applyMasteryEvidence(undefined, firstEvidence);
assert.equal(once.overallLevel, 1, 'one correct answer must not mean complete mastery');
assert.notEqual(once.overallLevel, 4, 'one correct answer must never be full mastery');
assert.equal(once.dimensions.PRONUNCIATION.acousticVerified, false, 'STT intelligibility must not be presented as acoustic pronunciation scoring');
let repeatedStt = once;
for (let index = 0; index < 6; index += 1) repeatedStt = applyMasteryEvidence(repeatedStt, firstEvidence);
assert.equal(repeatedStt.dimensions.PRONUNCIATION.level, 1, 'repeated STT matches must not raise acoustic pronunciation mastery');
const withUnderstanding = applyMasteryEvidence(once, { ...firstEvidence, dimension: 'UNDERSTANDING' });
const withApplication = applyMasteryEvidence(withUnderstanding, { ...firstEvidence, dimension: 'APPLICATION', source: 'ROLEPLAY' });
assert(withApplication.overallLevel < 4, 'three single successes must still not be full mastery');

const failed = applyMasteryEvidence(undefined, { ...firstEvidence, success: false });
const state = { ...createPersonalizationState(now), profile: factoryInstructions, mastery: { [failed.expressionId]: failed }, plan: factoryPlan };
const action = selectNextBestAction(state, now);
assert.equal(action.type, 'REVIEW_EXPRESSION', 'failed due evidence must be reviewed before new content');

const updatedProfile = updateProfileFromEvidence(factoryInstructions, { ...firstEvidence, success: false });
assert(updatedProfile.needsSupport.includes('PRONUNCIATION'), 'real failure must update learner support needs');
assert.equal(updatedProfile.evidenceCount, 1, 'profile behavior evidence must increment');

const custom = { ...factoryBase, occupation: 'OTHER', goal: 'CUSTOM', customGoal: 'komunikasi laboratorium', customScenario: 'kalibrasi spektrometer' };
const customPlan = generateSevenDayPlan(custom, curriculum, now);
assert.equal(customPlan.contentGaps.length, 1, 'unavailable custom scenario must be explicitly marked as a gap');

const previousState = { ...createPersonalizationState(now), mastery: { [once.expressionId]: once }, completedLessonIds: ['lesson-1'], plan: factoryPlan };
const changedProfile = { ...factoryInstructions, occupation: 'SALES', goal: 'SALES_NEGOTIATION', updatedAt: '2026-10-17T00:00:00.000Z' };
const changedPlan = generateSevenDayPlan(changedProfile, curriculum, changedProfile.updatedAt);
const changedState = replaceLearnerProfileAndPlan(previousState, changedProfile, changedPlan);
assert.deepEqual(changedState.mastery, previousState.mastery, 'changing occupation must preserve mastery history');
assert.deepEqual(changedState.completedLessonIds, previousState.completedLessonIds, 'changing occupation must preserve completed lessons');

const professionalCases = [
  ['satpam mall', 'menerima pengunjung dan meminta konfirmasi', ['RECEPTION', 'CONFIRM']],
  ['penjaga gerbang pabrik 工厂门卫', '确认访客 dan minta bantuan', ['RECEPTION', 'CONFIRM', 'REQUEST_HELP']],
  ['psikolog 心理咨询师', 'menjelaskan trauma psikologis dengan hormat', ['EXPLAIN']],
  ['dokter kandungan 妇科医生', 'menjelaskan infeksi menular seksual kepada pasien', ['EXPLAIN']],
  ['petugas sertifikasi halal 清真认证', 'audit makanan dan melaporkan hasil', ['CONFIRM', 'REPORT']],
  ['staf gereja 教堂接待', 'menerima pengunjung Tiongkok dan menjelaskan jadwal', ['RECEPTION', 'EXPLAIN']],
];
for (const [jobRole, customScenario, expectedTasks] of professionalCases) {
  const profile = { ...factoryBase, occupation: 'OTHER', occupationLabel: jobRole, jobRole, goal: 'CUSTOM', customGoal: 'komunikasi profesional', customScenario };
  const mapped = mapCareerGoal(profile);
  for (const task of expectedTasks) assert(mapped.taskIntents.includes(task), `${jobRole} should map to ${task}`);
  const plan = generateSevenDayPlan(profile, curriculum, now);
  assert(plan.items.every((item) => realLessonIds.has(item.lessonId)), `${jobRole} plan must only use canonical lessons`);
  if (/psikolog|dokter|halal|gereja/i.test(jobRole)) assert(plan.contentGaps.length > 0, `${jobRole} must disclose specialized canonical content gaps`);
}

assert.equal(assessCareerLearningIntent('妇科医生学习阴道、生殖器、性传播感染中文').status, 'ALLOW_LANGUAGE_LEARNING', 'medical language learning must be allowed');
assert.equal(assessCareerLearningIntent('心理咨询师学习心理创伤、家庭暴力、性侵害表达').status, 'ALLOW_LANGUAGE_LEARNING', 'trauma-informed professional language learning must be allowed');
assert.equal(assessCareerLearningIntent('清真认证人员学习食品审核中文').status, 'ALLOW_LANGUAGE_LEARNING', 'halal certification language learning must be allowed');
assert.equal(assessCareerLearningIntent('教堂工作人员接待中国访客').status, 'ALLOW_LANGUAGE_LEARNING', 'church reception language learning must be allowed');
assert.equal(assessCareerLearningIntent('不同宗教学员申请节日休假').status, 'ALLOW_LANGUAGE_LEARNING', 'neutral religious workplace language must be allowed');
assert.equal(assessCareerLearningIntent('生成侮辱某宗教群体的宣传文案').status, 'BLOCK_HARMFUL_REQUEST', 'religious hate content must be blocked contextually');
assert.equal(assessCareerLearningIntent('QHSE').status, 'CLARIFY_NEUTRALLY', 'unknown job acronym must request neutral clarification');

const beginnerProfessional = { ...factoryBase, occupation: 'OTHER', jobRole: 'dokter kandungan', customScenario: 'menjelaskan hasil pemeriksaan', goal: 'CUSTOM' };
const beginnerProfessionalPlan = generateSevenDayPlan(beginnerProfessional, curriculum, now);
assert(beginnerProfessionalPlan.items.every((item) => Number(item.lessonId.replace('lesson-', '')) <= 14), 'a beginner professional must not skip foundational capability checks');
assert(beginnerProfessionalPlan.items.some((item) => item.lessonId === 'lesson-1'), 'beginner plan must include common communication foundation');

assert.equal(chineseTtsVoice, 'zh-CN-XiaoxiaoNeural', 'Mandarin TTS must remain standard zh-CN Xiaoxiao');
assert.notEqual(resolveChineseTtsRate('normal'), resolveChineseTtsRate('slow'), 'normal and slow Mandarin TTS rates must be genuinely different');

const actualLessons = mandarinWorkDays.map((day) => ({
  id: `mandarin-work-level-1-day-${day.day}`,
  source: 'MANDARIN_WORK_LEVEL_1', courseTitle: '30天工作中文', courseTitleId: '30 Hari Bisa Mandarin untuk Kerja',
  group: day.day <= 10 ? 'Dasar kerja' : day.day <= 20 ? 'Komunikasi kerja' : 'Situasi kerja lengkap',
  day: day.day, title: day.title, scenario: day.scenario,
  expressions: [...day.items, ...day.dialogue.map((turn) => turn.item)].map((item) => ({ id: item.id, chinese: item.chinese, pinyin: item.pinyinSegments.map((segment) => segment.pinyin).join(' '), indonesian: item.indonesian, chunks: item.pinyinSegments.map((segment) => ({ chinese: segment.hanzi, pinyin: segment.pinyin })), kind: item.itemType })),
  dialogue: day.dialogue.map((turn) => ({ role: turn.role, chinese: turn.item.chinese, pinyin: turn.item.pinyinSegments.map((segment) => segment.pinyin).join(' ') })),
}));
const actualCurriculum = { catalog: [], lessons: actualLessons, inventory: { direction: 'INDONESIAN_TO_MANDARIN', courses: 1, days: 30, topics: 0, lessons: actualLessons.length, expressions: actualLessons.reduce((sum, item) => sum + item.expressions.length, 0) } };
const actualFactoryPlan = generateSevenDayPlan(factoryInstructions, actualCurriculum, now);
const actualSalesPlan = generateSevenDayPlan(salesBase, actualCurriculum, now);
assert.equal(actualFactoryPlan.items.length, 7, 'real canonical factory plan must have seven days');
assert.equal(actualSalesPlan.items.length, 7, 'real canonical sales plan must have seven days');
assert.notDeepEqual(actualFactoryPlan.items.map((item) => item.lessonId), actualSalesPlan.items.map((item) => item.lessonId), 'real canonical factory and sales plans must differ');
const actualIds = new Set(actualLessons.flatMap((item) => item.expressions.map((expression) => expression.id)));
for (const item of [...actualFactoryPlan.items, ...actualSalesPlan.items]) assert(item.expressionIds.every((id) => actualIds.has(id)), 'real plan contains a non-canonical expression id');

console.log('Mandarin Coach personalization verification passed: career mapping, 7-day canonical plans, beginner guard, multidimensional mastery, spaced review, NBA, and content-gap safety.');
console.log(`FACTORY_EXAMPLE=${JSON.stringify(actualFactoryPlan.items.map((item) => item.lessonId))}`);
console.log(`SALES_EXAMPLE=${JSON.stringify(actualSalesPlan.items.map((item) => item.lessonId))}`);
