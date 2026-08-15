import Link from 'next/link';

const reviewScenes = [
  { code: 'G16', title: '保姆临时请假，我要重新安排家里事情', href: '/nanny/018?workflow=kerja' },
  { code: 'G17', title: '给保姆安排明天几件重要事情', href: '/nanny/032?workflow=kerja' },
  { code: 'G18', title: '司机迟到了，我要追问他在哪里', href: '/driver/002?workflow=jemput' },
  { code: 'G19', title: '发定位给司机，让他准确找到我', href: '/driver/009?workflow=jemput' },
  { code: 'G20', title: '给司机安排一天多个目的地', href: '/driver/010?workflow=menunggu' },
  { code: 'G21', title: '新员工第一天到岗，我要交代基本规则', href: '/factory/manager/021?workflow=produksi' },
  { code: 'G22', title: '员工没听懂任务，我要重新说明', href: '/factory/manager/022?workflow=produksi' },
  { code: 'G23', title: '员工做错了，我要要求返工', href: '/factory/manager/023?workflow=produksi' },
  { code: 'G24', title: '员工迟到，我要问原因并提醒', href: '/factory/manager/024?workflow=produksi' },
  { code: 'G25', title: '员工做事太慢，我要提高效率', href: '/factory/manager/025?workflow=material' },
  { code: 'G26', title: '员工上班玩手机，我要当场提醒', href: '/factory/manager/026?workflow=material' },
  { code: 'G27', title: '给员工安排三件今天必须完成的事', href: '/factory/manager/027?workflow=produksi' },
  { code: 'G28', title: '检查员工进度，追问没有完成的部分', href: '/factory/manager/028?workflow=produksi' },
  { code: 'G29', title: '员工说做不了，我要找出真实阻碍', href: '/factory/manager/029?workflow=produksi' },
  { code: 'G30', title: '员工请假，我要判断是否批准', href: '/factory/manager/030?workflow=produksi' },
  { code: 'G31', title: '员工要求加薪，我要回应并设定下一步', href: '/factory/manager/031?workflow=produksi' },
  { code: 'G32', title: '员工犯严重错误，我要正式沟通', href: '/factory/manager/032?workflow=produksi' },
  { code: 'G33', title: '两个员工发生矛盾，我要现场调解', href: '/factory/manager/033?workflow=kualitas' },
  { code: 'G34', title: '早上开 5 分钟晨会', href: '/factory/manager/034?workflow=keamanan' },
  { code: 'G35', title: '下班前检查今天结果', href: '/factory/manager/035?workflow=produksi' },
];

export default function GoldenBatch3ReviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Beranda（返回首页）
      </Link>
      <header className="mt-7 rounded-3xl border border-blue-100 bg-blue-50/80 px-5 py-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Human Review</p>
        <h1 className="mt-2 text-2xl font-semibold text-blue-950">黄金场景 G16–G35</h1>
        <p className="mt-3 text-sm leading-6 text-blue-900/75">
          从 G16 开始逐条打开，实际体验学习、播放、收藏、完成学习和上一条 / 下一条。
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
