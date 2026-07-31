import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3015';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceKey) throw new Error('Test database credentials are not configured.');

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const password = 'DirectionQa2026';
const suffix = `${Date.now()}`.slice(-7);

async function passwordHash() {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString('hex')}`;
}

async function createUser(direction, index, superAdmin = false) {
  const phone = `+628139${suffix.slice(0, 6)}${index}`;
  const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST', headers, body: JSON.stringify({ phone, password_hash: await passwordHash(), membership_code: 'SVIP', learning_direction: direction, account_status: 'ACTIVE', register_source: 'QA_DIRECTION_ISOLATION' }),
  });
  if (!response.ok) throw new Error(`Could not create ${direction} QA account: ${response.status}`);
  const [user] = await response.json();
  if (superAdmin) {
    const role = await fetch(`${supabaseUrl}/rest/v1/user_roles`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ user_id: user.id, role_code: 'SUPER_ADMIN' }) });
    if (!role.ok) throw new Error(`Could not assign QA super admin role: ${role.status}`);
  }
  return { phone, direction, superAdmin };
}

async function login(user, deviceId) {
  const response = await fetch(`${baseUrl}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: user.phone, password, deviceId }), redirect: 'manual' });
  if (!response.ok) throw new Error(`Login failed for ${user.direction}: ${response.status}`);
  const cookie = response.headers.get('set-cookie')?.match(/indobrain_account_session=([^;]+)/)?.[1];
  if (!cookie) throw new Error(`Login did not create a session for ${user.direction}.`);
  return `indobrain_account_session=${cookie}`;
}

async function request(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { Cookie: cookie }, redirect: 'manual' });
  return { status: response.status, location: response.headers.get('location') || '', body: await response.text() };
}

function expect(result, status, location = '') {
  if (result.status !== status || (location && result.location !== location)) throw new Error(`Expected ${status} ${location}; received ${result.status} ${result.location}`);
}

const zhToId = await createUser('ZH_TO_ID', 1);
const idToZh = await createUser('ID_TO_ZH', 2);
const superAdmin = await createUser('ZH_TO_ID', 3, true);

const zhCookie = await login(zhToId, 'qa-direction-zh');
const zhHome = await request('/', zhCookie);
expect(zhHome, 200);
if (zhHome.body.includes('href="/chinese"')) throw new Error('ZH_TO_ID homepage exposes the Chinese learning entry.');
for (const requiredRoute of ['/driver', '/nanny', '/life/basics/office', '/factory', '/module/warehouse', '/patterns', '/life/basics/indonesia']) {
  if (!zhHome.body.includes(`href="${requiredRoute}"`)) throw new Error(`ZH_TO_ID homepage is missing ${requiredRoute}.`);
}
expect(await request('/chinese', zhCookie), 307, '/');
expect(await request('/chinese/CHN-MET-001', zhCookie), 307, '/');
expect(await request('/driver/001', zhCookie), 200);
expect(await request('/factory', zhCookie), 200);

const idCookie = await login(idToZh, 'qa-direction-id');
expect(await request('/', idCookie), 307, '/chinese');
const idHome = await request('/chinese', idCookie);
expect(idHome, 200);
for (const excludedRoute of ['/driver', '/nanny', '/factory', '/life', '/patterns']) {
  if (idHome.body.includes(`href="${excludedRoute}"`)) throw new Error(`ID_TO_ZH homepage exposes ${excludedRoute}.`);
}
expect(await request('/chinese/CHN-MET-001', idCookie), 200);
expect(await request('/driver', idCookie), 307, '/chinese');
expect(await request('/nanny/001', idCookie), 307, '/chinese');
expect(await request('/factory', idCookie), 307, '/chinese');
expect(await request('/life', idCookie), 307, '/chinese');
expect(await request('/patterns', idCookie), 307, '/chinese');

const adminCookie = await login(superAdmin, 'qa-direction-admin');
expect(await request('/chinese', adminCookie), 200);
expect(await request('/driver', adminCookie), 200);
expect(await request('/admin', adminCookie), 200);

for (const cookie of [zhCookie, idCookie, adminCookie]) {
  const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie }, redirect: 'manual' });
  if (!logout.ok) throw new Error(`Logout failed: ${logout.status}`);
}

const afterLogout = await request('/driver', zhCookie);
expect(afterLogout, 307, '/login?next=%2Fdriver');
console.log('DIRECTION_ISOLATION_QA_PASS');
