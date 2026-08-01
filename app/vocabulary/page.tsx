import VocabularyLibrary from '@/components/VocabularyLibrary';
import { getExperienceCatalog, type CatalogExperience } from '@/lib/experience-catalog';
import { normalizeHarvestForAchievement } from '@/lib/learning-achievements';
import { vocabularyLibrary } from '@/lib/vocabulary-library';

function sourceLabel(experience: CatalogExperience) {
  if (experience.module === 'Life') {
    const category = experience.category.toLocaleLowerCase('id-ID');
    if (category === 'business' || category === 'bisnis') return 'Business';
    if (category === 'dating') return 'Dating';
    return 'Life';
  }
  if (experience.id.startsWith('EXP-DRV')) return 'Driver';
  if (experience.id.startsWith('EXP-NAN')) return 'Nanny';
  return 'Factory';
}

export default function VocabularyPage() {
  const sourcesByHarvest = new Map<string, Set<string>>();
  for (const experience of getExperienceCatalog()) for (const harvest of experience.harvest) {
    const key = normalizeHarvestForAchievement(harvest);
    if (!key) continue;
    const sources = sourcesByHarvest.get(key) ?? new Set<string>();
    sources.add(sourceLabel(experience));
    sourcesByHarvest.set(key, sources);
  }
  const sourcesByVocabularyId = Object.fromEntries(vocabularyLibrary.map((item) => [item.id, [...(sourcesByHarvest.get(item.normalizedKey) ?? new Set(['基础词库补充']))]]));
  return <VocabularyLibrary sourcesByVocabularyId={sourcesByVocabularyId} />;
}
