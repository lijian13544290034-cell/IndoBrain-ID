import 'server-only';

export type MandarinLevel2Item = {
  id: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  kind?: 'CORE' | 'REVIEW' | 'COMBINATION';
};

export type MandarinLevel2Turn = { role: '老板' | '员工' | '主管'; chinese: string };
export type MandarinLevel2Day = {
  day: number;
  title: string;
  module: 'boss-listening' | 'problem-solving' | 'construction';
  items: MandarinLevel2Item[];
  recognition: string[];
  dialogue: MandarinLevel2Turn[];
  safety?: boolean;
  unknownInputStatus?: 'CONTENT_REVIEW';
};

const item = (day: number, index: number, chinese: string, pinyin: string, indonesian: string, kind: MandarinLevel2Item['kind'] = 'CORE'): MandarinLevel2Item => ({
  id: `CN-WORK-L2-D${day}-I${String(index).padStart(2, '0')}`,
  chinese,
  pinyin,
  indonesian,
  kind,
});

const day = (dayNumber: number, title: string, module: MandarinLevel2Day['module'], values: Array<[string, string, string]>, recognition: string[] = [], dialogue: MandarinLevel2Turn[] = [], extra: Partial<MandarinLevel2Day> = {}): MandarinLevel2Day => ({
  day: dayNumber,
  title,
  module,
  items: values.map((value, index) => item(dayNumber, index + 1, ...value)),
  recognition,
  dialogue,
  ...extra,
});

