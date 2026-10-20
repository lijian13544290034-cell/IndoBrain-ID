import type { LearningDirection } from './teaching-engine/integration-contracts';

export type TeachingIntentVerdict = 'LEARNING_RELATED' | 'OFF_TOPIC' | 'AMBIGUOUS';

export type TeachingIntentGuardResult = {
  verdict: TeachingIntentVerdict;
  reason:
    | 'EXPLICIT_LEARNING_INTENT'
    | 'CURRENT_COURSE_REFERENCE'
    | 'CONTEXTUAL_CONTINUATION'
    | 'TARGET_LANGUAGE_ATTEMPT'
    | 'DISGUISED_NON_LEARNING_TASK'
    | 'EXPLICIT_NON_LEARNING_DOMAIN'
    | 'INSUFFICIENT_CONTEXT'
    | 'COACH_CONTEXT_DEFAULT';
  confidence: 'HIGH' | 'MEDIUM';
};

export type TeachingIntentGuardInput = {
  direction: LearningDirection;
  message: string;
  currentCourseText: string[];
  recentTurns: Array<{ role: 'user' | 'assistant'; text: string }>;
  activeTeaching: boolean;
};

export function collectTeachingContextStrings(value: unknown, limit = 120) {
  const result: string[] = [];
  const visit = (entry: unknown) => {
    if (result.length >= limit || entry == null) return;
    if (typeof entry === 'string') {
      const text = normalize(entry);
      if (text) result.push(text.slice(0, 240));
      return;
    }
    if (Array.isArray(entry)) {
      for (const item of entry) visit(item);
      return;
    }
    if (typeof entry === 'object') {
      for (const item of Object.values(entry as Record<string, unknown>)) visit(item);
    }
  };
  visit(value);
  return [...new Set(result)];
}

const EXPLICIT_LEARNING = /(?:mandarin|bahasa\s+(?:mandarin|indonesia)|中文|汉语|普通话|印尼语|bahasa\s+cina|pinyin|拼音|声调|nada|pelafalan|pengucapan|发音|怎么读|怎么说|如何说|apa\s+artinya|artinya\s+apa|什么意思|terjemah|翻译|grammar|tata\s+bahasa|语法|contoh\s+kalimat|例句|role[ -]?play|角色扮演|latihan|练习|ulang(?:i)?|再说一遍|再说一次|慢一点|慢点|lebih\s+pelan|tidak\s+mengerti|tidak\s+bisa|nggak\s+(?:mengerti|bisa)|gak\s+(?:mengerti|bisa)|我不懂|我不会|听不懂|为什么这么说|kenapa\s+(?:dibaca|bilang|pakai))/i;
const WORKPLACE_LEARNING = /(?:bos|老板|atasan|pabrik|工厂|gudang|仓库|kantor|办公室|interview|面试).{0,28}(?:ngomong|bilang|说|回答|jawab|artinya|maksud)/i;
const CONTINUATION = /^(?:kenapa|mengapa|为什么|为什么呢|再说一遍|再来一次|ulang(?:i)?|lagi|pelan|慢一点|慢点|saya\s+tidak\s+(?:tahu|bisa|mengerti)|aku\s+tidak\s+(?:tahu|bisa|mengerti)|我不懂|我不会|听不懂|这个呢|yang\s+ini|bagaimana|gimana|terus)\s*[?？!.。]*$/i;
const AMBIGUOUS = /^(?:ini|itu|yang\s+ini|这个|这个呢|itu\s+gimana|bagaimana|gimana|kenapa|mengapa|terus|然后呢|呢|tolong|帮我)\s*[?？!.。]*$/i;
const NON_LEARNING_DOMAIN = /(?:saham|股票|bitcoin|比特币|crypto|kripto|cuaca|天气|ramalan\s+cuaca|weather|politik|政治|pemilu|明星|selebriti|gosip|game|游戏|matematika|数学|diagnosis|诊断)/i;
const DISGUISED_FULL_TASK = /(?:(?:tulis|buat(?:kan)?|生成|写|编写).{0,24}(?:program|kode|coding|aplikasi|网站|代码).{0,24}(?:lengkap|完整)|(?:program|kode|coding|代码).{0,24}(?:lengkap|完整)|(?:selesaikan|hitungkan|解答|计算).{0,24}(?:soal|persamaan|数学|matematika)|(?:rekomendasi|pilihkan|建议|推荐).{0,24}(?:saham|股票|crypto|kripto|investasi)|(?:tulis|buat(?:kan)?|生成|写).{0,24}(?:artikel|esai|宣传文|演讲稿|campaign|kampanye).{0,24}(?:lengkap|完整|politik|政治)|(?:写|生成).{0,20}(?:完整|政治).{0,20}(?:宣传文|演讲稿|文章))/i;
const SHORT_TRANSLATION_FRAME = /(?:bagaimana\s+(?:mengatakan|bilang)|apa\s+(?:bahasa|mandarin)|dalam\s+(?:mandarin|bahasa\s+indonesia)|中文怎么说|印尼语怎么说|怎么说)/i;

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function refersToCurrentCourse(message: string, courseText: string[]) {
  const compact = message.toLocaleLowerCase().replace(/[\s，。！？,.!?]/g, '');
  return courseText.some((entry) => {
    const candidate = normalize(entry).toLocaleLowerCase().replace(/[\s，。！？,.!?]/g, '');
    return candidate.length >= 2 && compact.includes(candidate);
  });
}

