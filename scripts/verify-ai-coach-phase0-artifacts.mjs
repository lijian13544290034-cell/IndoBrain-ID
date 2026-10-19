import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const sha256Raw = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const docs = 'docs/ai-coach-phase0';
const handoffRoot = path.join(docs, 'handoff-v1');
const handoff = readJson(path.join(handoffRoot, 'data/handoff-manifest.json'));
const manifest = readJson(path.join(docs, 'source-manifest.v1.json'));
const intake = readJson(path.join(docs, 'teaching-test-case-intake.v1.json'));
const original = readJson(path.join(handoffRoot, 'received/original/WB/data/ai-coach-cases-100.json'));
const normalized = readJson(path.join(docs, 'teaching-test-cases.normalized.v1.json'));
const skills = readJson(path.join(docs, 'skills-mapping.v1.json'));
const ruleMap = readJson(path.join(docs, 'rule-tis-skill-map.v1.json'));
const schema = readJson(path.join(docs, 'teaching-test-case.schema.v2.json'));

assert(handoff.files.length === 16, 'Expected 16 original handoff files');
for (const file of handoff.files) {
  const actual = sha256Raw(path.join(handoffRoot, file.path));
  assert(actual === file.sha256, `Original SHA-256 mismatch: ${file.path}`);
}

assert(manifest.baselineCommit === 'af52eae64390f331fef4ab8ac432b0d268fee4a3', 'Unexpected Phase 0.1 baseline');
assert(manifest.integrationStatus === 'SOURCES_RECEIVED_NORMALIZATION_PENDING_HUMAN_REVIEW', 'Integration status must remain honest');
assert(manifest.originalFileCount === 16, 'Manifest original count mismatch');
assert(sha256Raw(manifest.originalFilesManifest) === manifest.originalFilesManifestSha256, 'Original-files manifest SHA-256 mismatch');
assert(manifest.sources.every((source) => source.status.received === true), 'All declared sources should now be received');
assert(manifest.sources.some((source) => source.status.reviewed === false), 'Do not claim all WorkBuddy sources are reviewed');

assert(original.cases.length === 100, 'Original corpus must contain 100 cases');
assert(normalized.cases.length === 100 && intake.importedCount === 100, 'Normalized corpus must contain 100 cases');
const originalIds = original.cases.map((item) => item.case_id);
const normalizedIds = normalized.cases.map((item) => item.caseId);
assert(new Set(originalIds).size === 100, 'Original IDs must be unique');
assert(JSON.stringify(originalIds) === JSON.stringify(normalizedIds), 'Normalized records must preserve all IDs and order');
assert(normalized.cases.every((item) => item.humanReviewStatus === 'PENDING'), 'No case may be falsely marked reviewed');
assert(!JSON.stringify(intake).includes('BLOCKED_SOURCE'), 'Source-received intake must not remain BLOCKED_SOURCE');
for (let index = 0; index < original.cases.length; index += 1) {
  const sourceCase = original.cases[index];
  const derived = normalized.cases[index];
  assert(derived.direction === sourceCase.learning_direction, `${sourceCase.case_id}: direction changed during normalization`);
  assert(derived.input.learnerText === sourceCase.student_input && derived.input.scenario === sourceCase.scenario, `${sourceCase.case_id}: input changed during normalization`);
  assert(JSON.stringify(derived.expected.assertions) === JSON.stringify(sourceCase.assertions), `${sourceCase.case_id}: assertions changed during normalization`);
  assert(JSON.stringify(derived.targetContent) === JSON.stringify(sourceCase.target_content), `${sourceCase.case_id}: target content changed during normalization`);
  assert(derived.references.original === sourceCase.curriculum_ref, `${sourceCase.case_id}: source reference changed during normalization`);
  assert(['PROVISIONAL_HUMAN_REVIEW_REQUIRED', 'PENDING_NO_SAFE_SKILL_ASSOCIATION'].includes(derived.skillMappingStatus), `${sourceCase.case_id}: missing explicit Skill relationship status`);
}

const originalRules = [...new Set(original.cases.flatMap((item) => item.assertions.map((assertion) => assertion.rule)))].sort();
const mappedRules = ruleMap.rules.map((item) => item.rule).sort();
assert(originalRules.length === 127, 'Expected 127 distinct original rules');
assert(JSON.stringify(originalRules) === JSON.stringify(mappedRules), 'Every original assertion rule must have exactly one mapping row');
assert(ruleMap.rules.every((item) => item.mappingReviewStatus === 'PENDING_HUMAN_REVIEW'), 'Rule map must remain pending human review');
assert(ruleMap.p0CoverageNote.includes('P0-4'), 'P0-4 human-required gap must be explicit');

assert(skills.skills.length === 12, 'Expected S01-S12');
assert(skills.skills.map((item) => item.skillId).sort().join(',') === ['S01','S02','S03','S04','S05','S06','S07','S08','S09','S10','S11','S12'].join(','), 'Skill IDs are incomplete');
assert(skills.skills.every((item) => item.sourceLocator && item.extractionStatus === 'EXTRACTED_PENDING_HUMAN_REVIEW'), 'Skill provenance/review status missing');

for (const item of normalized.cases) {
  const validation = item.references.courseValidation;
  if (validation.status === 'EXACT_IN_REFERENCED_DAY') {
    assert(validation.referencedDays.length > 0, `${item.caseId}: exact Day match lacks referenced Day`);
    assert(validation.matchedExpressionIds.length > 0, `${item.caseId}: exact Day match lacks expression ID`);
  }
  assert(!/substring/i.test(validation.evidence) || validation.status !== 'EXACT_IN_REFERENCED_DAY', `${item.caseId}: substring cannot prove an exact match`);
}

const categoryEnum = schema.properties.category.enum;
assert(['TEACHING_STRATEGY', 'COURSE_CONTENT', 'VOICE_RELIABILITY'].every((value) => categoryEnum.includes(value)), 'Normalized categories missing');

const chatRoute = readFileSync('app/api/chat/route.ts', 'utf8');
const chatWorkspace = readFileSync('components/ChatWorkspace.tsx', 'utf8');
assert(chatRoute.includes('message: assistantMessage'), 'Expected /api/chat producer field evidence missing');
assert(chatWorkspace.includes('data.assistant_message'), 'Expected /api/chat consumer mismatch evidence missing');

const experience = readFileSync('components/MandarinAiCoachExperience.tsx', 'utf8');
assert(experience.includes('item.mastery_level + (passed ? 2 : 0)'), 'Expected legacy STT mastery behavior evidence missing');

console.log('AI COACH PHASE 0.1 ARTIFACTS: PASS');
console.log('ORIGINAL_FILES_SHA256: 16/16');
console.log('SKILLS_EXTRACTED: 12/12 PENDING_HUMAN_REVIEW');
console.log('TEST_CASES_NORMALIZED: 100/100 PENDING_HUMAN_REVIEW');
console.log(`ASSERTION_RULES_MAPPED: ${ruleMap.rules.length}/127 PENDING_HUMAN_REVIEW`);
console.log(`COURSE_VALIDATION: ${JSON.stringify(normalized.counts.courseValidation)}`);
console.log('PHASE_1: NO-GO PENDING HUMAN CONTRACT APPROVAL');
