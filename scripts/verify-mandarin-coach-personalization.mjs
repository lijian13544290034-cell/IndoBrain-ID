import assert from 'node:assert/strict';
import {
  applyMasteryEvidence,
  createDefaultLearnerProfile,
  createPersonalizationState,
  generateSevenDayPlan,
  mapCareerGoal,
  selectNextBestAction,
  updateProfileFromEvidence,
} from '../lib/mandarin-coach-personalization.ts';
import { mandarinWorkDays } from '../lib/mandarin-work-course.ts';

const lesson = (day, title, scenario, words = []) => ({
  id: `lesson-${day}`,
  source: day > 30 ? 'MANDARIN_WORK_LEVEL_2' : 'MANDARIN_WORK_LEVEL_1',
  courseTitle: '工作中文', courseTitleId: 'Mandarin untuk Kerja', group: day > 30 ? 'Level 2' : 'Level 1', day, title, scenario,
  expressions: (words.length ? words : [`表达${day}`]).map((chinese, index) => ({ id: `L${day}-E${index + 1}`, chinese, pinyin: 'test', indonesian: `${scenario} ${index + 1}`, chunks: [], kind: 'CORE' })),
  dialogue: [],
});

const lessons = Array.from({ length: 60 }, (_, index) => {
  const day = index + 1;
  if (day === 10) return lesson(day, '拿、给、放、找', 'factory instruction', ['拿这个', '放这里']);
  if (day === 15) return lesson(day, '工作进度', 'factory progress', ['正在做', '还没']);
  if (day === 23) return lesson(day, '仓库物流', 'warehouse logistics', ['库存多少', '今天发货']);
  if (day === 25) return lesson(day, '办公室', 'office communication', ['文件给我', '发给我']);
  if (day === 26) return lesson(day, '采购', 'sales price supplier', ['多少钱', '报价呢']);
  if (day === 46) return lesson(day, '工作进度', 'report progress', ['做到哪里了', '快做完了']);
  if (day === 59) return lesson(day, '工地安全', 'construction safety', ['戴安全帽', '这里危险']);
  return lesson(day, `Day ${day}`, day <= 14 ? 'basic communication' : 'general work');
});
const curriculum = { catalog: [], lessons, inventory: { direction: 'INDONESIAN_TO_MANDARIN', courses: 2, days: 60, topics: 0, lessons: 60, expressions: lessons.reduce((sum, item) => sum + item.expressions.length, 0) } };

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
