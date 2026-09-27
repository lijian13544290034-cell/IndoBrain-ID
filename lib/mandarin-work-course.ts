export const MANDARIN_WORK_NAMESPACE = 'mandarin-work-30d' as const;

export type MandarinItemType = 'NEW' | 'REVIEW' | 'COMBINATION';
export type PinyinSegment = { hanzi: string; pinyin: string };
export type MandarinWorkItem = {
  id: string; day: number; chinese: string; pinyinSegments: PinyinSegment[];
  indonesian: string; indonesianExplanation: string | null; audioText: string;
  coreWordIds: string[]; introducedDay: number; reviewDays: number[];
  workScenario: string; difficulty: 1 | 2 | 3; reviewTags: string[];
  favoriteId: string; isNew: boolean; itemType: MandarinItemType;
};
export type MandarinDialogue = { id: string; role: '老板' | '员工' | '同事'; item: MandarinWorkItem };
export type MandarinDay = { day: number; title: string; scenario: string; items: MandarinWorkItem[]; dialogue: MandarinDialogue[]; listeningItemId: string };

const translations: Record<string, string> = {
  '你好':'Halo.','我':'saya / aku','你':'kamu / Anda','我叫':'Nama saya…','谢谢':'Terima kasih.','好的':'Baik / oke.','再见':'Sampai jumpa.',
  '来':'datang','去':'pergi','这里':'di sini','那里':'di sana','来这里':'Datang ke sini.','去那里':'Pergi ke sana.','一':'satu','二':'dua',
  '这':'ini','这个':'ini / yang ini','那':'itu','那个':'itu / yang itu','什么':'apa','哪个':'yang mana','要这个':'Mau yang ini.','三':'tiga','四':'empat',
  '个':'kata bantu bilangan umum','一个':'satu buah / satu unit','两个':'dua buah / dua unit','几个':'Berapa buah?','多少':'Berapa?','五个':'lima buah','六个':'enam buah','五':'lima','六':'enam',
  '有':'ada / punya','没有':'tidak ada / tidak punya','有吗':'Ada?','还有吗':'Masih ada?','不要':'tidak mau / jangan','七个':'tujuh buah','八个':'delapan buah','七':'tujuh','八':'delapan',
  '今天':'hari ini','明天':'besok','现在':'sekarang','做':'kerjakan / melakukan','今天做':'Kerjakan hari ini.','明天做':'Kerjakan besok.','现在做':'Kerjakan sekarang.','九':'sembilan','九个':'sembilan buah',
  '点':'jam','几点':'Jam berapa?','一点':'jam satu','两点':'jam dua','三点':'jam tiga','十':'sepuluh','十个':'sepuluh buah',
  '谁':'siapa','哪里':'di mana','他是谁':'Dia siapa?','在哪里':'Di mana?',
  '对':'benar','不对':'salah / tidak benar','快':'cepat','慢':'pelan / lambat','快一点':'Lebih cepat sedikit.','慢一点':'Lebih pelan.',
  '拿':'ambil','给':'beri / kasih','放':'taruh','找':'cari','拿这个':'Ambil yang ini.','给我':'Berikan kepada saya.','给他':'Berikan kepadanya.','放这里':'Taruh di sini.','找一下':'Coba cari sebentar.',
  '看':'lihat','听':'dengar','说':'bicara','问':'tanya','看一下':'Lihat sebentar.','听一下':'Dengarkan sebentar.','问一下':'Coba tanyakan.',
  '好了':'sudah selesai / sudah siap','还没':'belum','做好了':'Sudah selesai dikerjakan.','好了吗':'Sudah selesai?','还没有':'Belum.',
  '可以':'boleh / bisa','不可以':'tidak boleh / tidak bisa','会':'bisa / tahu cara','不会':'tidak bisa / tidak tahu caranya','可以吗':'Bisa? / Boleh?','你会吗':'Kamu bisa?','我不会':'Saya tidak bisa / Saya tidak tahu caranya.',
  '不懂':'tidak mengerti','我不懂':'Saya tidak mengerti.','再说一次':'Tolong ulangi sekali lagi.','什么意思':'Artinya apa?','懂了':'Sudah mengerti.',
  '正在做':'Sedang dikerjakan.','多':'banyak','少':'sedikit','够':'cukup','不够':'Tidak cukup.','多了':'Kelebihan.','少了':'Kurang.','少两个':'Kurang dua.','十个够吗':'Sepuluh, cukup?',
  '坏了':'rusak','问题':'masalah','有问题':'Ada masalah.','这里坏了':'Di sini rusak.','这个坏了':'Yang ini rusak.',
  '一样':'sama','不一样':'Tidak sama / berbeda.','数量':'jumlah / kuantitas','数量不对':'Jumlahnya tidak benar.','这个不一样':'Yang ini berbeda.',
  '再做':'Kerjakan lagi.','重做':'Kerjakan ulang.','改一下':'Tolong perbaiki / ubah sedikit.','检查一下':'Tolong periksa.',
  '能':'bisa','不能':'Tidak bisa.','来得及':'Masih sempat.','来不及':'Tidak sempat / waktunya tidak cukup.','今天能好吗':'Bisa selesai hari ini?',
  '为什么':'kenapa','因为':'karena','货':'barang','没货':'Tidak ada barang / stok habis.','因为没货':'Karena barangnya tidak ada.','明天能好吗':'Bisa selesai besok?',
  '老板':'bos','同事':'rekan kerja','经理':'manajer','他在哪':'Dia di mana?','他不在':'Dia tidak ada di sini.','叫他来':'Panggil dia ke sini.','老板找你':'Bos mencari kamu.',
  '到了':'sudah sampai','发货':'kirim barang','库存':'stok','有货吗':'Ada barang / stok?','货到了':'Barang sudah sampai.','今天发货':'Kirim barang hari ini.','库存多少':'Stoknya berapa?',
  '机器':'mesin','生产':'produksi','停':'berhenti','开':'nyalakan / mulai','先':'dulu / terlebih dahulu','机器坏了':'Mesinnya rusak.','先停一下':'Berhenti dulu sebentar.','开始生产':'Mulai produksi.',
  '文件':'dokumen / file','表格':'formulir / tabel','照片':'foto','文件给我':'Berikan file kepada saya.','发给我':'Kirim ke saya.','发给他':'Kirim kepadanya.','文件呢':'File-nya?',
  '价格':'harga','报价':'penawaran harga / quotation','供应商':'supplier','贵':'mahal','便宜':'murah','钱':'uang','多少钱':'Berapa harganya?','太贵了':'Terlalu mahal.','报价呢':'Quotation-nya?','问一下供应商':'Coba tanyakan kepada supplier.',
  '上班':'masuk kerja','下班':'pulang kerja','加班':'lembur','请假':'izin / cuti','迟到':'terlambat','几点上班':'Masuk kerja jam berapa?','今天加班':'Hari ini lembur.','我要请假':'Saya mau izin / cuti.','我迟到了':'Saya terlambat.',
  '吃饭':'makan','喝水':'minum air','休息':'istirahat','一起':'bersama','吃饭了吗':'Sudah makan?','一起吃饭':'Makan bersama.','去吃饭':'Pergi makan.','休息一下':'Istirahat sebentar.',
  '十个能吗':'Sepuluh, bisa?','货到了吗':'Barangnya sudah sampai?','明天发货':'Kirim barang besok.',
};

