import type { Essential } from '@/lib/essentials';

export type LifeBasicsTopic = 'numbers' | 'time' | 'money' | 'directions' | 'office' | 'indonesia';
export type LifeBasicsGroup = { title: string; chineseTitle: string; tip?: string; items: Essential[] };
export type LifeBasicsSection = { slug: LifeBasicsTopic; indonesian: string; chinese: string; description: string; groups: LifeBasicsGroup[] };

const item = (topic: LifeBasicsTopic, order: number, chinese: string, indonesian: string): Essential => ({
  id: `BAS-LIF-${topic.slice(0, 3).toUpperCase()}-${String(order).padStart(3, '0')}`,
  module: 'social', category: topic, chinese, indonesian, aliases: [chinese, indonesian], sortOrder: order,
});
const list = (topic: LifeBasicsTopic, entries: Array<[string, string]>) => entries.map(([chinese, indonesian], index) => item(topic, index + 1, chinese, indonesian));
const officePatterns = [
  { indonesian: 'Tolong + kata kerja', chinese: '请 + 动词', substitutions: [{ indonesian: 'Tolong nyalakan AC.', chinese: '请打开空调。' }, { indonesian: 'Tolong cetak dokumen ini.', chinese: '请打印这份文件。' }, { indonesian: 'Tolong masukkan dokumennya ke dalam map.', chinese: '请把文件放进文件夹。' }, { indonesian: 'Tolong ambilkan pulpen.', chinese: '请拿一支圆珠笔。' }] },
  { indonesian: 'Di mana + benda?', chinese: '……在哪里？', substitutions: [{ indonesian: 'Di mana guntingnya?', chinese: '剪刀在哪里？' }, { indonesian: 'Di mana mouse pad-nya?', chinese: '鼠标垫在哪里？' }, { indonesian: 'Di mana kartu namanya?', chinese: '名片在哪里？' }, { indonesian: 'Di mana lemnya?', chinese: '胶水在哪里？' }] },
  { indonesian: '[Benda] + rusak / habis / tidak ada', chinese: '物品 + 坏了 / 用完了 / 没有了', substitutions: [{ indonesian: 'Printernya rusak.', chinese: '打印机坏了。' }, { indonesian: 'Lemnya sudah habis.', chinese: '胶水用完了。' }, { indonesian: 'Kopinya tidak ada.', chinese: '没有咖啡了。' }, { indonesian: 'Internetnya bermasalah.', chinese: '网络有问题。' }] },
  { indonesian: 'Ada + benda + lokasi', chinese: '有 + 物品 + 地点', substitutions: [{ indonesian: 'Ada camilan di meja.', chinese: '桌上有零食。' }, { indonesian: 'Ada amplop di lemari.', chinese: '柜子里有信封。' }, { indonesian: 'Ada pulpen di laci.', chinese: '抽屉里有圆珠笔。' }, { indonesian: 'Ada map di meja kerja.', chinese: '办公桌上有文件夹。' }] },
];
const officeItems = (entries: Array<[string, string, string, string, string[]]>, groupIndex: number) => entries.map(([chinese, indonesian, example, exampleChinese, exampleHarvest], index): Essential => ({
  id: `BAS-LIF-OFF-${String(groupIndex * 10 + index + 1).padStart(3, '0')}`,
  module: 'social', category: 'office', chinese, indonesian, example, exampleChinese, exampleHarvest, aliases: [chinese, indonesian, example], sortOrder: groupIndex * 10 + index + 1,
  pattern: index === 0 ? officePatterns[groupIndex] : undefined,
}));

