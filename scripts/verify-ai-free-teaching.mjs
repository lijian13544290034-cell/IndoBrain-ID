import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildExplicitChineseSpeechSegments, coachSpeechMetrics, isValidatedSpokenChinese } from '../lib/mandarin-coach-speech.ts';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

assert.equal(isValidatedSpokenChinese('欢迎光临！'), true);
assert.equal(isValidatedSpokenChinese('分酒器是什么？'), true);
assert.equal(isValidatedSpokenChinese('你好 nǐ hǎo'), false);
assert.equal(isValidatedSpokenChinese('Artinya 分酒器'), false);
assert.equal(isValidatedSpokenChinese('Silakan tunggu'), false);

const segments = buildExplicitChineseSpeechSegments(['欢迎光临！', '欢迎光临！', '请稍等。', 'qǐng 请']);
assert.deepEqual(segments, [
  { language: 'zh-CN', text: '欢迎光临！' },
  { language: 'zh-CN', text: '请稍等。' },
]);
assert.deepEqual(coachSpeechMetrics(segments), {
  eligibleRequestCount: 2,
  billableCharacters: 9,
  chineseRequestCount: 2,
  nonChineseRequestCount: 0,
});

const [flag, route, teacher, client, ttsRoute] = await Promise.all([
  read('lib/account/ai-free-teaching.ts'),
  read('app/api/mandarin-coach/free-teaching/route.ts'),
  read('lib/server/mandarin-free-teacher.ts'),
  read('components/FreeTeachingExperience.tsx'),
  read('app/api/chinese-tts/route.ts'),
]);

assert.match(flag, /VERCEL_ENV === 'preview'/);
assert.match(flag, /AI_FREE_TEACHING === 'true'/);
assert.match(flag, /isGuestModeEnabled/);
assert.match(route, /resolveGuestScope/);
assert.match(route, /consumeGuestTurn/);
assert.doesNotMatch(route, /resolveRequestAccountScope/);
assert.doesNotMatch(route, /looksLikeAttempt|composeMiniCourseResponse|runActiveTeachingTurn/);
assert.match(teacher, /spokenChinese/);
assert.match(teacher, /No course library is injected into this request/i);
assert.doesNotMatch(teacher, /buildMiniCourse|optionalCourseReference/);
assert.match(teacher, /question.*NOT an attempted answer/i);
assert.match(teacher, /test request must produce at least one concrete question/i);
assert.match(teacher, /request to continue is never evidence of correctness/i);
assert.doesNotMatch(client, /playChinese\(.*\).*useEffect/s);
assert.match(client, /localStorage\.setItem/);
assert.match(ttsRoute, /isValidatedSpokenChinese/);

console.log('AI Free Teaching V1 static and speech-policy verification passed.');

