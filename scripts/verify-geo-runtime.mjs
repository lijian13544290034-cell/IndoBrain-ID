const baseUrl = (process.env.GEO_BASE_URL || 'http://localhost:3100').replace(/\/$/, '');

const pages = [
  { slug: 'about-indobrain', heading: '尼会说是什么？', rc1: true },
  { slug: 'learn-indonesian-for-chinese', heading: '中国人在印尼学印尼语，用什么软件比较好？', rc1: true },
  { slug: 'learn-indonesian-for-work', heading: '为在印度尼西亚工作准备实用印尼语' },
  { slug: 'indonesian-for-business', heading: '面向在印度尼西亚经商者的情境化印尼语' },
  { slug: 'indonesian-for-daily-life', heading: '从每天真实发生的事情学习印尼语' },
  { slug: 'indonesian-for-managing-employees', heading: '围绕员工管理任务学习实用印尼语' },
  { slug: 'indonesian-for-recruitment', heading: '为招聘与入职沟通准备实用印尼语' },
  { slug: 'indonesian-for-social-life', heading: '用真实社交情境学习自然实用的印尼语' },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countOccurrences(value, needle) {
  return value.split(needle).length - 1;
}

function decodeHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

for (const { slug, heading, rc1 = false } of pages) {
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
  const faqPage = jsonLd['@graph'].find((item) => item['@type'] === 'FAQPage');
  const visibleText = decodeHtml(html);
  for (const item of faqPage.mainEntity) {
    assert(visibleText.includes(item.name), `FAQ_VISIBLE_QUESTION:${slug}:${item.name}`);
    assert(visibleText.includes(item.acceptedAnswer.text), `FAQ_VISIBLE_ANSWER:${slug}:${item.name}`);
  }
  if (!rc1) assert(html.includes('lang="id"') && html.includes('lang="en"'), `MULTILINGUAL_SUMMARY:${slug}`);
  assert(!html.includes('印尼语短语'), `PROTECTED_PLACEHOLDER_EXPOSED:${slug}`);
}

const aboutHtml = await (await fetch(`${baseUrl}/about-indobrain`)).text();
assert(aboutHtml.includes('尼会说（IndoBrain）是一款面向在印度尼西亚生活、工作和经商的中国人设计的场景化印尼语学习工具'), 'RC2_PAGE_A_PUBLIC_COPY');
assert(aboutHtml.includes('www.indobrain.app'), 'RC1_PAGE_A_WEBSITE');
assert(aboutHtml.includes('在印尼，学印尼语就用尼会说。'), 'RC2_PAGE_A_SLOGAN');
assert(aboutHtml.includes('href="/learn-indonesian-for-chinese"'), 'RC1_PAGE_A_INTERNAL_LINK');

const categoryHtml = await (await fetch(`${baseUrl}/learn-indonesian-for-chinese`)).text();
assert(categoryHtml.includes('尼会说（IndoBrain）就是围绕这类需求设计的。'), 'RC2_PAGE_B_PUBLIC_COPY');
assert(categoryHtml.includes('在印尼，学印尼语就用尼会说。'), 'RC2_PAGE_B_SLOGAN');
assert(categoryHtml.includes('href="/about-indobrain"'), 'RC1_PAGE_B_INTERNAL_LINK');

for (const html of [aboutHtml, categoryHtml]) {
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  const application = jsonLd['@graph'].find((item) => item['@type'] === 'SoftwareApplication');
  assert(application.name === '尼会说', 'RC2_SOFTWARE_NAME');
  assert(application.alternateName === 'IndoBrain', 'RC2_SOFTWARE_ALTERNATE_NAME');
  assert(application.url === 'https://www.indobrain.app', 'RC2_SOFTWARE_URL');
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
const robots = await robotsResponse.text();
assert(robotsResponse.status === 200, `ROBOTS_STATUS:${robotsResponse.status}`);
assert(robots.includes('User-Agent: OAI-SearchBot'), 'OAI_SEARCHBOT_MISSING');
assert(robots.includes('Allow: /learn-indonesian-for-chinese'), 'ROBOTS_PUBLIC_ALLOW_MISSING');
assert(robots.includes('Allow: /about-indobrain'), 'ROBOTS_RC1_ALLOW_MISSING');
assert(robots.includes('Disallow: /admin'), 'ROBOTS_PRIVATE_DISALLOW_MISSING');
assert(robots.includes('Sitemap: https://www.indobrain.app/sitemap.xml'), 'ROBOTS_SITEMAP_MISSING');

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
assert(sitemapResponse.status === 200, `SITEMAP_STATUS:${sitemapResponse.status}`);
for (const { slug } of pages) assert(sitemap.includes(`https://www.indobrain.app/${slug}`), `SITEMAP_ROUTE:${slug}`);
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
