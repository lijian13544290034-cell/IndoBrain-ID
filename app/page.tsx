import V2HomeDashboard from '@/components/V2HomeDashboard';
import { getContentStats } from '@/lib/content-stats';
import { getExperienceCatalog } from '@/lib/experience-catalog';
import { getMicroSceneStats } from '@/lib/micro-scenes';
import { getBasicSearchEntries } from '@/lib/basic-essentials';

export default function Home() {
  return <V2HomeDashboard catalog={getExperienceCatalog()} contentStats={getContentStats()} microSceneStats={getMicroSceneStats()} basicSearchEntries={getBasicSearchEntries()} />;
}