export const mandarinWorkLevel2Days: MandarinLevel2Day[] = [
  day(31, '同一个指令，不同说法', 'boss-listening', [
    ['拿过来', 'ná guò lái', 'Bawa ke sini.'], ['这个拿过来', 'zhè ge ná guò lái', 'Bawa yang ini ke sini.'],
    ['拿来', 'ná lái', 'Bawa ke sini.'], ['给我', 'gěi wǒ', 'Berikan kepada saya.'],
  ], ['把这个拿过来。', '这个拿过来。', '拿过来。', '这个，拿来。']),
  day(32, '连续两个指令', 'boss-listening', [
    ['然后', 'rán hòu', 'kemudian / lalu'], ['拿这个，然后放这里。', 'ná zhè ge, rán hòu fàng zhè lǐ', 'Ambil yang ini, lalu taruh di sini.'],
  ], ['这个拿过去，放那边。']),
  day(33, '先做，再做', 'boss-listening', [
    ['先', 'xiān', 'dulu / terlebih dahulu'], ['再', 'zài', 'kemudian / setelah itu'],
    ['先做这个。', 'xiān zuò zhè ge', 'Kerjakan yang ini dulu.'], ['再做那个。', 'zài zuò nà ge', 'Setelah itu kerjakan yang itu.'],
    ['先做这个，再做那个。', 'xiān zuò zhè ge, zài zuò nà ge', 'Kerjakan yang ini dulu, lalu kerjakan yang itu.'],
  ], ['这个先做。']),
  day(34, '任务时间顺序', 'boss-listening', [
    ['马上', 'mǎ shàng', 'segera'], ['等一下', 'děng yí xià', 'tunggu sebentar'], ['晚一点', 'wǎn yì diǎn', 'nanti / agak nanti'],
  ], ['马上做。', '等一下再做。', '这个晚一点做。']),
  day(35, '做完以后汇报', 'boss-listening', [
    ['做完', 'zuò wán', 'selesai mengerjakan'], ['告诉我', 'gào su wǒ', 'beri tahu saya'],
    ['做完告诉我。', 'zuò wán gào su wǒ', 'Kalau sudah selesai, beri tahu saya.'], ['好了告诉我。', 'hǎo le gào su wǒ', 'Kalau sudah selesai, beri tahu saya.'],
  ], [], [{ role: '老板', chinese: '好了吗？' }, { role: '员工', chinese: '还没。' }, { role: '老板', chinese: '做完告诉我。' }, { role: '员工', chinese: '好的。' }]),
  day(36, '确认任务', 'boss-listening', [
    ['是这个吗？', 'shì zhè ge ma', 'Yang ini?'], ['这里吗？', 'zhè lǐ ma', 'Di sini?'], ['几个？', 'jǐ ge', 'Berapa buah?'], ['这样吗？', 'zhè yàng ma', 'Seperti ini?'],
  ], [], [{ role: '老板', chinese: '这个放那边。' }, { role: '员工', chinese: '这里吗？' }, { role: '老板', chinese: '对。' }]),
  day(37, '听不清怎么办', 'boss-listening', [
    ['没听清。', 'méi tīng qīng', 'Saya tidak mendengar dengan jelas.'], ['你再说一次。', 'nǐ zài shuō yí cì', 'Tolong ulangi sekali lagi.'],
  ], ['我不懂。', '慢一点。', '再说一次。', '什么意思？']),
  day(38, '老板催进度', 'boss-listening', [
    ['快点', 'kuài diǎn', 'cepat / ayo cepat'], ['抓紧', 'zhuā jǐn', 'segera kerjakan / percepat'],
    ['还要多久？', 'hái yào duō jiǔ', 'Masih butuh berapa lama?'], ['马上好了。', 'mǎ shàng hǎo le', 'Sebentar lagi selesai.'],
  ]),
  day(39, '今天必须完成', 'boss-listening', [
    ['必须', 'bì xū', 'harus'], ['今天做完。', 'jīn tiān zuò wán', 'Selesaikan hari ini.'],
    ['今天必须做完。', 'jīn tiān bì xū zuò wán', 'Harus selesai hari ini.'], ['来得及吗？', 'lái de jí ma', 'Sempat selesai?'],
    ['来得及。', 'lái de jí', 'Masih sempat.'], ['来不及。', 'lái bu jí', 'Tidak sempat.'],
  ]),
  day(40, '中国老板模式 1', 'boss-listening', [], ['这个先做。', '拿这个，放那边。', '今天能做完吗？', '能。', '今天来不及。'], [
    { role: '老板', chinese: '好了吗？' }, { role: '员工', chinese: '还没。' }, { role: '老板', chinese: '抓紧。' }, { role: '员工', chinese: '好的。' },
  ], { unknownInputStatus: 'CONTENT_REVIEW' }),
  day(41, '东西找不到', 'problem-solving', [
    ['找不到', 'zhǎo bú dào', 'tidak bisa menemukan'], ['谁拿了？', 'shéi ná le', 'Siapa yang mengambil?'],
    ['在那边', 'zài nà biān', 'Ada di sana.'], ['我找一下', 'wǒ zhǎo yí xià', 'Saya cari dulu.'],
  ], ['东西呢？', '放哪儿了？', '谁拿走了？'], [{ role: '老板', chinese: '文件呢？' }, { role: '员工', chinese: '找不到。' }, { role: '老板', chinese: '谁拿了？' }, { role: '员工', chinese: '我问一下。' }]),
  day(42, '数量不对', 'problem-solving', [
    ['差', 'chà', 'kurang / selisih'], ['差两个', 'chà liǎng ge', 'kurang dua'], ['只有八个', 'zhǐ yǒu bā ge', 'hanya ada delapan'],
  ], [], [{ role: '老板', chinese: '不是十个吗？' }, { role: '员工', chinese: '只有八个。' }, { role: '老板', chinese: '差两个？' }, { role: '员工', chinese: '对。' }]),
  day(43, '做错了', 'problem-solving', [
    ['错了', 'cuò le', 'salah'], ['做错了', 'zuò cuò le', 'salah mengerjakan'], ['不是这样', 'bú shì zhè yàng', 'bukan seperti ini'], ['这样做', 'zhè yàng zuò', 'kerjakan seperti ini'],
  ], ['错了。', '不对。', '不是这么做。']),
  day(44, '修改与返工', 'problem-solving', [
    ['拆掉', 'chāi diào', 'bongkar / lepaskan'],
  ], ['这个改一下。', '这个重做。', '这个拆掉。', '拆掉，重新做。']),
  day(45, '质量问题', 'problem-solving', [
    ['质量', 'zhì liàng', 'kualitas'], ['不行', 'bù xíng', 'tidak bisa / tidak memenuhi'], ['再检查一下', 'zài jiǎn chá yí xià', 'periksa sekali lagi'],
  ], [], [{ role: '老板', chinese: '这个不行。' }, { role: '员工', chinese: '哪里不对？' }, { role: '老板', chinese: '这里。再检查一下。' }, { role: '员工', chinese: '好的。' }]),
  day(46, '工作进度', 'problem-solving', [
    ['进度', 'jìn dù', 'progres'], ['做到哪里了？', 'zuò dào nǎ lǐ le', 'Sudah sampai mana?'],
    ['做了一半', 'zuò le yí bàn', 'Sudah setengah.'], ['快做完了', 'kuài zuò wán le', 'Hampir selesai.'],
  ], ['做到哪儿了？', '做多少了？', '还差多少？', '什么时候能好？']),
  day(47, '叫人过来', 'problem-solving', [
    ['他们', 'tā men', 'mereka'], ['叫他来', 'jiào tā lái', 'Panggil dia ke sini.'], ['叫他们来', 'jiào tā men lái', 'Panggil mereka ke sini.'], ['你去找他', 'nǐ qù zhǎo tā', 'Kamu pergi cari dia.'],
  ]),
  day(48, '人员分工', 'problem-solving', [
    ['你们', 'nǐ men', 'kalian'], ['一起做', 'yì qǐ zuò', 'kerjakan bersama'],
  ], ['你做这个。', '他做那个。', '你们一起做。', '你们两个一起做。']),
  day(49, '主动汇报问题', 'problem-solving', [
    ['怎么办？', 'zěn me bàn', 'Bagaimana? / Harus bagaimana?'], ['现在怎么办？', 'xiàn zài zěn me bàn', 'Sekarang harus bagaimana?'],
  ], ['这里有问题。', '这个坏了。', '数量不对。', '我不懂。'], [{ role: '员工', chinese: '老板，这里有问题。' }, { role: '老板', chinese: '什么问题？' }, { role: '员工', chinese: '这个坏了。' }, { role: '老板', chinese: '先停一下。' }, { role: '员工', chinese: '好的。' }]),
  day(50, '工作问题综合实战', 'problem-solving', [], ['数量不对', '东西找不到', '工作做错', '设备坏了', '进度汇报', '我不懂。', '没听清。', '慢一点。', '再说一次。', '什么意思？'], [], { unknownInputStatus: 'CONTENT_REVIEW' }),
  day(51, '进入建筑工地', 'construction', [
    ['工地', 'gōng dì', 'lokasi proyek konstruksi'], ['工人', 'gōng rén', 'pekerja'],
    ['师傅', 'shī fu', 'pekerja berpengalaman / panggilan sopan untuk pekerja terampil'], ['现场', 'xiàn chǎng', 'lokasi kerja / lapangan'],
  ], ['他在工地。', '去现场。', '叫他们来。', '你们一起做。', '去工地。', '到现场看一下。', '叫两个工人过来。']),
  day(52, '方向位置', 'construction', [
    ['左边', 'zuǒ biān', 'sebelah kiri'], ['右边', 'yòu biān', 'sebelah kanan'], ['上面', 'shàng miàn', 'di atas'], ['下面', 'xià miàn', 'di bawah'],
  ], ['放左边。', '放右边。', '看上面。', '下面有问题。', '左一点。', '右一点。', '高一点。', '低一点。']),
  day(53, '搬运移动', 'construction', [
    ['搬', 'bān', 'pindahkan / angkut'], ['抬', 'tái', 'angkat bersama'], ['移', 'yí', 'geser / pindahkan'],
  ], ['搬过来。', '搬过去。', '抬一下。', '往左移一点。', '这个搬过去。', '你们两个抬一下。', '再往右一点。']),
  day(54, '测量尺寸', 'construction', [
    ['量', 'liáng', 'mengukur'], ['尺寸', 'chǐ cùn', 'ukuran'], ['长', 'cháng', 'panjang'], ['宽', 'kuān', 'lebar'], ['高', 'gāo', 'tinggi'],
    ['米', 'mǐ', 'meter'], ['厘米', 'lí mǐ', 'sentimeter'],
  ], ['量一下。', '多长？', '多宽？', '多高？', '三米。', '尺寸不对。'], [{ role: '老板', chinese: '你再量一下。' }, { role: '员工', chinese: '好的。' }, { role: '老板', chinese: '尺寸对吗？' }, { role: '员工', chinese: '不对。' }]),
  day(55, '建筑材料 1', 'construction', [
    ['水泥', 'shuǐ ní', 'semen'], ['沙子', 'shā zi', 'pasir'], ['砖', 'zhuān', 'bata'], ['钢筋', 'gāng jīn', 'besi tulangan'],
  ], ['水泥到了吗？', '还没。', '钢筋放这里。', '砖不够。', '沙子还有吗？']),
  day(56, '建筑材料 2', 'construction', [
    ['木板', 'mù bǎn', 'papan kayu'], ['管子', 'guǎn zi', 'pipa'], ['电线', 'diàn xiàn', 'kabel listrik'],
  ], [], [{ role: '老板', chinese: '木板呢？' }, { role: '员工', chinese: '在那边。' }, { role: '老板', chinese: '管子还有吗？' }, { role: '员工', chinese: '没有了。' }, { role: '老板', chinese: '电线放哪里了？' }, { role: '员工', chinese: '我找一下。' }]),
  day(57, '图纸与施工', 'construction', [
    ['图纸', 'tú zhǐ', 'gambar kerja / drawing'], ['按照', 'àn zhào', 'sesuai / berdasarkan'],
  ], ['看图纸。', '按照图纸做。', '这个尺寸不对。', '这里要改。', '按图纸做。', '这里不对。', '这个尺寸改一下。']),
  day(58, '工地质量', 'construction', [
    ['平', 'píng', 'rata'],
  ], ['这里不平。', '高了。', '低了。', '高一点。', '低一点。', '再检查一下。'], [{ role: '主管', chinese: '这里不平。' }, { role: '员工', chinese: '这里吗？' }, { role: '主管', chinese: '对，低一点。' }, { role: '员工', chinese: '这样吗？' }, { role: '主管', chinese: '对。' }]),
  day(59, '工地安全', 'construction', [
    ['小心', 'xiǎo xīn', 'hati-hati'], ['安全', 'ān quán', 'keselamatan / aman'], ['安全帽', 'ān quán mào', 'helm keselamatan'], ['危险', 'wēi xiǎn', 'berbahaya'],
  ], ['小心！', '这里危险。', '先停一下。', '戴安全帽。', '不要过去。'], [], { safety: true }),
  day(60, '建筑工地综合实战', 'construction', [], [
    '叫两个工人过来。', '你们两个搬这个。', '放哪里？', '放那边。', '钢筋到了吗？', '水泥呢？', '这个尺寸不对。', '再量一下。',
    '这里不平。', '低一点。', '做到哪里了？', '做了一半。', '今天能做完吗？', '能。', '今天来不及。', '停！', '不要过去！',
    '叫两个工人过来，把钢筋放这里。',
  ], [], { safety: true }),
];

export function getMandarinWorkLevel2Day(dayNumber: number) {
  return mandarinWorkLevel2Days.find((entry) => entry.day === dayNumber) ?? null;
}
