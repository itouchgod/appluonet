import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.username !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 不允许删除管理员账号
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    if (user.username === 'admin') {
      return NextResponse.json(
        { error: '不能删除管理员账号' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: '用户删除成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.username !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, email } = body;

    // 验证必填字段
    if (!username) {
      return NextResponse.json(
        { error: '用户名为必填项' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 如果是管理员账号，只允许修改邮箱
    if (user.username === 'admin') {
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: { email },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });
      return NextResponse.json(updatedUser);
    }

    // 如果修改用户名，检查新用户名是否已存在
    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: '用户名已存在' },
          { status: 400 }
        );
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        username,
        email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { error: '更新用户失败' },
      { status: 500 }
    );
  }
} 