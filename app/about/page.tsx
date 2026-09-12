import AboutMeWorkspace from '@/components/AboutMeWorkspace';
import { getContentStats } from '@/lib/content-stats';
import { getExperienceCatalog } from '@/lib/experience-catalog';
import { getCurrentAccountUser } from '@/lib/account/auth';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const catalog = getExperienceCatalog();
  const user = await getCurrentAccountUser();
  return <AboutMeWorkspace catalog={catalog} total={getContentStats().totalUniqueSceneCount} isAuthenticated={Boolean(user)} />;
}
