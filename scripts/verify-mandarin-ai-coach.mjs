import fs from 'node:fs';

const requiredFiles = [
  'app/learn-chinese/ai-coach/page.tsx',
  'components/MandarinAiCoachExperience.tsx',
  'components/AiCoachConversation.tsx',
  'components/AiCoachRecorder.tsx',
  'lib/mandarin-ai-coach.ts',
  'lib/mandarin-ai-coach-profile.ts',
  'lib/server/mandarin-ai-coach.ts',
  'app/api/mandarin-coach/pronunciation/route.ts',
  'app/api/mandarin-coach/conversation/route.ts',
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
for (const required of ['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini-transcribe', 'Output.object']) if (!server.includes(required)) failures.push(`server contract missing ${required}`);
const pronunciationRoute = fs.readFileSync('app/api/mandarin-coach/pronunciation/route.ts', 'utf8');
if (!pronunciationRoute.includes('dailyAttemptLimit')) failures.push('daily AI cost guard is missing');
if (!pronunciationRoute.includes("audio.type.toLowerCase().split(';', 1)[0].trim()")) failures.push('browser audio MIME parameters are not normalized');
if (!pronunciationRoute.includes("'audio/webm'")) failures.push('browser WebM recordings are not accepted');
if (/zh-TW|zh-HK|Cantonese|yue-/i.test(server)) failures.push('forbidden Chinese voice fallback detected');

const ui = fs.readFileSync('components/MandarinAiCoachExperience.tsx', 'utf8');
for (const required of ['AI 中文教练', 'Pelatih Mandarin AI', 'Mulai Latihan', 'Hari pertama selesai!', '你叫什么名字？', 'Besok kita belajar cara menjawabnya.', "'/api/chinese-tts'", "'/api/mandarin-coach/pronunciation'", 'AiCoachConversation']) if (!ui.includes(required)) failures.push(`UI contract missing ${required}`);
const conversationUi = fs.readFileSync('components/AiCoachConversation.tsx', 'utf8');
for (const required of ['Tanya AI Coach', '问AI教练', 'Tanya dalam Bahasa Indonesia atau 中文.', "'/api/mandarin-coach/conversation'", 'Kembali Belajar', 'Jawaban ini membantu?']) if (!conversationUi.includes(required)) failures.push(`conversation UI missing ${required}`);
const conversationRoute = fs.readFileSync('app/api/mandarin-coach/conversation/route.ts', 'utf8');
for (const required of ['dailyConversationLimit = 30', 'answerCoachConversation', '[mandarin-ai-coach-learning-insight]', 'anonymizeLearningQuestion', 'audio/webm']) if (!conversationRoute.includes(required)) failures.push(`conversation route missing ${required}`);
for (const intent of ['LEARNING_RELATED', 'ROLEPLAY', 'PRONUNCIATION', 'MEANING', 'GRAMMAR', 'WORKPLACE_CHINESE', 'GENERAL_CHINESE', 'OFF_TOPIC']) if (!server.includes(intent)) failures.push(`intent classification missing ${intent}`);
if (!server.includes('Maaf, saya fokus membantu kamu belajar Mandarin')) failures.push('fixed off-topic response is missing');
if (!server.includes('the second 谢 is neutral-tone xie')) failures.push('locked Day 1 tone authority is missing');
if (!server.includes('never invent a general rule that a syllable becomes neutral')) failures.push('谢谢 neutral-tone anti-generalization guard is missing');
if (!server.includes('MUST stay within 1-3 short sentences')) failures.push('beginner answer length guard is missing');
if (!server.includes('Do not add phonology theory unless asked')) failures.push('slow-request teaching guard is missing');
if (!server.includes('answerModel === SMART_MODEL ? FAST_MODEL : SMART_MODEL')) failures.push('cross-model structured conversation retry is missing');
if (!server.includes('generateClassification(SMART_MODEL, 140)')) failures.push('structured intent retry is missing');
if (!server.includes('deterministic-explicit-roleplay')) failures.push('explicit roleplay fast path is missing');
if (!server.includes('recentConversationSummary') || !server.includes('recentTurns.slice(-6)')) failures.push('bounded conversation context is missing');

const proxy = fs.readFileSync('proxy.ts', 'utf8');
if (!proxy.includes("pathname.startsWith('/learn-chinese/')")) failures.push('AI coach route is not covered by public Mandarin access policy');
const telemetry = fs.readFileSync('app/api/mandarin-coach/telemetry/route.ts', 'utf8');
if (!telemetry.includes("console.info('[mandarin-ai-coach-event]'")) failures.push('structured observability telemetry is missing');
if (!telemetry.includes("createHash('sha256')")) failures.push('telemetry session pseudonymization is missing');

if (failures.length) {
  console.error(`Mandarin AI Coach verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Mandarin AI Coach verification passed: Day 1 locked content, AI/STT structure, isolated route, zh-CN fail-closed TTS, UI flow.');
