import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const permissions = await prisma.permission.findMany({
      where: {
        user: {
          username: session.user.username,
        },
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
} 