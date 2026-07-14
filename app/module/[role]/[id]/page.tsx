import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceActions from '@/components/ExperienceActions';
import ExperienceNavLink from '@/components/ExperienceNavLink';
import { moduleExperiences, moduleMeta, type ModuleRole } from '@/lib/module-experiences';

export default async function ModuleExperiencePage({ params }: { params: Promise<{ role: string; id: string }> }) {
  const { role, id } = await params;
  if (!(role in moduleMeta)) notFound();
  const key = role as ModuleRole;
  const entries = moduleExperiences[key];
  const item = entries.find((entry) => entry.id.endsWith('-' + id));
  if (!item) notFound();
  const index = entries.indexOf(item);
  const previous = entries[index - 1];
  const next = entries[index + 1];

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={'/module/' + key} className="text-sm text-stone-500 hover:text-stone-900">← {moduleMeta[key].indonesian}（{moduleMeta[key].chinese}）</Link>
    <section className="mt-7 rounded-2xl border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-8">
      <p className="text-sm text-stone-400">{item.id}</p>
      {item.missing ? <><h1 className="mt-2 text-2xl font-semibold">Belum tersedia</h1><p className="mt-5 text-sm leading-6 text-stone-500">该内容将在后续版本补充。</p></> : <>
        <h1 className="mt-2 text-2xl font-semibold">{item.task}</h1>
        <p className="mt-5 text-xs text-stone-400">Bahasa Indonesia（印尼语）</p>
        <p className="mt-2 rounded-xl bg-stone-50 p-4 text-lg leading-8">{item.indonesian}</p>
        <p className="mt-5 text-xs text-stone-400">Penjelasan（中文说明）</p>
        <p className="mt-2 text-sm leading-6 text-stone-700">{item.explanation}</p>
        <p className="mt-6 text-xs text-stone-400">Kata Penting Hari Ini（今日重点词汇）</p>
        <ul className="mt-2 space-y-1 text-sm text-stone-700">{item.harvest.map((word) => <li key={word}>• {word}</li>)}</ul>
        <ExperienceActions experienceId={item.id} indonesian={item.indonesian} />
      </>}
    </section>
    <nav className="mt-6 flex items-center justify-between gap-3">
      {previous ? <ExperienceNavLink href={'/module/' + key + '/' + previous.id.slice(-3)} experienceId={item.id} action="previous_clicked" className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">← Sebelumnya（上一条）</ExperienceNavLink> : <span />}
      {next ? <ExperienceNavLink href={'/module/' + key + '/' + next.id.slice(-3)} experienceId={item.id} action="next_clicked" className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">Berikutnya（下一条） →</ExperienceNavLink> : <span />}
    </nav>
  </main>;
}
