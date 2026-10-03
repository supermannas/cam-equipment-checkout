import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, ReservationStatus, Role } from '@prisma/client';
import { validateReservationDates, checkAvailability } from '../../../lib/reservation-rules';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = {
      status: {
        notIn: [ReservationStatus.CANCELLED, ReservationStatus.REJECTED]
      }
    };

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    if (startDate && endDate) {
      where.OR = [
        {
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) }
        }
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            studentId: true
          }
        },
        equipment: {
          select: {
            name: true,
            serialNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
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

    const body = await request.json();
    const { equipmentId, startDate, endDate, purpose } = body;

    if (!equipmentId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Equipment ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const validation = validateReservationDates(start, end);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid reservation dates', details: validation.errors },
        { status: 400 }
      );
    }

    // Check equipment availability
    const existingReservations = await prisma.reservation.findMany({
      where: {
        equipmentId,
        status: {
          notIn: [ReservationStatus.CANCELLED, ReservationStatus.REJECTED]
        }
      }
    });

    const availability = checkAvailability(equipmentId, start, end, existingReservations);

    if (!availability.isAvailable) {
      return NextResponse.json(
        { error: 'Equipment not available for selected dates', conflicts: availability.conflicts },
        { status: 400 }
      );
    }

    // Check if user has signed required waiver
    const hasWaiver = await prisma.waiver.findFirst({
      where: {
        userId: (session as any).user.id,
        equipmentId,
        isValid: true,
        signedAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last 365 days
        }
      }
    });

    if (!hasWaiver) {
      return NextResponse.json(
        { error: 'Waiver required', requiresWaiver: true },
        { status: 403 }
      );
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: (session as any).user.id,
        equipmentId,
        startDate: start,
        endDate: end,
        purpose,
        status: (session as any).user.role === Role.STUDENT ? ReservationStatus.PENDING : ReservationStatus.APPROVED
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            studentId: true
          }
        },
        equipment: {
          select: {
            name: true,
            serialNumber: true
          }
        }
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: (session as any).user.id,
        action: 'CREATE',
        entity: 'Reservation',
        entityId: reservation.id,
        changes: JSON.stringify({
          equipmentId,
          startDate: start,
          endDate: end,
          purpose
        })
      }
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
