import EssentialsModulePage from '@/components/EssentialsModulePage';
import { getEssentials, socialEssentialCategories } from '@/lib/essentials';
import { getSocialExperiences } from '@/lib/social-experiences';

export default function SocialEssentialsPage() {
  return <EssentialsModulePage title="Social" chinese="社交" experienceHref="/social" experienceCount={getSocialExperiences().length} items={getEssentials('social')} categories={socialEssentialCategories} description="Ungkapan sosial yang bisa dicari dan dipakai dengan cepat" chineseDescription="随时查找、马上使用的自然社交短句" />;
}
