import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-phase1d-c-'));
const sourceRoot = path.join(root, 'lib', 'teaching-engine');
const modules = ['contracts', 'telemetry-contracts', 'rule-types', 'integration-contracts', 'rule-evaluator', 'rules', 'workbuddy-adapters', 'orchestrator'];
for (const name of modules) {
  const sourcePath = path.join(sourceRoot, `${name}.ts`);
  const output = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true, resolveJsonModule: true }, fileName: sourcePath }).outputText;
  fs.writeFileSync(path.join(temporary, `${name}.js`), output);
}
fs.cpSync(path.join(sourceRoot, 'workbuddy-a'), path.join(temporary, 'workbuddy-a'), { recursive: true });
const guardSource = fs.readFileSync(path.join(root, 'lib', 'teaching-intent-guard.ts'), 'utf8');
fs.writeFileSync(path.join(temporary, 'teaching-intent-guard.js'), ts.transpileModule(guardSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true }, fileName: 'teaching-intent-guard.ts' }).outputText);
const activeSource = fs.readFileSync(path.join(root, 'lib', 'server', 'teaching-engine-active.ts'), 'utf8').replace("import 'server-only';", '').replaceAll("@/lib/teaching-engine/", './').replace("@/lib/teaching-intent-guard", './teaching-intent-guard');
fs.writeFileSync(path.join(temporary, 'teaching-engine-active.js'), ts.transpileModule(activeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true }, fileName: 'teaching-engine-active.ts' }).outputText);
const modeSource = fs.readFileSync(path.join(root, 'lib', 'server', 'teaching-engine-shadow.ts'), 'utf8').replace("import 'server-only';", '').replace("@/lib/teaching-engine/orchestrator", './orchestrator').replace("@/lib/teaching-engine/integration-contracts", './integration-contracts');
fs.writeFileSync(path.join(temporary, 'teaching-engine-shadow.js'), ts.transpileModule(modeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true }, fileName: 'teaching-engine-shadow.ts' }).outputText);
const require = createRequire(import.meta.url);
const active = require(path.join(temporary, 'teaching-engine-active.js'));
const modes = require(path.join(temporary, 'teaching-engine-shadow.js'));
const state = (overrides = {}) => ({ schema: 'indobrain.active-teaching-session/v1', objectiveId: 'temporary:wo-mingtian-shangban', stage: 'SPEAK', promptLevel: 'TASK_ONLY', attempts: 0, consecutiveErrors: 0, consecutiveSuccesses: 0, hints: 0, prerequisitesVerified: true, masteryStatus: 'NOT_STARTED', ...overrides });
const run = (message, current, modality = 'TEXT') => active.runActiveTeachingTurn({ requestId: crypto.randomUUID(), lessonId: 'mandarin-work-level-1-day-27', message, modality, startRequested: false, state: current });
const results = [];
function check(id, fn) { try { fn(); results.push({ id, verdict: 'PASS' }); } catch (error) { results.push({ id, verdict: 'FAIL', error: error instanceof Error ? error.message : String(error) }); } }

