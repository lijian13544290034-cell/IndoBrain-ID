import { getSocialExperiences, type SocialExperience } from '@/lib/social-experiences';
import { businessExperiences, datingExperiences } from '@/lib/life-business-dating-experiences';
import { livingHomeGoldenExperiences } from '@/lib/living-home-golden-scenes';
import type { GoldenSceneContent } from '@/lib/golden-scenes';
import { getWorkplacePattern, type WorkplacePattern } from '@/lib/workplace-patterns';

export type LifeCategory =
  | 'friends'
  | 'basics'
  | 'supermarket'
  | 'restaurant'
  | 'business'
  | 'dating'
  | 'rumah-harian'
  | 'urusan-rumah'
  | 'masak-makan'
  | 'belanja-konsumsi'
  | 'antar-persediaan'
  | 'masalah-rumah';
export type LifeExperience = Omit<SocialExperience, 'category'> & {
  category: LifeCategory;
  pattern: WorkplacePattern;
  goldenScene?: GoldenSceneContent;
  tags?: string[];
  difficultyLevel?: 'L1' | 'L2' | 'L3';
  requiredMembershipTier?: 'TRIAL' | 'PREMIUM' | 'VIP' | 'ENTERPRISE';
  status?: 'PUBLISHED' | 'DRAFT';
};

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
  pattern: getWorkplacePattern(item.indonesian),
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

  life('EXP-LIF-104', 'basics', '去市中心怎么走？', 'Kalau ke pusat kota lewat mana ya?', '向司机或路人询问去市中心的路线。', ['kalau（如果）', 'pusat kota（市中心）', 'lewat mana（从哪走）'], pattern('Kalau ke [tempat] lewat mana ya?', '去[地点]怎么走？')),
  life('EXP-LIF-105', 'basics', '请在这里停车。', 'Berhenti di sini aja ya.', '乘车到达目的地时，请司机在这里停。', ['berhenti（停车）', 'di sini（在这里）', 'aja（就）'], pattern('Berhenti di [tempat] aja ya.', '请在[地点]停车。')),
  life('EXP-LIF-106', 'basics', '我在门口等你。', 'Saya tunggu di depan ya.', '约车或约朋友时，说明自己会在门口等。', ['tunggu（等）', 'di depan（在前面、门口）'], pattern('Saya tunggu di [tempat] ya.', '我在[地点]等你。')),
  life('EXP-LIF-107', 'basics', '还要多久到？', 'Masih berapa lama lagi?', '等车或堵车时，询问还需要多长时间。', ['masih（还）', 'berapa lama（多久）', 'lagi（还）'], pattern('Masih berapa lama lagi?', '还要多久？')),
  life('EXP-LIF-108', 'basics', '这里可以叫车吗？', 'Di sini bisa pesan ojek nggak?', '在不熟悉的地方确认能否叫摩托车或网约车。', ['di sini（这里）', 'bisa（可以）', 'pesan ojek（叫摩托车）'], pattern('Di sini bisa pesan [transportasi] nggak?', '这里可以叫[交通工具]吗？')),
  life('EXP-LIF-109', 'basics', '请开慢一点。', 'Pelan-pelan ya, Pak.', '乘车时希望司机放慢速度。', ['pelan-pelan（慢一点）', 'Pak（先生）'], pattern('Pelan-pelan ya, Pak.', '请慢一点。')),
  life('EXP-LIF-110', 'basics', '我在这个站下车。', 'Saya turun di halte ini ya.', '乘坐公交时告诉司机或同伴下车地点。', ['turun（下车）', 'halte（车站）', 'ini（这个）'], pattern('Saya turun di [tempat] ini ya.', '我在这个[地点]下车。')),
  life('EXP-LIF-111', 'basics', '前面堵车吗？', 'Di depan macet nggak?', '出门前确认前方路况。', ['di depan（前面）', 'macet（堵车）'], pattern('Di depan macet nggak?', '前面堵车吗？')),
  life('EXP-LIF-112', 'basics', '最近的 ATM 在哪里？', 'ATM yang paling dekat di mana ya?', '需要取现时询问最近的 ATM。', ['ATM（自动取款机）', 'paling dekat（最近）', 'di mana（在哪里）'], pattern('[Tempat] yang paling dekat di mana ya?', '最近的[地点]在哪里？')),
  life('EXP-LIF-113', 'basics', '我想取钱。', 'Saya mau tarik uang.', '在银行或 ATM 附近说明要取现。', ['saya mau（我想）', 'tarik uang（取钱）'], pattern('Saya mau [kegiatan].', '我想[做某事]。')),
  life('EXP-LIF-114', 'basics', '我想换钱。', 'Saya mau tukar uang.', '在换汇点说明需要兑换货币。', ['tukar uang（换钱）', 'saya mau（我想）'], pattern('Saya mau tukar [barang].', '我想换[物品]。')),
  life('EXP-LIF-115', 'basics', '可以提现吗？', 'Bisa tarik tunai nggak?', '询问商户或银行能否取现金。', ['bisa（可以）', 'tarik tunai（取现）'], pattern('Bisa [kegiatan] nggak?', '可以[做某事]吗？')),
  life('EXP-LIF-116', 'basics', '我已经转账了。', 'Saya sudah transfer ya.', '付款后简短告知对方已完成转账。', ['sudah（已经）', 'transfer（转账）'], pattern('Saya sudah [kegiatan] ya.', '我已经[做某事]了。')),
  life('EXP-LIF-117', 'basics', '请确认一下付款。', 'Tolong cek pembayarannya ya.', '转账或扫码付款后，请对方确认。', ['tolong（请）', 'cek（确认、查看）', 'pembayaran（付款）'], pattern('Tolong cek [hal]nya ya.', '请确认一下[事项]。')),
  life('EXP-LIF-118', 'basics', '我想看医生。', 'Saya mau periksa ke dokter.', '身体不舒服时，到诊所说明需要看医生。', ['periksa（看诊）', 'dokter（医生）'], pattern('Saya mau [kegiatan] ke [tempat].', '我想去[地点][做某事]。')),
  life('EXP-LIF-119', 'basics', '我发烧了。', 'Saya demam.', '挂号或向医生说明发烧。', ['saya（我）', 'demam（发烧）'], pattern('Saya [keluhan].', '我[症状]。')),
  life('EXP-LIF-120', 'basics', '我对这个药过敏。', 'Saya alergi obat ini.', '就诊或买药时说明药物过敏。', ['alergi（过敏）', 'obat（药）', 'ini（这个）'], pattern('Saya alergi [barang] ini.', '我对这个[物品]过敏。')),
  life('EXP-LIF-121', 'basics', '药一天吃几次？', 'Obat ini diminum berapa kali sehari?', '取药时确认每天服药次数。', ['obat（药）', 'diminum（服用）', 'berapa kali（几次）'], pattern('[Obat] ini diminum berapa kali sehari?', '这个药一天吃几次？')),
  life('EXP-LIF-122', 'basics', '附近有药店吗？', 'Ada apotek dekat sini nggak?', '晚上或紧急需要药品时询问附近药店。', ['ada（有）', 'apotek（药店）', 'dekat sini（附近）'], pattern('Ada [tempat] dekat sini nggak?', '附近有[地点]吗？')),
  life('EXP-LIF-123', 'basics', '只修一点就好。', 'Potong sedikit aja ya.', '理发时说明只想稍微修剪。', ['potong（剪）', 'sedikit aja（一点就好）'], pattern('[Kegiatan] sedikit aja ya.', '[做某事]一点就好。')),
  life('EXP-LIF-124', 'basics', '两边不要太短。', 'Sampingnya jangan terlalu pendek ya.', '理发时说明两侧不要剪太短。', ['sampingnya（两边）', 'jangan（不要）', 'terlalu pendek（太短）'], pattern('[Bagian]nya jangan terlalu [sifat] ya.', '[部位]不要太[形容]。')),
  life('EXP-LIF-125', 'basics', '我想办健身卡。', 'Saya mau daftar gym.', '到健身房询问或说明要办会员。', ['daftar（报名、注册）', 'gym（健身房）'], pattern('Saya mau daftar [tempat].', '我想报名[地点]。')),
  life('EXP-LIF-126', 'basics', '今天人多吗？', 'Hari ini ramai nggak?', '去健身房或公共场所前确认人多不多。', ['hari ini（今天）', 'ramai（人多、热闹）'], pattern('Hari ini ramai nggak?', '今天人多吗？')),
  life('EXP-LIF-127', 'basics', '我先洗个澡。', 'Saya mandi dulu ya.', '运动后或在家里自然说明先去洗澡。', ['mandi（洗澡）', 'dulu（先）'], pattern('Saya [kegiatan] dulu ya.', '我先[做某事]。')),
  life('EXP-LIF-128', 'basics', '空调不冷。', 'AC-nya nggak dingin.', '公寓空调不制冷时向管理处报修。', ['AC（空调）', 'nggak dingin（不冷）'], pattern('[Barang]nya nggak [sifat].', '[物品]不[状态]。')),
  life('EXP-LIF-129', 'basics', '热水没有了。', 'Air panasnya nggak ada.', '公寓热水异常时说明问题。', ['air panas（热水）', 'nggak ada（没有）'], pattern('[Barang]nya nggak ada.', '[物品]没有了。')),
  life('EXP-LIF-130', 'basics', '可以请人来修吗？', 'Bisa minta orang datang buat perbaiki?', '家电或房屋故障时请管理处安排维修。', ['bisa（可以）', 'orang datang（人来）', 'perbaiki（维修）'], pattern('Bisa minta orang datang buat [kegiatan]?', '可以请人来[做某事]吗？')),
  life('EXP-LIF-131', 'basics', '门禁卡不能用。', 'Kartu aksesnya nggak bisa dipakai.', '公寓门禁卡失效时向前台说明。', ['kartu akses（门禁卡）', 'nggak bisa（不能）', 'dipakai（使用）'], pattern('[Barang]nya nggak bisa dipakai.', '[物品]不能用了。')),
  life('EXP-LIF-132', 'basics', '我的房间漏水。', 'Kamar saya bocor.', '房间或卫生间漏水时立即通知管理处。', ['kamar（房间）', 'bocor（漏水）'], pattern('[Tempat] saya bocor.', '我的[地点]漏水。')),
  life('EXP-LIF-133', 'supermarket', '快递到了吗？', 'Paketnya sudah sampai belum?', '等待包裹时询问是否已经送达。', ['paket（包裹）', 'sudah sampai（已经到了）', 'belum（还没）'], pattern('[Barang]nya sudah sampai belum?', '[物品]到了吗？')),
  life('EXP-LIF-134', 'supermarket', '请放在前台。', 'Taruh di resepsionis aja ya.', '快递员送达时，请其把包裹放在前台。', ['taruh（放）', 'resepsionis（前台）', 'aja（就）'], pattern('Taruh di [tempat] aja ya.', '请放在[地点]。')),
  life('EXP-LIF-135', 'supermarket', '我现在不在家。', 'Saya lagi nggak di rumah.', '快递员联系时说明现在不在家。', ['lagi（正在）', 'nggak di rumah（不在家）'], pattern('Saya lagi nggak di [tempat].', '我现在不在[地点]。')),
  life('EXP-LIF-136', 'supermarket', '可以货到付款吗？', 'Bisa bayar pas barangnya datang?', '下单时询问能否在包裹送达时付款。', ['bisa bayar（可以付款）', 'pas（当……时）', 'barangnya datang（货到了）'], pattern('Bisa bayar pas [kejadian]?', '可以在[情况]时付款吗？')),
  life('EXP-LIF-137', 'restaurant', '有空位吗？', 'Masih ada meja kosong?', '到餐厅时询问是否还有空桌。', ['masih ada（还有）', 'meja kosong（空桌）'], pattern('Masih ada [barang] kosong?', '还有空的[物品]吗？')),
  life('EXP-LIF-138', 'restaurant', '我们两个人。', 'Berdua ya.', '进餐厅时简洁说明用餐人数是两位。', ['berdua（两个人）', 'ya（语气词）'], pattern('Berdua ya.', '两个人。')),
  life('EXP-LIF-139', 'restaurant', '这个可以不放香菜吗？', 'Yang ini jangan pakai daun ketumbar ya.', '点餐时要求不要放香菜。', ['jangan pakai（不要放）', 'daun ketumbar（香菜）'], pattern('[Menu] ini jangan pakai [bahan] ya.', '这个[菜]不要放[食材]。')),
  life('EXP-LIF-140', 'friends', '周末你有空吗？', 'Akhir pekan ini kamu ada waktu nggak?', '邀请朋友前先自然询问对方周末是否有时间。', ['akhir pekan（周末）', 'ada waktu（有时间）'], pattern('[Waktu] ini kamu ada waktu nggak?', '[时间]你有空吗？')),
  life('EXP-LIF-141', 'friends', '我们一起去吧。', 'Kita pergi bareng ya.', '和朋友约活动时，自然提议一起去。', ['kita（我们）', 'pergi（去）', 'bareng（一起）'], pattern('Kita [kegiatan] bareng ya.', '我们一起[做某事]吧。')),
  life('EXP-LIF-142', 'friends', '我先回家了。', 'Saya pulang dulu ya.', '聚会或拜访结束时自然告辞。', ['pulang（回家）', 'dulu（先）'], pattern('Saya pulang dulu ya.', '我先回家了。')),
  life('EXP-LIF-143', 'friends', '这个文件要去哪里办？', 'Urus dokumen ini di mana ya?', '办理居住或公共服务文件时，询问应该去哪里处理。', ['urus（办理）', 'dokumen（文件）', 'di mana（在哪里）'], pattern('Urus [dokumen] ini di mana ya?', '这个[文件]要去哪里办？')),
];

export function getLifeExperiences() {
  return [...friends, ...newLifeExperiences, ...businessExperiences, ...datingExperiences, ...livingHomeGoldenExperiences];
}

export function getLifeExperience(id: string) {
  return getLifeExperiences().find((experience) => experience.id.endsWith(`-${id}`));
}
