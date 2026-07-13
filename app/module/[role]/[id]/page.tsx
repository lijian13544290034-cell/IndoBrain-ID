import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceActions from '@/components/ExperienceActions';
import { moduleExperiences, moduleMeta, type ModuleRole } from '@/lib/module-experiences';

export default async function ModuleExperiencePage({ params }: { params: Promise<{ role: string; id: string }> }) {
  const { role, id } = await params;
  if (!(role in moduleMeta)) notFound();
  const key = role as ModuleRole;
  const entries = moduleExperiences[key];
  const expectedId = `EXP-${key === 'driver' ? 'DRV' : 'NAN'}-${id}`;
  const item = entries.find((entry) => entry.id === expectedId);
  if (!item) notFound();
  const index = entries.indexOf(item); const previous = entries[index - 1]; const next = entries[index + 1];
  return <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-10 sm:px-8">
    <Link href={`/module/${key}`} className="text-sm text-stone-500">← {moduleMeta[key].indonesian}</Link>
    <article className="mt-7 rounded-2xl border border-stone-200 px-6 py-8 shadow-sm"><p className="text-sm text-stone-400">{item.id}</p><h1 className="mt-3 text-2xl font-semibold">{item.task}</h1>{item.missing ? <p className="mt-7 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">正式内容尚未导入。此编号不会使用其它 Experience 的印尼语或词汇作为替代。</p> : <><p className="mt-7 text-xs text-stone-400">印尼语</p><p className="mt-2 rounded-xl bg-stone-50 p-4 text-lg leading-8">{item.indonesian}</p><p className="mt-5 text-xs text-stone-400">中文说明</p><p className="mt-2 text-stone-700">{item.chinese}</p><h2 className="mt-8 font-semibold">Today's Harvest</h2><ul className="mt-3 space-y-1 text-sm text-stone-600">{item.harvest.map((word) => <li key={word}>• {word}</li>)}</ul><ExperienceActions experienceId={item.id} indonesian={item.indonesian} /></>}</article>
    <nav className="mt-6 flex justify-between">{previous ? <Link href={`/module/${key}/${previous.id.slice(-3)}`} className="rounded-xl border px-4 py-2 text-sm">← Previous</Link> : <span />}{next ? <Link href={`/module/${key}/${next.id.slice(-3)}`} className="rounded-xl border px-4 py-2 text-sm">Next →</Link> : <span />}</nav>
  </main>;
}
