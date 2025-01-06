import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { permissions } = await request.json();

  const result = await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
    // Delete existing permissions
    await tx.permission.deleteMany({
      where: {
        userId: context.params.id,
      },
    });

    // Create new permissions
    const newPermissions = await tx.permission.createMany({
      data: permissions.map((permissionId: string) => ({
        userId: context.params.id,
        permissionId,
      })),
    });

    return newPermissions;
  });

  return Response.json(result);
} 