import type { Metadata } from 'next';
import { INDOBRAIN_ENTITY, INDOBRAIN_SITE_URL } from './entity';
import { getGeoPage, type GeoPageSlug } from './pages';

export function createGeoMetadata(slug: GeoPageSlug): Metadata {
  const page = getGeoPage(slug);
  const canonical = `${INDOBRAIN_SITE_URL}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: INDOBRAIN_ENTITY.brand,
      title: page.title,
      description: page.description,
      url: canonical,
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.description,
    },
  };
}
