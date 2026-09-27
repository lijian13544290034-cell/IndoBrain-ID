export type LoveToneLevel = 'natural' | 'context' | 'caution';

export type LoveCoreWord = {
  term: string;
  meaning: string;
};

export type LoveDialogueLine = {
  speaker: 'A' | 'B';
  indonesian: string;
  chinese: string;
};

export type LoveFollowUp = {
  indonesian: string;
  chinese: string;
};

export type LoveScene = {
  id: `LOVE-${string}`;
  order: number;
  chapterId: string;
  indonesian: string;
  chinese: string;
  coreWords: LoveCoreWord[];
  explanation: string;
  usageContext: string;
  toneLevel: LoveToneLevel;
  exampleDialogue: LoveDialogueLine[];
  followUps: LoveFollowUp[];
  ttsText: string;
  isFree: true;
  tags: string[];
};

export type LoveChapter = {
  id: string;
  order: number;
  title: string;
  chineseTitle: string;
  range: string;
  description: string;
  usage: string;
  learningFocus: string;
};

export const loveChapters: readonly LoveChapter[] = [
  { id: 'kenalan', order: 1, title: 'Kenalan', chineseTitle: '认识、搭讪', range: 'LOVE-001–LOVE-010', description: '从自然开场到确认对方是否单身。', usage: '刚认识、轻松聊天或礼貌搭话', learningFocus: '学习自然开启对话，并尊重对方回应与边界' },
  { id: 'pdkt', order: 2, title: 'PDKT', chineseTitle: '暧昧、试探', range: 'LOVE-011–LOVE-020', description: '读懂关系升温时的试探与心动。', usage: '关系正在靠近、但尚未正式确定', learningFocus: '理解暧昧阶段的口语暗示与分寸' },
  { id: 'jadian', order: 3, title: 'Jadian', chineseTitle: '确定关系', range: 'LOVE-021–LOVE-030', description: '把喜欢说清楚，确认双方关系。', usage: '确认彼此心意与交往期待', learningFocus: '清楚表达喜欢、认真程度与关系边界' },
  { id: 'manja-kangen', order: 4, title: 'Manja & Kangen', chineseTitle: '想念、撒娇、粘人', range: 'LOVE-031–LOVE-040', description: '亲密聊天里的想念、陪伴与撒娇。', usage: '关系稳定后的日常亲密交流', learningFocus: '听懂亲密口语，同时留意双方是否都觉得舒服' },
  { id: 'cemburu', order: 5, title: 'Cemburu', chineseTitle: '吃醋、前任', range: 'LOVE-041–LOVE-050', description: '谈第三者、前任与吃醋时怎么说。', usage: '询问让自己不安的人际关系', learningFocus: '表达在意但避免把询问变成控制' },
  { id: 'kode-ngambek', order: 6, title: 'Kode & Ngambek', chineseTitle: '暗示、闹脾气', range: 'LOVE-051–LOVE-060', description: '理解暗示、沉默和小情绪背后的语气。', usage: '对方说得含蓄或情绪突然变化', learningFocus: '语言、语气和场景共同决定真实含义' },
  { id: 'berantem', order: 7, title: 'Berantem', chineseTitle: '吵架', range: 'LOVE-061–LOVE-070', description: '冲突中先听清、说清，再留出空间。', usage: '出现误会、争执或需要暂停对话', learningFocus: '降低冲突强度，并清楚表达自己的需要' },
  { id: 'bujuk-baikan', order: 8, title: 'Bujuk & Baikan', chineseTitle: '道歉、哄人、和好', range: 'LOVE-071–LOVE-080', description: '承认错误、修复情绪、重新和好。', usage: '冲突后真诚道歉与修复关系', learningFocus: '用行动和清楚承诺配合道歉' },
  { id: 'hubungan-serius', order: 9, title: 'Hubungan Serius', chineseTitle: '认真交往、未来', range: 'LOVE-081–LOVE-090', description: '聊长期关系、家人、婚姻与共同未来。', usage: '讨论长期期待与双方人生计划', learningFocus: '把“认真”落到具体期待与共同决定上' },
  { id: 'putus-balikan', order: 10, title: 'Putus & Balikan', chineseTitle: '分手、复合', range: 'LOVE-091–LOVE-100', description: '面对变化、分开，以及是否重新开始。', usage: '关系结束、冷静期或考虑复合', learningFocus: '尊重双方决定，不用情绪施压替代沟通' },
] as const;

