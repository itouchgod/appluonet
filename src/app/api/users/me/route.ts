import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { config } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export const dynamic = 'force-dynamic';

// 缓存获取用户信息的函数
const getUserInfo = cache(async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      isAdmin: true,
      permissions: true,
    },
  });
});

export async function GET() {
  try {
    const session = await getServerSession(config);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const user = await getUserInfo(session.user.id);

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json(user, {
      headers: {
        'Cache-Control': 'private, max-age=60',  // 客户端缓存1分钟
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
} 