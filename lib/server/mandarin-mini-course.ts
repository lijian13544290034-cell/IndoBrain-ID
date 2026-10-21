import 'server-only';

/**
 * 极简职业课程（7 天）—— 不是课程管理系统，只是一张确定性模板。
 * 目的：学生说出职业后，立刻有一份「从职业场景第一句开始」的可执行课程；
 * 课程只作为规划与续课参考（courseFocus），首轮教学由模型依据它自然展开。
 * 零数据库、零状态机、零模型调用。
 */

export type MiniCourseExpression = { chinese: string; pinyin: string; indonesian: string };
export type MiniCourseDay = { day: number; topic: string; expressions: MiniCourseExpression[] };
export type MiniCourse = { key: OccupationKey; label: string; title: string; days: MiniCourseDay[] };

export type OccupationKey = 'admin' | 'pabrik' | 'gudang' | 'sales' | 'hospitality' | 'generic';

export type MiniCourseState = { key: OccupationKey; cursor: number; updatedAt: number };

const CORE_DAYS: Record<number, MiniCourseExpression[]> = {
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

type OccupationProfile = {
  label: string;
  /** 职业核心 6 句：Hari 1 = 前 3 句（迎宾/询问/带位…），Hari 2 = 后 3 句（点餐/确认…）。 */
  starter: MiniCourseExpression[];
  day4: MiniCourseExpression[];
  day5: MiniCourseExpression[];
};

const OCCUPATIONS: Record<Exclude<OccupationKey, 'generic'>, OccupationProfile> = {
  admin: {
    label: 'Admin / Kantor',
    starter: [
      { chinese: '我整理文件', pinyin: 'wǒ zhěng lǐ wén jiàn', indonesian: 'saya merapikan dokumen' },
      { chinese: '会议几点开始？', pinyin: 'huì yì jǐ diǎn kāi shǐ?', indonesian: 'rapat mulai jam berapa?' },
      { chinese: '报告做好了', pinyin: 'bào gào zuò hǎo le', indonesian: 'laporannya sudah selesai' },
      { chinese: '我发给您', pinyin: 'wǒ fā gěi nín', indonesian: 'saya kirim ke Anda' },
      { chinese: '请确认一下', pinyin: 'qǐng què rèn yí xià', indonesian: 'mohon dikonfirmasi' },
      { chinese: '我马上做', pinyin: 'wǒ mǎ shàng zuò', indonesian: 'saya kerjakan sekarang' },
    ],
    day4: [
      { chinese: '文件', pinyin: 'wén jiàn', indonesian: 'dokumen' },
      { chinese: '会议', pinyin: 'huì yì', indonesian: 'rapat' },
      { chinese: '报告', pinyin: 'bào gào', indonesian: 'laporan' },
    ],
    day5: [
      { chinese: '请签字', pinyin: 'qǐng qiān zì', indonesian: 'tolong tanda tangan' },
      { chinese: '我下午有空', pinyin: 'wǒ xià wǔ yǒu kòng', indonesian: 'saya kosong sore ini' },
      { chinese: '明天见', pinyin: 'míng tiān jiàn', indonesian: 'sampai besok' },
    ],
  },
  pabrik: {
    label: 'Pabrik / Produksi',
    starter: [
      { chinese: '我在工厂工作', pinyin: 'wǒ zài gōng chǎng gōng zuò', indonesian: 'saya kerja di pabrik' },
      { chinese: '机器坏了', pinyin: 'jī qì huài le', indonesian: 'mesinnya rusak' },
      { chinese: '今天生产很多', pinyin: 'jīn tiān shēng chǎn hěn duō', indonesian: 'hari ini produksi banyak' },
      { chinese: '请检查机器', pinyin: 'qǐng jiǎn chá jī qì', indonesian: 'tolong periksa mesinnya' },
      { chinese: '注意安全', pinyin: 'zhù yì ān quán', indonesian: 'hati-hati, utamakan keselamatan' },
      { chinese: '今天加班吗？', pinyin: 'jīn tiān jiā bān ma?', indonesian: 'hari ini lembur?' },
    ],
    day4: [
      { chinese: '工厂', pinyin: 'gōng chǎng', indonesian: 'pabrik' },
      { chinese: '机器', pinyin: 'jī qì', indonesian: 'mesin' },
      { chinese: '生产', pinyin: 'shēng chǎn', indonesian: 'produksi' },
    ],
    day5: [
      { chinese: '生产很正常', pinyin: 'shēng chǎn hěn zhèng cháng', indonesian: 'produksi normal' },
      { chinese: '请小心', pinyin: 'qǐng xiǎo xīn', indonesian: 'tolong hati-hati' },
      { chinese: '休息十分钟', pinyin: 'xiū xi shí fēn zhōng', indonesian: 'istirahat sepuluh menit' },
    ],
  },
  gudang: {
    label: 'Gudang / Logistik',
    starter: [
      { chinese: '有多少？', pinyin: 'yǒu duō shao?', indonesian: 'ada berapa banyak?' },
      { chinese: '库存不够', pinyin: 'kù cún bú gòu', indonesian: 'stoknya tidak cukup' },
      { chinese: '货到了吗？', pinyin: 'huò dào le ma?', indonesian: 'barangnya sudah sampai?' },
      { chinese: '今天出货', pinyin: 'jīn tiān chū huò', indonesian: 'hari ini kirim barang' },
      { chinese: '请点一下', pinyin: 'qǐng diǎn yí xià', indonesian: 'tolong hitung sebentar' },
      { chinese: '放这里', pinyin: 'fàng zhè lǐ', indonesian: 'taruh di sini' },
    ],
    day4: [
      { chinese: '仓库', pinyin: 'cāng kù', indonesian: 'gudang' },
      { chinese: '数量', pinyin: 'shù liàng', indonesian: 'jumlah' },
      { chinese: '货物', pinyin: 'huò wù', indonesian: 'barang' },
    ],
    day5: [
      { chinese: '请检查货物', pinyin: 'qǐng jiǎn chá huò wù', indonesian: 'tolong periksa barangnya' },
      { chinese: '货还没到', pinyin: 'huò hái méi dào', indonesian: 'barangnya belum sampai' },
      { chinese: '明天到货', pinyin: 'míng tiān dào huò', indonesian: 'besok barang datang' },
    ],
  },
  sales: {
    label: 'Sales / Penjualan',
    starter: [
      { chinese: '您要什么？', pinyin: 'nín yào shén me?', indonesian: 'Anda mau apa?' },
      { chinese: '这个多少钱？', pinyin: 'zhè ge duō shao qián?', indonesian: 'ini berapa harganya?' },
      { chinese: '我给您报价', pinyin: 'wǒ gěi nín bào jià', indonesian: 'saya beri Anda penawaran harga' },
      { chinese: '订单确认了', pinyin: 'dìng dān què rèn le', indonesian: 'pesanannya sudah dikonfirmasi' },
      { chinese: '有折扣吗？', pinyin: 'yǒu zhé kòu ma?', indonesian: 'ada diskon?' },
      { chinese: '请稍等', pinyin: 'qǐng shāo děng', indonesian: 'mohon tunggu sebentar' },
    ],
    day4: [
      { chinese: '客户', pinyin: 'kè hù', indonesian: 'pelanggan' },
      { chinese: '价格', pinyin: 'jià gé', indonesian: 'harga' },
      { chinese: '订单', pinyin: 'dìng dān', indonesian: 'pesanan' },
    ],
    day5: [
      { chinese: '客户要打折', pinyin: 'kè hù yào dǎ zhé', indonesian: 'pelanggan minta diskon' },
      { chinese: '价格可以商量', pinyin: 'jià gé kě yǐ shāng liang', indonesian: 'harga bisa dinegosiasi' },
      { chinese: '订单发出去了', pinyin: 'dìng dān fā chū qù le', indonesian: 'pesanan sudah dikirim' },
    ],
  },
  hospitality: {
    label: 'Restoran / Kafe / Hotel',
    starter: [
      { chinese: '欢迎光临', pinyin: 'huān yíng guāng lín', indonesian: 'selamat datang' },
      { chinese: '几位？', pinyin: 'jǐ wèi?', indonesian: 'berapa orang?' },
      { chinese: '这边请', pinyin: 'zhè biān qǐng', indonesian: 'silakan lewat sini' },
      { chinese: '这是菜单', pinyin: 'zhè shì cài dān', indonesian: 'ini menunya' },
      { chinese: '您要什么？', pinyin: 'nín yào shén me?', indonesian: 'Anda mau pesan apa?' },
      { chinese: '请稍等', pinyin: 'qǐng shāo děng', indonesian: 'mohon tunggu sebentar' },
    ],
    day4: [
      { chinese: '客人', pinyin: 'kè rén', indonesian: 'tamu' },
      { chinese: '桌子', pinyin: 'zhuō zi', indonesian: 'meja' },
      { chinese: '水', pinyin: 'shuǐ', indonesian: 'air' },
    ],
    day5: [
      { chinese: '请坐', pinyin: 'qǐng zuò', indonesian: 'silakan duduk' },
      { chinese: '要不要加水？', pinyin: 'yào bu yào jiā shuǐ?', indonesian: 'mau tambah air?' },
      { chinese: '一共多少钱？', pinyin: 'yí gòng duō shao qián?', indonesian: 'totalnya berapa?' },
    ],
  },
};

const GENERIC_STARTER: MiniCourseExpression[] = [
  { chinese: '你好', pinyin: 'nǐ hǎo', indonesian: 'halo' },
  { chinese: '我叫…', pinyin: 'wǒ jiào…', indonesian: 'nama saya…' },
  { chinese: '我是印尼人', pinyin: 'wǒ shì yìn ní rén', indonesian: 'saya orang Indonesia' },
  { chinese: '早上好', pinyin: 'zǎo shang hǎo', indonesian: 'selamat pagi' },
  { chinese: '谢谢您', pinyin: 'xiè xie nín', indonesian: 'terima kasih (sopan)' },
  { chinese: '不客气', pinyin: 'bú kè qi', indonesian: 'sama-sama' },
];

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
  if (/restoran|resto|rumah\s+makan|warung|hotel|cafe|kafe|pelayan|waitress|waiter|barista|餐厅|餐館|餐馆|酒楼|服务员|服務員|tamu|melayani/i.test(message)) return 'hospitality';
  if (/gudang|logistik|ekspedisi|kurir|stok|stock|inventaris|warehouse|仓库|倉庫|库存|庫存|出货|出貨|到货|到貨/i.test(message)) return 'gudang';
  if (/pabrik|factory|produksi|operator\s+mesin|manufacturing|工厂|工廠/i.test(message)) return 'pabrik';
  if (/sales|penjualan|jualan|marketing|kasir|toko|pelanggan|客户|客戶/i.test(message)) return 'sales';
  if (/admin|administrasi|sekretaris|kantor|office|tata\s+usaha|\bhr\b/i.test(message)) return 'admin';
  return 'generic';
}