export const lifeBasics: LifeBasicsSection[] = [
  { slug: 'numbers', indonesian: 'Angka', chinese: '数字', description: '数字、金额与数量的快速参考。', groups: [
    { title: '1–10', chineseTitle: '一到十', items: list('numbers', [['1', 'satu'], ['2', 'dua'], ['3', 'tiga'], ['4', 'empat'], ['5', 'lima'], ['6', 'enam'], ['7', 'tujuh'], ['8', 'delapan'], ['9', 'sembilan'], ['10', 'sepuluh']]) },
    { title: '11–19', chineseTitle: '十一到十九', tip: 'belas 表示“十几”；例如 dua belas 是十二。', items: list('numbers', [['11', 'sebelas'], ['12', 'dua belas'], ['13', 'tiga belas'], ['14', 'empat belas'], ['15', 'lima belas'], ['16', 'enam belas'], ['17', 'tujuh belas'], ['18', 'delapan belas'], ['19', 'sembilan belas']]) },
    { title: 'Puluhan', chineseTitle: '几十', tip: 'puluh 表示“十”；例如 dua puluh satu 是二十一。', items: list('numbers', [['20', 'dua puluh'], ['21', 'dua puluh satu'], ['30', 'tiga puluh'], ['40', 'empat puluh'], ['50', 'lima puluh'], ['60', 'enam puluh'], ['70', 'tujuh puluh'], ['80', 'delapan puluh'], ['90', 'sembilan puluh']]) },
    { title: 'Ratusan & ribuan', chineseTitle: '百与千', tip: 'ratus 表示“百”，ribu 表示“千”，juta 表示“百万”。', items: list('numbers', [['100', 'seratus'], ['101', 'seratus satu'], ['200', 'dua ratus'], ['1,000', 'seribu'], ['2,000', 'dua ribu'], ['10,000', 'sepuluh ribu'], ['20,000', 'dua puluh ribu'], ['50,000', 'lima puluh ribu'], ['100,000', 'seratus ribu'], ['500,000', 'lima ratus ribu'], ['1,000,000', 'satu juta']]) },
  ] },
  { slug: 'time', indonesian: 'Waktu', chinese: '时间', description: '日常安排、见面与等待时最常用的时间表达。', groups: [
    { title: 'Waktu sehari-hari', chineseTitle: '日常时间', items: list('time', [['现在', 'sekarang'], ['马上', 'sebentar lagi'], ['今天', 'hari ini'], ['明天', 'besok'], ['昨天', 'kemarin'], ['早上', 'pagi'], ['中午', 'siang'], ['下午', 'sore'], ['晚上', 'malam'], ['凌晨', 'dini hari']]) },
    { title: 'Jam & durasi', chineseTitle: '钟点与时长', tip: '印尼语的 :30 以“下一个小时的一半”来表达；3:30 说 jam setengah empat。', items: list('time', [['一点', 'jam satu'], ['两点', 'jam dua'], ['三点半', 'jam setengah empat'], ['十分钟', 'sepuluh menit'], ['半小时', 'setengah jam'], ['一个小时', 'satu jam'], ['两个小时', 'dua jam'], ['五分钟后', 'lima menit lagi'], ['明天早上七点', 'besok pagi jam tujuh']]) },
  ] },
  { slug: 'money', indonesian: 'Uang', chinese: '金钱', description: '印尼盾金额与付款时最实用的表达。', groups: [
    { title: 'Nominal rupiah', chineseTitle: '印尼盾金额', items: list('money', [['一千盾', 'seribu rupiah'], ['五千盾', 'lima ribu rupiah'], ['一万盾', 'sepuluh ribu rupiah'], ['两万盾', 'dua puluh ribu rupiah'], ['五万盾', 'lima puluh ribu rupiah'], ['十万盾', 'seratus ribu rupiah'], ['五十万盾', 'lima ratus ribu rupiah'], ['一百万盾', 'satu juta rupiah']]) },
    { title: 'Bayar', chineseTitle: '付款', items: list('money', [['多少钱？', 'Berapa harganya?'], ['一共多少钱？', 'Totalnya berapa?'], ['有零钱吗？', 'Ada uang kecil?'], ['不用找了。', 'Nggak usah kembaliannya.'], ['可以用 QRIS 吗？', 'Bisa pakai QRIS?'], ['可以刷卡吗？', 'Bisa pakai kartu?'], ['现金', 'tunai'], ['找零', 'kembalian'], ['太贵了。', 'Mahal banget.'], ['可以便宜一点吗？', 'Bisa kurang sedikit?']]) },
  ] },
  { slug: 'directions', indonesian: 'Arah', chinese: '方向', description: '找路、指路和确认位置的基础表达。', groups: [
    { title: 'Posisi', chineseTitle: '位置', items: list('directions', [['左边', 'kiri'], ['右边', 'kanan'], ['前面', 'depan'], ['后面', 'belakang'], ['旁边', 'sebelah'], ['里面', 'dalam'], ['外面', 'luar'], ['楼上', 'atas'], ['楼下', 'bawah']]) },
    { title: 'Arah jalan', chineseTitle: '行进方向', items: list('directions', [['直走', 'lurus'], ['左转', 'belok kiri'], ['右转', 'belok kanan'], ['掉头', 'putar balik'], ['从这里进去', 'masuk dari sini'], ['从那边出去', 'keluar lewat sana'], ['在前面的路口', 'di simpang depan'], ['在……对面', 'di seberang...'], ['在……旁边', 'di sebelah...']]) },
  ] },
  { slug: 'office', indonesian: 'Kantor', chinese: '办公室', description: '办公室最常用的物品、短句和可直接替换的工作表达。', groups: [
    { title: 'Perangkat kerja', chineseTitle: '办公设备', items: officeItems([
      ['电脑', 'komputer', 'Komputernya sudah menyala belum?', '电脑开了吗？', ['Komputernya', 'sudah menyala', 'belum']], ['笔记本电脑', 'laptop', 'Laptop saya ketinggalan di ruang rapat.', '我的笔记本电脑忘在会议室了。', ['Laptop saya', 'ketinggalan', 'di ruang rapat']], ['显示器', 'monitor', 'Monitor ini tidak ada gambarnya.', '这个显示器没有画面。', ['Monitor ini', 'tidak ada gambarnya']], ['键盘', 'keyboard', 'Keyboard-nya kena air, jangan dipakai dulu.', '键盘进水了，先不要用。', ['Keyboard-nya', 'kena air', 'jangan dipakai', 'dulu']], ['鼠标', 'mouse', 'Mouse saya tidak jalan, boleh pinjam punya kamu?', '我的鼠标不能用，可以借你的么？', ['Mouse saya', 'tidak jalan', 'boleh pinjam', 'punya kamu']], ['鼠标垫', 'alas mouse', 'Di mana alas mouse saya?', '我的鼠标垫在哪里？', ['Di mana', 'alas mouse saya']], ['打印机', 'printer', 'Printernya rusak, tolong cek ya.', '打印机坏了，请检查一下。', ['Printernya', 'rusak', 'tolong cek', 'ya']], ['复印机', 'mesin fotokopi', 'Mesin fotokopi sedang dipakai.', '复印机正在使用。', ['Mesin fotokopi', 'sedang dipakai']],
    ], 0) },
    { title: 'Dokumen & meja', chineseTitle: '文件与办公区', items: officeItems([
      ['文件', 'dokumen', 'Tolong cetak dokumen ini dua salinan.', '请打印这份文件两份。', ['Tolong cetak', 'dokumen ini', 'dua salinan']], ['文件夹', 'map', 'Tolong masukkan dokumennya ke dalam map.', '请把文件放进文件夹。', ['Tolong masukkan', 'dokumennya', 'ke dalam map']], ['文件柜', 'lemari arsip', 'Kontraknya ada di lemari arsip.', '合同在文件柜里。', ['Kontraknya', 'ada di', 'lemari arsip']], ['办公桌', 'meja kerja', 'Taruh berkasnya di meja kerja saya ya.', '请把资料放在我的办公桌上。', ['Taruh berkasnya', 'di meja kerja saya', 'ya']], ['椅子', 'kursi', 'Kursinya masih kosong, silakan duduk.', '椅子还空着，请坐。', ['Kursinya', 'masih kosong', 'silakan duduk']], ['白板', 'papan tulis', 'Tulis jadwalnya di papan tulis ya.', '请把时间表写在白板上。', ['Tulis jadwalnya', 'di papan tulis', 'ya']], ['记号笔', 'spidol', 'Spidolnya sudah kering, ambil yang baru.', '记号笔没墨了，拿一支新的。', ['Spidolnya', 'sudah kering', 'ambil yang baru']],
    ], 1) },
    { title: 'Alat tulis', chineseTitle: '文具', items: officeItems([
      ['圆珠笔', 'pulpen', 'Boleh pinjam pulpen sebentar?', '可以借我一支圆珠笔吗？', ['Boleh pinjam', 'pulpen', 'sebentar']], ['铅笔', 'pensil', 'Pakai pensil dulu untuk tanda sementara.', '临时标记先用铅笔。', ['Pakai pensil dulu', 'untuk tanda sementara']], ['橡皮', 'penghapus', 'Penghapusnya ada di laci.', '橡皮在抽屉里。', ['Penghapusnya', 'ada di laci']], ['尺子', 'penggaris', 'Tolong berikan saya penggaris.', '请给我一把尺子。', ['Tolong berikan', 'saya', 'penggaris']], ['剪刀', 'gunting', 'Di mana guntingnya?', '剪刀在哪里？', ['Di mana', 'guntingnya']], ['胶水', 'lem', 'Lemnya sudah habis, beli lagi ya.', '胶水用完了，再买一支吧。', ['Lemnya', 'sudah habis', 'beli lagi', 'ya']], ['胶带', 'selotip', 'Selotipnya ada di mana?', '胶带在哪里？', ['Selotipnya', 'ada di mana']], ['订书机', 'stapler', 'Stapler ini macet, coba ganti isinya.', '这个订书机卡住了，试着换钉。', ['Stapler ini', 'macet', 'coba ganti isinya']], ['回形针', 'klip kertas', 'Pakai klip kertas untuk satukan dokumennya.', '用回形针把文件夹在一起。', ['Pakai klip kertas', 'untuk satukan', 'dokumennya']],
    ], 2) },
    { title: 'Kantor sehari-hari', chineseTitle: '办公室日常', items: officeItems([
      ['信封', 'amplop', 'Ada amplop di lemari sebelah.', '旁边的柜子里有信封。', ['Ada amplop', 'di lemari sebelah']], ['名片', 'kartu nama', 'Ini kartu nama saya.', '这是我的名片。', ['Ini', 'kartu nama saya']], ['印章', 'stempel', 'Dokumen ini perlu stempel perusahaan.', '这份文件需要公司印章。', ['Dokumen ini', 'perlu', 'stempel perusahaan']], ['互联网', 'internet', 'Koneksi internet di kantor bermasalah.', '办公室的互联网连接有问题。', ['Koneksi internet', 'di kantor', 'bermasalah']], ['无线网络', 'Wi-Fi', 'Password Wi-Fi kantor apa ya?', '办公室 Wi-Fi 密码是什么？', ['Password Wi-Fi', 'kantor', 'apa ya']], ['空调', 'AC', 'Tolong nyalakan AC, panas sekali.', '请打开空调，太热了。', ['Tolong nyalakan', 'AC', 'panas sekali']], ['茶杯', 'cangkir teh', 'Cangkir teh ini milik siapa?', '这个茶杯是谁的？', ['Cangkir teh ini', 'milik siapa']], ['咖啡', 'kopi', 'Kopinya sudah habis, mau pesan lagi?', '咖啡喝完了，要再点吗？', ['Kopinya', 'sudah habis', 'mau pesan lagi']], ['零食', 'camilan', 'Ada kopi dan camilan di atas meja.', '桌上有咖啡和零食。', ['Ada kopi', 'dan camilan', 'di atas meja']],
    ], 3) },
  ] },
  { slug: 'indonesia', indonesian: 'Mengenal Indonesia', chinese: '认识印尼', description: '从生活、工作与文化角度认识七座常见城市。', groups: [] },
];

export function getLifeBasics(topic: string | undefined) { return lifeBasics.find((section) => section.slug === topic); }
export function isLifeBasicsTopic(topic: string | undefined): topic is LifeBasicsTopic { return Boolean(getLifeBasics(topic)); }
export const legacyBasicsRoute: Record<string, LifeBasicsTopic> = { '071': 'numbers', '072': 'numbers', '073': 'numbers', '074': 'time', '075': 'time', '076': 'time', '077': 'money', '078': 'money', '079': 'money', '080': 'directions', '081': 'directions', '082': 'directions' };
