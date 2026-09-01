export type BasicFrequency = '超高频' | '高频' | '常用' | '识别';
export type BasicDifficulty = 1 | 2 | 3;
export type BasicStatus = 'active' | 'draft';

export type BasicTopCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: 'blocks' | 'heart' | 'utensils' | 'user' | 'home' | 'navigation';
  order: number;
  subcategories: BasicSubcategory[];
};

export type BasicSubcategory = {
  id: string;
  title: string;
  subtitle: string;
  order: number;
};

export type BasicCombination = {
  indonesian: string;
  chinese: string;
  conceptKeys?: string[];
};

export type BasicConcept = {
  id: string;
  conceptKey: string;
  categoryId: string;
  subcategoryId: string;
  chinese: string;
  indonesian: string;
  standardForms: string[];
  colloquialForms: string[];
  ttsText: string;
  shortMeaning: string;
  usageNote?: string;
  combinations: BasicCombination[];
  shortExpressions: BasicCombination[];
  relatedConceptIds: string[];
  prerequisiteConceptIds: string[];
  relatedSceneIds: string[];
  tags: string[];
  priority: number;
  frequency: BasicFrequency;
  difficulty: BasicDifficulty;
  status: BasicStatus;
  order: number;
};

export type BasicNumberStep = {
  id: string;
  title: string;
  note: string;
  items: BasicCombination[];
};

export type BasicMicroSceneStatus = 'active' | 'draft';

export type BasicMicroSceneLine = {
  indonesian: string;
  chinese: string;
  ttsText: string;
};

export type BasicMicroScene = {
  id: string;
  titleZh: string;
  contextZh: string;
  conceptIds: string[];
  lines: BasicMicroSceneLine[];
  relatedSceneIds: string[];
  priority: number;
  status: BasicMicroSceneStatus;
};

export const basicEssentialsCategories: BasicTopCategory[] = [
  {
    id: 'core',
    title: '高频基础',
    subtitle: '数字 · 时间 · 方位 · 常用动作',
    icon: 'blocks',
    order: 1,
    subcategories: [
      { id: 'numbers', title: '数字', subtitle: '0、十几、整十、百、千、百万', order: 1 },
      { id: 'time-date', title: '时间日期', subtitle: '今天、明天、星期、月份和半点', order: 2 },
      { id: 'directions', title: '方位位置', subtitle: '左右、前后、这里那里和转向', order: 3 },
      { id: 'actions', title: '高频动作', subtitle: '拿、放、买、等、检查、发送', order: 4 },
      { id: 'ability-need', title: '能力与需求', subtitle: '可以、需要、不要、够不够', order: 5 },
      { id: 'questions-pronouns', title: '提问与指代', subtitle: '我你他、这个那个、哪里、多少', order: 6 },
      { id: 'measurement', title: '数量度量', subtitle: '多少、全部、公斤、升、米', order: 7 },
      { id: 'descriptions', title: '常见描述', subtitle: '大小、冷热、好坏、干净、坏了', order: 8 },
      { id: 'particles', title: '常见语气助词', subtitle: 'ya、dong、kok、nih 的现实语气', order: 9 },
    ],
  },
  {
    id: 'feelings',
    title: '感受与状态',
    subtitle: '饿 · 困 · 累 · 疼 · 开心 · 生气',
    icon: 'heart',
    order: 2,
    subcategories: [
      { id: 'body-feelings', title: '身体感受', subtitle: '饿、渴、困、热、冷、舒服', order: 1 },
      { id: 'pain-discomfort', title: '疼痛不适', subtitle: '头痛、肚子痛、咳嗽、发烧', order: 2 },
      { id: 'emotions', title: '情绪心情', subtitle: '开心、生气、担心、尴尬、想念', order: 3 },
    ],
  },
  {
    id: 'food',
    title: '吃喝',
    subtitle: '菜 · 水果 · 调料 · 饮料 · 做饭',
    icon: 'utensils',
    order: 3,
    subcategories: [
      { id: 'vegetables', title: '蔬菜', subtitle: '厨房和买菜最常见蔬菜', order: 1 },
      { id: 'fruits', title: '水果', subtitle: '市场、超市、外卖常见水果', order: 2 },
      { id: 'meat-seafood', title: '肉类海鲜', subtitle: '牛肉、鸡肉、鱼、虾、蛋', order: 3 },
      { id: 'seasonings', title: '调料', subtitle: '盐、糖、油、酱油类、辣酱', order: 4 },
      { id: 'staples', title: '主食食品', subtitle: '米饭、大米、面、面包、豆制品', order: 5 },
      { id: 'drinks', title: '饮料', subtitle: '水、冰、咖啡、茶、少糖少冰', order: 6 },
      { id: 'taste-texture', title: '味道口感', subtitle: '甜咸辣、淡、熟了、焦了', order: 7 },
      { id: 'cooking-actions', title: '烹饪动作', subtitle: '炒、煮、蒸、切、洗、加一点', order: 8 },
    ],
  },
  {
    id: 'body-clothing',
    title: '身体与穿戴',
    subtitle: '身体 · 衣服 · 鞋帽 · 尺寸',
    icon: 'user',
    order: 4,
    subcategories: [
      { id: 'body-parts', title: '身体部位', subtitle: '头、眼、手、脚、肚子、皮肤', order: 1 },
      { id: 'clothes-accessories', title: '衣服鞋帽', subtitle: '衣服、裤子、鞋、包、手表', order: 2 },
      { id: 'wearing-size', title: '穿戴与尺寸', subtitle: '穿、脱、换、合适、太大太小', order: 3 },
    ],
  },
  {
    id: 'home',
    title: '居家常用',
    subtitle: '房间 · 厨房 · 洗漱 · 清洁 · 电子',
    icon: 'home',
    order: 5,
    subcategories: [
      { id: 'home-items', title: '家中常见', subtitle: '门、窗、地板、桌椅、钥匙、灯', order: 1 },
      { id: 'kitchen-items', title: '厨房用品', subtitle: '碗盘、锅、煤气、冰箱、容器', order: 2 },
      { id: 'personal-care', title: '洗漱个护', subtitle: '牙刷、牙膏、纸巾、毛巾、洗发水', order: 3 },
      { id: 'cleaning-laundry', title: '清洁洗衣', subtitle: '扫把、拖把、洗衣液、垃圾桶', order: 4 },
      { id: 'personal-electronics', title: '随身电子', subtitle: '手机、充电器、网络、遥控器', order: 5 },
    ],
  },
  {
    id: 'transport',
    title: '出行交通',
    subtitle: '打车 · 摩托 · 道路 · 加油 · 机场',
    icon: 'navigation',
    order: 6,
    subcategories: [
      { id: 'car-ride', title: '汽车与打车', subtitle: '司机、上车、接送、目的地、行李', order: 1 },
      { id: 'motorbike', title: '摩托出行', subtitle: '摩托、头盔、ojek 和停车', order: 2 },
      { id: 'road-parking', title: '道路停车', subtitle: '堵车、直走、掉头、入口、余额', order: 3 },
      { id: 'fuel', title: '加油', subtitle: '汽油、柴油、加满和现实油品名', order: 4 },
      { id: 'ev-charging', title: '充电', subtitle: '充电、百分比、SPKLU 和电量', order: 5 },
      { id: 'airport', title: '飞机机场', subtitle: '机场、航班、登机口、延误、到达', order: 6 },
    ],
  },
];

const concepts: BasicConcept[] = [];

type Seed = {
  key: string;
  categoryId: string;
  subcategoryId: string;
  chinese: string;
  indonesian: string;
  standardForms?: string[];
  colloquialForms?: string[];
  shortMeaning?: string;
  usageNote?: string;
  combinations?: BasicCombination[];
  shortExpressions?: BasicCombination[];
  relatedConceptIds?: string[];
  prerequisiteConceptIds?: string[];
  relatedSceneIds?: string[];
  tags?: string[];
  priority?: number;
  frequency?: BasicFrequency;
  difficulty?: BasicDifficulty;
};

