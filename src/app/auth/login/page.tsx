'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/ui/auth/AuthCard';
import { AuthInput } from '@/components/ui/auth/AuthInput';
import { AuthButton } from '@/components/ui/auth/AuthButton';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('remember-me') === 'on';

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('登录失败，请检查邮箱和密码是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="登录到 LC App"
      description="输入您的邮箱和密码登录系统"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <AuthInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="邮箱地址"
            placeholder="请输入邮箱地址"
          />

          <AuthInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            label="密码"
            placeholder="请输入密码"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              记住我
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              忘记密码？
            </Link>
          </div>
        </div>

        <AuthButton type="submit" isLoading={isLoading}>
          登录
        </AuthButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            还没有账号？{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              立即注册
            </Link>
          </span>
        </div>
      </form>
    </AuthCard>
  );
} 