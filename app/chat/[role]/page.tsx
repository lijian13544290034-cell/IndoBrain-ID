import { notFound } from 'next/navigation';
import ChatWorkspace from '@/components/ChatWorkspace';
import { chatProfiles } from '@/lib/mock-data';

export default async function ChatPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const profile = chatProfiles[role];

  if (!profile) notFound();

  return <ChatWorkspace profile={profile} />;
}
