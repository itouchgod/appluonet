'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Permission {
  id: string;
  moduleId: string;
  canAccess: boolean;
}

interface User {
  id: string;
  username: string;
  email: string | null;
  status: boolean;
  isAdmin: boolean;
  permissions: Permission[];
}

// 定义所有可用的模块
const MODULES = [
  { id: 'ai-email', name: 'AI邮件助手', description: '智能生成商务邮件', path: '/mail' },
  { id: 'quotation', name: '报价及确认', description: '生成报价单和销售确认单', path: '/quotation' },
  { id: 'invoice', name: '发票助手', description: '生成和管理发票', path: '/invoice' },
  { id: 'feature1', name: '功能1', description: '待开发功能', path: '/tools/feature1' },
  { id: 'feature2', name: '功能2', description: '待开发功能', path: '/tools/feature2' },
  { id: 'feature3', name: '功能3', description: '待开发功能', path: '/tools/feature3' },
  { id: 'feature4', name: '功能4', description: '待开发功能', path: '/tools/feature4' },
  { id: 'feature5', name: '功能5', description: '待开发功能', path: '/tools/feature5' },
  { id: 'feature6', name: '功能6', description: '待开发功能', path: '/tools/feature6' },
  { id: 'feature7', name: '功能7', description: '待开发功能', path: '/tools/feature7' },
  { id: 'feature8', name: '功能8', description: '待开发功能', path: '/tools/feature8' },
  { id: 'feature9', name: '功能9', description: '待开发功能', path: '/tools/feature9' },
];

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          throw new Error('获取用户信息失败');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // 根据用户权限过滤可用模块
  const availableModules = MODULES.filter(module => {
    const permission = user?.permissions?.find(p => p.moduleId === module.id);
    return permission?.canAccess;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <h1 className="text-2xl font-bold">工具箱</h1>
          </div>
          {user?.isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              系统管理
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map((module) => (
            <div
              key={module.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(module.path)}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-500">{module.description}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                    开始使用
                    <svg className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 