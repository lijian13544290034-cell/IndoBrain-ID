import { createHash, randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error('Preview Supabase configuration is required.');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const request = async (path, init = {}) => {
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!response.ok) throw new Error(`Supabase ${response.status} for ${path}`);
  const text = await response.text();
  return text ? JSON.parse(text) : [];
};
const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derived).toString('hex')}`;
};
const testerId = (userId) => `tester-${createHash('sha256').update(`account:${userId}`).digest('hex').slice(0, 16)}`;
const action = process.argv[2];

if (action === 'create') {
  const credentials = [];
  for (let index = 1; index <= 10; index += 1) {
    const label = `TESTER${String(index).padStart(2, '0')}`;
    const phone = `+999900000${String(index).padStart(2, '0')}`;
    const password = `Ib-${label}-${randomBytes(8).toString('base64url')}7`;
    const existing = await request(`users?phone=eq.${encodeURIComponent(phone)}&select=id,public_id,phone,display_name,register_source,account_status&limit=1`);
    let user = existing[0];
    if (!user) {
      [user] = await request('users', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ phone, display_name: label, password_hash: await hashPassword(password), membership_code: 'BASIC', learning_direction: 'ID_TO_ZH', account_status: 'SUSPENDED', register_source: 'PREVIEW_TEST', must_change_password: false }) });
      await request('user_roles?on_conflict=user_id,role_code', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ user_id: user.id, role_code: 'USER' }) });
    } else {
      if (user.register_source !== 'PREVIEW_TEST' || user.display_name !== label) throw new Error(`Reserved phone collision for ${label}`);
      await request(`users?id=eq.${user.id}`, { method: 'PATCH', body: JSON.stringify({ password_hash: await hashPassword(password), account_status: 'SUSPENDED', learning_direction: 'ID_TO_ZH', must_change_password: false }) });
    }
    credentials.push({ label, phone, password, publicId: user.public_id });
  }
  process.stdout.write(JSON.stringify(credentials));
} else if (action === 'reset') {
  const label = process.argv[3];
  if (!/^TESTER(?:0[1-9]|10)$/.test(label || '')) throw new Error('Use TESTER01 through TESTER10.');
  const [user] = await request(`users?display_name=eq.${encodeURIComponent(label)}&register_source=eq.PREVIEW_TEST&select=id&limit=1`);
  if (!user) throw new Error('Preview tester not found.');
  await request(`account_sessions?user_id=eq.${user.id}&revoked_at=is.null`, { method: 'PATCH', body: JSON.stringify({ revoked_at: new Date().toISOString() }) });
  await request(`user_devices?user_id=eq.${user.id}&unbound_at=is.null`, { method: 'PATCH', body: JSON.stringify({ unbound_at: new Date().toISOString() }) });
  await request(`users?id=eq.${user.id}`, { method: 'PATCH', body: JSON.stringify({ device_id: null }) });
  await request('conversations', { method: 'POST', body: JSON.stringify({ session_id: testerId(user.id), role_type: 'mandarin_coach_reset', user_message: JSON.stringify({ version: 1, tester_id: testerId(user.id), reset_at: new Date().toISOString() }), assistant_message: '{}' }) });
  process.stdout.write(JSON.stringify({ reset: label, testerId: testerId(user.id) }));
} else {
  throw new Error('Usage: node scripts/manage-preview-test-users.mjs create|reset TESTER01');
}
