export type SocialExperience = {
  id: string;
  category: 'kenalan' | 'obrolan-santai' | 'ngopi-makan' | 'budaya';
  task: string;
  chinese: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  momentTitle?: string;
  insight?: { indonesian: string; chinese: string };
};

const experience = (
  id: string,
  category: SocialExperience['category'],
  task: string,
  indonesian: string,
  explanation: string,
  harvest: string[],
): SocialExperience => ({ id, category, task, chinese: task, indonesian, explanation, harvest });

const socialExperiences: SocialExperience[] = [
  experience('EXP-SOC-001', 'kenalan', '很高兴认识你。', 'Senang kenal sama kamu.', '第一次认识对方时，用一句简短友好的话表达高兴。', ['senang（高兴）', 'kenal（认识）', 'sama kamu（和你）']),
  experience('EXP-SOC-002', 'kenalan', '我叫李建，你叫什么名字？', 'Nama saya Li Jian. Nama kamu siapa?', '初次见面时，先介绍自己的名字，再自然地询问对方姓名。', ['nama saya（我的名字是）', 'nama kamu（你的名字）', 'siapa（谁、什么名字）']),
  experience('EXP-SOC-003', 'kenalan', '我来自中国。', 'Saya dari Tiongkok.', '介绍自己的国家来源时使用。', ['saya（我）', 'dari（来自）', 'Tiongkok（中国）']),
  experience('EXP-SOC-004', 'kenalan', '我刚来印尼不久。', 'Saya baru datang ke Indonesia belum lama.', '和新认识的人说明自己到印尼时间不长时使用。', ['baru datang（刚来到）', 'Indonesia（印尼）', 'belum lama（不久）']),
  experience('EXP-SOC-005', 'kenalan', '你住在哪里？', 'Kamu tinggal di mana?', '聊天时礼貌了解对方居住区域的简单问法。', ['kamu（你）', 'tinggal（居住）', 'di mana（在哪里）']),
  experience('EXP-SOC-006', 'kenalan', '你在这里工作吗？', 'Kamu kerja di sini?', '在办公室、社区或活动现场认识人时，询问对方是否在此工作。', ['kerja（工作）', 'di sini（在这里）', 'kamu（你）']),
  experience('EXP-SOC-007', 'kenalan', '你会说中文吗？', 'Kamu bisa bahasa Mandarin?', '想确认对方是否会说中文时使用。', ['bisa（会、可以）', 'bahasa Mandarin（中文）', 'kamu（你）']),
  experience('EXP-SOC-008', 'kenalan', '可以加你的 WhatsApp 吗？', 'Boleh minta WhatsApp kamu?', '想交换联系方式时使用，语气自然且尊重。', ['boleh（可以吗）', 'minta（要、请求）', 'WhatsApp kamu（你的 WhatsApp）']),
  experience('EXP-SOC-009', 'kenalan', '以后有空一起喝咖啡吧。', 'Kalau ada waktu, nanti kita ngopi bareng ya.', '认识后想自然表达以后可以一起喝咖啡时使用。', ['kalau ada waktu（如果有时间）', 'ngopi（喝咖啡）', 'bareng（一起）']),
  experience('EXP-SOC-010', 'kenalan', '希望以后还能见到你。', 'Semoga nanti kita bisa ketemu lagi.', '告别时希望未来再次见面的友好表达。', ['semoga（希望）', 'ketemu lagi（再见面）', 'nanti（以后、之后）']),

  experience('EXP-SOC-011', 'obrolan-santai', '今天忙吗？', 'Hari ini sibuk?', '和同事、朋友见面时，简单关心对方当天是否忙。', ['hari ini（今天）', 'sibuk（忙）', 'kamu（你）']),
  experience('EXP-SOC-012', 'obrolan-santai', '吃饭了吗？', 'Sudah makan belum?', '印尼日常很常见的轻松问候方式。', ['sudah（已经）', 'makan（吃饭）', 'belum（还没）']),
  experience('EXP-SOC-013', 'obrolan-santai', '最近怎么样？', 'Akhir-akhir ini gimana?', '一段时间没聊天后，用来关心对方近况。', ['akhir-akhir ini（最近）', 'gimana（怎么样）', 'kamu（你）']),
  experience('EXP-SOC-014', 'obrolan-santai', '今天工作怎么样？', 'Kerja hari ini gimana?', '和同事或朋友聊天时，询问当天工作情况。', ['kerja（工作）', 'hari ini（今天）', 'gimana（怎么样）']),
  experience('EXP-SOC-015', 'obrolan-santai', '周末有什么计划？', 'Akhir pekan ada rencana apa?', '轻松聊天时，询问对方周末安排。', ['akhir pekan（周末）', 'ada（有）', 'rencana（计划）']),
  experience('EXP-SOC-016', 'obrolan-santai', '今天很热。', 'Hari ini panas banget ya.', '天气炎热时自然开启聊天的话题。', ['hari ini（今天）', 'panas（热）', 'banget（非常）']),
  experience('EXP-SOC-017', 'obrolan-santai', '今天堵车严重吗？', 'Hari ini macet parah nggak?', '通勤或见面时，询问当天路况。', ['hari ini（今天）', 'macet（堵车）', 'parah（严重）']),
  experience('EXP-SOC-018', 'obrolan-santai', '最近在忙什么？', 'Belakangan ini lagi sibuk apa?', '和熟人聊天时，询问对方最近主要在做什么。', ['belakangan ini（最近）', 'lagi sibuk（正在忙）', 'apa（什么）']),
  experience('EXP-SOC-019', 'obrolan-santai', '好久不见。', 'Sudah lama nggak ketemu.', '一段时间没见面后最常用的自然开场。', ['sudah lama（很久）', 'nggak（不）', 'ketemu（见面）']),
  experience('EXP-SOC-020', 'obrolan-santai', '和你聊天很开心。', 'Senang ngobrol sama kamu.', '在愉快聊天后，表达自己很开心。', ['senang（开心）', 'ngobrol（聊天）', 'sama kamu（和你）']),

  experience('EXP-SOC-021', 'ngopi-makan', '一起喝咖啡吗？', 'Mau ngopi bareng?', '邀请朋友轻松喝咖啡时使用。', ['mau（想要）', 'ngopi（喝咖啡）', 'bareng（一起）']),
  experience('EXP-SOC-022', 'ngopi-makan', '一起吃饭吧。', 'Kita makan bareng yuk.', '自然邀请对方一起吃饭。', ['kita（我们）', 'makan（吃饭）', 'bareng（一起）', 'yuk（走吧、一起吧）']),
  experience('EXP-SOC-023', 'ngopi-makan', '今天晚上有空吗？', 'Malam ini kamu ada waktu?', '想约对方在当晚见面前，先询问是否有时间。', ['malam ini（今天晚上）', 'ada waktu（有时间）', 'kamu（你）']),
  experience('EXP-SOC-024', 'ngopi-makan', '你想吃什么？', 'Kamu mau makan apa?', '决定吃饭地点前，询问对方想吃什么。', ['kamu（你）', 'mau（想要）', 'makan apa（吃什么）']),
  experience('EXP-SOC-025', 'ngopi-makan', '我知道一家不错的餐厅。', 'Saya tahu restoran yang enak.', '推荐自己知道的一家好餐厅时使用。', ['saya tahu（我知道）', 'restoran（餐厅）', 'enak（好吃、不错）']),
  experience('EXP-SOC-026', 'ngopi-makan', '今天我请客。', 'Hari ini saya yang traktir ya.', '想主动请客时，使用轻松友好的说法。', ['hari ini（今天）', 'saya yang（我来）', 'traktir（请客）']),
  experience('EXP-SOC-027', 'ngopi-makan', '你什么时候有空？', 'Kamu kapan ada waktu?', '想另约时间时，询问对方什么时候方便。', ['kamu（你）', 'kapan（什么时候）', 'ada waktu（有时间）']),
  experience('EXP-SOC-028', 'ngopi-makan', '我已经订好位置了。', 'Saya sudah reservasi tempat.', '约饭前已订好座位时告诉对方。', ['saya（我）', 'sudah（已经）', 'reservasi（预订）', 'tempat（位置）']),
  experience('EXP-SOC-029', 'ngopi-makan', '谢谢你今天陪我。', 'Terima kasih sudah menemani saya hari ini.', '当天见面结束后，感谢对方陪伴。', ['terima kasih（谢谢）', 'menemani（陪伴）', 'hari ini（今天）']),
  experience('EXP-SOC-030', 'ngopi-makan', '下次我们再一起出来吧。', 'Lain kali kita jalan bareng lagi ya.', '结束聚会时，友好地表示下次还可以再一起出来。', ['lain kali（下次）', 'jalan bareng（一起出来）', 'lagi（再一次）']),

  experience('EXP-SOC-031', 'budaya', '吃饭了吗？', 'Sudah makan belum?', '印尼人见面时常用这句话开启轻松聊天。', ['sudah（已经）', 'makan（吃饭）', 'belum（还没）']),
  experience('EXP-SOC-032', 'budaya', '你结婚了吗？', 'Kamu sudah menikah?', '认识不久时，对方有时会直接询问婚姻状况。', ['kamu（你）', 'sudah（已经）', 'menikah（结婚）']),
  experience('EXP-SOC-033', 'budaya', '没关系。', 'Nggak apa-apa.', '对方道歉或出现小问题时，可以用这句安抚对方。', ['nggak（不）', 'apa-apa（什么事）', 'nggak apa-apa（没关系）']),
  experience('EXP-SOC-034', 'budaya', 'Wkwkwk 是什么意思？', 'Wkwkwk itu artinya tertawa.', '在聊天文字里看到 Wkwkwk 时，用来了解它的真实含义。', ['wkwkwk（笑声）', 'artinya（意思是）', 'tertawa（笑）']),
  experience('EXP-SOC-035', 'budaya', '再吃一点吧。', 'Makan lagi ya.', '主人或同事继续劝你吃东西时常说。', ['makan（吃）', 'lagi（再）', 'ya（语气词）']),
  experience('EXP-SOC-036', 'budaya', '请吃吧。', 'Silakan, makan ya.', '主人把食物递给你或请你先吃时使用。', ['silakan（请）', 'makan（吃）', 'ya（语气词）']),
  experience('EXP-SOC-037', 'budaya', '不好意思，我已经饱了。', 'Maaf, saya sudah kenyang.', '想礼貌地拒绝继续吃食物时使用。', ['maaf（不好意思）', 'saya（我）', 'sudah kenyang（已经饱了）']),
  experience('EXP-SOC-038', 'budaya', '先生，可以问一下吗？', 'Pak, boleh tanya sebentar?', '与年长男性或职场男性礼貌交谈时，可用 Pak 称呼。', ['Pak（先生）', 'boleh（可以吗）', 'tanya sebentar（问一下）']),
  experience('EXP-SOC-039', 'budaya', '女士，这是您的吗？', 'Bu, ini punya Ibu?', '与年长女性或职场女性礼貌交谈时，可用 Bu 称呼。', ['Bu（女士）', 'ini（这个）', 'punya Ibu（是您的吗）']),
  experience('EXP-SOC-040', 'budaya', '大哥，可以帮个忙吗？', 'Mas, boleh minta tolong?', '与年轻男性服务人员或熟人交谈时，Mas 是自然称呼。', ['Mas（大哥）', 'boleh（可以吗）', 'minta tolong（请帮忙）']),
  experience('EXP-SOC-041', 'budaya', '小姐，这是您点的吗？', 'Mbak, ini pesanannya?', '与年轻女性服务人员或熟人交谈时，Mbak 是自然称呼。', ['Mbak（小姐）', 'ini（这个）', 'pesanannya（点的餐、订单）']),
  experience('EXP-SOC-042', 'budaya', '我在路上了。', 'Saya OTW ya.', '要去见面地点时，通过聊天告诉对方自己正在路上。', ['saya（我）', 'OTW（在路上）', 'ya（语气词）']),
  experience('EXP-SOC-043', 'budaya', '放轻松。', 'Santai aja.', '对方紧张或事情不需要太着急时使用。', ['santai（放松）', 'aja（就、即可）', 'santai aja（放轻松）']),
  experience('EXP-SOC-044', 'budaya', '等一下再说吧。', 'Nanti dulu ya.', '现在不方便决定或回答时，礼貌地请对方稍后再谈。', ['nanti（等一下、之后）', 'dulu（先）', 'nanti dulu（稍后再说）']),
  experience('EXP-SOC-045', 'budaya', '好的，之后我告诉你。', 'Iya, nanti saya kabari.', '暂时还没有确定消息时，承诺稍后通知对方。', ['iya（好的）', 'nanti（之后）', 'kabari（通知）']),
  experience('EXP-SOC-046', 'budaya', '空手去不太好。', 'Nggak enak kalau datang kosong tangan.', '去别人家做客时，表达不想空手前往的想法。', ['nggak enak（不太好意思）', 'datang（去、到）', 'kosong tangan（空手）']),
  experience('EXP-SOC-047', 'budaya', '可以一起拍照吗？', 'Boleh foto bareng?', '聚会或活动结束时，想和大家合影可以这样问。', ['boleh（可以吗）', 'foto（拍照）', 'bareng（一起）']),
  experience('EXP-SOC-048', 'budaya', '我先告辞回去了。', 'Saya izin pulang dulu ya.', '聚会结束准备先离开时，礼貌地向大家告辞。', ['izin（告辞、请允许）', 'pulang（回去）', 'dulu（先）']),
  experience('EXP-SOC-049', 'budaya', '路上小心。', 'Hati-hati di jalan ya.', '对方离开或回家时，常用的关心告别语。', ['hati-hati（小心）', 'di jalan（在路上）', 'ya（语气词）']),
  experience('EXP-SOC-050', 'budaya', '谢谢你邀请我。', 'Terima kasih, sudah mengundang saya.', '参加聚会或到别人家做客时，感谢对方邀请。', ['terima kasih（谢谢）', 'sudah（已经）', 'mengundang（邀请）']),
];

