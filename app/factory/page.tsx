import Link from 'next/link';
import LocalizedLabel from '@/components/LocalizedLabel';

const roles = [
  { indonesian: 'Manajer Pabrik', chinese: '工厂经理', href: '/factory/manager', active: true },
  { indonesian: 'Produksi', chinese: '生产', active: false },
  { indonesian: 'Gudang', chinese: '仓库', active: false },
  { indonesian: 'QC', chinese: '品质管理', active: false },
  { indonesian: 'Purchasing', chinese: '采购', active: false },
  { indonesian: 'Operator', chinese: '操作员', active: false },
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
        {roles.map((role) => role.active ? (
          <Link key={role.indonesian} href={role.href!} className="rounded-2xl border border-stone-300 bg-white px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <LocalizedLabel indonesian={role.indonesian} chinese={role.chinese} className="font-semibold" />
            <p className="mt-4 text-sm text-stone-500">Tahap pertama · 50 situasi tersedia<br />第一阶段 · 已完成 50 个工作场景</p>
          </Link>
        ) : (
          <div key={role.indonesian} className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5 text-stone-500">
            <LocalizedLabel indonesian={role.indonesian} chinese={role.chinese} className="font-medium" chineseClassName="text-stone-400" />
            <p className="mt-4 text-sm text-stone-400">Segera Hadir<br />即将上线</p>
          </div>
        ))}
      </section>
    </main>
  );
}
