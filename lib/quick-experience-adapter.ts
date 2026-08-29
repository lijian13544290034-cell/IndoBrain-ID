import { getDriverExperiences } from '@/lib/driver-experiences';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { getLifeExperiences } from '@/lib/life-experiences';
import { moduleExperiences, type ModuleRole } from '@/lib/module-experiences';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { getSocialExperiences } from '@/lib/social-experiences';
import type { WorkplacePattern } from '@/lib/workplace-patterns';

export type QuickExperienceSource = 'driver' | 'nanny' | 'factory' | 'life' | 'social' | 'module';

export type QuickExperienceLearningUnit = {
  sourceId: string;
  source: QuickExperienceSource;
  sceneTitle: string;
  momentTitle?: string;
  indonesian: string;
  chinese: string;
  explanation: string;
  harvest: string[];
  pattern?: WorkplacePattern;
  insight?: { indonesian: string; chinese: string };
  content?: string;
};

type QuickSourceItem = {
  id: string;
  task: string;
  indonesian: string;
  chinese?: string;
  explanation?: string;
  harvest: string[];
  pattern?: WorkplacePattern;
  momentTitle?: string;
  insight?: { indonesian: string; chinese: string };
  content?: string;
  goldenScene?: unknown;
  missing?: boolean;
};

const isQuick = (item: QuickSourceItem) => !item.goldenScene && !item.missing && Boolean(item.indonesian);

function adapt(item: QuickSourceItem, source: QuickExperienceSource): QuickExperienceLearningUnit {
  return {
    sourceId: item.id,
    source,
    sceneTitle: item.task,
    momentTitle: item.momentTitle,
    indonesian: item.indonesian,
    chinese: item.chinese ?? item.task,
    explanation: item.explanation ?? '',
    harvest: item.harvest,
    pattern: item.pattern,
    insight: item.insight,
    content: item.content,
  };
}

function buildHistoricalQuickExperiencePool() {
  const driver = getDriverExperiences().filter(isQuick).map((item) => adapt(item, 'driver'));
  const nanny = getNannyExperiences().filter(isQuick).map((item) => adapt(item, 'nanny'));
  const factory = getFactoryExperiences().filter(isQuick).map((item) => adapt(item, 'factory'));
  const life = getLifeExperiences()
    .filter((item) => item.id.startsWith('EXP-LIF-') && isQuick(item))
    .map((item) => adapt(item, 'life'));
  const social = getSocialExperiences().filter(isQuick).map((item) => adapt(item, 'social'));
  const module = (Object.entries(moduleExperiences) as [ModuleRole, QuickSourceItem[]][])
    .filter(([role]) => role !== 'driver' && role !== 'nanny')
    .flatMap(([, items]) => items.filter(isQuick).map((item) => adapt(item, 'module')));

  return [...driver, ...nanny, ...factory, ...life, ...social, ...module];
}

const historicalQuickExperiences = buildHistoricalQuickExperiencePool();
const historicalQuickById = new Map(historicalQuickExperiences.map((item) => [item.sourceId, item]));

export function getHistoricalQuickExperiences() {
  return historicalQuickExperiences;
}

export function resolveHistoricalQuickExperience(sourceId: string) {
  return historicalQuickById.get(sourceId);
}
