import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function createTestUser() {
  try {
    // 创建 admin 用户
    const adminUser = await createAdminUser('admin', 'admin123');
    // 创建 jschina 用户
    const jschinaUser = await createAdminUser('jschina', 'jschina111');

    console.log('测试用户创建成功');
    return adminUser;
  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
}

async function createAdminUser(username: string, password: string) {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (!existingUser) {
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        status: true,
        isAdmin: true,
        permissions: {
          create: [
            { moduleId: 'mail', canAccess: true },
            { moduleId: 'order', canAccess: true },
            { moduleId: 'invoice', canAccess: true },
          ]
        }
      },
      include: {
        permissions: true
      }
    });

    console.log(`创建管理员用户 ${username} 成功`);
    return user;
  }

  // 如果用户已存在，确保更新为管理员权限
  const updatedUser = await prisma.user.update({
    where: { username },
    data: {
      isAdmin: true,
      permissions: {
        upsert: [
          {
            where: { userId_moduleId: { userId: existingUser.id, moduleId: 'mail' } },
            create: { moduleId: 'mail', canAccess: true },
            update: { canAccess: true }
          },
          {
            where: { userId_moduleId: { userId: existingUser.id, moduleId: 'order' } },
            create: { moduleId: 'order', canAccess: true },
            update: { canAccess: true }
          },
          {
            where: { userId_moduleId: { userId: existingUser.id, moduleId: 'invoice' } },
            create: { moduleId: 'invoice', canAccess: true },
            update: { canAccess: true }
          }
        ]
      }
    },
    include: {
      permissions: true
    }
  });

  console.log(`更新用户 ${username} 为管理员成功`);
  return updatedUser;
} 