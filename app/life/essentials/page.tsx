import EssentialsModulePage from '@/components/EssentialsModulePage';
import { getEssentials, socialEssentialCategories } from '@/lib/essentials';
import { getLifeExperiences } from '@/lib/life-experiences';

export default function LifeEssentialsPage() {
  return <EssentialsModulePage title="Life" chinese="生活" experienceHref="/life" experienceCount={getLifeExperiences().length} items={getEssentials('social')} categories={socialEssentialCategories} description="Ungkapan kehidupan yang bisa dicari dan dipakai dengan cepat" chineseDescription="随时查找、马上使用的印尼生活表达" />;
}
