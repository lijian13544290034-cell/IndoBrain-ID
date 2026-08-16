import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const files = [
  'lib/life-golden-scenes.ts',
  'lib/golden-batch-2-scenes.ts',
  'lib/golden-batch-3-scenes.ts',
  'lib/golden-batch-4-scenes.ts',
  'lib/golden-batch-5-scenes.ts',
  'lib/golden-batch-6-scenes.ts',
];

const routeFiles = [
  'app/life/[id]/page.tsx',
  'app/nanny/[id]/page.tsx',
  'app/driver/[id]/page.tsx',
  'app/factory/manager/[id]/page.tsx',
  'app/golden-batch-2/page.tsx',
  'app/golden-batch-3/page.tsx',
  'app/golden-batch-4/page.tsx',
  'app/golden-batch-5/page.tsx',
  'app/golden-batch-6/page.tsx',
];

const failures = [];

for (const file of [...files, ...routeFiles]) {
  if (!exists(file)) failures.push(`Missing required file: ${file}`);
}

const combined = files.filter(exists).map(read).join('\n');
const goldenSceneCount = (combined.match(/goldenScene\s*:/g) ?? []).length;
const ttsButtonCount = (read('components/GoldenSceneTemplate.tsx').match(/IndonesianSpeechButton/g) ?? []).length;

if (goldenSceneCount < 100) failures.push(`Expected at least 100 Golden Scene records, found ${goldenSceneCount}`);
if (ttsButtonCount < 2) failures.push('GoldenSceneTemplate is not wired to the shared IndonesianSpeechButton');

const requiredTemplateFields = ['situation', 'goal', 'dialogue', 'replies', 'variations', 'decisions', 'trySay'];
const template = read('lib/golden-scenes.ts');
for (const field of requiredTemplateFields) {
  if (!template.includes(field)) failures.push(`GoldenSceneContent missing field marker: ${field}`);
}

if (!read('components/ExperienceActions.tsx').includes('completeExperience')) {
  failures.push('ExperienceActions does not expose completion flow');
}

if (failures.length) {
  console.error('GOLDEN SCENE INTEGRITY: FAIL');
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`GOLDEN SCENE INTEGRITY: PASS (${goldenSceneCount} records)`);
