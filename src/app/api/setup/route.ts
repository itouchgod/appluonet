import { NextResponse } from 'next/server';
import { createTestUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await createTestUser();
    return NextResponse.json({ message: '测试用户设置成功', user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('设置测试用户失败:', error);
    return NextResponse.json({ error: '设置测试用户失败' }, { status: 500 });
  }
} 