export type PronunciationExample = {
  word: string;
  chinese: string;
  syllables: PronunciationSyllable[];
  focusCombination?: PronunciationFocusCombination;
  ruleNote: string;
  audioText: string;
  vowelCount?: string[];
};

export type PronunciationSyllable = {
  text: string;
  audioMode: 'phoneme' | 'text' | 'example';
  phoneme?: string;
  audioText?: string;
  exampleWords?: string[];
};

export type PronunciationFocusCombination = {
  text: string;
  exampleWords: string[];
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
  practice?: { prompt: string; answer: string; audioText: string; chunks: PronunciationSyllable[] };
};

type SyllableInput = string | PronunciationSyllable;

const syllable = (text: string, audio?: Omit<PronunciationSyllable, 'text'>): PronunciationSyllable => ({ text, audioMode: 'text', ...audio });
const manualSyllables = (items: SyllableInput[]) => items.map((item) => typeof item === 'string' ? syllable(item) : item);
const phonemeSyllable = (text: string, phoneme: string, exampleWord: string) => syllable(text, { audioMode: 'phoneme', phoneme, exampleWords: [exampleWord] });

const example = (word: string, chinese: string, syllables: SyllableInput[], ruleNote: string, focusCombination?: string, vowelCount?: string[]): PronunciationExample => ({
  word, chinese, syllables: manualSyllables(syllables), ruleNote, focusCombination: focusCombination ? { text: focusCombination, exampleWords: [word] } : undefined, vowelCount, audioText: word,
});

