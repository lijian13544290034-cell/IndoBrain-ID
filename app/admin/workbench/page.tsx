import Link from 'next/link';
import { redirect } from 'next/navigation';
import AccountLogoutActions from '@/components/AccountLogoutActions';
import { getCurrentAccountUser, requireSuperAdmin } from '@/lib/account/auth';

export const dynamic = 'force-dynamic';

const entries = [
  {
    key: 'zh-id-admin',
    title: '中国人学印尼语 — 后台管理',
    subtitle: 'Kelola siswa Bahasa Indonesia',
    href: '/admin?direction=ZH_TO_ID',
    kind: '管理端',
    newTab: false,
  },
  {
    key: 'zh-id-learn',
    title: '中国人学印尼语 — 学习页面',
    subtitle: 'Belajar Bahasa Indonesia',
    href: '/',
    kind: '学习端',
    newTab: true,
  },
  {
    key: 'id-zh-admin',
    title: '印尼人学中文 — 后台管理',
    subtitle: 'Kelola siswa Mandarin',
    href: '/admin?direction=ID_TO_ZH',
    kind: '管理端',
    newTab: false,
  },
  {
    key: 'id-zh-learn',
    title: '印尼人学中文 — 学习页面',
    subtitle: 'Belajar Mandarin',
    href: '/learn-chinese',
    kind: '学习端',
    newTab: true,
  },
] as const;

export default async function SuperAdminWorkbenchPage() {
  const user = await getCurrentAccountUser();
  if (!user) redirect('/login?next=/admin/workbench');
  if (user.must_change_password) redirect('/change-initial-password');
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/account');
  }

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 sm:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm text-blue-700">尼会说 · IndoBrain</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Super Admin 工作台</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">选择要管理或学习的方向。学习页面会在新标签页打开，工作台会保留，切换时不需要重新登录。</p>
      </div>
      <AccountLogoutActions />
    </header>

    <section aria-label="Super Admin 入口" className="mt-8 grid gap-4 md:grid-cols-2">
      {entries.map((entry) => <Link
        key={entry.key}
        href={entry.href}
        target={entry.newTab ? '_blank' : undefined}
        rel={entry.newTab ? 'noreferrer' : undefined}
        className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:ring-4 focus-visible:ring-blue-200"
      >
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{entry.kind}</span>
        <h2 className="mt-4 text-xl font-semibold text-slate-950 group-hover:text-blue-800">{entry.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{entry.subtitle}</p>
        <p className="mt-5 text-sm font-medium text-blue-700">进入{entry.newTab ? '（新标签页）' : ''} →</p>
      </Link>)}
    </section>
  </main>;
}

