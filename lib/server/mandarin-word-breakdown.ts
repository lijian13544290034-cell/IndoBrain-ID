import 'server-only';

import type { MiniCourseExpression } from '@/lib/server/mandarin-mini-course';

/**
 * 拆词解释（Penjelasan kata）。
 * 设计原则：
 *  - 固定职业句库用预置词表（零模型调用）；
 *  - 模型动态句由同一次响应带回 wordBreakdown（不额外调用）；
 *  - 都没有时用确定性分词兜底（按自然词单位，不逐字硬拆）。
 */
export type WordPart = {
  /** 中文词语（1–4 字，按自然词单位） */
  chinese: string;
  /** 带声调拼音 */
  pinyin: string;
  /** 自然印尼语解释；词缀/量词等给零基础可懂的说明 */
  indonesian: string;
};

type Entry = Record<string, WordPart[]>;

/** 固定句库预置拆词（按词，不按字）。 */
const PRESET: Entry = {
  欢迎光临: [
    { chinese: '欢迎', pinyin: 'huān yíng', indonesian: 'menyambut / selamat datang (kata kerja)' },
    { chinese: '光临', pinyin: 'guāng lín', indonesian: 'kedatangan tamu (bahasa sopan)' },
  ],
  几位: [
    { chinese: '几', pinyin: 'jǐ', indonesian: 'berapa' },
    { chinese: '位', pinyin: 'wèi', indonesian: 'orang (kata satuan sopan untuk tamu)' },
  ],
  这边请: [
    { chinese: '这边', pinyin: 'zhè biān', indonesian: 'sisi sini / arah sini' },
    { chinese: '请', pinyin: 'qǐng', indonesian: 'silakan / mohon' },
  ],
  这是菜单: [
    { chinese: '这', pinyin: 'zhè', indonesian: 'ini' },
    { chinese: '是', pinyin: 'shì', indonesian: 'adalah' },
    { chinese: '菜单', pinyin: 'cài dān', indonesian: 'menu (daftar makanan)' },
  ],
  您要什么: [
    { chinese: '您', pinyin: 'nín', indonesian: 'Anda (bentuk sopan dari 你)' },
    { chinese: '要', pinyin: 'yào', indonesian: 'mau / ingin memesan' },
    { chinese: '什么', pinyin: 'shén me', indonesian: 'apa' },
  ],
  请稍等: [
    { chinese: '请', pinyin: 'qǐng', indonesian: 'silakan / mohon' },
    { chinese: '稍等', pinyin: 'shāo děng', indonesian: 'tunggu sebentar' },
  ],
  请问您有预订吗: [
    { chinese: '请', pinyin: 'qǐng', indonesian: 'mohon (awalan sopan saat bertanya)' },
    { chinese: '问', pinyin: 'wèn', indonesian: 'bertanya' },
    { chinese: '您', pinyin: 'nín', indonesian: 'Anda (sopan)' },
    { chinese: '有', pinyin: 'yǒu', indonesian: 'punya / ada' },
    { chinese: '预订', pinyin: 'yù dìng', indonesian: 'reservasi / memesan lebih dulu' },
    { chinese: '吗', pinyin: 'ma', indonesian: '(kata tanya di akhir kalimat ya/tidak)' },
  ],
  请坐: [
    { chinese: '请', pinyin: 'qǐng', indonesian: 'silakan' },
    { chinese: '坐', pinyin: 'zuò', indonesian: 'duduk' },
  ],
  要不要加水: [
    { chinese: '要不要', pinyin: 'yào bu yào', indonesian: 'mau atau tidak mau (menawarkan)' },
    { chinese: '加', pinyin: 'jiā', indonesian: 'menambah' },
    { chinese: '水', pinyin: 'shuǐ', indonesian: 'air' },
  ],
  一共多少钱: [
    { chinese: '一共', pinyin: 'yí gòng', indonesian: 'total / seluruhnya' },
    { chinese: '多少', pinyin: 'duō shao', indonesian: 'berapa' },
    { chinese: '钱', pinyin: 'qián', indonesian: 'uang' },
  ],
  客人: [{ chinese: '客人', pinyin: 'kè rén', indonesian: 'tamu' }],
  桌子: [{ chinese: '桌子', pinyin: 'zhuō zi', indonesian: 'meja' }],
  水: [{ chinese: '水', pinyin: 'shuǐ', indonesian: 'air' }],
  有多少: [
    { chinese: '有', pinyin: 'yǒu', indonesian: 'ada / punya' },
    { chinese: '多少', pinyin: 'duō shao', indonesian: 'berapa' },
  ],
  库存不够: [
    { chinese: '库存', pinyin: 'kù cún', indonesian: 'stok barang' },
    { chinese: '不', pinyin: 'bù', indonesian: 'tidak' },
    { chinese: '够', pinyin: 'gòu', indonesian: 'cukup' },
  ],
  货到了吗: [
    { chinese: '货', pinyin: 'huò', indonesian: 'barang' },
    { chinese: '到', pinyin: 'dào', indonesian: 'sampai / tiba' },
    { chinese: '了', pinyin: 'le', indonesian: '(penanda sudah terjadi)' },
    { chinese: '吗', pinyin: 'ma', indonesian: '(kata tanya ya/tidak)' },
  ],
  今天出货: [
    { chinese: '今天', pinyin: 'jīn tiān', indonesian: 'hari ini' },
    { chinese: '出货', pinyin: 'chū huò', indonesian: 'mengirim barang keluar' },
  ],
  请点一下: [
    { chinese: '请', pinyin: 'qǐng', indonesian: 'mohon' },
    { chinese: '点', pinyin: 'diǎn', indonesian: 'menghitung satu per satu' },
    { chinese: '一下', pinyin: 'yí xià', indonesian: 'sebentar (melembutkan permintaan)' },
  ],
  放这里: [
    { chinese: '放', pinyin: 'fàng', indonesian: 'meletakkan' },
    { chinese: '这里', pinyin: 'zhè lǐ', indonesian: 'di sini' },
  ],
  我整理文件: [
    { chinese: '我', pinyin: 'wǒ', indonesian: 'saya' },
    { chinese: '整理', pinyin: 'zhěng lǐ', indonesian: 'merapikan' },
    { chinese: '文件', pinyin: 'wén jiàn', indonesian: 'dokumen' },
  ],
  会议几点开始: [
    { chinese: '会议', pinyin: 'huì yì', indonesian: 'rapat' },
    { chinese: '几点', pinyin: 'jǐ diǎn', indonesian: 'jam berapa' },
    { chinese: '开始', pinyin: 'kāi shǐ', indonesian: 'mulai' },
  ],
  报告做好了: [
    { chinese: '报告', pinyin: 'bào gào', indonesian: 'laporan' },
    { chinese: '做好', pinyin: 'zuò hǎo', indonesian: 'sudah dikerjakan sampai selesai' },
    { chinese: '了', pinyin: 'le', indonesian: '(penanda sudah selesai)' },
  ],
  我发给您: [
    { chinese: '我', pinyin: 'wǒ', indonesian: 'saya' },
    { chinese: '发', pinyin: 'fā', indonesian: 'mengirim' },
    { chinese: '给', pinyin: 'gěi', indonesian: 'kepada' },
    { chinese: '您', pinyin: 'nín', indonesian: 'Anda (sopan)' },
  ],
  我在工厂工作: [
    { chinese: '我', pinyin: 'wǒ', indonesian: 'saya' },
    { chinese: '在', pinyin: 'zài', indonesian: 'di' },
    { chinese: '工厂', pinyin: 'gōng chǎng', indonesian: 'pabrik' },
    { chinese: '工作', pinyin: 'gōng zuò', indonesian: 'bekerja' },
  ],
  我饿了: [
    { chinese: '我', pinyin: 'wǒ', indonesian: 'saya' },
    { chinese: '饿', pinyin: 'è', indonesian: 'lapar' },
    { chinese: '了', pinyin: 'le', indonesian: '(penanda keadaan sudah terjadi)' },
  ],
  你好: [
    { chinese: '你', pinyin: 'nǐ', indonesian: 'kamu' },
    { chinese: '好', pinyin: 'hǎo', indonesian: 'baik' },
  ],
};

