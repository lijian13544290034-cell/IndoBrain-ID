import { allMandarinWorkItems, mandarinWorkDays } from '@/lib/mandarin-work-course';
import type { MandarinFavoriteEntry } from '@/lib/mandarin-favorite-resolver';

const dayTitles = new Map(mandarinWorkDays.map((day) => [day.day, day.title]));

export const mandarinLevelOneFavoriteEntries: MandarinFavoriteEntry[] = allMandarinWorkItems().map((item) => ({
  favoriteId: item.favoriteId,
  itemId: item.id,
  day: item.day,
  courseTitle: dayTitles.get(item.day) ?? 'Mandarin untuk Kerja',
  chinese: item.chinese,
  pinyin: item.pinyinSegments.map((segment) => segment.pinyin).join(' '),
  indonesian: item.indonesian,
  audioText: item.audioText,
  href: `/learn-chinese/course?day=${item.day}`,
  level: 1,
}));
