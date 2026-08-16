import { getDriverExperiences } from '@/lib/driver-experiences';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { getLifeExperiences } from '@/lib/life-experiences';
import { moduleExperiences } from '@/lib/module-experiences';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { getSocialExperiences } from '@/lib/social-experiences';
import { vocabularyLibrary } from '@/lib/vocabulary-library';

type CountableScene = { id: string; indonesian?: string; missing?: boolean; goldenScene?: unknown };

function addScene(target: Map<string, { golden: boolean }>, scene: CountableScene) {
  if (scene.missing || !scene.indonesian) return;
  if (!target.has(scene.id)) target.set(scene.id, { golden: Boolean(scene.goldenScene) });
}

export function getContentStats() {
  const scenes = new Map<string, { golden: boolean }>();

  for (const scene of getDriverExperiences()) addScene(scenes, scene);
  for (const scene of getNannyExperiences()) addScene(scenes, scene);
  for (const scene of getFactoryExperiences()) addScene(scenes, scene);
  for (const scene of getLifeExperiences()) addScene(scenes, scene);
  for (const scene of getSocialExperiences()) addScene(scenes, scene);

  for (const [role, roleScenes] of Object.entries(moduleExperiences)) {
    if (role === 'driver' || role === 'nanny') continue;
    for (const scene of roleScenes) addScene(scenes, scene);
  }

  const values = [...scenes.values()];
  const goldenSceneCount = values.filter((scene) => scene.golden).length;
  const totalUniqueSceneCount = values.length;

  return {
    quickSceneCount: totalUniqueSceneCount - goldenSceneCount,
    goldenSceneCount,
    totalUniqueSceneCount,
    vocabularyCount: vocabularyLibrary.length,
  };
}