const LEXICON: Array<{ zh: string; py: string; id: string }> = [
  { zh: '请问', py: 'qǐng wèn', id: 'permisi, mau bertanya' },
  { zh: '有没有', py: 'yǒu méi yǒu', id: 'ada atau tidak' },
  { zh: '预订', py: 'yù dìng', id: 'reservasi' },
  { zh: '包厢', py: 'bāo xiāng', id: 'ruang privat / VIP' },
  { zh: '房间', py: 'fáng jiān', id: 'kamar' },
  { zh: '桌子', py: 'zhuō zi', id: 'meja' },
  { zh: '客人', py: 'kè rén', id: 'tamu' },
  { zh: '库存', py: 'kù cún', id: 'stok' },
  { zh: '不够', py: 'bú gòu', id: 'tidak cukup' },
  { zh: '多少', py: 'duō shao', id: 'berapa' },
  { zh: '几个', py: 'jǐ ge', id: 'berapa buah' },
  { zh: '几位', py: 'jǐ wèi', id: 'berapa orang (sopan)' },
  { zh: '今天', py: 'jīn tiān', id: 'hari ini' },
  { zh: '明天', py: 'míng tiān', id: 'besok' },
  { zh: '现在', py: 'xiàn zài', id: 'sekarang' },
  { zh: '可以', py: 'kě yǐ', id: 'boleh' },
  { zh: '我们', py: 'wǒ men', id: 'kami / kita' },
  { zh: '他们', py: 'tā men', id: 'mereka' },
  { zh: '什么', py: 'shén me', id: 'apa' },
  { zh: '怎么', py: 'zěn me', id: 'bagaimana' },
  { zh: '哪里', py: 'nǎ lǐ', id: 'di mana' },
  { zh: '谢谢', py: 'xiè xie', id: 'terima kasih' },
  { zh: '欢迎', py: 'huān yíng', id: 'menyambut' },
  { zh: '光临', py: 'guāng lín', id: 'kedatangan (sopan)' },
  { zh: '这边', py: 'zhè biān', id: 'sisi sini' },
  { zh: '那边', py: 'nà biān', id: 'sisi sana' },
  { zh: '这里', py: 'zhè lǐ', id: 'di sini' },
  { zh: '菜单', py: 'cài dān', id: 'menu' },
  { zh: '工作', py: 'gōng zuò', id: 'bekerja / pekerjaan' },
  { zh: '工厂', py: 'gōng chǎng', id: 'pabrik' },
  { zh: '公司', py: 'gōng sī', id: 'perusahaan' },
  { zh: '文件', py: 'wén jiàn', id: 'dokumen' },
  { zh: '会议', py: 'huì yì', id: 'rapat' },
  { zh: '报告', py: 'bào gào', id: 'laporan' },
  { zh: '帮', py: 'bāng', id: 'membantu' },
  { zh: '查', py: 'chá', id: 'memeriksa' },
  { zh: '空房', py: 'kōng fáng', id: 'kamar kosong' },
  { zh: '没关系', py: 'méi guān xi', id: 'tidak apa-apa' },
  { zh: '等一下', py: 'děng yí xià', id: 'tunggu sebentar' },
  { zh: '稍等', py: 'shāo děng', id: 'tunggu sebentar' },
  // 服务/职场高频词（模型动态生成的句子也大多落在这个范围）
  { zh: '洗手间', py: 'xǐ shǒu jiān', id: 'toilet / kamar kecil' },
  { zh: '卫生间', py: 'wèi shēng jiān', id: 'toilet' },
  { zh: '收银台', py: 'shōu yín tái', id: 'kasir' },
  { zh: '服务员', py: 'fú wù yuán', id: 'pelayan' },
  { zh: '打包', py: 'dǎ bāo', id: 'bungkus (makanan)' },
  { zh: '买单', py: 'mǎi dān', id: 'bayar / minta bill' },
  { zh: '刷卡', py: 'shuā kǎ', id: 'bayar pakai kartu' },
  { zh: '现金', py: 'xiàn jīn', id: 'uang tunai' },
  { zh: '发票', py: 'fā piào', id: 'faktur / invoice' },
  { zh: '地址', py: 'dì zhǐ', id: 'alamat' },
  { zh: '电话', py: 'diàn huà', id: 'telepon / nomor telepon' },
  { zh: '名字', py: 'míng zi', id: 'nama' },
  { zh: '老板', py: 'lǎo bǎn', id: 'bos / pemilik' },
  { zh: '经理', py: 'jīng lǐ', id: 'manajer' },
  { zh: '同事', py: 'tóng shì', id: 'rekan kerja' },
  { zh: '加班', py: 'jiā bān', id: 'kerja lembur' },
  { zh: '下班', py: 'xià bān', id: 'pulang kerja' },
  { zh: '上班', py: 'shàng bān', id: 'masuk kerja' },
  { zh: '几点', py: 'jǐ diǎn', id: 'jam berapa' },
  { zh: '开始', py: 'kāi shǐ', id: 'mulai' },
  { zh: '做好', py: 'zuò hǎo', id: 'sudah selesai dikerjakan' },
  { zh: '收到', py: 'shōu dào', id: 'sudah diterima' },
  { zh: '送到', py: 'sòng dào', id: 'diantar ke' },
  { zh: '查一下', py: 'chá yí xià', id: 'cek sebentar' },
  { zh: '处理', py: 'chǔ lǐ', id: 'menangani' },
  { zh: '问题', py: 'wèn tí', id: 'masalah' },
  { zh: '数量', py: 'shù liàng', id: 'jumlah' },
  { zh: '价格', py: 'jià gé', id: 'harga' },
  { zh: '便宜', py: 'pián yi', id: 'lebih murah' },
  { zh: '贵', py: 'guì', id: 'mahal' },
  { zh: '结账', py: 'jié zhàng', id: 'bayar / tutup bill' },
  { zh: '这个', py: 'zhè ge', id: 'ini (yang ini)' },
  { zh: '那个', py: 'nà ge', id: 'itu (yang itu)' },
  { zh: '这些', py: 'zhè xiē', id: 'ini semua' },
  { zh: '那些', py: 'nà xiē', id: 'itu semua' },
  { zh: '麻烦', py: 'má fan', id: 'maaf merepotkan / tolong' },
];

