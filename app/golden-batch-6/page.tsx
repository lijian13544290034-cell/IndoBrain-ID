import Link from 'next/link';

const reviewScenes = [
  { code: 'G76', title: '第一次认识印尼朋友，怎么把聊天聊起来', href: '/life/174?category=friends' },
  { code: 'G77', title: '找到共同话题，让关系继续', href: '/life/175?category=friends' },
  { code: 'G78', title: '从 Pak/Bu 慢慢聊到 Kak/Bro', href: '/life/176?category=friends' },
  { code: 'G79', title: '朋友说俚语/开玩笑，我没听懂', href: '/life/177?category=friends' },
  { code: 'G80', title: '交换 WhatsApp，第一次主动联系', href: '/life/178?category=friends' },
  { code: 'G81', title: '约朋友喝咖啡 / 吃饭', href: '/life/179?category=friends' },
  { code: 'G82', title: '第一次参加一群印尼朋友的聚会', href: '/life/180?category=friends' },
  { code: 'G83', title: '朋友开始聊家庭和私人生活', href: '/life/181?category=friends' },
  { code: 'G84', title: '朋友请我帮忙，但我不方便', href: '/life/182?category=friends' },
  { code: 'G85', title: '我需要朋友帮忙，怎么自然开口', href: '/life/183?category=friends' },
  { code: 'G86', title: '第一次见潜在客户，不要一上来就卖东西', href: '/life/184?category=business' },
  { code: 'G87', title: '和客户吃饭，什么时候开始聊生意', href: '/life/185?category=business' },
  { code: 'G88', title: '客户说“我考虑一下”，到底是什么意思', href: '/life/186?category=business' },
  { code: 'G89', title: '客户很久没回复，怎么跟进又不让人烦', href: '/life/187?category=business' },
  { code: 'G90', title: '客户对我们不满意，先把关系稳住', href: '/life/188?category=business' },
  { code: 'G91', title: '合作成功以后，怎么继续维护关系', href: '/life/189?category=business' },
  { code: 'G92', title: '去银行办事，结果资料不齐', href: '/life/190?category=basics' },
  { code: 'G93', title: '找物业/管理处解决问题', href: '/life/191?category=basics' },
  { code: 'G94', title: '快递显示已送达，但我根本没收到', href: '/life/192?category=basics' },
  { code: 'G95', title: '手机卡 / 网络突然不能用了', href: '/life/193?category=basics' },
  { code: 'G96', title: '酒店入住以后发现房间有问题', href: '/life/194?category=basics' },
  { code: 'G97', title: '到了陌生地方，问路并确认没走错', href: '/life/195?category=basics' },
  { code: 'G98', title: '航班延误，整个行程要重新安排', href: '/life/196?category=basics' },
  { code: 'G99', title: '发生交通事故，我要冷静处理', href: '/life/197?category=basics' },
  { code: 'G100', title: '手机 / 钱包 / 重要东西突然丢了', href: '/life/198?category=basics' },
];

export default function GoldenBatch6ReviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Beranda（返回首页）
      </Link>
      <header className="mt-7 rounded-3xl border border-blue-100 bg-blue-50/80 px-5 py-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Human Review</p>
        <h1 className="mt-2 text-2xl font-semibold text-blue-950">黄金场景 G76–G100</h1>
        <p className="mt-3 text-sm leading-6 text-blue-900/75">
          从 G76 开始逐条打开，实际体验交友、商务社交、现实办事、旅行和突发情况。完成 G100 后，基础黄金场景库 V1 达到 100 个真实印尼场景。
        </p>
      </header>
      <section className="mt-6 grid gap-3">
        {reviewScenes.map((scene) => (
          <Link
            key={scene.code}
            href={`${scene.href}&flow=golden-batch-6`}
            className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <p className="text-xs font-medium text-blue-600">{scene.code}</p>
            <p className="mt-1 text-base font-semibold text-stone-900">{scene.title}</p>
            <p className="mt-2 text-xs text-stone-400">{scene.href}&flow=golden-batch-6</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
