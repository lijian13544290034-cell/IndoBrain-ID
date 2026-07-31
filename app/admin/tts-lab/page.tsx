import { notFound } from 'next/navigation';
import TtsLabContent from '@/components/TtsLabContent';

export const dynamic = 'force-dynamic';

export default function TtsLabPage() {
  if (process.env.NODE_ENV !== 'development' && process.env.VERCEL_ENV !== 'preview') notFound();
  return <TtsLabContent />;
}
