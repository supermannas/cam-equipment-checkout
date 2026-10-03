import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  assetId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'CHECKED_OUT', 'MAINTENANCE', 'RETIRED']).optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

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

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        reservations: {
          where: { status: { in: ['PENDING', 'APPROVED', 'CHECKED_OUT'] } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Equipment fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validated = updateSchema.partial().parse(body)

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...validated,
        purchasePrice: validated.purchasePrice ? parseFloat(validated.purchasePrice.toString()) : undefined,
        tags: validated.tagIds ? {
          set: [],
          create: validated.tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATED',
        entity: 'Equipment',
        entityId: id,
        details: JSON.stringify(validated),
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Equipment update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 })
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if equipment has active reservations
    const activeReservations = await prisma.reservation.count({
      where: {
        equipmentId: id,
        status: { in: ['PENDING', 'APPROVED', 'CHECKED_OUT'] },
      },
    })

    if (activeReservations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete equipment with active reservations' },
        { status: 400 }
      )
    }

    await prisma.equipment.delete({
      where: { id },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETED',
        entity: 'Equipment',
        entityId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Equipment delete error:', error)
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 })
  }
}
