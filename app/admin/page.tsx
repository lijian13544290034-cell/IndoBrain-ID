import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import AccountLogoutActions from '@/components/AccountLogoutActions';
import { getCurrentAccountUser, requireSuperAdmin } from '@/lib/account/auth';
import { ADMIN_DIRECTION_LABELS, parseAdminDirection } from '@/lib/account/admin-direction';
import { initialStudentPassword } from '@/lib/account/config';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ direction?: string }> }) {
  const user = await getCurrentAccountUser();
  if (!user) redirect('/login');
  if (user.must_change_password) redirect('/change-initial-password');
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/account');
  }
  const direction = parseAdminDirection((await searchParams).direction);
  if (!direction) redirect('/admin/workbench');
  const initialPassword = initialStudentPassword();
  const directionLabel = ADMIN_DIRECTION_LABELS[direction];
  return <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><Link href="/admin/workbench" className="text-sm text-gray-500 hover:text-blue-700">← 返回 Super Admin 工作台</Link><p className="mt-7 text-sm text-gray-400">IndoBrain Commercial</p><h1 className="mt-2 text-3xl font-semibold">{directionLabel.chinese} — 管理后台</h1><p className="mt-2 text-sm text-gray-500">{directionLabel.indonesian} · 仅 SUPER_ADMIN 可访问。</p></div>
      <AccountLogoutActions />
    </header>
    <div className="mt-8"><AdminDashboard initialPassword={initialPassword} direction={direction} /></div>
  </main>;
}