function add(seed: Seed) {
  const order = concepts.length + 1;
  concepts.push({
    id: `BAS-${String(order).padStart(4, '0')}`,
    conceptKey: seed.key,
    categoryId: seed.categoryId,
    subcategoryId: seed.subcategoryId,
    chinese: seed.chinese,
    indonesian: seed.indonesian,
    standardForms: seed.standardForms ?? [seed.indonesian],
    colloquialForms: seed.colloquialForms ?? [],
    ttsText: seed.indonesian,
    shortMeaning: seed.shortMeaning ?? seed.chinese,
    usageNote: seed.usageNote,
    combinations: seed.combinations ?? [],
    shortExpressions: seed.shortExpressions ?? [],
    relatedConceptIds: seed.relatedConceptIds ?? [],
    prerequisiteConceptIds: seed.prerequisiteConceptIds ?? [],
    relatedSceneIds: seed.relatedSceneIds ?? [],
    tags: seed.tags ?? [],
    priority: seed.priority ?? order,
    frequency: seed.frequency ?? '常用',
    difficulty: seed.difficulty ?? 1,
    status: 'active',
    order,
  });
}

function addSimple(categoryId: string, subcategoryId: string, rows: Array<[string, string, string, Partial<Seed>?]>) {
  rows.forEach(([key, indonesian, chinese, extra]) => add({ key, categoryId, subcategoryId, indonesian, chinese, ...extra }));
}

add({ key: 'nol', categoryId: 'core', subcategoryId: 'numbers', indonesian: 'nol', chinese: '零', usageNote: '标准数字表达里的 0。', tags: ['number', 'zero'], priority: 1, frequency: '超高频' });
add({ key: 'kosong', categoryId: 'core', subcategoryId: 'numbers', indonesian: 'kosong', chinese: '零 / 空', usageNote: '本义是“空”；读电话号码、编号、房间号时常用来读 0。', shortExpressions: [{ indonesian: 'Kosong delapan satu dua.', chinese: '0812……（逐位读号码）' }], tags: ['number', 'phone', 'zero'], priority: 2, frequency: '超高频' });

addSimple('core', 'numbers', [
  ['satu', 'satu', '一'], ['dua', 'dua', '二'], ['tiga', 'tiga', '三'], ['empat', 'empat', '四'], ['lima', 'lima', '五'], ['enam', 'enam', '六'], ['tujuh', 'tujuh', '七'], ['delapan', 'delapan', '八'], ['sembilan', 'sembilan', '九'], ['sepuluh', 'sepuluh', '十'],
  ['sebelas', 'sebelas', '十一'], ['dua-belas', 'dua belas', '十二'], ['tiga-belas', 'tiga belas', '十三'], ['empat-belas', 'empat belas', '十四'], ['lima-belas', 'lima belas', '十五'], ['enam-belas', 'enam belas', '十六'], ['tujuh-belas', 'tujuh belas', '十七'], ['delapan-belas', 'delapan belas', '十八'], ['sembilan-belas', 'sembilan belas', '十九'],
  ['dua-puluh', 'dua puluh', '二十'], ['tiga-puluh', 'tiga puluh', '三十'], ['empat-puluh', 'empat puluh', '四十'], ['lima-puluh', 'lima puluh', '五十'], ['sembilan-puluh', 'sembilan puluh', '九十'],
  ['seratus', 'seratus', '一百', { usageNote: 'seratus 是固定说法，不说 satu ratus。' }],
  ['dua-ratus', 'dua ratus', '两百'], ['seribu', 'seribu', '一千', { usageNote: 'seribu 是固定说法，不说 satu ribu。' }], ['dua-ribu', 'dua ribu', '两千'], ['sepuluh-ribu', 'sepuluh ribu', '一万'], ['seratus-ribu', 'seratus ribu', '十万'], ['satu-juta', 'satu juta', '一百万'], ['dua-juta', 'dua juta', '两百万'],
]);

addSimple('core', 'time-date', [
  ['jam', 'jam', '点 / 小时'], ['menit', 'menit', '分钟'], ['detik', 'detik', '秒'], ['sekarang', 'sekarang', '现在'], ['nanti', 'nanti', '等下 / 之后'], ['tadi', 'tadi', '刚才'], ['dulu', 'dulu', '先 / 以前'], ['sebentar', 'sebentar', '一会儿'], ['bentar', 'bentar', '一会儿（口语）', { standardForms: ['sebentar'], colloquialForms: ['bentar'] }],
  ['hari-ini', 'hari ini', '今天'], ['kemarin', 'kemarin', '昨天'], ['besok', 'besok', '明天', { relatedSceneIds: ['EXP-DRV-001'] }], ['lusa', 'lusa', '后天'], ['pagi', 'pagi', '早上'], ['siang', 'siang', '中午 / 白天'], ['sore', 'sore', '下午 / 傍晚'], ['malam', 'malam', '晚上'], ['hari', 'hari', '天 / 日子'], ['minggu', 'minggu', '星期 / 周'], ['bulan', 'bulan', '月'], ['tahun', 'tahun', '年'],
  ['senin', 'Senin', '星期一'], ['selasa', 'Selasa', '星期二'], ['rabu', 'Rabu', '星期三'], ['kamis', 'Kamis', '星期四'], ['jumat', 'Jumat', '星期五'], ['sabtu', 'Sabtu', '星期六'], ['minggu-day', 'Minggu', '星期日'],
  ['januari', 'Januari', '一月'], ['februari', 'Februari', '二月'], ['maret', 'Maret', '三月'], ['april', 'April', '四月'], ['mei', 'Mei', '五月'], ['juni', 'Juni', '六月'], ['juli', 'Juli', '七月'], ['agustus', 'Agustus', '八月'], ['september', 'September', '九月'], ['oktober', 'Oktober', '十月'], ['november', 'November', '十一月'], ['desember', 'Desember', '十二月'],
  ['setengah', 'setengah', '半', { usageNote: 'jam setengah sembilan = 08:30，不是 9:30。', shortExpressions: [{ indonesian: 'Jam setengah sembilan.', chinese: '八点半。' }] }],
]);

addSimple('core', 'directions', [
  ['kiri', 'kiri', '左边'], ['kanan', 'kanan', '右边', { combinations: [{ indonesian: 'belok kanan', chinese: '右转' }, { indonesian: 'sebelah kanan', chinese: '右边 / 右侧' }], shortExpressions: [{ indonesian: 'Belok kanan.', chinese: '右转。' }], relatedSceneIds: ['EXP-LIF-224'] }],
  ['depan', 'depan', '前面'], ['belakang', 'belakang', '后面'], ['atas', 'atas', '上面'], ['bawah', 'bawah', '下面'], ['dalam', 'dalam', '里面'], ['luar', 'luar', '外面'], ['tengah', 'tengah', '中间'], ['samping', 'samping', '旁边'], ['sebelah', 'sebelah', '旁边 / 一侧'], ['seberang', 'seberang', '对面'], ['dekat', 'dekat', '近'], ['jauh', 'jauh', '远'], ['sini', 'sini', '这里'], ['sana', 'sana', '那里'],
  ['di-sini', 'di sini', '在这里', { shortExpressions: [{ indonesian: 'Di sini.', chinese: '在这里。' }] }], ['di-sana', 'di sana', '在那里', { shortExpressions: [{ indonesian: 'Di sana.', chinese: '在那里。' }] }], ['di-depan', 'di depan', '在前面'], ['di-belakang', 'di belakang', '在后面'], ['di-tengah', 'di tengah', '在中间'], ['di-seberang', 'di seberang', '在对面'], ['sebelah-kanan', 'sebelah kanan', '右边 / 右侧'], ['sebelah-kiri', 'sebelah kiri', '左边 / 左侧'],
]);