type Seed = readonly [indonesian: string, chinese: string, term: string, meaning: string, tone?: LoveToneLevel];

const seeds: readonly Seed[] = [
  ['Kamu orang mana?', '你哪里人？', 'orang mana', '哪里人'],
  ['Kamu tinggal di mana?', '你住哪里？', 'tinggal', '居住'],
  ['Kamu sering ke sini?', '你经常来这里吗？', 'sering', '经常'],
  ['Boleh kenalan nggak?', '可以认识一下吗？', 'kenalan', '认识一下、结识'],
  ['Namamu siapa?', '你叫什么名字？', 'namamu', '你的名字'],
  ['Boleh minta IG kamu?', '可以加你的 IG 吗？', 'minta IG', '要对方的 Instagram'],
  ['Kamu datang sama siapa?', '你跟谁一起来的？', 'datang sama', '和……一起来'],
  ['Kamu sendiri aja?', '你一个人吗？', 'sendiri aja', '就一个人'],
  ['Kamu udah punya pacar?', '你有对象了吗？', 'pacar', '男朋友或女朋友'],
  ['Serius masih jomblo?', '真的假的，你还单身？', 'jomblo', '单身'],
  ['Kamu lagi deket sama siapa?', '你最近在跟谁走得很近/暧昧？', 'deket', '走得近、关系暧昧'],
  ['Kok perhatian banget sih?', '你怎么这么关心我啊？', 'perhatian', '关心、体贴'],
  ['Jangan bikin aku geer.', '别让我自作多情。', 'geer', '自我感觉良好、自作多情', 'context'],
  ['Kamu kangen aku nggak?', '你想我没有？', 'kangen', '想念'],
  ['Aku jadi kepikiran kamu.', '我最近老想着你。', 'kepikiran', '一直想到、挂念'],
  ['Aku nyaman ngobrol sama kamu.', '跟你聊天我感觉很舒服/自在。', 'nyaman', '舒服、自在'],
  ['Kok kamu bikin aku nyaman sih?', '你怎么让我越来越觉得跟你在一起很舒服？', 'bikin nyaman', '让人感到自在'],
  ['Jangan terlalu baik sama aku.', '别对我这么好。', 'terlalu baik', '太好了、过于体贴', 'context'],
  ['Nanti aku baper, lho.', '小心我真的走心了哦。', 'baper', '被带动感情、走心', 'context'],
  ['Kamu sebenarnya suka aku nggak sih?', '你到底喜不喜欢我？', 'sebenarnya', '其实、到底', 'context'],
  ['Kita ini sebenarnya apa?', '我们现在到底算什么关系？', 'kita ini apa', '我们算什么关系', 'context'],
  ['Kamu serius sama aku?', '你对我是认真的吗？', 'serius', '认真对待关系', 'context'],
  ['Kamu suka aku nggak?', '你喜欢我吗？', 'suka', '喜欢'],
  ['Aku suka sama kamu.', '我喜欢你。', 'suka sama', '喜欢某人'],
  ['Aku nyaman sama kamu.', '跟你在一起我很自在。', 'nyaman sama', '和某人在一起很自在'],
  ['Mau nggak jadi pacarku?', '愿意做我男/女朋友吗？', 'jadi pacarku', '成为我的对象', 'context'],
  ['Jadi sekarang kita pacaran?', '所以我们现在算谈恋爱了？', 'pacaran', '谈恋爱、交往'],
  ['Aku serius sama kamu.', '我是认真对你的。', 'serius sama', '认真对待某人'],
  ['Jangan kasih aku harapan palsu.', '别给我假希望。', 'harapan palsu', '假希望，也常关联 PHP', 'context'],
  ['Aku nggak mau hubungan yang main-main.', '我不想要玩玩而已的感情。', 'main-main', '不认真、玩玩而已', 'context'],
  ['Aku kangen kamu.', '我想你了。', 'kangen', '日常亲密聊天中常见的想念'],
  ['Kangen banget sama kamu.', '真的好想你。', 'banget', '很、非常'],
  ['Kamu nggak kangen aku?', '你都不想我的吗？', 'nggak kangen', '不想念', 'context'],
  ['Temenin aku dong.', '陪陪我嘛。', 'temenin', '陪伴我'],
  ['Aku pengin ketemu kamu.', '我想见你。', 'pengin ketemu', '想见面'],
  ['Kok kamu manja banget sih?', '你怎么这么会撒娇呀？', 'manja', '撒娇、依赖亲近的人', 'context'],
  ['Kamu nempel terus deh.', '你怎么一直粘着我呀？', 'nempel', '黏着、总在一起', 'context'],
  ['Sok imut banget sih.', '还在这装可爱呢。', 'sok imut', '故意装可爱', 'context'],
  ['Jangan tinggalin aku dong.', '别丢下我嘛。', 'tinggalin', '丢下、离开', 'context'],
  ['Yang, lagi apa?', '宝贝，在干嘛？', 'yang', 'sayang 的亲昵称呼'],
  ['Itu siapa?', '那是谁？', 'itu siapa', '那是谁', 'context'],
  ['Kamu chat sama siapa?', '你在跟谁聊天？', 'chat sama', '和……聊天', 'context'],
  ['Kok dia sering chat kamu?', '他/她怎么老给你发消息？', 'sering chat', '经常发消息', 'context'],
  ['Kamu cemburu ya?', '你吃醋啦？', 'cemburu', '吃醋、嫉妒', 'context'],
  ['Siapa yang cemburu?', '谁吃醋了？我才没有。', 'siapa yang', '谁……了（可带反问语气）', 'context'],
  ['Ngaku aja kalau cemburu.', '吃醋就承认嘛。', 'ngaku', '承认', 'context'],
  ['Jangan bikin aku cemburu dong.', '别让我吃醋嘛。', 'bikin cemburu', '让人吃醋', 'context'],
  ['Kamu masih kontak sama mantan?', '你还跟前任联系？', 'mantan', '前任', 'context'],
  ['Aku sama dia cuma teman.', '我跟他/她只是朋友。', 'cuma teman', '只是朋友'],
  ['Aku cuma sayang kamu.', '我心里只有你。', 'sayang', '爱、在乎，也可作亲昵称呼'],
  ['Aku udah kasih kode, masa kamu nggak ngerti?', '我都暗示这么明显了，你还不懂？', 'kode', '暗示、提示', 'context'],
  ['Kamu tuh nggak peka banget sih.', '你怎么这么不懂我的心思啊？', 'peka', '敏锐、能察觉情绪', 'context'],
  ['Harus aku ngomong langsung?', '非得让我直接说出来吗？', 'ngomong langsung', '直接说出来', 'context'],
  ['Coba peka dikit dong.', '你稍微懂点我的心思嘛。', 'dikit', '一点点', 'context'],
  ['Aku cuma bercanda, jangan baper.', '我只是开玩笑，别当真/别走心。', 'bercanda', '开玩笑', 'context'],
  ['Terserah kamu.', '随便你 / 随你便。', 'terserah', '由你决定；语气可能中性也可能不满', 'context'],
  ['Aku nggak apa-apa kok.', '我没事啊。', 'nggak apa-apa', '没关系、没事', 'context'],
  ['Kok tiba-tiba diem?', '怎么突然不说话了？', 'diem', '口语中的 diam，安静、不说话', 'context'],
  ['Kamu ngambek ya?', '你是不是闹脾气啦？', 'ngambek', '赌气、生闷气、闹小情绪', 'context'],
  ['Aku nggak ngambek kok.', '我才没闹脾气呢。', 'nggak ngambek', '没有闹脾气', 'context'],
  ['Kita ngomong baik-baik ya.', '我们好好说。', 'baik-baik', '好好地、平静地'],
  ['Dengerin aku dulu.', '你先听我说。', 'dengerin', '听一听（口语）', 'context'],
  ['Jangan potong omonganku.', '别打断我说话。', 'potong omongan', '打断别人说话', 'context'],
  ['Bukan gitu maksudku.', '我不是那个意思。', 'maksudku', '我的意思'],
  ['Kamu salah paham.', '你误会了。', 'salah paham', '误会'],
  ['Jangan marah-marah dulu.', '先别发火。', 'marah-marah', '发火、生气地责骂', 'context'],
  ['Kok kamu cari gara-gara sih?', '你怎么还故意找茬啊？', 'cari gara-gara', '找茬、挑起冲突', 'caution'],
  ['Jangan bahas itu lagi.', '别再提这件事了。', 'bahas', '讨论、提起', 'caution'],
  ['Aku lagi nggak mau ngomong.', '我现在不想说话。', 'nggak mau ngomong', '不想说话', 'context'],
  ['Kasih aku waktu sebentar.', '给我一点时间。', 'kasih waktu', '给一点时间'],
  ['Aku salah.', '是我错了。', 'salah', '错、做错'],
  ['Aku minta maaf.', '对不起。', 'minta maaf', '道歉'],
  ['Maafin aku ya.', '原谅我吧。', 'maafin', '原谅（口语）'],
  ['Aku nggak bermaksud bikin kamu sedih.', '我不是故意让你难过的。', 'nggak bermaksud', '并非有意'],
  ['Aku janji nggak gitu lagi.', '我保证以后不这样了。', 'janji', '承诺'],
  ['Jangan ngambek lagi dong.', '别再闹脾气了嘛。', 'ngambek lagi', '再次赌气或闹情绪', 'context'],
  ['Sini, aku bujuk.', '来，我哄你。', 'bujuk', '哄、劝慰'],
  ['Gimana biar kamu nggak marah lagi?', '我要怎么做你才能不生气？', 'gimana biar', '怎样才能'],
  ['Kita baikan ya?', '我们和好吧？', 'baikan', '仍在关系中，吵架后和好'],
  ['Peluk dulu sini.', '来，先抱一下。', 'peluk', '拥抱', 'context'],
  ['Kamu serius sama aku?', '你对我是认真的吗？', 'serius', '对长期关系认真', 'context'],
  ['Aku nggak mau cuma main-main.', '我不想只是玩玩。', 'cuma main-main', '只是玩玩、不认真', 'context'],
  ['Orang tuamu tahu tentang aku?', '你父母知道我吗？', 'orang tua', '父母、长辈', 'context'],
  ['Kapan aku dikenalin ke keluargamu?', '什么时候介绍我给你家人认识？', 'dikenalin', '被介绍认识（口语）', 'context'],
  ['Kamu kepikiran nikah nggak?', '你考虑过结婚吗？', 'nikah', '结婚', 'context'],
  ['Kamu serius sampai nikah?', '你是认真到考虑结婚的吗？', 'sampai nikah', '认真到考虑结婚', 'context'],
  ['Aku pengin hubungan jangka panjang.', '我想要长期稳定的关系。', 'jangka panjang', '长期'],
  ['Kita jalanin pelan-pelan aja.', '我们慢慢发展就好。', 'jalanin', '继续经营、走下去'],
  ['Yang penting kita sama-sama serius.', '最重要的是我们两个人都认真。', 'sama-sama serius', '双方都认真'],
  ['Aku pengin punya masa depan sama kamu.', '我希望未来有你。', 'masa depan', '未来'],
  ['Kamu berubah.', '你变了。', 'berubah', '改变了', 'context'],
  ['Kamu udah nggak sayang aku lagi?', '你已经不爱我了吗？', 'nggak sayang lagi', '不再爱或在乎', 'context'],
  ['Aku capek sama hubungan ini.', '我对这段感情累了。', 'capek', '累、疲惫', 'context'],
  ['Kayaknya kita nggak cocok.', '感觉我们可能不太合适。', 'nggak cocok', '不合适', 'context'],
  ['Aku butuh waktu sendiri.', '我需要一个人静一静。', 'waktu sendiri', '独处的时间', 'context'],
  ['Kita sampai sini aja ya.', '我们就到这里吧。', 'sampai sini aja', '关系到此为止', 'caution'],
  ['Kita putus aja.', '我们分手吧。', 'putus', '分手', 'caution'],
  ['Aku masih sayang kamu.', '我还是爱你/在乎你。', 'masih sayang', '仍然爱、仍然在乎', 'context'],
  ['Kamu masih mau kasih aku kesempatan?', '你还愿意再给我一次机会吗？', 'kasih kesempatan', '给机会', 'context'],
  ['Kita balikan?', '我们复合吗？', 'balikan', '分手后复合', 'context'],
] as const;

