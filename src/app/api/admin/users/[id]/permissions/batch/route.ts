import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/auth';

interface PermissionUpdate {
  moduleId: string;
  canAccess: boolean;
}

interface RequestBody {
  permissions: PermissionUpdate[];
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string | string[] } }
): Promise<Response> {
  try {
    const session = await getAuth();
    if (!session?.user?.isAdmin) {
      console.warn('非管理员尝试访问权限管理:', session?.user?.id);
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id || Array.isArray(id)) {
      console.warn('无效的用户ID:', { id });
      return NextResponse.json(
        { error: '无效的用户ID' },
        { status: 400 }
      );
    }

    const userId: string = id;
    let body: RequestBody;
    
    try {
      body = await request.json() as RequestBody;
    } catch (e) {
      console.error('解析请求体失败:', e);
      return NextResponse.json(
        { error: '无效的请求数据格式' },
        { status: 400 }
      );
    }

    const { permissions } = body;
    if (!Array.isArray(permissions)) {
      console.warn('无效的权限数据格式:', { permissions });
      return NextResponse.json(
        { error: '无效的权限数据格式' },
        { status: 400 }
      );
    }

    // 使用事务确保数据一致性
    try {
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
    } catch (e) {
      console.error('权限更新事务失败:', e);
      throw e;
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true
      }
    });

    if (!updatedUser) {
      console.warn('用户不存在:', { userId });
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('批量更新权限错误:', {
      error,
      userId: params.id,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const response: ErrorResponse = {
      error: '更新权限失败',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 