addSimple('core', 'actions', [
  ['makan', 'makan', '吃'], ['minum', 'minum', '喝'], ['jalan', 'jalan', '走 / 路', { usageNote: '可以是“走”，也可以是“路”，看场景。' }], ['pergi', 'pergi', '去'], ['datang', 'datang', '来 / 到'], ['sampai', 'sampai', '到达', { combinations: [{ indonesian: 'belum sampai', chinese: '还没到' }], relatedSceneIds: ['EXP-DRV-001'] }], ['pulang', 'pulang', '回去 / 回家'], ['masuk', 'masuk', '进去 / 进入'], ['keluar', 'keluar', '出来 / 出去'], ['naik', 'naik', '上 / 坐上'], ['turun', 'turun', '下 / 下车'], ['duduk', 'duduk', '坐'], ['berdiri', 'berdiri', '站'], ['ambil', 'ambil', '拿'], ['taruh', 'taruh', '放'], ['bawa', 'bawa', '带'], ['kasih', 'kasih', '给', { usageNote: '很常见的口语；较正式可用 beri / memberikan。' }], ['buka', 'buka', '打开'], ['tutup', 'tutup', '关上'], ['nyalakan', 'nyalakan', '打开（电器/机器）'], ['matikan', 'matikan', '关掉（电器/机器）'], ['lihat', 'lihat', '看'], ['dengar', 'dengar', '听'], ['bicara', 'bicara', '说话'], ['ngomong', 'ngomong', '说 / 聊（口语）', { standardForms: ['bicara'], colloquialForms: ['ngomong'] }], ['tanya', 'tanya', '问'], ['jawab', 'jawab', '回答'], ['cari', 'cari', '找'], ['tunggu', 'tunggu', '等'], ['beli', 'beli', '买'], ['jual', 'jual', '卖'], ['bayar', 'bayar', '付款'], ['pakai', 'pakai', '用 / 穿 / 戴', { relatedSceneIds: ['EXP-OPR-002'] }], ['buat', 'buat', '做 / 给 / 用来'], ['bikin', 'bikin', '做（口语）', { standardForms: ['buat'], colloquialForms: ['bikin'] }], ['ganti', 'ganti', '换'], ['tambah', 'tambah', '加 / 增加'], ['kurangi', 'kurangi', '减少 / 少放'], ['potong', 'potong', '切 / 剪'], ['cuci', 'cuci', '洗'], ['bersihkan', 'bersihkan', '清理 / 打扫'], ['buang', 'buang', '扔 / 丢'], ['pilih', 'pilih', '选'], ['coba', 'coba', '试一下'], ['cek', 'cek', '检查 / 查一下'], ['kirim', 'kirim', '发送 / 发货'], ['terima', 'terima', '收到 / 接收'], ['telepon', 'telepon', '打电话'], ['tidur', 'tidur', '睡觉'], ['bangun', 'bangun', '醒 / 起床'], ['bungkus', 'bungkus', '打包 / 包起来', { tags: ['food', 'restaurant', 'shopping'], relatedSceneIds: ['EXP-LIF-231'] }],
]);

addSimple('core', 'ability-need', [
  ['ada', 'ada', '有 / 在'], ['tidak-ada', 'tidak ada', '没有'], ['nggak-ada', 'nggak ada', '没有（口语）', { standardForms: ['tidak ada'], colloquialForms: ['nggak ada', 'gak ada'] }], ['sudah', 'sudah', '已经 / 好了'], ['udah', 'udah', '已经 / 好了（口语）', { standardForms: ['sudah'], colloquialForms: ['udah'] }], ['belum', 'belum', '还没'], ['masih', 'masih', '还 / 仍然'], ['lagi', 'lagi', '正在 / 再 / 又', { usageNote: '强语境词：Saya lagi makan = 我正在吃；lagi satu = 再一个。' }], ['mau', 'mau', '想要 / 要'], ['tidak-mau', 'tidak mau', '不想 / 不要'], ['nggak-mau', 'nggak mau', '不想 / 不要（口语）'], ['bisa', 'bisa', '可以 / 会'], ['tidak-bisa', 'tidak bisa', '不可以 / 不会'], ['nggak-bisa', 'nggak bisa', '不可以 / 不会（口语）'], ['boleh', 'boleh', '可以 / 允许'], ['harus', 'harus', '必须'], ['perlu', 'perlu', '需要'], ['butuh', 'butuh', '需要'], ['jangan', 'jangan', '不要'], ['tolong', 'tolong', '请 / 帮忙'], ['cukup', 'cukup', '够'], ['kurang', 'kurang', '不够 / 少'], ['lebih', 'lebih', '更 / 多一点'],
]);

addSimple('core', 'questions-pronouns', [
  ['saya', 'saya', '我'], ['aku', 'aku', '我（更亲近/口语）'], ['kamu', 'kamu', '你'], ['dia', 'dia', '他 / 她'], ['kita', 'kita', '我们（包括对方）'], ['kami', 'kami', '我们（不包括对方）'], ['ini', 'ini', '这个'], ['itu', 'itu', '那个'], ['yang', 'yang', '那个 / 的 / 用来指代', { usageNote: '强语境词，不要只背一个中文。Yang ini = 这个；yang besar = 大的那个。' }],
  ['apa', 'apa', '什么'], ['siapa', 'siapa', '谁'], ['mana', 'mana', '哪里 / 哪个'], ['di-mana', 'di mana', '在哪里 / 哪儿', { relatedSceneIds: ['EXP-LIF-224'] }], ['ke-mana', 'ke mana', '去哪里'], ['dari-mana', 'dari mana', '从哪里'], ['berapa', 'berapa', '多少'], ['kapan', 'kapan', '什么时候'], ['kenapa', 'kenapa', '为什么 / 怎么了'], ['bagaimana', 'bagaimana', '怎么样 / 如何'], ['gimana', 'gimana', '怎么样 / 怎么（口语）', { standardForms: ['bagaimana'], colloquialForms: ['gimana'] }],
]);

addSimple('core', 'measurement', [
  ['banyak', 'banyak', '很多 / 多'], ['sedikit', 'sedikit', '一点 / 少'], ['semua', 'semua', '全部'], ['meter', 'meter', '米'], ['sentimeter', 'sentimeter', '厘米'], ['kilometer', 'kilometer', '公里'], ['gram', 'gram', '克'], ['kilo', 'kilo', '公斤'], ['kilogram', 'kilogram', '公斤'], ['ton', 'ton', '吨'], ['liter', 'liter', '升'], ['mililiter', 'mililiter', '毫升'], ['derajat', 'derajat', '度'],
]);

addSimple('core', 'descriptions', [
  ['besar', 'besar', '大'], ['kecil', 'kecil', '小'], ['panjang', 'panjang', '长'], ['pendek', 'pendek', '短'], ['tinggi', 'tinggi', '高'], ['rendah', 'rendah', '低'], ['lebar', 'lebar', '宽'], ['sempit', 'sempit', '窄 / 挤 / 紧'], ['tebal', 'tebal', '厚'], ['tipis', 'tipis', '薄'], ['berat', 'berat', '重'], ['ringan', 'ringan', '轻'], ['cepat', 'cepat', '快'], ['pelan', 'pelan', '慢 / 轻一点'], ['baru', 'baru', '新的 / 刚刚'], ['lama', 'lama', '久 / 旧'], ['bagus', 'bagus', '好'], ['jelek', 'jelek', '不好 / 难看'], ['bersih', 'bersih', '干净'], ['kotor', 'kotor', '脏'], ['penuh', 'penuh', '满'], ['rusak', 'rusak', '坏了'], ['aman', 'aman', '安全 / 没问题'], ['siap', 'siap', '准备好了'], ['benar', 'benar', '正确'], ['betul', 'betul', '对 / 正确'], ['salah', 'salah', '错'], ['sama', 'sama', '一样'], ['beda', 'beda', '不同'], ['tahu', 'tahu', '知道'], ['ngerti', 'ngerti', '懂（口语）'], ['paham', 'paham', '理解'], ['ingat', 'ingat', '记得'], ['lupa', 'lupa', '忘了'],
]);