function isTargetLanguageAttempt(direction: LearningDirection, message: string) {
  if (direction === 'ID_TO_ZH') return /[\u3400-\u9fff]/.test(message);
  return /\b(?:saya|aku|kamu|anda|dia|ini|itu|mau|tidak|nggak|sudah|belum|kerja|pergi|datang|terima\s+kasih|halo|selamat)\b/i.test(message);
}

export function evaluateTeachingIntent(input: TeachingIntentGuardInput): TeachingIntentGuardResult {
  const message = normalize(input.message);
  const hasRecentTeachingContext = input.activeTeaching || input.recentTurns.some((turn) => turn.role === 'assistant' && turn.text.trim().length > 0);

  if (DISGUISED_FULL_TASK.test(message)) {
    return { verdict: 'OFF_TOPIC', reason: 'DISGUISED_NON_LEARNING_TASK', confidence: 'HIGH' };
  }
  if (EXPLICIT_LEARNING.test(message) || WORKPLACE_LEARNING.test(message) || SHORT_TRANSLATION_FRAME.test(message)) {
    return { verdict: 'LEARNING_RELATED', reason: 'EXPLICIT_LEARNING_INTENT', confidence: 'HIGH' };
  }
  if (refersToCurrentCourse(message, input.currentCourseText)) {
    return { verdict: 'LEARNING_RELATED', reason: 'CURRENT_COURSE_REFERENCE', confidence: 'HIGH' };
  }
  if (CONTINUATION.test(message) && hasRecentTeachingContext) {
    return { verdict: 'LEARNING_RELATED', reason: 'CONTEXTUAL_CONTINUATION', confidence: 'HIGH' };
  }
  if (NON_LEARNING_DOMAIN.test(message)) {
    return { verdict: 'OFF_TOPIC', reason: 'EXPLICIT_NON_LEARNING_DOMAIN', confidence: 'HIGH' };
  }
  if (AMBIGUOUS.test(message)) {
    return hasRecentTeachingContext
      ? { verdict: 'LEARNING_RELATED', reason: 'CONTEXTUAL_CONTINUATION', confidence: 'MEDIUM' }
      : { verdict: 'AMBIGUOUS', reason: 'INSUFFICIENT_CONTEXT', confidence: 'MEDIUM' };
  }
  if (isTargetLanguageAttempt(input.direction, message)) {
    return { verdict: 'LEARNING_RELATED', reason: 'TARGET_LANGUAGE_ATTEMPT', confidence: 'MEDIUM' };
  }
  return { verdict: 'LEARNING_RELATED', reason: 'COACH_CONTEXT_DEFAULT', confidence: 'MEDIUM' };
}

export function teachingIntentGuardReply(direction: LearningDirection, verdict: Exclude<TeachingIntentVerdict, 'LEARNING_RELATED'>) {
  if (direction === 'ZH_TO_ID') {
    return verdict === 'OFF_TOPIC'
      ? { answer: '抱歉，我只帮助你学习印尼语。你可以问印尼语表达、发音、语法或工作场景用语。', followUp: '返回印尼语学习', teachingStrategy: 'TEACHING_INTENT_REFUSAL' as const }
      : { answer: '你是想学习这句话的印尼语表达、意思，还是发音？', followUp: '', teachingStrategy: 'TEACHING_INTENT_CLARIFICATION' as const };
  }
  return verdict === 'OFF_TOPIC'
    ? { answer: 'Maaf, saya hanya membantu kamu belajar Mandarin. Kamu bisa bertanya tentang arti, pengucapan, tata bahasa, atau percakapan kerja.', followUp: 'Kembali belajar Mandarin', teachingStrategy: 'TEACHING_INTENT_REFUSAL' as const }
    : { answer: 'Kamu ingin belajar arti, cara mengucapkan, atau cara mengatakan ini dalam Mandarin?', followUp: '', teachingStrategy: 'TEACHING_INTENT_CLARIFICATION' as const };
}
