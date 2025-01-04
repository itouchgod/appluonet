import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { hash } from 'bcryptjs';

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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { username: true },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: '用户不存在' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 生成新密码
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(newPassword, 10);

    // 更新用户密码
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    });

    // 发送重置密码邮件
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // 临时发送到管理员邮箱
      subject: `[LC APP] 密码重置通知 - ${user.username}`,
      text: `用户 ${user.username} 的新密码是: ${newPassword}\n请尽快登录并修改密码。`,
      html: `
        <h2>密码重置通知</h2>
        <p>用户 <strong>${user.username}</strong> 的新密码是:</p>
        <p style="font-size: 18px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          ${newPassword}
        </p>
        <p>请尽快登录并修改密码。</p>
      `,
    });

    return new Response(
      JSON.stringify({ message: '密码已重置并发送邮件通知' }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('重置密码失败:', error);
    return new Response(
      JSON.stringify({ 
        error: '重置密码失败', 
        details: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 