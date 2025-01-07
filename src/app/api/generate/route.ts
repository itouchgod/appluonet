import { NextResponse } from 'next/server';
import { generateMail } from '@/lib/deepseek';

export async function POST(req: Request) {
  try {
    // 获取请求数据
    const data = await req.json();
    const { language, type, content, originalMail, mode } = data;

    // 验证必要参数
    if (!content || !language || !type || !mode) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 调用 DeepSeek API 生成邮件内容
    const result = await generateMail({
      content,
      language,
      type,
      originalMail,
      mode,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 