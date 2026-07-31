export type PronunciationExample = {
  word: string;
  chinese: string;
  note: string;
  syllables?: string[];
  vowelCount?: string[];
};

export type PronunciationSection = {
  title: string;
  chineseTitle: string;
  rule: string;
  examples: PronunciationExample[];
};

export type PronunciationLesson = {
  id: number;
  title: string;
  indonesianTitle: string;
  introduction: string;
  sections: PronunciationSection[];
  practice?: { prompt: string; answer: string; chunks?: string[] };
};

export const pronunciationLessons: PronunciationLesson[] = [
  { id: 1, title: '认识印尼语', indonesianTitle: 'Mengenal Bahasa Indonesia', introduction: '印尼语的拼读规则相对稳定。大多数单词可以根据字母和音节尝试读出来；先听标准示范，再大胆开口。', sections: [{ title: 'Mulai dari huruf', chineseTitle: '从字母开始', rule: '看到新单词时，先找元音，再看是否有常见组合音。', examples: [{ word: 'makan', chinese: '吃', note: '两个清晰的音节。', syllables: ['ma', 'kan'] }, { word: 'belajar', chinese: '学习', note: '按自然音节慢慢读。', syllables: ['be', 'la', 'jar'] }, { word: 'selamat', chinese: '你好／祝贺', note: '常见问候语。', syllables: ['se', 'la', 'mat'] }] }] },
  { id: 2, title: '五个元音', indonesianTitle: 'Lima Vokal', introduction: '印尼语常见元音是 A、E、I、O、U。E 有两种常见读法，要通过例词一起记。', sections: [
    { title: 'A', chineseTitle: '元音 A', rule: '嘴巴自然张开，声音清楚。', examples: [{ word: 'apa', chinese: '什么', note: '两个 A 都清楚。', syllables: ['a', 'pa'] }] },
    { title: 'E', chineseTitle: '元音 E', rule: 'E 常见有两种读法：较轻的 e（如“ə”）与较清楚的 e。通过例词听辨即可，不必用中文谐音。', examples: [{ word: 'enak', chinese: '好吃', note: '听清第一个 E。', syllables: ['e', 'nak'] }, { word: 'besar', chinese: '大', note: '听清第二个 E。', syllables: ['be', 'sar'] }] },
    { title: 'I', chineseTitle: '元音 I', rule: '发音短而清楚。', examples: [{ word: 'ini', chinese: '这个', note: '两个 I 都清楚。', syllables: ['i', 'ni'] }] },
    { title: 'O', chineseTitle: '元音 O', rule: '嘴唇略圆。', examples: [{ word: 'orang', chinese: '人', note: '常用词。', syllables: ['o', 'rang'] }] },
    { title: 'U', chineseTitle: '元音 U', rule: '嘴唇略收圆。', examples: [{ word: 'umur', chinese: '年龄', note: '两个自然音节。', syllables: ['u', 'mur'] }] },
  ] },
  { id: 3, title: '音节规则', indonesianTitle: 'Aturan Suku Kata', introduction: '判断音节时先找元音。通常每个音节都有一个元音核心，但不要把它理解成机械公式。', sections: [{ title: 'Cari vokal', chineseTitle: '先找元音', rule: '用人工确认的自然音节练习：先听整词，再逐块跟读。', examples: [{ word: 'makan', chinese: '吃', note: 'A、A 是两个元音核心。', syllables: ['ma', 'kan'], vowelCount: ['A', 'A'] }, { word: 'belajar', chinese: '学习', note: '自然分为三个音节。', syllables: ['be', 'la', 'jar'] }, { word: 'keluar', chinese: '出去', note: '注意元音顺序。', syllables: ['ke', 'lu', 'ar'] }, { word: 'selamat', chinese: '你好／祝贺', note: '自然分为三个音节。', syllables: ['se', 'la', 'mat'] }] }], practice: { prompt: '数一数 makan 里的元音，再按自然音节读。', answer: '元音：A、A；自然音节：ma-kan。', chunks: ['ma', 'kan'] } },
  { id: 4, title: '常见辅音', indonesianTitle: 'Konsonan Umum', introduction: '这些辅音在日常印尼语里非常高频。先听完整单词，再注意辅音在词中的位置。', sections: [{ title: 'B D K L M N P T R', chineseTitle: '常见辅音', rule: 'R 用舌尖轻触或颤动；不追求一次到位，先听示范并模仿节奏。', examples: [{ word: 'buku', chinese: '书', note: 'B。' }, { word: 'duduk', chinese: '坐', note: 'D。' }, { word: 'kantor', chinese: '办公室', note: 'K 与 R。', syllables: ['kan', 'tor'] }, { word: 'lima', chinese: '五', note: 'L。' }, { word: 'makan', chinese: '吃', note: 'M。' }, { word: 'nama', chinese: '名字', note: 'N。' }, { word: 'pagi', chinese: '早上', note: 'P。' }, { word: 'tiga', chinese: '三', note: 'T。' }, { word: 'rumah', chinese: '家', note: 'R：尝试用舌尖发出轻微颤动。', syllables: ['ru', 'mah'] }] }] },
  { id: 5, title: '容易读错的辅音', indonesianTitle: 'Konsonan yang Sering Keliru', introduction: '这些字母最适合放进单词里听。不要用中文谐音替代标准示范。', sections: [{ title: 'C J G Y W H', chineseTitle: '易错辅音', rule: '每个例词都先播放整词，再自己重复。', examples: [{ word: 'cari', chinese: '找', note: 'C。' }, { word: 'jalan', chinese: '路／走', note: 'J。', syllables: ['ja', 'lan'] }, { word: 'gaji', chinese: '工资', note: 'G。' }, { word: 'yakin', chinese: '确定／相信', note: 'Y。' }, { word: 'waktu', chinese: '时间', note: 'W。', syllables: ['wak', 'tu'] }, { word: 'hari', chinese: '天／日子', note: 'H。' }] }] },
  { id: 6, title: '组合发音', indonesianTitle: 'Gabungan Bunyi', introduction: '遇到字母组合时，先整体听，再放进例词中模仿。', sections: [{ title: 'ng ny sy kh ai au oi', chineseTitle: '常见组合音', rule: '组合音不要机械拆开读；先以完整例词为单位练习。', examples: [{ word: 'tangan', chinese: '手', note: 'ng。', syllables: ['ta', 'ngan'] }, { word: 'banyak', chinese: '很多', note: 'ny。', syllables: ['ba', 'nyak'] }, { word: 'syarat', chinese: '条件', note: 'sy。', syllables: ['sya', 'rat'] }, { word: 'khusus', chinese: '特别／专门', note: 'kh。', syllables: ['khu', 'sus'] }, { word: 'baik', chinese: '好', note: 'ai。' }, { word: 'pulau', chinese: '岛', note: 'au。', syllables: ['pu', 'lau'] }, { word: 'boikot', chinese: '抵制', note: 'oi。', syllables: ['boi', 'kot'] }] }] },
  { id: 7, title: '拆分练习', indonesianTitle: 'Latihan Membagi Bunyi', introduction: '以下分块由课程人工确认，按自然语义与音节练习，不使用自动空格拆分。', sections: [{ title: 'Dengar dan ikuti', chineseTitle: '听完再分块跟读', rule: '先播放完整词或短语，再逐块播放。', examples: [{ word: 'selamat', chinese: '你好／祝贺', note: '人工确认分块。', syllables: ['se', 'la', 'mat'] }, { word: 'terima kasih', chinese: '谢谢', note: '人工确认分块。', syllables: ['te', 'ri', 'ma', 'ka', 'sih'] }, { word: 'kantor', chinese: '办公室', note: '人工确认分块。', syllables: ['kan', 'tor'] }, { word: 'keluarga', chinese: '家人／家庭', note: '人工确认分块。', syllables: ['ke', 'lu', 'ar', 'ga'] }, { word: 'sekolah', chinese: '学校', note: '人工确认分块。', syllables: ['se', 'ko', 'lah'] }] }], practice: { prompt: '先听完整的 terima kasih，再逐块跟读。', answer: 'te-ri-ma ka-sih', chunks: ['te', 'ri', 'ma', 'ka', 'sih'] } },
  { id: 8, title: '完成课程', indonesianTitle: 'Selesai', introduction: '恭喜完成发音基础。以后看到新单词时，按同一套方法慢慢拼读。', sections: [{ title: 'Langkah berikutnya', chineseTitle: '接下来怎么做', rule: '① 找元音　② 看组合音　③ 听示范　④ 自己尝试拼读。', examples: [{ word: 'selamat belajar', chinese: '学习愉快', note: '带着这四步进入正式课程。', syllables: ['se', 'la', 'mat', 'be', 'la', 'jar'] }] }] },
];

export function getPronunciationLesson(id: string) { return pronunciationLessons.find((lesson) => lesson.id === Number(id)); }
