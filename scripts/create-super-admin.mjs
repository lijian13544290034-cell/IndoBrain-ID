import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const [phone, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!phone || !password || !url || !key) {
  console.error('Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-super-admin.mjs +628123456789 <password>');
  process.exit(1);
}
if (!/^\+[1-9]\d{6,14}$/.test(phone)) throw new Error('Phone must be E.164 format.');
if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error('Password must be at least 10 characters and include letters and numbers.');

const salt = randomBytes(16).toString('hex');
const keyBytes = await scrypt(password, salt, 64);
const passwordHash = `scrypt$${salt}$${Buffer.from(keyBytes).toString('hex')}`;
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const userResponse = await fetch(`${url}/rest/v1/users`, { method: 'POST', headers, body: JSON.stringify({ phone, password_hash: passwordHash, membership_code: 'SVIP', learning_direction: 'ZH_TO_ID', account_status: 'ACTIVE', register_source: 'BOOTSTRAP' }) });
if (!userResponse.ok) throw new Error(`User creation failed: ${userResponse.status}`);
const [user] = await userResponse.json();
const roleResponse = await fetch(`${url}/rest/v1/user_roles`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ user_id: user.id, role_code: 'SUPER_ADMIN' }) });
if (!roleResponse.ok) throw new Error(`Role assignment failed: ${roleResponse.status}`);
console.log(`Created Super Admin ${user.public_id}.`);