const normalize = (value: string) => value.replace(/[？?。！!，,、…\s]/g, '');
export const canonicalTranslation = (chinese: string) => translations[normalize(chinese)];

const pinyin: Record<string, string> = {
  '你':'nǐ','好':'hǎo','我':'wǒ','叫':'jiào','谢':'xiè','的':'de','再':'zài','见':'jiàn','来':'lái','去':'qù','这':'zhè','里':'lǐ','那':'nà','什':'shén','么':'me','哪':'nǎ','要':'yào',
  '一':'yī','二':'èr','三':'sān','四':'sì','五':'wǔ','六':'liù','七':'qī','八':'bā','九':'jiǔ','十':'shí','个':'ge','两':'liǎng','几':'jǐ','多':'duō','少':'shǎo',
  '有':'yǒu','没':'méi','还':'hái','不':'bù','今':'jīn','天':'tiān','明':'míng','现':'xiàn','在':'zài','做':'zuò','点':'diǎn','谁':'shéi','他':'tā','是':'shì','对':'duì','快':'kuài','慢':'màn',
  '拿':'ná','给':'gěi','放':'fàng','找':'zhǎo','下':'xià','看':'kàn','听':'tīng','说':'shuō','问':'wèn','了':'le','吗':'ma','呢':'ne','次':'cì','得':'de','可':'kě','以':'yǐ','会':'huì','懂':'dǒng','意':'yì','思':'si',
  '正':'zhèng','够':'gòu','坏':'huài','题':'tí','样':'yàng','数':'shù','量':'liàng','重':'chóng','改':'gǎi','检':'jiǎn','查':'chá','能':'néng','及':'jí','为':'wèi','因':'yīn','货':'huò',
  '老':'lǎo','板':'bǎn','同':'tóng','事':'shì','经':'jīng','理':'lǐ','到':'dào','发':'fā','库':'kù','存':'cún','机':'jī','器':'qì','生':'shēng','产':'chǎn','停':'tíng','开':'kāi','先':'xiān','始':'shǐ',
  '文':'wén','件':'jiàn','表':'biǎo','格':'gé','照':'zhào','片':'piàn','价':'jià','报':'bào','供':'gōng','应':'yìng','商':'shāng','贵':'guì','太':'tài','便':'pián','宜':'yi','钱':'qián',
  '上':'shàng','班':'bān','加':'jiā','请':'qǐng','假':'jià','迟':'chí','吃':'chī','饭':'fàn','喝':'hē','水':'shuǐ','休':'xiū','息':'xi','起':'qǐ','把':'bǎ','昨':'zuó','销':'xiāo','售':'shòu','整':'zhěng','办':'bàn','公':'gōng','室':'shì',
};

