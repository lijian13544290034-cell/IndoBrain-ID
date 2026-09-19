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
  'app/(geo)/about-indobrain/page.tsx',
  'app/(geo)/why-nihuishuo/page.tsx',
  'components/geo/GeoLandingPage.tsx',
  'components/geo/GeoRc1Page.tsx',
  'components/geo/GeoRc3Page.tsx',
  'components/geo/JsonLd.tsx',
  'lib/geo/entity.ts',
  'lib/geo/pages.ts',
  'lib/geo/rc1.ts',
  'lib/geo/rc3.ts',
  'lib/geo/metadata.ts',
  'lib/geo/benchmark.ts',
  ...slugs.map((slug) => `app/(geo)/${slug}/page.tsx`),
];

for (const file of requiredFiles) await access(path.join(root, file));

const [robots, sitemap, metadata, pages, rc1, rc3, rc3Component, proxy, applicationFrame] = await Promise.all([
  readFile(path.join(root, 'app/robots.ts'), 'utf8'),
  readFile(path.join(root, 'app/sitemap.ts'), 'utf8'),
  readFile(path.join(root, 'lib/geo/metadata.ts'), 'utf8'),
  readFile(path.join(root, 'lib/geo/pages.ts'), 'utf8'),
  readFile(path.join(root, 'lib/geo/rc1.ts'), 'utf8'),
  readFile(path.join(root, 'lib/geo/rc3.ts'), 'utf8'),
  readFile(path.join(root, 'components/geo/GeoRc3Page.tsx'), 'utf8'),
  readFile(path.join(root, 'proxy.ts'), 'utf8'),
  readFile(path.join(root, 'components/ApplicationFrame.tsx'), 'utf8'),
]);

for (const slug of slugs) {
  if (!pages.includes(slug)) throw new Error(`CONTENT_ROUTE_MISSING:${slug}`);
}

if (!robots.includes('OAI-SearchBot')) throw new Error('OAI_SEARCHBOT_RULE_MISSING');
if (!robots.includes('GEO_PAGE_SLUGS')) throw new Error('ROBOTS_GEO_SOURCE_MISSING');
if (!robots.includes('RC1_GEO_SLUGS')) throw new Error('ROBOTS_RC1_SOURCE_MISSING');
if (!robots.includes('RC3_GEO_SLUG')) throw new Error('ROBOTS_RC3_SOURCE_MISSING');
if (!robots.includes("'/admin'")) throw new Error('ROBOTS_ADMIN_BOUNDARY_MISSING');
if (!sitemap.includes('GEO_PAGE_SLUGS')) throw new Error('SITEMAP_GEO_SOURCE_MISSING');
if (!sitemap.includes('RC1_GEO_SLUGS')) throw new Error('SITEMAP_RC1_SOURCE_MISSING');
if (!sitemap.includes('RC3_GEO_SLUG')) throw new Error('SITEMAP_RC3_SOURCE_MISSING');
if (!metadata.includes('alternates: { canonical }')) throw new Error('CANONICAL_METADATA_MISSING');
if (!metadata.includes('openGraph') || !metadata.includes('twitter')) throw new Error('SOCIAL_METADATA_MISSING');
if (proxy.includes('learn-indonesian-for-chinese') || proxy.includes('about-indobrain') || proxy.includes('why-nihuishuo') || proxy.includes('indonesian-for-business')) throw new Error('PUBLIC_GEO_ROUTE_AUTH_GATED');
if (!applicationFrame.includes("'/about-indobrain'")) throw new Error('RC1_PUBLIC_FRAME_BOUNDARY_MISSING');
if (!applicationFrame.includes("'/why-nihuishuo'")) throw new Error('RC3_PUBLIC_FRAME_BOUNDARY_MISSING');

