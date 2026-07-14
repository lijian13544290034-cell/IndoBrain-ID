import Link from 'next/link';
import ExperienceCard from '@/components/ExperienceCard';
import { notFound } from 'next/navigation';
import { moduleExperiences, moduleMeta, type ModuleRole } from '@/lib/module-experiences';

export default async function ModulePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!(role in moduleMeta)) notFound();
  const key = role as ModuleRole;
  const meta = moduleMeta[key];
  const experiences = moduleExperiences[key];

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/factory" className="text-sm text-stone-500 hover:text-stone-900">← Pabrik（工厂）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Peran（角色）</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{meta.indonesian}</h1>
      <p className="mt-1 text-sm text-stone-500">（{meta.chinese}）</p>
      <p className="mt-4 text-sm text-stone-500">{experiences.length} situasi kerja tersedia<br />已完成 {experiences.length} 个工作场景</p>
    </header>
    <section className="mt-7">
      <h2 className="text-lg font-semibold">Situasi Kerja <span className="text-sm font-normal text-stone-500">（工作场景）</span></h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {experiences.map((item) => <ExperienceCard key={item.id} href={'/module/' + key + '/' + item.id.slice(-3)} experience={item} />)}
      </div>
    </section>
  </main>;
}