addSimple('core', 'particles', [
  ['ya', 'ya', '语气词 / 好吗', { usageNote: '常用来让语气更柔和，或确认对方听到。', shortExpressions: [{ indonesian: 'Besok ya.', chinese: '明天哈 / 明天可以吗。' }] }], ['nih', 'nih', '就是这个 / 给你看', { usageNote: '把东西拿出来、指出“这个”时常见。', shortExpressions: [{ indonesian: 'Ini nih.', chinese: '就是这个。' }] }], ['sih', 'sih', '语气强调 / 其实', { usageNote: '常用于补充态度，不适合机械翻译。' }], ['dong', 'dong', '嘛 / 一下嘛', { usageNote: '让请求更有“拜托啦”的感觉。', shortExpressions: [{ indonesian: 'Tolong dong.', chinese: '帮帮忙嘛。' }] }], ['deh', 'deh', '吧 / 算了就这样', { usageNote: '常用于做决定或缓和语气。' }], ['kok', 'kok', '怎么 / 怎么会', { usageNote: '表达意外、疑问或轻微不满。', shortExpressions: [{ indonesian: 'Kok belum?', chinese: '怎么还没好？' }] }], ['lah', 'lah', '啦 / 语气强调', { usageNote: '部分口语中加强语气，不要逐词硬翻。' }],
]);

addSimple('feelings', 'body-feelings', [
  ['lapar', 'lapar', '饿'], ['haus', 'haus', '渴'], ['kenyang', 'kenyang', '饱'], ['capek', 'capek', '累（口语常用）'], ['lelah', 'lelah', '疲惫 / 累', { colloquialForms: ['capek'], usageNote: 'lelah 较书面；日常更常听到 capek。' }], ['ngantuk', 'ngantuk', '困'], ['panas-feel', 'panas', '热 / 烫'], ['dingin-feel', 'dingin', '冷 / 凉'], ['gerah', 'gerah', '闷热'], ['lemas', 'lemas', '没力气'], ['nyaman', 'nyaman', '舒服'], ['enak-feel', 'enak', '舒服 / 好吃 / 好用', { usageNote: '强语境词：食物好吃、身体舒服、东西好用都可能用 enak。' }], ['nggak-enak', 'nggak enak', '不舒服 / 不太好'],
]);

addSimple('feelings', 'pain-discomfort', [
  ['sakit', 'sakit', '疼 / 生病'], ['pusing', 'pusing', '头晕 / 头疼'], ['gatal', 'gatal', '痒'], ['mual', 'mual', '恶心'], ['demam', 'demam', '发烧'], ['batuk', 'batuk', '咳嗽'], ['pilek', 'pilek', '感冒 / 流鼻涕'], ['luka', 'luka', '伤口 / 受伤'], ['sakit-kepala', 'sakit kepala', '头痛'], ['sakit-perut', 'sakit perut', '肚子痛'], ['sakit-gigi', 'sakit gigi', '牙痛'], ['sakit-tenggorokan', 'sakit tenggorokan', '喉咙痛'],
]);

addSimple('feelings', 'emotions', [
  ['senang', 'senang', '开心'], ['bahagia', 'bahagia', '幸福 / 很开心'], ['sedih', 'sedih', '难过'], ['marah', 'marah', '生气'], ['takut', 'takut', '害怕'], ['khawatir', 'khawatir', '担心'], ['malu', 'malu', '不好意思 / 害羞'], ['bosan', 'bosan', '无聊'], ['kesal', 'kesal', '烦 / 不爽'], ['kecewa', 'kecewa', '失望'], ['kaget', 'kaget', '吃惊'], ['bingung', 'bingung', '迷糊 / 不知道怎么办'], ['tenang', 'tenang', '平静'], ['santai', 'santai', '放松 / 别急'], ['stres', 'stres', '压力大'], ['malas', 'malas', '懒 / 不想动'], ['semangat', 'semangat', '有精神 / 加油'], ['suka', 'suka', '喜欢'], ['nggak-suka', 'nggak suka', '不喜欢'], ['kangen', 'kangen', '想念'],
]);

addSimple('food', 'vegetables', [
  ['sayur', 'sayur', '蔬菜 / 菜'], ['cabai', 'cabai', '辣椒', { relatedSceneIds: ['EXP-NAN-005'] }], ['tomat', 'tomat', '番茄'], ['kentang', 'kentang', '土豆'], ['wortel', 'wortel', '胡萝卜'], ['bawang-putih', 'bawang putih', '大蒜'], ['bawang-merah', 'bawang merah', '小红葱'], ['bawang-bombai', 'bawang bombai', '洋葱'], ['daun-bawang', 'daun bawang', '葱'], ['seledri', 'seledri', '芹菜'], ['kol', 'kol', '卷心菜'], ['kubis', 'kubis', '卷心菜'], ['sawi', 'sawi', '青菜 / 芥菜类'], ['bayam', 'bayam', '菠菜'], ['kangkung', 'kangkung', '空心菜'], ['buncis', 'buncis', '四季豆'], ['kacang-panjang', 'kacang panjang', '长豆'], ['timun', 'timun', '黄瓜'], ['terong', 'terong', '茄子'], ['jagung', 'jagung', '玉米'], ['jamur', 'jamur', '蘑菇'],
]);

addSimple('food', 'fruits', [
  ['buah', 'buah', '水果'], ['pisang', 'pisang', '香蕉'], ['apel', 'apel', '苹果'], ['jeruk', 'jeruk', '橙子 / 柑橘'], ['mangga', 'mangga', '芒果'], ['semangka', 'semangka', '西瓜'], ['melon', 'melon', '甜瓜'], ['pepaya', 'pepaya', '木瓜'], ['nanas', 'nanas', '菠萝'], ['anggur', 'anggur', '葡萄'], ['stroberi', 'stroberi', '草莓'], ['alpukat', 'alpukat', '牛油果'], ['kelapa', 'kelapa', '椰子'], ['durian', 'durian', '榴莲'], ['rambutan', 'rambutan', '红毛丹'], ['manggis', 'manggis', '山竹'], ['salak', 'salak', '蛇皮果'], ['jambu', 'jambu', '番石榴 / jambu 类水果', { usageNote: '强语境词：不同 jambu 可能指不同水果，购物时最好看实物或补充品种。' }],
]);

addSimple('food', 'meat-seafood', [
  ['daging', 'daging', '肉'], ['daging-sapi', 'daging sapi', '牛肉'], ['ayam', 'ayam', '鸡 / 鸡肉'], ['daging-ayam', 'daging ayam', '鸡肉'], ['babi', 'babi', '猪 / 猪肉'], ['daging-babi', 'daging babi', '猪肉'], ['ikan', 'ikan', '鱼'], ['udang', 'udang', '虾'], ['cumi-cumi', 'cumi-cumi', '鱿鱼'], ['kepiting', 'kepiting', '螃蟹'], ['kerang', 'kerang', '贝类'], ['telur', 'telur', '鸡蛋 / 蛋'],
]);

addSimple('food', 'seasonings', [
  ['garam', 'garam', '盐'], ['gula', 'gula', '糖'], ['minyak', 'minyak', '油'], ['minyak-goreng', 'minyak goreng', '食用油 / 炸油'], ['kecap', 'kecap', '酱油类调味汁', { usageNote: '不要机械等于中国酱油；印尼 kecap 常指酱油类调味汁。' }], ['kecap-manis', 'kecap manis', '甜酱油类调味汁', { usageNote: '印尼非常常见，偏甜、颜色较深。' }], ['kecap-asin', 'kecap asin', '咸酱油类调味汁'], ['saus', 'saus', '酱 / 调味酱'], ['saus-sambal', 'saus sambal', '辣椒酱'], ['sambal', 'sambal', '印尼辣酱'], ['cuka', 'cuka', '醋'], ['lada', 'lada', '胡椒 / 辣椒（看语境）'], ['merica', 'merica', '胡椒'], ['penyedap', 'penyedap', '味精 / 增味料'],
]);

