import { redirect } from 'next/navigation';

export default async function SocialPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  redirect(category ? `/life?category=friends` : '/life');
}
