import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 检查是否已有管理员用户
    const adminExists = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (adminExists) {
      return NextResponse.json({ 
        error: '已存在管理员账户' 
      }, { status: 400 });
    }

    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        isAdmin: true,
        status: true
      }
    });

    return NextResponse.json({ 
      message: '初始化成功',
      admin 
    });
  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json({ 
      error: '初始化失败' 
    }, { status: 500 });
  }
} 