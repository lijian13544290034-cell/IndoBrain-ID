type ExperienceWithId = { id: string };

type CategoryDefinition = {
  slug: string;
  ids: readonly number[];
};

const getExperienceNumber = (id: string) => Number(id.slice(-3));

export function filterExperiencesByCategory<T extends ExperienceWithId>(
  experiences: readonly T[],
  categories: readonly CategoryDefinition[],
  selected?: string,
  isVisible: (experience: T) => boolean = () => true,
) {
  const visibleExperiences = experiences.filter(isVisible);
  const category = categories.find((item) => item.slug === selected);

  if (!category) return visibleExperiences;

  return visibleExperiences.filter((experience) => category.ids.includes(getExperienceNumber(experience.id)));
}

export function getExperienceCategoryCounts<T extends ExperienceWithId>(
  experiences: readonly T[],
  categories: readonly CategoryDefinition[],
  isVisible: (experience: T) => boolean = () => true,
) {
  const all = filterExperiencesByCategory(experiences, categories, undefined, isVisible);

  return {
    all: all.length,
    byCategory: Object.fromEntries(
      categories.map((category) => [
        category.slug,
        filterExperiencesByCategory(experiences, categories, category.slug, isVisible).length,
      ]),
    ) as Record<string, number>,
  };
}
