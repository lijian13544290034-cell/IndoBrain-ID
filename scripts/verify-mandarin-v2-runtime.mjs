import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMandarinV2CoachReferences, buildMandarinV2Runtime, mandarinV2FavoriteId } from '../lib/mandarin-v2-runtime.ts';
import { validateMandarinCourseImport } from './validate-mandarin-course-import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mockInventory = {
  knownLessonIds: new Set(['mandarin-work-level-1-day-1']),
  knownExpressionIds: new Set(),
  knownChinese: new Set(),
};

function reviewedPackage(contentType, accessTier = 'FREE') {
  const prefixes = {
    PUBLIC_HIGH_FREQUENCY: ['mandarin-public', 'CN-HF'],
    PRACTICAL_SENTENCE: ['mandarin-practical', 'CN-SENT'],
    CAREER_SCENARIO: ['mandarin-career', 'CN-CAREER'],
  };
  const [coursePrefix, expressionPrefix] = prefixes[contentType];
  return {
    version: 1,
    direction: 'ID_TO_ZH',
    contentType,
    reviewStatus: 'HUMAN_APPROVED',
    reviewReference: `review-${contentType.toLowerCase()}`,
    course: {
      id: `${coursePrefix}-runtime-fixture`,
      titleZh: '结构校验',
      titleId: 'Validasi struktur',
      groupId: 'runtime-fixture',
      scenarioId: 'runtime-fixture',
      accessTier,
      requiresPermission: accessTier === 'LEVEL_2' ? 'mandarin.level2.access' : null,
      pathway: { mode: 'SUPPLEMENTAL', recommendedAfterLessonId: 'mandarin-work-level-1-day-1', prerequisiteLessonIds: [] },
    },
    expressions: [{
      id: `${expressionPrefix}-RUNTIME-01`,
      chinese: `结构校验${expressionPrefix.slice(-2)}`,
      pinyin: 'jié gòu jiào yàn',
      indonesian: 'validasi struktur',
      ttsText: `结构校验${expressionPrefix.slice(-2)}`,
      difficulty: 1,
      tags: ['runtime-fixture'],
    }],
  };
}

const legacyPublicPackage = reviewedPackage('PUBLIC_HIGH_FREQUENCY');
const practicalPackage = reviewedPackage('PRACTICAL_SENTENCE');
const careerPackage = reviewedPackage('CAREER_SCENARIO', 'LEVEL_2');
careerPackage.scenario = {
  occupations: ['Pekerja uji'],
  roles: [{ id: 'worker', titleZh: '员工', titleId: 'Pekerja' }],
  dialogueTurns: [{ id: 'turn-1', roleId: 'worker', expressionId: careerPackage.expressions[0].id }],
  commonQuestionExpressionIds: [careerPackage.expressions[0].id],
  variableExercises: [{ id: 'replace-1', variableLabelId: 'objek', templateExpressionId: careerPackage.expressions[0].id, optionExpressionIds: [careerPackage.expressions[0].id] }],
};

assert.deepEqual(validateMandarinCourseImport(legacyPublicPackage, mockInventory), [], 'C1 PUBLIC_HIGH_FREQUENCY remains valid without new fields');
assert.deepEqual(validateMandarinCourseImport(practicalPackage, mockInventory), [], 'PRACTICAL_SENTENCE is accepted by the compatible V1 contract');
assert.deepEqual(validateMandarinCourseImport(careerPackage, mockInventory), [], 'referential CAREER_SCENARIO structure is accepted');

const brokenScenario = structuredClone(careerPackage);
brokenScenario.scenario.dialogueTurns[0].expressionId = 'CN-CAREER-NOT-IN-PACKAGE';
assert(validateMandarinCourseImport(brokenScenario, mockInventory).some((error) => error.includes('must reference an expression')));

const draft = reviewedPackage('PRACTICAL_SENTENCE');
draft.reviewStatus = 'DRAFT';
const unauthorized = buildMandarinV2Runtime([legacyPublicPackage, practicalPackage, careerPackage, draft], false);
assert.equal(unauthorized.catalog.length, 3, 'only reviewed packages enter the catalog');
assert.equal(unauthorized.courses.length, 2, 'unauthorized payload contains only FREE course bodies');
assert.equal(unauthorized.catalog.find((entry) => entry.id === careerPackage.course.id)?.locked, true, 'Level 2 metadata is locked');
assert.equal(unauthorized.courses.some((course) => course.id === careerPackage.course.id), false, 'Level 2 expressions are never serialized without authorization');
assert(unauthorized.courses.every((course) => course.day === null), 'supplemental courses never allocate Day 61');

const authorized = buildMandarinV2Runtime([legacyPublicPackage, practicalPackage, careerPackage, draft], true);
assert.equal(authorized.courses.length, 3, 'authorized payload exposes reviewed Level 2 content');
assert.equal(buildMandarinV2CoachReferences(unauthorized).length, 2, 'AI Coach references only content present in the authorized runtime payload');
assert.equal(mandarinV2FavoriteId(practicalPackage.expressions[0].id), `mandarin-v2:${practicalPackage.expressions[0].id}`, 'V2 favorites use a separate stable namespace');

const reviewedRegistry = fs.readFileSync(path.join(root, 'lib/server/mandarin-v2-reviewed-packages.ts'), 'utf8');
assert.match(reviewedRegistry, /mandarinV2ReviewedPackages:[^=]+\[\]/s, 'reviewed registry remains empty in RC2-C2');
for (const file of ['components/MandarinLearningHome.tsx', 'components/MandarinLearningNavigation.tsx']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /mandarin-v2|MandarinV2/u, `${file} does not activate V2 content`);
}

console.log('MANDARIN V2 RUNTIME: PASS (compatible types, empty registry, server-gated Level 2 body, no Day 61, no navigation activation)');
