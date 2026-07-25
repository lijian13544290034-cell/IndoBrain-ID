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
  life('EXP-LIF-083', 'supermarket', '矿泉水在哪里？', 'Permisi, air mineral di mana ya?', '第一次在超市找矿泉水时，礼貌地向店员询问。', ['permisi（不好意思）', 'air mineral（矿泉水）', 'di mana（在哪里）'], pattern('[Barang] di mana ya?', '[商品]在哪里？')),
  life('EXP-LIF-084', 'supermarket', '鸡蛋在哪里？', 'Telurnya di bagian mana ya?', '在较大的超市里，询问鸡蛋在哪个区域。', ['telurnya（鸡蛋）', 'bagian（区域）', 'mana（哪里）'], pattern('[Barang] di bagian mana ya?', '[商品]在哪个区域？')),
  life('EXP-LIF-085', 'supermarket', '蔬菜在哪里？', 'Sayurnya di sebelah mana?', '找蔬菜区时，用这句简短自然的问法。', ['sayurnya（蔬菜）', 'di sebelah（在旁边）', 'mana（哪里）'], pattern('[Barang] di sebelah mana?', '[商品]在哪边？')),
  life('EXP-LIF-086', 'supermarket', '这个多少钱？', 'Yang ini berapa harganya?', '指着商品询问价格时使用。', ['yang ini（这个）', 'berapa（多少）', 'harganya（价格）'], pattern('[Barang] ini berapa harganya?', '这个[商品]多少钱？')),
  life('EXP-LIF-087', 'supermarket', '我要一公斤。', 'Saya mau satu kilo.', '购买水果、蔬菜等按重量出售的商品时使用。', ['saya mau（我要）', 'satu kilo（一公斤）'], pattern('Saya mau [jumlah] kilo.', '我要[数量]公斤。')),
  life('EXP-LIF-088', 'supermarket', '有小包装的吗？', 'Ada yang ukuran kecil?', '想买小份包装时直接询问。', ['ada（有吗）', 'ukuran kecil（小包装）'], pattern('Ada yang ukuran [ukuran]?', '有[规格]的吗？')),
  life('EXP-LIF-089', 'supermarket', '这个新鲜吗？', 'Ini masih segar?', '购买蔬菜、水果或肉类前确认新鲜度。', ['ini（这个）', 'masih（还）', 'segar（新鲜）'], pattern('[Barang] ini masih segar?', '这个[商品]还新鲜吗？')),
  life('EXP-LIF-090', 'supermarket', '不要塑料袋。', 'Nggak usah pakai kantong plastik ya.', '结账时不需要塑料袋时使用。', ['nggak usah（不用）', 'kantong plastik（塑料袋）'], pattern('Nggak usah pakai [barang] ya.', '不用[物品]。')),
  life('EXP-LIF-091', 'supermarket', '可以用 QRIS 付款吗？', 'Bisa bayar pakai QRIS?', '在印尼超市结账时，确认能否扫码付款。', ['bisa bayar（可以付款）', 'pakai QRIS（用 QRIS）'], pattern('Bisa bayar pakai [metode]?', '可以用[支付方式]付款吗？')),
  life('EXP-LIF-092', 'supermarket', '不好意思，金额好像不对。', 'Maaf, totalnya kayaknya nggak sesuai.', '结账金额和预期不一致时，礼貌地请收银员核对。', ['maaf（不好意思）', 'totalnya（总金额）', 'nggak sesuai（不对、不一致）'], pattern('Totalnya kayaknya nggak sesuai.', '总金额好像不对。')),

  life('EXP-LIF-093', 'restaurant', '请给我菜单。', 'Mbak, boleh minta menunya?', '到餐厅后，礼貌地请服务员拿菜单。', ['mbak（女士、服务员）', 'boleh minta（可以要吗）', 'menunya（菜单）'], pattern('Boleh minta [barang]nya?', '可以要[物品]吗？')),
  life('EXP-LIF-094', 'restaurant', '我要这个。', 'Saya mau yang ini ya.', '指着菜单上的菜品点餐时使用。', ['saya mau（我要）', 'yang ini（这个）'], pattern('Saya mau yang ini ya.', '我要这个。')),
  life('EXP-LIF-095', 'restaurant', '这个不要辣。', 'Yang ini jangan pedas ya.', '点餐时要求不要做辣。', ['yang ini（这个）', 'jangan pedas（不要辣）'], pattern('[Menu] ini jangan [rasa] ya.', '这个[菜]不要[口味]。')),
  life('EXP-LIF-096', 'restaurant', '糖少一点。', 'Gulanya sedikit aja ya.', '点饮料时要求少放糖。', ['gulanya（糖）', 'sedikit aja（少一点）'], pattern('[Bahan]nya sedikit aja ya.', '[食材]少一点。')),
  life('EXP-LIF-097', 'restaurant', '冰少一点。', 'Esnya sedikit aja ya.', '点饮料时要求少放冰。', ['esnya（冰）', 'sedikit aja（少一点）'], pattern('[Bahan]nya sedikit aja ya.', '[食材]少一点。')),
  life('EXP-LIF-098', 'restaurant', '再来一份米饭。', 'Tambah nasi satu ya.', '需要加一份白饭时，直接这样说。', ['tambah（再加）', 'nasi（米饭）', 'satu（一个、一份）'], pattern('Tambah [makanan] satu ya.', '再来一份[食物]。')),
  life('EXP-LIF-099', 'restaurant', '菜还要等很久吗？', 'Pesanannya masih lama nggak?', '等餐较久时，礼貌地询问还需不需要等很久。', ['pesanannya（点的菜）', 'masih lama（还要很久）'], pattern('[Pesanan]nya masih lama nggak?', '[点的东西]还要很久吗？')),
  life('EXP-LIF-100', 'restaurant', '这个打包。', 'Yang ini bungkus ya.', '吃不完时，请服务员把这一份打包。', ['yang ini（这个）', 'bungkus（打包）'], pattern('[Barang] ini bungkus ya.', '这个[东西]打包。')),
  life('EXP-LIF-101', 'restaurant', '请给我账单。', 'Mbak, minta bonnya ya.', '结账时，自然地向服务员要账单。', ['mbak（女士、服务员）', 'minta（要）', 'bonnya（账单）'], pattern('Minta bonnya ya.', '请给我账单。')),
  life('EXP-LIF-102', 'restaurant', '可以分开付款吗？', 'Bisa bayar masing-masing?', '和朋友一起吃饭时，询问能否各自付款。', ['bisa bayar（可以付款）', 'masing-masing（各自）'], pattern('Bisa bayar masing-masing?', '可以各自付款吗？')),
  life('EXP-LIF-103', 'restaurant', '我们分开付。', 'Bayar sendiri-sendiri ya.', '和朋友吃饭后说明各自付款。', ['bayar（付款）', 'sendiri-sendiri（各自）', 'ya（语气词）'], pattern('Bayar sendiri-sendiri ya.', '我们各自付款。')),
];

export function getLifeExperiences() {
  return [...friends, ...newLifeExperiences];
}

export function getLifeExperience(id: string) {
  return getLifeExperiences().find((experience) => experience.id.endsWith(`-${id}`));
}
