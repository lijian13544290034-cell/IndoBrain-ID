import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { gateway, generateText } from 'ai';

const OUTPUT = process.argv[2] || 'results/native-coach-natural-teaching/prompt-ab.json';
const MODEL = process.env.NATIVE_COACH_MODEL || 'google/gemini-2.5-flash';
const MINIMAL_SYSTEM = [
  'You are IndoBrain Native Coach V1, a friendly Mandarin learning assistant for Indonesian beginners.',
  'Understand the learner\'s current request and the real conversation context. Respond mainly in natural spoken Bahasa Indonesia.',
  'You may naturally teach, explain, correct, plan learning, roleplay, answer directly, or chat according to what the learner asks. The learner decides the direction; do not force a curriculum, repetition, translation drill, quiz, test, or roleplay.',
  'When Chinese is useful, use accurate natural Simplified Chinese and include standard tone-marked pinyin plus a brief Indonesian meaning in the response. Do not add Chinese merely to fill a format.',
  'If a reference such as “yang tadi” could mean more than one thing, ask one brief clarification instead of guessing.',
  'Do not claim mastery without evidence and do not score pronunciation from text. Keep safety-critical work guidance conservative.',
].join('\n');

const cases = [
  ['A1', 'sebagai pemulai mandarin, saya mau kerja di restoran china, tlg buat res untuk saya ya'],
  ['A2', 'Bang aku mau kerja jadi waiter di resto Cina, mandarin nol besar nih wkwk. Bisa bikinin cara belajar yg cocok buat kerja?'],
  ['B1', 'Aku mau belajar 小明爱我, gimana bacanya?'],
  ['D1', 'Pak aku operator mesin pabrik, bosku China. Tolong susunin latihan Mandarin biar ngerti instruksi mesin sama safety, jangan mulai dari salam doang ya.'],
  ['D2', 'Bro besok aku jadi sopir bos Chinese, bahasa Mandarin kacau banget. Yang penting bisa jemput di bandara dan ngobrol soal tujuan. Latih aku dong.'],
  ['D3', 'Aku kasir minimarket, kalo customer China nanya boleh bayar QRIS gimana jawabnya? Langsung roleplay aja deh, kamu jadi pembeli.'],
  ['D4', 'Kak aku mau kerja jadi ART keluarga Chinese. Bantu dong belajar ngomong soal bersih-bersih, nyuci sama masak. Enaknya mulai dari mana?'],
  ['D5', 'Eh jangan les dulu, aku lagi capek habis kerja. Temenin ngobrol santai aja pake Indo ya, boleh?'],
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
await mkdir(new URL('../results/native-coach-natural-teaching/', import.meta.url), { recursive: true });

for (const [id, prompt] of cases) {
  const row = { id, prompt };
  for (const [arm, system] of [['NO_TEACHING_SYSTEM', undefined], ['MINIMAL_IDENTITY', MINIMAL_SYSTEM]]) {
    const started = performance.now();
    try {
      const result = await generateText({
        model: gateway(MODEL),
        ...(system ? { system } : {}),
        prompt,
        maxOutputTokens: 900,
        temperature: 0.45,
        reasoning: 'none',
        maxRetries: 1,
        providerOptions: { gateway: { tags: ['indobrain', 'native-coach-prompt-ab'], user: `prompt-ab-${id.toLowerCase()}` } },
      });
      row[arm] = {
        status: 'OK',
        model: result.response.modelId || MODEL,
        answer: result.text,
        inputTokens: result.usage.inputTokens || 0,
        outputTokens: result.usage.outputTokens || 0,
        latencyMs: Math.round(performance.now() - started),
        finishReason: result.finishReason,
        providerCost: result.providerMetadata?.gateway?.cost ?? null,
      };
    } catch (error) {
      row[arm] = { status: 'ERROR', error: error instanceof Error ? error.message.slice(0, 300) : String(error), latencyMs: Math.round(performance.now() - started) };
    }
    await writeFile(OUTPUT, JSON.stringify({ executedAt: new Date().toISOString(), model: MODEL, settings: { temperature: 0.45, maxOutputTokens: 900, reasoning: 'none' }, cases: results.concat(row) }, null, 2));
    await wait(13_000);
  }
  results.push(row);
}

console.log(JSON.stringify({ output: OUTPUT, cases: results.length, successfulArms: results.flatMap((row) => [row.NO_TEACHING_SYSTEM, row.MINIMAL_IDENTITY]).filter((arm) => arm?.status === 'OK').length }));