addSimple('food', 'staples', [
  ['nasi', 'nasi', '米饭', { usageNote: '煮熟的米饭。' }], ['beras', 'beras', '大米', { usageNote: '未煮的大米。' }], ['bubur', 'bubur', '粥'], ['mie', 'mie', '面'], ['roti', 'roti', '面包'], ['tahu-food', 'tahu', '豆腐'], ['tempe', 'tempe', '天贝'], ['susu', 'susu', '牛奶'], ['keju', 'keju', '奶酪'], ['sup', 'sup', '汤'], ['nasi-goreng', 'nasi goreng', '炒饭'], ['mie-goreng', 'mie goreng', '炒面'], ['mie-instan', 'mie instan', '方便面'], ['gorengan', 'gorengan', '油炸小吃'],
]);

addSimple('food', 'drinks', [
  ['air', 'air', '水', { usageNote: '在印尼语里 air 通常是“水”，不是英文 air。' }], ['air-putih', 'air putih', '白水 / 饮用水'], ['air-mineral', 'air mineral', '矿泉水'], ['air-panas', 'air panas', '热水'], ['air-dingin', 'air dingin', '冷水'], ['es', 'es', '冰'], ['kopi', 'kopi', '咖啡'], ['teh', 'teh', '茶'], ['jus', 'jus', '果汁'], ['teh-manis', 'teh manis', '甜茶'], ['es-teh', 'es teh', '冰茶'], ['kopi-susu', 'kopi susu', '牛奶咖啡'], ['tanpa-es', 'tanpa es', '不要冰'], ['sedikit-es', 'sedikit es', '少冰'], ['tanpa-gula', 'tanpa gula', '不要糖'], ['sedikit-gula', 'sedikit gula', '少糖'],
]);

addSimple('food', 'taste-texture', [
  ['manis', 'manis', '甜'], ['asin', 'asin', '咸'], ['pedas', 'pedas', '辣'], ['asam', 'asam', '酸'], ['pahit', 'pahit', '苦'], ['hambar', 'hambar', '味道淡'], ['tawar', 'tawar', '淡 / 无糖'], ['hangat', 'hangat', '温热'], ['mentah', 'mentah', '生的 / 没熟'], ['matang', 'matang', '熟了'], ['gosong', 'gosong', '焦了'],
]);

addSimple('food', 'cooking-actions', [
  ['masak', 'masak', '做饭 / 烹饪'], ['goreng', 'goreng', '炸 / 炒'], ['rebus', 'rebus', '煮'], ['bakar', 'bakar', '烤'], ['steam', 'steam', '蒸（现实厨房口语可见）', { usageNote: '部分日常厨房语境常见，但不是唯一正确表达。' }], ['kukus', 'kukus', '蒸（标准印尼语）', { usageNote: '标准印尼语；不要被 steam 完全替代。' }], ['kupas', 'kupas', '削皮 / 剥皮'], ['campur', 'campur', '混合'], ['pisah', 'pisah', '分开'],
]);

addSimple('body-clothing', 'body-parts', [
  ['kepala', 'kepala', '头'], ['rambut', 'rambut', '头发'], ['wajah', 'wajah', '脸'], ['muka', 'muka', '脸（口语常用）'], ['mata', 'mata', '眼睛'], ['hidung', 'hidung', '鼻子'], ['mulut', 'mulut', '嘴'], ['gigi', 'gigi', '牙齿'], ['telinga', 'telinga', '耳朵'], ['leher', 'leher', '脖子'], ['tenggorokan', 'tenggorokan', '喉咙'], ['bahu', 'bahu', '肩膀'], ['dada', 'dada', '胸口 / 胸部'], ['tangan', 'tangan', '手 / 手臂', { usageNote: '语义范围可能覆盖中文“手”和“手臂”，看具体场景。' }], ['jari', 'jari', '手指 / 脚趾'], ['perut', 'perut', '肚子'], ['pinggang', 'pinggang', '腰'], ['punggung', 'punggung', '背'], ['kaki', 'kaki', '脚 / 腿', { usageNote: '语义范围可能覆盖中文“脚”和“腿”，看具体场景。' }], ['lutut', 'lutut', '膝盖'], ['kulit', 'kulit', '皮肤'], ['darah', 'darah', '血'],
]);

addSimple('body-clothing', 'clothes-accessories', [
  ['baju', 'baju', '衣服'], ['kaus', 'kaus', 'T恤'], ['kemeja', 'kemeja', '衬衫'], ['celana', 'celana', '裤子'], ['celana-pendek', 'celana pendek', '短裤'], ['jaket', 'jaket', '夹克 / 外套'], ['sepatu', 'sepatu', '鞋'], ['sandal', 'sandal', '拖鞋 / 凉鞋'], ['kaus-kaki', 'kaus kaki', '袜子'], ['topi', 'topi', '帽子'], ['tas', 'tas', '包'], ['kacamata', 'kacamata', '眼镜'], ['jam-tangan', 'jam tangan', '手表'],
]);

addSimple('body-clothing', 'wearing-size', [
  ['lepas', 'lepas', '脱 / 摘下'], ['cocok', 'cocok', '合适'], ['longgar', 'longgar', '松'], ['kebesaran', 'kebesaran', '太大'], ['kekecilan', 'kekecilan', '太小'],
]);

addSimple('home', 'home-items', [
  ['rumah', 'rumah', '家 / 房子'], ['kamar', 'kamar', '房间'], ['kamar-tidur', 'kamar tidur', '卧室'], ['ruang-tamu', 'ruang tamu', '客厅'], ['dapur', 'dapur', '厨房'], ['kamar-mandi', 'kamar mandi', '洗手间 / 浴室', { relatedSceneIds: ['EXP-LIF-224'] }], ['pintu', 'pintu', '门'], ['jendela', 'jendela', '窗户'], ['lantai', 'lantai', '地板'], ['meja', 'meja', '桌子'], ['kursi', 'kursi', '椅子'], ['sofa', 'sofa', '沙发'], ['tempat-tidur', 'tempat tidur', '床'], ['lemari', 'lemari', '柜子 / 衣柜'], ['kunci', 'kunci', '钥匙 / 锁'], ['lampu', 'lampu', '灯'], ['ac', 'AC', '空调'], ['kipas-angin', 'kipas angin', '风扇'],
]);

addSimple('home', 'kitchen-items', [
  ['piring', 'piring', '盘子'], ['mangkuk', 'mangkuk', '碗'], ['gelas', 'gelas', '杯子'], ['sendok', 'sendok', '勺子'], ['garpu', 'garpu', '叉子'], ['sumpit', 'sumpit', '筷子'], ['pisau', 'pisau', '刀'], ['talenan', 'talenan', '砧板'], ['panci', 'panci', '锅'], ['wajan', 'wajan', '炒锅 / 平底锅'], ['spatula', 'spatula', '锅铲'], ['sutil', 'sutil', '锅铲（常见说法）'], ['sendok-sayur', 'sendok sayur', '汤勺'], ['saringan', 'saringan', '滤网 / 筛子'], ['kompor', 'kompor', '炉灶'], ['kompor-gas', 'kompor gas', '燃气灶'], ['rice-cooker', 'rice cooker', '电饭锅'], ['kulkas', 'kulkas', '冰箱'], ['botol', 'botol', '瓶子'], ['wadah', 'wadah', '容器'], ['gas', 'gas', '煤气 / 燃气', { relatedSceneIds: ['EXP-NAN-010'] }], ['tabung-gas', 'tabung gas', '煤气罐', { relatedSceneIds: ['EXP-NAN-010'] }], ['lpg', 'LPG', '液化石油气'], ['elpiji', 'elpiji', 'LPG / 液化气（现实写法）'], ['regulator', 'regulator', '煤气减压阀'], ['selang-gas', 'selang gas', '煤气管'],
]);

