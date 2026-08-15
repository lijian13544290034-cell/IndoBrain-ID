import Link from 'next/link';

const reviewScenes = [
  { code: 'G56', title: '员工汇报了半天，我还是没听懂', href: '/life/144?category=business' },
  { code: 'G57', title: '员工说“已经做了”，但其实还没真正完成', href: '/life/145?category=business' },
  { code: 'G58', title: 'WhatsApp 工作消息一直没人回复', href: '/life/146?category=business' },
  { code: 'G59', title: '我要员工今天把资料发给我', href: '/life/147?category=business' },
  { code: 'G60', title: '会议要开始了，人还没到齐', href: '/life/148?category=business' },
  { code: 'G61', title: '员工一直说问题，却不给解决方案', href: '/life/149?category=business' },
  { code: 'G62', title: '几个部门互相推责任', href: '/life/150?category=business' },
  { code: 'G63', title: '员工没有主动汇报，出问题我最后才知道', href: '/life/151?category=business' },
  { code: 'G64', title: '面试一个印尼员工', href: '/life/152?category=business' },
  { code: 'G65', title: '员工准备离职，我要了解真正原因', href: '/life/153?category=business' },
  { code: 'G66', title: '今天销量突然下降，叫运营查原因', href: '/life/154?category=business' },
  { code: 'G67', title: '广告花很多钱，但订单很少', href: '/life/155?category=business' },
  { code: 'G68', title: '产品突然爆单，但库存快没了', href: '/life/156?category=business' },
  { code: 'G69', title: '直播间有人看，但是没人买', href: '/life/167?category=business' },
  { code: 'G70', title: '主播今天状态很差，我要跟她谈', href: '/life/168?category=business' },
  { code: 'G71', title: '客户给了一星差评', href: '/life/169?category=business' },
  { code: 'G72', title: '大量客户问同一个问题，客服回答不一致', href: '/life/170?category=business' },
  { code: 'G73', title: '订单很多，但仓库发货太慢', href: '/life/171?category=business' },
  { code: 'G74', title: '平台大促马上开始，团队还没准备好', href: '/life/172?category=business' },
  { code: 'G75', title: '晚上复盘整个电商业务', href: '/life/173?category=business' },
];

export default function GoldenBatch5ReviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Beranda（返回首页）
      </Link>
      <header className="mt-7 rounded-3xl border border-blue-100 bg-blue-50/80 px-5 py-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Human Review</p>
        <h1 className="mt-2 text-2xl font-semibold text-blue-950">黄金场景 G56–G75</h1>
        <p className="mt-3 text-sm leading-6 text-blue-900/75">
          从 G56 开始逐条打开，实际体验办公室管理、电商运营、播放、收藏、完成学习和上一条 / 下一条。
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
