import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    // 获取请求体中的权限数据
    const { moduleId, canAccess } = await request.json();
    if (!moduleId || typeof canAccess !== 'boolean') {
      return NextResponse.json(
        { error: '无效的权限数据' },
        { status: 400 }
      );
    }

    // 更新用户权限
    const permission = await prisma.permission.upsert({
      where: {
        userId_moduleId: {
          userId: params.id,
          moduleId: moduleId
        }
      },
      update: {
        canAccess: canAccess
      },
      create: {
        userId: params.id,
        moduleId: moduleId,
        canAccess: canAccess
      }
    });

    // 获取更新后的用户信息
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('更新权限时出错:', error);
    return NextResponse.json(
      { error: '更新权限失败' },
      { status: 500 }
    );
  }
} 