addSimple('home', 'personal-care', [
  ['sikat-gigi', 'sikat gigi', '牙刷'], ['pasta-gigi', 'pasta gigi', '牙膏'], ['sabun', 'sabun', '肥皂'], ['sabun-cair', 'sabun cair', '液体肥皂'], ['sabun-mandi', 'sabun mandi', '沐浴皂 / 沐浴用品'], ['sampo', 'sampo', '洗发水'], ['shampoo', 'shampoo', '洗发水（包装常见）'], ['sabun-muka', 'sabun muka', '洗面奶 / 洗脸皂'], ['facial-wash', 'facial wash', '洗面奶（包装常见）'], ['sabun-mandi-cair', 'sabun mandi cair', '沐浴露'], ['body-wash', 'body wash', '沐浴露（包装常见）'], ['handuk', 'handuk', '毛巾'], ['tisu', 'tisu', '纸巾'], ['tisu-toilet', 'tisu toilet', '厕纸'], ['sisir', 'sisir', '梳子'], ['alat-cukur', 'alat cukur', '剃须刀 / 刮胡工具'],
]);

addSimple('home', 'cleaning-laundry', [
  ['deterjen', 'deterjen', '洗衣剂'], ['deterjen-bubuk', 'deterjen bubuk', '洗衣粉'], ['deterjen-cair', 'deterjen cair', '洗衣液'], ['pelembut-pakaian', 'pelembut pakaian', '柔顺剂'], ['pemutih', 'pemutih', '漂白剂'], ['sabun-cuci-piring', 'sabun cuci piring', '洗洁精'], ['spons', 'spons', '海绵'], ['sapu', 'sapu', '扫把'], ['pel', 'pel', '拖把'], ['lap', 'lap', '抹布'], ['ember', 'ember', '水桶'], ['tempat-sampah', 'tempat sampah', '垃圾桶'], ['sampah', 'sampah', '垃圾'], ['mesin-cuci', 'mesin cuci', '洗衣机'], ['jemuran', 'jemuran', '晾衣架 / 晾衣处'],
]);

addSimple('home', 'personal-electronics', [
  ['hp', 'HP', '手机', { usageNote: '印尼日常非常常用，来自 handphone。', relatedSceneIds: ['EXP-LIF-193'] }], ['charger', 'charger', '充电器'], ['kabel', 'kabel', '线 / 数据线'], ['power-bank', 'power bank', '充电宝'], ['baterai', 'baterai', '电池 / 电量'], ['laptop', 'laptop', '笔记本电脑'], ['wi-fi', 'Wi-Fi', '无线网'], ['internet', 'internet', '网络'], ['colokan', 'colokan', '插座'], ['saklar', 'saklar', '开关'], ['remote', 'remote', '遥控器'], ['dompet', 'dompet', '钱包'], ['uang', 'uang', '钱'], ['kartu', 'kartu', '卡'], ['nyala', 'nyala', '亮着 / 开着'], ['mati', 'mati', '关了 / 没电了'], ['habis', 'habis', '没了 / 用完了'], ['lowbat', 'lowbat', '快没电了', { standardForms: ['Baterai hampir habis.'], colloquialForms: ['HP-ku lowbat.'], usageNote: '现实口语很常见。HP-ku ≈ 我的手机。', shortExpressions: [{ indonesian: 'HP-ku lowbat.', chinese: '我手机快没电了。' }] }],
]);

addSimple('transport', 'car-ride', [
  ['mobil', 'mobil', '汽车'], ['driver', 'driver', '司机'], ['sopir', 'sopir', '司机'], ['taksi', 'taksi', '出租车'], ['jemput', 'jemput', '接人', { relatedSceneIds: ['EXP-DRV-001'] }], ['antar', 'antar', '送人'], ['lokasi', 'lokasi', '位置'], ['tujuan', 'tujuan', '目的地'], ['alamat', 'alamat', '地址'], ['bagasi', 'bagasi', '行李 / 后备箱'], ['sabuk-pengaman', 'sabuk pengaman', '安全带'], ['ban', 'ban', '轮胎'], ['rem', 'rem', '刹车'], ['berangkat', 'berangkat', '出发'], ['tiba', 'tiba', '到达'],
]);

addSimple('transport', 'motorbike', [
  ['motor', 'motor', '摩托车'], ['helm', 'helm', '头盔'], ['ojek', 'ojek', '摩托车载客服务'], ['naik-motor', 'naik motor', '坐摩托'], ['parkir-motor', 'parkir motor', '停摩托'],
]);

addSimple('transport', 'road-parking', [
  ['tol', 'tol', '高速 / 收费路'], ['macet', 'macet', '堵车', { relatedSceneIds: ['EXP-DRV-004'] }], ['lancar', 'lancar', '顺畅 / 不堵'], ['lampu-merah', 'lampu merah', '红绿灯'], ['belok', 'belok', '转弯'], ['lurus', 'lurus', '直走'], ['putar-balik', 'putar balik', '掉头'], ['parkir', 'parkir', '停车'], ['pintu-masuk', 'pintu masuk', '入口'], ['pintu-keluar', 'pintu keluar', '出口'], ['saldo', 'saldo', '余额'], ['e-toll', 'e-toll', '高速卡 / 电子收费卡'],
]);

addSimple('transport', 'fuel', [
  ['bensin', 'bensin', '汽油'], ['solar', 'solar', '柴油'], ['spbu', 'SPBU', '加油站'], ['isi-bensin', 'isi bensin', '加油'], ['isi-penuh', 'isi penuh', '加满'], ['pertalite', 'Pertalite', 'Pertalite（印尼油品名）'], ['pertamax', 'Pertamax', 'Pertamax（印尼油品名）'], ['dex', 'Dex', 'Dex（印尼油品名）'],
]);

addSimple('transport', 'ev-charging', [
  ['cas', 'cas', '充电（口语）'], ['charge', 'charge', '充电（现实常见）'], ['spklu', 'SPKLU', '电动车公共充电站'], ['persen', 'persen', '百分比'],
]);

addSimple('transport', 'airport', [
  ['pesawat', 'pesawat', '飞机'], ['bandara', 'bandara', '机场'], ['terminal-airport', 'terminal', '航站楼'], ['penerbangan', 'penerbangan', '航班'], ['tiket', 'tiket', '票'], ['paspor', 'paspor', '护照'], ['check-in', 'check-in', '值机'], ['boarding', 'boarding', '登机'], ['gate', 'gate', '登机口'], ['terlambat', 'terlambat', '迟到 / 延误'],
]);

addSimple('core', 'measurement', [
  ['kotak-counter', 'kotak', '盒 / 箱'], ['lembar-counter', 'lembar', '张'],
]);

addSimple('core', 'descriptions', [
  ['harga', 'harga', '价格'], ['mahal', 'mahal', '贵'], ['murah', 'murah', '便宜'], ['diskon', 'diskon', '折扣'], ['tunai', 'tunai', '现金'], ['cash', 'cash', '现金（现实常见）'], ['kembalian', 'kembalian', '找零'], ['transfer', 'transfer', '转账'], ['qris', 'QRIS', '印尼二维码支付', { usageNote: '印尼常见二维码支付方式。', shortExpressions: [{ indonesian: 'Bisa QRIS?', chinese: '可以用 QRIS 吗？' }] }],
]);

