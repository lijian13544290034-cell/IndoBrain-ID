import { getSocialExperiences, type SocialExperience } from '@/lib/social-experiences';
import { type WorkplacePattern } from '@/lib/workplace-patterns';

export type LifeCategory = 'friends' | 'basics' | 'supermarket' | 'restaurant';
export type LifeExperience = Omit<SocialExperience, 'category'> & { category: LifeCategory; pattern: WorkplacePattern };

const pattern = (indonesian: string, chinese: string): WorkplacePattern => ({ indonesian, chinese });

const life = (
  id: string,
  category: LifeCategory,
  task: string,
  indonesian: string,
  explanation: string,
  harvest: string[],
  reusablePattern: WorkplacePattern,
): LifeExperience => ({ id, category, task, chinese: task, indonesian, explanation, harvest, pattern: reusablePattern });

// Existing Social lessons remain intact as the Friends collection. Their IDs are
// preserved so prior links continue to resolve through the Life module.
const friends: LifeExperience[] = getSocialExperiences().map((item) => ({
  ...item,
  category: 'friends',
  pattern: pattern(item.indonesian, '这句可直接套用；替换其中的人、地点或时间即可。'),
}));

const newLifeExperiences: LifeExperience[] = [
  life('EXP-LIF-071', 'basics', '一共有多少个？', 'Totalnya ada berapa?', '核对数量时，直接问总数是多少。', ['totalnya（总数）', 'ada（有）', 'berapa（多少）'], pattern('Totalnya ada berapa?', '一共有多少？')),
  life('EXP-LIF-072', 'basics', '给我两个。', 'Minta dua ya.', '买东西或点餐时，直接说需要两个。', ['minta（要）', 'dua（两个）', 'ya（语气词）'], pattern('Minta [jumlah] ya.', '给我[数量]。')),
  life('EXP-LIF-073', 'basics', '还差三个。', 'Masih kurang tiga.', '核对数量后，说明还差多少。', ['masih（还）', 'kurang（差、不够）', 'tiga（三个）'], pattern('Masih kurang [jumlah].', '还差[数量]。')),
  life('EXP-LIF-074', 'basics', '现在几点？', 'Sekarang jam berapa?', '日常确认时间时最自然的问法。', ['sekarang（现在）', 'jam berapa（几点）'], pattern('Sekarang jam berapa?', '现在几点？')),
  life('EXP-LIF-075', 'basics', '我们三点见。', 'Kita ketemu jam tiga ya.', '约见面时明确说出时间。', ['kita（我们）', 'ketemu（见面）', 'jam tiga（三点）'], pattern('Kita ketemu jam [waktu] ya.', '我们[时间]见。')),
  life('EXP-LIF-076', 'basics', '十分钟后到。', 'Sampai sepuluh menit lagi.', '告诉对方自己还需要多久到达。', ['sampai（到）', 'sepuluh menit（十分钟）', 'lagi（后、还）'], pattern('Sampai [waktu] lagi.', '[时间]后到。')),
  life('EXP-LIF-077', 'basics', '这个多少钱？', 'Ini harganya berapa?', '买东西前询问价格。', ['ini（这个）', 'harganya（价格）', 'berapa（多少）'], pattern('Ini harganya berapa?', '这个多少钱？')),
  life('EXP-LIF-078', 'basics', '可以扫码付吗？', 'Bisa bayar pakai QRIS?', '在印尼付款时，询问是否可以使用 QRIS 扫码支付。', ['bisa（可以）', 'bayar（付款）', 'pakai QRIS（用 QRIS）'], pattern('Bisa bayar pakai [metode]?', '可以用[支付方式]付款吗？')),
  life('EXP-LIF-079', 'basics', '我没有零钱。', 'Saya nggak punya uang kecil.', '付款时说明自己没有小额现金。', ['saya（我）', 'nggak punya（没有）', 'uang kecil（零钱）'], pattern('Saya nggak punya [barang].', '我没有[东西]。')),
  life('EXP-LIF-080', 'basics', '洗手间在哪里？', 'Toiletnya di mana?', '在商场、餐厅或办公室找洗手间时使用。', ['toiletnya（洗手间）', 'di mana（在哪里）'], pattern('[Tempat] di mana?', '[地点]在哪里？')),
  life('EXP-LIF-081', 'basics', '一直往前走。', 'Jalan terus saja.', '给对方简单指路时使用。', ['jalan（走）', 'terus（一直）', 'saja（就）'], pattern('[Aksi] terus saja.', '一直[做某动作]。')),
  life('EXP-LIF-082', 'basics', '左边还是右边？', 'Di kiri atau kanan?', '确认方向时使用的短问句。', ['di kiri（左边）', 'atau（还是）', 'kanan（右边）'], pattern('Di [arah] atau [arah]?', '在[方向]还是[方向]？')),

  life('EXP-LIF-083', 'supermarket', '我想买这个。', 'Saya mau beli yang ini.', '在超市指着商品表达想购买时使用。', ['saya（我）', 'mau beli（想买）', 'yang ini（这个）'], pattern('Saya mau beli [barang] ini.', '我想买这个[东西]。')),
  life('EXP-LIF-084', 'supermarket', '这个有折扣吗？', 'Yang ini lagi diskon nggak?', '看到商品时询问是否正在打折。', ['yang ini（这个）', 'lagi（正在）', 'diskon（折扣）'], pattern('[Barang] lagi diskon nggak?', '[商品]在打折吗？')),
  life('EXP-LIF-085', 'supermarket', '可以换一个吗？', 'Boleh tukar yang lain?', '商品有问题或想换另一件时使用。', ['boleh（可以吗）', 'tukar（换）', 'yang lain（另一个）'], pattern('Boleh tukar [barang]?', '可以换[商品]吗？')),
  life('EXP-LIF-086', 'supermarket', '这个太贵了。', 'Ini terlalu mahal.', '看到价格过高时的自然表达。', ['ini（这个）', 'terlalu（太）', 'mahal（贵）'], pattern('Ini terlalu [sifat].', '这个太[形容词]。')),
  life('EXP-LIF-087', 'supermarket', '有没有更小的包装？', 'Ada ukuran yang lebih kecil?', '想找更小包装或规格时使用。', ['ada（有吗）', 'ukuran（尺寸、包装规格）', 'lebih kecil（更小）'], pattern('Ada ukuran yang lebih [sifat]?', '有更[形容词]的规格吗？')),
  life('EXP-LIF-088', 'supermarket', '我只看一下。', 'Saya lihat-lihat dulu ya.', '不想被销售催促时，礼貌地说明先看看。', ['lihat-lihat（看看）', 'dulu（先）', 'ya（语气词）'], pattern('Saya lihat-lihat dulu ya.', '我先看看。')),
  life('EXP-LIF-089', 'supermarket', '请给我一个袋子。', 'Minta kantong satu ya.', '结账或买散装物品时需要一个袋子。', ['minta（要）', 'kantong（袋子）', 'satu（一个）'], pattern('Minta [barang] satu ya.', '请给我一个[物品]。')),
  life('EXP-LIF-090', 'supermarket', '收银台在哪里？', 'Kasirnya di mana?', '在超市寻找付款柜台时使用。', ['kasirnya（收银台）', 'di mana（在哪里）'], pattern('[Tempat] di mana?', '[地点]在哪里？')),
  life('EXP-LIF-091', 'supermarket', '我用现金付。', 'Saya bayar pakai uang tunai.', '结账时说明使用现金付款。', ['bayar（付款）', 'pakai（用）', 'uang tunai（现金）'], pattern('Saya bayar pakai [metode].', '我用[支付方式]付款。')),
  life('EXP-LIF-092', 'supermarket', '不用找了。', 'Nggak usah kembaliannya.', '付款后金额刚好或想免去找零时使用。', ['nggak usah（不用）', 'kembaliannya（找零）'], pattern('Nggak usah [barang]nya.', '不用[某样东西]。')),

  life('EXP-LIF-093', 'restaurant', '两个人，有位置吗？', 'Dua orang, masih ada meja?', '到餐厅时询问两个人是否还有座位。', ['dua orang（两个人）', 'masih ada（还有）', 'meja（桌子、座位）'], pattern('[Jumlah] orang, masih ada meja?', '[人数]，还有座位吗？')),
  life('EXP-LIF-094', 'restaurant', '我们坐这里可以吗？', 'Kita duduk di sini boleh?', '入座前确认能否坐在某个位置。', ['kita（我们）', 'duduk（坐）', 'di sini（这里）', 'boleh（可以吗）'], pattern('Kita duduk di sini boleh?', '我们可以坐这里吗？')),
  life('EXP-LIF-095', 'restaurant', '我不吃辣。', 'Saya nggak makan pedas.', '点餐时明确说明自己不吃辣。', ['saya（我）', 'nggak makan（不吃）', 'pedas（辣）'], pattern('Saya nggak makan [makanan].', '我不吃[食物]。')),
  life('EXP-LIF-096', 'restaurant', '这个推荐吗？', 'Yang ini enak nggak?', '向服务员询问一道菜是否值得点。', ['yang ini（这个）', 'enak（好吃）', 'nggak（吗）'], pattern('[Menu] ini enak nggak?', '这个[菜]好吃吗？')),
  life('EXP-LIF-097', 'restaurant', '不要放香菜。', 'Jangan pakai daun ketumbar ya.', '点餐时要求不要放香菜。', ['jangan pakai（不要放）', 'daun ketumbar（香菜）', 'ya（语气词）'], pattern('Jangan pakai [bahan] ya.', '不要放[食材]。')),
  life('EXP-LIF-098', 'restaurant', '请少放冰。', 'Esnya sedikit saja ya.', '点饮料时要求少放冰。', ['esnya（冰）', 'sedikit（少一点）', 'saja（就）'], pattern('[Bahan]nya sedikit saja ya.', '[食材]少一点。')),
  life('EXP-LIF-099', 'restaurant', '先上饮料。', 'Minumannya dulu ya.', '希望饮料先上时使用。', ['minumannya（饮料）', 'dulu（先）', 'ya（语气词）'], pattern('[Pesanan]nya dulu ya.', '[点的东西]先上。')),
  life('EXP-LIF-100', 'restaurant', '可以打包吗？', 'Boleh dibungkus?', '吃不完时询问是否可以打包。', ['boleh（可以吗）', 'dibungkus（打包）'], pattern('Boleh [aksi]?', '可以[做某动作]吗？')),
  life('EXP-LIF-101', 'restaurant', '买单。', 'Minta bon ya.', '在餐厅结账时自然地向服务员要账单。', ['minta（要）', 'bon（账单）', 'ya（语气词）'], pattern('Minta [barang] ya.', '请给我[东西]。')),
  life('EXP-LIF-102', 'restaurant', '味道很好。', 'Enak banget.', '吃完后直接称赞食物好吃。', ['enak（好吃）', 'banget（非常）'], pattern('[Makanan] enak banget.', '[食物]非常好吃。')),
  life('EXP-LIF-103', 'restaurant', '我们分开付。', 'Bayar sendiri-sendiri ya.', '和朋友吃饭后说明各自付款。', ['bayar（付款）', 'sendiri-sendiri（各自）', 'ya（语气词）'], pattern('Bayar sendiri-sendiri ya.', '我们各自付款。')),
];

export function getLifeExperiences() {
  return [...friends, ...newLifeExperiences];
}

export function getLifeExperience(id: string) {
  return getLifeExperiences().find((experience) => experience.id.endsWith(`-${id}`));
}
