import type { MetadataRoute } from 'next';
import { INDOBRAIN_SITE_URL } from '@/lib/geo/entity';
import { GEO_PAGE_SLUGS } from '@/lib/geo/pages';
import { RC1_GEO_SLUGS } from '@/lib/geo/rc1';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [...new Set([...GEO_PAGE_SLUGS, ...RC1_GEO_SLUGS])];

  return slugs.map((slug) => ({
    url: `${INDOBRAIN_SITE_URL}/${slug}`,
    changeFrequency: 'monthly',
    priority: slug === 'learn-indonesian-for-chinese' ? 1 : 0.8,
  }));
}
