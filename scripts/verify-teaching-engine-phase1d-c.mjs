import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-phase1d-e-'));
const sourceRoot = path.join(root, 'lib', 'teaching-engine');
const modules = ['contracts', 'telemetry-contracts', 'rule-types', 'integration-contracts', 'rule-evaluator', 'rules', 'workbuddy-adapters', 'orchestrator'];
for (const name of modules) {
  const sourcePath = path.join(sourceRoot, `${name}.ts`);
  const output = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true, resolveJsonModule: true }, fileName: sourcePath }).outputText;
  fs.writeFileSync(path.join(temporary, `${name}.js`), output);
}
fs.cpSync(path.join(sourceRoot, 'workbuddy-a'), path.join(temporary, 'workbuddy-a'), { recursive: true });
const activeSource = fs.readFileSync(path.join(root, 'lib', 'server', 'teaching-engine-active.ts'), 'utf8').replace("import 'server-only';", '').replaceAll('@/lib/teaching-engine/', './');
fs.writeFileSync(path.join(temporary, 'teaching-engine-active.js'), ts.transpileModule(activeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true }, fileName: 'teaching-engine-active.ts' }).outputText);
const modeSource = fs.readFileSync(path.join(root, 'lib', 'server', 'teaching-engine-shadow.ts'), 'utf8').replace("import 'server-only';", '').replace('@/lib/teaching-engine/orchestrator', './orchestrator').replace('@/lib/teaching-engine/integration-contracts', './integration-contracts');
fs.writeFileSync(path.join(temporary, 'teaching-engine-shadow.js'), ts.transpileModule(modeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true }, fileName: 'teaching-engine-shadow.ts' }).outputText);
const require = createRequire(import.meta.url);
const active = require(path.join(temporary, 'teaching-engine-active.js'));
const modes = require(path.join(temporary, 'teaching-engine-shadow.js'));
const evaluator = require(path.join(temporary, 'rule-evaluator.js'));
const rules = require(path.join(temporary, 'rules.js'));

let sequence = 0;
const lessonId = 'mandarin-work-level-1-day-27';
function attach(result, sessionKey) { return Object.assign(result, { __sessionKey: sessionKey }); }
function fresh(label = 'session') {
  const sessionKey = `${label}-${++sequence}`;
  return attach(active.runActiveTeachingTurn({ requestId: `${label}-start`, lessonId, message: 'Mulai', modality: 'TEXT', startRequested: true, sessionKey, sessionToken: null }), sessionKey);
}
function step(previous, message, modality = 'TEXT', extra = {}) {
  return attach(active.runActiveTeachingTurn({ requestId: crypto.randomUUID(), lessonId, message, modality, startRequested: false, sessionKey: previous.__sessionKey, sessionToken: previous.sessionToken, ...extra }), previous.__sessionKey);
}
function modeled(label) { return step(fresh(label), 'saya besok kerja'); }
function unprompted(label) { return step(modeled(label), '我明天上班'); }
function transfer(label) { return step(unprompted(label), '我明天上班'); }

const results = [];
function check(id, fn) { try { fn(); results.push({ id, verdict: 'PASS' }); } catch (error) { results.push({ id, verdict: 'FAIL', error: error instanceof Error ? error.message : String(error) }); } }

