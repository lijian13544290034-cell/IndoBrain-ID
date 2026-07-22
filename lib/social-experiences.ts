export type SocialExperience = {
  id: string;
  category: 'kenalan' | 'obrolan-santai' | 'ngopi-makan';
  task: string;
  chinese: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
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
];

export function getSocialExperiences() {
  return socialExperiences;
}

export function getSocialExperience(id: string) {
  return socialExperiences.find((experience) => experience.id === `EXP-SOC-${id}`);
}
