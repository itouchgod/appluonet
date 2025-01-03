import { NextResponse } from 'next/server';
import { createUser, validateEmail, validatePassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 验证邮箱和密码
    await validateEmail(email);
    validatePassword(password);

    // 创建用户
    const user = await createUser({ email, password, name });

    return NextResponse.json({ 
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: Error | unknown) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : '注册失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
} 