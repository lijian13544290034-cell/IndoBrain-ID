export type ChineseTone = 1 | 2 | 3 | 4 | 'neutral';

export type ChinesePinyinToken = {
  hanzi: string;
  base: string;
  tone: ChineseTone;
  display: string;
  wordBlock: string;
};

export type ChineseVisualObject = {
  id: 'apple';
  type: 'object';
  renderer: 'css-apple';
  supportedVariables: {
    quantity: [1, 2, 3];
    future: ['color', 'size', 'position', 'action'];
  };
};

export type ChineseVisualState = {
  objectId: 'apple';
  quantity: 1 | 2 | 3;
};

export type ChineseQuantityExpression = {
  id: string;
  quantity: 1 | 2 | 3;
  hanzi: string;
  pinyinTokens: ChinesePinyinToken[];
  indonesian: string;
  ttsText: string;
  visual: ChineseVisualState;
};

export type ChineseLessonStateId =
  | 'entry'
  | 'paham'
  | 'dengar'
  | 'lihat'
  | 'ucapkan'
  | 'temukan'
  | 'pakai'
  | 'aku-bisa'
  | 'completion';

export type ChineseLessonStep = {
  id: ChineseLessonStateId;
  labelId: string;
};

export type ChineseChoice = {
  id: string;
  hanzi: string;
  correct: boolean;
};

export type ChinesePakaiLine = {
  id: string;
  hanzi: string;
  pinyinTokens: ChinesePinyinToken[];
  indonesian: string;
  ttsText: string;
};

export type ChineseGoldenLesson = {
  id: 'jumlah-01';
  route: '/learn-chinese';
  titleId: 'Jumlah';
  subtitleId: string;
  targetExpressions: ChineseQuantityExpression[];
  focusExpressionId: 'two-apples';
  steps: ChineseLessonStep[];
  temukan: {
    questionId: string;
    missingQuantity: 2;
    options: ChineseChoice[];
    correctFeedbackId: string;
    firstWrongFeedbackId: string;
  };
  pakai: {
    question: ChinesePakaiLine;
    answer: ChinesePakaiLine;
    response: ChinesePakaiLine;
  };
  akuBisa: {
    visualToHanzi: {
      quantity: 3;
      questionId: string;
      options: ChineseChoice[];
    };
    soundToMeaning: {
      expressionId: 'two-apples';
      questionId: string;
      options: ChineseVisualState[];
    };
  };
};

export const chineseVisualObjects: ChineseVisualObject[] = [
  {
    id: 'apple',
    type: 'object',
    renderer: 'css-apple',
    supportedVariables: {
      quantity: [1, 2, 3],
      future: ['color', 'size', 'position', 'action'],
    },
  },
];

const yiGe: ChinesePinyinToken[] = [
  { hanzi: '一', base: 'yi', tone: 1, display: 'yí', wordBlock: '一个' },
  { hanzi: '个', base: 'ge', tone: 'neutral', display: 'ge', wordBlock: '一个' },
];

const liangGe: ChinesePinyinToken[] = [
  { hanzi: '两', base: 'liang', tone: 3, display: 'liǎng', wordBlock: '两个' },
  { hanzi: '个', base: 'ge', tone: 'neutral', display: 'ge', wordBlock: '两个' },
];

const sanGe: ChinesePinyinToken[] = [
  { hanzi: '三', base: 'san', tone: 1, display: 'sān', wordBlock: '三个' },
  { hanzi: '个', base: 'ge', tone: 'neutral', display: 'ge', wordBlock: '三个' },
];

const pingGuo: ChinesePinyinToken[] = [
  { hanzi: '苹', base: 'ping', tone: 2, display: 'píng', wordBlock: '苹果' },
  { hanzi: '果', base: 'guo', tone: 3, display: 'guǒ', wordBlock: '苹果' },
];

const niYaoJiGe: ChinesePinyinToken[] = [
  { hanzi: '你', base: 'ni', tone: 3, display: 'nǐ', wordBlock: '你' },
  { hanzi: '要', base: 'yao', tone: 4, display: 'yào', wordBlock: '要' },
  { hanzi: '几', base: 'ji', tone: 3, display: 'jǐ', wordBlock: '几个' },
  { hanzi: '个', base: 'ge', tone: 'neutral', display: 'ge', wordBlock: '几个' },
];

