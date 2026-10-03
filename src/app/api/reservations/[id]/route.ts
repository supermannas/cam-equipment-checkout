import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            description: true,
            sku: true,
            assetId: true,
            serialNumber: true,
            location: true,
            status: true,
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
        waiver: {
          select: {
            id: true,
            signedAt: true,
            pdfPath: true,
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Students can only see their own reservations
    if (session.user.role === 'STUDENT' && reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Reservation fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, notes } = body

    // Only staff and admins can update reservations
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(status === 'APPROVED' && { approvedBy: session.user.id, approvedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    // Update equipment status if approved
    if (status === 'APPROVED') {
      await prisma.equipment.update({
        where: { id: reservation.equipmentId },
        data: { status: 'RESERVED' },
      })
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATED',
        entity: 'Reservation',
        entityId: id,
        details: JSON.stringify({ status, notes }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Reservation update error:', error)
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Students can only cancel their own pending reservations
    if (session.user.role === 'STUDENT') {
      if (reservation.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (reservation.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only pending reservations can be cancelled by students' },
          { status: 400 }
        )
      }
    }

    // Staff/Admin can cancel any reservation
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    // If equipment was reserved, set it back to available
    if (reservation.status === 'APPROVED' || reservation.status === 'CHECKED_OUT') {
      await prisma.equipment.update({
        where: { id: reservation.equipmentId },
        data: { status: 'AVAILABLE' },
      })
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CANCELLED',
        entity: 'Reservation',
        entityId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reservation cancel error:', error)
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 })
  }
}
