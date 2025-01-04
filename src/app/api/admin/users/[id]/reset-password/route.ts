import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { hash } from 'bcryptjs';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 生成随机密码
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(newPassword, 12);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    });

    // 发送重置密码邮件
    if (user.email) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'LC APP - 密码重置通知',
        text: `您的密码已被管理员重置。新密码为: ${newPassword}`,
        html: `
          <h1>密码重置通知</h1>
          <p>您的密码已被管理员重置。</p>
          <p>新密码为: <strong>${newPassword}</strong></p>
          <p>请尽快登录系统并修改密码。</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('重置密码失败:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 