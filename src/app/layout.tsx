import './globals.css'
import { Providers } from './providers'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'LC APP',
  description: '一个用于处理报价单、销售确认单和发票等商业文档的生成和管理系统',
  icons: {
    icon: [
      { url: '/logo/logo.png', type: 'image/png' },
    ],
    apple: '/logo/apple-touch-icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
