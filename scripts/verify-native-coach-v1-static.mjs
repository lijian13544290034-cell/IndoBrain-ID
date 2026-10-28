import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const flag = read('lib/account/native-coach-v1.ts');
const teacher = read('lib/server/mandarin-native-coach-v1.ts');
const route = read('app/api/mandarin-coach/native-coach-v1/route.ts');
const page = read('app/coba-gratis/native-coach-v1/page.tsx');
const ui = read('components/NativeCoachV1.tsx');
const breakdown = read('lib/server/mandarin-native-word-breakdown.ts');
const breakdownRoute = read('app/api/mandarin-coach/word-breakdown/route.ts');
const guest = read('app/api/guest/session/route.ts');
const tts = read('app/api/chinese-tts/route.ts');
const legacy = read('app/api/mandarin-coach/free-teaching/route.ts');

assert.match(flag, /VERCEL_ENV === 'preview'/, 'flag must be Preview-only');
assert.match(flag, /NATIVE_COACH_V1 === 'true'/, 'independent Native Coach flag missing');
assert.match(flag, /isGuestModeEnabled/, 'guest security boundary missing');

assert.match(teacher, /google\/gemini-2\.5-flash/, 'recommended model missing');
assert.match(teacher, /streamText\(/, 'model response must stream');
assert.doesNotMatch(teacher, /Output\.object\(/, 'main response must not be forced into a schema');
assert.match(route, /result\.textStream/, 'natural answer must stream as plain text');
assert.match(teacher, /NATIVE_COACH_MAX_OUTPUT_TOKENS = 900/, 'bounded output missing');
assert.match(teacher, /reasoning: 'none'/, 'short-turn reasoning budget control missing');
assert.match(teacher, /streamRetries: 1/, 'single recoverable stream retry missing');
assert.match(teacher, /Do not force a curriculum, repetition, translation drill, quiz, test, or roleplay/i, 'native intent boundary missing');
assert.match(teacher, /Do not add Chinese merely to fill a format/i, 'non-teaching chat must not force Chinese');
assert.doesNotMatch(teacher, /老板，我明天想请假|请问您想点什么/, 'prompt must not inject example lessons every turn');
assert.match(teacher, /slice\(-8\)/, 'recent context bound missing');
assert.match(teacher, /5_000/, 'context character budget missing');
assert.match(teacher, /Learning content actually shown/, 'displayed learning context missing');
assert.match(teacher, /extractNaturalTeachingItems/, 'natural optional card extraction missing');
assert.doesNotMatch(teacher, /expectsChineseTeaching|output-repair|NATIVE_COACH_REPAIR_OUTPUT/, 'forced teaching repair must be removed');
assert.doesNotMatch(teacher, /MUST give one immediately useful Chinese sentence/i, 'job requests must not force a sentence');

assert.match(route, /isNativeCoachV1Enabled/, 'route flag gate missing');
assert.match(route, /resolveGuestScope/, 'guest auth gate missing');
assert.match(route, /consumeGuestTurn/, 'guest quota gate missing');
assert.match(route, /isValidatedSpokenChinese/, 'Chinese validation gate missing');
assert.match(route, /application\/x-ndjson/, 'NDJSON streaming response missing');
assert.match(route, /timeToFirstTextMs/, 'first-text timing missing');
assert.match(route, /fullResponseMs/, 'full-response timing missing');
assert.match(route, /EXPLICIT_VALIDATED_CHINESE_ONLY/, 'TTS policy missing');

assert.match(ui, /response\.body\.getReader\(\)/, 'client stream reader missing');
assert.match(ui, /prepareBrowserAudio\(\)/, 'mobile audio gesture preparation missing');
assert.match(ui, /X-IndoBrain-Chinese-TTS-Voice/, 'TTS voice validation missing');
assert.match(ui, /zh-CN-XiaoxiaoNeural/, 'expected zh-CN voice missing');
assert.match(ui, /Audio Mandarin belum tersedia\. Teks lain tidak akan diputar sebagai pengganti/, 'fail-closed audio recovery missing');
assert.match(ui, /timeToFirstTextMs/, 'client first-text metric missing');
assert.match(ui, /Audio siap dalam/, 'audio-ready timing missing');
assert.match(ui, /teaching: turn\.chinese/, 'displayed cards must be returned in recent context');
assert.match(ui, /Object\.values\(turn\.breakdowns/, 'displayed breakdowns must be returned in recent context');
assert.match(ui, /拆词 ·/, 'on-demand word breakdown control missing');

assert.match(breakdown, /natural word segmentation, not mechanical character-by-character splitting/i, 'natural segmentation rule missing');
assert.match(breakdown, /personal names, place names, fixed expressions/i, 'name and fixed-expression boundary missing');
assert.match(breakdown, /polyphonic characters/i, 'polyphonic context rule missing');
assert.match(breakdown, /Output\.object/, 'on-demand breakdown schema missing');
assert.match(breakdownRoute, /isNativeCoachV1Enabled/, 'breakdown Preview flag gate missing');
assert.match(breakdownRoute, /resolveGuestScope/, 'breakdown guest auth missing');
assert.match(breakdownRoute, /consumeGuestTurn/, 'breakdown cost control missing');
assert.match(breakdownRoute, /isValidatedSpokenChinese/, 'breakdown Chinese validation missing');

assert.match(page, /isNativeCoachV1Enabled/, 'page flag gate missing');
assert.match(guest, /\/coba-gratis\/native-coach-v1/, 'guest redirect allowlist missing');
assert.match(tts, /isValidatedSpokenChinese/, 'shared TTS validator not reused');
assert.match(tts, /X-IndoBrain-Chinese-TTS-Voice/, 'shared Azure voice header missing');
assert.match(legacy, /answerFreeTeaching/, 'Legacy coach route was removed');

for (const source of [flag, teacher, route, page, ui, breakdown, breakdownRoute]) {
  assert.doesNotMatch(source, /AZURE_SPEECH_KEY\s*=|AI_GATEWAY_API_KEY\s*=|VERCEL_OIDC_TOKEN\s*=/, 'secret literal must not be added');
}

console.log('NATIVE COACH V1 STATIC: PASS (single-call natural streaming, displayed context, on-demand breakdown, guest quota, explicit zh-CN TTS, Legacy retained)');
