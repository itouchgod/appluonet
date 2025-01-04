'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const modules = [
    {
      id: 'mail',
      name: 'AI邮件助手',
      description: '智能生成商务邮件，提高沟通效率',
      icon: '✉️',
      href: '/mail',
    },
    {
      id: 'order',
      name: '报价及确认',
      description: '生成和管理报价单及销售确认单',
      icon: '📋',
      href: '/order',
    },
    {
      id: 'invoice',
      name: '发票管理',
      description: '创建和管理商业发票、形式发票',
      icon: '🧾',
      href: '/invoice',
    },
    {
      id: 'admin',
      name: '系统管理',
      description: '用户权限和系统设置管理',
      icon: '⚙️',
      href: '/admin',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="LC APP Logo"
                  width={40}
                  height={40}
                  priority
                />
                <span className="ml-2 text-xl font-bold text-gray-900">LC APP</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">
                欢迎, {session?.user?.username || '用户'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{module.icon}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 