import Link from 'next/link';
import { redirect } from 'next/navigation';
import AccountPasswordForm from '@/components/AccountPasswordForm';
import AccountPresence from '@/components/AccountPresence';
import LegacyDataMigration from '@/components/LegacyDataMigration';
import { getCurrentAccountUser } from '@/lib/account/auth';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getCurrentAccountUser();
  if (!user) redirect('/login');
  const direction = user.learning_direction === 'ZH_TO_ID' ? '中文 → 印尼语' : '印尼语 → 中文';
  const stats = [
    ['Nomor telepon（手机号）', user.phone], ['Keanggotaan（会员）', user.membership_code],
    ['Arah Belajar（学习方向）', direction], ['Status（状态）', user.account_status],
    ['Hari Belajar（学习天数）', String(user.consecutive_learning_days)], ['Pengalaman Selesai（完成场景）', String(user.completed_experiences)],
    ['Favorit（收藏）', String(user.favorites_count)], ['Kontribusi Skenario（共创场景）', String(user.scene_contributions)],
  ];
  return <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-12 sm:px-8">
    <AccountPresence />
    <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← IndoBrain</Link>
    <header className="mt-8"><p className="text-sm text-gray-400">Akun Saya（我的账户）</p><h1 className="mt-2 text-3xl font-semibold">{user.public_id}</h1></header>
    <section className="mt-8 grid gap-3 sm:grid-cols-2">{stats.map(([label, value]) => <article key={label} className="rounded-2xl border border-stone-200 p-4"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 font-medium">{value}</p></article>)}</section>
    <LegacyDataMigration />
    <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5"><h2 className="font-semibold">Keamanan Akun <span className="font-normal text-gray-400">（账户安全）</span></h2><AccountPasswordForm /></section>
  </main>;
}
