import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface Permission {
  moduleId: string;
  canAccess: boolean;
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
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

    const { id } = context.params;

    // 获取请求体中的权限数据
    const body = await request.json();
    console.log('Received body:', body);

    if (!body?.permissions || !Array.isArray(body.permissions)) {
      return NextResponse.json(
        { error: '无效的权限数据格式' },
        { status: 400 }
      );
    }

    const { permissions } = body as { permissions: Permission[] };

    // 批量更新权限
    await prisma.$transaction(async (tx) => {
      // 先删除该用户的所有权限
      await tx.permission.deleteMany({
        where: { userId: id }
      });

      // 创建新的权限记录
      if (permissions.length > 0) {
        await tx.permission.createMany({
          data: permissions.map(({ moduleId, canAccess }: Permission) => ({
            userId: id,
            moduleId,
            canAccess
          }))
        });
      }
    });

    // 获取更新后的用户信息
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('批量更新权限时出错:', error);
    return NextResponse.json(
      { error: '更新权限失败' },
      { status: 500 }
    );
  }
} 