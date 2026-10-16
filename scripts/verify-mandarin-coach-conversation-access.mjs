import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const route = read('app/api/mandarin-coach/conversation/route.ts');

const lessonLookup = route.indexOf('getMandarinCoachLesson(context.lessonId)');
const levelTwoGate = route.indexOf("levelTwoAccess?.state !== 'authorized'");
const freeTrialPolicy = route.indexOf("courseLesson.source === 'MANDARIN_WORK_LEVEL_1'");
const scopeResolution = route.indexOf('resolveRequestAccountScope(sessionId, scopePolicy)');
const modelCall = route.indexOf('answerCoachConversation(');

assert.ok(lessonLookup >= 0 && lessonLookup < freeTrialPolicy, 'the canonical lesson must be verified before anonymous policy selection');
assert.ok(levelTwoGate >= 0 && levelTwoGate < freeTrialPolicy, 'Level 2 must fail closed before free-trial policy selection');
assert.ok(freeTrialPolicy < scopeResolution && scopeResolution < modelCall, 'scope and cost authorization must complete before the model call');
assert.match(route, /courseLesson\.source === 'MANDARIN_WORK_LEVEL_1'[\s\S]*\? 'ANONYMOUS_TRIAL_ALLOWED'/, 'only Level 1 may opt into anonymous trial access');
assert.match(route, /levelTwoAccess\?\.source === 'preview-qa' \? 'EXTERNAL_ACCESS_VERIFIED' : 'ACCOUNT_REQUIRED'/, 'restricted sources must retain account or verified Preview access');
assert.match(route, /status: 403/, 'unauthorized Level 2 must remain forbidden');
assert.match(route, /code: 'LEVEL2_ACCESS_REQUIRED'/, 'Level 2 denial must expose a stable public error code');
assert.match(route, /code: 'LOGIN_REQUIRED'/, 'account-only denial must expose a stable public error code');
assert.doesNotMatch(route, /Authentication required\./, 'the API must not expose an English internal authentication error');
assert.match(route, /dailyConversationLimit = 30/, 'daily cost protection must remain active');
assert.match(route, /allowConversation\(scopedSessionId\)/, 'rate limiting must use the isolated scoped session');
assert.match(route, /recentTurns: recentTurns\.slice\(-6\)/, 'conversation context must remain bounded');
assert.match(route, /audio\.size < 128 \|\| audio\.size > 5_000_000/, 'voice input validation must remain bounded');
assert.match(route, /Suara belum terdengar jelas\. Silakan rekam lagi\./, 'empty STT must remain a retryable Indonesian error');

console.log('MANDARIN COACH CONVERSATION ACCESS: PASS (Level 1 anonymous trial; Level 2 fail-closed; isolated sessions, limits, input validation, and cost gates preserved)');