export function occupationLabel(key: OccupationKey): string {
  return key === 'generic' ? 'kerja umum' : OCCUPATIONS[key].label;
}

/** 从会话记忆里的 occupation 字段还原课程 key（记忆里存的是 `key (Label)`）。 */
export function occupationKeyFromMemory(value: string | null | undefined): OccupationKey | null {
  if (!value) return null;
  const key = value.trim().split(/[\s(]/)[0];
  return (['admin', 'pabrik', 'gudang', 'sales', 'hospitality', 'generic'] as const).includes(key as OccupationKey)
    ? (key as OccupationKey)
    : null;
}

/** 职业场景的核心句（供教师 Prompt 与首轮教学参考）。 */
export function occupationScenario(key: OccupationKey) {
  if (key === 'generic') return null;
  const profile = OCCUPATIONS[key];
  return {
    label: profile.label,
    starter: profile.starter,
    vocabulary: profile.day4,
    sentences: profile.day5,
  };
}

export function buildMiniCourse(key: OccupationKey): MiniCourse {
  const profile = key === 'generic' ? null : OCCUPATIONS[key];
  const label = profile?.label ?? 'kerja umum';
  const starter = profile?.starter ?? GENERIC_STARTER;
  const dayExpressions: Record<number, MiniCourseExpression[]> = {
    1: starter.slice(0, 3),
    2: starter.slice(3, 6),
    3: CORE_DAYS[3],
    4: profile?.day4 ?? GENERIC_DAY4,
    5: profile?.day5 ?? GENERIC_DAY5,
    6: CORE_DAYS[6],
    7: CORE_DAYS[7],
  };
  const dayTopics: Record<number, string> = {
    1: `Kalimat inti: ${label}`,
    2: `Latihan lanjutan: ${label}`,
    3: 'Angka & waktu kerja',
    4: `Kosakata kerja: ${label}`,
    5: `Kalimat kerja: ${label}`,
    6: 'Minta bantuan & konfirmasi',
    7: 'Simulasi percakapan kerja',
  };
  const days: MiniCourseDay[] = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
    day, topic: dayTopics[day], expressions: dayExpressions[day],
  }));
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
      ? `${dayHeader}Kita mulai dari kalimat yang paling sering kamu pakai di tempat kerja. Ucapkan dulu: ${item.chinese} (${item.pinyin}) = ${item.indonesian}.`
      : `${dayHeader}Lanjut ke kalimat berikutnya: ${item.chinese} (${item.pinyin}) = ${item.indonesian}.`,
    followUp: `Sekarang giliranmu: ucapkan ${item.chinese}, lalu tulis di sini.`,
    summary: `Hari ${item.day}: ${item.topic} — sedang berlatih ${item.chinese}.`,
  };
}

/**
 * 判断学生这条消息是不是在对当前目标做练习（而不是提问/换话题/说听不懂）。
 * 只接受简短、无问号、无疑问词的复述；宁可放过，不可抢答。
 */
export function looksLikeAttempt(message: string) {
  const text = message.trim();
  if (!text || text.length > 24) return false;
  if (/[?？!！]/.test(text)) return false;
  if (/怎么|什么|为什么|如何|哪|多少|吗|apa|gimana|bagaimana|kenapa|mengapa|artinya|maksudnya|bilang|pakai|terjemah|ulang|pelan|salah|benar|bener|guru|terima kasih|makasih|lanjut|mulai/i.test(text)) return false;
  // 说听不懂 / 想换方向 / 提问：必须交给模型，不能被课程练习判断抢走
  if (/tidak\s+(?:mengerti|ngerti|paham)|nggak\s+(?:mengerti|ngerti|paham)|belum\s+paham|bingung|susah|sulit|ganti|pindah|mau\s+(?:belajar|kerja)|maksud|kok|sih|emang/i.test(text)) return false;
  if (detectOccupationKey(text) !== 'generic') return false;
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