const exactPinyin: Record<string, string[]> = {
  '一个':['yí','ge'],'一点':['yì','diǎn'],'一样':['yí','yàng'],'一起':['yì','qǐ'],'一下':['yí','xià'],
  '不对':['bú','duì'],'不会':['bú','huì'],'不够':['bú','gòu'],'不要':['bú','yào'],'不在':['bú','zài'],'不一样':['bù','yí','yàng'],'不可以':['bù','kě','yǐ'],'不能':['bù','néng'],'不懂':['bù','dǒng'],'来不及':['lái','bu','jí'],
};

export function toPinyinSegments(chinese: string): PinyinSegment[] {
  const clean = chinese.replace(/[？?。！!，,、…\s]/g, '');
  const override = exactPinyin[clean];
  const characters = Array.from(clean);
  return characters.map((hanzi, index) => {
    let reading = override?.[index] ?? pinyin[hanzi] ?? '';
    const next = characters[index + 1];
    if (!override && hanzi === '一' && next) reading = ['个','下','样'].includes(next) ? 'yí' : /[àèìòùǜ]/.test(pinyin[next] ?? '') ? 'yí' : 'yì';
    if (!override && hanzi === '不' && next && /[àèìòùǜ]/.test(pinyin[next] ?? '')) reading = 'bú';
    return { hanzi, pinyin: reading };
  });
}

const scenarios = ['greeting','movement','object-selection','quantity','availability','schedule','time','people-location','correction-speed','object-action','communication-action','work-status','ability-permission','self-rescue','work-progress','quantity-problem','problem-report','quality-check','rework','deadline','reason-report','people-collaboration','warehouse-logistics','production','office','procurement','attendance','workplace-social','full-workday','final-work-simulation'];
const titles = ['第一次开口','来、去','这个、那个','数量','有没有','今天、明天、现在','几点','谁、哪里','对错、快慢','拿、给、放、找','看、听、说、问','工作完成没有','可以、会不会','听不懂也能沟通','工作进度','够不够','出了问题','检查结果','返工','今天能好吗','为什么','找人','仓库物流','生产现场','办公室','采购','上班','公司里的生活中文','第一个完整中文工作日','最终“中国老板模式”'];

