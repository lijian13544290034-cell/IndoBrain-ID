const phoneArgument = process.argv.find((argument) => argument.startsWith('--phone='));
const phone = phoneArgument?.slice('--phone='.length)?.trim();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone) || !url || !key) {
  console.error('Usage: npm run admin:unbind -- --phone=+628123456789');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

async function request(path, init = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Recovery request failed: ${response.status}`);
  return response;
}

const userResponse = await request(`users?phone=eq.${encodeURIComponent(phone)}&deleted_at=is.null&select=id,public_id&limit=1`);
const [user] = await userResponse.json();
if (!user) throw new Error('No active user found for this phone number.');

const roleResponse = await request(`user_roles?user_id=eq.${encodeURIComponent(user.id)}&role_code=eq.SUPER_ADMIN&select=role_code&limit=1`);
const roles = await roleResponse.json();
if (!roles.length) throw new Error('Recovery command is limited to SUPER_ADMIN accounts.');

const now = new Date().toISOString();
const sessionsResponse = await request(`account_sessions?user_id=eq.${encodeURIComponent(user.id)}&revoked_at=is.null`, {
  method: 'PATCH',
  headers: { Prefer: 'return=representation' },
  body: JSON.stringify({ revoked_at: now }),
});
const sessions = await sessionsResponse.json();

await request(`user_devices?user_id=eq.${encodeURIComponent(user.id)}&unbound_at=is.null`, {
  method: 'PATCH', body: JSON.stringify({ unbound_at: now }),
});
await request(`users?id=eq.${encodeURIComponent(user.id)}`, {
  method: 'PATCH', body: JSON.stringify({ device_id: null }),
});
await request('admin_audit_logs', {
  method: 'POST',
  body: JSON.stringify({
    actor_user_id: user.id,
    target_user_id: user.id,
    action: 'BOOTSTRAP_DEVICE_UNBOUND',
    metadata: { source: 'npm run admin:unbind', sessions_revoked: sessions.length },
  }),
});

const remainingSessions = await request(`account_sessions?user_id=eq.${encodeURIComponent(user.id)}&revoked_at=is.null&select=id`);
const remainingDevices = await request(`user_devices?user_id=eq.${encodeURIComponent(user.id)}&unbound_at=is.null&select=id`);
const remainingDeviceField = await request(`users?id=eq.${encodeURIComponent(user.id)}&select=device_id&limit=1`);
const activeSessions = await remainingSessions.json();
const activeDevices = await remainingDevices.json();
const [recoveredUser] = await remainingDeviceField.json();

if (activeSessions.length || activeDevices.length || recoveredUser?.device_id) {
  throw new Error('Recovery verification failed.');
}
console.log(`Recovered ${user.public_id}: ${sessions.length} active session(s) revoked, device binding cleared, and audit recorded.`);
