import { redirect } from 'next/navigation';
import InitialPasswordChangeForm from '@/components/InitialPasswordChangeForm';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { getUserRoles } from '@/lib/account/repository';
export const dynamic = 'force-dynamic';
export default async function ChangeInitialPasswordPage() { const user = await getCurrentAccountUser(); if (!user) redirect('/login'); const isSuperAdmin = (await getUserRoles(user.id)).includes('SUPER_ADMIN'); const destination = isSuperAdmin ? '/admin/workbench' : user.learning_direction === 'ID_TO_ZH' ? '/learn-chinese' : '/'; if (!user.must_change_password) redirect(destination); return <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-12"><section className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm text-gray-400">IndoBrain</p><h1 className="mt-4 text-3xl font-semibold">修改初始密码</h1><p className="mt-2 text-sm text-gray-500">Ganti kata sandi awal</p><InitialPasswordChangeForm destination={destination} /></section></main>; }
