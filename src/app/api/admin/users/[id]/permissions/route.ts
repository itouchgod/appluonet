import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const { moduleId, canAccess } = await req.json();
    if (!moduleId || typeof canAccess !== 'boolean') {
      return NextResponse.json({ error: '无效的请求参数' }, { status: 400 });
    }

    // 更新或创建权限记录
    const permission = await prisma.permission.upsert({
      where: {
        userId_moduleId: {
          userId: id,
          moduleId,
        },
      },
      update: {
        canAccess,
      },
      create: {
        userId: id,
        moduleId,
        canAccess,
      },
    });

    // 获取更新后的用户信息（包含所有权限）
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('更新权限失败:', error);
    return NextResponse.json(
      { error: '更新权限失败' },
      { status: 500 }
    );
  }
} 