import type { ContentDifficultyLevel, MembershipTier } from '@/lib/v2/content-foundation';

export const vocabularyCategoryLabels = {
  TIME: '时间', NUMBERS: '数字', COLORS: '颜色', DIRECTIONS: '方向', PEOPLE_AND_TITLES: '人物与称呼',
  FAMILY: '家庭', OFFICE: '办公', FACTORY: '工厂', WAREHOUSE: '仓库', KITCHEN: '厨房',
  DINING: '餐饮', SHOPPING: '购物', TRANSPORT: '交通', AIRPORT: '机场', HOTEL: '酒店',
  HEALTH: '医院与药店', BANKING: '银行与办事', EMOTIONS_SOCIAL: '情绪与社交',
  COMMON_VERBS: '常用动词', COMMON_ADJECTIVES: '常用形容词', FUNCTION_WORDS: '功能词与语气词',
  HIGH_FREQUENCY_PHRASES: '高频词组',
} as const;

export type VocabularyCategory = keyof typeof vocabularyCategoryLabels;
export type VocabularyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type VocabularyV2 = {
  id: string;
  textId: string;
  textZh: string;
  normalizedKey: string;
  category: VocabularyCategory;
  tags: string[];
  exampleSentenceId?: string;
  exampleSentenceZh?: string;
  pronunciationText?: string;
  difficultyLevel: ContentDifficultyLevel;
  requiredMembershipTier: MembershipTier;
  status: VocabularyStatus;
};

/** Small, reviewed examples only. This is not a replacement for the current Essentials data. */
export const vocabularyV2Examples: readonly VocabularyV2[] = [
  { id: 'VOC-TIME-001', textId: 'hari ini', textZh: '今天', normalizedKey: 'hari ini', category: 'TIME', tags: ['时间'], pronunciationText: 'hari ini', difficultyLevel: 'L1', requiredMembershipTier: 'TRIAL', status: 'PUBLISHED' },
  { id: 'VOC-DIRECTION-001', textId: 'di mana', textZh: '在哪里', normalizedKey: 'di mana', category: 'DIRECTIONS', tags: ['问路'], pronunciationText: 'di mana', difficultyLevel: 'L1', requiredMembershipTier: 'TRIAL', status: 'PUBLISHED' },
  { id: 'VOC-PHRASE-001', textId: 'nggak apa-apa', textZh: '没关系', normalizedKey: 'nggak apa-apa', category: 'HIGH_FREQUENCY_PHRASES', tags: ['社交', '安慰'], pronunciationText: 'nggak apa-apa', difficultyLevel: 'L1', requiredMembershipTier: 'TRIAL', status: 'PUBLISHED' },
];
