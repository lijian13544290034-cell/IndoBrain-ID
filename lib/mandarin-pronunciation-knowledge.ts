export type PronunciationRuleId = 'PINYIN' | 'FOUR_TONES' | 'NEUTRAL_TONE' | 'THIRD_TONE' | 'THIRD_TONE_SANDHI' | 'YI_SANDHI' | 'BU_SANDHI' | 'CONNECTED_SPEECH' | 'INDONESIAN_TRANSFER';

export const MANDARIN_PRONUNCIATION_KNOWLEDGE: Record<PronunciationRuleId, { rule: string; beginnerNote: string; examples: string[] }> = {
  PINYIN: { rule: 'Pinyin represents Mandarin sounds; Latin letters do not always match Indonesian spelling.', beginnerNote: 'Baca pinyin sebagai panduan bunyi Mandarin, bukan ejaan Bahasa Indonesia.', examples: ['q ≠ k biasa', 'x ≠ ks'] },
  FOUR_TONES: { rule: 'Mandarin syllables use four lexical tones plus neutral tone.', beginnerNote: 'Nada mengubah arti. Fokus pada satu pasangan bunyi saja.', examples: ['mā / má / mǎ / mà'] },
  NEUTRAL_TONE: { rule: 'Neutral tone is short and light and is lexical/grammatical, not a general consequence of a preceding fourth tone.', beginnerNote: 'Pada 谢谢, xie kedua ringan: xiè xie.', examples: ['谢谢 xiè xie', '好的 hǎo de'] },
  THIRD_TONE: { rule: 'An isolated third tone falls then rises; in connected speech it often changes shape.', beginnerNote: 'Jangan paksa setiap nada ketiga turun-naik penuh saat berbicara.', examples: ['好 hǎo'] },
  THIRD_TONE_SANDHI: { rule: 'Before another third tone, the first third tone is pronounced like a second tone.', beginnerNote: '你好 terdengar ní hǎo dalam ucapan alami, walau pinyin kamus tetap nǐ hǎo.', examples: ['你好: nǐ hǎo → ní hǎo'] },
  YI_SANDHI: { rule: '一 is yí before a fourth tone and yì before first/second/third tones; yī when isolated or counting.', beginnerNote: 'Nada 一 menyesuaikan kata sesudahnya.', examples: ['一个 yí ge', '一天 yì tiān'] },
  BU_SANDHI: { rule: '不 is bú before a fourth tone and bù elsewhere.', beginnerNote: 'Sebelum nada keempat, 不 berubah menjadi bú.', examples: ['不是 bú shì', '不好 bù hǎo'] },
  CONNECTED_SPEECH: { rule: 'Natural Mandarin uses tone sandhi, neutral tones and light syllable linking.', beginnerNote: 'Dengarkan satu frasa utuh, lalu pecah hanya jika sulit.', examples: ['你好', '谢谢'] },
  INDONESIAN_TRANSFER: { rule: 'Indonesian learners may transfer Latin-letter values and often need targeted work on j/q/x, z/c/s, zh/ch/sh and u/ü.', beginnerNote: 'Ambil satu bunyi sulit saja sesuai pertanyaan; jangan pelajari semuanya sekaligus.', examples: ['qù', 'xué', 'lǜ'] },
};

export function pronunciationGrounding(message: string, targetChinese: string | null) {
  const normalized = message.toLowerCase();
  const ids = new Set<PronunciationRuleId>(['PINYIN']);
  if (/你好/.test(targetChinese || message)) ids.add('THIRD_TONE_SANDHI');
  if (/谢谢|好的/.test(targetChinese || message)) ids.add('NEUTRAL_TONE');
  if (/[一]/.test(targetChinese || '')) ids.add('YI_SANDHI');
  if (/[不]/.test(targetChinese || '')) ids.add('BU_SANDHI');
  if (/nada|tone|声调|怎么读|baca|ucap|pelan|慢/.test(normalized)) ids.add('CONNECTED_SPEECH');
  return [...ids].map((id) => ({ id, ...MANDARIN_PRONUNCIATION_KNOWLEDGE[id] }));
}
