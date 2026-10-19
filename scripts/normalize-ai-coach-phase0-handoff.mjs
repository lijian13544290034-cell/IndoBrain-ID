import fs from 'node:fs';
import path from 'node:path';
import { loadMandarinCourseInventory, normalizeMandarinChinese } from './lib/mandarin-course-inventory.mjs';

const root = process.cwd();
const docs = path.join(root, 'docs', 'ai-coach-phase0');
const sourcePath = path.join(docs, 'handoff-v1', 'received', 'original', 'WB', 'data', 'ai-coach-cases-100.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const inventory = loadMandarinCourseInventory(root);

const skills = [
  ['S01', 'Student Diagnosis', '学习者诊断', '在不超过 3 分钟内建立可驱动教学决策的最小画像：不是“测水平”，而是“测他明天能不能用上”。', 714, 717],
  ['S02', 'Micro Speaking', '微口语输出', '让用户在单轮 30 秒内产出一句真实可用的目标语，且该产出不是跟读。核心不是“说得多”，而是“这一句他现在就能对真人说”。', 127, 130],
  ['S03', 'Scaffolding', '支架', '用户卡住时，用最小必要帮助把他推到“自己说出来”，而不是替他说话。支架的价值在于被撤除；无法撤除的支架是失败的支架。', 217, 220],
  ['S04', 'Adaptive Difficulty', '自适应难度', '把难度稳定维持在“跳一跳够得着”的区间：太简单则无聊且不产生习得，太难则挫败且不产生输出。难度调节的颗粒度是“一次一个信息点”，不是“整课升降级”。', 320, 323],
  ['S05', 'Corrective Feedback', '纠错反馈', '在不打断表达意愿的前提下，让用户注意到错误并立即再试一次。纠错的目标是“改一次”，不是“讲明白为什么”。', 414, 417],
  ['S06', 'Guided Roleplay', '引导式角色扮演', '让用户在多轮、有变化的对话中维持输出，处理“对方不按剧本说话”的情况。这是从“会说一句”到“能对话”的关键一步。', 801, 804],
  ['S07', 'Independent Recall', '独立提取', '在无提示、无原文、不同语境下，用户能自己把表达调出来并做变式。这是“掌握”的唯一判定口径。', 523, 526],
  ['S08', 'Error Recovery', '错误恢复 / 挫败恢复', '在用户连续失败、即将放弃时，把局面从“我学不会”翻转成“我只是这一步没准备好”，并给出一条能立刻成功的路径。', 618, 621],
  ['S09', 'Spaced Review', '间隔复习', '用最少的总复习时间对抗遗忘，并让复习以“提取”形式发生（而非重看）。', 889, 892],
  ['S10', 'Confidence Building', '信心建立', '让用户在“我能不能说”这件事上持续向前，而不是在每次错误后倒退。信心不是鼓励出来的，是由可归因的成功体验堆出来的。', 965, 968],
  ['S11', 'Task Assessment', '任务评估', '回答一个问题：“这次他能不能真的用出去？”评估的对象是任务完成度，不是语言正确度。', 1052, 1055],
  ['S12', 'Learning Reflection', '学习反思', '让学习者自己说出“我学会了什么、还差什么、下次怎么办”。目标不是复盘内容，是建立自我监控能力。', 1144, 1147],
].map(([skillId, englishName, chineseName, definition, startLine, endLine]) => ({
  skillId, englishName, chineseName, definition,
  sourceId: 'WBA-SKILLS-S01-S12',
  sourceLocator: `received/original/WA/1-IndoBrain-AI-Teaching-Skills-V1.md:${startLine}-${endLine}`,
  extractionStatus: 'EXTRACTED_PENDING_HUMAN_REVIEW',
  notes: skillId === 'S07' ? ['原文中“掌握”的绝对表述与现有五维掌握度存在潜在冲突，待人工裁决。'] : [],
}));

const skillKeywords = {
  S01: ['DIAGNOSES_', 'ASKS_ONE_CLARIFICATION', 'FLAGS_LANGUAGE_AMBIGUITY', 'CONFIRMS_MEANING_FIRST'],
  S02: ['INVITES_SPEAKING', 'REQUIRES_PRODUCTION', 'GIVES_MINIMAL_TASK', 'ALLOWS_PARTIAL_PRODUCTION', 'MINIMAL_ANSWER_TARGET'],
  S03: ['SCAFFOLD', 'REDUCES_PROMPT', 'SUPPLIES_MISSING_WORD_FIRST', 'WORD_LEVEL_RETRY', 'SINGLE_SYLLABLE_DRILL'],
  S04: ['DIFFICULTY', 'SCOPE_REDUCTION', 'MAX_NEW_ITEMS', 'TWO_ITEMS_MAX', 'SINGLE_VARIABLE_CHANGE', 'DEFERS_REMAINING'],
  S05: ['CORRECT', 'PRESERVES_CORRECT_PART', 'LOCATES_MINIMAL_PAIR', 'ONE_CONTRAST_ONLY', 'NAMES_SEMANTIC_GAP', 'NAMES_FIXED_EXPRESSION', 'NAMES_NEUTRAL_TONE'],
  S06: ['ROLEPLAY', 'REQUIRES_TWO_STEP_TASK', 'FRAMES_AS_DIALOGUE_MOVE', 'TURN_TAKING'],
  S07: ['NOT_PASS_ON_ECHO', 'HAS_TRANSFER_PROBE', 'REQUIRES_INITIATION', 'REUSES_KNOWN_ACTIONS', 'SAME_STRUCTURE_EXTENSION'],
  S08: ['STRATEGY_CHANGED', 'OFFERS_EXIT', 'VALIDATES_FEELING', 'ADDRESSES_ANXIETY', 'NO_ABILITY_ATTRIBUTION', 'OFFERS_NON_VOICE_PATH', 'OFFERS_TEXT_FALLBACK'],
  S09: ['WRITES_REVIEW', 'NO_NEEDS_REVIEW'],
  S10: ['POSITIVE_FRAMING', 'AFFIRM_', 'NO_NEGATIVE_EVAL', 'NO_SCOLDING', 'NO_VAGUE_APPROVAL', 'CONFIRMS_SPECIFIC_PROGRESS'],
  S11: ['CONFIRMS_COMPLETION', 'CONFIRMS_CORRECTNESS', 'ASR_ERROR_NOT_PRON_ERROR', 'NO_EVIDENCE_WRITE', 'NAMES_CONSEQUENCE'],
  S12: ['GIVES_SPECIFIC_SUMMARY', 'AFFIRMS_SELF_MONITORING', 'GIVES_RESUME_POINT'],
};

const machineRules = new Set(['CONTAINS_TARGET', 'HAS_PINYIN', 'MAX_NEW_ITEMS', 'MAX_TWO_CONNECTORS', 'TWO_EXAMPLES_MAX', 'TWO_ITEMS_MAX', 'REFUSAL_MAX_ONE_SENTENCE', 'PRIVACY_NOTE_MAX_ONE_SENTENCE', 'FACT_ANSWER_MAX_ONE_SENTENCE', 'NO_EVIDENCE_WRITE', 'SETS_TTS_SLOW']);
const p0Rules = {
  ASR_ERROR_NOT_PRON_ERROR: ['P0-1'],
  NO_GROUP_GENERALIZATION: ['P0-2'],
  REFUSES_HARMFUL_CONTENT: ['P0-3'],
  NO_ABILITY_ATTRIBUTION: ['P0-5'],
};

function dimensionsFor(rule) {
  const out = new Set();
  if (/(CORRECT|FORM|PAIR|SEMANTIC|PRAGMATIC|REDUNDANCY|WORD_ORDER|TONE)/.test(rule)) out.add('CQ');
  if (/(DIFFICULTY|SCAFFOLD|PROMPT|MAX_|TWO_|SINGLE_|CHUNK|SCOPE|DEFERS|WORD_LEVEL)/.test(rule)) out.add('DA');
  if (/(LECTURE|SENTENCE|IRRELEVANT|NEW_CONTENT|NEW_LEXIS|PREACHING)/.test(rule)) out.add('BR');
  if (/(PRODUCTION|SPEAKING|TRANSFER|INITIATION|ROLEPLAY|REUSES|ECHO)/.test(rule)) out.add('IP');
  if (/(COMPLETION|REVIEW|RESUME|EXIT|SUMMARY|RETURNS_TO_TARGET)/.test(rule)) out.add('TC');
  if (!out.size || /(DIAGNOSES|CLARIFICATION|REFUSES|REDIRECT|CONTEXT|STRATEGY|ANXIETY|VALIDATES)/.test(rule)) out.add('TA');
  return [...out];
}

function skillsFor(rule) {
  return Object.entries(skillKeywords)
    .filter(([, terms]) => terms.some((term) => rule.includes(term)))
    .map(([id]) => id);
}

const distinctRules = [...new Set(source.cases.flatMap((item) => item.assertions.map((assertion) => assertion.rule)))].sort();
const ruleMap = distinctRules.map((rule) => {
  const automation = machineRules.has(rule) ? 'MACHINE' : (/(MAX_|TWO_|SINGLE_|CONTAINS|HAS_|SETS_|NO_EVIDENCE)/.test(rule) ? 'HYBRID' : 'HUMAN_REQUIRED');
  return {
    rule,
    tisDimensions: dimensionsFor(rule),
    p0Assertions: p0Rules[rule] ?? [],
    automation,
    skillIds: skillsFor(rule),
    mappingReviewStatus: 'PENDING_HUMAN_REVIEW',
  };
});
const ruleByName = new Map(ruleMap.map((entry) => [entry.rule, entry]));

function classify(item) {
  const rules = item.assertions.map((assertion) => assertion.rule);
  if (item.input_mode === 'VOICE' || item.learner_behavior === 'ASR_FAILURE' || rules.some((rule) => /ASR|TTS|NON_VOICE|TEXT_FALLBACK/.test(rule))) return ['VOICE_RELIABILITY', 'input_mode/behavior/assertion indicates the voice reliability path'];
  if (rules.some((rule) => /(CORRECT_FORM|MINIMAL_PAIR|SEMANTIC_GAP|FIXED_EXPRESSION|NEUTRAL_TONE|WORD_ORDER|PINYIN|USAGE_CONTEXT|REDUNDANCY)/.test(rule))) return ['COURSE_CONTENT', 'assertions require linguistic or course-content correctness'];
  return ['TEACHING_STRATEGY', 'primary assertions concern teaching action or interaction strategy'];
}

function evaluationMode(assertions) {
  const modes = new Set(assertions.map((assertion) => ruleByName.get(assertion.rule)?.automation));
  if ([...modes].every((mode) => mode === 'MACHINE')) return 'MACHINE';
  if ([...modes].every((mode) => mode === 'HUMAN_REQUIRED')) return 'HUMAN';
  return 'BOTH';
}

function referencedDays(ref) {
  const days = [];
  for (const match of ref.matchAll(/(?:#D|#day|\+\s*D)(\d{1,2})/gi)) days.push(Number(match[1]));
  return [...new Set(days)];
}

function validateReference(item) {
  const ref = item.curriculum_ref;
  const target = item.target_content ?? {};
  const targetText = item.learning_direction === 'ID_TO_ZH' ? target.chinese : target.indonesian;
  const normalizedTarget = item.learning_direction === 'ID_TO_ZH' ? normalizeMandarinChinese(targetText) : String(targetText ?? '').trim().toLocaleLowerCase('id-ID').replace(/[.!?,\s]+/g, ' ');
  const days = referencedDays(ref);
  const contentSource = /mandarin-work-course|mandarin-work-level2/.test(ref);

  if (item.learning_direction === 'ZH_TO_ID') {
    if (/driver-experiences/.test(ref)) {
      const expId = ref.match(/EXP-DRV-\d{3}/)?.[0] ?? null;
      const driverSource = fs.readFileSync(path.join(root, 'lib', 'driver-experiences.ts'), 'utf8').toLocaleLowerCase('id-ID');
      const exactLiteral = targetText && driverSource.includes(`'${String(targetText).replaceAll("'", "\\'").toLocaleLowerCase('id-ID')}'`);
      return { status: exactLiteral ? 'EXACT_SOURCE_LITERAL' : 'CONFLICT_TARGET_NOT_EXACT', referenceType: 'COURSE_OR_SCENE', referencedDays: [], matchedExpressionIds: [], evidence: expId ? `${expId}; exact rendered target literal ${exactLiteral ? 'found' : 'not found'} in referenced source` : 'No EXP id' };
    }
    if (contentSource) return { status: 'DIRECTION_MISMATCH', referenceType: 'COURSE', referencedDays: days, matchedExpressionIds: [], evidence: 'ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source.' };
    return { status: 'TECHNICAL_REFERENCE_ONLY', referenceType: 'CODE', referencedDays: days, matchedExpressionIds: [], evidence: 'Reference is implementation code, not an authoritative Indonesian course-content record.' };
  }

  if (contentSource && days.length) {
    const sourceKind = /mandarin-work-level2/.test(ref) ? 'MANDARIN_WORK_LEVEL_2' : 'MANDARIN_WORK_LEVEL_1';
    const invalidSourceDays = days.filter((day) => sourceKind === 'MANDARIN_WORK_LEVEL_1' ? day > 30 : day < 31);
    if (invalidSourceDays.length) {
      return { status: 'CONFLICT_REFERENCE_SOURCE_DAY', referenceType: 'COURSE', referencedDays: days, matchedExpressionIds: [], evidence: `Referenced day(s) ${invalidSourceDays.join(', ')} do not belong to the named course source.` };
    }
    const matches = inventory.allKnownExpressions.filter((expression) => expression.source === sourceKind && days.includes(expression.day) && normalizeMandarinChinese(expression.chinese) === normalizedTarget);
    return { status: matches.length ? 'EXACT_IN_REFERENCED_DAY' : 'CONFLICT_TARGET_NOT_EXACT', referenceType: 'COURSE', referencedDays: days, matchedExpressionIds: matches.map((match) => match.id), evidence: matches.length ? 'Full normalized Chinese target exactly matches an expression in a referenced day.' : 'No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted.' };
  }
  return { status: 'TECHNICAL_REFERENCE_ONLY', referenceType: 'CODE', referencedDays: days, matchedExpressionIds: [], evidence: 'Reference is implementation code or a non-course specification; content existence is not inferred from it.' };
}

const normalizedCases = source.cases.map((item, index) => {
  const [category, classificationBasis] = classify(item);
  const mappings = item.assertions.map((assertion) => ruleByName.get(assertion.rule));
  const skillIds = [...new Set(mappings.flatMap((mapping) => mapping?.skillIds ?? []))].sort();
  const unmappedRuleNames = item.assertions.filter((assertion) => !(ruleByName.get(assertion.rule)?.skillIds.length)).map((assertion) => assertion.rule);
  const courseReference = validateReference(item);
  const hasHuman = mappings.some((mapping) => mapping?.automation !== 'MACHINE');
  return {
    caseId: item.case_id,
    source: 'WORKBUDDY_B',
    sourceVersion: source.meta.version,
    sourceLocator: `received/original/WB/data/ai-coach-cases-100.json#/cases/${index}`,
    category,
    classificationBasis,
    classificationReviewStatus: 'PENDING_HUMAN_REVIEW',
    direction: item.learning_direction,
    evaluationMode: evaluationMode(item.assertions),
    skillIds,
    unmappedRuleNames,
    skillMappingStatus: skillIds.length ? 'PROVISIONAL_HUMAN_REVIEW_REQUIRED' : 'PENDING_NO_SAFE_SKILL_ASSOCIATION',
    preconditions: [`learner_level=${item.learner_level}`, `learner_behavior=${item.learner_behavior}`, `input_mode=${item.input_mode}`],
    input: { mode: item.input_mode, learnerText: item.student_input, scenario: item.scenario },
    expected: {
      teacherAction: item.expected_teacher_action,
      forbiddenTeacherAction: item.forbidden_teacher_action,
      successCriteria: item.success_criteria,
      assertions: item.assertions,
      requiresHumanEvaluation: hasHuman,
    },
    targetContent: item.target_content,
    references: { original: item.curriculum_ref, courseValidation: courseReference },
    originalMetadata: { goal: item.goal, severity: item.severity, failureSignature: item.failure_signature, baselineExpectation: item.baseline_expectation, tags: item.tags, curriculumArea: item.curriculum_area, declaredInCurriculum: item.in_curriculum, fidelityNote: item.fidelity_note },
    normalizationStatus: courseReference.status.startsWith('CONFLICT') || courseReference.status === 'DIRECTION_MISMATCH' ? 'CONFLICT' : (hasHuman ? 'PENDING_HUMAN_REVIEW' : 'MECHANICALLY_NORMALIZED'),
    humanReviewStatus: 'PENDING',
  };
});

function countBy(items, accessor) {
  return items.reduce((result, item) => { const key = accessor(item); result[key] = (result[key] ?? 0) + 1; return result; }, {});
}

const conflicts = normalizedCases.filter((item) => ['CONFLICT', 'DIRECTION_MISMATCH'].some((value) => item.references.courseValidation.status.includes(value)));
const normalized = {
  schema: 'indobrain.ai-coach.test-cases-normalized/v1',
  source: { sourceId: 'WBB-100-CASES', sha256: '4e909e473d0f6ad6df8a14852fa0e49a707f1fbdf78ae65394ceb2d9a9eb0a2e', recordCount: 100 },
  status: 'NORMALIZED_PENDING_HUMAN_REVIEW',
  counts: { total: normalizedCases.length, categories: countBy(normalizedCases, (item) => item.category), evaluationModes: countBy(normalizedCases, (item) => item.evaluationMode), courseValidation: countBy(normalizedCases, (item) => item.references.courseValidation.status), humanReview: countBy(normalizedCases, (item) => item.humanReviewStatus), casesWithNoSafeSkillAssociation: normalizedCases.filter((item) => item.skillIds.length === 0).length },
  cases: normalizedCases,
};

fs.writeFileSync(path.join(docs, 'skills-mapping.v1.json'), `${JSON.stringify({ schema: 'indobrain.ai-coach.skills/v1', sourceSha256: '524bec4c17d3d5e6b65d59579ef9ee0f1d09456e03406cbc59702eb7d93b0fa5', reviewStatus: 'PENDING_HUMAN_REVIEW', skills }, null, 2)}\n`);
fs.writeFileSync(path.join(docs, 'rule-tis-skill-map.v1.json'), `${JSON.stringify({ schema: 'indobrain.ai-coach.rule-map/v1', reviewStatus: 'PENDING_HUMAN_REVIEW', tisDimensions: { TA: 25, CQ: 20, DA: 15, BR: 10, IP: 15, TC: 15 }, p0CoverageNote: 'P0-4 is contextual and has no safe exact rule-name equivalent; it remains HUMAN_REQUIRED.', rules: ruleMap }, null, 2)}\n`);
fs.writeFileSync(path.join(docs, 'teaching-test-cases.normalized.v1.json'), `${JSON.stringify(normalized, null, 2)}\n`);
fs.writeFileSync(path.join(docs, 'teaching-test-case-intake.v1.json'), `${JSON.stringify({ intakeVersion: 2, sourceId: 'WBB-100-CASES', expectedCount: 100, importedCount: normalizedCases.length, preservedOriginalIds: new Set(normalizedCases.map((item) => item.caseId)).size, normalizationStatus: 'NORMALIZED_PENDING_HUMAN_REVIEW', classificationCounts: normalized.counts.categories, evaluationCounts: normalized.counts.evaluationModes, courseValidationCounts: normalized.counts.courseValidation, humanReviewCounts: normalized.counts.humanReview, casesFile: 'docs/ai-coach-phase0/teaching-test-cases.normalized.v1.json', blockers: ['127 assertion-rule mappings require human approval before they become an executable judge.', 'P0-4 remains contextual HUMAN_REQUIRED.', `${conflicts.length} course-reference conflicts require content-owner review.`] }, null, 2)}\n`);

const skillRows = skills.map((skill) => `| ${skill.skillId} | ${skill.englishName} | ${skill.chineseName} | ${skill.definition} | \`${skill.sourceLocator}\` | ${skill.extractionStatus} |`).join('\n');
fs.writeFileSync(path.join(docs, 'SKILL_MAPPING_V1.md'), `# WorkBuddy A Teaching Skill Mapping V1\n\nAll definitions below are extracted from the named source. They are not runtime implementations or approved policies.\n\n| ID | English name | 中文名 | Source definition | Source locator | Review |\n| --- | --- | --- | --- | --- | --- |\n${skillRows}\n\n## Ambiguities requiring confirmation\n\n- S02's absolute “core action” language must become a conditional strategy before runtime use.\n- S03's fixed five-step, only-upward/no-skip wording conflicts with adaptive learner needs.\n- S07's “sole mastery criterion” wording conflicts with the current five-dimensional mastery model.\n- The source is prose, not an authoritative machine-readable manifest; every row remains pending human review.\n`);

const conflictRows = conflicts.map((item) => `| ${item.caseId} | ${item.direction} | \`${item.references.original}\` | ${item.references.courseValidation.status} | ${item.references.courseValidation.evidence} |`).join('\n');
fs.writeFileSync(path.join(docs, 'COURSE_REFERENCE_CONFLICTS_V1.md'), `# Course Reference Conflicts V1\n\nValidation rule: only a complete normalized target expression found in the specifically referenced source/day counts as an exact course match. Arbitrary substring hits are forbidden. Technical-code references do not prove course-content existence.\n\n## Counts\n\n\`${JSON.stringify(normalized.counts.courseValidation)}\`\n\n## Conflicts (${conflicts.length})\n\n| Case | Direction | Original reference | Result | Evidence |\n| --- | --- | --- | --- | --- |\n${conflictRows || '| — | — | — | — | None |'}\n\nAll conflicts remain pending human review; this process does not rewrite target content or source cases.\n`);

console.log(`NORMALIZED=${normalizedCases.length}`);
console.log(`RULES=${ruleMap.length}`);
console.log(`SKILLS=${skills.length}`);
console.log(`CONFLICTS=${conflicts.length}`);
console.log(`CATEGORIES=${JSON.stringify(normalized.counts.categories)}`);
console.log(`COURSE_VALIDATION=${JSON.stringify(normalized.counts.courseValidation)}`);
