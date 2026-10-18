'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuperAdminWorkbenchReturnLink() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const shouldCheck = pathname === '/' || pathname?.startsWith('/learn-chinese') === true;

  useEffect(() => {
    if (!shouldCheck) return;
    const controller = new AbortController();
    void fetch('/api/auth/super-admin-status', { cache: 'no-store', signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ isSuperAdmin?: boolean }> : null)
      .then((result) => setIsSuperAdmin(result?.isSuperAdmin === true))
      .catch(() => setIsSuperAdmin(false));
    return () => controller.abort();
  }, [shouldCheck]);

  if (!shouldCheck || !isSuperAdmin) return null;
  return <Link href="/admin/workbench" className="fixed left-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[70] rounded-full border border-blue-200 bg-white/95 px-3 py-2 text-xs font-semibold text-blue-800 shadow-md backdrop-blur transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:left-5 sm:text-sm">← Super Admin 工作台</Link>;
}

