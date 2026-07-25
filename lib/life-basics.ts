import type { Essential } from '@/lib/essentials';

export type LifeBasicsTopic = 'numbers' | 'time' | 'money' | 'directions';
export type LifeBasicsGroup = { title: string; chineseTitle: string; tip?: string; items: Essential[] };
export type LifeBasicsSection = { slug: LifeBasicsTopic; indonesian: string; chinese: string; description: string; groups: LifeBasicsGroup[] };

const item = (topic: LifeBasicsTopic, order: number, chinese: string, indonesian: string): Essential => ({
  id: `BAS-LIF-${topic.slice(0, 3).toUpperCase()}-${String(order).padStart(3, '0')}`,
  module: 'social', category: topic, chinese, indonesian, aliases: [chinese, indonesian], sortOrder: order,
});
const list = (topic: LifeBasicsTopic, entries: Array<[string, string]>) => entries.map(([chinese, indonesian], index) => item(topic, index + 1, chinese, indonesian));

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
];

export function getLifeBasics(topic: string | undefined) { return lifeBasics.find((section) => section.slug === topic); }
export function isLifeBasicsTopic(topic: string | undefined): topic is LifeBasicsTopic { return Boolean(getLifeBasics(topic)); }
export const legacyBasicsRoute: Record<string, LifeBasicsTopic> = { '071': 'numbers', '072': 'numbers', '073': 'numbers', '074': 'time', '075': 'time', '076': 'time', '077': 'money', '078': 'money', '079': 'money', '080': 'directions', '081': 'directions', '082': 'directions' };