const daily: string[][] = [
  ['你好','我','你','我叫……','谢谢','好的','再见'],
  ['来','去','这里','那里','来这里','去那里','一','二'],
  ['这','这个','那','那个','什么？','哪个？','要这个','三','四'],
  ['个','一个','两个','几个？','多少？','五个','六个','五','六'],
  ['有','没有','有吗？','还有吗？','不要','七个','八个','七','八'],
  ['今天','明天','现在','做','今天做','明天做','现在做','九','九个'],
  ['点','几点？','一点','两点','三点','十','十个'],
  ['谁？','哪里？','他是谁？','在哪里？','这里','那里'],
  ['对','不对','快','慢','快一点','慢一点'],
  ['拿','给','放','找','拿这个','给我','给他','放这里','找一下'],
  ['看','听','说','问','看一下','听一下','问一下'],
  ['好了','还没','做好了','好了吗？','还没有'],
  ['可以','不可以','会','不会','可以吗？','你会吗？','我不会'],
  ['不懂','我不懂','再说一次','慢一点','什么意思？','懂了'],
  ['好了','还没','正在做','现在做'],
  ['多','少','够','不够','多了','少了','少两个','十个，够吗？'],
  ['坏了','问题','有问题','这里坏了','这个坏了'],
  ['一样','不一样','数量','数量不对','这个不一样','对','不对'],
  ['再做','重做','改一下','检查一下'],
  ['能','不能','来得及','来不及','今天能好吗？'],
  ['为什么？','因为','货','没货','因为没货'],
  ['老板','同事','经理','他在哪？','他不在','叫他来','老板找你'],
  ['货','到了','发货','库存','有货吗？','没货','货到了','今天发货','库存多少？'],
  ['机器','生产','停','开','先','机器坏了','先停一下','开始生产'],
  ['文件','表格','照片','文件给我','发给我','发给他','看一下'],
  ['价格','报价','供应商','贵','便宜','钱','多少钱？','太贵了','报价呢？','问一下供应商'],
  ['上班','下班','加班','请假','迟到','几点上班？','今天加班','我要请假','我迟到了'],
  ['吃饭','喝水','休息','一起','吃饭了吗？','一起吃饭','去吃饭','休息一下'],
  [], [],
];

const dialogues: Record<number, Array<[MandarinDialogue['role'], string]>> = {
  12:[['老板','好了吗？'],['员工','还没。'],['老板','快一点。'],['员工','好的。']],
  21:[['老板','好了吗？'],['员工','还没。'],['老板','为什么？'],['员工','因为没货。'],['老板','明天能好吗？'],['员工','可以。'],['老板','好的。']],
  25:[['老板','文件呢？'],['员工','这里。'],['老板','发给我。'],['员工','好的。']],
  28:[['同事','吃饭了吗？'],['员工','还没。'],['同事','一起吃饭？'],['员工','好的。']],
  29:[['老板','来这里。'],['员工','好的。'],['老板','拿这个。'],['老板','给他。'],['老板','有吗？'],['员工','有。'],['老板','几个？'],['员工','八个。'],['老板','不够。'],['老板','十个，能吗？'],['员工','可以。'],['老板','好了吗？'],['员工','还没。'],['老板','为什么？'],['员工','这个坏了。'],['老板','检查一下。'],['员工','好的。'],['老板','文件呢？'],['员工','这里。'],['老板','发给我。'],['员工','好的。'],['老板','货到了吗？'],['员工','还没。'],['老板','明天发货。'],['员工','好的。'],['老板','今天能好吗？'],['员工','能。'],['老板','好的。']],
  30:[['老板','拿这个'],['老板','放这里'],['老板','给他'],['老板','几个？'],['员工','八个'],['老板','十个，够吗？'],['员工','够'],['老板','几点？'],['员工','三点'],['老板','今天能好吗？'],['员工','能'],['老板','好了吗？'],['员工','还没'],['老板','为什么？'],['员工','机器坏了'],['老板','检查一下'],['员工','好的'],['老板','有货吗？'],['员工','有'],['老板','库存多少？'],['员工','十个'],['老板','今天发货'],['员工','好的'],['老板','文件呢？'],['员工','这里'],['老板','发给我'],['员工','好的'],['同事','吃饭了吗？'],['员工','还没'],['同事','一起吃饭？'],['员工','好的']],
};

