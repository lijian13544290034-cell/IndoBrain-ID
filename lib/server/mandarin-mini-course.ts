import 'server-only';

/**
 * 极简职业课程（7 天）—— 不是课程管理系统，只是一张确定性模板。
 * 目的：学生说出职业后，立刻给出一份可执行的中文课程，并能在同一会话里逐句教学。
 * 零数据库、零状态机、零模型调用。
 */

export type MiniCourseExpression = { chinese: string; pinyin: string; indonesian: string };
export type MiniCourseDay = { day: number; topic: string; expressions: MiniCourseExpression[] };
export type MiniCourse = { key: OccupationKey; label: string; title: string; days: MiniCourseDay[] };

export type OccupationKey = 'admin' | 'pabrik' | 'gudang' | 'sales' | 'hospitality' | 'generic';

export type MiniCourseState = { key: OccupationKey; cursor: number; updatedAt: number };

const DAY_TOPICS = [
  'Perkenalan diri',
  'Sapaan sopan di kantor',
  'Angka & waktu kerja',
  '', // diisi kosakata kerja sesuai profesi
  '', // diisi kalimat kerja sesuai profesi
  'Minta bantuan & konfirmasi',
  'Simulasi percakapan kerja',
];

const CORE_DAYS: Record<number, MiniCourseExpression[]> = {
  1: [
    { chinese: '你好', pinyin: 'nǐ hǎo', indonesian: 'halo' },
    { chinese: '我叫…', pinyin: 'wǒ jiào…', indonesian: 'nama saya…' },
    { chinese: '我是印尼人', pinyin: 'wǒ shì yìn ní rén', indonesian: 'saya orang Indonesia' },
  ],
  2: [
    { chinese: '早上好', pinyin: 'zǎo shang hǎo', indonesian: 'selamat pagi' },
    { chinese: '谢谢您', pinyin: 'xiè xie nín', indonesian: 'terima kasih (sopan)' },
    { chinese: '不客气', pinyin: 'bú kè qi', indonesian: 'sama-sama' },
  ],
  3: [
    { chinese: '几点？', pinyin: 'jǐ diǎn?', indonesian: 'jam berapa?' },
    { chinese: '八点', pinyin: 'bā diǎn', indonesian: 'jam delapan' },
    { chinese: '加班', pinyin: 'jiā bān', indonesian: 'lembur' },
  ],
  6: [
    { chinese: '请帮我', pinyin: 'qǐng bāng wǒ', indonesian: 'tolong bantu saya' },
    { chinese: '可以吗？', pinyin: 'kě yǐ ma?', indonesian: 'boleh?' },
    { chinese: '我明白了', pinyin: 'wǒ míng bai le', indonesian: 'saya sudah mengerti' },
  ],
  7: [
    { chinese: '我是新来的', pinyin: 'wǒ shì xīn lái de', indonesian: 'saya karyawan baru' },
    { chinese: '请多关照', pinyin: 'qǐng duō guān zhào', indonesian: 'mohon bimbingannya' },
    { chinese: '有问题我问你', pinyin: 'yǒu wèn tí wǒ wèn nǐ', indonesian: 'kalau ada masalah saya tanya kamu' },
  ],
};

