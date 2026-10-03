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

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    let where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        category: true,
        tags: true,
        _count: {
          select: {
            reservations: {
              where: {
                status: {
                  in: ['PENDING', 'APPROVED', 'CHECKED_OUT']
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and staff can create equipment
    if ((session as any).user.role !== 'ADMIN' && (session as any).user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, serialNumber, categoryId, quantity, location, notes, imageUrl } = body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        description,
        serialNumber,
        categoryId,
        quantity: quantity || 1,
        available: quantity || 1,
        location,
        notes,
        imageUrl,
        isActive: true
      },
      include: {
        category: true
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: (session as any).user.id,
        action: 'CREATE',
        entity: 'Equipment',
        entityId: equipment.id,
        changes: JSON.stringify({ name, serialNumber, categoryId })
      }
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}
