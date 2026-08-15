import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const checks = [];
const assert = (name, passed, detail = '') => checks.push({ name, passed, detail });

const button = read('components/IndonesianSpeechButton.tsx');
const provider = read('components/IndonesianAudioProvider.tsx');
const voice = read('lib/indonesian-voice.ts');
const docs = read('docs/tts-quality-gate.md');
const route = read('app/api/tts/route.ts');
const ttsProvider = read('lib/tts-provider.ts');
const packageJson = JSON.parse(read('package.json'));
const smoke = read('scripts/tts-smoke-test.mjs');
const gitignore = read('.gitignore');

assert('Shared TTS route is used', /fetch\('\/api\/tts'/.test(button));
assert('Azure primary voice is fixed', /id-ID-GadisNeural/.test(ttsProvider));
assert('/api/tts exposes configured voice state', /configured:\s*provider\.configured/.test(route) && /voice:\s*provider\.voice/.test(route));
assert('/api/tts returns audio content type', /Content-Type['"]:\s*['"]audio\//.test(route));
assert('/api/tts returns voice header', /X-IndoBrain-TTS-Voice/.test(route));
assert('/api/tts fails closed when not configured', /status:\s*503/.test(route));
assert('Chinese text is blocked before TTS', /\\u3400-\\u9FFF/.test(button));
assert('Browser utterance language is id-ID', /utterance\.lang\s*=\s*['"]id-ID['"]/.test(button));
assert('Browser fallback requires Indonesian voice', /if\s*\(!voice\)\s*throw new Error\(['"]Indonesian browser voice is not available['"]\)/.test(button));
assert('Browser fallback does not assign null/default voice', !/utterance\.voice\s*=\s*[^;\n]*\?\?\s*null/.test(button));
assert('Indonesian voice detector checks id-ID', /lang\s*===\s*['"]id-id['"]/.test(voice));
assert('Indonesian voice detector checks id prefix', /lang\.startsWith\(['"]id['"]\)/.test(voice));
assert('Indonesian voice detector checks Indonesian name', /indones/i.test(voice));
assert('Startup self-check reports Azure ready/not configured', /Azure TTS:/.test(provider));
assert('Startup self-check reports browser Indonesian voice', /Browser Indonesian voice:/.test(provider));
assert('Startup self-check reports real audio blocked', /TTS REAL AUDIO: BLOCKED/.test(provider));
assert('Local missing Azure is documented as not blocking content development', /LOCAL_AZURE_TTS: NOT CONFIGURED/.test(docs) && /must not be reported as `TTS Real Audio: PASS`/.test(docs));
assert('Permanent TTS smoke test script exists', /Selamat pagi, hari ini kita belajar bahasa Indonesia\./.test(smoke));
assert('Permanent TTS smoke test checks audio content type', /contentType\.startsWith\('audio\/'\)/.test(smoke));
assert('Permanent TTS smoke test checks official voice header', /x-indobrain-tts-voice/.test(smoke) && /id-ID-GadisNeural/.test(smoke));
assert('Permanent TTS smoke test verifies fail closed', /failClosedResponse\.status\s*!==\s*503/.test(smoke));
assert('TTS smoke test is exposed in package scripts', packageJson.scripts?.['smoke:tts'] === 'node scripts/tts-smoke-test.mjs');
assert('TTS quality gate documentation exists', /TTS may be marked `PASS` only when a real user click produces real Indonesian audio/.test(docs));
assert('Golden Scene report fields are documented', /TTS Real Audio: PASS \/ FAIL/.test(docs) && /Human Review Ready: YES \/ NO/.test(docs));
assert('.env files are ignored', /^\.env\*/m.test(gitignore));

const failed = checks.filter((check) => !check.passed);
for (const check of checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? `: ${check.detail}` : ''}`);
}

if (failed.length > 0) {
  console.error(`TTS quality gate failed: ${failed.length} check(s) failed.`);
  process.exit(1);
}

console.log('TTS QUALITY GATE: PASS');
