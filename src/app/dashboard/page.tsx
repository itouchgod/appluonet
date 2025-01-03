'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        欢迎回来, {user?.name || '用户'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/email"
          className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">邮件助手</h2>
          <p className="text-gray-600">
            智能生成中英文邮件，提高邮件写作效率
          </p>
        </Link>

        <Link
          href="/dashboard/quote"
          className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">报价订单</h2>
          <p className="text-gray-600">
            快速生成专业的报价单和销售确认单
          </p>
        </Link>

        <Link
          href="/dashboard/invoice"
          className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">发票助手</h2>
          <p className="text-gray-600">
            轻松生成形式发票和商业发票
          </p>
        </Link>
      </div>
    </div>
  );
} 