export const pronunciationLessons: PronunciationLesson[] = [
  {
    id: 1,
    title: '认识印尼语',
    indonesianTitle: 'Mengenal Bahasa Indonesia',
    introduction: '印尼语的拼读规则相对稳定。大多数单词可以根据字母和音节尝试读出来；先听标准示范，再大胆开口。',
    sections: [{
      title: 'Mulai dari huruf', chineseTitle: '从字母开始',
      rule: '看到新单词时，先找元音，再看是否有常见组合音。',
      examples: [
        example('makan', '吃', [phonemeSyllable('ma', 'ma', 'makan'), 'kan'], '两个清晰的自然音节。'),
        example('belajar', '学习', ['be', 'la', 'jar'], '按自然音节慢慢读。'),
        example('selamat', '你好／祝贺', ['se', 'la', 'mat'], '常见问候语，按三个音节练习。'),
      ],
    }],
  },
  {
    id: 2,
    title: '五个元音',
    indonesianTitle: 'Lima Vokal',
    introduction: '印尼语常见元音是 A、E、I、O、U。E 有两种常见发音，要通过例词一起记。',
    sections: [
      { title: 'A', chineseTitle: '元音 A', rule: '嘴巴自然张开，声音清楚。', examples: [example('apa', '什么', ['a', 'pa'], '两个 A 都清楚。')] },
      { title: 'E', chineseTitle: '元音 E', rule: 'E 常见有两种读法：较轻的 e（如 “enak”）与较清晰的 e。通过例词听辨即可，不必用中文谐音。', examples: [
        example('enak', '好吃', ['e', 'nak'], '留意第一个 E 的较轻读法。'),
        example('besar', '大', ['be', 'sar'], '留意第二个 E 的清晰读法。'),
      ] },
      { title: 'I', chineseTitle: '元音 I', rule: '发音短而清楚。', examples: [example('ini', '这个', ['i', 'ni'], '两个 I 都清楚。')] },
      { title: 'O', chineseTitle: '元音 O', rule: '嘴唇略圆。', examples: [example('orang', '人', ['o', 'rang'], '常用词，注意第一个音节。')] },
      { title: 'U', chineseTitle: '元音 U', rule: '嘴唇略收圆。', examples: [example('umur', '年龄', ['u', 'mur'], '两个自然音节。')] },
    ],
  },
  {
    id: 3,
    title: '音节规则',
    indonesianTitle: 'Aturan Suku Kata',
    introduction: '判断音节时先找元音。通常每个音节都有一个元音核心，但不要把它理解成机械公式。',
    sections: [{
      title: 'Cari vokal', chineseTitle: '先找元音',
      rule: '用人工确认的自然音节练习：先听整词，再逐块跟读。',
      examples: [
        example('makan', '吃', [phonemeSyllable('ma', 'ma', 'makan'), 'kan'], 'A、A 是两个元音核心。', undefined, ['A', 'A']),
        example('belajar', '学习', ['be', 'la', 'jar'], '自然分为三个音节。'),
        example('keluar', '出去', ['ke', 'lu', 'ar'], '注意元音的顺序。'),
        example('selamat', '你好／祝贺', ['se', 'la', 'mat'], '自然分为三个音节。'),
      ],
    }],
    practice: { prompt: '数一数 makan 里的元音，再按自然音节读。', answer: '元音：A、A；自然音节：ma-kan。', audioText: 'makan', chunks: manualSyllables([phonemeSyllable('ma', 'ma', 'makan'), 'kan']) },
  },
  {
    id: 4,
    title: '常见辅音',
    indonesianTitle: 'Konsonan Umum',
    introduction: '这些辅音在日常印尼语里非常高频。先听完整单词，再注意辅音在词中的位置。',
    sections: [{
      title: 'B D K L M N P T R', chineseTitle: '常见辅音',
      rule: 'R 用舌尖轻触或颤动；不追求一次到位，先听示范并模仿节奏。',
      examples: [
        example('buku', '书', ['bu', 'ku'], '注意 B 的位置。'),
        example('duduk', '坐', ['du', 'duk'], '注意 D 的位置。'),
        example('kantor', '办公室', ['kan', 'tor'], '注意 K 和 R。'),
        example('lima', '五', ['li', 'ma'], '注意 L 的位置。'),
        example('makan', '吃', [phonemeSyllable('ma', 'ma', 'makan'), 'kan'], '注意 M 的位置。'),
        example('nama', '名字', ['na', 'ma'], '注意 N 的位置。'),
        example('pagi', '早上', ['pa', 'gi'], '注意 P 的位置。'),
        example('tiga', '三', ['ti', 'ga'], '注意 T 的位置。'),
        example('rumah', '家', ['ru', 'mah'], 'R：尝试用舌尖发出轻微颤动。'),
      ],
    }],
  },
  {
    id: 5,
    title: '容易读错的辅音',
    indonesianTitle: 'Konsonan yang Sering Keliru',
    introduction: '这些字母最适合放进单词里听。不要用中文谐音替代标准示范。',
    sections: [{
      title: 'C J G Y W H', chineseTitle: '易错辅音',
      rule: '每个例词都先播放整词，再自己重复。',
      examples: [
        example('cari', '找', ['ca', 'ri'], '注意 C 的发音。'),
        example('jalan', '路／走', [phonemeSyllable('ja', 'dʒa', 'jalan'), 'lan'], '注意 J 的发音。'),
        example('gaji', '工资', ['ga', 'ji'], '注意 G 的发音。'),
        example('yakin', '确定／相信', ['ya', 'kin'], '注意 Y 的发音。'),
        example('waktu', '时间', ['wak', 'tu'], '注意 W 的发音。'),
        example('hari', '天／日子', ['ha', 'ri'], '注意 H 的发音。'),
      ],
    }],
  },
  {
    id: 6,
    title: '组合发音',
    indonesianTitle: 'Gabungan Bunyi',
    introduction: '遇到字母组合时，先整体听，再放进例词里模仿。组合音是重点，但不能替代完整音节。',
    sections: [{
      title: 'ng ny sy kh ai au oi', chineseTitle: '常见组合音',
      rule: '组合音不要机械拆开读；先以完整例词为单位练习，再听重点组合。',
      examples: [
        example('tangan', '手', ['ta', 'ngan'], 'ng 在第二个音节里一起发音。', 'ng'),
        example('banyak', '很多', [phonemeSyllable('ba', 'ba', 'banyak'), 'nyak'], 'ny 在第二个音节里一起发音。', 'ny'),
        example('syarat', '条件', ['sya', 'rat'], 'sy 在第一个音节里一起发音。', 'sy'),
        example('khusus', '特别／专门', ['khu', 'sus'], 'kh 在第一个音节里一起发音。', 'kh'),
        example('baik', '好', [phonemeSyllable('ba', 'ba', 'baik'), 'ik'], 'ai 是重点组合，完整音节仍然是 ba-ik。', 'ai'),
        example('pulau', '岛', [phonemeSyllable('pu', 'pu', 'pulau'), phonemeSyllable('lau', 'lau', 'pulau')], 'au 是重点组合，完整音节仍然是 pu-lau。', 'au'),
        example('boikot', '抵制', ['boi', 'kot'], 'oi 是重点组合，先听完整单词。', 'oi'),
      ],
    }],
  },
  {
    id: 7,
    title: '拆分练习',
    indonesianTitle: 'Latihan Membagi Bunyi',
    introduction: '以下拆分由课程人工确认，按自然音节练习，不使用自动空格拆分。',
    sections: [{
      title: 'Dengar dan ikuti', chineseTitle: '听完再分块跟读',
      rule: '先播放完整词或短语，再逐个音节播放。',
      examples: [
        example('selamat', '你好／祝贺', ['se', 'la', 'mat'], '人工确认音节。'),
        example('terima kasih', '谢谢', ['te', 'ri', 'ma', 'ka', 'sih'], '人工确认音节。'),
        example('kantor', '办公室', ['kan', 'tor'], '人工确认音节。'),
        example('keluarga', '家人／家庭', ['ke', 'lu', 'ar', 'ga'], '人工确认音节。'),
        example('sekolah', '学校', ['se', 'ko', 'lah'], '人工确认音节。'),
      ],
    }],
    practice: { prompt: '先听完整的 terima kasih，再逐个音节跟读。', answer: 'te-ri-ma-ka-sih', audioText: 'terima kasih', chunks: manualSyllables(['te', 'ri', phonemeSyllable('ma', 'ma', 'terima kasih'), phonemeSyllable('ka', 'ka', 'terima kasih'), 'sih']) },
  },
  {
    id: 8,
    title: '完成课程',
    indonesianTitle: 'Selesai',
    introduction: '恭喜完成发音基础。以后看到新单词时，按同一套方法慢慢拼读。',
    sections: [{
      title: 'Langkah berikutnya', chineseTitle: '接下来怎么做',
      rule: '① 找元音　② 看组合音　③ 听示范　④ 自己尝试拼读。',
      examples: [example('selamat belajar', '学习愉快', ['se', 'la', 'mat', 'be', 'la', 'jar'], '带着这四步进入正式课程。')],
    }],
  },
];

export function getPronunciationLesson(id: string) {
  return pronunciationLessons.find((lesson) => lesson.id === Number(id));
}
