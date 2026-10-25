import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('content/public-core-30/public_core_30_review.json', 'utf8'));
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

expect(data.reviewStatus === 'REVIEW_PASSED', 'candidate must remain REVIEW_PASSED');
expect(data.expressions.length === 30, 'must contain exactly 30 expressions');
expect(new Set(data.expressions.map((item) => item.id)).size === 30, 'expression ids must be unique');
expect(new Set(data.expressions.flatMap((item) => item.tags.filter((tag) => tag.startsWith('cat-')))).size === 10, 'must contain exactly 10 categories');
expect(data.expressions.every((item) => item.chinese && item.pinyin && item.indonesian && item.ttsText === item.chinese), 'all expressions need Chinese, pinyin, Indonesian, and Chinese-only TTS');

const page = fs.readFileSync('app/learn-chinese/public-core/page.tsx', 'utf8');
const profile = fs.readFileSync('lib/public-core-profile.ts', 'utf8');
expect(page.includes("process.env.VERCEL_ENV === 'preview'"), 'route must require Preview runtime');
expect(page.includes("hostname === 'www.indobrain.app'"), 'route must deny the Production domain');
expect(page.includes('c7f8083097260da89e797b89484af9318806d453'), 'route must identify the latest WorkBuddy rev2 source');
expect(!page.includes('HUMAN_APPROVED'), 'Preview must not fake human approval');
expect(profile.includes("mandarin-v2:public-core-30:profile:v1"), 'storage must use isolated mandarin-v2 namespace');
expect(profile.includes('`mandarin-v2:${id}`'), 'favorite identifiers must use mandarin-v2:<expressionId>');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log('PASS: public-core Preview guard, 30 expressions, 10 categories, Chinese-only TTS, and isolated storage verified.');
