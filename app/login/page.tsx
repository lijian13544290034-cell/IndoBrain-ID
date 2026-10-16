import Link from 'next/link';
import PhoneLoginForm from '@/components/PhoneLoginForm';
import PreviewQaModeButton from '@/components/PreviewQaModeButton';
import { isPreviewQaEnabled } from '@/lib/account/preview-qa';

export const metadata = { title: 'Masuk | IndoBrain' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const previewQaEnabled = isPreviewQaEnabled();
  const nextValue = (await searchParams).next;
  const nextPath = Array.isArray(nextValue) ? nextValue[0] : nextValue;
  return <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-12">
    <section className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← IndoBrain</Link>
      <h1 className="mt-7 text-3xl font-semibold tracking-tight">Masuk</h1>
      <p className="mt-2 text-sm text-gray-500">登录你的 IndoBrain 账户</p>
      <PhoneLoginForm nextPath={nextPath} />
      {previewQaEnabled ? <PreviewQaModeButton /> : null}
    </section>
  </main>;
}
