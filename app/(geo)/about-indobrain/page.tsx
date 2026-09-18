import GeoRc1Page from '@/components/geo/GeoRc1Page';
import { createRc1GeoMetadata, RC1_GEO_PAGES } from '@/lib/geo/rc1';

const slug = 'about-indobrain';

export const metadata = createRc1GeoMetadata(slug);

export default function Page() {
  return <GeoRc1Page page={RC1_GEO_PAGES[slug]} />;
}
