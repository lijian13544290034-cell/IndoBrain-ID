'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AccountUser, AdminStats, LearningDirection, LoginHistoryEntry, MembershipLevel } from '@/lib/account/types';
import BulkStudentImport from './BulkStudentImport';

const plans: MembershipLevel[] = ['BASIC', 'PRO', 'VIP', 'ENTERPRISE', 'SVIP'];
const planLabels: Record<MembershipLevel, string> = {
  BASIC: '基础会员', PRO: 'Pro会员', VIP: 'VIP会员', ENTERPRISE: '企业会员', SVIP: 'SVIP会员',
};
const directions: Record<LearningDirection, string> = {
  ZH_TO_ID: '中文 → 印尼语', ID_TO_ZH: '印尼语 → 中文',
};
const emptyStats: AdminStats = {
  totalUsers: 0, onlineUsers: 0, activeUsersToday: 0, activeUsersSevenDays: 0, newUsers: 0,
  membershipDistribution: { BASIC: 0, PRO: 0, VIP: 0, ENTERPRISE: 0, SVIP: 0 },
  expiringWithin30Days: 0, expiredMembers: 0, loginsToday: 0, loginsThisWeek: 0,
  learningTimeToday: 0, completedExperiencesToday: 0, favoritesToday: 0, sceneContributionsToday: 0, pendingReviews: 0,
};

function Label({ indonesian, chinese }: { indonesian: string; chinese: string }) {
  return <><span>{indonesian}</span><span className="ml-1 text-gray-400">（{chinese}）</span></>;
}

