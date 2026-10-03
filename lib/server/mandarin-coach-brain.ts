import 'server-only';

import type { CoachBrainSkillId, CoachDetectedLanguage, CoachIntent, UserInitiatedMemory } from '@/lib/mandarin-ai-coach';
import { getCoachSkills } from '@/lib/mandarin-coach-skills';
import { pronunciationGrounding } from '@/lib/mandarin-pronunciation-knowledge';

export type CoachBrainPlan = {
  normalizedInput: string;
  inputLanguage: CoachDetectedLanguage;
  learningIntents: CoachIntent[];
  skillIds: CoachBrainSkillId[];
  targetChinese: string | null;
  modelTier: 'FAST' | 'SMART';
  offTopic: boolean;
  slowSpeech: boolean;
  confidence: number;
};

export type CoachBrainAnswer = {
  answer: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  followUp: string;
  summary: string;
  ttsRate: 'normal' | 'slow';
  teachingStrategy: string;
  rememberTarget: boolean;
  targetChinese: string;
  targetPinyin: string;
  targetMeaning: string;
  skillGap: boolean;
  skillGapReason: string;
};

const OFF_TOPIC = /bitcoin|saham|cuaca|weather|game|gim|seleb|artis|coding|programming|matematika|berita hari ini/i;
const WORKPLACE = /bos|老板|atasan|hr\b|interview|面试|pabrik|工厂|gudang|仓库|供应商|supplier|客户|kantor|办公室|logistik|produksi|库存|发货|mesin|机器|文件|辛苦了/i;
const PRONUNCIATION = /怎么读|baca|ucap|pelafalan|pengucapan|tone|nada|声调|pelan|perlahan|慢一点|慢点/i;
const MEANING = /什么意思|apa artinya|artinya apa|maksudnya|berarti apa/i;
const CORRECTION = /bener ga|benar (?:nggak|tidak)|对吗|betul ga|salah ga/i;
const EXAMPLE = /contoh|例子|换一个|lain/i;
const REVIEW = /review|复习|ulang(?:i)? kata|masih ingat/i;
const ROLEPLAY = /\brole[ -]?play\b|bermain peran|角色扮演/i;
const VOCABULARY = /mandarin apa|bahasa mandarin apa|中文怎么说|gimana ngomong|gmana ngomong|gmn ngomong|怎么说/i;
const GRAMMAR = /grammar|tata bahasa|语法|kenapa.*(?:pakai|用)/i;

const PINYIN_TARGETS: Record<string, string> = {
  xiexie: '谢谢', 'xie xie': '谢谢', 'wo e le': '我饿了', 'ni hao': '你好', feichang: '非常',
};

export function normalizeCoachInput(input: string) {
  return input
    .trim()
    .replace(/\bgmn\b/gi, 'gimana')
    .replace(/\bgmana\b/gi, 'gimana')
    .replace(/\bbener\b/gi, 'benar')
    .replace(/\bga\b/gi, 'nggak')
    .replace(/\s+/g, ' ');
}

function detectLanguage(message: string): CoachDetectedLanguage {
  const hasChinese = /[\u3400-\u9FFF]/.test(message);
  const hasLatin = /[A-Za-z]/.test(message);
  return hasChinese && hasLatin ? 'MIXED' : hasChinese ? 'CHINESE' : 'INDONESIAN';
}

function extractTarget(message: string) {
  const chunks = message.match(/[\u3400-\u9FFF]+/g);
  if (chunks?.length) {
    const ignored = new Set(['什么意思', '怎么读', '怎么说', '老板']);
    const useful = chunks.find((chunk) => !ignored.has(chunk)) || chunks[0];
    return useful.replace(/什么意思|怎么读|怎么说/g, '') || null;
  }
  const latin = message.toLowerCase().replace(/[?.!,]/g, ' ');
  for (const [pinyin, chinese] of Object.entries(PINYIN_TARGETS)) if (latin.includes(pinyin)) return chinese;
  if (/minum/.test(latin)) return '喝';
  return null;
}

function skillIdsFor(intents: CoachIntent[]) {
  const ids = new Set<CoachBrainSkillId>();
  for (const intent of intents) {
    if (intent === 'ROLEPLAY') ids.add('CONVERSATION');
    else if (intent === 'GRAMMAR') ids.add('MEANING');
    else if (intent !== 'OFF_TOPIC') ids.add(intent);
  }
  if (!ids.size && !intents.includes('OFF_TOPIC')) ids.add('CONVERSATION');
  return [...ids];
}

