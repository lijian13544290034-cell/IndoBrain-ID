import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const page = read('app/learn-chinese/page.tsx');
const layout = read('app/learn-chinese/layout.tsx');
const coursePage = read('app/learn-chinese/course/page.tsx');
const profilePage = read('app/learn-chinese/profile/page.tsx');
const home = read('components/MandarinLearningHome.tsx');
const navigation = read('components/MandarinLearningNavigation.tsx');
const personalization = read('components/MandarinCoachPersonalization.tsx');
const courseProfile = read('lib/mandarin-work-profile.ts');
const personalizationProfile = read('lib/mandarin-coach-personalization-profile.ts');
const proxy = read('proxy.ts');

assert.match(page, /MandarinLearningHome/, 'Unified home must render at /learn-chinese');
assert.match(coursePage, /MandarinWorkExperience/, 'Existing Day 1–30 experience must remain the course implementation');
assert.match(profilePage, /MandarinCoachPersonalization/, 'Career profile must reuse the existing personalization component');
assert.match(profilePage, /displayMode="profile"/, 'Career profile route must not duplicate the full AI Coach picker');
assert.match(layout, /MandarinLearningNavigation/, 'Mandarin navigation must cover the learning subtree');

for (const marker of ['Belajar Mandarin untuk Kerja', 'Lanjutkan Hari', '/learn-chinese/course', '/learn-chinese/ai-coach', '/learn-chinese/profile', 'Segera hadir']) {
  assert.ok(home.includes(marker), `Unified home is missing: ${marker}`);
}
for (const marker of ['Beranda', 'Kursus', 'AI Coach', 'Favorit', 'Ulasan', 'disabled', 'aria-disabled="true"']) {
  assert.ok(navigation.includes(marker), `Navigation is missing: ${marker}`);
}
assert.match(navigation, /grid-cols-5/, 'Mobile navigation must keep five equal-width items');
assert.match(layout, /safe-area-inset-bottom/, 'Content must reserve space for the mobile safe area and fixed navigation');

assert.match(courseProfile, /MANDARIN_WORK_NAMESPACE}:profile:\$\{currentMandarinLearningScope\(\)\}/, 'Existing course progress key must use the verified ID_TO_ZH account scope');
assert.match(personalizationProfile, /indobrain:mandarin-coach-personalization:v1/, 'Existing personalization key must remain unchanged');
assert.match(layout, /getCurrentAccountUser\(\)/, 'Mandarin local state must be scoped from the verified server session');
assert.match(layout, /MandarinLearningScopeBoundary/, 'Mandarin local consumers must wait for the verified scope');
assert.match(home, /readMandarinWorkProfile/, 'Home progress must read the existing course profile');
assert.match(home, /readPersonalizationState/, 'Home profile state must read the existing personalization store');
assert.match(personalization, /displayMode === 'profile'/, 'Existing profile editor must provide the profile-only view');
assert.match(proxy, /pathname === '\/learn-chinese' \|\| pathname\.startsWith\('\/learn-chinese\/'\)/, 'Anonymous Mandarin route policy must still cover nested routes');

const rootLayout = read('app/layout.tsx');
const superAdminReturn = read('components/SuperAdminWorkbenchReturnLink.tsx');
assert.match(rootLayout, /SuperAdminWorkbenchReturnLink/, 'Super Admin return control must remain mounted');
assert.match(superAdminReturn, /pathname\?\.startsWith\('\/learn-chinese'\)/, 'Super Admin return control must remain available across Mandarin learning routes');
assert.doesNotMatch(navigation, /中国人学印尼语|\/life|\/about#favorites/, 'Mandarin navigation must not reuse or modify the Chinese-to-Indonesian navigation');

console.log('MANDARIN LEARNING HOME: PASS (unified home, preserved stores, real course/coach/profile routes, explicit future states)');