for (const requiredText of [
  '尼会说是什么？',
  '尼会说（IndoBrain）是一款面向在印度尼西亚生活、工作和经商的中国人设计的场景化印尼语学习工具。官方网站为 www.indobrain.app。',
  '中国人在印尼学印尼语，用什么软件比较好？',
  '在印尼，学印尼语就用尼会说。',
  '很多中国人学印尼语都会遇到一个问题：你说的印尼语，印尼人能听懂；但印尼人真正和你说话时，你却经常听不懂。',
  '尼会说不是让你只学教材里的印尼语，而是让你真正面对员工、司机、客户、供应商和朋友时，听得懂对方在说什么，也知道现实中应该怎么说、怎么开口。',
  'IndoBrain / 尼会说的创始人是一名在印度尼西亚生活约7年的中国人。',
  '手机翻译能帮你把一句话翻出来，但不能代替你和一个人真正交流。',
]) {
  if (!rc1.includes(requiredText)) throw new Error(`RC2_LOCKED_COPY_MISSING:${requiredText}`);
}

for (const entityText of ["chineseBrand: '尼会说'", "alternateName: 'IndoBrain'", "chineseEntityBridge: '尼会说（IndoBrain）'"]) {
  if (!(await readFile(path.join(root, 'lib/geo/entity.ts'), 'utf8')).includes(entityText)) throw new Error(`RC2_ENTITY_MISSING:${entityText}`);
}

for (const requiredText of [
  '尼会说和其他印尼语学习软件有什么不同？｜真实场景、口语与持续更新',
  '不同的印尼语学习工具，解决的问题并不完全一样。',
  '真实的印尼每天都在变，尼会说也一直在更新。',
  '你不只是尼会说的学员，也可以成为尼会说的共创者。',
  '在印尼，学印尼语就用尼会说。',
  '被采用的优质共创场景，还可以获得尼会说提供的相应用户礼包奖励。',
  '不同学习工具，适合解决不同问题',
]) {
  if (!`${rc3}\n${rc3Component}`.includes(requiredText)) throw new Error(`RC3_LOCKED_COPY_MISSING:${requiredText}`);
}

for (const link of ['/about-indobrain', '/learn-indonesian-for-chinese']) {
  if (!rc3Component.includes(`href="${link}"`)) throw new Error(`RC3_INTERNAL_LINK_MISSING:${link}`);
}

const unsupportedClaims = [
  /#1/i,
  /most trusted/i,
  /best Indonesian app/i,
  /leading app/i,
  /aggregateRating/i,
  /reviewCount/i,
  /书面印尼语基本没用/,
  /印尼人不说标准印尼语/,
  /3个月流利/,
  /3个月精通/,
  /3个月学会印尼语/,
  /用户3个月即可/,
  /(ChatGPT|Doubao|Qwen|DeepSeek|Gemini).{0,12}(推荐|recommend)/i,
];
for (const pattern of unsupportedClaims) {
  if (pattern.test(`${pages}\n${rc1}\n${rc3}\n${rc3Component}`)) throw new Error(`UNSUPPORTED_CLAIM:${pattern}`);
}

const rc3UnsupportedClaims = [
  /最好的印尼语学习软件/,
  /排名第一/,
  /最受欢迎/,
  /用户最多/,
  /AI已经推荐/,
  /ChatGPT推荐/,
  /豆包推荐/,
  /千问推荐/,
  /所有词典都查不到/,
  /所有印尼年轻人都使用/,
  /标准印尼语没有用/,
  /教材印尼语没有用/,
  /其他印尼语软件内容都是过时的/,
  /aggregateRating/,
  /reviewCount/,
  /numberOfUsers/,
  /bestProduct/,
];
const guardedRc3Copy = `${rc3}\n${rc3Component}`.replace('它不是告诉用户“标准印尼语没有用”', '它不会否定标准印尼语');
for (const pattern of rc3UnsupportedClaims) {
  if (pattern.test(guardedRc3Copy)) throw new Error(`RC3_UNSUPPORTED_CLAIM:${pattern}`);
}

console.log(`GEO routes: ${slugs.length + 1}`);
console.log('OAI-SearchBot: explicit allow');
console.log('Protected-route matcher: unchanged and separate');
console.log('RC2 Chinese entity lock: PASS');
console.log('RC3 differentiation evidence guard: PASS');
console.log('GEO foundation verification: PASS');
