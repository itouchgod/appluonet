import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        permissions: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.permissions);
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return NextResponse.json(
      { error: '获取权限列表失败' },
      { status: 500 }
    );
  }
} 