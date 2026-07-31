export type ChineseCategory = 'meet' | 'daily' | 'work' | 'boss100' | 'reply100';
export type ChineseDialogue = { speaker: '中国同事' | '印尼同事'; chinese: string; pinyin: string; indonesian: string };
export type ChineseVocabulary = { chinese: string; pinyin: string; indonesian: string };
export type ChineseExperience = {
  id: string; category: ChineseCategory; title: string; pinyin: string; scenario: string; dialogue: ChineseDialogue[];
  vocabulary: ChineseVocabulary[]; objects: ChineseVocabulary[]; pattern: { chinese: string; pinyin: string; indonesian: string; examples: ChineseDialogue[] };
  chinaKnowledge: string; cultureTip: string;
};

export const chineseCategories: Array<{ slug: ChineseCategory; chinese: string; indonesian: string; icon: string }> = [
  { slug: 'meet', chinese: '初次见面', indonesian: 'Pertemuan pertama', icon: '👋' },
  { slug: 'daily', chinese: '日常交流', indonesian: 'Percakapan sehari-hari', icon: '💬' },
  { slug: 'work', chinese: '工作沟通', indonesian: 'Komunikasi kerja', icon: '🏢' },
  { slug: 'boss100', chinese: '中国老板最常说的 100 句话', indonesian: '100 kalimat atasan Tiongkok', icon: '🇨🇳' },
  { slug: 'reply100', chinese: '印尼员工最常用的 100 句回复', indonesian: '100 jawaban karyawan Indonesia', icon: '🇮🇩' },
];

const vocab = (chinese: string, pinyin: string, indonesian: string): ChineseVocabulary => ({ chinese, pinyin, indonesian });
const line = (speaker: ChineseDialogue['speaker'], chinese: string, pinyin: string, indonesian: string): ChineseDialogue => ({ speaker, chinese, pinyin, indonesian });
const defaults: Record<ChineseCategory, Pick<ChineseExperience, 'chinaKnowledge' | 'cultureTip'>> = {
  meet: { chinaKnowledge: '中国职场初次见面常会先交换姓名、部门和联系方式。称呼对方时，知道姓氏后加“经理、老师、姐、哥”等，会比直呼名字更自然。', cultureTip: '第一次见面可以先说“你好，很高兴认识你”。语速放慢、语气友好，比复杂句子更重要。' },
  daily: { chinaKnowledge: '“吃饭了吗？”在中文里有时是关心，也常是打开聊天的话题；回答简短自然即可，不一定是在邀请吃饭。', cultureTip: '中文日常交流常先寒暄再进入正题。加上“请、谢谢、麻烦你”会让表达更柔和。' },
  work: { chinaKnowledge: '中资企业沟通通常看重时间、结果和明确回复。听到安排后，先确认自己理解的内容，会减少误会。', cultureTip: '工作中不确定时可以直接问“我再确认一下”。这不是失礼，而是对进度负责。' },
  boss100: { chinaKnowledge: '中国老板常用简短句交代优先级、时间和结果。重点先听动词、时间词和对象，例如“今天、先、发、客户”。', cultureTip: '收到指令后，先复述关键信息或说明预计完成时间，能建立可靠的工作印象。' },
  reply100: { chinaKnowledge: '在中国办公室，及时、清楚的反馈通常比很长的解释更重要。“好的，我马上处理”是高频且安全的回复。', cultureTip: '如果不能按时完成，不要只说“做不了”；说明目前进度和需要的支持会更专业。' },
};

function lesson(id: string, category: ChineseCategory, title: string, pinyin: string, scenario: string, dialogue: ChineseDialogue[], vocabulary: ChineseVocabulary[], objects: ChineseVocabulary[], pattern: ChineseExperience['pattern']): ChineseExperience {
  return { id, category, title, pinyin, scenario, dialogue, vocabulary, objects, pattern, ...defaults[category] };
}

