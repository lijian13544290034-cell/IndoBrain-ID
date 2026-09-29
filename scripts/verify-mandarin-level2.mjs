import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const data = read('lib/server/mandarin-work-level2.ts');
const catalog = read('lib/mandarin-work-level2-catalog.ts');
const access = read('lib/server/mandarin-work-level2-access.ts');
const catalogPage = read('app/learn-chinese/level-2/page.tsx');
const dayPage = read('app/learn-chinese/level-2/[day]/page.tsx');
const ui = read('components/MandarinWorkLevel2Experience.tsx');
const previewQa = read('lib/account/preview-qa.ts');
const provider = read('lib/chinese-tts-provider.ts');
const speech = read('components/ChineseSpeechButton.tsx');
const sitemap = read('app/sitemap.ts');
const robots = read('app/robots.ts');

const days = [...data.matchAll(/\bday\((\d+),/g)].map((match) => Number(match[1]));
if (days.length !== 30 || days.some((value, index) => value !== index + 31)) failures.push(`Level 2 day order is invalid: ${days.join(',')}`);
const catalogDays = [...catalog.matchAll(/\[(\d+),\s*'/g)].map((match) => Number(match[1]));
if (catalogDays.length !== 30 || catalogDays.some((value, index) => value !== index + 31)) failures.push('Public catalog must contain Day 31-60 exactly once');
if (days.filter((value) => value >= 51).length !== 10) failures.push('Construction module must contain exactly 10 days');
if (!data.startsWith("import 'server-only';")) failures.push('Paid curriculum is not server-only');
for (const marker of ['unknownInputStatus: \'CONTENT_REVIEW\'', "day(40", "day(50"]) if (!data.includes(marker)) failures.push(`Missing content-review marker: ${marker}`);
for (const marker of ['mandarin.level2.access', 'hasMembershipPermission', "roles as string[]", 'verifyPreviewQaSession']) if (!(access + catalog).includes(marker)) failures.push(`Missing server entitlement marker: ${marker}`);
if (catalogPage.includes('mandarin-work-level2.ts') || catalogPage.includes('getMandarinWorkLevel2Day')) failures.push('Public catalog imports paid curriculum');
for (const marker of ['getMandarinLevel2Access', "redirect(`/login?next=/learn-chinese/level-2/", 'getMandarinWorkLevel2Day']) if (!dayPage.includes(marker)) failures.push(`Protected day route missing: ${marker}`);
for (const marker of ['ChineseSpeechButton', 'LocalPronunciationRecorder', 'toggleMandarinFavorite', 'completeMandarinDay', 'MandarinWorkFeedback', 'text-[15px]', 'font-semibold']) if (!ui.includes(marker)) failures.push(`Level 2 UI missing: ${marker}`);
if (!provider.includes('zh-CN-XiaoxiaoNeural') || !provider.includes("chineseTtsRate = '-15%'")) failures.push('Mandarin Azure voice/rate changed');
if (!speech.includes("voice.lang.trim().replace('_', '-').toLowerCase() === 'zh-cn'") || speech.includes("lang.startsWith('zh')")) failures.push('Browser fallback is not exact zh-CN');
if (!previewQa.includes("process.env.VERCEL_ENV === 'preview'") || !previewQa.includes("process.env.ENABLE_PREVIEW_QA === 'true'")) failures.push('Preview QA is not fail-closed outside Preview');
for (const marker of ['MANDARIN_WORK_GEO_SLUGS']) if (!sitemap.includes(marker) || !robots.includes(marker)) failures.push('Mandarin GEO pages missing from sitemap/robots');
const geoRoutes = ['mandarin-untuk-kerja-di-indonesia','mandarin-untuk-proyek-konstruksi','mandarin-yang-sering-digunakan-bos-tiongkok','cara-memahami-instruksi-bos-tiongkok','kosakata-mandarin-untuk-pekerja-konstruksi'];
for (const slug of geoRoutes) if (!fs.existsSync(path.join(root, 'app/(geo)', slug, 'page.tsx'))) failures.push(`Missing GEO route: ${slug}`);

if (failures.length) { console.error('MANDARIN WORK LEVEL 2: FAIL'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log('MANDARIN WORK LEVEL 2: PASS (30/30 days, 10 construction days, server-only content, protected delivery, 5 GEO pages)');
