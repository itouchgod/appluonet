'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  EnvelopeIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  Cog8ToothIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: '邮件助手',
    description: '智能生成中英文邮件，提高邮件撰写效率',
    href: '/dashboard/email',
    icon: EnvelopeIcon,
  },
  {
    name: '报价订单',
    description: '快速生成报价单和销售确认单',
    href: '/dashboard/quote',
    icon: DocumentTextIcon,
  },
  {
    name: '发票助手',
    description: '自动生成形式发票和商业发票',
    href: '/dashboard/invoice',
    icon: ReceiptRefundIcon,
  },
];

const adminFeatures = [
  {
    name: '系统设置',
    description: '管理用户、权限和系统配置',
    href: '/dashboard/settings',
    icon: Cog8ToothIcon,
  },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          欢迎回来，{user?.name || user?.email}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          选择以下功能开始使用
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-500 hover:ring-1 hover:ring-primary-500"
          >
            <div>
              <feature.icon
                className="h-8 w-8 text-primary-600"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}

        {isAdmin && adminFeatures.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-500 hover:ring-1 hover:ring-primary-500"
          >
            <div>
              <feature.icon
                className="h-8 w-8 text-primary-600"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 