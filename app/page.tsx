import V2HomeDashboard from '@/components/V2HomeDashboard';
import { getExperienceCatalog } from '@/lib/experience-catalog';

export default function Home() {
  return <V2HomeDashboard catalog={getExperienceCatalog()} />;
}
