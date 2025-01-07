'use client';

import { SessionProvider } from 'next-auth/react';

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // 每5分钟刷新一次
      refetchOnWindowFocus={false} // 窗口获得焦点时不刷新
    >
      {children}
    </SessionProvider>
  );
} 