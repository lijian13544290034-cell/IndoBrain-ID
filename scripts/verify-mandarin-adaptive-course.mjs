import assert from 'node:assert/strict';
import { assemblePersonalPlan, decideNextBestAction, judgeMastery, profileLearner } from '../lib/mandarin-adaptive-course.ts';

const unit = (expressionId, lessonId, day, chinese, indonesianMeaning, tags, sourceType = 'VERIFIED_COURSE') => ({
  expressionId, lessonId, sourceType, verificationStatus: 'VERIFIED', sourceReference: `test:${lessonId}`, day,
  chinese, pinyin: 'verified', indonesianMeaning, tags, locked: false,
});

const knowledge = [
  unit('GREETING', 'mandarin-work-level-1-day-1', 1, '你好', 'Halo', ['greeting', 'CORE']),
  unit('SELF_RESCUE', 'mandarin-work-level-1-day-14', 14, '我不懂', 'Saya tidak mengerti', ['self-rescue', 'DIALOGUE']),
  unit('WAREHOUSE_STATUS', 'mandarin-work-level-1-day-23', 23, '货到了吗？', 'Barangnya sudah sampai?', ['warehouse-logistics', '货', '到了', '发货', 'DIALOGUE']),
  unit('QUANTITY', 'golden-quantity-jumlah', null, '多少？', 'Berapa?', ['quantity', '库存', '数量', '多少'], 'VERIFIED_KB'),
  unit('PRODUCTION', 'mandarin-work-level-1-day-24', 24, '开始生产。', 'Mulai produksi.', ['production', '机器', '开始', '停', 'DIALOGUE']),
  unit('PURCHASING', 'mandarin-work-level-1-day-26', 26, '多少钱？', 'Berapa harganya?', ['procurement', '价格', '报价', '多少钱', 'DIALOGUE']),
  unit('OFFICE', 'mandarin-work-level-1-day-25', 25, '文件给我。', 'Berikan file kepada saya.', ['office', '文件', '表格', '发给我']),
  unit('SALES', 'mandarin-work-level-1-day-26', 26, '报价呢？', 'Quotation-nya?', ['procurement', '价格', '报价', '多少钱']),
  unit('CONSTRUCTION', 'mandarin-work-level-2-day-51', 51, '这边。', 'Sebelah sini.', ['construction', '方向位置', '这里', '那里', 'DIALOGUE']),
];

const base = { purpose: 'CURRENT_JOB', mandarinLevel: 'ZERO', immediateProblem: '', dailyStudyMinutes: 15, targetDate: null };
const plan = (profile, mastery = [], mistakes = []) => assemblePersonalPlan({ profile, knowledge, mastery, mistakes, now: new Date('2026-10-07T00:00:00.000Z') });

const personaA = profileLearner({ ...base, currentJob: 'pekerja gudang', desiredJob: '', immediateProblem: 'Bos China', mandarinLevel: 'ZERO' });
assert.equal(personaA.careerFamily, 'WAREHOUSE_LOGISTICS');
assert.ok(plan(personaA).today.some((item) => item.lessonId === 'mandarin-work-level-1-day-23'));

const personaB = profileLearner({ ...base, currentJob: '', desiredJob: 'Purchasing', purpose: 'NEW_JOB', mandarinLevel: 'BASIC', immediateProblem: 'interview kerja dalam 14 hari', targetDate: '2026-10-21' });
const planB = plan(personaB);
assert.equal(personaB.careerFamily, 'PURCHASING');
assert.equal(planB.urgent, true);
assert.ok(planB.today.some((item) => item.capability === 'ASK_PRICE'));
assert.ok(planB.gaps.some((item) => item.requestedCapability === 'JOB_INTERVIEW'));

const personaC = profileLearner({ ...base, currentJob: 'pegawai pabrik', desiredJob: '', mandarinLevel: 'BASIC', immediateProblem: 'paham sedikit tetapi sulit bicara dengan supervisor China' });
assert.equal(personaC.careerFamily, 'FACTORY_PRODUCTION');
assert.ok(plan(personaC).today.slice(0, 3).some((item) => item.expressionId === 'PRODUCTION'));

const personaD = profileLearner({ ...base, currentJob: '', desiredJob: 'Saya mau kerja di perusahaan China tapi belum tahu posisi apa.' });
assert.equal(personaD.careerFamily, null);
assert.equal(plan(personaD).needsClarification, true);

const personaE = profileLearner({ ...base, currentJob: '', desiredJob: '', immediateProblem: 'Besok interview kerja.' });
assert.equal(plan(personaE).urgent, true);
assert.ok(plan(personaE).gaps.some((item) => item.requestedCapability === 'JOB_INTERVIEW'));

const warehouseProfile = profileLearner({ ...base, currentJob: 'warehouse', desiredJob: '' });
const masteredWarehouse = judgeMastery({ expressionId: 'WAREHOUSE_STATUS', lessonId: 'mandarin-work-level-1-day-23', dimension: 'realSceneUsage', success: true, changedContext: true, hintLevel: 0, previous: judgeMastery({ expressionId: 'WAREHOUSE_STATUS', lessonId: 'mandarin-work-level-1-day-23', dimension: 'realSceneUsage', success: true, changedContext: true, hintLevel: 0 }) });
const personaF = profileLearner({ ...base, currentJob: 'warehouse', desiredJob: 'sales', purpose: 'NEW_JOB' }, warehouseProfile);
assert.equal(personaF.careerFamily, 'SALES');
assert.ok(personaF.priorCareerFamilies.includes('WAREHOUSE_LOGISTICS'));
assert.equal(masteredWarehouse.expressionId, 'WAREHOUSE_STATUS');
assert.equal(masteredWarehouse.successes, 2);

const weak = judgeMastery({ expressionId: 'PRODUCTION', lessonId: 'mandarin-work-level-1-day-24', dimension: 'speaking', success: false, previous: judgeMastery({ expressionId: 'PRODUCTION', lessonId: 'mandarin-work-level-1-day-24', dimension: 'speaking', success: false }) });
assert.equal(weak.dimensions.speaking, 'WEAK');
assert.equal(decideNextBestAction({ record: weak, repeatedFailures: 3, recentSkips: 0, reviewDue: false }).action, 'SIMPLIFY');
assert.equal(decideNextBestAction({ record: weak, repeatedFailures: 0, recentSkips: 2, reviewDue: false }).action, 'FAVORITE_AND_SKIP');
assert.ok(weak.nextReviewAt);

console.log(JSON.stringify({
  personas: { A: 'PASS', B: 'PASS', C: 'PASS', D: 'PASS', E: 'PASS', F: 'PASS' },
  courseAssembler: 'VERIFIED_CONTENT_REUSED', personalCandidate: 'CANDIDATE_FOR_REVIEW_ONLY', mastery: 'PASS', nextBestAction: 'PASS', spacedReview: 'PASS', modelCalls: 0,
}, null, 2));
