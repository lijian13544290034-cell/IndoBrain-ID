export const indonesiaPowerRules = { experienceCompleted: 5, uniqueHarvestMastered: 2, uniquePatternMastered: 3 } as const;

export type IndonesiaPowerInput = { newlyCompletedExperienceCount: number; newlyMasteredHarvestCount: number; newlyMasteredPatternCount: number };
export type CompletionOutcomeV2 = IndonesiaPowerInput & { indonesiaPowerAdded: number; totalIndonesiaPower: number; currentLevel: string; nextLevelThreshold: number | null; pointsToNextLevel: number | null };

export const levelConfiguration = [
  { id: 'STARTING', nameZh: '刚刚开始', min: 0, max: 49 },
  { id: 'L1', nameZh: '印尼新人', min: 50, max: 100 }, { id: 'L2', nameZh: '日常开口', min: 101, max: 260 },
  { id: 'L3', nameZh: '生活沟通', min: 261, max: 500 }, { id: 'L4', nameZh: '独立生活', min: 501, max: 800 },
  { id: 'L5', nameZh: '熟练生活', min: 801, max: 1200 }, { id: 'L6', nameZh: '职场开口', min: 1201, max: 1800 },
  { id: 'L7', nameZh: '工作沟通', min: 1801, max: 2600 }, { id: 'L8', nameZh: '团队协作', min: 2601, max: 3600 },
  { id: 'L9', nameZh: '商务达人', min: 3601, max: 5000 }, { id: 'L10', nameZh: '印尼通', min: 5001, max: Number.POSITIVE_INFINITY },
] as const;

export function calculateIndonesiaPower(input: IndonesiaPowerInput) {
  return input.newlyCompletedExperienceCount * indonesiaPowerRules.experienceCompleted
    + input.newlyMasteredHarvestCount * indonesiaPowerRules.uniqueHarvestMastered
    + input.newlyMasteredPatternCount * indonesiaPowerRules.uniquePatternMastered;
}

export function getIndonesiaLevel(totalIndonesiaPower: number) {
  return levelConfiguration.find((level) => totalIndonesiaPower >= level.min && totalIndonesiaPower <= level.max) ?? levelConfiguration[0];
}

export function createCompletionOutcome(input: IndonesiaPowerInput, totalBefore: number): CompletionOutcomeV2 {
  const indonesiaPowerAdded = calculateIndonesiaPower(input);
  const totalIndonesiaPower = totalBefore + indonesiaPowerAdded;
  const current = getIndonesiaLevel(totalIndonesiaPower);
  const next = levelConfiguration[levelConfiguration.indexOf(current) + 1];
  return { ...input, indonesiaPowerAdded, totalIndonesiaPower, currentLevel: current.id, nextLevelThreshold: next?.min ?? null, pointsToNextLevel: next ? Math.max(0, next.min - totalIndonesiaPower) : null };
}
