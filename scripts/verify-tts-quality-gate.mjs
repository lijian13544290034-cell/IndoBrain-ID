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
const gitignore = read('.gitignore');

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
