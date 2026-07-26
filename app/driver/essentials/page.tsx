import EssentialsModulePage from '@/components/EssentialsModulePage';
import { driverEssentialCategories, getEssentials } from '@/lib/essentials';
import { getDriverExperiences } from '@/lib/driver-experiences';

export default function DriverEssentialsPage() {
  return <EssentialsModulePage
    title="Sopir"
    chinese="司机"
    experienceHref="/driver"
    experienceCount={getDriverExperiences().length}
    items={getEssentials('driver')}
    categories={driverEssentialCategories}
    description="Ungkapan sopir yang sering dipakai untuk dicari dan digunakan dengan cepat"
    chineseDescription="高频司机表达，随时查找、马上使用"
  />;
}
