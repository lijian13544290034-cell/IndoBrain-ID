import { basicRealUseGroupBindings, basicRealUseUnits } from '@/lib/basic-real-use';
import { getEssentials, type Essential } from '@/lib/essentials';
import { getHistoricalMicroReachableIds } from '@/lib/historical-micro-navigation';
import { getHistoricalQuickExperiences, resolveHistoricalQuickExperience, type QuickExperienceLearningUnit } from '@/lib/quick-experience-adapter';
import { getSceneMapEntries, sceneMapV2, type SceneMapLevel2Slug } from '@/lib/scene-map-v2';

export type MicroSceneSourceType = 'REAL_USE' | 'QUICK_EXPERIENCE' | 'ESSENTIAL';
export type MicroSceneDifficulty = 1 | 2 | 3;
export type MicroSceneReviewStatus = 'READY' | 'UNMAPPED_REVIEW';

export type MicroSceneMapping = {
  level1: SceneMapLevel2Slug;
  level2: string;
};

export type MicroSceneIndexItem = {
  assetId: string;
  sourceType: MicroSceneSourceType;
  sourceId: string;
  primaryMapping?: MicroSceneMapping;
  secondaryMappings: MicroSceneMapping[];
  difficulty: MicroSceneDifficulty;
  priority: number;
  tags: string[];
  enabled: boolean;
  reviewStatus: MicroSceneReviewStatus;
};

export type MicroSceneLine = {
  indonesian: string;
  chinese: string;
  ttsText: string;
};

export type MicroSceneCard = MicroSceneIndexItem & {
  title: string;
  lines: MicroSceneLine[];
  progressKey: string;
};

export type QuickMicroSceneCard = MicroSceneIndexItem & QuickExperienceLearningUnit & {
  primaryMapping: MicroSceneMapping;
  progressKey: string;
  legacyProgressKeys: string[];
};

export type MicroSceneTopicSummary = {
  slug: string;
  title: string;
  subtitle: string;
  count: number;
};

export type MicroSceneDomainSummary = {
  slug: SceneMapLevel2Slug;
  icon: string;
  title: string;
  subtitle: string;
  count: number;
  topics: MicroSceneTopicSummary[];
};

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('id-ID');
const mappingKey = (mapping: MicroSceneMapping) => `${mapping.level1}:${mapping.level2}`;
const progressKey = (assetId: string) => `micro:${assetId}`;
const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

function difficultyFor(text: string): MicroSceneDifficulty {
  const count = wordCount(text);
  if (count <= 3) return 1;
  if (count <= 8) return 2;
  return 3;
}

const realUseTopicBySubcategory: Record<string, MicroSceneMapping> = {
  vegetables: { level1: 'life-home', level2: 'belanja-konsumsi' },
  fruits: { level1: 'life-home', level2: 'belanja-konsumsi' },
  'meat-seafood': { level1: 'life-home', level2: 'belanja-konsumsi' },
  seasonings: { level1: 'life-home', level2: 'masak-makan' },
  staples: { level1: 'life-home', level2: 'masak-makan' },
  drinks: { level1: 'life-home', level2: 'masak-makan' },
  'taste-texture': { level1: 'life-home', level2: 'masak-makan' },
  'cooking-actions': { level1: 'life-home', level2: 'masak-makan' },
  'home-items': { level1: 'life-home', level2: 'rumah-harian' },
  'kitchen-items': { level1: 'life-home', level2: 'masak-makan' },
  'personal-care': { level1: 'life-home', level2: 'rumah-harian' },
  'cleaning-laundry': { level1: 'life-home', level2: 'urusan-rumah' },
  'personal-electronics': { level1: 'life-home', level2: 'rumah-harian' },
  'car-ride': { level1: 'transport', level2: 'pickup-dropoff' },
  motorbike: { level1: 'transport', level2: 'route-change' },
  'road-parking': { level1: 'transport', level2: 'parking-waiting' },
  fuel: { level1: 'transport', level2: 'daily-errands' },
  'ev-charging': { level1: 'transport', level2: 'daily-errands' },
  airport: { level1: 'transport', level2: 'airport-pickup' },
};