const specialExplanations: Partial<Record<number, string>> = {
  14: 'kangen 和 rindu 都可表示“想念”；亲密日常聊天里 kangen 非常常见，rindu 相对更标准、也更抒情。这里用问句轻轻确认对方是否也在想自己。',
  22: '这里的 serius 用于刚要确定关系时，确认对方是否真心想交往，而不是只停留在暧昧。',
  29: 'harapan palsu 是“假希望”；网络口语 PHP（pemberi harapan palsu）常指给人希望却不认真推进关系的人。',
  31: 'kangen 和 rindu 都是“想念”。kangen 在恋人日常聊天中更口语、更常见；rindu 较标准或抒情。',
  56: 'terserah 字面是“由你决定”。它可以真的是让对方选择，也可能带不满或冷淡；不能只凭这一句断言对方在生气。',
  57: 'nggak apa-apa 字面是“没事”。说话人可能真的没事，也可能暂时不想谈；应结合语气、表情和前后文判断，不能武断下结论。',
  59: 'ngambek 多指赌气、生闷气或闹小情绪；marah 更直接表示生气、发火。询问时应保持关心而非指责。',
  66: 'marah 表示生气或发火；与 ngambek 的赌气、沉默或闹情绪不同。marah-marah 强调反复或明显地发火。',
  79: 'baikan 指两个人仍在关系中，吵架后和好；balikan 指已经分手后重新复合。这里是前者。',
  81: '这句与 LOVE-022 文本相同，但剧情阶段不同：这里是在稳定交往后讨论长期承诺与未来，而不是刚确定关系。',
  100: 'balikan 指已经分手后重新复合；baikan 是仍在关系中吵架后和好。复合必须尊重双方意愿，不能用这句话施压。',
};

