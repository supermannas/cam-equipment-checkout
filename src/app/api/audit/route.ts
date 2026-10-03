import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view audit logs
    if ((session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const entityId = searchParams.get('entityId');
    const actorId = searchParams.get('actorId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');

    let where: any = {};

    if (entity) {
      where.entity = entity;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (action) {
      where.action = action;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
