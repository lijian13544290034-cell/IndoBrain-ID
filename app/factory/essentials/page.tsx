import EssentialsModulePage from '@/components/EssentialsModulePage';
import { factoryEssentialCategories, getEssentials } from '@/lib/essentials';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { moduleExperiences } from '@/lib/module-experiences';

const factoryRoles = ['production', 'warehouse', 'qc', 'purchasing', 'operator', 'logistics', 'shipping', 'export', 'customerService'] as const;

export default function FactoryEssentialsPage() {
  const experienceCount = getFactoryExperiences().length + factoryRoles.reduce((total, role) => total + moduleExperiences[role].length, 0);
  return <EssentialsModulePage title="Pabrik" chinese="工厂" experienceHref="/factory" experienceCount={experienceCount} items={getEssentials('factory')} categories={factoryEssentialCategories} description="Ungkapan kerja pabrik yang bisa dicari dan dipakai dengan cepat" chineseDescription="随时查找、马上使用的工厂沟通短句" />;
}
