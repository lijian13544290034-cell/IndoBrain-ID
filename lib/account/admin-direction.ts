import { LEARNING_DIRECTIONS, type LearningDirection } from './types';

export const ADMIN_DIRECTION_LABELS: Record<LearningDirection, { chinese: string; indonesian: string }> = {
  ZH_TO_ID: { chinese: '中国人学印尼语', indonesian: 'Bahasa Indonesia untuk Penutur Mandarin' },
  ID_TO_ZH: { chinese: '印尼人学中文', indonesian: 'Mandarin untuk Penutur Indonesia' },
};

export function parseAdminDirection(value?: string | null): LearningDirection | null {
  return LEARNING_DIRECTIONS.includes(value as LearningDirection) ? value as LearningDirection : null;
}

