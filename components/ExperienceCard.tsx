import Link from 'next/link';

export type ExperienceCardItem = {
  id: string;
  task: string;
  indonesian?: string;
  explanation?: string;
};

export default function ExperienceCard({ href, experience }: { href: string; experience: ExperienceCardItem }) {
  return <Link href={href} className="flex min-h-40 cursor-pointer flex-col rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50 hover:shadow-md">
    <p className="text-[11px] font-medium text-stone-400">{experience.id}</p>
    <p className="mt-2 font-semibold text-stone-900">{experience.task}</p>
    <p className="mt-2 text-sm leading-6 text-stone-700">{experience.indonesian || 'Belum tersedia.'}</p>
    {experience.explanation ? <p className="mt-auto line-clamp-2 pt-2 text-xs leading-5 text-stone-500">{experience.explanation}</p> : <p className="mt-auto pt-2 text-xs leading-5 text-stone-500">该内容将在后续版本补充。</p>}
  </Link>;
}
