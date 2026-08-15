import Link from 'next/link';

const reviewScenes = [
  { code: 'G36', title: '今天产量没达标，我要现场问原因', href: '/factory/manager/036?workflow=pelanggan' },
  { code: 'G37', title: '发现产品质量问题，要求检查整批货', href: '/factory/manager/037?workflow=material' },
  { code: 'G38', title: '机器突然停了，叫技术人员马上处理', href: '/factory/manager/038?workflow=produksi' },
  { code: 'G39', title: '原材料快没了，确认还能生产多久', href: '/factory/manager/039?workflow=produksi' },
  { code: 'G40', title: '仓库数量对不上，现场盘点', href: '/factory/manager/040?workflow=produksi' },
  { code: 'G41', title: '员工没有按照 SOP 操作', href: '/factory/manager/041?workflow=pelanggan' },
  { code: 'G42', title: '客户订单很急，调整生产优先级', href: '/factory/manager/042?workflow=kualitas' },
  { code: 'G43', title: '现场发生小型工伤 / 意外', href: '/factory/manager/043?workflow=produksi' },
  { code: 'G44', title: '货做好了，但包装不符合要求', href: '/factory/manager/044?workflow=produksi' },
  { code: 'G45', title: '下班前确认产量、次品和明天计划', href: '/factory/manager/045?workflow=produksi' },
  { code: 'G46', title: '第一次向供应商询价', href: '/life/157?category=business' },
  { code: 'G47', title: '供应商报价太高，我要砍价', href: '/life/158?category=business' },
  { code: 'G48', title: '谈 MOQ 和不同采购数量的价格', href: '/life/159?category=business' },
  { code: 'G49', title: '谈定金、尾款和账期', href: '/life/160?category=business' },
  { code: 'G50', title: '供应商延期，我要正式催货', href: '/life/161?category=business' },
  { code: 'G51', title: '收到货发现数量少了', href: '/life/162?category=business' },
  { code: 'G52', title: '货到了，但质量和样品不一样', href: '/life/163?category=business' },
  { code: 'G53', title: '供应商一直找理由，我要拿到解决方案', href: '/life/164?category=business' },
  { code: 'G54', title: '对账金额不一致', href: '/life/165?category=business' },
  { code: 'G55', title: '谈长期合作和更好的条件', href: '/life/166?category=business' },
];

export default function GoldenBatch4ReviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Beranda（返回首页）
      </Link>
      <header className="mt-7 rounded-3xl border border-blue-100 bg-blue-50/80 px-5 py-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Human Review</p>
        <h1 className="mt-2 text-2xl font-semibold text-blue-950">黄金场景 G36–G55</h1>
        <p className="mt-3 text-sm leading-6 text-blue-900/75">
          从 G36 开始逐条打开，实际体验生产现场、供应商谈判、播放、收藏、完成学习和上一条 / 下一条。
        </p>
      </header>
      <section className="mt-6 grid gap-3">
        {reviewScenes.map((scene) => (
          <Link
            key={scene.code}
            href={scene.href}
            className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <p className="text-xs font-medium text-blue-600">{scene.code}</p>
            <p className="mt-1 text-base font-semibold text-stone-900">{scene.title}</p>
            <p className="mt-2 text-xs text-stone-400">{scene.href}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
