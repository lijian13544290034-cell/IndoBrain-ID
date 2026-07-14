import ExperienceNavLink from '@/components/ExperienceNavLink';

type NavigationItem = { href: string; id: string } | undefined;

export default function NavigationButtons({ experienceId, previous, next }: { experienceId: string; previous: NavigationItem; next: NavigationItem }) {
  const className = 'cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm';
  return <nav className="mt-6 flex items-center justify-between gap-3">
    {previous ? <ExperienceNavLink href={previous.href} experienceId={experienceId} action="previous_clicked" className={className}>← Sebelumnya（上一条）</ExperienceNavLink> : <span />}
    {next ? <ExperienceNavLink href={next.href} experienceId={experienceId} action="next_clicked" className={className}>Berikutnya（下一条）→</ExperienceNavLink> : <span />}
  </nav>;
}
