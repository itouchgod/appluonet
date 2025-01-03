import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateEmail } from '@/lib/xai';

export async function POST(req: Request) {
  try {
    // 验证用户是否登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { mode, type, language, content, originalMail } = data;

    // 调用 XAI API 生成邮件内容
    const result = await generateEmail({
      mode,
      type,
      language,
      content,
      originalMail,
      userName: session.user?.name || session.user?.email
    });

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: error.message || '邮件生成失败' },
      { status: 500 }
    );
  }
} 