import Link from 'next/link';
import { getIndonesiaLevel, getIndonesiaLevelDisplayId } from '@/lib/v2/indonesia-power';

type BadgeSize = 'compact' | 'inline' | 'detail';

export default function IndonesiaPowerBadge({ totalIndonesiaPower, size = 'inline', href }: { totalIndonesiaPower: number; size?: BadgeSize; href?: string }) {
  const level = getIndonesiaLevel(totalIndonesiaPower);
  const levelId = getIndonesiaLevelDisplayId(totalIndonesiaPower);
  const compact = size === 'compact';
  const detail = size === 'detail';
  const content = <>
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full border border-[var(--ib-primary)]/20 bg-[var(--ib-primary-soft)] text-[var(--ib-primary)] ${detail ? 'size-11' : compact ? 'size-6' : 'size-7'}`}>
      <svg width={detail ? 23 : compact ? 14 : 16} height={detail ? 23 : compact ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2 4.1 4.5.7-3.2 3.2.8 4.5L12 13.4l-4.1 2.1.8-4.5-3.2-3.2 4.5-.7Z" /><circle cx="12" cy="11.5" r="2.1" /></svg>
    </span>
    <span className="min-w-0 text-left">
      <span className={`block font-semibold leading-none text-[var(--ib-text-primary)] ${detail ? 'text-base' : 'text-xs'}`}>{levelId} <span className="font-medium text-[var(--ib-text-secondary)]">· {totalIndonesiaPower}</span></span>
      <span className={`block text-[var(--ib-text-secondary)] ${detail ? 'mt-1 text-sm' : 'mt-0.5 text-[10px]'}`}>{detail ? level.nameZh : '印尼力'}</span>
    </span>
  </>;
  const surfaceClass = `inline-flex items-center border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] text-[var(--ib-text-primary)] shadow-[var(--ib-shadow-card)] ${detail ? 'min-h-11 w-full justify-start gap-2 rounded-2xl p-4' : compact ? 'h-[30px] gap-1.5 rounded-[14px] px-2' : 'min-h-11 gap-2 rounded-2xl px-2.5'}`;
  const body = <span className={surfaceClass}>{content}</span>;
  const actionClass = `inline-flex min-h-11 items-center transition hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)] ${compact ? 'p-0' : ''}`;
  if (href) return <Link href={href} aria-label={`查看成长中心，${levelId}，印尼力 ${totalIndonesiaPower}`} className={actionClass}>{body}</Link>;
  return body;
}