const explanations: Record<string, string> = {
  '个':'“个” adalah kata bantu bilangan yang sangat umum dalam bahasa Mandarin. 一个 = satu buah. 两个 = dua buah.',
  '两个':'Untuk menghitung benda, bahasa Mandarin sering memakai “两”: 两个 = dua buah.',
  '找一下':'“一下” sering dipakai agar instruksi terdengar lebih ringan dan alami.',
  '可以':'“可以” berarti boleh atau memungkinkan. “会” berarti tahu caranya atau memiliki kemampuan.',
  '能':'“会” berarti tahu caranya atau memiliki kemampuan. “能” berarti bisa dilakukan dalam kondisi sekarang.',
  '吃饭了吗':'Orang Tiongkok kadang bertanya “吃饭了吗？” sebagai sapaan atau bentuk perhatian. Tidak selalu berarti benar-benar ingin mengetahui kamu sudah makan atau belum.',
  '点':'Dalam pelajaran waktu, “点” digunakan untuk menyatakan jam. 三点 = jam tiga.',
};

function difficulty(day: number): 1 | 2 | 3 { return day <= 14 ? 1 : day <= 28 ? 2 : 3; }
const coreLexicon = [
  '供应商','来得及','来不及','为什么','不一样','还没有','正在做','今天','明天','现在','这里','那里','这个','那个','什么','哪个','没有','不要','再见','谢谢','好的','你好','一下','多少','哪里','不对','好了','还没','做好了','可以','不可以','不会','不懂','意思','多了','少了','坏了','问题','一样','数量','重做','检查','没货','老板','同事','经理','到了','发货','库存','机器','生产','开始','文件','表格','照片','价格','报价','便宜','上班','下班','加班','请假','迟到','吃饭','喝水','休息','一起','一个','两个','五个','六个','七个','八个','九个','十个','我叫',
  '我','你','叫','来','去','一','二','这','那','要','三','四','个','两','几','五','六','有','还','七','八','做','九','点','十','谁','他','是','在','对','快','慢','拿','给','放','找','看','听','说','问','了','吗','会','懂','再','次','正','多','少','够','坏','样','数','量','改','能','因为','货','叫','停','开','先','发','贵','钱',
].sort((a,b) => b.length - a.length);
function coreIds(chinese: string) {
  const clean = normalize(chinese); const words: string[] = [];
  for (let offset = 0; offset < clean.length;) {
    const word = coreLexicon.find((candidate) => clean.startsWith(candidate, offset)) ?? clean[offset];
    words.push(word); offset += word.length;
  }
  return Array.from(new Set(words.map((word) => `CN-CORE-${Array.from(word).map((char) => char.codePointAt(0)!.toString(16).toUpperCase()).join('-')}`)));
}

type Draft = { day: number; index: number; chinese: string; dialogue: boolean };
const drafts: Draft[] = daily.flatMap((items, dayIndex) => items.map((chinese, index) => ({ day: dayIndex + 1, index, chinese, dialogue: false })));
for (const [dayValue, turns] of Object.entries(dialogues)) turns.forEach(([, chinese], index) => drafts.push({ day: Number(dayValue), index, chinese, dialogue: true }));
const introduced = new Map<string, number>();
for (const draft of [...drafts].sort((a,b) => a.day-b.day || Number(a.dialogue)-Number(b.dialogue) || a.index-b.index)) {
  for (const core of coreIds(draft.chinese)) if (!introduced.has(core)) introduced.set(core, draft.day);
}
const appearances = new Map<string, Set<number>>();
for (const draft of drafts) for (const core of coreIds(draft.chinese)) { const days = appearances.get(core) ?? new Set<number>(); days.add(draft.day); appearances.set(core, days); }
const firstExpressionDay = new Map<string, number>();