/** 单字功能词（零基础也能懂的说明）。 */
const FUNCTION_WORDS: Record<string, { py: string; id: string }> = {
  的: { py: 'de', id: '(kata milik / penghubung)' },
  了: { py: 'le', id: '(penanda sudah terjadi)' },
  吗: { py: 'ma', id: '(kata tanya ya/tidak)' },
  呢: { py: 'ne', id: '(kata tanya: kalau …?)' },
  吧: { py: 'ba', id: '(melembutkan saran / ajakan)' },
  有: { py: 'yǒu', id: 'ada / punya' },
  不: { py: 'bù', id: 'tidak' },
  没: { py: 'méi', id: 'tidak / belum' },
  和: { py: 'hé', id: 'dan' },
  很: { py: 'hěn', id: 'sangat' },
  要: { py: 'yào', id: 'mau / perlu' },
  在: { py: 'zài', id: 'di / sedang' },
  是: { py: 'shì', id: 'adalah' },
  请: { py: 'qǐng', id: 'silakan / mohon' },
  给: { py: 'gěi', id: 'kepada' },
  我: { py: 'wǒ', id: 'saya' },
  你: { py: 'nǐ', id: 'kamu' },
  您: { py: 'nín', id: 'Anda (sopan)' },
  他: { py: 'tā', id: 'dia (laki-laki)' },
  她: { py: 'tā', id: 'dia (perempuan)' },
  问: { py: 'wèn', id: 'bertanya' },
  到: { py: 'dào', id: 'sampai' },
  几: { py: 'jǐ', id: 'berapa' },
  位: { py: 'wèi', id: 'orang (kata satuan sopan)' },
  个: { py: 'ge', id: 'buah (kata satuan umum)' },
  水: { py: 'shuǐ', id: 'air' },
  钱: { py: 'qián', id: 'uang' },
  货: { py: 'huò', id: 'barang' },
  坐: { py: 'zuò', id: 'duduk' },
  放: { py: 'fàng', id: 'meletakkan' },
  加: { py: 'jiā', id: 'menambah' },
  点: { py: 'diǎn', id: 'menghitung satu per satu' },
  够: { py: 'gòu', id: 'cukup' },
  来: { py: 'lái', id: 'datang' },
  说: { py: 'shuō', id: 'berkata / bilang' },
  还: { py: 'hái', id: 'masih' },
  再: { py: 'zài', id: 'lagi' },
  想: { py: 'xiǎng', id: 'ingin' },
  能: { py: 'néng', id: 'bisa' },
  会: { py: 'huì', id: 'bisa / akan' },
  大: { py: 'dà', id: 'besar' },
  小: { py: 'xiǎo', id: 'kecil' },
  多: { py: 'duō', id: 'banyak' },
  少: { py: 'shǎo', id: 'sedikit' },
  去: { py: 'qù', id: 'pergi' },
  好: { py: 'hǎo', id: 'baik' },
};

