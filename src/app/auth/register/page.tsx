'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/ui/auth/AuthCard';
import { AuthInput } from '@/components/ui/auth/AuthInput';
import { AuthButton } from '@/components/ui/auth/AuthButton';
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
    <AuthCard
      title="注册 LC App 账号"
      description="创建您的账号以使用所有功能"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <AuthInput
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            label="姓名"
            placeholder="请输入您的姓名"
          />

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
            autoComplete="new-password"
            required
            label="密码"
            placeholder="请输入密码（至少8位，包含数字和字母）"
          />

          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            label="确认密码"
            placeholder="请再次输入密码"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <AuthButton type="submit" isLoading={isLoading}>
          注册
        </AuthButton>

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
    </AuthCard>
  );
} 