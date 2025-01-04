import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function createTestUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!existingUser) {
      const hashedPassword = await hash('admin123', 12);
      const user = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      // 创建默认权限
      await prisma.permission.createMany({
        data: [
          { userId: user.id, moduleId: 'quotation', canAccess: true },
          { userId: user.id, moduleId: 'order', canAccess: true },
          { userId: user.id, moduleId: 'invoice', canAccess: true },
        ],
      });

      console.log('测试用户创建成功');
      return user;
    }

    console.log('测试用户已存在');
    return existingUser;
  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
} 