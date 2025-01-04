import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
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

    // 获取用户信息
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
    console.error('获取用户信息时出错:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const id = context.params.id;
    if (!id) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const { isAdmin, status } = await req.json();
    const updateData: { isAdmin?: boolean; status?: boolean } = {};

    // 检查是否更新管理员权限
    if (typeof isAdmin === 'boolean') {
      // 防止取消最后一个管理员的管理员权限
      if (!isAdmin) {
        const adminCount = await prisma.user.count({
          where: { isAdmin: true },
        });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: '必须保留至少一个管理员账号' },
            { status: 400 }
          );
        }
      }
      updateData.isAdmin = isAdmin;
    }

    // 检查是否更新状态
    if (typeof status === 'boolean') {
      // 防止禁用最后一个管理员账户
      if (!status) {
        const targetUser = await prisma.user.findUnique({
          where: { id },
          select: { isAdmin: true },
        });
        
        if (targetUser?.isAdmin) {
          const adminCount = await prisma.user.count({
            where: { isAdmin: true, status: true },
          });
          if (adminCount <= 1) {
            return NextResponse.json(
              { error: '必须保留至少一个启用状态的管理员账号' },
              { status: 400 }
            );
          }
        }
      }
      updateData.status = status;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { error: '更新用户信息失败' },
      { status: 500 }
    );
  }
} 