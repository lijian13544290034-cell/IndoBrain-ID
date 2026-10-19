import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-teaching-engine-phase1b-'));
const sourceRoot = path.join(root, 'lib', 'teaching-engine');
const modules = [
  'contracts', 'rule-types', 'integration-contracts', 'rule-evaluator', 'rules',
  'workbuddy-adapters', 'orchestrator', 'evidence-validator', 'mastery-policy',
];

for (const name of modules) {
  const sourcePath = path.join(sourceRoot, `${name}.ts`);
  const output = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true, resolveJsonModule: true },
    fileName: sourcePath,
  }).outputText;
  fs.writeFileSync(path.join(temporary, `${name}.js`), output);
}
fs.cpSync(path.join(sourceRoot, 'workbuddy-a'), path.join(temporary, 'workbuddy-a'), { recursive: true });

const require = createRequire(import.meta.url);
const evaluator = require(path.join(temporary, 'rule-evaluator.js'));
const rules = require(path.join(temporary, 'rules.js'));
const adapters = require(path.join(temporary, 'workbuddy-adapters.js'));
const orchestrator = require(path.join(temporary, 'orchestrator.js'));
const integration = require(path.join(temporary, 'integration-contracts.js'));
const mastery = require(path.join(temporary, 'mastery-policy.js'));

const baseTurn = {
  requestId: 'phase1b-test-1',
  direction: 'ID_TO_ZH',
  turnKind: 'TEACHING',
  evidence: { kind: 'NONE', prompted: false, written: false, reviewQueued: false },
  strategyHistory: [],
  teachingAction: 'MODEL_THEN_INVITE',
  technicalFailure: null,
  sources: {
    turnKind: 'CALLER_DECLARED', evidenceKind: 'NO_ASSESSMENT_IN_CONVERSATION_ROUTE', strategyHistory: 'CALLER_DECLARED',
  },
  courseAuthorization: { authorized: true, lessonId: 'mandarin-work-30d:day-1', source: 'MANDARIN_WORK_LEVEL_1' },
  ruleContext: { turn: { direction: 'ID_TO_ZH' } },
};

try {
  const ruleSets = rules.listTeachingRuleSets();
  assert.deepEqual(ruleSets.map((item) => item.skillId), ['S02', 'S03', 'S04', 'S05', 'S07', 'S08']);
  assert.equal(ruleSets.reduce((sum, item) => sum + item.policies.length, 0), 51);

  assert.equal(evaluator.evaluateRuleAssertion({ path: 'turn.missing', op: 'eq', value: true }, {}).status, 'NOT_APPLICABLE');
  assert.throws(() => evaluator.evaluateRuleAssertion({ path: 'turn.x', op: 'silently_allow', value: true }, { turn: { x: true } }), /Unknown teaching rule operator/);
  assert.equal(evaluator.evaluateRuleAssertion({ path: 'turn.score', op: 'gte_for_scoring', value: 0.75 }, { turn: { score: 0.9 } }).status, 'NOT_APPLICABLE');
  assert.equal(evaluator.evaluateRuleAssertion({ path: 'turn.score', op: 'gte_for_scoring', value: 0.75 }, { turn: { score: 0.9, scoringAttempted: true } }).status, 'PASS');

  const technical = adapters.normalizeTeachingTurn({
    ...baseTurn,
    turnKind: 'TECH_FAILURE',
    technicalFailure: 'EMPTY_STT',
    evidence: { kind: 'PROMPTED_ATTEMPT', prompted: true, written: true, reviewQueued: true },
    sources: { ...baseTurn.sources, turnKind: 'TRANSPORT_OR_PROVIDER_FAILURE' },
  });
  assert.equal(technical.evidence.kind, 'NONE');
  assert.equal(technical.evidence.written, false);
  assert.equal(technical.evidence.reviewQueued, false);
  assert.equal(technical.ruleContext.turn.outcome, 'NO_EVIDENCE');
  assert.equal(adapters.toWorkBuddyBTestContract(technical).evidence.kind, 'NONE');

  assert.deepEqual(integration.languagePolicyFor('ID_TO_ZH'), { explanation: 'ID', target: 'ZH', feedback: 'ID', romanization: 'PINYIN' });
  assert.deepEqual(integration.languagePolicyFor('ZH_TO_ID'), { explanation: 'ZH', target: 'ID', feedback: 'ZH', romanization: 'NONE' });

  const blocked = orchestrator.orchestrateTeachingTurn({ ...baseTurn, courseAuthorization: { ...baseTurn.courseAuthorization, authorized: false } });
  assert.equal(blocked.status, 'BLOCKED_AUTHORIZATION');
  assert.equal(blocked.evaluations.length, 0);
  const shadow = orchestrator.orchestrateTeachingTurn(baseTurn);
  assert.equal(shadow.status, 'SHADOW_ONLY');
  assert.equal(shadow.skills.length, 6);
  assert.equal(shadow.evaluations.length, 51);
  assert.equal(shadow.counts.PASS + shadow.counts.VIOLATION + shadow.counts.NOT_APPLICABLE, 51);

  const stt = {
    evidenceId: 'stt-only', expressionId: 'E1', dimension: 'PRONUNCIATION', source: 'STT_INTELLIGIBILITY', outcome: 'SUCCESS',
    occurredAt: '2026-10-19T00:00:00.000Z', promptLevel: 'NONE', acousticVerified: false,
  };
  assert.equal(mastery.applyTeachingEvidence(mastery.createEmptyMasterySnapshot(), stt).status, 'PRACTICED');

  const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8');
  const feature = fs.readFileSync(path.join(root, 'lib/server/teaching-engine-shadow.ts'), 'utf8');
  assert(route.indexOf("levelTwoAccess?.state !== 'authorized'") < route.indexOf('runTeachingEngineShadow({'));
  assert(route.includes("direction: 'ID_TO_ZH'"));
  assert(route.includes("turnKind: 'TECH_FAILURE'"));
  assert(route.includes("evidence: { kind: 'NONE'"));
  assert(route.includes("technicalFailure: 'EMPTY_STT'"));
  assert(feature.includes("process.env.AI_COACH_TEACHING_ENGINE_V1 === 'shadow'"));

  const chatRoute = fs.readFileSync(path.join(root, 'app/api/chat/route.ts'), 'utf8');
  const chatWorkspace = fs.readFileSync(path.join(root, 'components/ChatWorkspace.tsx'), 'utf8');
  assert(chatRoute.includes('message: assistantMessage, assistant_message: assistantMessage'));
  assert(chatWorkspace.includes('data.assistant_message ==='));
  assert(chatWorkspace.includes(': data.message'));

  console.log('TEACHING ENGINE PHASE 1B: PASS');
  console.log('WORKBUDDY_A_RULES: 51 LOADED; THREE_STATE_EVALUATION PASS');
  console.log('WORKBUDDY_B_ADAPTER: PASS (TECH_FAILURE => evidence.kind=NONE)');
  console.log('UNKNOWN_OPERATOR: EXPLICIT_ERROR PASS');
  console.log('COURSE_AUTHORIZATION_BOUNDARY: PASS');
  console.log('RUNTIME_FLAG: DEFAULT_OFF SHADOW ONLY');
  console.log('API_CHAT_COMPATIBILITY: message + assistant_message PASS');
  console.log('TEACHING_QUALITY: PENDING_HUMAN_REVIEW');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
