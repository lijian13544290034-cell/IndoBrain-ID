import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('content/public-core-30/public_core_30_review.json', 'utf8'));
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const approvalReference = 'USER-CHAT-APPROVAL-2026-10-25-PUBLIC-CORE-30-REV2';

expect(data.reviewStatus === 'HUMAN_APPROVED', 'course package must be HUMAN_APPROVED');
expect(data.reviewReference.includes(approvalReference), 'course package must cite the user chat approval identifier');
expect(data.reviewReference.includes('source: user confirmation in this chat on 2026-10-25'), 'approval source must explicitly be this user chat confirmation');
expect(data.expressions.length === 30, 'must contain exactly 30 expressions');
expect(new Set(data.expressions.map((item) => item.id)).size === 30, 'expression ids must be unique');
expect(new Set(data.expressions.flatMap((item) => item.tags.filter((tag) => tag.startsWith('cat-')))).size === 10, 'must contain exactly 10 categories');
expect(data.expressions.every((item) => item.chinese && item.pinyin && item.indonesian && item.ttsText === item.chinese), 'all expressions need Chinese, pinyin, Indonesian, and Chinese-only TTS');

const csv = fs.readFileSync('content/public-core-30/public_core_30_review.csv', 'utf8');
const cn002 = csv.split(/\r?\n/).find((line) => line.includes('CN-HF-002')) ?? '';
expect(cn002.includes('第二声（yí）'), 'CN-HF-002 review note must identify yí as second tone');
expect(!cn002.includes('第四声（yí）'), 'CN-HF-002 review note must not retain the fourth-tone typo');
expect((csv.match(/HUMAN_APPROVED/g) ?? []).length === 30, 'all 30 CSV rows must be HUMAN_APPROVED');

const page = fs.readFileSync('app/learn-chinese/public-core/page.tsx', 'utf8');
const home = fs.readFileSync('components/MandarinWorkExperience.tsx', 'utf8');
const registry = fs.readFileSync('lib/server/mandarin-v2-reviewed-packages.ts', 'utf8');
const runtime = fs.readFileSync('lib/mandarin-v2-runtime.ts', 'utf8');
const profile = fs.readFileSync('lib/public-core-profile.ts', 'utf8');
expect(page.includes('getMandarinV2Runtime'), 'public route must read through the server-side runtime');
expect(!page.includes('VERCEL_ENV') && !page.includes('isProductionDomain'), 'public route must not retain Preview-only guards');
expect(home.includes('href="/learn-chinese/public-core"'), 'Mandarin learning home must include the public core entry');
expect(registry.includes('public_core_30_review.json'), 'approved package must be in the reviewed registry');
expect(runtime.includes("value.reviewStatus !== 'HUMAN_APPROVED'"), 'runtime must retain the approval gate');
expect(runtime.includes("coursePackage.course.accessTier === 'FREE'"), 'runtime must retain FREE/LEVEL_2 body permission checks');
expect(profile.includes('mandarin-v2:public-core-30:profile:v1'), 'progress storage must use the isolated mandarin-v2 namespace');
expect(profile.includes('`mandarin-v2:${id}`'), 'favorite identifiers must use mandarin-v2:<expressionId>');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log('PASS: approved public-core package, registry/runtime gates, Production route, home entry, Chinese-only TTS, and isolated storage verified.');
