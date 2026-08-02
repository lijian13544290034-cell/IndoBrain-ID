import type { Metadata } from 'next';
import ApplicationFrame from '@/components/ApplicationFrame';
import './globals.css';

export const metadata: Metadata = {
  title: 'IndoBrain',
  description: '解决问题，顺带学习语言。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><ApplicationFrame>{children}</ApplicationFrame></body>
    </html>
  );
}