const geiNi: ChinesePinyinToken[] = [
  { hanzi: '给', base: 'gei', tone: 3, display: 'gěi', wordBlock: '给你' },
  { hanzi: '你', base: 'ni', tone: 3, display: 'nǐ', wordBlock: '给你' },
];

export const chineseQuantityExpressions: ChineseQuantityExpression[] = [
  {
    id: 'one-apple',
    quantity: 1,
    hanzi: '一个苹果',
    pinyinTokens: [...yiGe, ...pingGuo],
    indonesian: 'satu apel',
    ttsText: '一个苹果',
    visual: { objectId: 'apple', quantity: 1 },
  },
  {
    id: 'two-apples',
    quantity: 2,
    hanzi: '两个苹果',
    pinyinTokens: [...liangGe, ...pingGuo],
    indonesian: 'dua apel',
    ttsText: '两个苹果',
    visual: { objectId: 'apple', quantity: 2 },
  },
  {
    id: 'three-apples',
    quantity: 3,
    hanzi: '三个苹果',
    pinyinTokens: [...sanGe, ...pingGuo],
    indonesian: 'tiga apel',
    ttsText: '三个苹果',
    visual: { objectId: 'apple', quantity: 3 },
  },
];

export const chineseGoldenLessonJumlah: ChineseGoldenLesson = {
  id: 'jumlah-01',
  route: '/learn-chinese',
  titleId: 'Jumlah',
  subtitleId: 'Belajar menyebut jumlah benda dalam Mandarin',
  targetExpressions: chineseQuantityExpressions,
  focusExpressionId: 'two-apples',
  steps: [
    { id: 'entry', labelId: 'Mulai' },
    { id: 'paham', labelId: 'Paham' },
    { id: 'dengar', labelId: 'Dengar' },
    { id: 'lihat', labelId: 'Lihat' },
    { id: 'ucapkan', labelId: 'Ucapkan' },
    { id: 'temukan', labelId: 'Temukan' },
    { id: 'pakai', labelId: 'Pakai' },
    { id: 'aku-bisa', labelId: 'Aku Bisa' },
    { id: 'completion', labelId: 'Selesai' },
  ],
  temukan: {
    questionId: 'Mana yang benar?',
    missingQuantity: 2,
    options: [
      { id: 'one-apple-option', hanzi: '一个苹果', correct: false },
      { id: 'two-apples-option', hanzi: '两个苹果', correct: true },
      { id: 'three-apples-option', hanzi: '三个苹果', correct: false },
    ],
    correctFeedbackId: 'Bagus! Kamu menemukan polanya.',
    firstWrongFeedbackId: 'Coba lagi',
  },
  pakai: {
    question: {
      id: 'pakai-question',
      hanzi: '你要几个？',
      pinyinTokens: [...niYaoJiGe],
      indonesian: 'Kamu mau berapa?',
      ttsText: '你要几个',
    },
    answer: {
      id: 'pakai-answer',
      hanzi: '两个。',
      pinyinTokens: [...liangGe],
      indonesian: 'Dua.',
      ttsText: '两个',
    },
    response: {
      id: 'pakai-response',
      hanzi: '给你。',
      pinyinTokens: [...geiNi],
      indonesian: 'Ini untukmu.',
      ttsText: '给你',
    },
  },
  akuBisa: {
    visualToHanzi: {
      quantity: 3,
      questionId: 'Mana yang benar?',
      options: [
        { id: 'one-apple-final', hanzi: '一个苹果', correct: false },
        { id: 'two-apples-final', hanzi: '两个苹果', correct: false },
        { id: 'three-apples-final', hanzi: '三个苹果', correct: true },
      ],
    },
    soundToMeaning: {
      expressionId: 'two-apples',
      questionId: 'Dengarkan. Pilih gambarnya.',
      options: [
        { objectId: 'apple', quantity: 1 },
        { objectId: 'apple', quantity: 2 },
        { objectId: 'apple', quantity: 3 },
      ],
    },
  },
};

export function getQuantityExpression(id: string) {
  return chineseQuantityExpressions.find((expression) => expression.id === id);
}

export function getQuantityExpressionByQuantity(quantity: 1 | 2 | 3) {
  return chineseQuantityExpressions.find((expression) => expression.quantity === quantity);
}
