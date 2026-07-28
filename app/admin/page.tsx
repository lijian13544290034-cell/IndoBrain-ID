import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import { getCurrentAccountUser, requireAdmin } from '@/lib/account/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentAccountUser();
  if (!user) redirect('/login');
  try { await requireAdmin(); } catch { redirect('/account'); }
  return <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8"><Link href="/account" className="text-sm text-gray-400 hover:text-gray-700">← Akun Saya</Link><header className="mt-7"><p className="text-sm text-gray-400">IndoBrain Commercial</p><h1 className="mt-2 text-3xl font-semibold">Admin Dashboard</h1><p className="mt-2 text-sm text-gray-500">用户、会员、设备与学习数据管理</p></header><div className="mt-8"><AdminDashboard /></div></main>;
}
