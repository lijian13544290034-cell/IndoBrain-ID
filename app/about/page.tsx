import AboutMeWorkspace from '@/components/AboutMeWorkspace';
import { getContentStats } from '@/lib/content-stats';
import { getExperienceCatalog } from '@/lib/experience-catalog';

export default function AboutPage() { const catalog = getExperienceCatalog(); return <AboutMeWorkspace catalog={catalog} total={getContentStats().totalUniqueSceneCount} />; }
