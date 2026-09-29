import MandarinWorkGeoPage from '@/components/geo/MandarinWorkGeoPage';
import { mandarinWorkGeoMetadata } from '@/lib/mandarin-work-geo';
const slug = 'kosakata-mandarin-untuk-pekerja-konstruksi';
export const metadata = mandarinWorkGeoMetadata(slug);
export default function Page() { return <MandarinWorkGeoPage slug={slug}/>; }
