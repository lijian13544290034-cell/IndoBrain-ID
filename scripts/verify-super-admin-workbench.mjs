import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolvePostLoginDestination } from '../lib/account/post-login-destination.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const superAdmin = { isSuperAdmin: true, learningDirection: 'ZH_TO_ID', mustChangePassword: false };
const learner = { isSuperAdmin: false, learningDirection: 'ZH_TO_ID', mustChangePassword: false };

const directionHelper = read('lib/account/admin-direction.ts');
assert.match(directionHelper, /LEARNING_DIRECTIONS\.includes/);
assert.match(directionHelper, /\? value as LearningDirection : null/);

assert.equal(resolvePostLoginDestination(superAdmin), '/admin/workbench');
assert.equal(resolvePostLoginDestination({ ...superAdmin, mustChangePassword: true }), '/change-initial-password');
assert.equal(resolvePostLoginDestination(learner, '/admin/workbench'), '/');
assert.equal(resolvePostLoginDestination({ ...learner, learningDirection: 'ID_TO_ZH' }, '/admin?direction=ID_TO_ZH'), '/learn-chinese');

const workbench = read('app/admin/workbench/page.tsx');
for (const target of ['/admin?direction=ZH_TO_ID', '/', '/admin?direction=ID_TO_ZH', '/learn-chinese']) {
  assert.ok(workbench.includes(`href: '${target}'`), `missing workbench destination ${target}`);
}
assert.match(workbench, /requireSuperAdmin\(\)/);
assert.match(workbench, /user\.must_change_password/);
assert.match(workbench, /redirect\('\/change-initial-password'\)/);
assert.match(workbench, /target=\{entry\.newTab \? '_blank'/);

const adminPage = read('app/admin/page.tsx');
assert.match(adminPage, /parseAdminDirection/);
assert.match(adminPage, /if \(!direction\) redirect\('\/admin\/workbench'\)/);
assert.match(adminPage, /AdminDashboard initialPassword=\{initialPassword\} direction=\{direction\}/);
assert.match(adminPage, /requireSuperAdmin\(\)/);

const dashboard = read('components/AdminDashboard.tsx');
assert.match(dashboard, /api\/admin\/users\?direction=\$\{direction\}/);
assert.match(dashboard, /direction === 'ID_TO_ZH' && <MandarinCoachAnalytics/);
assert.match(dashboard, /learningDirection: direction/);
assert.match(dashboard, /BulkStudentImport initialPassword=\{initialPassword\} direction=\{direction\}/);

for (const path of [
  'app/api/admin/users/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/login-history/route.ts',
  'app/api/admin/student-import/route.ts',
]) {
  const source = read(path);
  assert.match(source, /requireSuperAdmin\(\)/, `${path} must enforce the role server-side`);
  assert.match(source, /parseAdminDirection/, `${path} must validate the direction server-side`);
}

const repository = read('lib/account/repository.ts');
assert.match(repository, /learning_direction=eq\.\$\{learningDirection\}/);
assert.match(repository, /user_id=in\.\(\$\{userIds\.map\(encode\)\.join\(','\)\}\)/);

const passwordPage = read('app/change-initial-password/page.tsx');
assert.match(passwordPage, /isSuperAdmin \? '\/admin\/workbench'/);
assert.match(passwordPage, /if \(!user\.must_change_password\) redirect\(destination\)/);

console.log('SUPER ADMIN WORKBENCH VERIFIED');