addSimple('core', 'questions-pronouns', [
  ['orang', 'orang', '人'], ['teman', 'teman', '朋友'], ['anak', 'anak', '孩子'], ['orang-tua', 'orang tua', '父母 / 老人'], ['suami', 'suami', '丈夫'], ['istri', 'istri', '妻子'], ['ibu', 'ibu', '妈妈 / 女士', { usageNote: '也常作礼貌称呼 Bu，用于成年女性。' }], ['bapak', 'bapak', '爸爸 / 先生', { usageNote: '也常作礼貌称呼 Pak，用于成年男性。' }], ['kakak', 'kakak', '哥哥 / 姐姐'], ['adik', 'adik', '弟弟 / 妹妹'], ['pak', 'Pak', '先生 / Pak', { usageNote: '对成年男性常见礼貌称呼，不只是“爸爸”。' }], ['bu', 'Bu', '女士 / Bu', { usageNote: '对成年女性常见礼貌称呼，不只是“妈妈”。' }], ['kak', 'Kak', 'Kak / 友好称呼', { usageNote: '对较年轻成年人很常见的友好称呼。' }],
]);

addSimple('core', 'particles', [
  ['halo', 'halo', '你好'], ['terima-kasih', 'terima kasih', '谢谢', { relatedSceneIds: ['EXP-LIF-231'] }], ['sama-sama', 'sama-sama', '不客气'], ['maaf', 'maaf', '对不起 / 不好意思'], ['permisi', 'permisi', '打扰一下 / 不好意思', { relatedSceneIds: ['EXP-LIF-224'] }], ['silakan', 'silakan', '请'], ['hati-hati', 'hati-hati', '小心 / 路上小心'], ['selamat', 'selamat', '祝 / 安好', { usageNote: '多语境词，如 Selamat pagi、Selamat ulang tahun、Selamat jalan。' }],
]);

addSimple('core', 'questions-pronouns', [
  ['nama', 'nama', '名字'], ['nomor', 'nomor', '号码'], ['foto', 'foto', '照片'], ['video', 'video', '视频'], ['pesan', 'pesan', '消息 / 点单 / 订购', { usageNote: '强语境词：聊天里是消息，餐饮里可表示点单，采购里可表示订购。', relatedSceneIds: ['EXP-PUR-003'] }], ['whatsapp', 'WhatsApp', 'WhatsApp 聊天软件'], ['wa', 'WA', 'WhatsApp（缩写）'],
]);

