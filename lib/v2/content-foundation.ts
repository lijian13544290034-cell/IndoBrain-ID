import type { CatalogExperience } from '@/lib/experience-catalog';
import { harvestTerm } from '@/lib/harvest';
import { normalizeHarvestForAchievement } from '@/lib/learning-achievements';

/**
 * V2 content types are additive. Existing lesson data and routes continue to use
 * their current shapes; this file is the single compatibility boundary for V2.
 */
export type MembershipTier = 'TRIAL' | 'PRO' | 'VIP' | 'ENTERPRISE';
export type ContentDifficultyLevel = `L${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
export type ExperienceStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PrimaryExperienceCategory =
  | 'LIFE_HOME'
  | 'TRANSPORT'
  | 'FOOD_CONSUMPTION'
  | 'WORK_BUSINESS'
  | 'PUBLIC_SERVICES'
  | 'SOCIAL_LEISURE';

export const primaryExperienceCategoryLabels: Record<PrimaryExperienceCategory, string> = {
  LIFE_HOME: '生活居家',
  TRANSPORT: '出行交通',
  FOOD_CONSUMPTION: '餐饮消费',
  WORK_BUSINESS: '工作商务',
  PUBLIC_SERVICES: '公共服务',
  SOCIAL_LEISURE: '社交休闲',
};

export type HarvestV2 = {
  id?: string;
  textId: string;
  textZh: string;
  normalizedKey: string;
  pronunciationText?: string;
  tags?: string[];
  vocabularyCategory?: string;
};

export type PatternV2 = {
  id: string;
  titleZh: string;
  templateId: string;
  explanationZh: string;
  slots: ReadonlyArray<{ id: string; labelZh: string; allowedVocabularyIds?: string[] }>;
  examples: ReadonlyArray<{ textId: string; textZh: string }>;
  tags: string[];
  difficultyLevel: ContentDifficultyLevel;
  requiredMembershipTier: MembershipTier;
};

export type ExperienceV2 = {
  id: string;
  titleZh: string;
  titleId: string;
  descriptionZh: string;
  primaryCategory: PrimaryExperienceCategory;
  tags: string[];
  difficultyLevel: ContentDifficultyLevel;
  requiredMembershipTier: MembershipTier;
  dialogue: { textId: string; textZh: string; pronunciationText?: string };
  harvest: HarvestV2[];
  patterns: PatternV2[];
  cultureTips: Array<{ titleZh: string; contentZh: string }>;
  status: ExperienceStatus;
  updatedAt?: string;
  /** Route and existing UI compatibility only; never use as V2 business state. */
  legacy: Pick<CatalogExperience, 'module' | 'category' | 'href'>;
};

const categoryForLegacy = (experience: CatalogExperience): PrimaryExperienceCategory => {
  const text = `${experience.module} ${experience.category} ${experience.id}`.toLowerCase();
  if (/drv|transport|司机|sopir|arah|perjalanan/.test(text)) return 'TRANSPORT';
  if (/restaurant|supermarket|makan|餐|购物/.test(text)) return 'FOOD_CONSUMPTION';
  if (/fac|pro|whs|qc|purchasing|factory|pabrik|办公|工作|business/.test(text)) return 'WORK_BUSINESS';
  if (/bank|hospital|药|医院|公共/.test(text)) return 'PUBLIC_SERVICES';
  if (/life|nanny|art|home|家庭|保姆/.test(text)) return 'LIFE_HOME';
  return 'SOCIAL_LEISURE';
};

/** Keeps the existing achievement normalization as the V2 harvest identity rule. */
export function toHarvestV2(entry: string): HarvestV2 {
  const textId = harvestTerm(entry);
  const meaning = entry.match(/[（(]([^）)]+)[）)]/)?.[1]?.trim() ?? '';
  return {
    textId,
    textZh: meaning,
    normalizedKey: normalizeHarvestForAchievement(entry),
    pronunciationText: textId,
  };
}

/**
 * Read-only adapter: no legacy ID, route, text, achievement count, or favorite
 * behaviour is changed. Editors can later replace inferred metadata explicitly.
 */
export function toExperienceV2(experience: CatalogExperience): ExperienceV2 {
  return {
    id: experience.id,
    titleZh: experience.task,
    titleId: experience.indonesian,
    descriptionZh: '',
    primaryCategory: categoryForLegacy(experience),
    tags: [experience.module, experience.category].filter(Boolean),
    difficultyLevel: 'L1',
    requiredMembershipTier: 'TRIAL',
    dialogue: { textId: experience.indonesian, textZh: experience.task, pronunciationText: experience.indonesian },
    harvest: experience.harvest.map(toHarvestV2),
    patterns: [],
    cultureTips: [],
    status: 'PUBLISHED',
    legacy: { module: experience.module, category: experience.category, href: experience.href },
  };
}