function makeItem(day: number, chinese: string, index: number, dialogue = false): MandarinWorkItem {
  const key = normalize(chinese); const ids = coreIds(chinese); const first = Math.min(...ids.map((id) => introduced.get(id) ?? day));
  const exactFirst = firstExpressionDay.get(key); let itemType: MandarinItemType;
  if (exactFirst != null && exactFirst < day) itemType = 'REVIEW';
  else if (ids.every((id) => (introduced.get(id) ?? day) < day)) itemType = 'COMBINATION';
  else itemType = 'NEW';
  if (exactFirst == null) firstExpressionDay.set(key, day);
  const baseId = `CN-WORK-D${String(day).padStart(2,'0')}-${dialogue ? 'D' : 'I'}${String(index + 1).padStart(2,'0')}`;
  return { id: baseId, day, chinese, pinyinSegments: toPinyinSegments(chinese), indonesian: canonicalTranslation(chinese), indonesianExplanation: explanations[key] ?? null, audioText: chinese, coreWordIds: ids, introducedDay: first, reviewDays: Array.from(new Set(ids.flatMap((id) => [...(appearances.get(id) ?? [])]))).filter((value) => value > first).sort((a,b)=>a-b), workScenario: scenarios[day-1], difficulty: difficulty(day), reviewTags: [itemType.toLowerCase(), 'work'], favoriteId: `${MANDARIN_WORK_NAMESPACE}:${baseId}`, isNew: itemType === 'NEW', itemType };
}

export const mandarinWorkDays: MandarinDay[] = Array.from({ length: 30 }, (_, offset) => {
  const day = offset + 1;
  const items = daily[offset].map((chinese, index) => makeItem(day, chinese, index));
  const dialogue = (dialogues[day] ?? []).map(([role, chinese], index) => ({ id: `dialogue-${day}-${index+1}`, role, item: makeItem(day, chinese, index, true) }));
  const candidates = items.length ? items : dialogue.map((turn) => turn.item); const listeningItemId = candidates[0]?.id ?? '';
  const markListening = (item: MandarinWorkItem) => item.id === listeningItemId ? { ...item, reviewTags: [...item.reviewTags, 'listening'] } : item;
  return { day, title: titles[offset], scenario: scenarios[offset], items: items.map(markListening), dialogue: dialogue.map((turn) => ({ ...turn, item: markListening(turn.item) })), listeningItemId };
});

export const SELF_RESCUE_DAY14 = { chinese: '你去办公室拿文件。', audioText: '你去办公室拿文件。', tags: ['self-rescue','listening'], type: 'UNKNOWN_INPUT' as const };
export const SELF_RESCUE_DAY30 = { chinese: '你把昨天的销售报表整理一下。', audioText: '你把昨天的销售报表整理一下。', tags: ['self-rescue','listening'], type: 'UNKNOWN_INPUT' as const };
export const completionCopy = {
  7: ['会打招呼','理解来 / 去','理解这个 / 那个','数字1–10','简单数量','今天 / 明天 / 现在','几点'],
  14: ['memahami instruksi kerja dasar','menjawab pertanyaan sederhana','mengatakan saat tidak mengerti','meminta bicara lebih pelan','meminta pengulangan','menanyakan arti'],
  30: ['memahami instruksi kerja dasar','angka dan jumlah sederhana','komunikasi waktu','melaporkan progres kerja','melaporkan masalah','komunikasi gudang/logistik dasar','komunikasi kantor dasar','komunikasi sederhana dengan rekan kerja','tahu apa yang harus dilakukan saat tidak mengerti'],
} as const;

export function allMandarinWorkItems() { return mandarinWorkDays.flatMap((day) => [...day.items, ...day.dialogue.map((turn) => turn.item)]); }