function dateValue(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('zh-CN') : '长期有效';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdUser, setCreatedUser] = useState<AccountUser | null>(null);

  async function load(search = query) {
    const [statsResponse, usersResponse, historyResponse] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch(`/api/admin/users?query=${encodeURIComponent(search)}`),
      fetch('/api/admin/login-history'),
    ]);
    if (statsResponse.ok) setStats(await statsResponse.json() as AdminStats);
    if (usersResponse.ok) setUsers((await usersResponse.json() as { users: AccountUser[] }).users);
    if (historyResponse.ok) setHistory((await historyResponse.json() as { history: LoginHistoryEntry[] }).history.slice(0, 10));
    if (!statsResponse.ok || !usersResponse.ok) setNotice('需要以超级管理员身份登录，并确认测试数据库已连接。');
  }

  useEffect(() => { void load(''); }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setCreating(true);
    setNotice('');
    setCreatedUser(null);
    const response = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json() as { error?: string; user?: AccountUser };
    setCreating(false);
    if (!response.ok || !data.user) {
      setNotice(data.error ?? '无法创建账号。');
      return;
    }
    formElement.reset();
    setCreatedUser(data.user);
    setNotice('账号创建成功。新用户可立即使用手机号和初始密码登录。');
    void load();
  }

  async function action(user: AccountUser, actionName: string) {
    const membership = actionName === 'change_membership' ? prompt('会员等级：BASIC、PRO、VIP、ENTERPRISE 或 SVIP', user.membership_code) : undefined;
    const expiresAt = actionName === 'extend_membership' ? prompt('到期时间（ISO 格式；留空代表长期有效）', user.expires_at ?? '') : undefined;
    if ((actionName === 'change_membership' && !membership) || expiresAt === null) return;
    if (actionName === 'reset_password' && !confirm(`确认将 ${user.public_id} 重置为统一初始密码？用户下次登录必须修改密码。`)) return;
    if (actionName === 'soft_delete' && !confirm(`确认软删除 ${user.public_id}？该账号将不能登录。`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: actionName, membership, expiresAt }),
    });
    const data = await response.json() as { error?: string };
    setNotice(data.error ?? (response.ok ? '账号已更新。' : '无法更新账号。'));
    if (response.ok) void load();
  }

  async function editUser(user: AccountUser) {
    const name = prompt('姓名：', user.display_name ?? '');
    if (name === null) return;
    const phone = prompt('手机号（国际格式）：', user.phone);
    if (phone === null || !phone.trim()) return;
    const membership = prompt('会员等级：BASIC、PRO、VIP、ENTERPRISE 或 SVIP', user.membership_code);
    if (membership === null || !membership.trim()) return;
    const learningDirection = prompt('学习方向：ZH_TO_ID 或 ID_TO_ZH', user.learning_direction);
    if (learningDirection === null || !learningDirection.trim()) return;
    const expiresAt = prompt('到期时间（ISO 格式；留空代表长期有效）', user.expires_at ?? '');
    if (expiresAt === null) return;
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit', name, phone, membership, learningDirection, expiresAt }),
    });
    const data = await response.json() as { error?: string };
    setNotice(data.error ?? (response.ok ? '账号资料已更新。' : '无法更新账号资料。'));
    if (response.ok) void load();
  }

  async function showDevices(user: AccountUser) {
    const response = await fetch(`/api/admin/users/${user.id}/devices`);
    const data = await response.json() as { devices?: Array<{ device_id: string; last_seen_at: string; unbound_at: string | null }>; error?: string };
    if (!response.ok) return setNotice(data.error ?? '无法读取设备。');
    const text = data.devices?.length
      ? data.devices.map((item) => `${item.device_id.slice(0, 12)}… · ${item.unbound_at ? '已解绑' : '已绑定'} · ${new Date(item.last_seen_at).toLocaleString()}`).join('\n')
      : '没有设备绑定记录。';
    alert(text);
  }

  const cards: Array<[string, string, number]> = [
    ['Total Users', '用户总数', stats.totalUsers], ['Online Now', '当前在线', stats.onlineUsers],
    ['Logins Today', '今日登录', stats.loginsToday], ['Logins This Week', '本周登录', stats.loginsThisWeek],
    ['Active Today', '今日活跃', stats.activeUsersToday], ['Expiring Soon', '即将到期', stats.expiringWithin30Days],
    ['Expired', '已到期', stats.expiredMembers], ['Pending Reviews', '待审核', stats.pendingReviews],
  ];

  return <div className="space-y-8">
    <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold"><Label indonesian="Kelola Akun" chinese="账号管理" /></h2><p className="mt-1 text-sm text-gray-500">仅 SUPER_ADMIN 可以创建和管理测试账号。</p></div>
      <button onClick={() => { setShowCreateForm((visible) => !visible); setCreatedUser(null); }} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700"><Label indonesian={showCreateForm ? 'Tutup Formulir' : 'Buat Akun'} chinese={showCreateForm ? '关闭表单' : '创建账号'} /></button>
    </section>

    {showCreateForm && <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold"><Label indonesian="Buat Akun Baru" chinese="创建新账号" /></h2>
      <p className="mt-1 text-sm text-gray-500">账号由管理员创建；新用户使用手机号和初始密码登录。</p>
      <form onSubmit={createUser} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">姓名<input name="name" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal" /></label>
        <label className="grid gap-1 text-sm font-medium">手机号（国际格式）<input required name="phone" inputMode="tel" placeholder="+628123456789" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal" /></label>
        <label className="grid gap-1 text-sm font-medium">初始密码<input required name="password" type="password" minLength={10} placeholder="至少 10 位，含字母和数字" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal" /></label>
        <label className="grid gap-1 text-sm font-medium">会员等级<select required name="membership" defaultValue="BASIC" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal">{plans.map((plan) => <option key={plan} value={plan}>{planLabels[plan]}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">学习方向<select required name="learningDirection" defaultValue="ZH_TO_ID" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal"><option value="ZH_TO_ID">中文 → 印尼语</option><option value="ID_TO_ZH">印尼语 → 中文</option></select></label>
        <label className="grid gap-1 text-sm font-medium">开通日期<input value={new Date().toISOString().slice(0, 10)} disabled className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 font-normal text-gray-500" /><span className="text-xs font-normal text-gray-400">账号创建时自动记录。</span></label>
        <label className="grid gap-1 text-sm font-medium">到期日期<input name="expiresAt" type="datetime-local" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal" /><span className="text-xs font-normal text-gray-400">留空代表长期有效。</span></label>
        <label className="grid gap-1 text-sm font-medium">账号状态<select name="accountStatus" defaultValue="ACTIVE" className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal"><option value="ACTIVE">active（正常）</option><option value="SUSPENDED">suspended（停用）</option></select></label>
        <div className="flex items-end"><button disabled={creating} className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">{creating ? '正在创建…' : 'Buat Akun（创建账号）'}</button></div>
      </form>
      {createdUser && <article className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><p className="font-semibold">账号已创建，可立即登录。</p><dl className="mt-3 grid gap-2 sm:grid-cols-2"><div><dt className="text-emerald-700">用户编号</dt><dd>{createdUser.public_id}</dd></div><div><dt className="text-emerald-700">手机号</dt><dd>{createdUser.phone}</dd></div><div><dt className="text-emerald-700">会员等级</dt><dd>{planLabels[createdUser.membership_code]}</dd></div><div><dt className="text-emerald-700">有效期</dt><dd>{dateValue(createdUser.expires_at)}</dd></div></dl></article>}
    </section>}

    <BulkStudentImport />

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([indonesian, chinese, value]) => <article key={indonesian} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs text-gray-500"><Label indonesian={indonesian} chinese={chinese} /></p><p className="mt-2 text-2xl font-semibold">{value}</p></article>)}</section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{plans.map((plan) => <article key={plan} className="rounded-2xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs text-gray-500">{planLabels[plan]}</p><p className="mt-2 text-xl font-semibold">{stats.membershipDistribution[plan]}</p></article>)}</section>

    <section><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-semibold"><Label indonesian="Pengguna" chinese="用户管理" /></h2><form onSubmit={(event) => { event.preventDefault(); void load(query); }} className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="手机号或 IB 编号" className="rounded-xl border border-stone-300 px-3 py-2 text-sm" /><button className="rounded-xl border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50">Cari（搜索）</button></form></div>
      {notice && <p className="mt-3 rounded-xl bg-stone-100 px-3 py-2 text-sm text-gray-700">{notice}</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-stone-50 text-xs text-gray-500"><tr><th className="p-3">用户编号</th><th>姓名 / 手机号</th><th>会员</th><th>状态</th><th>学习方向</th><th>初始密码</th><th>有效期</th><th className="p-3">操作</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-stone-100"><td className="p-3 font-medium">{user.public_id}</td><td><p>{user.display_name || '—'}</p><p className="text-xs text-gray-500">{user.phone}</p></td><td>{planLabels[user.membership_code]}</td><td>{user.account_status === 'ACTIVE' ? 'active（正常）' : user.account_status === 'SUSPENDED' ? 'suspended（停用）' : 'deleted（已删除）'}</td><td>{directions[user.learning_direction]}</td><td>{user.must_change_password ? '需修改' : '已设置'}</td><td>{dateValue(user.expires_at)}</td><td className="p-3"><div className="flex flex-wrap gap-1"><button onClick={() => void editUser(user)} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">编辑</button><button onClick={() => void action(user, 'reset_password')} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">重置密码</button><button onClick={() => void action(user, 'change_membership')} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">会员</button><button onClick={() => void action(user, 'extend_membership')} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">到期时间</button><button onClick={() => void action(user, user.account_status === 'ACTIVE' ? 'suspend' : 'reactivate')} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">{user.account_status === 'ACTIVE' ? '停用' : '恢复'}</button><button onClick={() => void showDevices(user)} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">设备</button><button onClick={() => void action(user, 'unbind_device')} className="rounded-lg border px-2 py-1 text-xs hover:bg-stone-50">解除设备绑定</button><button onClick={() => void action(user, 'soft_delete')} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">删除</button></div></td></tr>)}{users.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-400">暂时没有用户。</td></tr>}</tbody></table></div>
    </section>

    <section className="rounded-2xl border border-stone-200"><div className="border-b border-stone-200 px-5 py-4"><h2 className="font-semibold"><Label indonesian="Riwayat Masuk" chinese="登录历史" /></h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-stone-50 text-xs text-gray-500"><tr><th className="p-3">手机号</th><th>状态</th><th>时间</th><th>设备</th><th>浏览器</th><th>国家</th></tr></thead><tbody>{history.map((entry) => <tr key={entry.id} className="border-t border-stone-100"><td className="p-3">{entry.phone}</td><td>{entry.login_status === 'SUCCESS' ? '成功' : '失败'}</td><td>{new Date(entry.login_at).toLocaleString()}</td><td>{entry.device_id ?? '—'}</td><td>{entry.browser ?? '—'}</td><td>{entry.country ?? '—'}</td></tr>)}{history.length === 0 && <tr><td colSpan={6} className="p-5 text-center text-gray-400">暂无登录记录。</td></tr>}</tbody></table></div></section>
  </div>;
}
