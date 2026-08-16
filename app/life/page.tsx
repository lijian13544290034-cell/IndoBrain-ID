import SceneMapV2Entry from '@/components/SceneMapV2Entry';

export default async function LifePage({ searchParams }: { searchParams: Promise<{ group?: string; topic?: string; type?: string; category?: string }> }) {
  const { group, topic, type, category } = await searchParams;
  return <SceneMapV2Entry groupSlug={group} topicSlug={topic} type={type} legacyCategory={category} />;
}