const essentialCategoryMappings: Record<string, MicroSceneMapping> = {
  arah: { level1: 'transport', level2: 'route-change' },
  navigasi: { level1: 'transport', level2: 'route-change' },
  'berhenti-menunggu': { level1: 'transport', level2: 'parking-waiting' },
  'kecepatan-berkendara': { level1: 'transport', level2: 'route-change' },
  tempat: { level1: 'transport', level2: 'daily-errands' },
  'waktu-koordinasi': { level1: 'transport', level2: 'pickup-dropoff' },
  'anak-bayi': { level1: 'life-home', level2: 'rumah-harian' },
  'makan-minum': { level1: 'life-home', level2: 'masak-makan' },
  'tidur-mandi': { level1: 'life-home', level2: 'rumah-harian' },
  'rumah-kebersihan': { level1: 'life-home', level2: 'urusan-rumah' },
  'belanja-persediaan': { level1: 'life-home', level2: 'antar-persediaan' },
  'kesehatan-keamanan': { level1: 'public-service', level2: 'medical-pharmacy' },
  produksi: { level1: 'work-business', level2: 'factory-production' },
  'qc-cacat': { level1: 'work-business', level2: 'quality-management' },
  'gudang-stok': { level1: 'work-business', level2: 'warehouse-logistics' },
  'purchasing-supplier': { level1: 'work-business', level2: 'supplier-purchasing' },
  'operator-mesin': { level1: 'work-business', level2: 'factory-production' },
  'pengiriman-ekspor': { level1: 'work-business', level2: 'warehouse-logistics' },
  'keamanan-koordinasi': { level1: 'work-business', level2: 'quality-management' },
  'alat-keselamatan': { level1: 'work-business', level2: 'quality-management' },
  'peralatan-gudang': { level1: 'work-business', level2: 'warehouse-logistics' },
  'sapaan-kenalan': { level1: 'social-relationship', level2: 'new-friends' },
  'obrolan-santai': { level1: 'social-relationship', level2: 'daily-friendship' },
  'whatsapp-kontak': { level1: 'social-relationship', level2: 'new-friends' },
  'ngopi-makan': { level1: 'social-relationship', level2: 'daily-friendship' },
  'respons-cepat': { level1: 'social-relationship', level2: 'daily-friendship' },
  'peduli-sopan': { level1: 'social-relationship', level2: 'daily-friendship' },
};

function buildQuickIndex() {
  const byAsset = new Map<string, MicroSceneIndexItem>();
  for (const domain of sceneMapV2) {
    for (const topic of domain.topics) {
      for (const entry of getSceneMapEntries(topic).filter((item) => item.kind === 'quick')) {
        const mapping = { level1: domain.slug, level2: topic.slug };
        const current = byAsset.get(entry.id);
        if (current) {
          if (current.primaryMapping && mappingKey(current.primaryMapping) !== mappingKey(mapping) && !current.secondaryMappings.some((item) => mappingKey(item) === mappingKey(mapping))) {
            current.secondaryMappings.push(mapping);
          }
          continue;
        }
        byAsset.set(entry.id, {
          assetId: entry.id,
          sourceType: 'QUICK_EXPERIENCE',
          sourceId: entry.id,
          primaryMapping: mapping,
          secondaryMappings: [],
          difficulty: difficultyFor(entry.indonesian),
          priority: 200,
          tags: [domain.slug, topic.slug],
          enabled: true,
          reviewStatus: 'READY',
        });
      }
    }
  }
  return [...byAsset.values()];
}

function buildUnmappedQuickReviewIndex(mappedQuick: MicroSceneIndexItem[]) {
  const mappedIds = new Set(mappedQuick.map((item) => item.sourceId));
  return getHistoricalQuickExperiences().flatMap((source) => mappedIds.has(source.sourceId) ? [] : [{
    assetId: source.sourceId,
    sourceType: 'QUICK_EXPERIENCE' as const,
    sourceId: source.sourceId,
    secondaryMappings: [],
    difficulty: difficultyFor(source.indonesian),
    priority: 999,
    tags: ['unmapped-review'],
    enabled: false,
    reviewStatus: 'UNMAPPED_REVIEW' as const,
  }]);
}

function buildEssentialIndex() {
  return (['driver', 'nanny', 'factory', 'social'] as const).flatMap((role) => getEssentials(role)).flatMap((item) => {
    const mapping = essentialCategoryMappings[item.category];
    if (!mapping) return [];
    return [{
      assetId: item.id,
      sourceType: 'ESSENTIAL' as const,
      sourceId: item.id,
      primaryMapping: mapping,
      secondaryMappings: [],
      difficulty: difficultyFor(item.indonesian),
      priority: 100 + item.sortOrder,
      tags: [item.module, item.category],
      enabled: true,
      reviewStatus: 'READY' as const,
    }];
  });
}

