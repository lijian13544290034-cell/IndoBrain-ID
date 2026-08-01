import type { CatalogExperience } from '@/lib/experience-catalog';
import { harvestTerm } from '@/lib/harvest';

export type LearningAchievementStats = {
  completedExperienceCount: number;
  masteredHarvestCount: number;
  recentlyCompleted: CatalogExperience[];
};

const stripEdgePunctuation = (value: string) => value
  .replace(/^[\s.,;:!?。！？、]+|[\s.,;:!?。！？、]+$/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

export function normalizeHarvestForAchievement(entry: string) {
  return stripEdgePunctuation(harvestTerm(entry)).toLocaleLowerCase('id-ID');
}

export function getLearningAchievementStats(
  completedExperienceIds: readonly string[],
  catalog: readonly CatalogExperience[],
): LearningAchievementStats {
  const completedIdSet = new Set(completedExperienceIds);
  const completed = catalog.filter((experience) => completedIdSet.has(experience.id));
  const masteredHarvest = new Set<string>();

  completed.forEach((experience) => {
    experience.harvest.forEach((entry) => {
      const normalized = normalizeHarvestForAchievement(entry);
      if (normalized) masteredHarvest.add(normalized);
    });
  });

  const catalogById = new Map(catalog.map((experience) => [experience.id, experience]));
  const recentlyCompleted = [...completedExperienceIds]
    .reverse()
    .map((id) => catalogById.get(id))
    .filter((experience): experience is CatalogExperience => Boolean(experience))
    .slice(0, 5);

  return {
    completedExperienceCount: completed.length,
    masteredHarvestCount: masteredHarvest.size,
    recentlyCompleted,
  };
}

export function getNewlyMasteredHarvestCount(
  completedExperienceIdsBefore: readonly string[],
  currentHarvest: readonly string[],
  catalog: readonly CatalogExperience[],
) {
  const masteredBefore = new Set<string>();

  catalog
    .filter((experience) => completedExperienceIdsBefore.includes(experience.id))
    .forEach((experience) => experience.harvest.forEach((entry) => {
      const normalized = normalizeHarvestForAchievement(entry);
      if (normalized) masteredBefore.add(normalized);
    }));

  return new Set(
    currentHarvest
      .map(normalizeHarvestForAchievement)
      .filter((term) => term && !masteredBefore.has(term)),
  ).size;
}
