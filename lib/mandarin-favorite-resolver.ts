export type MandarinFavoriteEntry = {
  favoriteId: string;
  itemId: string;
  day: number;
  courseTitle: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  audioText: string;
  href: string;
  level: 1 | 2;
};

export type MandarinFavoriteResolution = {
  entries: MandarinFavoriteEntry[];
  lockedLevel2Count: number;
  unresolvedIds: string[];
};

const level2IdPrefix = 'mandarin-work-30d:CN-WORK-L2-';

export function resolveMandarinFavoriteIds(
  favoriteIds: string[],
  levelOneEntries: MandarinFavoriteEntry[],
  levelTwoEntries: MandarinFavoriteEntry[],
  levelTwoAuthorized: boolean,
): MandarinFavoriteResolution {
  const catalog = new Map([...levelOneEntries, ...levelTwoEntries].map((entry) => [entry.favoriteId, entry]));
  const seen = new Set<string>();
  const entries: MandarinFavoriteEntry[] = [];
  const unresolvedIds: string[] = [];
  let lockedLevel2Count = 0;

  for (const id of favoriteIds) {
    if (typeof id !== 'string' || seen.has(id)) continue;
    seen.add(id);
    const entry = catalog.get(id);
    if (entry) {
      entries.push(entry);
    } else if (!levelTwoAuthorized && id.startsWith(level2IdPrefix)) {
      lockedLevel2Count += 1;
    } else {
      unresolvedIds.push(id);
    }
  }

  return { entries, lockedLevel2Count, unresolvedIds };
}
