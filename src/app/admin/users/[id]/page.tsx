'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  lastLoginAt: string | null;
  createdAt: string;
  permissions: Permission[];
}

// 定义所有可用的模块
const MODULES = [
  { id: 'ai-email', name: 'AI邮件助手', description: '智能生成商务邮件' },
  { id: 'quotation', name: '报价及确认', description: '生成报价单和销售确认单' },
  { id: 'invoice', name: '发票管理', description: '生成和管理发票' },
  { id: 'feature1', name: '功能1', description: '待开发功能' },
  { id: 'feature2', name: '功能2', description: '待开发功能' },
  { id: 'feature3', name: '功能3', description: '待开发功能' },
  { id: 'feature4', name: '功能4', description: '待开发功能' },
  { id: 'feature5', name: '功能5', description: '待开发功能' },
  { id: 'feature6', name: '功能6', description: '待开发功能' },
  { id: 'feature7', name: '功能7', description: '待开发功能' },
  { id: 'feature8', name: '功能8', description: '待开发功能' },
  { id: 'feature9', name: '功能9', description: '待开发功能' },
];

export default function UserDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.isAdmin) {
      router.push('/tools');
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/users/${params.id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '获取用户信息失败');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : '获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [session, status, router, params.id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !user.status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新用户状态失败');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(error instanceof Error ? error.message : '更新用户状态失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新管理员权限失败');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert(error instanceof Error ? error.message : '更新管理员权限失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePermission = async (moduleId: string, currentAccess: boolean) => {
    if (!user) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${user.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, canAccess: !currentAccess }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新模块权限失败');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error updating permission:', error);
      alert(error instanceof Error ? error.message : '更新模块权限失败');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

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
            <h1 className="text-2xl font-bold">编辑用户</h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            返回
          </button>
        </div>

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium mb-4">基本信息</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">用户名</label>
                    <div className="mt-1 text-sm text-gray-900">{user.username}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">邮箱</label>
                    <div className="mt-1 text-sm text-gray-900">{user.email || '-'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">状态</label>
                    <div className="mt-1">
                      <button
                        onClick={handleToggleStatus}
                        disabled={saving}
                        className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full transition-colors ${
                          user.status
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.status ? '启用' : '禁用'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">管理员权限</label>
                    <div className="mt-1">
                      <button
                        onClick={handleToggleAdmin}
                        disabled={saving}
                        className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full transition-colors ${
                          user.isAdmin
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {user.isAdmin ? '是' : '否'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">最后登录时间</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">创建时间</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium mb-4">模块权限</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MODULES.map((module) => {
                    const permission = user.permissions?.find(p => p.moduleId === module.id);
                    const hasAccess = permission?.canAccess ?? false;
                    return (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{module.name}</span>
                          <span className="text-xs text-gray-500">{module.description}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            onChange={() => handleTogglePermission(module.id, hasAccess)}
                            disabled={saving}
                            className="sr-only peer"
                          />
                          <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer ${
                            hasAccess ? 'peer-checked:bg-blue-600' : ''
                          } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 