const socialEnhancements: Record<string, Required<Pick<SocialExperience, 'momentTitle' | 'insight'>>> = {
  'EXP-SOC-001': { momentTitle: '第一次见面', insight: { indonesian: 'Senyum dan satu kalimat sederhana biasanya sudah cukup untuk membuka perkenalan.', chinese: '初次见面时，微笑加上一句简单问候，通常就足够自然。' } },
  'EXP-SOC-002': { momentTitle: '交换姓名', insight: { indonesian: 'Menyebut nama sendiri dulu membuat pertanyaan tentang nama lawan bicara terasa lebih santai.', chinese: '先介绍自己的名字，再问对方姓名，会更自然。' } },
  'EXP-SOC-003': { momentTitle: '介绍来自哪里', insight: { indonesian: 'Asal negara sering menjadi pembuka percakapan yang ringan saat baru berkenalan.', chinese: '刚认识时，来自哪个国家常常是轻松的聊天开场。' } },
  'EXP-SOC-004': { momentTitle: '刚到印尼', insight: { indonesian: 'Orang biasanya akan memberi saran atau bertanya lebih lanjut setelah mendengar kamu baru datang.', chinese: '对方知道你刚到印尼后，常会主动给建议或继续关心。' } },
  'EXP-SOC-005': { momentTitle: '聊居住区域', insight: { indonesian: 'Pertanyaan ini biasanya untuk mengetahui area, bukan meminta alamat lengkap.', chinese: '这句话通常是想知道你住在哪个区域，不是在索要详细地址。' } },
  'EXP-SOC-006': { momentTitle: '认识同事', insight: { indonesian: 'Di kantor atau acara, pertanyaan singkat tentang kerja membantu menemukan topik bersama.', chinese: '在办公室或活动中，简单聊工作很容易找到共同话题。' } },
  'EXP-SOC-007': { momentTitle: '聊语言', insight: { indonesian: 'Pertanyaan tentang bahasa sering berasal dari rasa ingin tahu, bukan ujian kemampuan.', chinese: '别人问你会不会中文，多半是出于好奇，不是在考你。' } },
  'EXP-SOC-008': { momentTitle: '交换联系方式', insight: { indonesian: 'WhatsApp adalah cara paling umum untuk bertukar kontak di Indonesia.', chinese: 'WhatsApp 是印尼最常见的交换联系方式方式。' } },
  'EXP-SOC-009': { momentTitle: '轻松邀约', insight: { indonesian: 'Ngopi bersama adalah ajakan santai dan tidak otomatis berarti kencan.', chinese: '一起喝咖啡是轻松邀请，并不自动代表约会。' } },
  'EXP-SOC-010': { momentTitle: '友好告别', insight: { indonesian: 'Kalimat ini hangat tetapi tetap sopan untuk teman baru maupun rekan kerja.', chinese: '这句话亲切但不过界，适合新朋友或同事。' } },
  'EXP-SOC-011': { momentTitle: '见面问候', insight: { indonesian: 'Menanyakan kesibukan adalah pembuka obrolan yang aman di lingkungan kerja.', chinese: '问忙不忙是在工作环境里很安全的开场。' } },
  'EXP-SOC-012': { momentTitle: '吃饭问候', insight: { indonesian: '“Sudah makan belum?” sering menjadi sapaan ramah, bukan ajakan makan yang sebenarnya.', chinese: '“吃饭了吗？”常常只是友好问候，不一定真的在邀请你吃饭。' } },
  'EXP-SOC-013': { momentTitle: '关心近况', insight: { indonesian: 'Gunakan setelah beberapa waktu tidak mengobrol agar terdengar hangat dan alami.', chinese: '一段时间没聊天后用这句，会显得自然又关心对方。' } },
  'EXP-SOC-014': { momentTitle: '聊当天工作', insight: { indonesian: 'Pertanyaan singkat ini memberi ruang bagi lawan bicara untuk berbagi seperlunya.', chinese: '这个简短问题让对方可以按自己意愿分享当天工作。' } },
  'EXP-SOC-015': { momentTitle: '聊周末', insight: { indonesian: 'Rencana akhir pekan adalah topik ringan yang tidak terlalu pribadi.', chinese: '周末计划是轻松且不太私人的聊天话题。' } },
  'EXP-SOC-016': { momentTitle: '聊天气', insight: { indonesian: 'Cuaca panas adalah topik bersama yang sangat mudah dipakai untuk membuka obrolan.', chinese: '天气热是很容易引起共鸣的聊天开场。' } },
  'EXP-SOC-017': { momentTitle: '聊堵车', insight: { indonesian: 'Macet adalah pengalaman sehari-hari yang banyak orang Jakarta pahami.', chinese: '堵车是很多雅加达人每天都能共鸣的话题。' } },
  'EXP-SOC-018': { momentTitle: '问最近在忙什么', insight: { indonesian: '“Lagi” membuat pertanyaan terdengar seperti menanyakan kegiatan yang sedang berlangsung.', chinese: '“lagi”让问题更像是在问对方最近正在忙什么。' } },
  'EXP-SOC-019': { momentTitle: '久别重逢', insight: { indonesian: 'Kalimat ini bisa dipakai untuk teman, tetangga, atau rekan yang sudah lama tidak ditemui.', chinese: '这句话可用于久未见面的朋友、邻居或同事。' } },
  'EXP-SOC-020': { momentTitle: '愉快聊天后', insight: { indonesian: 'Ungkapan ini menunjukkan penghargaan pada percakapan tanpa memberi makna romantis.', chinese: '这句话表达你珍惜聊天本身，并不带暧昧含义。' } },
  'EXP-SOC-021': { momentTitle: '约喝咖啡', insight: { indonesian: 'Ngopi adalah kegiatan sosial yang sangat umum dan santai di Indonesia.', chinese: '喝咖啡是印尼非常常见、很轻松的社交活动。' } },
  'EXP-SOC-022': { momentTitle: '约吃饭', insight: { indonesian: '“Yuk” membuat ajakan terdengar hangat dan tidak terlalu formal.', chinese: '“yuk”让邀请听起来亲切、不正式。' } },
  'EXP-SOC-023': { momentTitle: '确认晚上时间', insight: { indonesian: 'Tanyakan ketersediaan dulu sebelum mengusulkan tempat atau kegiatan.', chinese: '在提出地点或活动前，先确认对方是否有空会更尊重。' } },
  'EXP-SOC-024': { momentTitle: '选吃什么', insight: { indonesian: 'Menanyakan pilihan makanan adalah cara sederhana untuk menunjukkan perhatian.', chinese: '询问想吃什么，是简单表达体贴的方式。' } },
  'EXP-SOC-025': { momentTitle: '推荐餐厅', insight: { indonesian: 'Rekomendasi tempat makan sering menjadi alasan alami untuk melanjutkan obrolan.', chinese: '推荐餐厅常常是继续聊天的自然话题。' } },
  'EXP-SOC-026': { momentTitle: '主动请客', insight: { indonesian: 'Kalimat ini cukup santai; tetap beri ruang jika teman ingin berbagi pembayaran.', chinese: '这句话很轻松；如果朋友想分担费用，也应尊重对方。' } },
  'EXP-SOC-027': { momentTitle: '另约时间', insight: { indonesian: 'Pertanyaan terbuka ini memudahkan lawan bicara memilih waktu yang nyaman.', chinese: '这个开放式问题让对方更容易选择方便的时间。' } },
  'EXP-SOC-028': { momentTitle: '已订座位', insight: { indonesian: 'Memberi tahu reservasi lebih awal membantu teman merasa tenang dengan rencana.', chinese: '提前说明已订位，会让对方对安排更安心。' } },
  'EXP-SOC-029': { momentTitle: '见面后感谢', insight: { indonesian: 'Terima kasih setelah bertemu menunjukkan kamu menghargai waktu teman.', chinese: '见面后说谢谢，表示你珍惜朋友付出的时间。' } },
  'EXP-SOC-030': { momentTitle: '下次再见', insight: { indonesian: 'Ajakan ini ramah dan bisa dipakai untuk memperpanjang hubungan pertemanan.', chinese: '这句友好的邀请，适合自然延续朋友关系。' } },
  'EXP-SOC-031': { momentTitle: '见面先问吃饭了吗', insight: { indonesian: '“Sudah makan belum?” sering hanya sapaan hangat, bukan pertanyaan tentang kebutuhan makan.', chinese: '“吃饭了吗？”很多时候只是亲切问候，并不是真的在问你要不要吃饭。' } },
  'EXP-SOC-032': { momentTitle: '被问婚姻状况', insight: { indonesian: 'Pertanyaan tentang status pernikahan bisa muncul lebih cepat daripada di Tiongkok dan sering berasal dari rasa ingin tahu.', chinese: '在印尼，别人可能较早询问婚姻状况，通常只是出于好奇。' } },
  'EXP-SOC-033': { momentTitle: '对方道歉时', insight: { indonesian: '“Nggak apa-apa” membantu meredakan suasana setelah kesalahan kecil.', chinese: '对方因小事道歉时，“没关系”能帮助缓和气氛。' } },
  'EXP-SOC-034': { momentTitle: '聊天里的笑声', insight: { indonesian: '“Wkwkwk” adalah tawa dalam pesan, mirip “哈哈哈”, bukan singkatan formal.', chinese: '“Wkwkwk”是聊天里的笑声，类似“哈哈哈”，不是正式缩写。' } },
  'EXP-SOC-035': { momentTitle: '主人继续劝吃', insight: { indonesian: 'Menawarkan makanan lagi biasanya menunjukkan keramahan; kamu boleh menolak dengan sopan jika sudah kenyang.', chinese: '主人继续劝吃通常是在表示热情；如果吃饱了，可以礼貌拒绝。' } },
  'EXP-SOC-036': { momentTitle: '主人请你吃', insight: { indonesian: '“Silakan” berarti dipersilakan dengan sopan dan sering dipakai saat menyambut tamu.', chinese: '“Silakan”表示礼貌地请你开始，常用于招待客人。' } },
  'EXP-SOC-037': { momentTitle: '礼貌拒绝食物', insight: { indonesian: 'Mengucapkan maaf dan mengatakan sudah kenyang membuat penolakan terdengar tetap hangat.', chinese: '先说不好意思，再说已经吃饱，会让拒绝仍然显得温和。' } },
  'EXP-SOC-038': { momentTitle: '称呼 Pak', insight: { indonesian: 'Pak adalah panggilan hormat untuk laki-laki dewasa, terutama di tempat kerja atau layanan.', chinese: 'Pak 是对成年男性的尊称，尤其常用于职场或服务场景。' } },
  'EXP-SOC-039': { momentTitle: '称呼 Bu', insight: { indonesian: 'Bu adalah panggilan hormat untuk perempuan dewasa, terutama di tempat kerja atau layanan.', chinese: 'Bu 是对成年女性的尊称，尤其常用于职场或服务场景。' } },
  'EXP-SOC-040': { momentTitle: '称呼 Mas', insight: { indonesian: 'Mas adalah panggilan ramah untuk laki-laki muda dan sering dipakai kepada staf layanan.', chinese: 'Mas 是对年轻男性的亲切称呼，常用于服务人员。' } },
  'EXP-SOC-041': { momentTitle: '称呼 Mbak', insight: { indonesian: 'Mbak adalah panggilan ramah untuk perempuan muda dan sering dipakai kepada staf layanan.', chinese: 'Mbak 是对年轻女性的亲切称呼，常用于服务人员。' } },
  'EXP-SOC-042': { momentTitle: '发消息说在路上', insight: { indonesian: 'OTW sangat umum di chat; biasanya berarti sedang menuju tempat, bukan selalu sudah dekat.', chinese: 'OTW 在聊天中很常见，表示正在前往，但不一定已经很近。' } },
  'EXP-SOC-043': { momentTitle: '安慰对方', insight: { indonesian: '“Santai aja” biasanya berarti jangan terlalu tegang atau jangan terlalu dipikirkan.', chinese: '“Santai aja”通常表示别太紧张，也别想得太重。' } },
  'EXP-SOC-044': { momentTitle: '暂时不决定', insight: { indonesian: '“Nanti dulu” adalah cara lembut untuk menunda pembicaraan tanpa menolak secara keras.', chinese: '“Nanti dulu”是委婉延后话题的方式，不是强硬拒绝。' } },
  'EXP-SOC-045': { momentTitle: '稍后通知', insight: { indonesian: '“Kabari” sangat umum di WhatsApp ketika informasi belum siap diberikan sekarang.', chinese: '当消息暂时未定时，WhatsApp 里很常用“kabari”表示稍后通知。' } },
  'EXP-SOC-046': { momentTitle: '去做客不空手', insight: { indonesian: 'Membawa sesuatu yang kecil saat berkunjung sering dianggap sebagai perhatian yang baik.', chinese: '去别人家做客时带一点小礼物，常被视为贴心的举动。' } },
  'EXP-SOC-047': { momentTitle: '活动后合影', insight: { indonesian: 'Meminta foto bersama adalah hal biasa setelah makan, kegiatan, atau pertemuan.', chinese: '吃饭、活动或聚会结束后，邀请合影是很常见的。' } },
  'EXP-SOC-048': { momentTitle: '先行告辞', insight: { indonesian: 'Mengatakan izin pulang membuat kepergianmu terdengar sopan kepada tuan rumah atau kelompok.', chinese: '离开前说先告辞，会让主人或大家感到被尊重。' } },
  'EXP-SOC-049': { momentTitle: '离别关心', insight: { indonesian: '“Hati-hati di jalan” adalah ucapan perpisahan yang sangat umum dan hangat.', chinese: '“路上小心”是非常常见又温暖的告别语。' } },
  'EXP-SOC-050': { momentTitle: '感谢邀请', insight: { indonesian: 'Mengucapkan terima kasih atas undangan membantu menjaga hubungan sosial yang baik.', chinese: '感谢邀请，有助于维持良好的社交关系。' } },
};

export function getSocialExperiences() {
  return socialExperiences.map((experience) => ({ ...experience, ...socialEnhancements[experience.id] }));
}

export function getSocialExperience(id: string) {
  return getSocialExperiences().find((experience) => experience.id === `EXP-SOC-${id}`);
}
