import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const scoped = (userId, sessionId) => `scope-${createHash('sha256').update(`account:${userId}:session:${sessionId}`).digest('hex').slice(0, 32)}`;
assert.notEqual(scoped('tester-01', 'coach-shared-client-value'), scoped('tester-02', 'coach-shared-client-value'));
assert.equal(scoped('tester-01', 'coach-shared-client-value'), scoped('tester-01', 'coach-shared-client-value'));

const helper = read('lib/server/request-account-scope.ts');
assert.match(helper, /getCurrentAccountUser\(\)/);
assert.match(helper, /AUTH_REQUIRED === 'true'/);
assert.match(helper, /!isStatelessPreviewTestMode\(\)/);
assert.ok(helper.includes('account:${userId}'));
assert.ok(helper.includes('${owner}:session:${clientSessionId}'));

for (const route of ['app/api/mandarin-coach/conversation/route.ts','app/api/mandarin-coach/pronunciation/route.ts','app/api/mandarin-coach/telemetry/route.ts','app/api/events/route.ts','app/api/chat/route.ts']) {
  const source = read(route);
  assert.match(source, /resolveRequestAccountScope/);
  assert.match(source, /status: 401/);
}
const conversation = read('app/api/mandarin-coach/conversation/route.ts');
assert.ok(conversation.indexOf('resolveRequestAccountScope(sessionId)') < conversation.indexOf('answerCoachConversation('));
assert.match(conversation, /sessionId: scopedSessionId/);
const pronunciation = read('app/api/mandarin-coach/pronunciation/route.ts');
assert.ok(pronunciation.indexOf('resolveRequestAccountScope(sessionId)') < pronunciation.indexOf('transcribeMandarin('));
assert.match(pronunciation, /sessionId: scopedSessionId/);
const events = read('app/api/events/route.ts');
assert.doesNotMatch(events, /saveToSupabase\('experience_events', body\)/);
assert.match(events, /session_id: scope\.sessionId/);
assert.doesNotMatch(read('app/api/feedback/route.ts'), /saveToSupabase\('feedback', body\)/);
assert.match(read('lib/server/mandarin-coach-analytics.ts'), /\.\.\.input\.data, anonymous_id: anonymousId, tester_id:/);
assert.match(read('app/api/admin/mandarin-coach-analytics/route.ts'), /requireSuperAdmin\(\)/);
assert.match(read('app/api/mandarin-coach/reset-state/route.ts'), /anonymousTesterId\(user\.id\)/);
const storage = read('lib/supabase-server.ts');
assert.match(storage, /writableTables\.has\(table\)/);
assert.match(storage, /path\.startsWith\('conversations\?'\)/);
const accountConfig = read('lib/account/config.ts');
assert.match(accountConfig, /VERCEL_ENV === 'preview'/);
assert.match(accountConfig, /STATELESS_PREVIEW_TEST_MODE === 'true'/);
assert.match(accountConfig, /if \(isStatelessPreviewTestMode\(\)\) return false/);
assert.match(accountConfig, /if \(isStatelessPreviewTestMode\(\)\) return undefined/);
const level2Access = read('lib/server/mandarin-work-level2-access.ts');
assert.match(level2Access, /if \(isStatelessPreviewTestMode\(\)\) return \{ state: 'authorized', source: 'preview-qa' \}/);
assert.match(read('components/PhoneLoginForm.tsx'), /setLearningProfileScope/);
assert.match(read('components/AccountLogoutActions.tsx'), /clearLearningProfileScope/);
console.log('ACCOUNT ISOLATION VERIFIED');
