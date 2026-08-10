import type { Metadata, Viewport } from 'next';
import './globals.css';
import WeChatBrowserNotice from '@/components/WeChatBrowserNotice';

export const metadata: Metadata = {
  title: 'IndoBrain',
  description: 'IndoBrain helps Chinese learners speak practical Indonesian in real life.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'IndoBrain',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#17366F',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <WeChatBrowserNotice />
        {children}
      </body>
    </html>
  );
}