const specialContexts: Partial<Record<number, string>> = {
  22: '关系刚从暧昧走向正式交往时，用来确认对方是否真心。',
  56: '当对方让你决定时先听语气；若感觉不确定，可以继续问清楚对方的真实想法。',
  57: '对方说“没事”时可温和确认，但也要尊重对方暂时不想谈的空间。',
  67: '争执升级时可能出现，攻击性较强；更稳妥的做法是先暂停，再描述具体行为。',
  81: '稳定交往一段时间后，讨论长期计划、责任与共同未来。',
  96: '用于明确结束关系，分量很重；应在清楚、尊重且安全的情境中表达。',
  97: '最直接的分手表达之一，不宜当作试探、威胁或气话反复使用。',
};

function chapterForOrder(order: number) {
  return loveChapters[Math.floor((order - 1) / 10)];
}

function sceneId(order: number): LoveScene['id'] {
  return `LOVE-${String(order).padStart(3, '0')}`;
}

export const loveScenes: readonly LoveScene[] = seeds.map((seed, index) => {
  const order = index + 1;
  const [indonesian, chinese, term, meaning, toneLevel = 'natural'] = seed;
  const chapter = chapterForOrder(order);
  const chapterStart = (chapter.order - 1) * 10;
  const nextIndex = index === chapterStart + 9 ? index - 1 : index + 1;
  const next = seeds[nextIndex];
  const explanation = specialExplanations[order]
    ?? `“${term}”在这里表示“${meaning}”。${chapter.learningFocus}，真实含义要结合双方关系、语气和前后文判断。`;
  const usageContext = specialContexts[order]
    ?? `${chapter.description} 适合在${chapter.usage}时理解或使用。`;

  return {
    id: sceneId(order),
    order,
    chapterId: chapter.id,
    indonesian,
    chinese,
    coreWords: [{ term, meaning }],
    explanation,
    usageContext,
    toneLevel,
    exampleDialogue: [
      { speaker: 'A', indonesian, chinese },
      { speaker: 'B', indonesian: next[0], chinese: next[1] },
    ],
    followUps: [{ indonesian: next[0], chinese: next[1] }],
    ttsText: indonesian,
    isFree: true,
    tags: ['love', chapter.id, term.toLocaleLowerCase('id-ID')],
  };
});

export const loveSceneById = new Map(loveScenes.map((scene) => [scene.id, scene]));

export function getLoveScenesForChapter(chapterId: string) {
  return loveScenes.filter((scene) => scene.chapterId === chapterId);
}
