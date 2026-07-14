import Link from 'next/link';
import LocalizedLabel from '@/components/LocalizedLabel';

const roles = [
  { indonesian: 'Manajer Pabrik', chinese: '工厂经理', href: '/factory/manager', count: 50 },
  { indonesian: 'Produksi', chinese: '生产', href: '/module/production', count: 8 },
  { indonesian: 'Gudang', chinese: '仓库', href: '/module/warehouse', count: 8 },
  { indonesian: 'QC', chinese: '品质管理', href: '/module/qc', count: 8 },
  { indonesian: 'Purchasing', chinese: '采购', href: '/module/purchasing', count: 8 },
  { indonesian: 'Operator', chinese: '操作员', href: '/module/operator', count: 8 },
];

export default function FactoryPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
      <header className="mt-8">
        <p className="text-sm text-stone-400">IndoBrain</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pabrik</h1>
        <p className="mt-3 text-sm text-stone-500">Pilih peran untuk melihat situasi kerja.<br />选择角色浏览工作场景。</p>
      </header>

      <section className="mt-9 grid gap-3 sm:grid-cols-2" aria-label="Factory roles">
        {roles.map((role) => (
          <Link key={role.indonesian} href={role.href} className="flex min-h-40 cursor-pointer flex-col rounded-2xl border border-stone-300 bg-white px-5 py-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <LocalizedLabel indonesian={role.indonesian} chinese={role.chinese} className="font-semibold" />
            <p className="mt-auto pt-4 text-sm leading-6 text-stone-500">{role.count} situasi tersedia<br />已完成 {role.count} 个工作场景</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