const meet = [
  lesson('CHN-MET-001', 'meet', '你好，很高兴认识你。', 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.', '第一天到中国同事所在的办公室，先礼貌地认识对方。', [line('印尼同事', '你好，很高兴认识你。', 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.', 'Halo, senang berkenalan dengan Anda.'), line('中国同事', '你好，我也很高兴认识你。', 'Nǐ hǎo, wǒ yě hěn gāoxìng rènshi nǐ.', 'Halo, saya juga senang berkenalan dengan Anda.')], [vocab('你好', 'nǐ hǎo', 'halo'), vocab('认识', 'rènshi', 'berkenalan')], [vocab('名片', 'míngpiàn', 'kartu nama')], { chinese: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', indonesian: 'Senang berkenalan dengan Anda.', examples: [line('印尼同事', '很高兴认识您。', 'Hěn gāoxìng rènshi nín.', 'Senang berkenalan dengan Bapak/Ibu.'), line('印尼同事', '我很高兴认识大家。', 'Wǒ hěn gāoxìng rènshi dàjiā.', 'Saya senang berkenalan dengan semuanya.')] }),
  lesson('CHN-MET-002', 'meet', '我叫阿迪。', 'Wǒ jiào Ādí.', '自我介绍时，说出自己的名字即可。', [line('印尼同事', '你好，我叫阿迪。', 'Nǐ hǎo, wǒ jiào Ādí.', 'Halo, nama saya Adi.'), line('中国同事', '你好，阿迪。', 'Nǐ hǎo, Ādí.', 'Halo, Adi.')], [vocab('我叫', 'wǒ jiào', 'nama saya'), vocab('名字', 'míngzi', 'nama')], [vocab('工牌', 'gōngpái', 'kartu identitas kerja')], { chinese: '我叫……', pinyin: 'Wǒ jiào …', indonesian: 'Nama saya …', examples: [line('印尼同事', '我叫丽娜。', 'Wǒ jiào Lìnà.', 'Nama saya Lina.'), line('印尼同事', '我叫布迪。', 'Wǒ jiào Bùdí.', 'Nama saya Budi.')] }),
  lesson('CHN-MET-003', 'meet', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', '忘记对方名字时，可以自然地再确认一次。', [line('印尼同事', '不好意思，你叫什么名字？', 'Bù hǎoyìsi, nǐ jiào shénme míngzi?', 'Maaf, siapa nama Anda?'), line('中国同事', '我叫王丽。', 'Wǒ jiào Wáng Lì.', 'Nama saya Wang Li.')], [vocab('什么', 'shénme', 'apa'), vocab('名字', 'míngzi', 'nama')], [vocab('名片', 'míngpiàn', 'kartu nama')], { chinese: '你叫……吗？', pinyin: 'Nǐ jiào … ma?', indonesian: 'Apakah nama Anda …?', examples: [line('印尼同事', '你叫王丽吗？', 'Nǐ jiào Wáng Lì ma?', 'Apakah nama Anda Wang Li?'), line('印尼同事', '你叫陈经理吗？', 'Nǐ jiào Chén jīnglǐ ma?', 'Apakah Anda Manajer Chen?')] }),
  lesson('CHN-MET-004', 'meet', '我是采购部的。', 'Wǒ shì cǎigòu bù de.', '介绍自己的部门，让同事知道之后该找谁沟通。', [line('印尼同事', '你是哪个部门的？', 'Nǐ shì nǎge bùmén de?', 'Anda dari departemen mana?'), line('中国同事', '我是采购部的。', 'Wǒ shì cǎigòu bù de.', 'Saya dari departemen pembelian.')], [vocab('部门', 'bùmén', 'departemen'), vocab('采购部', 'cǎigòu bù', 'departemen pembelian')], [vocab('办公室', 'bàngōngshì', 'kantor')], { chinese: '我是……部的。', pinyin: 'Wǒ shì … bù de.', indonesian: 'Saya dari departemen …', examples: [line('中国同事', '我是生产部的。', 'Wǒ shì shēngchǎn bù de.', 'Saya dari departemen produksi.'), line('中国同事', '我是财务部的。', 'Wǒ shì cáiwù bù de.', 'Saya dari departemen keuangan.')] }),
  lesson('CHN-MET-005', 'meet', '请多关照。', 'Qǐng duō guānzhào.', '初次合作或刚加入团队时，用这句话表达礼貌与合作意愿。', [line('印尼同事', '以后请多关照。', 'Yǐhòu qǐng duō guānzhào.', 'Mohon bimbingannya ke depan.'), line('中国同事', '互相关照。', 'Hùxiāng guānzhào.', 'Mari saling membantu.')], [vocab('以后', 'yǐhòu', 'ke depan'), vocab('关照', 'guānzhào', 'membimbing / membantu')], [vocab('微信', 'Wēixìn', 'WeChat')], { chinese: '请多……', pinyin: 'Qǐng duō …', indonesian: 'Mohon lebih …', examples: [line('印尼同事', '请多指导。', 'Qǐng duō zhǐdǎo.', 'Mohon banyak bimbingan.'), line('印尼同事', '请多帮助。', 'Qǐng duō bāngzhù.', 'Mohon banyak bantuan.')] }),
];

const daily = [
  lesson('CHN-DAY-001', 'daily', '你吃饭了吗？', 'Nǐ chīfàn le ma?', '午饭前后遇到中国同事，常会听到这句问候。', [line('中国同事', '你吃饭了吗？', 'Nǐ chīfàn le ma?', 'Apakah kamu sudah makan?'), line('印尼同事', '吃了，谢谢。', 'Chī le, xièxie.', 'Sudah, terima kasih.')], [vocab('吃饭', 'chīfàn', 'makan'), vocab('谢谢', 'xièxie', 'terima kasih')], [vocab('饭盒', 'fànhé', 'kotak makan')], { chinese: '……了吗？', pinyin: '… le ma?', indonesian: 'Apakah sudah …?', examples: [line('中国同事', '你下班了吗？', 'Nǐ xiàbān le ma?', 'Apakah kamu sudah pulang kerja?'), line('中国同事', '文件发了吗？', 'Wénjiàn fā le ma?', 'Apakah dokumennya sudah dikirim?')] }),
  lesson('CHN-DAY-002', 'daily', '你忙吗？', 'Nǐ máng ma?', '想请同事帮忙前，先确认对方是否方便。', [line('印尼同事', '你现在忙吗？', 'Nǐ xiànzài máng ma?', 'Apakah kamu sedang sibuk sekarang?'), line('中国同事', '还好，你说。', 'Hái hǎo, nǐ shuō.', 'Tidak terlalu, silakan bilang.')], [vocab('现在', 'xiànzài', 'sekarang'), vocab('忙', 'máng', 'sibuk')], [vocab('手机', 'shǒujī', 'ponsel')], { chinese: '你……吗？', pinyin: 'Nǐ … ma?', indonesian: 'Apakah kamu …?', examples: [line('印尼同事', '你方便吗？', 'Nǐ fāngbiàn ma?', 'Apakah kamu sempat?'), line('印尼同事', '你有时间吗？', 'Nǐ yǒu shíjiān ma?', 'Apakah kamu ada waktu?')] }),
  lesson('CHN-DAY-003', 'daily', '没关系。', 'Méi guānxi.', '同事道歉或出现小问题时，用来表示理解。', [line('中国同事', '不好意思，我来晚了。', 'Bù hǎoyìsi, wǒ lái wǎn le.', 'Maaf, saya datang terlambat.'), line('印尼同事', '没关系。', 'Méi guānxi.', 'Tidak apa-apa.')], [vocab('没关系', 'méi guānxi', 'tidak apa-apa'), vocab('晚', 'wǎn', 'terlambat')], [vocab('门', 'mén', 'pintu')], { chinese: '没关系。', pinyin: 'Méi guānxi.', indonesian: 'Tidak apa-apa.', examples: [line('印尼同事', '没关系，明天再做。', 'Méi guānxi, míngtiān zài zuò.', 'Tidak apa-apa, kerjakan besok saja.'), line('印尼同事', '没关系，我等你。', 'Méi guānxi, wǒ děng nǐ.', 'Tidak apa-apa, saya tunggu kamu.')] }),
  lesson('CHN-DAY-004', 'daily', '麻烦你了。', 'Máfan nǐ le.', '请人协助并表达感谢时，这是办公室里的自然说法。', [line('印尼同事', '这个表麻烦你看一下。', 'Zhège biǎo máfan nǐ kàn yíxià.', 'Tolong lihat formulir ini ya.'), line('中国同事', '好，我现在看。', 'Hǎo, wǒ xiànzài kàn.', 'Baik, saya lihat sekarang.')], [vocab('麻烦', 'máfan', 'merepotkan / mohon bantu'), vocab('一下', 'yíxià', 'sebentar')], [vocab('表格', 'biǎogé', 'formulir')], { chinese: '麻烦你 + 动词。', pinyin: 'Máfan nǐ + dòngcí.', indonesian: 'Tolong + kata kerja.', examples: [line('印尼同事', '麻烦你打印一下。', 'Máfan nǐ dǎyìn yíxià.', 'Tolong cetak sebentar.'), line('印尼同事', '麻烦你等一下。', 'Máfan nǐ děng yíxià.', 'Tolong tunggu sebentar.')] }),
  lesson('CHN-DAY-005', 'daily', '我先走了。', 'Wǒ xiān zǒu le.', '下班或离开会议室时，简短说明自己先离开。', [line('印尼同事', '我先走了，明天见。', 'Wǒ xiān zǒu le, míngtiān jiàn.', 'Saya pulang dulu, sampai besok.'), line('中国同事', '好，明天见。', 'Hǎo, míngtiān jiàn.', 'Baik, sampai besok.')], [vocab('先', 'xiān', 'dulu'), vocab('走', 'zǒu', 'pergi')], [vocab('电梯', 'diàntī', 'lift')], { chinese: '我先……了。', pinyin: 'Wǒ xiān … le.', indonesian: 'Saya … dulu.', examples: [line('印尼同事', '我先回去了。', 'Wǒ xiān huíqù le.', 'Saya pulang dulu.'), line('印尼同事', '我先去开会了。', 'Wǒ xiān qù kāihuì le.', 'Saya pergi rapat dulu.')] }),
];

const work = [
  lesson('CHN-WRK-001', 'work', '这个文件请你看一下。', 'Zhège wénjiàn qǐng nǐ kàn yíxià.', '需要同事查看文件或确认内容时使用。', [line('中国同事', '这个文件请你看一下。', 'Zhège wénjiàn qǐng nǐ kàn yíxià.', 'Tolong lihat dokumen ini.'), line('印尼同事', '好的，我马上看。', 'Hǎo de, wǒ mǎshàng kàn.', 'Baik, saya cek sekarang.')], [vocab('文件', 'wénjiàn', 'dokumen'), vocab('看一下', 'kàn yíxià', 'lihat sebentar')], [vocab('电脑', 'diànnǎo', 'komputer')], { chinese: '请你 + 动词。', pinyin: 'Qǐng nǐ + dòngcí.', indonesian: 'Tolong kamu + kata kerja.', examples: [line('中国同事', '请你确认一下。', 'Qǐng nǐ quèrèn yíxià.', 'Tolong konfirmasi.'), line('中国同事', '请你发给客户。', 'Qǐng nǐ fā gěi kèhù.', 'Tolong kirim ke pelanggan.')] }),
  lesson('CHN-WRK-002', 'work', '今天能完成吗？', 'Jīntiān néng wánchéng ma?', '确认工作是否能在当天完成，适合项目、生产和办公室任务。', [line('中国同事', '今天能完成吗？', 'Jīntiān néng wánchéng ma?', 'Apakah bisa selesai hari ini?'), line('印尼同事', '可以，下午发给你。', 'Kěyǐ, xiàwǔ fā gěi nǐ.', 'Bisa, sore saya kirim kepada Anda.')], [vocab('今天', 'jīntiān', 'hari ini'), vocab('完成', 'wánchéng', 'menyelesaikan')], [vocab('进度表', 'jìndù biǎo', 'tabel progres')], { chinese: '……能完成吗？', pinyin: '… néng wánchéng ma?', indonesian: 'Apakah … bisa selesai?', examples: [line('中国同事', '这个订单能完成吗？', 'Zhège dìngdān néng wánchéng ma?', 'Apakah pesanan ini bisa selesai?'), line('中国同事', '报告能完成吗？', 'Bàogào néng wánchéng ma?', 'Apakah laporan bisa selesai?')] }),
  lesson('CHN-WRK-003', 'work', '请发给客户。', 'Qǐng fā gěi kèhù.', '文件、报价或资料确认后，需要明确下一步发给谁。', [line('中国同事', '确认以后，请发给客户。', 'Quèrèn yǐhòu, qǐng fā gěi kèhù.', 'Setelah dikonfirmasi, tolong kirim ke pelanggan.'), line('印尼同事', '好的，我现在发。', 'Hǎo de, wǒ xiànzài fā.', 'Baik, saya kirim sekarang.')], [vocab('发给', 'fā gěi', 'mengirim kepada'), vocab('客户', 'kèhù', 'pelanggan')], [vocab('邮件', 'yóujiàn', 'email')], { chinese: '请发给 + 对象。', pinyin: 'Qǐng fā gěi + duìxiàng.', indonesian: 'Tolong kirim kepada + pihak.', examples: [line('中国同事', '请发给王经理。', 'Qǐng fā gěi Wáng jīnglǐ.', 'Tolong kirim kepada Manajer Wang.'), line('中国同事', '请发给财务部。', 'Qǐng fā gěi cáiwù bù.', 'Tolong kirim ke bagian keuangan.')] }),
  lesson('CHN-WRK-004', 'work', '我们三点开会。', 'Wǒmen sān diǎn kāihuì.', '安排会议时，说明时间和活动最清楚。', [line('中国同事', '我们三点开会。', 'Wǒmen sān diǎn kāihuì.', 'Kita rapat jam tiga.'), line('印尼同事', '在哪个会议室？', 'Zài nǎge huìyìshì?', 'Di ruang rapat yang mana?')], [vocab('三点', 'sān diǎn', 'jam tiga'), vocab('开会', 'kāihuì', 'rapat')], [vocab('会议室', 'huìyìshì', 'ruang rapat')], { chinese: '我们 + 时间 + 动作。', pinyin: 'Wǒmen + shíjiān + dòngzuò.', indonesian: 'Kita + waktu + kegiatan.', examples: [line('中国同事', '我们两点出发。', 'Wǒmen liǎng diǎn chūfā.', 'Kita berangkat jam dua.'), line('中国同事', '我们明天开会。', 'Wǒmen míngtiān kāihuì.', 'Kita rapat besok.')] }),
  lesson('CHN-WRK-005', 'work', '有问题马上告诉我。', 'Yǒu wèntí mǎshàng gàosu wǒ.', '需要同事及时上报问题时，这句话直接且清楚。', [line('中国同事', '有问题马上告诉我。', 'Yǒu wèntí mǎshàng gàosu wǒ.', 'Kalau ada masalah, langsung beri tahu saya.'), line('印尼同事', '好的，我会马上说。', 'Hǎo de, wǒ huì mǎshàng shuō.', 'Baik, saya akan langsung memberi tahu.')], [vocab('问题', 'wèntí', 'masalah'), vocab('马上', 'mǎshàng', 'segera')], [vocab('手机', 'shǒujī', 'ponsel')], { chinese: '有问题 + 动词。', pinyin: 'Yǒu wèntí + dòngcí.', indonesian: 'Kalau ada masalah, + kata kerja.', examples: [line('中国同事', '有问题给我打电话。', 'Yǒu wèntí gěi wǒ dǎ diànhuà.', 'Kalau ada masalah, telepon saya.'), line('中国同事', '有问题先停一下。', 'Yǒu wèntí xiān tíng yíxià.', 'Kalau ada masalah, berhenti dulu.')] }),
];

const bossRows: Array<[string, string, string, string, string]> = [
  ['今天把这个文件发给客户。', 'Jīntiān bǎ zhège wénjiàn fā gěi kèhù.', 'Hari ini kirim dokumen ini kepada pelanggan.', '文件', 'wénjiàn'],
  ['这个事情你先处理。', 'Zhège shìqing nǐ xiān chǔlǐ.', 'Kamu tangani hal ini dulu.', '处理', 'chǔlǐ'],
  ['明天上午给我回复。', 'Míngtiān shàngwǔ gěi wǒ huífù.', 'Besok pagi beri saya jawaban.', '回复', 'huífù'],
  ['这个订单比较急。', 'Zhège dìngdān bǐjiào jí.', 'Pesanan ini cukup mendesak.', '订单', 'dìngdān'],
  ['你先确认一下数量。', 'Nǐ xiān quèrèn yíxià shùliàng.', 'Kamu konfirmasi jumlahnya dulu.', '数量', 'shùliàng'],
  ['下午三点之前完成。', 'Xiàwǔ sān diǎn zhīqián wánchéng.', 'Selesaikan sebelum jam tiga sore.', '之前', 'zhīqián'],
  ['这个客户很重要。', 'Zhège kèhù hěn zhòngyào.', 'Pelanggan ini sangat penting.', '重要', 'zhòngyào'],
  ['先不要发出去。', 'Xiān bú yào fā chūqu.', 'Jangan kirim dulu.', '不要', 'bú yào'],
  ['你再检查一遍。', 'Nǐ zài jiǎnchá yí biàn.', 'Kamu cek sekali lagi.', '检查', 'jiǎnchá'],
  ['今天的进度怎么样？', 'Jīntiān de jìndù zěnmeyàng?', 'Bagaimana progres hari ini?', '进度', 'jìndù'],
  ['这个问题谁负责？', 'Zhège wèntí shéi fùzé?', 'Siapa yang bertanggung jawab atas masalah ini?', '负责', 'fùzé'],
  ['先和客户确认时间。', 'Xiān hé kèhù quèrèn shíjiān.', 'Konfirmasi waktu dengan pelanggan dulu.', '时间', 'shíjiān'],
  ['把报告发到群里。', 'Bǎ bàogào fā dào qún lǐ.', 'Kirim laporan ke grup.', '报告', 'bàogào'],
  ['这个价格可以再谈。', 'Zhège jiàgé kěyǐ zài tán.', 'Harga ini masih bisa dinegosiasikan.', '价格', 'jiàgé'],
  ['今天先把样品做好。', 'Jīntiān xiān bǎ yàngpǐn zuò hǎo.', 'Hari ini selesaikan sampelnya dulu.', '样品', 'yàngpǐn'],
  ['请安排一下会议室。', 'Qǐng ānpái yíxià huìyìshì.', 'Tolong atur ruang rapat.', '安排', 'ānpái'],
  ['这个月要控制成本。', 'Zhège yuè yào kòngzhì chéngběn.', 'Bulan ini harus mengendalikan biaya.', '成本', 'chéngběn'],
  ['你跟进一下这个客户。', 'Nǐ gēnjìn yíxià zhège kèhù.', 'Kamu tindak lanjuti pelanggan ini.', '跟进', 'gēnjìn'],
  ['有变化及时告诉我。', 'Yǒu biànhuà jíshí gàosu wǒ.', 'Kalau ada perubahan, segera beri tahu saya.', '变化', 'biànhuà'],
  ['明天早上开会。', 'Míngtiān zǎoshang kāihuì.', 'Besok pagi rapat.', '早上', 'zǎoshang'],
];
const boss100 = bossRows.map(([title, pinyin, indo, term, termPinyin], index) => lesson(`CHN-BOS-${String(index + 1).padStart(3, '0')}`, 'boss100', title, pinyin, '中国老板在办公室、工厂或客户沟通中交代工作时会说的高频句子。', [line('中国同事', title, pinyin, indo), line('印尼同事', '好的，我马上处理。', 'Hǎo de, wǒ mǎshàng chǔlǐ.', 'Baik, saya segera tangani.')], [vocab(term, termPinyin, indo), vocab('好的', 'hǎo de', 'baik')], [vocab('电脑', 'diànnǎo', 'komputer')], { chinese: '……，我马上处理。', pinyin: '…, wǒ mǎshàng chǔlǐ.', indonesian: '…, saya segera tangani.', examples: [line('印尼同事', '好的，我马上确认。', 'Hǎo de, wǒ mǎshàng quèrèn.', 'Baik, saya segera konfirmasi.'), line('印尼同事', '好的，我马上发。', 'Hǎo de, wǒ mǎshàng fā.', 'Baik, saya segera kirim.')] }));

const replyRows: Array<[string, string, string, string, string]> = [
  ['好的，我马上处理。', 'Hǎo de, wǒ mǎshàng chǔlǐ.', 'Baik, saya segera tangani.', '马上', 'mǎshàng'],
  ['好的，我现在去做。', 'Hǎo de, wǒ xiànzài qù zuò.', 'Baik, saya kerjakan sekarang.', '现在', 'xiànzài'],
  ['我已经发给客户了。', 'Wǒ yǐjīng fā gěi kèhù le.', 'Saya sudah mengirimkannya kepada pelanggan.', '已经', 'yǐjīng'],
  ['我正在确认。', 'Wǒ zhèngzài quèrèn.', 'Saya sedang mengonfirmasi.', '正在', 'zhèngzài'],
  ['我下午给您回复。', 'Wǒ xiàwǔ gěi nín huífù.', 'Saya akan memberi jawaban sore ini.', '下午', 'xiàwǔ'],
  ['这个问题我来处理。', 'Zhège wèntí wǒ lái chǔlǐ.', 'Saya yang akan menangani masalah ini.', '我来', 'wǒ lái'],
  ['数量已经确认了。', 'Shùliàng yǐjīng quèrèn le.', 'Jumlahnya sudah dikonfirmasi.', '数量', 'shùliàng'],
  ['客户还没有回复。', 'Kèhù hái méiyǒu huífù.', 'Pelanggan belum memberi jawaban.', '还没有', 'hái méiyǒu'],
  ['我再检查一遍。', 'Wǒ zài jiǎnchá yí biàn.', 'Saya akan cek sekali lagi.', '再', 'zài'],
  ['今天可以完成。', 'Jīntiān kěyǐ wánchéng.', 'Bisa selesai hari ini.', '可以', 'kěyǐ'],
  ['这个需要一点时间。', 'Zhège xūyào yìdiǎn shíjiān.', 'Ini butuh sedikit waktu.', '需要', 'xūyào'],
  ['我已经跟客户说了。', 'Wǒ yǐjīng gēn kèhù shuō le.', 'Saya sudah memberi tahu pelanggan.', '跟', 'gēn'],
  ['我现在发到群里。', 'Wǒ xiànzài fā dào qún lǐ.', 'Saya kirim ke grup sekarang.', '群', 'qún'],
  ['我先确认一下。', 'Wǒ xiān quèrèn yíxià.', 'Saya konfirmasi dulu.', '先', 'xiān'],
  ['样品已经准备好了。', 'Yàngpǐn yǐjīng zhǔnbèi hǎo le.', 'Sampelnya sudah siap.', '准备好', 'zhǔnbèi hǎo'],
  ['我会跟进这个事情。', 'Wǒ huì gēnjìn zhège shìqing.', 'Saya akan tindak lanjuti hal ini.', '会', 'huì'],
  ['今天可能来不及。', 'Jīntiān kěnéng lái bu jí.', 'Hari ini mungkin tidak sempat.', '来不及', 'lái bu jí'],
  ['我需要和主管确认。', 'Wǒ xūyào hé zhǔguǎn quèrèn.', 'Saya perlu konfirmasi dengan atasan.', '主管', 'zhǔguǎn'],
  ['有问题我马上告诉您。', 'Yǒu wèntí wǒ mǎshàng gàosu nín.', 'Kalau ada masalah saya segera beri tahu Anda.', '告诉', 'gàosu'],
  ['明天早上我再跟进。', 'Míngtiān zǎoshang wǒ zài gēnjìn.', 'Besok pagi saya tindak lanjuti lagi.', '明天', 'míngtiān'],
];
const reply100 = replyRows.map(([title, pinyin, indo, term, termPinyin], index) => lesson(`CHN-REP-${String(index + 1).padStart(3, '0')}`, 'reply100', title, pinyin, '印尼员工向中国同事确认进度、承诺行动或说明状态时最实用的回复。', [line('中国同事', '这个事情怎么样了？', 'Zhège shìqing zěnmeyàng le?', 'Bagaimana perkembangan hal ini?'), line('印尼同事', title, pinyin, indo)], [vocab(term, termPinyin, indo), vocab('事情', 'shìqing', 'hal / urusan')], [vocab('手机', 'shǒujī', 'ponsel')], { chinese: '我 + 动词 + 了。', pinyin: 'Wǒ + dòngcí + le.', indonesian: 'Saya sudah + kata kerja.', examples: [line('印尼同事', '我已经发了。', 'Wǒ yǐjīng fā le.', 'Saya sudah mengirim.'), line('印尼同事', '我已经确认了。', 'Wǒ yǐjīng quèrèn le.', 'Saya sudah mengonfirmasi.')] }));

export function getChineseExperiences() { return [...meet, ...daily, ...work, ...boss100, ...reply100]; }
export function getChineseExperience(id: string) { return getChineseExperiences().find((item) => item.id === id); }
