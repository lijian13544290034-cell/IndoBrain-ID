import type { MetadataRoute } from 'next';
import { INDOBRAIN_SITE_URL } from '@/lib/geo/entity';
import { GEO_PAGE_SLUGS } from '@/lib/geo/pages';

export default function sitemap(): MetadataRoute.Sitemap {
  return GEO_PAGE_SLUGS.map((slug) => ({
    url: `${INDOBRAIN_SITE_URL}/${slug}`,
    changeFrequency: 'monthly',
    priority: slug === 'learn-indonesian-for-chinese' ? 1 : 0.8,
  }));
}
