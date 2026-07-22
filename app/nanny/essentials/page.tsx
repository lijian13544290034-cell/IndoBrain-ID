import EssentialsModulePage from '@/components/EssentialsModulePage';
import { getEssentials, nannyEssentialCategories } from '@/lib/essentials';
import { getNannyExperiences } from '@/lib/nanny-experiences';

export default function NannyEssentialsPage() {
  return <EssentialsModulePage title="Asisten Rumah Tangga" chinese="保姆" experienceHref="/nanny" experienceCount={getNannyExperiences().length} items={getEssentials('nanny')} categories={nannyEssentialCategories} description="Ungkapan rumah tangga yang bisa dicari dan dipakai dengan cepat" chineseDescription="随时查找、马上使用的家庭沟通短句" />;
}
