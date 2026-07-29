import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import { getCurrentAccountUser, requireSuperAdmin } from '@/lib/account/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentAccountUser();
  if (!user) redirect('/login');
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/account');
  }
  return <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8">
    <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← Masuk ke Belajar（进入学习端）</Link>
    <header className="mt-7">
      <p className="text-sm text-gray-400">IndoBrain Commercial</p>
      <h1 className="mt-2 text-3xl font-semibold">Admin（管理后台）</h1>
      <p className="mt-2 text-sm text-gray-500">仅 SUPER_ADMIN 可创建和管理账号。</p>
    </header>
    <div className="mt-8"><AdminDashboard /></div>
  </main>;
}
