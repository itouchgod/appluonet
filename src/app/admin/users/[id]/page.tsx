'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { use } from 'react';

interface Permission {
  id: string;
  moduleId: string;
  canAccess: boolean;
}

const modules = [
  { id: 'mail', name: 'AI邮件助手' },
  { id: 'quotation', name: '报价销售确认' },
  { id: 'invoice', name: '发票管理' },
];

export default function UserPermissions({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

  const fetchPermissions = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${id}/permissions`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '获取权限失败');
      }
    } catch (error) {
      console.error('获取权限出错:', error);
      setError('获取权限时发生错误');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!session?.user || session.user.username !== 'admin') {
      router.push('/tools');
      return;
    }

    fetchPermissions();
  }, [session, router, fetchPermissions]);

  const handlePermissionChange = async (moduleId: string, canAccess: boolean) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, canAccess }),
      });

      if (response.ok) {
        await fetchPermissions();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '更新权限失败');
      }
    } catch (error) {
      console.error('更新权限出错:', error);
      setError('更新权限时发生错误');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户权限设置</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
        >
          返回
        </button>
      </div>
      <div className="space-y-4">
        {modules.map((module) => {
          const permission = permissions.find(p => p.moduleId === module.id);
          return (
            <div key={module.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <span className="text-lg">{module.name}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={permission?.canAccess ?? false}
                  onChange={(e) => handlePermissionChange(module.id, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
} 