import { redirect } from 'next/navigation';

export default async function SocialDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string; search?: string }> }) {
  const { id } = await params;
  const { category, search } = await searchParams;
  const query = search ? `?search=${encodeURIComponent(search)}` : category ? '?category=friends' : '';
  redirect(`/life/${id}${query}`);
}
