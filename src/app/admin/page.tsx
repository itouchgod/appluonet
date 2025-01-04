'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  email: string | null;
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false,
  });
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || session.user.username !== 'admin') {
      router.push('/tools');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          role: 'USER',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      setIsAddingUser(false);
      setNewUser({ username: '', email: '', password: '', isAdmin: false });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setIsEditingUser(null);
      setEditUser({ username: '', email: '' });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="mr-4" />
          <h1 className="text-2xl font-bold">系统管理</h1>
        </div>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          添加用户
        </button>
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">添加新用户</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">用户名</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">密码</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">设为管理员</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingUser(false);
                    setNewUser({ username: '', email: '', password: '', isAdmin: false });
                  }}
                  className="px-4 py-2 border rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">用户管理</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后登录</th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditingUser === user.id ? (
                      <input
                        type="text"
                        value={editUser.username}
                        onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'ACTIVE' ? '活跃' : '禁用'}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    {isEditingUser === user.id ? (
                      <input
                        type="email"
                        value={editUser.email || ''}
                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      user.email || '-'
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditingUser === user.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateUser(user.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingUser(null);
                            setEditUser({ username: '', email: '' });
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setIsEditingUser(user.id);
                            setEditUser({
                              username: user.username,
                              email: user.email || '',
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {user.status === 'ACTIVE' ? '禁用' : '启用'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