function buildRealUseIndex() {
  return basicRealUseGroupBindings.flatMap((binding) => {
    const mapping = realUseTopicBySubcategory[binding.subcategoryId];
    const unit = basicRealUseUnits.find((item) => item.id === binding.realUseId);
    if (!mapping || !unit) return [];
    const longestLine = unit.items.reduce((longest, item) => item.indonesian.length > longest.length ? item.indonesian : longest, '');
    const secondaryMappings = binding.subcategoryId === 'airport'
      ? [{ level1: 'travel-emergency' as const, level2: 'airport-help' }]
      : [];
    return [{
      assetId: unit.id,
      sourceType: 'REAL_USE' as const,
      sourceId: unit.id,
      primaryMapping: mapping,
      secondaryMappings,
      difficulty: difficultyFor(longestLine),
      priority: 50 + binding.group,
      tags: [binding.categoryId, binding.subcategoryId],
      enabled: true,
      reviewStatus: 'READY' as const,
    }];
  });
}

const mappedQuickIndex = buildQuickIndex();

export const microSceneIndex: MicroSceneIndexItem[] = [
  ...buildRealUseIndex(),
  ...buildEssentialIndex(),
  ...mappedQuickIndex,
  ...buildUnmappedQuickReviewIndex(mappedQuickIndex),
];

const quickById = new Map(sceneMapV2.flatMap((domain) => domain.topics.flatMap((topic) => getSceneMapEntries(topic))).map((item) => [item.id, item]));
const realUseById = new Map(basicRealUseUnits.map((item) => [item.id, item]));
const essentialsById = new Map((['driver', 'nanny', 'factory', 'social'] as const).flatMap((module) => getEssentials(module)).map((item) => [item.id, item]));

function resolveEssential(item: Essential): MicroSceneLine[] {
  return [{ indonesian: item.indonesian, chinese: item.chinese, ttsText: item.indonesian }];
}

export function resolveMicroScene(indexItem: MicroSceneIndexItem): MicroSceneCard | undefined {
  if (indexItem.sourceType === 'REAL_USE') {
    const source = realUseById.get(indexItem.sourceId);
    if (!source) return undefined;
    return { ...indexItem, title: source.contextZh ?? source.titleZh, lines: source.items.map((item) => ({ indonesian: item.indonesian, chinese: item.chinese, ttsText: item.ttsText })), progressKey: progressKey(indexItem.assetId) };
  }
  if (indexItem.sourceType === 'ESSENTIAL') {
    const source = essentialsById.get(indexItem.sourceId);
    if (!source) return undefined;
    return { ...indexItem, title: source.chinese, lines: resolveEssential(source), progressKey: progressKey(indexItem.assetId) };
  }
  const source = quickById.get(indexItem.sourceId);
  if (!source) return undefined;
  return { ...indexItem, title: source.title, lines: [{ indonesian: source.indonesian, chinese: source.title, ttsText: source.indonesian }], progressKey: progressKey(indexItem.assetId) };
}

export function getVisibleMicroScenes() {
  const seenContent = new Set<string>();
  return microSceneIndex
    .filter((item) => item.enabled && item.reviewStatus === 'READY')
    .sort((a, b) => a.difficulty - b.difficulty || a.priority - b.priority || a.assetId.localeCompare(b.assetId, 'en', { numeric: true }))
    .flatMap((item) => {
      const resolved = resolveMicroScene(item);
      if (!resolved || !resolved.lines.length) return [];
      const contentKey = resolved.lines.map((line) => `${normalize(line.indonesian)}|${normalize(line.chinese)}`).join('||');
      if (seenContent.has(contentKey)) return [];
      seenContent.add(contentKey);
      return [resolved];
    });
}

export function getMicroScenesForTopic(level1: string, level2: string) {
  return getVisibleMicroScenes().filter((item) => {
    const mappings = [item.primaryMapping, ...item.secondaryMappings].filter((mapping): mapping is MicroSceneMapping => Boolean(mapping));
    return mappings.some((mapping) => mapping.level1 === level1 && mapping.level2 === level2);
  });
}

