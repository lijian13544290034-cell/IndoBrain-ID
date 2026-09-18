import type { MetadataRoute } from 'next';
import { GEO_PAGE_SLUGS } from '@/lib/geo/pages';
import { INDOBRAIN_SITE_URL } from '@/lib/geo/entity';

const publicGeoPaths = GEO_PAGE_SLUGS.map((slug) => `/${slug}`);
const protectedPaths = [
  '/about',
  '/account',
  '/admin',
  '/api/',
  '/basic-essentials',
  '/change-initial-password',
  '/chat',
  '/driver',
  '/factory',
  '/golden-batch-',
  '/learn-chinese',
  '/life',
  '/login',
  '/micro-scenes',
  '/module',
  '/nanny',
  '/patterns',
  '/r/',
  '/social',
  '/vocabulary',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: publicGeoPaths, disallow: protectedPaths },
      { userAgent: 'OAI-SearchBot', allow: publicGeoPaths, disallow: protectedPaths },
    ],
    sitemap: `${INDOBRAIN_SITE_URL}/sitemap.xml`,
    host: INDOBRAIN_SITE_URL,
  };
}
