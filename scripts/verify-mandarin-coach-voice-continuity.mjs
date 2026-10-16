import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextPhaseAfterSkippedAssessment, requestScopeAllowsAnonymous } from '../lib/mandarin-coach-access-continuity.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

assert.equal(requestScopeAllowsAnonymous('ACCOUNT_REQUIRED', false), false, 'account-only APIs must remain closed to anonymous requests');
assert.equal(requestScopeAllowsAnonymous('ANONYMOUS_TRIAL_ALLOWED', false), true, 'free trial pronunciation must allow an isolated anonymous scope');
assert.equal(requestScopeAllowsAnonymous('EXTERNAL_ACCESS_VERIFIED', false), true, 'an already verified Preview QA access may receive an isolated scope');
assert.equal(requestScopeAllowsAnonymous('ACCOUNT_REQUIRED', true), true, 'existing stateless Preview behavior must remain available only when its environment switch is active');

assert.equal(nextPhaseAfterSkippedAssessment('RECALL', { hasMeaningOptions: true, hasRoleplay: true }), 'COMPREHENSION');
assert.equal(nextPhaseAfterSkippedAssessment('RECALL', { hasMeaningOptions: false, hasRoleplay: true }), 'ROLEPLAY');
assert.equal(nextPhaseAfterSkippedAssessment('COMPREHENSION', { hasMeaningOptions: true, hasRoleplay: true }), 'ROLEPLAY');
assert.equal(nextPhaseAfterSkippedAssessment('ROLEPLAY', { hasMeaningOptions: true, hasRoleplay: true }), 'COMPLETE');

const scope = read('lib/server/request-account-scope.ts');
assert.match(scope, /policy: RequestAccountScopePolicy = 'ACCOUNT_REQUIRED'/, 'all callers must remain account-only unless they opt into a narrower policy');
assert.match(scope, /scopedServerSessionId\(user\?\.id \|\| null, clientSessionId\)/, 'anonymous trial sessions must remain pseudonymized and isolated by their client session');

const route = read('app/api/mandarin-coach/pronunciation/route.ts');
assert.ok(route.indexOf('getMandarinCoachExpression(expressionId)') < route.indexOf('resolveRequestAccountScope(sessionId, scopePolicy)'), 'the server must identify the canonical lesson before selecting an auth policy');
assert.ok(route.indexOf("levelTwoAccess?.state === 'anonymous'") < route.indexOf("'ANONYMOUS_TRIAL_ALLOWED'"), 'Level 2 access must fail closed before free-trial scope is considered');
assert.ok(route.indexOf('resolveRequestAccountScope(sessionId, scopePolicy)') < route.indexOf('transcribeMandarin('), 'STT must run only after authorization and cost checks');
assert.match(route, /dailyAttemptLimit = 40/, 'daily STT cost protection must remain active');
assert.match(route, /code: 'LOGIN_REQUIRED'/, '401 responses must include an actionable public error code');
assert.doesNotMatch(route, /Authentication required\./, 'the pronunciation API must not expose an English internal error');

const ui = read('components/MandarinAiCoachExperience.tsx');
for (const copy of [
  'Masuk ke akun IndoBrain, lalu coba latihan suara lagi.',
  'Suara belum terdengar jelas. Silakan coba lagi atau lanjutkan belajar.',
  'Simpan untuk review &amp; lewati',
  'Simpan untuk review &amp; akhiri latihan',
  '>Lanjut</button>',
]) assert.ok(ui.includes(copy), `continuity UI is missing: ${copy}`);
assert.match(ui, /saved_for_review: true/, 'skipped items must stay in the review queue');
assert.match(ui, /navigationLockedUntil\.current = Date\.now\(\) \+ 500/, 'navigation must ignore duplicate taps');
assert.match(ui, /response\.status === 401/, 'the client must translate auth failures');
assert.match(ui, /response\.status === 422/, 'the client must translate empty-transcript failures');
assert.match(ui, /'zh-CN-XiaoxiaoNeural'/, 'the standard Mandarin voice lock must remain intact');
assert.match(ui, /X-IndoBrain-Chinese-TTS-Rate/, 'normal and slow TTS response validation must remain intact');

const skipStart = ui.indexOf('function skipAssessment()');
const answerStart = ui.indexOf('function answerComprehension(', skipStart);
const skipBody = ui.slice(skipStart, answerStart);
assert.doesNotMatch(skipBody, /recordPersonalizationEvidence|correct_count|mastery_level/, 'skipping an assessment must not create passing evidence or mastery');

console.log('Mandarin Coach voice/auth continuity verified: free trial scope, Level 2 gate, bounded STT, review-and-skip, assessment escape, duplicate-tap guard, and zh-CN TTS lock.');
