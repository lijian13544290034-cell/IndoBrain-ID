'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AccountRole, AccountUser, AdminStats, LearningDirection, LoginHistoryEntry, MembershipLevel } from '@/lib/account/types';

const plans: MembershipLevel[] = ['BASIC', 'PRO', 'VIP', 'ENTERPRISE', 'SVIP'];
const directions: LearningDirection[] = ['ZH_TO_ID', 'ID_TO_ZH'];
const roles: AccountRole[] = ['USER', 'REVIEWER', 'ADMIN', 'SUPER_ADMIN'];
const emptyStats: AdminStats = {
  totalUsers: 0, onlineUsers: 0, activeUsersToday: 0, activeUsersSevenDays: 0, newUsers: 0,
  membershipDistribution: { BASIC: 0, PRO: 0, VIP: 0, ENTERPRISE: 0, SVIP: 0 },
  expiringWithin30Days: 0, learningTimeToday: 0, completedExperiencesToday: 0,
  favoritesToday: 0, sceneContributionsToday: 0, pendingReviews: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);

  async function load(search = query) {
    const [statsResponse, usersResponse, historyResponse] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch(`/api/admin/users?query=${encodeURIComponent(search)}`),
      fetch('/api/admin/login-history'),
    ]);
    if (statsResponse.ok) setStats(await statsResponse.json() as AdminStats);
    if (usersResponse.ok) setUsers((await usersResponse.json() as { users: AccountUser[] }).users);
    if (historyResponse.ok) setHistory((await historyResponse.json() as { history: LoginHistoryEntry[] }).history.slice(0, 10));
    if (!statsResponse.ok || !usersResponse.ok) setNotice('Administrator sign-in and database configuration are required.');
  }

  useEffect(() => { void load(''); }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setCreating(true);
    setNotice('');
    const response = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json() as { error?: string; user?: AccountUser };
    setCreating(false);
    if (!response.ok) return setNotice(data.error ?? 'Unable to create user.');
    event.currentTarget.reset();
    setNotice(`Created ${data.user?.public_id ?? 'user'}.`);
    void load();
  }

  async function action(user: AccountUser, actionName: string) {
    const membership = actionName === 'change_membership' ? prompt('Membership: BASIC, PRO, VIP, ENTERPRISE, or SVIP', user.membership_code) : undefined;
    const password = actionName === 'reset_password' ? prompt('New temporary password (10+ chars, letters and numbers):') : undefined;
    const expiresAt = actionName === 'extend_membership' ? prompt('Expiry ISO date, or leave blank for no expiry:', user.expires_at ?? '') : undefined;
    const role = actionName === 'assign_role' ? prompt('Role: USER, REVIEWER, ADMIN, or SUPER_ADMIN', 'USER') : undefined;
    if ((actionName === 'change_membership' && !membership) || (actionName === 'reset_password' && !password) || (actionName === 'assign_role' && !role) || expiresAt === null) return;
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: actionName, membership, password, expiresAt, role }),
    });
    const data = await response.json() as { error?: string };
    setNotice(data.error ?? (response.ok ? 'User updated.' : 'Unable to update user.'));
    if (response.ok) void load();
  }

  const cards = [
    ['Total Users', stats.totalUsers], ['Online Now', stats.onlineUsers], ['Active Today', stats.activeUsersToday], ['Active 7 Days', stats.activeUsersSevenDays],
    ['New Users Today', stats.newUsers], ['Expiring Within 30 Days', stats.expiringWithin30Days], ['Learning Minutes Today', stats.learningTimeToday],
    ['Completed Today', stats.completedExperiencesToday], ['Favorites Today', stats.favoritesToday], ['Scene Contributions Today', stats.sceneContributionsToday],
    ['Pending Reviews', stats.pendingReviews],
  ];

  return <div className="space-y-8">
    <section className="grid gap-3 sm:grid-cols-3">
      {cards.map(([label, value]) => <article key={String(label)} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></article>)}
    </section>

    <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <h2 className="text-lg font-semibold">Create User <span className="font-normal text-gray-400">（创建用户）</span></h2>
      <form onSubmit={createUser} className="mt-4 grid gap-3 md:grid-cols-2">
        <input required name="phone" placeholder="+628123456789" className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
        <input required name="password" type="password" placeholder="Initial password" className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
        <select name="membership" defaultValue="BASIC" className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">{plans.map((plan) => <option key={plan}>{plan}</option>)}</select>
        <select name="learningDirection" defaultValue="ZH_TO_ID" className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">{directions.map((direction) => <option key={direction}>{direction}</option>)}</select>
        <select name="role" defaultValue="USER" className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">{roles.map((role) => <option key={role}>{role}</option>)}</select>
        <input name="expiresAt" type="datetime-local" className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
        <button disabled={creating} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{creating ? 'Creating…' : 'Create User'}</button>
      </form>
    </section>

    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-semibold">Users <span className="font-normal text-gray-400">（用户）</span></h2><form onSubmit={(event) => { event.preventDefault(); void load(query); }} className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Phone or IB ID" className="rounded-xl border border-stone-300 px-3 py-2 text-sm" /><button className="rounded-xl border border-stone-300 px-3 py-2 text-sm">Search</button></form></div>
      {notice && <p className="mt-3 rounded-xl bg-stone-100 px-3 py-2 text-sm text-gray-600">{notice}</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-stone-50 text-xs text-gray-500"><tr><th className="p-3">ID</th><th>Phone</th><th>Membership</th><th>Status</th><th>Direction</th><th>Last Login</th><th className="p-3">Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-stone-100"><td className="p-3 font-medium">{user.public_id}</td><td>{user.phone}</td><td>{user.membership_code}</td><td>{user.account_status}</td><td>{user.learning_direction}</td><td>{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : '—'}</td><td className="p-3"><div className="flex flex-wrap gap-1"><button onClick={() => void action(user, 'reset_password')} className="rounded-lg border px-2 py-1 text-xs">Reset</button><button onClick={() => void action(user, 'change_membership')} className="rounded-lg border px-2 py-1 text-xs">Plan</button><button onClick={() => void action(user, 'extend_membership')} className="rounded-lg border px-2 py-1 text-xs">Extend</button><button onClick={() => void action(user, user.account_status === 'ACTIVE' ? 'suspend' : 'reactivate')} className="rounded-lg border px-2 py-1 text-xs">{user.account_status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</button><button onClick={() => void action(user, 'unbind_device')} className="rounded-lg border px-2 py-1 text-xs">Unbind</button><button onClick={() => void action(user, 'assign_role')} className="rounded-lg border px-2 py-1 text-xs">Role</button></div></td></tr>)}</tbody></table></div>
    </section>

    <section className="rounded-2xl border border-stone-200"><div className="border-b border-stone-200 px-5 py-4"><h2 className="font-semibold">Login History <span className="font-normal text-gray-400">（登录记录）</span></h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-xs text-gray-500"><tr><th className="p-3">Phone</th><th>Status</th><th>Time</th><th>Device</th><th>Browser</th><th>Country</th></tr></thead><tbody>{history.map((entry) => <tr key={entry.id} className="border-t border-stone-100"><td className="p-3">{entry.phone}</td><td>{entry.login_status}</td><td>{new Date(entry.login_at).toLocaleString()}</td><td>{entry.device_id ?? '—'}</td><td>{entry.browser ?? '—'}</td><td>{entry.country ?? '—'}</td></tr>)}{history.length === 0 && <tr><td colSpan={6} className="p-5 text-center text-gray-400">No login history yet.</td></tr>}</tbody></table></div></section>
  </div>;
}
