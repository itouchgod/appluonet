import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = params.id;
    const { permissions } = await request.json();

    // 更新用户权限
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          set: permissions,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('批量更新权限错误:', error);
    return NextResponse.json(
      { error: '更新权限失败' },
      { status: 500 }
    );
  }
} 