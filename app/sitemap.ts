import type { MetadataRoute } from 'next';
import { INDOBRAIN_SITE_URL } from '@/lib/geo/entity';
import { GEO_PAGE_SLUGS } from '@/lib/geo/pages';
import { RC1_GEO_SLUGS } from '@/lib/geo/rc1';
import { RC3_GEO_SLUG } from '@/lib/geo/rc3';
import { MANDARIN_WORK_GEO_SLUGS } from '@/lib/mandarin-work-geo';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [...new Set([...GEO_PAGE_SLUGS, ...RC1_GEO_SLUGS, RC3_GEO_SLUG, ...MANDARIN_WORK_GEO_SLUGS])];

  return [...slugs.map((slug) => ({
    url: `${INDOBRAIN_SITE_URL}/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: slug === 'learn-indonesian-for-chinese' ? 1 : 0.8,
  })), {
    url: `${INDOBRAIN_SITE_URL}/love-indonesian`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }];
}