const OCCUPATIONS: Record<Exclude<OccupationKey, 'generic'>, { label: string; day4: MiniCourseExpression[]; day5: MiniCourseExpression[] }> = {
  admin: {
    label: 'Admin / Kantor',
    day4: [
      { chinese: '文件', pinyin: 'wén jiàn', indonesian: 'dokumen' },
      { chinese: '会议', pinyin: 'huì yì', indonesian: 'rapat' },
      { chinese: '报告', pinyin: 'bào gào', indonesian: 'laporan' },
    ],
    day5: [
      { chinese: '我整理文件', pinyin: 'wǒ zhěng lǐ wén jiàn', indonesian: 'saya merapikan dokumen' },
      { chinese: '会议几点开始？', pinyin: 'huì yì jǐ diǎn kāi shǐ?', indonesian: 'rapat mulai jam berapa?' },
      { chinese: '报告做好了', pinyin: 'bào gào zuò hǎo le', indonesian: 'laporannya sudah selesai' },
    ],
  },
  pabrik: {
    label: 'Pabrik / Produksi',
    day4: [
      { chinese: '工厂', pinyin: 'gōng chǎng', indonesian: 'pabrik' },
      { chinese: '机器', pinyin: 'jī qì', indonesian: 'mesin' },
      { chinese: '生产', pinyin: 'shēng chǎn', indonesian: 'produksi' },
    ],
    day5: [
      { chinese: '我在工厂工作', pinyin: 'wǒ zài gōng chǎng gōng zuò', indonesian: 'saya kerja di pabrik' },
      { chinese: '机器坏了', pinyin: 'jī qì huài le', indonesian: 'mesinnya rusak' },
      { chinese: '今天生产很多', pinyin: 'jīn tiān shēng chǎn hěn duō', indonesian: 'hari ini produksi banyak' },
    ],
  },
  gudang: {
    label: 'Gudang / Logistik',
    day4: [
      { chinese: '仓库', pinyin: 'cāng kù', indonesian: 'gudang' },
      { chinese: '货物', pinyin: 'huò wù', indonesian: 'barang' },
      { chinese: '发货', pinyin: 'fā huò', indonesian: 'kirim barang' },
    ],
    day5: [
      { chinese: '货到了吗？', pinyin: 'huò dào le ma?', indonesian: 'barangnya sudah sampai?' },
      { chinese: '请检查货物', pinyin: 'qǐng jiǎn chá huò wù', indonesian: 'tolong periksa barangnya' },
      { chinese: '今天发货', pinyin: 'jīn tiān fā huò', indonesian: 'kirim barang hari ini' },
    ],
  },
  sales: {
    label: 'Sales / Penjualan',
    day4: [
      { chinese: '客户', pinyin: 'kè hù', indonesian: 'pelanggan' },
      { chinese: '价格', pinyin: 'jià gé', indonesian: 'harga' },
      { chinese: '订单', pinyin: 'dìng dān', indonesian: 'pesanan' },
    ],
    day5: [
      { chinese: '这个多少钱？', pinyin: 'zhè ge duō shao qián?', indonesian: 'ini berapa harganya?' },
      { chinese: '我给您报价', pinyin: 'wǒ gěi nín bào jià', indonesian: 'saya beri Anda penawaran harga' },
      { chinese: '订单确认了', pinyin: 'dìng dān què rèn le', indonesian: 'pesanannya sudah dikonfirmasi' },
    ],
  },
  hospitality: {
    label: 'Restoran / Hotel',
    day4: [
      { chinese: '客人', pinyin: 'kè rén', indonesian: 'tamu' },
      { chinese: '菜单', pinyin: 'cài dān', indonesian: 'menu' },
      { chinese: '房间', pinyin: 'fáng jiān', indonesian: 'kamar' },
    ],
    day5: [
      { chinese: '欢迎光临', pinyin: 'huān yíng guāng lín', indonesian: 'selamat datang' },
      { chinese: '这是菜单', pinyin: 'zhè shì cài dān', indonesian: 'ini menunya' },
      { chinese: '房间在二楼', pinyin: 'fáng jiān zài èr lóu', indonesian: 'kamarnya di lantai dua' },
    ],
  },
};

const GENERIC_DAY4: MiniCourseExpression[] = [
  { chinese: '工作', pinyin: 'gōng zuò', indonesian: 'pekerjaan' },
  { chinese: '同事', pinyin: 'tóng shì', indonesian: 'rekan kerja' },
  { chinese: '帮忙', pinyin: 'bāng máng', indonesian: 'membantu' },
];
const GENERIC_DAY5: MiniCourseExpression[] = [
  { chinese: '我在这里工作', pinyin: 'wǒ zài zhè lǐ gōng zuò', indonesian: 'saya kerja di sini' },
  { chinese: '同事很好', pinyin: 'tóng shì hěn hǎo', indonesian: 'rekan kerjanya baik' },
  { chinese: '请帮忙', pinyin: 'qǐng bāng máng', indonesian: 'tolong bantu' },
];

/** 从学生原话识别职业；识别不到返回 generic（不阻断开课）。 */
export function detectOccupationKey(message: string): OccupationKey {
  if (/admin|administrasi|sekretaris|kantor|office|tata usaha|\bhr\b|resepsionis/i.test(message)) return 'admin';
  if (/pabrik|factory|produksi|operator mesin|manufacturing/i.test(message)) return 'pabrik';
  if (/gudang|logistik|ekspedisi|kurir|stok|warehouse/i.test(message)) return 'gudang';
  if (/sales|penjualan|jualan|marketing|toko|kasir/i.test(message)) return 'sales';
  if (/restoran|hotel|cafe|kafe|pelayan|waitress|resepsionis hotel/i.test(message)) return 'hospitality';
  return 'generic';
}