function keyOf(chinese: string) {
  return chinese.replace(/[\s。，！？、,.!?~…·:：;；"'“”‘’（）()]/g, '');
}

/**
 * 查拆词：
 *  1) 预置词表（固定句库）→ 零调用；
 *  2) 课程句子（chinese 精确匹配预置）→ 同上；
 *  3) 都没有 → 确定性分词（最长匹配 LEXICON + 功能词），词表未命中则整段作为一个词，绝不逐字乱拆。
 */
export function lookupWordBreakdown(chinese: string): WordPart[] | null {
  const key = keyOf(chinese || '');
  if (!key) return null;
  const preset = PRESET[key];
  if (preset) return Object.values(preset);
  return segmentChineses(key);
}

/** 从课程表达式取拆词（预置优先）。 */
export function breakdownForExpression(expression: MiniCourseExpression): WordPart[] | null {
  return lookupWordBreakdown(expression.chinese);
}

/** 确定性分词：最长匹配，未收录的段不硬拆。 */
export function segmentChineses(text: string): WordPart[] | null {
  if (!text) return null;
  // 最长匹配：先按词长倒序试，避免短词抢先（如「房间」抢掉「洗手间」里的字）。
  const byLength = [...LEXICON].sort((a, b) => b.zh.length - a.zh.length);
  const parts: WordPart[] = [];
  let index = 0;
  while (index < text.length) {
    const entry = byLength.find((item) => text.startsWith(item.zh, index));
    if (entry) {
      parts.push({ chinese: entry.zh, pinyin: entry.py, indonesian: entry.id });
      index += entry.zh.length;
      continue;
    }
    const char = text[index];
    const fn = FUNCTION_WORDS[char];
    if (fn) {
      parts.push({ chinese: char, pinyin: fn.py, indonesian: fn.id });
    } else {
      // 未收录：不硬拆，保留中文但不编造拼音/释义（前端只展示可解释的词）
      parts.push({ chinese: char, pinyin: '', indonesian: '' });
    }
    index += 1;
  }
  // 未收录的字不硬编拼音/释义，直接丢弃；只要还剩 ≥2 个可解释的词就认为可拆
  const usable = parts.filter((part) => part.pinyin && part.indonesian);
  return usable.length >= 2 ? usable : null;
}

/** 规范化模型返回的拆词（去空、限长、最多 8 个词）。 */
export function normalizeModelBreakdown(raw: unknown): WordPart[] | null {
  if (!Array.isArray(raw)) return null;
  const parts: WordPart[] = [];
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const chinese = typeof record.chinese === 'string' ? record.chinese.trim().slice(0, 8) : '';
    const pinyin = typeof record.pinyin === 'string' ? record.pinyin.trim().slice(0, 40) : '';
    const indonesian = typeof record.indonesian === 'string' ? record.indonesian.trim().slice(0, 80) : '';
    if (!chinese || !indonesian) continue;
    parts.push({ chinese, pinyin, indonesian });
  }
  return parts.length ? parts : null;
}

/**
 * 组合：模型词表优先 → 预置 → 确定性分词。
 * 返回 null 表示无法可靠拆词（前端隐藏入口）。
 */
export function resolveWordBreakdown(input: { chinese: string; modelBreakdown?: unknown }): WordPart[] | null {
  const fromModel = normalizeModelBreakdown(input.modelBreakdown);
  if (fromModel) return fromModel;
  return lookupWordBreakdown(input.chinese);
}
