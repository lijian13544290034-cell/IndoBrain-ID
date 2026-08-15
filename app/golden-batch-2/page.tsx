import Link from 'next/link';

const reviewScenes = [
  { code: 'G06', title: '让保姆准备今天的饭', href: '/nanny/005?workflow=makan' },
  { code: 'G07', title: '让保姆重点打扫家里', href: '/nanny/011?workflow=rumah' },
  { code: 'G08', title: '洗衣服、晾衣服、熨衣服', href: '/nanny/056?workflow=rumah' },
  { code: 'G09', title: '家里煤气没有了', href: '/nanny/010?workflow=belanja' },
  { code: 'G10', title: '让保姆买菜 / 买家里缺的东西', href: '/nanny/009?workflow=belanja' },
  { code: 'G11', title: '让司机明早来接我', href: '/driver/001?workflow=jemput' },
  { code: 'G12', title: '开车途中临时改目的地', href: '/driver/003?workflow=perjalanan' },
  { code: 'G13', title: '堵车了，问司机还要多久', href: '/driver/004?workflow=perjalanan' },
  { code: 'G14', title: '让司机停车等我', href: '/driver/008?workflow=menunggu' },
  { code: 'G15', title: '让司机去机场接人', href: '/driver/017?workflow=lanjutan' },
];

export default function GoldenBatch2ReviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Beranda（返回首页）
      </Link>
      <header className="mt-7 rounded-3xl border border-blue-100 bg-blue-50/80 px-5 py-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Human Review</p>
        <h1 className="mt-2 text-2xl font-semibold text-blue-950">黄金场景 Batch 2</h1>
        <p className="mt-3 text-sm leading-6 text-blue-900/75">
          从 G06 开始逐条打开，实际体验学习、播放、收藏、完成学习和上一条 / 下一条。
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
