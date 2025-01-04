'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Permission {
  moduleId: string;
  canAccess: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

const TOOLS: Tool[] = [
  {
    id: 'mail',
    name: 'AI邮件助手',
    description: '智能生成商务邮件',
    icon: '/icons/mail.svg',
    path: '/tools/mail',
  },
  {
    id: 'order',
    name: '报价及确认',
    description: '生成报价单和销售确认单',
    icon: '/icons/order.svg',
    path: '/tools/order',
  },
  {
    id: 'invoice',
    name: '发票管理',
    description: '生成和管理发票',
    icon: '/icons/invoice.svg',
    path: '/tools/invoice',
  },
];

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    fetchPermissions();
  }, [session, status, router]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/users/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      const data = await response.json();
      const permMap: { [key: string]: boolean } = {};
      data.forEach((perm: Permission) => {
        permMap[perm.moduleId] = perm.canAccess;
      });
      setPermissions(permMap);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="mr-4" />
          <h1 className="text-2xl font-bold">工具箱</h1>
        </div>
        {session?.user?.username === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            系统管理
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => {
          // 如果用户没有该工具的权限，则不显示
          if (!permissions[tool.id]) {
            return null;
          }

          return (
            <div
              key={tool.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(tool.path)}
            >
              <div className="flex items-center mb-4">
                <Image src={tool.icon} alt={tool.name} width={32} height={32} className="mr-3" />
                <h2 className="text-xl font-semibold">{tool.name}</h2>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 