export const basicEssentialsNumberSteps: BasicNumberStep[] = [
  { id: 'zero-ten', title: '0–10', note: '先把最小数字听熟。0 同时记住 nol 和 kosong。', items: ['nol', 'kosong', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'].map((key) => ({ indonesian: concepts.find((item) => item.conceptKey === key)?.indonesian ?? key, chinese: concepts.find((item) => item.conceptKey === key)?.chinese ?? key })) },
  { id: 'belas', title: '11–19', note: 'belas ≈ 十几。11 是 sebelas，后面更规律。', items: ['sebelas', 'dua-belas', 'tiga-belas', 'empat-belas', 'lima-belas', 'enam-belas', 'tujuh-belas', 'delapan-belas', 'sembilan-belas'].map((key) => ({ indonesian: concepts.find((item) => item.conceptKey === key)?.indonesian ?? key, chinese: concepts.find((item) => item.conceptKey === key)?.chinese ?? key })) },
  { id: 'puluh-ratus-ribu-juta', title: '整十 · 百 · 千 · 百万', note: '10.000 = sepuluh ribu = 一万；100.000 = seratus ribu = 十万。', items: [{ indonesian: 'dua puluh satu', chinese: '二十一' }, { indonesian: 'tiga puluh delapan', chinese: '三十八' }, { indonesian: 'seratus', chinese: '一百' }, { indonesian: 'dua ratus', chinese: '两百' }, { indonesian: 'sepuluh ribu', chinese: '一万' }, { indonesian: 'seratus ribu', chinese: '十万' }, { indonesian: 'satu juta', chinese: '一百万' }] },
  { id: 'price-phone', title: '价格与电话', note: '价格按 ribu / juta 理解；电话号码里的 0 常读 kosong。', items: [{ indonesian: 'Rp25.000 — dua puluh lima ribu', chinese: '两万五千' }, { indonesian: 'Rp125.000 — seratus dua puluh lima ribu', chinese: '十二万五千' }, { indonesian: 'Rp1.500.000 — satu juta lima ratus ribu', chinese: '一百五十万' }, { indonesian: '0812 — kosong delapan satu dua', chinese: '电话号 0812 的常见读法' }] },
];

export const basicEssentialsCounterExamples: BasicCombination[] = [
  { indonesian: 'dua orang', chinese: '两个人' }, { indonesian: 'dua botol', chinese: '两瓶' }, { indonesian: 'dua gelas', chinese: '两杯' }, { indonesian: 'dua piring', chinese: '两盘' }, { indonesian: 'dua bungkus', chinese: '两包 / 两份' }, { indonesian: 'dua kotak', chinese: '两盒' }, { indonesian: 'dua kilo', chinese: '两公斤' }, { indonesian: 'dua liter', chinese: '两升' }, { indonesian: 'dua lembar', chinese: '两张' }, { indonesian: 'dua mobil', chinese: '两辆车' }, { indonesian: 'dua hari', chinese: '两天' },
];

export const basicEssentialsMicroScenes: BasicMicroScene[] = [
  {
    id: 'micro-core-actions-home-001',
    titleZh: '在家里让人帮忙',
    contextZh: '刚学完几个动作，马上能叫人拿、放、开、关。',
    conceptIds: ['makan', 'minum', 'ambil', 'taruh', 'buka', 'tutup', 'pintu', 'di-sini'],
    lines: [
      { indonesian: 'Tolong ambil ini.', chinese: '帮我拿这个。', ttsText: 'Tolong ambil ini.' },
      { indonesian: 'Taruh di sini.', chinese: '放在这里。', ttsText: 'Taruh di sini.' },
      { indonesian: 'Buka pintunya.', chinese: '把门打开。', ttsText: 'Buka pintunya.' },
      { indonesian: 'Tutup pintunya.', chinese: '把门关上。', ttsText: 'Tutup pintunya.' },
    ],
    relatedSceneIds: [],
    priority: 10,
    status: 'active',
  },
  {
    id: 'micro-feelings-after-work-001',
    titleZh: '下班回到家',
    contextZh: '饿、累、困、渴，先把真实状态说出来。',
    conceptIds: ['lapar', 'haus', 'capek', 'ngantuk', 'minum'],
    lines: [
      { indonesian: 'Lapar banget.', chinese: '好饿。', ttsText: 'Lapar banget.' },
      { indonesian: 'Capek nih.', chinese: '有点累了。', ttsText: 'Capek nih.' },
      { indonesian: 'Aku ngantuk.', chinese: '我困了。', ttsText: 'Aku ngantuk.' },
      { indonesian: 'Mau minum dulu.', chinese: '想先喝点东西。', ttsText: 'Mau minum dulu.' },
    ],
    relatedSceneIds: [],
    priority: 20,
    status: 'active',
  },
  {
    id: 'micro-core-directions-driver-001',
    titleZh: '坐车给司机指路',
    contextZh: '不用长句，三句话就能让司机明白方向。',
    conceptIds: ['kiri', 'kanan', 'depan', 'di-sini', 'di-sana', 'lurus', 'belok'],
    lines: [
      { indonesian: 'Lurus saja.', chinese: '一直往前。', ttsText: 'Lurus saja.' },
      { indonesian: 'Belok kanan di depan.', chinese: '前面右转。', ttsText: 'Belok kanan di depan.' },
      { indonesian: 'Berhenti di sini ya.', chinese: '在这里停一下。', ttsText: 'Berhenti di sini ya.' },
    ],
    relatedSceneIds: ['EXP-DRV-001'],
    priority: 30,
    status: 'active',
  },
  {
    id: 'micro-core-numbers-shop-001',
    titleZh: '买东西报数量',
    contextZh: '买水、买东西时，数字马上能派上用场。',
    conceptIds: ['satu', 'dua', 'tiga', 'sepuluh', 'botol', 'harga'],
    lines: [
      { indonesian: 'Dua botol ya.', chinese: '两瓶。', ttsText: 'Dua botol ya.' },
      { indonesian: 'Satu lagi.', chinese: '再一个。', ttsText: 'Satu lagi.' },
      { indonesian: 'Sepuluh ribu?', chinese: '一万吗？', ttsText: 'Sepuluh ribu?' },
    ],
    relatedSceneIds: [],
    priority: 40,
    status: 'active',
  },
  {
    id: 'micro-food-order-001',
    titleZh: '吃饭点单',
    contextZh: '少糖、少辣、不要冰，点餐时最先够用。',
    conceptIds: ['makan', 'minum', 'teh', 'tanpa-gula', 'sedikit-gula', 'tanpa-es', 'pedas'],
    lines: [
      { indonesian: 'Saya mau makan di sini.', chinese: '我想在这里吃。', ttsText: 'Saya mau makan di sini.' },
      { indonesian: 'Jangan terlalu pedas.', chinese: '不要太辣。', ttsText: 'Jangan terlalu pedas.' },
      { indonesian: 'Tehnya sedikit gula ya.', chinese: '茶少糖。', ttsText: 'Tehnya sedikit gula ya.' },
      { indonesian: 'Tanpa es.', chinese: '不要冰。', ttsText: 'Tanpa es.' },
    ],
    relatedSceneIds: [],
    priority: 50,
    status: 'active',
  },
  {
    id: 'micro-home-kitchen-001',
    titleZh: '厨房里找东西',
    contextZh: '筷子、碗、锅铲、煤气，都是家里马上会用的词。',
    conceptIds: ['sumpit', 'mangkuk', 'spatula', 'gas', 'tabung-gas', 'kompor'],
    lines: [
      { indonesian: 'Ambil sumpitnya ya.', chinese: '拿一下筷子。', ttsText: 'Ambil sumpitnya ya.' },
      { indonesian: 'Mangkuknya di mana?', chinese: '碗在哪里？', ttsText: 'Mangkuknya di mana?' },
      { indonesian: 'Gas habis.', chinese: '煤气没了。', ttsText: 'Gas habis.' },
      { indonesian: 'Tolong cek tabung gas.', chinese: '帮我看一下煤气罐。', ttsText: 'Tolong cek tabung gas.' },
    ],
    relatedSceneIds: ['EXP-NAN-010'],
    priority: 60,
    status: 'active',
  },
  {
    id: 'micro-transport-pickup-001',
    titleZh: '司机来接你',
    contextZh: '接送、定位、到了没有，先学最短可用句。',
    conceptIds: ['driver', 'sopir', 'jemput', 'antar', 'lokasi', 'alamat', 'tiba'],
    lines: [
      { indonesian: 'Sudah sampai?', chinese: '到了吗？', ttsText: 'Sudah sampai?' },
      { indonesian: 'Saya kirim lokasi ya.', chinese: '我发定位。', ttsText: 'Saya kirim lokasi ya.' },
      { indonesian: 'Jemput saya di sini.', chinese: '在这里接我。', ttsText: 'Jemput saya di sini.' },
    ],
    relatedSceneIds: ['EXP-DRV-001'],
    priority: 70,
    status: 'active',
  },
  {
    id: 'micro-home-personal-care-001',
    titleZh: '洗漱用品用完了',
    contextZh: '牙膏、纸巾、洗发水，家里缺了就这样说。',
    conceptIds: ['pasta-gigi', 'tisu', 'tisu-toilet', 'sampo', 'shampoo', 'sabun', 'habis'],
    lines: [
      { indonesian: 'Pasta gigi habis.', chinese: '牙膏没了。', ttsText: 'Pasta gigi habis.' },
      { indonesian: 'Tolong ambil tisu.', chinese: '帮我拿纸巾。', ttsText: 'Tolong ambil tisu.' },
      { indonesian: 'Sampo beli di mana?', chinese: '洗发水在哪里买？', ttsText: 'Sampo beli di mana?' },
    ],
    relatedSceneIds: ['EXP-LIF-224'],
    priority: 80,
    status: 'active',
  },
];

export const basicEssentialsConcepts = concepts;

export const BASIC_ESSENTIALS_FAVORITE_PREFIX = 'BASIC:';

export type BasicSearchEntry = {
  id: string;
  conceptKey: string;
  indonesian: string;
  chinese: string;
  searchText: string;
  href: string;
};

function normalizeBasicSearchText(value: string) {
  return value.trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ');
}

export function getBasicFavoriteId(conceptKey: string) {
  return `${BASIC_ESSENTIALS_FAVORITE_PREFIX}${conceptKey}`;
}

export function isBasicFavoriteId(value: string) {
  return value.startsWith(BASIC_ESSENTIALS_FAVORITE_PREFIX);
}

export function resolveBasicFavoriteIds(favoriteIds: string[]) {
  const conceptByFavoriteId = new Map(
    getBasicConcepts().map((concept) => [getBasicFavoriteId(concept.conceptKey), concept]),
  );
  return favoriteIds
    .map((favoriteId) => conceptByFavoriteId.get(favoriteId))
    .filter((concept): concept is BasicConcept => Boolean(concept));
}

export function getBasicConceptSearchText(concept: BasicConcept) {
  return normalizeBasicSearchText([
    concept.indonesian,
    concept.chinese,
    concept.shortMeaning,
    ...concept.tags,
    ...concept.standardForms,
    ...concept.colloquialForms,
  ].join(' '));
}

export function getBasicCategory(categoryId?: string) {
  return basicEssentialsCategories.find((item) => item.id === categoryId);
}

export function getBasicSubcategory(categoryId?: string, subcategoryId?: string) {
  return getBasicCategory(categoryId)?.subcategories.find((item) => item.id === subcategoryId);
}

export function getBasicConcepts(filters: { categoryId?: string; subcategoryId?: string } = {}) {
  return basicEssentialsConcepts
    .filter((item) => item.status === 'active')
    .filter((item) => !filters.categoryId || item.categoryId === filters.categoryId)
    .filter((item) => !filters.subcategoryId || item.subcategoryId === filters.subcategoryId)
    .sort((a, b) => a.priority - b.priority || a.order - b.order);
}

export function getBasicConcept(conceptKey?: string) {
  return basicEssentialsConcepts.find((item) => item.conceptKey === conceptKey);
}

export function searchBasicConcepts(query: string) {
  const term = normalizeBasicSearchText(query);
  if (!term) return [];
  return getBasicConcepts().filter((concept) => getBasicConceptSearchText(concept).includes(term));
}

export function getBasicSearchEntries(): BasicSearchEntry[] {
  return getBasicConcepts().map((concept) => ({
    id: concept.id,
    conceptKey: concept.conceptKey,
    indonesian: concept.indonesian,
    chinese: concept.chinese,
    searchText: getBasicConceptSearchText(concept),
    href: `/basic-essentials?category=${encodeURIComponent(concept.categoryId)}&sub=${encodeURIComponent(concept.subcategoryId)}&concept=${encodeURIComponent(concept.conceptKey)}`,
  }));
}

export function getBasicMicroScenesForConcepts(conceptIds: string[]) {
  const conceptSet = new Set(conceptIds);
  return basicEssentialsMicroScenes
    .filter((scene) => scene.status === 'active')
    .filter((scene) => scene.conceptIds.some((conceptId) => conceptSet.has(conceptId)))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

export function getBasicStats() {
  const standardForms = basicEssentialsConcepts.reduce((sum, item) => sum + item.standardForms.length, 0);
  const colloquialForms = basicEssentialsConcepts.reduce((sum, item) => sum + item.colloquialForms.length, 0);
  const combinations = basicEssentialsConcepts.reduce((sum, item) => sum + item.combinations.length, 0) + basicEssentialsCounterExamples.length + basicEssentialsNumberSteps.reduce((sum, step) => sum + step.items.length, 0);
  const shortExpressions = basicEssentialsConcepts.reduce((sum, item) => sum + item.shortExpressions.length, 0);
  return {
    totalConcepts: basicEssentialsConcepts.length,
    standardForms,
    colloquialForms,
    combinations,
    shortExpressions,
  };
}
