import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { status } = await request.json();
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('更新用户状态失败:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 