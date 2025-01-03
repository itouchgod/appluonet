'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      // 注册成功后自动登录
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center p-4">
      <div className="apple-card w-full max-w-md">
        <h1 className="apple-title text-center">注册 LC App</h1>
        <p className="apple-subtitle text-center">创建您的账户以开始使用</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="apple-label">
              姓名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="apple-input"
              placeholder="请输入姓名"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="apple-label">
              邮箱地址
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="apple-input"
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="apple-label">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="apple-input"
              placeholder="请输入密码（至少6位）"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="apple-label">
              确认密码
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="apple-input"
              placeholder="请再次输入密码"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="apple-button w-full"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              已有账号？{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                立即登录
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 