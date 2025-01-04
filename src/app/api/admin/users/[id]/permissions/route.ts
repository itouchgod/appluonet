import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const session = await auth();
    if (!session || session.user?.username !== 'admin') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const permissions = await prisma.permission.findMany({
      where: { userId: id },
      select: {
        id: true,
        moduleId: true,
        canAccess: true,
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('获取权限失败:', error);
    return NextResponse.json(
      { error: '获取权限失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const session = await auth();
    if (!session || session.user?.username !== 'admin') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { moduleId, canAccess } = await req.json();

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

    return NextResponse.json(permission);
  } catch (error) {
    console.error('更新权限失败:', error);
    return NextResponse.json(
      { error: '更新权限失败' },
      { status: 500 }
    );
  }
} 