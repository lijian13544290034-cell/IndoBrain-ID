import { redirect } from 'next/navigation';

export default async function SocialDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string }> }) {
  const { id } = await params;
  const { category } = await searchParams;
  redirect(`/life/${id}${category ? '?category=friends' : ''}`);
}