export function routeCoachInput(input: string): CoachBrainPlan {
  const normalizedInput = normalizeCoachInput(input);
  const inputLanguage = detectLanguage(normalizedInput);
  const learningIntents = new Set<CoachIntent>();
  const offTopic = OFF_TOPIC.test(normalizedInput) && !WORKPLACE.test(normalizedInput) && !/[\u3400-\u9FFF]/.test(normalizedInput);
  if (offTopic) learningIntents.add('OFF_TOPIC');
  else {
    if (ROLEPLAY.test(normalizedInput)) learningIntents.add('ROLEPLAY');
    if (PRONUNCIATION.test(normalizedInput)) learningIntents.add('PRONUNCIATION');
    if (MEANING.test(normalizedInput)) learningIntents.add('MEANING');
    if (CORRECTION.test(normalizedInput)) learningIntents.add('CORRECTION');
    if (EXAMPLE.test(normalizedInput)) learningIntents.add('EXAMPLE');
    if (REVIEW.test(normalizedInput)) learningIntents.add('REVIEW');
    if (WORKPLACE.test(normalizedInput)) learningIntents.add('WORKPLACE');
    if (VOCABULARY.test(normalizedInput) || /minum/i.test(normalizedInput)) learningIntents.add('VOCABULARY');
    if (GRAMMAR.test(normalizedInput)) learningIntents.add('GRAMMAR');
    if (!learningIntents.size) learningIntents.add('CONVERSATION');
  }
  const intents = [...learningIntents];
  const modelTier = intents.some((intent) => intent === 'ROLEPLAY' || intent === 'GRAMMAR' || intent === 'WORKPLACE' || intent === 'CORRECTION') ? 'SMART' : 'FAST';
  return {
    normalizedInput, inputLanguage, learningIntents: intents, skillIds: skillIdsFor(intents), targetChinese: extractTarget(normalizedInput),
    modelTier, offTopic, slowSpeech: /pelan|perlahan|lebih lambat|慢一点|慢点/i.test(normalizedInput), confidence: intents[0] === 'CONVERSATION' ? 0.45 : 0.92,
  };
}

export function buildSkillGrounding(plan: CoachBrainPlan) {
  return {
    selectedSkills: getCoachSkills(plan.skillIds).map((skill) => ({
      skill_id: skill.skill_id, version: skill.version, teaching_goal: skill.teaching_goal,
      teaching_strategy: skill.teaching_strategy, rules: skill.rules, indonesian_learner_notes: skill.indonesian_learner_notes,
      fallback_strategy: skill.fallback_strategy, output_constraints: skill.output_constraints,
    })),
    pronunciationKnowledge: plan.skillIds.includes('PRONUNCIATION') ? pronunciationGrounding(plan.normalizedInput, plan.targetChinese) : [],
  };
}

function answer(values: Partial<CoachBrainAnswer> & Pick<CoachBrainAnswer, 'answer'>): CoachBrainAnswer {
  return {
    chinese: '', pinyin: '', indonesian: '', followUp: '', summary: '', ttsRate: 'normal', teachingStrategy: 'DIRECT', rememberTarget: false,
    targetChinese: '', targetPinyin: '', targetMeaning: '', skillGap: false, skillGapReason: '', ...values,
  };
}

