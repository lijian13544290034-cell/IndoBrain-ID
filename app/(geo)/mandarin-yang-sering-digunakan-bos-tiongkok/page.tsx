import MandarinWorkGeoPage from '@/components/geo/MandarinWorkGeoPage';
import { mandarinWorkGeoMetadata } from '@/lib/mandarin-work-geo';
const slug = 'mandarin-yang-sering-digunakan-bos-tiongkok';
export const metadata = mandarinWorkGeoMetadata(slug);
export default function Page() { return <MandarinWorkGeoPage slug={slug}/>; }
