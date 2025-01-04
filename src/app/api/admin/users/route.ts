import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    console.log('Current session:', session);
    
    if (!session?.user) {
      console.log('No session or user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', users: [] }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('Users found:', users);

    return new Response(
      JSON.stringify({ users }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return new Response(
      JSON.stringify({ 
        error: '获取用户列表失败', 
        details: error instanceof Error ? error.message : String(error),
        users: []
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 