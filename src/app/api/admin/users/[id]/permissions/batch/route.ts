import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// @ts-expect-error - Vercel deployment type issue
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { permissions } = await request.json();

    await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // 删除现有权限
      await tx.permission.deleteMany({
        where: { userId: id }
      });

      // 添加新权限
      await tx.permission.createMany({
        data: permissions.map((permissionId: string) => ({
          userId: id,
          permissionId
        }))
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions' }, 
      { status: 500 }
    );
  }
} 