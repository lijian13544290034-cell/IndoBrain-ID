import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sha256(path) {
  const canonicalText = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(canonicalText, 'utf8').digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = readJson('docs/ai-coach-phase0/source-manifest.v1.json');
const intake = readJson('docs/ai-coach-phase0/teaching-test-case-intake.v1.json');
const schema = readJson('docs/ai-coach-phase0/teaching-test-case.schema.v1.json');

assert(manifest.baselineCommit === '244eb83a689b0309eff5b7ac0732361c903c419c', 'Unexpected baseline commit');
assert(manifest.integrationStatus === 'INCOMPLETE', 'Missing WorkBuddy sources must keep integration incomplete');

const requiredSources = [
  'CODEX-INTEGRATION-PLAN-V1',
  'CODEX-RUNTIME-AUDIT-EVIDENCE-V1',
  'WBA-SKILLS-S01-S12',
  'WBA-EVIDENCE-TABLE',
  'WBA-BIDIRECTIONAL-EXAMPLES',
  'WBB-100-CASES',
  'WBB-TIS-RUBRIC',
  'WBB-QUICK-SPEAK',
  'WBB-MOBILE-SPEC',
  'WBB-REAL-USER-PROTOCOL',
];
assert(requiredSources.every((id) => manifest.sources.some((source) => source.sourceId === id)), 'Source manifest is incomplete');

const plan = manifest.sources.find((source) => source.sourceId === 'CODEX-INTEGRATION-PLAN-V1');
assert(plan?.status === 'PRESENT' && plan.path && plan.sha256, 'Codex plan provenance is incomplete');
assert(sha256(plan.path) === plan.sha256, 'Codex plan SHA-256 mismatch');

const missingWorkBuddy = manifest.sources.filter((source) => source.provider.startsWith('WORKBUDDY') && source.status === 'MISSING');
assert(missingWorkBuddy.length === 8, 'Expected eight missing WorkBuddy artifact groups');

assert(intake.expectedCount === 100, 'WorkBuddy B expected case count must remain 100');
assert(intake.importedCount === intake.cases.length, 'Imported count does not match cases array');
assert(intake.importedCount === 0 && intake.normalizationStatus === 'BLOCKED_SOURCE', 'Do not claim normalized cases without original source');

const categoryEnum = schema.properties?.category?.enum ?? [];
assert(['TEACHING_STRATEGY', 'COURSE_CONTENT', 'VOICE_RELIABILITY'].every((value) => categoryEnum.includes(value)), 'Missing normalized test category');
const evaluationEnum = schema.properties?.evaluationMode?.enum ?? [];
assert(['MACHINE', 'HUMAN', 'BOTH'].every((value) => evaluationEnum.includes(value)), 'Missing evaluation mode');

const chatRoute = readFileSync('app/api/chat/route.ts', 'utf8');
const chatWorkspace = readFileSync('components/ChatWorkspace.tsx', 'utf8');
assert(chatRoute.includes('message: assistantMessage'), 'Expected /api/chat message field was not found');
assert(chatWorkspace.includes('data.assistant_message'), 'Expected legacy consumer mismatch was not found');

const experience = readFileSync('components/MandarinAiCoachExperience.tsx', 'utf8');
const review = readFileSync('lib/mandarin-coach-review.ts', 'utf8');
assert(experience.includes('item.mastery_level + (passed ? 2 : 0)'), 'Expected legacy STT mastery increment was not found');
assert(review.includes("overallLevel === 4") && review.includes("return 'MASTERED'"), 'Expected legacy mastered interpretation was not found');

console.log('AI COACH PHASE 0 ARTIFACTS: PASS');
console.log(`THREE_PARTY_INTEGRATION: ${manifest.integrationStatus}`);
console.log(`WORKBUDDY_ARTIFACT_GROUPS_MISSING: ${missingWorkBuddy.length}`);
console.log(`TEST_CASES_EXPECTED: ${intake.expectedCount}`);
console.log(`TEST_CASES_IMPORTED: ${intake.importedCount}`);
console.log('PROVEN_CONTRACT_BLOCKERS: API_RESPONSE_FIELD, LEGACY_MASTERY_SEMANTICS');
