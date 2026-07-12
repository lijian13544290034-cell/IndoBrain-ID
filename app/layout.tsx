import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IndoBrain',
  description: '解决问题，顺带学习语言。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
