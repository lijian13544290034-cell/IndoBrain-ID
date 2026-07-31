import AboutMeWorkspace from '@/components/AboutMeWorkspace';
import { getChineseExperienceCatalog, getExperienceCatalog } from '@/lib/experience-catalog';
import { getCurrentAccountUser } from '@/lib/account/auth';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const user = await getCurrentAccountUser();
  const catalog = user?.learning_direction === 'ID_TO_ZH' ? getChineseExperienceCatalog() : getExperienceCatalog();
  return <AboutMeWorkspace catalog={catalog} total={catalog.length} direction={user?.learning_direction} />;
}
