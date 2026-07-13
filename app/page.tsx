import Link from 'next/link';

const entries = [
  { href: '/driver', icon: '🚗', title: '司机', subtitle: 'Sopir', priority: true },
  { href: '/module/nanny', icon: '👩', title: '保姆', subtitle: 'ART', priority: true },
  { href: '/factory', icon: '🏭', title: '工厂', subtitle: 'Pabrik', priority: false },
  { href: '/chat/ai-chat', icon: '💬', title: '自由聊天', subtitle: 'Chat Bebas', priority: false },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-8 pt-20 sm:px-8 sm:pb-12 sm:pt-24">
      <header>
        <div className="text-3xl font-semibold tracking-tight text-gray-950">IndoBrain</div>
        <p className="mt-3 text-sm font-medium text-gray-600">印尼生活助手</p>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          解决问题。<br />
          顺带学习语言。
        </p>
      </header>

      <section className="pt-16 sm:pt-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">今天想解决什么问题？</h1>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className={`flex min-h-40 flex-col items-start justify-between rounded-2xl border px-5 py-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                entry.priority
                  ? 'border-stone-300 bg-white text-gray-950 hover:border-stone-400'
                  : 'border-stone-200 bg-stone-50 text-gray-500 hover:bg-white hover:text-gray-800'
              }`}
            >
              <span className="text-4xl" aria-hidden>{entry.icon}</span>
              <span>
                <span className={`block text-lg ${entry.priority ? 'font-semibold' : 'font-medium'}`}>{entry.title}</span>
                <span className="mt-1 block text-sm text-gray-400">{entry.subtitle}</span>
              </span>
            </Link>
          ))}
        </div>

        <article className="mt-5 rounded-2xl border border-stone-200 bg-stone-50/80 p-5 shadow-sm transition duration-200 hover:bg-white hover:shadow-md">
          <h2 className="text-base font-semibold">🌱 今天成长</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">成长</p>
              <p className="mt-1 font-medium">成长 Day 1</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">昨天完成</p>
              <p className="mt-1 font-medium">✔ 司机沟通</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">今天推荐</p>
              <p className="mt-1 font-medium">🚗 通知司机来接我</p>
            </div>
          </div>
        </article>
      </section>

      <footer className="mt-8 flex justify-between text-xs text-gray-400"><span>MVP V0.1</span><Link href="/patterns" className="underline">Pattern 练习</Link></footer>
    </main>
  );
}