check('D1B-01', () => { const r = step(modeled('scaffold'), '我明天上班'); assert.equal(r.telemetry.evidence.outcome, 'SCAFFOLDED_SUCCESS'); assert.equal(r.session.masteryStatus, 'PRACTICED'); });
check('D1B-02', () => { const r = step(modeled('wrong'), '我明天吧'); assert.equal(r.telemetry.next.recordsLearnerFailure, true); assert.equal(r.session.consecutiveErrors, 1); });
check('D1B-03', () => { const r = step(modeled('partial'), '我明天'); assert.equal(r.telemetry.evidence.outcome, 'PARTIAL'); assert.equal(r.telemetry.teaching.hintType, 'FIRST_TOKEN'); });
check('D1B-04', () => { const r = step(modeled('help'), 'Saya tidak tahu'); assert.equal(r.telemetry.evidence.outcome, 'NO_EVIDENCE'); assert.equal(r.session.consecutiveErrors, 0); });
check('D1B-05', () => { const first = step(modeled('reduce'), '我明天吧'); const r = step(first, '我明天吧'); assert.equal(r.telemetry.teaching.action, 'REDUCE_ONE_VARIABLE'); assert.equal(r.telemetry.next.difficulty, 'DOWN'); });
check('D1B-06', () => { const r = step(modeled('meaning'), 'Apa artinya?'); assert.match(r.response.answer, /Artinya/); assert.match(r.response.answer, /Besok saya masuk kerja/); });
check('D1B-07', () => { const r = step(modeled('repeat'), 'Ulang sekali lagi'); assert.equal(r.telemetry.teaching.hintType, 'FULL_MODEL'); assert.equal(r.session.promptLevel, 'FULL_MODEL'); });
check('D1B-08', () => { const hinted = step(modeled('prompted'), '我明天'); const r = step(hinted, '我明天上班'); assert.equal(r.telemetry.evidence.kind, 'PROMPTED_ATTEMPT'); assert.notEqual(r.session.masteryStatus, 'INDEPENDENT'); });
check('D1B-09', () => { const r = step(unprompted('independent'), '我明天上班'); assert.equal(r.telemetry.evidence.kind, 'INDEPENDENT_PRODUCTION'); assert.equal(r.session.stage, 'TRANSFER_TEST'); assert.notEqual(r.session.masteryStatus, 'MASTERED'); });
check('D1B-10B', () => { const r = step(transfer('transfer'), '我今天上班'); assert.equal(r.session.stage, 'COMPLETE'); assert.equal(r.telemetry.evidence.source, 'TRANSFER_TASK'); assert.notEqual(r.session.masteryStatus, 'MASTERED'); });
check('D1B-11', () => { const before = modeled('empty-stt'); const r = active.buildActiveTechnicalFailure({ requestId: 'empty-stt', lessonId, message: '', modality: 'VOICE', sessionKey: before.__sessionKey, sessionToken: before.sessionToken, reason: 'EMPTY_STT' }); assert.equal(r.telemetry.evidence.outcome, 'NO_EVIDENCE'); assert.equal(r.session.consecutiveErrors, before.session.consecutiveErrors); });
results.push({ id: 'D1B-12', verdict: 'BLOCKED', reason: 'G2: STT provider exposes no confidence; no acoustic or learner-error assertion is made.' });
results.push({ id: 'D1B-13', verdict: 'BLOCKED', reason: 'Requires real browser/provider failure to verify audible TTS fallback.' });
check('D1B-14', () => { const before = step(modeled('provider'), '我明天上班'); const r = active.buildActiveTechnicalFailure({ requestId: 'provider', lessonId, message: '', modality: 'TEXT', sessionKey: before.__sessionKey, sessionToken: before.sessionToken, reason: 'PROVIDER' }); assert.equal(r.session.masteryStatus, before.session.masteryStatus); assert.equal(r.telemetry.next.recordsLearnerFailure, false); });
check('D1B-15', () => { const before = modeled('off-topic'); const r = step(before, 'Menurutmu bitcoin besok naik?'); assert.equal(r.telemetry.teaching.action, 'OFF_TOPIC_REDIRECT'); assert.equal(r.telemetry.evidence.kind, 'NONE'); assert.equal(r.session.stage, before.session.stage); });
check('D1B-16', () => { const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8'); assert(route.indexOf("levelTwoAccess?.state !== 'authorized'") < route.indexOf('runActiveTeachingTurn({')); });
check('STT_BOUNDARY_NO_FALSE_FAILURE', () => { let before = modeled('voice'); before = step(before, '我明天吧'); before = step(before, '我明天吧'); const r = step(before, '我明天吧', 'VOICE'); assert.equal(r.telemetry.evidence.outcome, 'NO_EVIDENCE'); assert.equal(r.telemetry.evidence.kind, 'NONE'); assert.equal(r.session.consecutiveErrors, before.session.consecutiveErrors); assert.equal(r.session.masteryStatus, before.session.masteryStatus); assert.equal(r.telemetry.next.recordsLearnerFailure, false); });
check('OBJECTIVE_CONTRACT', () => { const r = fresh('objective'); assert.equal(r.telemetry.objective.courseReferenceStatus, 'TEMPORARY_TEACHING_OBJECTIVE'); assert.deepEqual(r.telemetry.objective.anchorExpressionIds, ['CN-WORK-D01-I02', 'CN-WORK-D06-I02', 'CN-WORK-D27-I01']); });
check('OFF_SHADOW_ACTIVE_MODES', () => {
  const saved = { flag: process.env.AI_COACH_TEACHING_ENGINE_V1, vercel: process.env.VERCEL_ENV, test: process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST };
  delete process.env.AI_COACH_TEACHING_ENGINE_V1; delete process.env.VERCEL_ENV; delete process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST;
  assert.equal(modes.teachingEngineRuntimeMode(), 'OFF');
  process.env.AI_COACH_TEACHING_ENGINE_V1 = 'shadow'; assert.equal(modes.teachingEngineRuntimeMode(), 'SHADOW');
  process.env.AI_COACH_TEACHING_ENGINE_V1 = 'active'; process.env.VERCEL_ENV = 'production'; assert.equal(modes.teachingEngineRuntimeMode(), 'OFF');
  process.env.VERCEL_ENV = 'preview'; assert.equal(modes.teachingEngineRuntimeMode(), 'ACTIVE');
  if (saved.flag == null) delete process.env.AI_COACH_TEACHING_ENGINE_V1; else process.env.AI_COACH_TEACHING_ENGINE_V1 = saved.flag;
  if (saved.vercel == null) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = saved.vercel;
  if (saved.test == null) delete process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST; else process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST = saved.test;
});

check('RULES_NO_FALSE_POSITIVE_DEMONSTRATION', () => { assert.equal(modeled('rule-demo').engine.counts.VIOLATION, 0); });
check('RULES_NO_FALSE_POSITIVE_HINT', () => { assert.equal(step(modeled('rule-hint'), '上班').engine.counts.VIOLATION, 0); });
check('RULES_NO_FALSE_POSITIVE_INDEPENDENT_RECALL', () => { assert.equal(step(unprompted('rule-recall'), '我明天上班').engine.counts.VIOLATION, 0); });
check('RULES_NO_FALSE_POSITIVE_TRANSFER', () => { assert.equal(step(transfer('rule-transfer'), '我今天上班').engine.counts.VIOLATION, 0); });
function evaluation(ruleId, context) { return evaluator.evaluateTeachingRuleSets(rules.listTeachingRuleSets(), context).find((item) => item.ruleId === ruleId); }
check('RULE_S07_01_REAL_VIOLATION', () => { assert.equal(evaluation('RULE-S07-01', { turn: { recall: { stage: 'R1', promptLeaksTarget: true } } }).status, 'VIOLATION'); });
check('RULE_S07_07_REAL_VIOLATION', () => { assert.equal(evaluation('RULE-S07-07', { turn: { recall: { stage: 'R1', stalled: true, modelDeliveredBefore: true } } }).status, 'VIOLATION'); });
check('RULE_S04_06_REAL_VIOLATION', () => { assert.equal(evaluation('RULE-S04-06', { output: { difficultyAdjustmentDisclosed: true } }).status, 'VIOLATION'); });
check('RULE_S03_03_REAL_VIOLATION', () => { assert.equal(evaluation('RULE-S03-03', { turn: { hintType: 'OBJECT_CUE', hintChineseCharCount: 26, hintIndonesianWordCount: 2 } }).status, 'VIOLATION'); });

check('STATE_TAMPER_REJECTED', () => { const current = fresh('tamper'); assert.throws(() => step(current, '我今天上班', 'TEXT', { sessionToken: `${current.sessionToken}-tampered` }), { name: 'ActiveTeachingStateError' }); });
check('STATE_CROSS_SESSION_REJECTED', () => { const current = fresh('owner-a'); assert.throws(() => active.runActiveTeachingTurn({ requestId: 'cross', lessonId, message: '我今天上班', modality: 'TEXT', startRequested: false, sessionKey: 'owner-b', sessionToken: current.sessionToken }), { name: 'ActiveTeachingStateError' }); });
check('STATE_REPLAY_REJECTED', () => { const current = fresh('replay'); const oldToken = current.sessionToken; step(current, 'saya besok kerja'); assert.throws(() => active.runActiveTeachingTurn({ requestId: 'replay-old', lessonId, message: '我今天上班', modality: 'TEXT', startRequested: false, sessionKey: current.__sessionKey, sessionToken: oldToken }), { name: 'ActiveTeachingStateError' }); });
check('STATE_ILLEGAL_STAGE_IGNORED', () => { const current = fresh('forged-stage'); const r = step(current, '我今天上班', 'TEXT', { state: { stage: 'TRANSFER_TEST', masteryStatus: 'INDEPENDENT' } }); assert.equal(r.session.stage, 'SPEAK'); assert.notEqual(r.session.stage, 'COMPLETE'); });
check('ROUTE_DOES_NOT_TRUST_CLIENT_STATE', () => { const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8'); assert.doesNotMatch(route, /activeTeaching:\s*parsed\.activeTeaching/); assert.match(route, /sessionKey:\s*scopedSessionId/); });

const failed = results.filter((item) => item.verdict === 'FAIL');
console.log(JSON.stringify({ suite: 'PHASE_1D_E_ACTIVE', results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} executable cases failed`);
console.log('TEACHING ENGINE PHASE 1D-E: PASS');
console.log(`EXECUTABLE_CASES: ${results.filter((item) => item.verdict === 'PASS').length} PASS; ${results.filter((item) => item.verdict === 'BLOCKED').length} BLOCKED`);
console.log('RULE_FALSE_POSITIVES_FIXED: PASS');
console.log('SERVER_TRUSTED_STATE: PASS');
fs.rmSync(temporary, { recursive: true, force: true });
