export type ChineseRealUseType = 'phrase' | 'sentence' | 'micro_scene';

export type ChineseVisual = {
  kind: 'object';
  object: 'apple';
  quantity?: number | 'some' | 'many' | 'all' | 'few';
};

export type ChineseConcept = {
  id: string;
  hanzi: string;
  pinyin: string;
  indonesian: string;
  ttsText: string;
  visualKey: string;
  visual: ChineseVisual;
  categoryId: string;
  subcategoryId: string;
  priority: number;
  status: 'active';
};

export type ChineseLearningGroup = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  titleZh: string;
  titleId: string;
  conceptIds: string[];
  realUseId: string;
  visualMode: 'quantity-axis';
  order: number;
  status: 'active';
};

export type ChineseRealUseItem = {
  hanzi: string;
  pinyin: string;
  indonesian: string;
  ttsText: string;
  conceptIds: string[];
};

export type ChineseRealUse = {
  id: string;
  type: ChineseRealUseType;
  titleZh: string;
  titleId: string;
  contextId: string;
  items: ChineseRealUseItem[];
  status: 'active';
};

export const chineseLearningCategory = {
  id: 'basic-chinese',
  titleZh: '基础中文',
  titleId: 'Bahasa Mandarin Dasar',
  subcategories: [{ id: 'quantity', titleZh: '数量', titleId: 'Jumlah' }],
} as const;

export const chineseConcepts: ChineseConcept[] = [
  {
    id: 'yi',
    hanzi: '一',
    pinyin: 'yī',
    indonesian: 'satu',
    ttsText: '一',
    visualKey: 'apple-1',
    visual: { kind: 'object', object: 'apple', quantity: 1 },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 1,
    status: 'active',
  },
  {
    id: 'liang',
    hanzi: '两',
    pinyin: 'liǎng',
    indonesian: 'dua untuk menghitung benda',
    ttsText: '两',
    visualKey: 'apple-2',
    visual: { kind: 'object', object: 'apple', quantity: 2 },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 2,
    status: 'active',
  },
  {
    id: 'san',
    hanzi: '三',
    pinyin: 'sān',
    indonesian: 'tiga',
    ttsText: '三',
    visualKey: 'apple-3',
    visual: { kind: 'object', object: 'apple', quantity: 3 },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 3,
    status: 'active',
  },
  {
    id: 'ge',
    hanzi: '个',
    pinyin: 'gè',
    indonesian: 'kata bantu hitung umum',
    ttsText: '个',
    visualKey: 'apple-counter',
    visual: { kind: 'object', object: 'apple', quantity: 1 },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 4,
    status: 'active',
  },
  {
    id: 'pingguo',
    hanzi: '苹果',
    pinyin: 'píng guǒ',
    indonesian: 'apel',
    ttsText: '苹果',
    visualKey: 'apple-object',
    visual: { kind: 'object', object: 'apple', quantity: 1 },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 5,
    status: 'active',
  },
  {
    id: 'jige',
    hanzi: '几个',
    pinyin: 'jǐ gè',
    indonesian: 'berapa buah',
    ttsText: '几个',
    visualKey: 'apple-question',
    visual: { kind: 'object', object: 'apple', quantity: 3 },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 6,
    status: 'active',
  },
  {
    id: 'yixie',
    hanzi: '一些',
    pinyin: 'yì xiē',
    indonesian: 'beberapa',
    ttsText: '一些',
    visualKey: 'apple-some',
    visual: { kind: 'object', object: 'apple', quantity: 'some' },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 7,
    status: 'active',
  },
  {
    id: 'henduo',
    hanzi: '很多',
    pinyin: 'hěn duō',
    indonesian: 'banyak',
    ttsText: '很多',
    visualKey: 'apple-many',
    visual: { kind: 'object', object: 'apple', quantity: 'many' },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 8,
    status: 'active',
  },
  {
    id: 'suoyou',
    hanzi: '所有',
    pinyin: 'suǒ yǒu',
    indonesian: 'semua',
    ttsText: '所有',
    visualKey: 'apple-all',
    visual: { kind: 'object', object: 'apple', quantity: 'all' },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 9,
    status: 'active',
  },
  {
    id: 'shao',
    hanzi: '少',
    pinyin: 'shǎo',
    indonesian: 'sedikit',
    ttsText: '少',
    visualKey: 'apple-few',
    visual: { kind: 'object', object: 'apple', quantity: 'few' },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 10,
    status: 'active',
  },
  {
    id: 'duo',
    hanzi: '多',
    pinyin: 'duō',
    indonesian: 'banyak',
    ttsText: '多',
    visualKey: 'apple-more',
    visual: { kind: 'object', object: 'apple', quantity: 'many' },
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    priority: 11,
    status: 'active',
  },
];

