import type { CatalogExperience } from '@/lib/experience-catalog';

type NavigationEntry = Pick<CatalogExperience, 'id' | 'href'>;

function normalizedQuery(query: string | undefined) {
  return query?.trim().toLocaleLowerCase('id-ID') ?? '';
}

function matchesQuery(experience: CatalogExperience, query: string) {
  return [experience.id, experience.task, experience.indonesian, ...experience.harvest]
    .join(' ')
    .toLocaleLowerCase('id-ID')
    .includes(query);
}

export function withSearchContext(href: string, query: string) {
  const term = query.trim();
  if (!term) return href;
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}search=${encodeURIComponent(term)}`;
}

export function getSearchNavigation(catalog: readonly CatalogExperience[], currentExperienceId: string, search: string | undefined): { previous?: NavigationEntry; next?: NavigationEntry } | null {
  const query = normalizedQuery(search);
  if (!query) return null;
  const results = catalog.filter((experience) => matchesQuery(experience, query)).slice(0, 5);
  const index = results.findIndex((experience) => experience.id === currentExperienceId);
  if (index === -1) return null;
  const entry = (experience: CatalogExperience | undefined) => experience ? { id: experience.id, href: withSearchContext(experience.href, search ?? '') } : undefined;
  return { previous: entry(results[index - 1]), next: entry(results[index + 1]) };
}
