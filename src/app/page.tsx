'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center p-4">
      <div className="apple-card w-full max-w-md">
        <h1 className="apple-title text-center">登录到 LC App</h1>
        <p className="apple-subtitle text-center">输入您的邮箱和密码登录系统</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="apple-label">
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="apple-input"
              placeholder="请输入密码"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="apple-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                记住我
              </label>
            </div>
            <Link href="/forgot-password" className="apple-link text-sm">
              忘记密码？
            </Link>
          </div>

          <button type="submit" className="apple-button w-full">
            登录
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">还没有账号？</span>{' '}
          <Link href="/register" className="apple-link">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}
