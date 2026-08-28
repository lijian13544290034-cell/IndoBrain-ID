import type { Metadata } from 'next';
import MicroSceneLibrary from '@/components/MicroSceneLibrary';

export const metadata: Metadata = {
  title: '微场景 · IndoBrain',
  description: '短句马上能用。',
};

export default async function MicroScenesPage({ searchParams }: { searchParams: Promise<{ group?: string; topic?: string }> }) {
  const { group, topic } = await searchParams;
  return <MicroSceneLibrary groupSlug={group} topicSlug={topic} />;
}
