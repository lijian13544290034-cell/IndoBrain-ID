import type { Metadata } from 'next';
import MicroSceneLibrary from '@/components/MicroSceneLibrary';

export const metadata: Metadata = {
  title: '微场景 · IndoBrain',
  description: '短句马上能用。',
};

export default async function MicroScenesPage({ searchParams }: { searchParams: Promise<{ module?: string; role?: string; category?: string; scene?: string }> }) {
  const { module, role, category, scene } = await searchParams;
  return <MicroSceneLibrary moduleSlug={module} roleSlug={role} categorySlug={category} sceneId={scene} />;
}
