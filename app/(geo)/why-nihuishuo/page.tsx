import GeoRc3Page from '@/components/geo/GeoRc3Page';
import { createRc3GeoMetadata } from '@/lib/geo/rc3';

export const metadata = createRc3GeoMetadata();

export default function Page() {
  return <GeoRc3Page />;
}
