import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-teaching-engine-'));
const moduleNames = ['contracts', 'state-machine', 'evidence-validator', 'mastery-policy', 'skill-registry'];
for (const name of moduleNames) {
  const sourcePath = path.join(root, 'lib', 'teaching-engine', `${name}.ts`);
  const output = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true },
    fileName: sourcePath,
  }).outputText;
  fs.writeFileSync(path.join(temporary, `${name}.js`), output);
}

const require = createRequire(import.meta.url);
const contracts = require(path.join(temporary, 'contracts.js'));
const stateMachine = require(path.join(temporary, 'state-machine.js'));
const evidence = require(path.join(temporary, 'evidence-validator.js'));
const mastery = require(path.join(temporary, 'mastery-policy.js'));
const skills = require(path.join(temporary, 'skill-registry.js'));

try {
  assert.deepEqual(contracts.CORE_TEACHING_SKILL_IDS, ['S02', 'S03', 'S04', 'S05', 'S07', 'S08']);
  assert.equal(skills.listCoreSkills().length, 6);
  assert(skills.listCoreSkills().every((skill) => skill.runtimeEnabled === false));

  assert.equal(stateMachine.transitionTeachingState('DIAGNOSE', 'DIAGNOSIS_READY')?.to, 'MODEL');
  assert.equal(stateMachine.transitionTeachingState('SPEAK', 'TECHNICAL_FAILURE')?.to, 'SPEAK');
  assert.equal(stateMachine.transitionTeachingState('SPEAK', 'TECHNICAL_FAILURE')?.recordsLearnerFailure, false);
  assert.equal(stateMachine.transitionTeachingState('EVALUATE', 'EVIDENCE_REJECTED')?.recordsLearnerFailure, true);
  assert.equal(stateMachine.transitionTeachingState('COMPLETE', 'RETRY_REQUESTED'), null);

  const context = { learnerLevel: 'BEGINNER', consecutiveLearnerErrors: 0, consecutiveSuccesses: 0, promptLevel: 'TASK_ONLY', learnerRequestedHelp: false };
  assert.equal(skills.selectScaffoldLevel({ ...context, outcome: 'NO_EVIDENCE' }), 'TASK_ONLY');
  assert.equal(skills.selectScaffoldLevel({ ...context, outcome: 'LEARNER_ERROR', consecutiveLearnerErrors: 3 }), 'FULL_MODEL');
  assert.equal(skills.selectScaffoldLevel({ ...context, outcome: 'SUCCESS', consecutiveSuccesses: 3, promptLevel: 'FULL_MODEL' }), 'NONE');
  assert.equal(skills.selectScaffoldLevel({ ...context, outcome: 'SUCCESS', consecutiveSuccesses: 2, promptLevel: 'FIRST_WORD' }), 'SEMANTIC_CUE');

  assert.equal(skills.selectDifficultyAction({ ...context, outcome: 'NO_EVIDENCE' }), 'KEEP_DIFFICULTY');
  assert.equal(skills.selectDifficultyAction({ ...context, outcome: 'LEARNER_ERROR', consecutiveLearnerErrors: 2 }), 'REDUCE_ONE_VARIABLE');
  assert.equal(skills.selectDifficultyAction({ ...context, outcome: 'SUCCESS', consecutiveSuccesses: 2 }), 'INCREASE_ONE_VARIABLE');

  assert.equal(skills.selectCorrectionStrategy({ learnerLevel: 'BEGINNER', errorType: 'WORD_CHOICE', acousticEvidence: false }), 'PRESERVE_CORRECT_PART_AND_RETRY_ONE_POINT');
  assert.equal(skills.selectCorrectionStrategy({ learnerLevel: 'INTERMEDIATE', errorType: 'WORD_ORDER', acousticEvidence: false }), 'CONTRAST_MINIMAL_WORD_ORDER');
  assert.equal(skills.selectCorrectionStrategy({ learnerLevel: 'ELEMENTARY', errorType: 'PHONEME_OR_TONE', acousticEvidence: false }), 'REQUEST_ACOUSTIC_EVIDENCE');

  assert.equal(skills.validateIndependentProduction({ source: 'GUIDED_REPEAT', promptLevel: 'NONE', success: true }), false);
  assert.equal(skills.validateIndependentProduction({ source: 'UNPROMPTED_RECALL', promptLevel: 'FIRST_WORD', success: true }), false);
  assert.equal(skills.validateIndependentProduction({ source: 'UNPROMPTED_RECALL', promptLevel: 'NONE', success: true }), true);

  assert.equal(skills.selectRecoveryAction({ outcome: 'NO_EVIDENCE', consecutiveLearnerErrors: 9 }), 'TECHNICAL_RETRY_OR_TEXT_FALLBACK');
  assert.equal(skills.selectRecoveryAction({ outcome: 'LEARNER_ERROR', consecutiveLearnerErrors: 2 }), 'CHANGE_TEACHING_STRATEGY');
  assert.equal(skills.selectRecoveryAction({ outcome: 'LEARNER_ERROR', consecutiveLearnerErrors: 3 }), 'REDUCE_TASK_AND_OFFER_EXIT');

  const technical = {
    evidenceId: 'tech-1', expressionId: 'E1', dimension: 'PRONUNCIATION', source: 'STT_INTELLIGIBILITY', outcome: 'NO_EVIDENCE',
    occurredAt: '2026-10-19T01:00:00.000Z', promptLevel: 'NONE', technicalFailure: 'EMPTY_STT', acousticVerified: false,
  };
  const blank = mastery.createEmptyMasterySnapshot();
  const afterTechnical = mastery.applyTeachingEvidence(blank, technical);
  assert.equal(afterTechnical.status, 'NOT_STARTED');
  assert.equal(afterTechnical.dimensions.PRONUNCIATION.learnerErrors, 0);
  assert.equal(afterTechnical.dimensions.PRONUNCIATION.noEvidence, 1);
  assert.equal(afterTechnical.acceptedEvidence.length, 0);

  const sttPass = { ...technical, evidenceId: 'stt-1', outcome: 'SUCCESS', technicalFailure: undefined };
  const afterStt = mastery.applyTeachingEvidence(blank, sttPass);
  assert.equal(afterStt.status, 'PRACTICED');
  assert.equal(afterStt.dimensions.PRONUNCIATION.level, 1);
  assert.equal(afterStt.dimensions.PRONUNCIATION.acousticVerified, false);
  let repeatedStt = afterStt;
  for (let index = 2; index <= 10; index += 1) repeatedStt = mastery.applyTeachingEvidence(repeatedStt, { ...sttPass, evidenceId: `stt-${index}` });
  assert.equal(repeatedStt.status, 'PRACTICED');
  assert.equal(repeatedStt.dimensions.PRONUNCIATION.level, 1);

  const invalidAcoustic = evidence.validateTeachingEvidence({ ...sttPass, acousticVerified: true });
  assert.equal(invalidAcoustic.accepted, false);
  assert.equal(invalidAcoustic.reason, 'UNSUPPORTED_ACOUSTIC_CLAIM');

  const promptedRecall = { ...sttPass, evidenceId: 'recall-prompted', dimension: 'RECALL', source: 'UNPROMPTED_RECALL', promptLevel: 'FIRST_WORD' };
  assert.equal(evidence.validateTeachingEvidence(promptedRecall).reason, 'INVALID_INDEPENDENT_EVIDENCE');
  assert.equal(mastery.applyTeachingEvidence(afterStt, promptedRecall).status, 'PRACTICED');

  const recall = { ...sttPass, evidenceId: 'recall-1', dimension: 'RECALL', source: 'UNPROMPTED_RECALL', promptLevel: 'NONE', occurredAt: '2026-10-19T02:00:00.000Z' };
  const independent = mastery.applyTeachingEvidence(afterStt, recall);
  assert.equal(independent.status, 'INDEPENDENT');
  assert.equal(mastery.applyTeachingEvidence(independent, technical).status, 'INDEPENDENT');
  const transfer = { ...sttPass, evidenceId: 'transfer-1', dimension: 'APPLICATION', source: 'TRANSFER_TASK', promptLevel: 'NONE', occurredAt: '2026-10-20T02:00:00.000Z' };
  assert.equal(mastery.applyTeachingEvidence(independent, transfer).status, 'MASTERED');
  assert.equal(mastery.createEmptyMasterySnapshot(4).status, 'PRACTICED');

  assert.equal(evidence.canUseCaseForAssertion({ assertionKind: 'CONTENT', courseReferenceStatus: 'DIRECTION_MISMATCH' }).allowed, false);
  assert.equal(evidence.canUseCaseForAssertion({ assertionKind: 'CONTENT', courseReferenceStatus: 'EXACT_IN_REFERENCED_DAY' }).allowed, true);
  assert.equal(evidence.canUseCaseForAssertion({ assertionKind: 'STRATEGY', courseReferenceStatus: 'DIRECTION_MISMATCH' }).allowed, true);

  const chatRoute = fs.readFileSync(path.join(root, 'app/api/chat/route.ts'), 'utf8');
  const chatWorkspace = fs.readFileSync(path.join(root, 'components/ChatWorkspace.tsx'), 'utf8');
  assert(chatRoute.includes('message: assistantMessage'));
  assert(chatWorkspace.includes('data.assistant_message'));

  console.log('TEACHING ENGINE PHASE 1A: PASS');
  console.log('CORE_SKILLS: S02,S03,S04,S05,S07,S08');
  console.log('STATE_MACHINE: PASS');
  console.log('NO_EVIDENCE: PASS');
  console.log('MASTERY_COMPATIBILITY: PASS');
  console.log('COURSE_ASSERTION_GATE: PASS');
  console.log('API_CHAT_CONTRACT_AUDIT: MISMATCH_CONFIRMED, NOT_MODIFIED');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