export function composeKnownCoachResponse(plan: CoachBrainPlan, memory: UserInitiatedMemory[]): CoachBrainAnswer | null {
  const message = plan.normalizedInput.toLowerCase();
  if (plan.offTopic) return answer({ answer: 'Maaf, saya fokus membantu kamu belajar Mandarin 😊', indonesian: 'Kalau ada pertanyaan tentang bahasa Mandarin, pekerjaan, percakapan, atau pengucapan, tanya saya ya.', followUp: 'Kembali Belajar', teachingStrategy: 'OFF_TOPIC_FIXED_REPLY' });
  if (plan.skillIds.includes('REVIEW')) {
    const item = [...memory].sort((a, b) => Number(b.saved_for_review) - Number(a.saved_for_review) || b.fail_count - a.fail_count || a.mastery_level - b.mastery_level)[0];
    if (item) return answer({ answer: `Kamu pernah belajar ${item.expression}. Masih ingat artinya?`, chinese: item.expression, pinyin: item.pinyin, indonesian: item.meaning_id, followUp: 'Coba jawab tanpa melihat.', teachingStrategy: 'EXPLAINABLE_MEMORY_REVIEW' });
  }
  if (/minum/.test(message) || plan.targetChinese === '喝') return answer({ answer: message.includes('喝') ? '“喝” sudah merupakan kata Mandarin untuk “minum”.' : 'Dalam Mandarin, “minum” adalah:', chinese: '喝', pinyin: 'hē', indonesian: 'minum', followUp: 'Contoh: 喝水 · hē shuǐ · minum air. Mau coba ucapkan “喝”?', teachingStrategy: 'VOCABULARY_ONE_EXAMPLE', rememberTarget: true, targetChinese: '喝', targetPinyin: 'hē', targetMeaning: 'minum' });
  if (plan.targetChinese === '我饿了' || /wo e le/.test(message)) return answer({ answer: plan.skillIds.includes('CORRECTION') ? 'Ya, maksudmu sudah benar. Bentuk dengan nada yang tepat:' : 'Artinya “Saya lapar”. Bacanya:', chinese: '我饿了', pinyin: 'wǒ è le', indonesian: 'Saya lapar.', followUp: 'Coba ucapkan perlahan: wǒ · è · le.', teachingStrategy: plan.skillIds.includes('CORRECTION') ? 'CORRECTION_MODEL_TARGET' : 'MEANING_DIRECT', rememberTarget: true, targetChinese: '我饿了', targetPinyin: 'wǒ è le', targetMeaning: 'Saya lapar.' });
  if (plan.targetChinese === '非常') return answer({ answer: '“非常” dibaca:', chinese: '非常', pinyin: 'fēi cháng', indonesian: 'sangat', followUp: 'Dua bagian: fēi · cháng.', teachingStrategy: 'PRONUNCIATION_CHUNKS', rememberTarget: true, targetChinese: '非常', targetPinyin: 'fēi cháng', targetMeaning: 'sangat' });
  if (plan.targetChinese === '这个') return answer({ answer: 'Artinya:', chinese: '这个', pinyin: 'zhè ge', indonesian: 'ini / yang ini', followUp: 'Contoh singkat: 这个好 · zhè ge hǎo · ini bagus.', teachingStrategy: 'MEANING_ONE_EXAMPLE', rememberTarget: true, targetChinese: '这个', targetPinyin: 'zhè ge', targetMeaning: 'ini / yang ini' });
  if (plan.targetChinese === '谢谢' || /xiexie|xie xie/.test(message)) return answer({ answer: 'Artinya “terima kasih”. Suku kata kedua ringan (nada netral).', chinese: '谢谢', pinyin: 'xiè xie', indonesian: 'terima kasih', followUp: 'Dengarkan lalu coba: xiè · xie.', teachingStrategy: 'PRONUNCIATION_NEUTRAL_TONE', rememberTarget: true, targetChinese: '谢谢', targetPinyin: 'xiè xie', targetMeaning: 'terima kasih' });
  if (plan.targetChinese === '你好' && plan.skillIds.includes('PRONUNCIATION')) return answer({ answer: 'Pinyinnya nǐ hǎo. Dalam ucapan alami, nada ketiga pertama berubah sehingga terdengar seperti ní hǎo.', chinese: '你好', pinyin: 'nǐ hǎo → ní hǎo', indonesian: 'halo', followUp: 'Dengarkan frasa utuh, lalu coba sekali.', ttsRate: plan.slowSpeech ? 'slow' : 'normal', teachingStrategy: 'THIRD_TONE_SANDHI', rememberTarget: true, targetChinese: '你好', targetPinyin: 'nǐ hǎo', targetMeaning: 'halo' });
  if (plan.slowSpeech) return answer({ answer: 'Baik. Audio berikut benar-benar diperlambat.', chinese: plan.targetChinese || '你好', pinyin: plan.targetChinese === '谢谢' ? 'xiè xie' : 'nǐ hǎo', indonesian: plan.targetChinese === '谢谢' ? 'terima kasih' : 'halo', followUp: 'Dengarkan satu kali, lalu ulangi.', ttsRate: 'slow', teachingStrategy: 'ACTUAL_SLOW_TTS' });
  if (/辛苦了/.test(plan.normalizedInput)) return answer({ answer: 'Di tempat kerja, 辛苦了 berarti bos menghargai usaha kamu. Jawaban paling sederhana:', chinese: '谢谢，不辛苦。', pinyin: 'xiè xie, bù xīn kǔ', indonesian: 'Terima kasih, tidak apa-apa.', followUp: 'Kalau mau lebih singkat, jawab: 谢谢。', teachingStrategy: 'WORKPLACE_PRAGMATICS', rememberTarget: true, targetChinese: '辛苦了', targetPinyin: 'xīn kǔ le', targetMeaning: 'terima kasih atas kerja kerasmu' });
  if (/interview/.test(message) && /3 tahun|tiga tahun/.test(message)) return answer({ answer: 'Saat interview kerja, kamu bisa bilang:', chinese: '我有三年工作经验。', pinyin: 'wǒ yǒu sān nián gōng zuò jīng yàn', indonesian: 'Saya punya pengalaman kerja tiga tahun.', followUp: 'Coba ucapkan per bagian: 我有 · 三年 · 工作经验。', teachingStrategy: 'WORKPLACE_INTERVIEW', rememberTarget: true, targetChinese: '我有三年工作经验。', targetPinyin: 'wǒ yǒu sān nián gōng zuò jīng yàn', targetMeaning: 'Saya punya pengalaman kerja tiga tahun.' });
  if (/老板.*明天/.test(plan.normalizedInput)) return answer({ answer: 'Kalau kamu ingin bertanya sopan kepada bos, bisa bilang:', chinese: '老板，明天发货，可以吗？', pinyin: 'lǎo bǎn, míng tiān fā huò, kě yǐ ma?', indonesian: 'Bos, kirim barang besok, boleh?', followUp: 'Kamu boleh mengganti 发货 sesuai pekerjaanmu.', teachingStrategy: 'WORKPLACE_SENTENCE_COMPLETION' });
  return null;
}
