'use client';

import Link from 'next/link';
import { getSessionId } from '@/lib/session';

export default function ExperienceNavLink({ href, experienceId, action, children, className }: { href: string; experienceId: string; action: 'next_clicked' | 'previous_clicked'; children: React.ReactNode; className: string }) {
  return <Link href={href} onClick={() => { fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, action }) }); }} className={className}>{children}</Link>;
}