check('D1B-01', () => { const r = run('我明天上班', state()); assert.equal(r.telemetry.evidence.outcome, 'SCAFFOLDED_SUCCESS'); assert.equal(r.session.masteryStatus, 'PRACTICED'); });
check('D1B-02', () => { const r = run('我明天吧', state()); assert.equal(r.telemetry.next.recordsLearnerFailure, true); assert.equal(r.session.consecutiveErrors, 1); });
check('D1B-03', () => { const r = run('我明天', state()); assert.equal(r.telemetry.evidence.outcome, 'PARTIAL'); assert.equal(r.telemetry.teaching.hintType, 'FIRST_TOKEN'); });
check('D1B-04', () => { const r = run('Saya tidak tahu', state()); assert.equal(r.telemetry.evidence.outcome, 'NO_EVIDENCE'); assert.equal(r.session.consecutiveErrors, 0); });
check('D1B-05', () => { const r = run('我明天吧', state({ consecutiveErrors: 1 })); assert.equal(r.telemetry.teaching.action, 'REDUCE_ONE_VARIABLE'); assert.equal(r.telemetry.next.difficulty, 'DOWN'); });
check('D1B-06', () => { const r = run('Apa artinya?', state()); assert.match(r.response.answer, /Artinya/); assert.match(r.response.answer, /Besok saya masuk kerja/); });
check('D1B-07', () => { const r = run('Ulang sekali lagi', state()); assert.equal(r.telemetry.teaching.hintType, 'FULL_MODEL'); assert.equal(r.session.promptLevel, 'FULL_MODEL'); });
check('D1B-08', () => { const r = run('我明天上班', state({ promptLevel: 'FIRST_WORD' })); assert.equal(r.telemetry.evidence.kind, 'PROMPTED_ATTEMPT'); assert.notEqual(r.session.masteryStatus, 'INDEPENDENT'); });
check('D1B-09', () => { const r = run('我明天上班', state({ promptLevel: 'NONE', masteryStatus: 'PRACTICED' })); assert.equal(r.telemetry.evidence.kind, 'INDEPENDENT_PRODUCTION'); assert.equal(r.session.stage, 'TRANSFER_TEST'); assert.notEqual(r.session.masteryStatus, 'MASTERED'); });
check('D1B-10B', () => { const r = run('我今天上班', state({ stage: 'TRANSFER_TEST', promptLevel: 'NONE', masteryStatus: 'INDEPENDENT' })); assert.equal(r.session.stage, 'COMPLETE'); assert.equal(r.telemetry.evidence.source, 'TRANSFER_TASK'); assert.notEqual(r.session.masteryStatus, 'MASTERED'); });
check('D1B-11', () => { const before = state(); const r = active.buildActiveTechnicalFailure({ requestId: 'empty-stt', lessonId: 'mandarin-work-level-1-day-27', message: '', modality: 'VOICE', state: before, reason: 'EMPTY_STT' }); assert.equal(r.telemetry.evidence.outcome, 'NO_EVIDENCE'); assert.equal(r.session.consecutiveErrors, before.consecutiveErrors); });
results.push({ id: 'D1B-12', verdict: 'BLOCKED', reason: 'G2: STT provider exposes no confidence; no acoustic or learner-error assertion is made.' });
results.push({ id: 'D1B-13', verdict: 'BLOCKED', reason: 'Requires real browser/provider failure to verify audible TTS fallback.' });
check('D1B-14', () => { const before = state({ masteryStatus: 'PRACTICED' }); const r = active.buildActiveTechnicalFailure({ requestId: 'provider', lessonId: 'mandarin-work-level-1-day-27', message: '', modality: 'TEXT', state: before, reason: 'PROVIDER' }); assert.equal(r.session.masteryStatus, before.masteryStatus); assert.equal(r.telemetry.next.recordsLearnerFailure, false); });
check('D1B-15', () => { const r = run('Menurutmu bitcoin besok naik?', state()); assert.equal(r.telemetry.teaching.action, 'TEACHING_INTENT_REFUSAL'); assert.equal(r.telemetry.evidence.kind, 'NONE'); });
check('INTENT_GUARD_NO_STATE_ADVANCE', () => { const before = state({ attempts: 2, consecutiveErrors: 1, masteryStatus: 'PRACTICED' }); const r = run('Bagaimana cuaca Jakarta besok?', before); assert.equal(r.teachingIntent, 'OFF_TOPIC'); assert.equal(r.telemetry.evidence.kind, 'NONE'); assert.deepEqual(r.session, before); });
check('INTENT_CLARIFICATION_NO_FAILURE', () => { const before = state({ attempts: 2, consecutiveErrors: 1, masteryStatus: 'PRACTICED' }); const r = run('Bagaimana?', before); assert.equal(r.telemetry.teaching.action, 'CONTEXTUAL_CLARIFICATION'); assert.equal(r.telemetry.evidence.kind, 'NONE'); assert.equal(r.telemetry.next.recordsLearnerFailure, false); assert.deepEqual(r.session, before); });
check('D1B-16', () => { const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8'); assert(route.indexOf("levelTwoAccess?.state !== 'authorized'") < route.indexOf('runActiveTeachingTurn({')); });
check('STT_BOUNDARY_NO_FALSE_FAILURE', () => { const before = state({ consecutiveErrors: 2, masteryStatus: 'PRACTICED' }); const r = run('我明天吧', before, 'VOICE'); assert.equal(r.telemetry.evidence.outcome, 'NO_EVIDENCE'); assert.equal(r.telemetry.evidence.kind, 'NONE'); assert.equal(r.telemetry.evidence.source, 'STT_INTELLIGIBILITY'); assert.equal(r.session.consecutiveErrors, before.consecutiveErrors); assert.equal(r.session.masteryStatus, before.masteryStatus); assert.equal(r.telemetry.next.recordsLearnerFailure, false); });
check('MIXED_LANGUAGE_CLASSIFICATION_CONTRACT', () => { const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8'); assert.match(route, /hasChinese && hasLatin \? 'MIXED'/); });
check('OBJECTIVE_CONTRACT', () => { const r = active.runActiveTeachingTurn({ requestId: 'start', lessonId: 'mandarin-work-level-1-day-27', message: 'Mulai', modality: 'TEXT', startRequested: true, state: null }); assert.equal(r.telemetry.objective.courseReferenceStatus, 'TEMPORARY_TEACHING_OBJECTIVE'); assert.deepEqual(r.telemetry.objective.anchorExpressionIds, ['CN-WORK-D01-I02', 'CN-WORK-D06-I02', 'CN-WORK-D27-I01']); });
check('OFF_SHADOW_ACTIVE_MODES', () => {
  const saved = { flag: process.env.AI_COACH_TEACHING_ENGINE_V1, vercel: process.env.VERCEL_ENV, node: process.env.NODE_ENV, test: process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST };
  delete process.env.AI_COACH_TEACHING_ENGINE_V1; delete process.env.VERCEL_ENV; delete process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST;
  assert.equal(modes.teachingEngineRuntimeMode(), 'OFF');
  process.env.AI_COACH_TEACHING_ENGINE_V1 = 'shadow'; assert.equal(modes.teachingEngineRuntimeMode(), 'SHADOW');
  process.env.AI_COACH_TEACHING_ENGINE_V1 = 'active'; process.env.VERCEL_ENV = 'production'; assert.equal(modes.teachingEngineRuntimeMode(), 'OFF');
  process.env.VERCEL_ENV = 'preview'; assert.equal(modes.teachingEngineRuntimeMode(), 'ACTIVE');
  if (saved.flag == null) delete process.env.AI_COACH_TEACHING_ENGINE_V1; else process.env.AI_COACH_TEACHING_ENGINE_V1 = saved.flag;
  if (saved.vercel == null) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = saved.vercel;
  if (saved.test == null) delete process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST; else process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST = saved.test;
});

const failed = results.filter((item) => item.verdict === 'FAIL');
console.log(JSON.stringify({ suite: 'PHASE_1D_C_ACTIVE', results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} executable cases failed`);
console.log('TEACHING ENGINE PHASE 1D-C: PASS');
console.log('EXECUTABLE_CASES: 14 PASS; 2 BLOCKED');
console.log('MASTERED_IN_SINGLE_SESSION: FORBIDDEN PASS');
console.log('TECH_FAILURE_NO_EVIDENCE: PASS');
fs.rmSync(temporary, { recursive: true, force: true });
