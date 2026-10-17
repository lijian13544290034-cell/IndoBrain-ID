import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  resolvePostLoginDestination,
  safePostLoginDestination,
} from '../lib/account/post-login-destination.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const superAdmin = { isSuperAdmin: true, learningDirection: 'ZH_TO_ID', mustChangePassword: false };
const learner = { isSuperAdmin: false, learningDirection: 'ZH_TO_ID', mustChangePassword: false };

// Super Admin returns to the Indonesian learner route that initiated login.
assert.equal(resolvePostLoginDestination(superAdmin, '/micro-scenes?module=factory&scene=N01'), '/micro-scenes?module=factory&scene=N01');
assert.equal(resolvePostLoginDestination(superAdmin, '/'), '/');
// Direct admin login keeps the established admin default and explicit admin destinations.
assert.equal(resolvePostLoginDestination(superAdmin), '/admin');
assert.equal(resolvePostLoginDestination(superAdmin, '/admin'), '/admin');
// A regular learner cannot use `next` to enter Admin.
assert.equal(resolvePostLoginDestination(learner, '/admin'), '/');
assert.equal(resolvePostLoginDestination({ ...learner, learningDirection: 'ID_TO_ZH' }, '/admin/users'), '/learn-chinese');
// Existing Mandarin learner routing remains intact.
assert.equal(resolvePostLoginDestination({ ...learner, learningDirection: 'ID_TO_ZH' }, '/learn-chinese/level-2/31'), '/learn-chinese/level-2/31');
// Unsafe or looping destinations are rejected.
for (const unsafe of ['https://example.com', '//example.com', '/\\example.com', '/login?next=/admin', '/api/admin/users']) {
  assert.equal(safePostLoginDestination(unsafe), null);
}
assert.equal(resolvePostLoginDestination({ ...superAdmin, mustChangePassword: true }, '/'), '/change-initial-password');

const proxy = read('proxy.ts');
assert.ok(proxy.indexOf('role_code=eq.SUPER_ADMIN') < proxy.indexOf('permission_key=eq.learning.access'));
assert.match(proxy, /if \(!isSuperAdmin\) \{[\s\S]*permission_key=eq\.learning\.access/);
assert.match(proxy, /if \(access\.isSuperAdmin\) return NextResponse\.next\(\)/);
assert.match(proxy, /request\.nextUrl\.pathname}\$\{request\.nextUrl\.search/);

const loginPage = read('app/login/page.tsx');
assert.match(loginPage, /PhoneLoginForm nextPath=\{nextPath\}/);
const loginForm = read('components/PhoneLoginForm.tsx');
assert.match(loginForm, /resolvePostLoginDestination/);
assert.match(loginForm, /setLearningProfileScope\(`\$\{data\.user\.publicId}:\$\{data\.user\.learningDirection}`\)/);
assert.doesNotMatch(loginForm, /clearLearningProfileScope/);

// The same account/direction scope remains selected while navigating between Admin and learning.
const profile = read('lib/learning-profile.ts');
assert.match(profile, /const scopeKey = 'indobrain_learning_profile_scope'/);
assert.match(profile, /`\$\{storageKey}:\$\{scope \|\| 'guest'}`/);
assert.match(profile, /window\.localStorage\.setItem\(scopedStorageKey\(\), JSON\.stringify\(profile\)\)/);

// Admin authorization stays server-side and ordinary learners remain isolated.
assert.match(read('app/admin/page.tsx'), /requireSuperAdmin\(\)/);
assert.match(read('lib/account/auth.ts'), /getUserRoles\(user\.id\)\)\.includes\('SUPER_ADMIN'\)/);
// No login or routing code mutates the account's learning direction or learning records.
for (const path of ['components/PhoneLoginForm.tsx', 'app/api/auth/login/route.ts', 'proxy.ts']) {
  assert.doesNotMatch(read(path), /learning_direction\s*:/);
}

console.log('SUPER ADMIN LEARNER ACCESS VERIFIED');
