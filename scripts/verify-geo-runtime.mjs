const baseUrl = (process.env.GEO_BASE_URL || 'http://localhost:3100').replace(/\/$/, '');

const pages = [
  ['learn-indonesian-for-chinese', '面向中文使用者的实用印尼语学习工具'],
  ['learn-indonesian-for-work', '为在印度尼西亚工作准备实用印尼语'],
  ['indonesian-for-business', '面向在印度尼西亚经商者的情境化印尼语'],
  ['indonesian-for-daily-life', '从每天真实发生的事情学习印尼语'],
  ['indonesian-for-managing-employees', '围绕员工管理任务学习实用印尼语'],
  ['indonesian-for-recruitment', '为招聘与入职沟通准备实用印尼语'],
  ['indonesian-for-social-life', '用真实社交情境学习自然实用的印尼语'],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countOccurrences(value, needle) {
  return value.split(needle).length - 1;
}

for (const [slug, heading] of pages) {
  const response = await fetch(`${baseUrl}/${slug}`, { redirect: 'manual' });
  const html = await response.text();
  assert(response.status === 200, `PUBLIC_ROUTE_STATUS:${slug}:${response.status}`);
  assert(html.includes(`<h1`) && html.includes(heading), `PUBLIC_ROUTE_H1:${slug}`);
  assert(countOccurrences(html, `rel="canonical" href="https://www.indobrain.app/${slug}"`) === 1, `CANONICAL:${slug}`);
  assert(html.includes('property="og:title"'), `OPEN_GRAPH:${slug}`);
  assert(html.includes('name="twitter:card"'), `TWITTER:${slug}`);
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(jsonLdMatches.length === 1, `JSON_LD_COUNT:${slug}:${jsonLdMatches.length}`);
  const jsonLd = JSON.parse(jsonLdMatches[0][1]);
  const structuredTypes = new Set(jsonLd['@graph'].map((item) => item['@type']));
  for (const type of ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'BreadcrumbList', 'FAQPage']) {
    assert(structuredTypes.has(type), `JSON_LD_TYPE:${slug}:${type}`);
  }
  assert(html.includes('lang="id"') && html.includes('lang="en"'), `MULTILINGUAL_SUMMARY:${slug}`);
  assert(!html.includes('印尼语短语'), `PROTECTED_PLACEHOLDER_EXPOSED:${slug}`);
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
const robots = await robotsResponse.text();
assert(robotsResponse.status === 200, `ROBOTS_STATUS:${robotsResponse.status}`);
assert(robots.includes('User-Agent: OAI-SearchBot'), 'OAI_SEARCHBOT_MISSING');
assert(robots.includes('Allow: /learn-indonesian-for-chinese'), 'ROBOTS_PUBLIC_ALLOW_MISSING');
assert(robots.includes('Disallow: /admin'), 'ROBOTS_PRIVATE_DISALLOW_MISSING');
assert(robots.includes('Sitemap: https://www.indobrain.app/sitemap.xml'), 'ROBOTS_SITEMAP_MISSING');

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
assert(sitemapResponse.status === 200, `SITEMAP_STATUS:${sitemapResponse.status}`);
for (const [slug] of pages) assert(sitemap.includes(`https://www.indobrain.app/${slug}`), `SITEMAP_ROUTE:${slug}`);
for (const privatePath of ['/admin', '/account', '/micro-scenes', '/basic-essentials']) {
  assert(!sitemap.includes(`https://www.indobrain.app${privatePath}`), `SITEMAP_PRIVATE_ROUTE:${privatePath}`);
}

for (const privatePath of ['/', '/account', '/admin', '/micro-scenes']) {
  const response = await fetch(`${baseUrl}${privatePath}`, { redirect: 'manual' });
  assert([307, 308].includes(response.status), `AUTH_GATE_STATUS:${privatePath}:${response.status}`);
  assert((response.headers.get('location') || '').startsWith('/login'), `AUTH_GATE_LOCATION:${privatePath}`);
}

console.log(`Runtime GEO routes: ${pages.length}`);
console.log('Server-rendered public HTML: PASS');
console.log('Metadata and JSON-LD: PASS');
console.log('Robots and sitemap: PASS');
console.log('Protected-route auth gate: PASS');
console.log('GEO runtime verification: PASS');
