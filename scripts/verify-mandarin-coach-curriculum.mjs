import fs from 'node:fs';

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const adapter = read('lib/server/mandarin-coach-curriculum.ts');
const page = read('app/learn-chinese/ai-coach/page.tsx');
const conversation = read('app/api/mandarin-coach/conversation/route.ts');
const pronunciation = read('app/api/mandarin-coach/pronunciation/route.ts');
const ui = read('components/MandarinAiCoachExperience.tsx');
const levelOne = read('lib/mandarin-work-course.ts');
const levelTwo = read('lib/server/mandarin-work-level2.ts');

for (const source of [
  "@/lib/mandarin-work-course",
  "@/lib/server/mandarin-work-level2",
  "@/lib/chinese-learning",
]) if (!adapter.includes(source)) failures.push(`missing approved Indonesian → Mandarin source ${source}`);

for (const forbidden of [
  'basic-essentials', 'micro-scenes', 'golden-scenes', 'love-indonesian',
  'youth-chat', 'recruitment', 'restaurant-ordering',
]) if (adapter.includes(forbidden)) failures.push(`Chinese → Indonesian source leaked into adapter: ${forbidden}`);

for (const marker of [
  'Array.from({ length: 30 }',
  'SELF_RESCUE_DAY14',
  'SELF_RESCUE_DAY30',
]) if (!levelOne.includes(marker)) failures.push(`Level 1 contract missing ${marker}`);

const levelTwoDayDefinitions = [...levelTwo.matchAll(/\bday\((\d+),/g)].map((match) => Number(match[1]));
const expectedLevelTwoDays = Array.from({ length: 30 }, (_, index) => index + 31);
if (levelTwoDayDefinitions.join(',') !== expectedLevelTwoDays.join(',')) failures.push(`Level 2 days are not continuous 31–60: ${levelTwoDayDefinitions.join(',')}`);

for (const unknown of [
  '你去办公室拿文件。',
  '你把昨天的销售报表整理一下。',
  '你先把这个放到仓库，等一下再回来。',
  '这个数量跟昨天的不一样，你再确认一下。',
]) {
  const adapterOccurrences = adapter.split(unknown).length - 1;
  if (adapterOccurrences !== 0) failures.push(`UNKNOWN_INPUT leaked into AI Coach curriculum: ${unknown}`);
}

for (const marker of [
  'getMandarinLevel2Access',
  "getMandarinCoachCurriculum(levelTwoAccess.state === 'authorized')",
]) if (!page.includes(marker)) failures.push(`AI Coach page access contract missing ${marker}`);

for (const marker of ['getMandarinCoachLesson', 'getMandarinLevel2Access', "courseLesson.source === 'MANDARIN_WORK_LEVEL_2'", 'status: 403']) {
  if (!conversation.includes(marker)) failures.push(`conversation route access contract missing ${marker}`);
}
for (const marker of ['getMandarinCoachExpression', 'getMandarinLevel2Access', "curriculumTarget.lesson.source === 'MANDARIN_WORK_LEVEL_2'", 'status: 403']) {
  if (!pronunciation.includes(marker)) failures.push(`pronunciation route access contract missing ${marker}`);
}

for (const marker of [
  'catalog: allLessons.map',
  "lesson.source === 'MANDARIN_WORK_LEVEL_2' && !levelTwoAuthorized",
  'const availableLessons = levelTwoAuthorized ? allLessons : [...levelOne, ...topics]',
  "direction: 'INDONESIAN_TO_MANDARIN'",
  'days: 60',
  'topics: topics.length',
]) if (!adapter.includes(marker)) failures.push(`curriculum inventory/access marker missing ${marker}`);

for (const marker of [
  'Pilih materi Mandarin yang sudah tersedia.',
  '/login?next=/learn-chinese/ai-coach',
  'Materi dipilih',
  'lesson.expressions',
  "form.set('lessonId', lesson.id)",
]) if (!ui.includes(marker)) failures.push(`curriculum UI marker missing ${marker}`);

if (failures.length) {
  console.error(`Mandarin Coach curriculum verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('MANDARIN COACH CURRICULUM: PASS (Indonesian → Mandarin only; Day 1–60 + quantity topic; Level 2 server-gated; UNKNOWN_INPUT excluded)');
