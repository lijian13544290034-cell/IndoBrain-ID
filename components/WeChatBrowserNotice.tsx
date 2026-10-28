'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const DISMISS_KEY = 'indobrain-wechat-browser-notice-dismissed';

export function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

export function isWeChatBrowser(userAgent: string) {
  return /MicroMessenger/i.test(userAgent);
}

export default function WeChatBrowserNotice() {
  const pathname = usePathname();
  const isNativeMandarinPreview = pathname === '/coba-gratis/native-coach-v1';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const ua = navigator.userAgent || '';
      const dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
      setVisible(isWeChatBrowser(ua) && !dismissed && !isStandaloneMode());
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore storage failures; the notice can still be dismissed for this session.
    }
    setVisible(false);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-3 sm:px-4">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-2xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-lg backdrop-blur"
      >
        <div className="mt-0.5 text-lg" aria-hidden>
          ⚠️
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{isNativeMandarinPreview
            ? 'Browser WeChat mungkin tidak dapat memuat halaman atau memutar suara dengan baik.'
            : '当前微信内置浏览器可能无法正常加载或播放语音。'}</p>
          <p className="mt-1 leading-6 text-amber-900/90">
            {isNativeMandarinPreview
              ? 'Ketuk menu “…” di kanan atas, lalu pilih buka di browser.'
              : '请点击右上角「…」，选择「在浏览器打开」后继续使用 IndoBrain。'}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full px-3 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
          aria-label={isNativeMandarinPreview ? 'Tutup pemberitahuan browser' : '关闭微信浏览器提示'}
        >
          {isNativeMandarinPreview ? 'Tutup' : '关闭'}
        </button>
      </div>
    </div>
  );
}
