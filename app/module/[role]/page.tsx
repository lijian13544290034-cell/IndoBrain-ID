import Link from 'next/link';
import { notFound } from 'next/navigation';
import { moduleExperiences, moduleMeta, type ModuleRole } from '@/lib/module-experiences';

export default async function ModulePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!(role in moduleMeta)) notFound();
  const key = role as ModuleRole;
  const meta = moduleMeta[key];
  return <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-10 sm:px-8">
    <Link href="/" className="text-sm text-stone-500">← 返回首页</Link>
    <header className="mt-8"><h1 className="text-3xl font-semibold">{meta.indonesian}</h1><p className="mt-1 text-stone-500">（{meta.chinese}）</p><p className="mt-4 text-sm text-stone-500">{moduleExperiences[key].length} Experiences</p></header>
    <div className="mt-8 grid gap-3 sm:grid-cols-2">{moduleExperiences[key].map((item) => <Link key={item.id} href={`/module/${key}/${item.id.slice(-3)}`} className="rounded-2xl border border-stone-200 px-4 py-4 hover:bg-stone-50"><p className="text-xs text-stone-400">{item.id}</p><p className="mt-2 font-medium">{item.task}</p></Link>)}</div>
    <Link href="/patterns" className="mt-8 inline-block text-sm text-stone-500 underline">Pattern 练习</Link>
  </main>;
}
