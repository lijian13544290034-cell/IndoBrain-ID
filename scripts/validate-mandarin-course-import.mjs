import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMandarinCourseInventory, normalizeMandarinChinese } from './lib/mandarin-course-inventory.mjs';

const toneMarks = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u;
const hanzi = /[\u3400-\u9FFF]/u;
const idRules = {
  PUBLIC_HIGH_FREQUENCY: /^CN-HF-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  PRACTICAL_SENTENCE: /^CN-SENT-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  CAREER_SCENARIO: /^CN-CAREER-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
};
const courseIdRules = {
  PUBLIC_HIGH_FREQUENCY: /^mandarin-public-[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PRACTICAL_SENTENCE: /^mandarin-practical-[a-z0-9]+(?:-[a-z0-9]+)*$/,
  CAREER_SCENARIO: /^mandarin-career-[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

export function validateMandarinCourseImport(candidate, inventory = loadMandarinCourseInventory()) {
  const errors = [];
  const add = (pathValue, message) => errors.push(`${pathValue}: ${message}`);
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return ['root: must be an object'];
  if (candidate.version !== 1) add('version', 'must equal 1');
  if (candidate.direction !== 'ID_TO_ZH') add('direction', 'must equal ID_TO_ZH');
  if (!['PUBLIC_HIGH_FREQUENCY', 'PRACTICAL_SENTENCE', 'CAREER_SCENARIO'].includes(candidate.contentType)) add('contentType', 'must be PUBLIC_HIGH_FREQUENCY, PRACTICAL_SENTENCE, or CAREER_SCENARIO');
  if (candidate.reviewStatus !== 'HUMAN_APPROVED') add('reviewStatus', 'must be HUMAN_APPROVED before import');
  if (typeof candidate.reviewReference !== 'string' || !candidate.reviewReference.trim()) add('reviewReference', 'is required');

  const course = candidate.course;
  if (!course || typeof course !== 'object' || Array.isArray(course)) {
    add('course', 'must be an object');
  } else {
    const coursePattern = courseIdRules[candidate.contentType];
    if (!coursePattern || typeof course.id !== 'string' || !coursePattern.test(course.id)) add('course.id', `must match ${coursePattern ?? 'the selected content type'}`);
    if (inventory.knownLessonIds.has(course.id)) add('course.id', 'duplicates an existing lesson ID');
    for (const field of ['titleZh', 'titleId', 'groupId', 'scenarioId']) if (typeof course[field] !== 'string' || !course[field].trim()) add(`course.${field}`, 'is required');
    if (candidate.contentType === 'PUBLIC_HIGH_FREQUENCY' && course.accessTier !== 'FREE') add('course.accessTier', 'PUBLIC_HIGH_FREQUENCY must remain FREE');
    if (!['FREE', 'LEVEL_2'].includes(course.accessTier)) add('course.accessTier', 'must be FREE or LEVEL_2');
    if (course.accessTier === 'LEVEL_2' && course.requiresPermission !== 'mandarin.level2.access') add('course.requiresPermission', 'LEVEL_2 must require mandarin.level2.access');
    if (course.accessTier === 'FREE' && course.requiresPermission !== null) add('course.requiresPermission', 'FREE content must use null');
    if ('day' in course || 'dayNumber' in course) add('course', 'supplemental content must not allocate or renumber Day 1–60');
    if (course.pathway?.mode !== 'SUPPLEMENTAL') add('course.pathway.mode', 'must equal SUPPLEMENTAL');
    const recommended = course.pathway?.recommendedAfterLessonId;
    if (recommended !== null && (typeof recommended !== 'string' || !inventory.knownLessonIds.has(recommended))) add('course.pathway.recommendedAfterLessonId', 'must be null or an existing lesson ID');
    if (!Array.isArray(course.pathway?.prerequisiteLessonIds)) add('course.pathway.prerequisiteLessonIds', 'must be an array');
    else for (const [index, id] of course.pathway.prerequisiteLessonIds.entries()) if (!inventory.knownLessonIds.has(id)) add(`course.pathway.prerequisiteLessonIds[${index}]`, 'must reference an existing lesson ID');
  }

  if (!Array.isArray(candidate.expressions) || candidate.expressions.length === 0) {
    add('expressions', 'must contain at least one reviewed expression');
  } else {
    const ids = new Set();
    const chineseValues = new Set();
    const idPattern = idRules[candidate.contentType];
    for (const [index, expression] of candidate.expressions.entries()) {
      const prefix = `expressions[${index}]`;
      if (!expression || typeof expression !== 'object' || Array.isArray(expression)) { add(prefix, 'must be an object'); continue; }
      if (!idPattern?.test(expression.id ?? '')) add(`${prefix}.id`, `must match ${idPattern ?? 'the selected content type'}`);
      if (ids.has(expression.id)) add(`${prefix}.id`, 'is duplicated inside this package');
      if (inventory.knownExpressionIds.has(expression.id)) add(`${prefix}.id`, 'duplicates an existing expression ID');
      ids.add(expression.id);
      const normalized = normalizeMandarinChinese(expression.chinese);
      if (!normalized || !hanzi.test(normalized)) add(`${prefix}.chinese`, 'must contain Chinese Hanzi');
      if (chineseValues.has(normalized)) add(`${prefix}.chinese`, 'is duplicated inside this package');
      if (inventory.knownChinese.has(normalized)) add(`${prefix}.chinese`, 'duplicates existing canonical learning content; reference the existing ID instead');
      chineseValues.add(normalized);
      if (typeof expression.pinyin !== 'string' || !toneMarks.test(expression.pinyin) || /\d/u.test(expression.pinyin)) add(`${prefix}.pinyin`, 'must use tone-marked Hanyu Pinyin without tone numbers');
      if (typeof expression.indonesian !== 'string' || !expression.indonesian.trim()) add(`${prefix}.indonesian`, 'is required');
      if (expression.ttsText !== expression.chinese) add(`${prefix}.ttsText`, 'must exactly match Chinese text for the existing zh-CN TTS path');
      if (![1, 2, 3].includes(expression.difficulty)) add(`${prefix}.difficulty`, 'must be 1, 2, or 3');
      if (!Array.isArray(expression.tags) || expression.tags.length === 0 || expression.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) add(`${prefix}.tags`, 'must contain non-empty string tags');
    }
  }

  if (candidate.scenario != null) {
    if (candidate.contentType !== 'CAREER_SCENARIO') add('scenario', 'is only allowed for CAREER_SCENARIO');
    validateScenario(candidate.scenario, candidate.expressions, add);
  }
  return errors;
}

function validateScenario(scenario, expressions, add) {
  if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)) { add('scenario', 'must be an object'); return; }
  const expressionIds = new Set(Array.isArray(expressions) ? expressions.map((item) => item?.id).filter(Boolean) : []);
  if (!Array.isArray(scenario.occupations) || scenario.occupations.length === 0 || scenario.occupations.some((item) => typeof item !== 'string' || !item.trim())) add('scenario.occupations', 'must contain non-empty occupation labels');
  if (!Array.isArray(scenario.roles) || scenario.roles.length === 0) add('scenario.roles', 'must contain at least one role');
  const roleIds = new Set();
  for (const [index, role] of (Array.isArray(scenario.roles) ? scenario.roles : []).entries()) {
    if (!role || typeof role !== 'object') { add(`scenario.roles[${index}]`, 'must be an object'); continue; }
    if (typeof role.id !== 'string' || !role.id.trim() || roleIds.has(role.id)) add(`scenario.roles[${index}].id`, 'must be a unique non-empty ID');
    roleIds.add(role.id);
    for (const field of ['titleZh', 'titleId']) if (typeof role[field] !== 'string' || !role[field].trim()) add(`scenario.roles[${index}].${field}`, 'is required');
  }
  const referencedExpressions = (values, pathValue) => {
    if (!Array.isArray(values)) { add(pathValue, 'must be an array'); return; }
    for (const [index, id] of values.entries()) if (!expressionIds.has(id)) add(`${pathValue}[${index}]`, 'must reference an expression in this reviewed package');
  };
  if (!Array.isArray(scenario.dialogueTurns) || scenario.dialogueTurns.length === 0) add('scenario.dialogueTurns', 'must contain at least one turn');
  const turnIds = new Set();
  for (const [index, turn] of (Array.isArray(scenario.dialogueTurns) ? scenario.dialogueTurns : []).entries()) {
    if (!turn || typeof turn !== 'object') { add(`scenario.dialogueTurns[${index}]`, 'must be an object'); continue; }
    if (typeof turn.id !== 'string' || !turn.id.trim() || turnIds.has(turn.id)) add(`scenario.dialogueTurns[${index}].id`, 'must be a unique non-empty ID');
    turnIds.add(turn.id);
    if (!roleIds.has(turn.roleId)) add(`scenario.dialogueTurns[${index}].roleId`, 'must reference a scenario role');
    if (!expressionIds.has(turn.expressionId)) add(`scenario.dialogueTurns[${index}].expressionId`, 'must reference an expression in this reviewed package');
  }
  referencedExpressions(scenario.commonQuestionExpressionIds, 'scenario.commonQuestionExpressionIds');
  if (!Array.isArray(scenario.variableExercises)) add('scenario.variableExercises', 'must be an array');
  for (const [index, exercise] of (Array.isArray(scenario.variableExercises) ? scenario.variableExercises : []).entries()) {
    if (!exercise || typeof exercise !== 'object') { add(`scenario.variableExercises[${index}]`, 'must be an object'); continue; }
    if (typeof exercise.id !== 'string' || !exercise.id.trim()) add(`scenario.variableExercises[${index}].id`, 'is required');
    if (typeof exercise.variableLabelId !== 'string' || !exercise.variableLabelId.trim()) add(`scenario.variableExercises[${index}].variableLabelId`, 'is required');
    if (!expressionIds.has(exercise.templateExpressionId)) add(`scenario.variableExercises[${index}].templateExpressionId`, 'must reference an expression in this reviewed package');
    referencedExpressions(exercise.optionExpressionIds, `scenario.variableExercises[${index}].optionExpressionIds`);
  }
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node scripts/validate-mandarin-course-import.mjs <reviewed-course.json>');
    process.exit(2);
  }
  const inputPath = path.resolve(process.cwd(), input);
  let candidate;
  try { candidate = JSON.parse(fs.readFileSync(inputPath, 'utf8')); }
  catch (error) { console.error(`IMPORT VALIDATION: FAIL\n- ${error instanceof Error ? error.message : String(error)}`); process.exit(1); }
  const errors = validateMandarinCourseImport(candidate);
  if (errors.length) {
    console.error(`IMPORT VALIDATION: FAIL (${errors.length})`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('IMPORT VALIDATION: PASS (structure only; no course data was imported)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
