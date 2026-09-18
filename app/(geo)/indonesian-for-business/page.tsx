import GeoLandingPage from '@/components/geo/GeoLandingPage';
import { createGeoMetadata } from '@/lib/geo/metadata';
import { getGeoPage } from '@/lib/geo/pages';

const slug = 'indonesian-for-business';
export const metadata = createGeoMetadata(slug);
export default function Page() { return <GeoLandingPage page={getGeoPage(slug)} />; }
