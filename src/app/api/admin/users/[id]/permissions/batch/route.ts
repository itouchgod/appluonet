import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const session = await getAuth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const { params } = context;
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "用户ID不能为空" }, { status: 400 });
    }

    const { permissions } = await request.json();
    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: "权限数据格式错误" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 删除现有权限
      await tx.permission.deleteMany({
        where: { userId: id }
      });

      // 添加新权限
      await tx.permission.createMany({
        data: permissions.map((permission: Permission) => ({
          userId: id,
          moduleId: permission.moduleId,
          canAccess: permission.canAccess
        }))
      });
    });

    // 返回更新后的用户信息
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        permissions: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新权限失败:', error);
    return NextResponse.json(
      { error: '更新权限失败' }, 
      { status: 500 }
    );
  }
} 