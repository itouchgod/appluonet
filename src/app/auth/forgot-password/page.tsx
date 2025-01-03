'use client';

import { useState } from 'react';
import { AuthCard } from '@/components/ui/auth/AuthCard';
import { AuthInput } from '@/components/ui/auth/AuthInput';
import { AuthButton } from '@/components/ui/auth/AuthButton';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      // TODO: 实现发送重置密码邮件的逻辑
      console.log('Password reset request for:', email);
      setSuccess(true);
    } catch {
      setError('发送重置密码邮件失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="重置密码"
      description="输入您的邮箱地址，我们将发送重置密码链接"
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
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        {success && (
          <div className="text-green-600 text-sm text-center">
            重置密码链接已发送到您的邮箱，请查收
          </div>
        )}

        <AuthButton type="submit" isLoading={isLoading}>
          发送重置链接
        </AuthButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            记起密码了？{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              返回登录
            </Link>
          </span>
        </div>
      </form>
    </AuthCard>
  );
} 