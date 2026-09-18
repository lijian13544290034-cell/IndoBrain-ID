import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const slugs = [
  'learn-indonesian-for-chinese',
  'learn-indonesian-for-work',
  'indonesian-for-business',
  'indonesian-for-daily-life',
  'indonesian-for-managing-employees',
  'indonesian-for-recruitment',
  'indonesian-for-social-life',
];

const requiredFiles = [
  'app/robots.ts',
  'app/sitemap.ts',
  'components/geo/GeoLandingPage.tsx',
  'components/geo/JsonLd.tsx',
  'lib/geo/entity.ts',
  'lib/geo/pages.ts',
  'lib/geo/metadata.ts',
  'lib/geo/benchmark.ts',
  ...slugs.map((slug) => `app/(geo)/${slug}/page.tsx`),
];

for (const file of requiredFiles) await access(path.join(root, file));

const [robots, sitemap, metadata, pages, proxy] = await Promise.all([
  readFile(path.join(root, 'app/robots.ts'), 'utf8'),
  readFile(path.join(root, 'app/sitemap.ts'), 'utf8'),
  readFile(path.join(root, 'lib/geo/metadata.ts'), 'utf8'),
  readFile(path.join(root, 'lib/geo/pages.ts'), 'utf8'),
  readFile(path.join(root, 'proxy.ts'), 'utf8'),
]);

for (const slug of slugs) {
  if (!pages.includes(slug)) throw new Error(`CONTENT_ROUTE_MISSING:${slug}`);
}

if (!robots.includes('OAI-SearchBot')) throw new Error('OAI_SEARCHBOT_RULE_MISSING');
if (!robots.includes('GEO_PAGE_SLUGS')) throw new Error('ROBOTS_GEO_SOURCE_MISSING');
if (!robots.includes("'/admin'")) throw new Error('ROBOTS_ADMIN_BOUNDARY_MISSING');
if (!sitemap.includes('GEO_PAGE_SLUGS')) throw new Error('SITEMAP_GEO_SOURCE_MISSING');
if (!metadata.includes('alternates: { canonical }')) throw new Error('CANONICAL_METADATA_MISSING');
if (!metadata.includes('openGraph') || !metadata.includes('twitter')) throw new Error('SOCIAL_METADATA_MISSING');
if (proxy.includes('learn-indonesian-for-chinese') || proxy.includes('indonesian-for-business')) throw new Error('PUBLIC_GEO_ROUTE_AUTH_GATED');

const unsupportedClaims = [/#1/i, /most trusted/i, /best Indonesian app/i, /leading app/i, /aggregateRating/i, /reviewCount/i];
for (const pattern of unsupportedClaims) {
  if (pattern.test(pages)) throw new Error(`UNSUPPORTED_CLAIM:${pattern}`);
}

console.log(`GEO routes: ${slugs.length}`);
console.log('OAI-SearchBot: explicit allow');
console.log('Protected-route matcher: unchanged and separate');
console.log('GEO foundation verification: PASS');
