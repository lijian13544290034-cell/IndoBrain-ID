'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isStandaloneMode, isWeChatBrowser } from '@/components/WeChatBrowserNotice';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type InstallState = 'checking' | 'native' | 'wechat' | 'ios' | 'fallback' | 'hidden';

function isIOS(userAgent: string) {
  return /iPad|iPhone|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1);
}

function isSafari(userAgent: string) {
  return /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|Chrome|Android/i.test(userAgent);
}

function isMobileLike() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 820;
}

function shouldShowInstallEntry(pathname: string | null) {
  return pathname === '/' || pathname === '/basic-essentials' || pathname === '/life' || pathname === '/about';
}

export default function PwaInstallButton() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<InstallState>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const updateFallbackState = () => {
      try {
        if (!shouldShowInstallEntry(pathname)) {
          setState('hidden');
          return;
        }

        if (isStandaloneMode()) {
          setState('hidden');
          return;
        }

        const ua = navigator.userAgent || '';
        if (isWeChatBrowser(ua)) {
          setState('wechat');
          return;
        }

        if (isIOS(ua) && isSafari(ua)) {
          setState('ios');
          return;
        }

        setState(isMobileLike() ? 'fallback' : 'hidden');
      } catch {
        setState('hidden');
      }
    };

    updateFallbackState();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setState(shouldShowInstallEntry(pathname) ? 'native' : 'hidden');
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setState('hidden');
      setMessage('');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', updateFallbackState);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', updateFallbackState);
    };
  }, [pathname]);

  const bottomClass = useMemo(() => (pathname === '/' ? 'bottom-4' : 'bottom-24'), [pathname]);

  if (state === 'checking' || state === 'hidden') return null;

  const handleInstall = async () => {
    if (state === 'native' && installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
        setState('hidden');
      }
      return;
    }

    if (state === 'wechat') {
      setMessage('请点击右上角「…」，选择「在浏览器打开」，然后返回 IndoBrain 点击安装。');
      return;
    }

    if (state === 'ios') {
      setMessage('点击 Safari 底部分享按钮 → 添加到主屏幕。');
      return;
    }

    setMessage('当前浏览器暂不支持一键安装。请打开浏览器菜单，选择「添加到桌面 / 添加快捷方式」。');
  };

  return (
    <div className={`fixed right-4 z-[55] w-[min(21rem,calc(100vw-2rem))] ${bottomClass}`}>
      {message && (
        <div
          role="status"
          className="mb-2 rounded-2xl border border-[var(--ib-border-soft)] bg-white/95 px-4 py-3 text-sm leading-6 text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)] backdrop-blur"
        >
          {message}
        </div>
      )}
      <button
        type="button"
        onClick={handleInstall}
        className="flex w-full items-center justify-between rounded-2xl border border-[var(--ib-border-soft)] bg-white/95 px-4 py-3 text-sm font-semibold text-[var(--ib-primary-strong)] shadow-[var(--ib-shadow-card)] backdrop-blur transition hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)]"
        aria-label="安装 IndoBrain 到手机"
      >
        <span>安装 IndoBrain 到手机</span>
        <span aria-hidden="true" className="text-base">
          +
        </span>
      </button>
    </div>
  );
}
