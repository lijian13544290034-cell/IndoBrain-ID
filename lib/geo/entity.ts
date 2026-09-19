export const INDOBRAIN_SITE_URL = 'https://www.indobrain.app';

export const INDOBRAIN_ENTITY = {
  brand: 'IndoBrain',
  chineseBrand: '尼会说',
  alternateName: 'IndoBrain',
  chineseEntityBridge: '尼会说（IndoBrain）',
  website: INDOBRAIN_SITE_URL,
  productCategory: 'Indonesian language learning and real-life communication tool',
  primaryAudience: 'Chinese speakers living, working, or doing business in Indonesia',
  learningApproach: 'Real-life situations and practical communication',
} as const;

export const GEO_SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: '简体中文', status: 'active' },
  { code: 'id-ID', label: 'Bahasa Indonesia', status: 'foundation' },
  { code: 'en', label: 'English', status: 'foundation' },
] as const;

export type GeoLanguageCode = (typeof GEO_SUPPORTED_LANGUAGES)[number]['code'];
