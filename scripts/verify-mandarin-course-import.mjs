import assert from 'node:assert/strict';
import { loadMandarinCourseInventory } from './lib/mandarin-course-inventory.mjs';
import { validateMandarinCourseImport } from './validate-mandarin-course-import.mjs';

const inventory = loadMandarinCourseInventory();

assert.equal(inventory.counts.levelOneDays, 30, 'Level 1 must retain Day 1–30');
assert.equal(inventory.counts.levelTwoDays, 30, 'Level 2 must retain Day 31–60');
assert.equal(inventory.counts.dayLessons, 60, 'Day 1–60 numbering must remain intact');

const candidate = {
  version: 1,
  direction: 'ID_TO_ZH',
  contentType: 'PUBLIC_HIGH_FREQUENCY',
  reviewStatus: 'HUMAN_APPROVED',
  reviewReference: 'human-review-ticket-001',
  course: {
    id: 'mandarin-public-sample-reviewed-package',
    titleZh: '审核样例',
    titleId: 'Contoh paket yang sudah ditinjau',
    groupId: 'public-high-frequency',
    scenarioId: 'sample-only',
    accessTier: 'FREE',
    requiresPermission: null,
    pathway: {
      mode: 'SUPPLEMENTAL',
      recommendedAfterLessonId: 'mandarin-work-level-1-day-1',
      prerequisiteLessonIds: ['mandarin-work-level-1-day-1'],
    },
  },
  expressions: [{
    id: 'CN-HF-REVIEWED-SAMPLE-01',
    chinese: '测试校验短语',
    pinyin: 'cè shì jiào yàn duǎn yǔ',
    indonesian: 'frasa contoh untuk validasi',
    ttsText: '测试校验短语',
    difficulty: 1,
    tags: ['validation-only'],
  }],
};

assert.deepEqual(validateMandarinCourseImport(candidate, inventory), [], 'valid reviewed supplemental package should pass');

const duplicateChinese = structuredClone(candidate);
duplicateChinese.expressions[0].chinese = inventory.allKnownExpressions[0].chinese;
duplicateChinese.expressions[0].ttsText = duplicateChinese.expressions[0].chinese;
assert(validateMandarinCourseImport(duplicateChinese, inventory).some((error) => error.includes('duplicates existing canonical')));

const invalidLevelTwo = structuredClone(candidate);
invalidLevelTwo.contentType = 'CAREER_SCENARIO';
invalidLevelTwo.course.id = 'mandarin-career-sample-reviewed-package';
invalidLevelTwo.course.accessTier = 'LEVEL_2';
invalidLevelTwo.course.requiresPermission = null;
invalidLevelTwo.expressions[0].id = 'CN-CAREER-REVIEWED-SAMPLE-01';
assert(validateMandarinCourseImport(invalidLevelTwo, inventory).some((error) => error.includes('mandarin.level2.access')));

const renumbered = structuredClone(candidate);
renumbered.course.dayNumber = 61;
assert(validateMandarinCourseImport(renumbered, inventory).some((error) => error.includes('must not allocate or renumber')));

const notReviewed = structuredClone(candidate);
notReviewed.reviewStatus = 'DRAFT';
assert(validateMandarinCourseImport(notReviewed, inventory).some((error) => error.includes('HUMAN_APPROVED')));

const numberedPinyin = structuredClone(candidate);
numberedPinyin.expressions[0].pinyin = 'ce4 shi4';
assert(validateMandarinCourseImport(numberedPinyin, inventory).some((error) => error.includes('tone-marked')));

console.log('MANDARIN COURSE IMPORT VERIFICATION: PASS');
console.log(JSON.stringify(inventory.counts, null, 2));