export function resolveQuickMicroScene(indexItem: MicroSceneIndexItem): QuickMicroSceneCard | undefined {
  if (indexItem.sourceType !== 'QUICK_EXPERIENCE' || !indexItem.primaryMapping || indexItem.reviewStatus !== 'READY') return undefined;
  const source = resolveHistoricalQuickExperience(indexItem.sourceId);
  if (!source) return undefined;
  return {
    ...indexItem,
    ...source,
    primaryMapping: indexItem.primaryMapping,
    progressKey: indexItem.sourceId,
    legacyProgressKeys: [progressKey(indexItem.sourceId)],
  };
}

function avoidAdjacentDuplicateExpressions(items: QuickMicroSceneCard[]) {
  const ordered = [...items];
  for (let index = 1; index < ordered.length; index += 1) {
    if (normalize(ordered[index - 1].indonesian) !== normalize(ordered[index].indonesian)) continue;
    const replacementIndex = ordered.findIndex((item, candidateIndex) => candidateIndex > index && normalize(item.indonesian) !== normalize(ordered[index - 1].indonesian));
    if (replacementIndex > index) [ordered[index], ordered[replacementIndex]] = [ordered[replacementIndex], ordered[index]];
  }
  return ordered;
}

export function getQuickMicroScenesForTopic(level1: string, level2: string) {
  const items = mappedQuickIndex.flatMap((item) => {
    const mappings = [item.primaryMapping, ...item.secondaryMappings].filter((mapping): mapping is MicroSceneMapping => Boolean(mapping));
    if (!mappings.some((mapping) => mapping.level1 === level1 && mapping.level2 === level2)) return [];
    const resolved = resolveQuickMicroScene(item);
    return resolved ? [resolved] : [];
  });
  return avoidAdjacentDuplicateExpressions(items);
}

export function getMicroSceneDomains(): MicroSceneDomainSummary[] {
  const visible = getVisibleMicroScenes();
  return sceneMapV2.map((domain) => {
    const topics = domain.topics.map((topic) => ({
      slug: topic.slug,
      title: topic.title,
      subtitle: topic.subtitle,
      count: visible.filter((item) => [item.primaryMapping, ...item.secondaryMappings].some((mapping) => mapping?.level1 === domain.slug && mapping.level2 === topic.slug)).length,
    }));
    const domainAssetIds = new Set(visible.filter((item) => [item.primaryMapping, ...item.secondaryMappings].some((mapping) => mapping?.level1 === domain.slug)).map((item) => item.assetId));
    return { slug: domain.slug, icon: domain.icon, title: domain.title, subtitle: domain.subtitle, count: domainAssetIds.size, topics };
  });
}

export function getQuickMicroSceneDomains(): MicroSceneDomainSummary[] {
  return sceneMapV2.map((domain) => {
    const topics = domain.topics.map((topic) => ({
      slug: topic.slug,
      title: topic.title,
      subtitle: topic.subtitle,
      count: getQuickMicroScenesForTopic(domain.slug, topic.slug).length,
    }));
    const domainAssetIds = new Set(mappedQuickIndex.filter((item) => [item.primaryMapping, ...item.secondaryMappings].some((mapping) => mapping?.level1 === domain.slug)).map((item) => item.assetId));
    return { slug: domain.slug, icon: domain.icon, title: domain.title, subtitle: domain.subtitle, count: domainAssetIds.size, topics };
  });
}

export function getMicroSceneStats() {
  const visible = getVisibleMicroScenes();
  const unmappedReview = microSceneIndex.filter((item) => item.sourceType === 'QUICK_EXPERIENCE' && item.reviewStatus === 'UNMAPPED_REVIEW');
  const historicalReachableCount = getHistoricalMicroReachableIds().length;
  return {
    level1Count: sceneMapV2.length,
    level2Count: sceneMapV2.reduce((total, domain) => total + domain.topics.length, 0),
    mappedAssetCount: microSceneIndex.filter((item) => item.primaryMapping).length,
    visibleAssetCount: historicalReachableCount,
    sceneMapMappedQuickCount: mappedQuickIndex.length,
    supportingVisibleAssetCount: visible.length,
    unmappedReviewCount: unmappedReview.length,
    sourceCounts: {
      REAL_USE: visible.filter((item) => item.sourceType === 'REAL_USE').length,
      QUICK_EXPERIENCE: visible.filter((item) => item.sourceType === 'QUICK_EXPERIENCE').length,
      ESSENTIAL: visible.filter((item) => item.sourceType === 'ESSENTIAL').length,
    },
  };
}
