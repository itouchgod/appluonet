import { NextResponse } from 'next/server';
import { createUser, validateEmail, validatePassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!await validateEmail(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (!await validatePassword(password)) {
      return NextResponse.json(
        { error: '密码必须至少8位，包含数字和字母' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = await createUser(name, email, password);

    return NextResponse.json(
      { user, message: '注册成功' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: error.message || '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 