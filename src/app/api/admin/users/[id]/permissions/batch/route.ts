import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/lib/auth';

interface PermissionUpdate {
  moduleId: string;
  canAccess: boolean;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const userId = params.id;
    const { permissions } = (await req.json()) as { permissions: PermissionUpdate[] };

    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 删除现有权限
      await tx.permission.deleteMany({
        where: { userId }
      });

      // 创建新的权限记录
      if (permissions.length > 0) {
        await tx.permission.createMany({
          data: permissions.map(p => ({
            userId,
            moduleId: p.moduleId,
            canAccess: p.canAccess
          }))
        });
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('批量更新权限错误:', error);
    return NextResponse.json(
      { error: '更新权限失败' },
      { status: 500 }
    );
  }
} 