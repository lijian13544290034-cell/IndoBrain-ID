import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { resolveMandarinFavoriteIds } from '../lib/mandarin-favorite-resolver.ts';
import { allMandarinWorkItems, mandarinWorkDays } from '../lib/mandarin-work-course.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const actualDay1 = allMandarinWorkItems().find((item) => item.day === 1);
const actualDay30 = allMandarinWorkItems().find((item) => item.day === 30);
assert.ok(actualDay1, 'canonical Day 1 exposes a real favorite-capable expression');
assert.ok(actualDay30, 'canonical Day 30 exposes a real dialogue expression ID');
assert.equal(mandarinWorkDays.length, 30, 'Level 1 catalog remains the canonical Day 1–30 source');

const toLevelOneFavorite = (item) => ({
  favoriteId: item.favoriteId,
  itemId: item.id,
  day: item.day,
  courseTitle: mandarinWorkDays[item.day - 1].title,
  chinese: item.chinese,
  pinyin: item.pinyinSegments.map((segment) => segment.pinyin).join(' '),
  indonesian: item.indonesian,
  audioText: item.audioText,
  href: `/learn-chinese/course?day=${item.day}`,
  level: 1,
});

const level2Source = read('lib/server/mandarin-work-level2.ts').replace("import 'server-only';", '');
const executable = ts.transpileModule(level2Source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const runtimeModule = { exports: {} };
new Function('exports', 'module', 'require', executable)(runtimeModule.exports, runtimeModule, () => ({}));
const level2Days = runtimeModule.exports.mandarinWorkLevel2Days;
const level2Entries = level2Days.flatMap((day) => day.items.map((item) => ({
  favoriteId: `mandarin-work-30d:${item.id}`,
  itemId: item.id,
  day: day.day,
  courseTitle: day.title,
  chinese: item.chinese,
  pinyin: item.pinyin,
  indonesian: item.indonesian,
  audioText: item.chinese,
  href: `/learn-chinese/level-2/${day.day}`,
  level: 2,
})));
const day31 = level2Entries.find((entry) => entry.day === 31);
const day60Lesson = level2Days.find((day) => day.day === 60);
assert.ok(day31, 'canonical Day 31 exposes a real favorite-capable expression');
assert.equal(day60Lesson.items.length, 0, 'canonical Day 60 currently has no favorite-capable item or Indonesian item translation');

const authorized = resolveMandarinFavoriteIds(
  [actualDay1.favoriteId, actualDay30.favoriteId, day31.favoriteId, 'mandarin-work-30d:CN-WORK-L2-60-01', 'invalid-old-id'],
  [toLevelOneFavorite(actualDay1), toLevelOneFavorite(actualDay30)],
  level2Entries,
  true,
);
assert.deepEqual(authorized.entries.map((entry) => entry.day), [1, 30, 31], 'real canonical Day 1, Day 30, and authorized Level 2 favorites resolve');
assert.equal(authorized.entries.find((entry) => entry.day === 30)?.href, '/learn-chinese/course?day=30', 'Level 1 favorites deep-link to their canonical Day');
assert.deepEqual(authorized.unresolvedIds, ['mandarin-work-30d:CN-WORK-L2-60-01', 'invalid-old-id'], 'Day 60 without an item and invalid IDs remain preserved and unresolved');

const locked = resolveMandarinFavoriteIds([day31.favoriteId], [toLevelOneFavorite(actualDay1)], [], false);
assert.equal(locked.entries.length, 0, 'locked Level 2 content is not resolved');
assert.equal(locked.lockedLevel2Count, 1, 'locked Level 2 favorite is reported without content');

const favoritesPage = read('app/learn-chinese/favorites/page.tsx');
assert.match(favoritesPage, /access\.state === 'authorized'/, 'Level 2 catalog serialization requires server authorization');
assert.match(favoritesPage, /mandarinWorkLevel2Days\.flatMap/, 'Level 2 uses the existing canonical server catalog');

const favoritesComponent = read('components/MandarinFavorites.tsx');
assert.match(favoritesComponent, /setProfile\(toggleMandarinFavorite\(favoriteId\)\)/, 'removal reuses the existing favorite toggle');
assert.match(favoritesComponent, /ChineseSpeechButton/, 'favorite cards reuse the existing zh-CN speech component');
assert.match(favoritesComponent, /subscribeMandarinWorkProfile/, 'favorite state follows the scoped profile subscription');

const workExperience = read('components/MandarinWorkExperience.tsx');
assert.match(workExperience, /createMandarinWorkDaySelection\(initialDay\)/, 'course state initializes from the validated deep-link Day');
assert.match(workExperience, /toggleMandarinFavorite\(turn\.item\.favoriteId\)/, 'dialogue cards reuse the canonical favorite toggle');
for (const day of [29, 30]) {
  const lesson = mandarinWorkDays[day - 1];
  assert.equal(lesson.items.length, 0, `Day ${day} remains dialogue-only`);
  assert.ok(lesson.dialogue.length > 0, `Day ${day} has canonical dialogue expressions`);
  const favoriteIds = lesson.dialogue.map((turn) => turn.item.favoriteId);
  assert.equal(new Set(favoriteIds).size, favoriteIds.length, `Day ${day} dialogue favorite IDs are unique`);
  const resolved = resolveMandarinFavoriteIds(favoriteIds, mandarinWorkDays.flatMap((entry) => entry.items.concat(entry.dialogue.map((turn) => turn.item))).map(toLevelOneFavorite), [], false);
  assert.equal(resolved.entries.length, favoriteIds.length, `Day ${day} dialogue favorites resolve without copying them into items`);
  assert.ok(resolved.entries.every((entry) => entry.href === `/learn-chinese/course?day=${day}`), `Day ${day} favorites return to the correct lesson`);
}

const profileSource = read('lib/mandarin-work-profile.ts');
assert.match(profileSource, /currentMandarinLearningScope\(\)/, 'favorite persistence remains account scoped');
assert.match(profileSource, /profile\.favorites\.includes\(id\)/, 'favorite toggle reads the existing scoped favorites list');

const boundary = read('components/MandarinLearningScopeBoundary.tsx');
assert.match(boundary, /activeScope !== scope/, 'account switches do not mount favorites under a stale scope');

const navigation = read('components/MandarinLearningNavigation.tsx');
assert.match(navigation, /href: '\/learn-chinese\/favorites'/, 'Favorit navigation is live');
assert.match(navigation, /label: 'Ulasan'/, 'Ulasan remains upcoming');

const home = read('components/MandarinLearningHome.tsx');
assert.match(home, /href="\/learn-chinese\/favorites"/, 'home links to real favorites');

console.log('Mandarin favorites verification PASS');
