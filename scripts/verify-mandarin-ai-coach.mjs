import fs from 'node:fs';

const requiredFiles = [
  'app/learn-chinese/ai-coach/page.tsx',
  'components/MandarinAiCoachExperience.tsx',
  'components/AiCoachRecorder.tsx',
  'lib/mandarin-ai-coach.ts',
  'lib/mandarin-ai-coach-profile.ts',
  'lib/server/mandarin-ai-coach.ts',
  'app/api/mandarin-coach/pronunciation/route.ts',
  'app/api/mandarin-coach/status/route.ts',
  'app/api/mandarin-coach/telemetry/route.ts',
];

const failures = [];
for (const file of requiredFiles) if (!fs.existsSync(file)) failures.push(`missing ${file}`);

const data = fs.readFileSync('lib/mandarin-ai-coach.ts', 'utf8');
for (const exact of [
  "chinese: '你好', pinyin: 'Nǐ hǎo', indonesian: 'Halo'",
  "chinese: '谢谢', pinyin: 'Xiè xie', indonesian: 'Terima kasih'",
  "chinese: '好的', pinyin: 'Hǎo de', indonesian: 'Baik / Oke'",
  "mastery_level: 0",
]) if (!data.includes(exact)) failures.push(`missing locked content: ${exact}`);
if ((data.match(/id: 'AI-D1-/g) || []).length !== 3) failures.push('Day 1 must contain exactly 3 expressions');

const server = fs.readFileSync('lib/server/mandarin-ai-coach.ts', 'utf8');
for (const required of ['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini-transcribe', 'Output.object', "zeroDataRetention: true"]) if (!server.includes(required)) failures.push(`server contract missing ${required}`);
const pronunciationRoute = fs.readFileSync('app/api/mandarin-coach/pronunciation/route.ts', 'utf8');
if (!pronunciationRoute.includes('dailyAttemptLimit')) failures.push('daily AI cost guard is missing');
if (/zh-TW|zh-HK|Cantonese|yue-/i.test(server)) failures.push('forbidden Chinese voice fallback detected');

const ui = fs.readFileSync('components/MandarinAiCoachExperience.tsx', 'utf8');
for (const required of ['AI 中文教练', 'Pelatih Mandarin AI', 'Mulai Latihan', 'Hari pertama selesai!', '你叫什么名字？', 'Besok kita belajar cara menjawabnya.', "'/api/chinese-tts'", "'/api/mandarin-coach/pronunciation'"]) if (!ui.includes(required)) failures.push(`UI contract missing ${required}`);

const proxy = fs.readFileSync('proxy.ts', 'utf8');
if (!proxy.includes("pathname.startsWith('/learn-chinese/')")) failures.push('AI coach route is not covered by public Mandarin access policy');

if (failures.length) {
  console.error(`Mandarin AI Coach verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Mandarin AI Coach verification passed: Day 1 locked content, AI/STT structure, isolated route, zh-CN fail-closed TTS, UI flow.');
