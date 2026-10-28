import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { gateway, generateText } from 'ai';

const outputPath = process.argv[2] || 'results/native-coach-intent-v1/model-ab.json';
const rerunNew = process.argv.includes('--rerun-new');
const model = process.env.NATIVE_COACH_MODEL || 'google/gemini-2.5-flash';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const earlySystem = [
  'You are IndoBrain Native Coach V1, a friendly Mandarin teacher for Indonesian beginners. Explain mainly in natural spoken Bahasa Indonesia and use accurate, natural Simplified Chinese for real life and work.',
  'Understand the learner\'s current intent first. Keep their job, role, preferred form of address, current goal, and recent context. Follow interruptions and topic changes immediately.',
  'Answer the practical need first. Do not force a curriculum, repetition, translation drill, quiz, test, or roleplay unless the learner asks for it. Never force the learner back to an earlier lesson.',
  'Be concise: normally answer in at most 120 Indonesian words. Teach at most one clear focus per turn. A requested course plan may contain up to three short steps and one useful clarifying question.',
  'Do not claim mastery without independent evidence. Do not score pronunciation from text. For safety-critical work language, prefer a clear safe action and do not invent machine procedures or store policies.',
  'When you teach one or more Chinese sentences, finish with an [[AUDIO]] block containing 1 to 3 marked teaching sentences. Each line must be: Simplified Chinese only ||| standard Hanyu Pinyin with tone marks ||| natural Indonesian meaning. Put no Latin brand name, Indonesian, English, or pinyin in the Chinese field. Do not add an audio block when no Chinese should be taught.',
  'The [[AUDIO]] block is metadata and is hidden from the learner. Do not mention it in the answer.',
].join('\n');

const newSystem = [
  'You are IndoBrain Native Coach V1, a friendly Mandarin learning assistant for Indonesian beginners.',
  'Understand the learner\'s current request and the real conversation context. Respond mainly in natural spoken Bahasa Indonesia.',
  'Answer the learner\'s specific requested meaning or expression first. Do not replace a specific request with generic greetings or a different beginner topic; offer alternatives only after answering it.',
  'Prefer the shortest standard, natural expression that directly solves the request. Do not invent literal variants when a commonly used expression is available.',
  'You may naturally teach, explain, correct, plan learning, roleplay, answer directly, or chat according to what the learner asks. The learner decides the direction; do not force a curriculum, repetition, translation drill, quiz, test, or roleplay.',
  'When Chinese is useful, use accurate natural Simplified Chinese and include standard tone-marked pinyin plus a brief Indonesian meaning in the response. Do not add Chinese merely to fill a format.',
  'Resolve references such as “yang tadi” from the actual visible history. If the reference does not identify exactly one prior expression, do not guess: ask one brief clarification.',
  'Do not claim mastery without evidence and do not score pronunciation from text. Keep safety-critical work guidance conservative.',
].join('\n');

const cases = [
  ['I1', 'Aku mau kenalan sama orang China, cara bilang nama saya gimana?'],
  ['I2', 'Gimana ngomong nama saya Adi dalam Mandarin?'],
  ['I3', 'Aku mau perkenalkan diri ke bos China.'],
  ['I4', 'Ajari aku bilang umur sama pekerjaan.'],
  ['I5', 'Cara ngenalin teman saya ke orang China gimana?'],
  ['I6', 'Aku mau belajar Mandarin buat kerja, enaknya mulai dari mana?'],
];

function displayedAnswer(raw) {
  return raw.replace(/\[\[\s*AUDIO\s*\]\][\s\S]*?(?:\[\[\s*\/\s*AUDIO\s*\]\]|$)/giu, '').trim();
}

let rows = [];
await mkdir(new URL('../results/native-coach-intent-v1/', import.meta.url), { recursive: true });
try {
  const existing = JSON.parse(await readFile(outputPath, 'utf8'));
  if (existing.model === model && Array.isArray(existing.cases)) rows = existing.cases;
} catch {
  // A missing or invalid output file starts a fresh run.
}
for (const [id, message] of cases) {
  const row = rows.find((candidate) => candidate.id === id) || { id, message };
  for (const [arm, system] of [['EARLY_8CD32E5', earlySystem], ['SPECIFIC_INTENT_V1', newSystem]]) {
    if (row[arm]?.status === 'OK' && !(rerunNew && arm === 'SPECIFIC_INTENT_V1')) continue;
    const started = performance.now();
    try {
      const result = await generateText({
        model: gateway(model), system, prompt: message, maxOutputTokens: 900, temperature: 0.45,
        reasoning: 'none', maxRetries: 1,
        providerOptions: { gateway: { tags: ['indobrain', 'native-coach-intent-ab'], user: `intent-ab-${id.toLowerCase()}` } },
      });
      row[arm] = {
        status: 'OK', model: result.response.modelId || model, raw: result.text,
        displayedAnswer: displayedAnswer(result.text), inputTokens: result.usage.inputTokens || 0,
        outputTokens: result.usage.outputTokens || 0, latencyMs: Math.round(performance.now() - started),
        providerCost: result.providerMetadata?.gateway?.cost ?? null,
      };
    } catch (error) {
      row[arm] = { status: 'ERROR', error: error instanceof Error ? error.message.slice(0, 300) : String(error) };
    }
    const persistedRows = rows.some((candidate) => candidate.id === id) ? rows : rows.concat(row);
    await writeFile(outputPath, JSON.stringify({ executedAt: new Date().toISOString(), model, cases: persistedRows }, null, 2));
    await wait(13_000);
  }
  if (!rows.some((candidate) => candidate.id === id)) rows.push(row);
}
console.log(JSON.stringify({ outputPath, cases: rows.length, successfulArms: rows.flatMap((row) => [row.EARLY_8CD32E5, row.SPECIFIC_INTENT_V1]).filter((arm) => arm?.status === 'OK').length }));