export const chineseLearningGroups: ChineseLearningGroup[] = [
  {
    id: 'quantity-1',
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    titleZh: '一个、两个、三个苹果',
    titleId: 'Satu, dua, tiga apel',
    conceptIds: ['yi', 'liang', 'san', 'ge', 'pingguo'],
    realUseId: 'quantity-real-use-1',
    visualMode: 'quantity-axis',
    order: 1,
    status: 'active',
  },
  {
    id: 'quantity-2',
    categoryId: 'basic-chinese',
    subcategoryId: 'quantity',
    titleZh: '几个、一些、很多、所有',
    titleId: 'Berapa, beberapa, banyak, semua',
    conceptIds: ['jige', 'yixie', 'henduo', 'suoyou', 'shao', 'duo', 'pingguo'],
    realUseId: 'quantity-real-use-2',
    visualMode: 'quantity-axis',
    order: 2,
    status: 'active',
  },
];

export const chineseRealUses: ChineseRealUse[] = [
  {
    id: 'quantity-real-use-1',
    type: 'phrase',
    titleZh: '马上会说数量',
    titleId: 'Langsung bisa menyebut jumlah',
    contextId: 'Objeknya tetap apel. Yang berubah hanya jumlahnya.',
    status: 'active',
    items: [
      { hanzi: '一个苹果', pinyin: 'yí gè píng guǒ', indonesian: 'satu apel', ttsText: '一个苹果', conceptIds: ['yi', 'ge', 'pingguo'] },
      { hanzi: '两个苹果', pinyin: 'liǎng gè píng guǒ', indonesian: 'dua apel', ttsText: '两个苹果', conceptIds: ['liang', 'ge', 'pingguo'] },
      { hanzi: '三个苹果', pinyin: 'sān gè píng guǒ', indonesian: 'tiga apel', ttsText: '三个苹果', conceptIds: ['san', 'ge', 'pingguo'] },
    ],
  },
  {
    id: 'quantity-real-use-2',
    type: 'phrase',
    titleZh: '问数量和说多少',
    titleId: 'Tanya dan jawab jumlah',
    contextId: 'Masih apel yang sama. Sekarang anak mengenali jumlah yang tidak pasti.',
    status: 'active',
    items: [
      { hanzi: '几个苹果？', pinyin: 'jǐ gè píng guǒ?', indonesian: 'berapa buah apel?', ttsText: '几个苹果', conceptIds: ['jige', 'pingguo'] },
      { hanzi: '一些苹果', pinyin: 'yì xiē píng guǒ', indonesian: 'beberapa apel', ttsText: '一些苹果', conceptIds: ['yixie', 'pingguo'] },
      { hanzi: '很多苹果', pinyin: 'hěn duō píng guǒ', indonesian: 'banyak apel', ttsText: '很多苹果', conceptIds: ['henduo', 'pingguo'] },
      { hanzi: '所有苹果', pinyin: 'suǒ yǒu píng guǒ', indonesian: 'semua apel', ttsText: '所有苹果', conceptIds: ['suoyou', 'pingguo'] },
    ],
  },
];

export function getChineseConcept(id: string) {
  return chineseConcepts.find((concept) => concept.id === id);
}

export function getChineseLearningGroup(groupId: string) {
  return chineseLearningGroups.find((group) => group.id === groupId);
}

export function getChineseRealUse(id: string) {
  return chineseRealUses.find((realUse) => realUse.id === id);
}

export function getChineseLearningGroupBundle(groupId: string) {
  const group = getChineseLearningGroup(groupId) ?? chineseLearningGroups[0];
  return {
    group,
    concepts: group.conceptIds.map(getChineseConcept).filter((item): item is ChineseConcept => Boolean(item)),
    realUse: getChineseRealUse(group.realUseId),
  };
}
