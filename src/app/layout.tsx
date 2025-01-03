import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LC App - 公司内部协同办公系统",
  description: "智能邮件助手、报价订单生成、发票制作等功能的一站式办公解决方案",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
