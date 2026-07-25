import AboutMeWorkspace from '@/components/AboutMeWorkspace';
import { getExperienceCatalog } from '@/lib/experience-catalog';

export default function AboutPage() { const catalog = getExperienceCatalog(); return <AboutMeWorkspace catalog={catalog} total={catalog.length} />; }
