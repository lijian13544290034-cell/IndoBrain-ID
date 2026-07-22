import Link from 'next/link';
import LocalizedLabel from '@/components/LocalizedLabel';

const roles = [
  { indonesian: 'Manajer Pabrik', chinese: '工厂经理', href: '/factory/manager', count: 50 },
  { indonesian: 'Produksi', chinese: '生产', href: '/module/production', count: 15 },
  { indonesian: 'Gudang', chinese: '仓库', href: '/module/warehouse', count: 15 },
  { indonesian: 'QC', chinese: '品质管理', href: '/module/qc', count: 15 },
  { indonesian: 'Purchasing', chinese: '采购', href: '/module/purchasing', count: 15 },
  { indonesian: 'Operator', chinese: '操作员', href: '/module/operator', count: 15 },
  { indonesian: 'Logistik', chinese: '物流', href: '/module/logistics', count: 6 },
  { indonesian: 'Pengiriman', chinese: '运输与发货', href: '/module/shipping', count: 6 },
  { indonesian: 'Ekspor', chinese: '出口', href: '/module/export', count: 6 },
  { indonesian: 'Layanan Pelanggan', chinese: '客户服务', href: '/module/customerService', count: 6 },
];

export default function FactoryPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
      <header className="mt-8">
        <p className="text-sm text-stone-400">IndoBrain</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pabrik</h1>
        <p className="mt-3 text-sm text-stone-500">Pilih peran untuk melihat situasi kerja.<br />选择角色浏览工作场景。</p>
        <nav className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Mode Pabrik">
          <Link href="/factory" className="min-h-12 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-medium text-white">Pengalaman（真实场景）<span className="mt-1 block text-xs font-normal text-stone-300">149 situasi</span></Link>
          <Link href="/factory/essentials" className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-100 hover:shadow-sm">Essentials（高频必备）<span className="mt-1 block text-xs font-normal text-stone-400">100 ungkapan</span></Link>
        </nav>
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