export function buildMiniCourse(key: OccupationKey): MiniCourse {
  const occupation = key === 'generic' ? null : OCCUPATIONS[key];
  const label = occupation?.label ?? 'kerja umum';
  const days: MiniCourseDay[] = DAY_TOPICS.map((topic, index) => {
    const day = index + 1;
    const expressions = day === 4 ? (occupation?.day4 ?? GENERIC_DAY4)
      : day === 5 ? (occupation?.day5 ?? GENERIC_DAY5)
      : CORE_DAYS[day];
    const resolvedTopic = topic || (day === 4 ? `Kosakata kerja: ${label}` : `Kalimat kerja: ${label}`);
    return { day, topic: resolvedTopic, expressions };
  });
  return { key, label, title: `Kursus Mandarin 7 Hari · ${label}`, days };
}

export function flattenMiniCourse(course: MiniCourse) {
  return course.days.flatMap((day) => day.expressions.map((expression) => ({ ...expression, day: day.day, topic: day.topic })));
}

/** 课程大纲文本（≤800 字，供 answer 字段直接使用）。 */
export function miniCourseOutline(course: MiniCourse) {
  const lines = course.days.map((day) => `Hari ${day.day}: ${day.topic} — ${day.expressions.map((item) => item.chinese).join(' / ')}`);
  return [`Siap! Saya buatkan ${course.title} sesuai pekerjaanmu 🎯`, ...lines].join('\n');
}

export function miniCourseAnswer(state: MiniCourseState, mode: 'START' | 'NEXT' | 'CORRECT') {
  const course = buildMiniCourse(state.key);
  const flat = flattenMiniCourse(course);
  const index = Math.max(0, Math.min(flat.length - 1, state.cursor));
  const item = flat[index];
  const isNewDay = index === 0 || flat[index - 1].day !== item.day;
  const dayHeader = isNewDay ? `Hari ${item.day} — ${item.topic}. ` : '';
  if (mode === 'CORRECT') {
    return {
      chinese: item.chinese, pinyin: item.pinyin, indonesian: item.indonesian,
      answer: `Belum tepat, tapi tidak apa-apa 👍 Yang benar: ${item.chinese} (${item.pinyin}) = ${item.indonesian}. Coba ucapkan sekali lagi, pelan-pelan.`,
      followUp: `Ulangi: ${item.chinese} · ${item.pinyin}`,
      summary: `Latihan ${item.chinese} (${item.indonesian}) di hari ${item.day}.`,
    };
  }
  return {
    chinese: item.chinese, pinyin: item.pinyin, indonesian: item.indonesian,
    answer: mode === 'START'
      ? `${dayHeader}Kita mulai dari yang paling sering dipakai di tempat kerja. Ucapkan dulu: ${item.chinese} (${item.pinyin}) = ${item.indonesian}.`
      : `${dayHeader}Lanjut ke ekspresi berikutnya: ${item.chinese} (${item.pinyin}) = ${item.indonesian}.`,
    followUp: `Sekarang giliranmu: ucapkan ${item.chinese}, lalu tulis di sini.`,
    summary: `Hari ${item.day}: ${item.topic} — sedang berlatih ${item.chinese}.`,
  };
}

/** 判断学生这条消息是不是在对当前目标做练习（而不是提问/换话题）。只接受简短的复述。 */
export function looksLikeAttempt(message: string) {
  const text = message.trim();
  if (!text || text.length > 24) return false;
  if (/[?？!！]/.test(text)) return false;
  if (/怎么|什么|为什么|如何|哪|多少|吗|apa|gimana|bagaimana|kenapa|mengapa|artinya|maksudnya|bilang|pakai|terjemah|ulang|pelan|salah|benar|bener|guru|terima kasih|makasih|lanjut|mulai/i.test(text)) return false;
  const chinese = text.match(/[\u3400-\u9fff]/g) || [];
  const latin = text.match(/[a-z]/gi) || [];
  if (!chinese.length && !latin.length) return false;
  if (latin.length > 16) return false;
  return true;
}

export function matchesTarget(message: string, target: MiniCourseExpression) {
  const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u3400-\u9fff]/g, '');
  const said = normalize(message);
  if (!said) return false;
  const chinese = normalize(target.chinese);
  if (chinese && said.includes(chinese)) return true;
  const pinyin = normalize(target.pinyin);
  return Boolean(pinyin) && (said.includes(pinyin) || pinyin.includes(said));
}
