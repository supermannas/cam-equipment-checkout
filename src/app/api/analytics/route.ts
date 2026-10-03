import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, format } from 'date-fns'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = subDays(new Date(), days)

    // Get equipment statistics
    const totalEquipment = await prisma.equipment.count()
    const availableEquipment = await prisma.equipment.count({
      where: { status: 'AVAILABLE' },
    })
    const checkedOutEquipment = await prisma.equipment.count({
      where: { status: 'CHECKED_OUT' },
    })
    const maintenanceEquipment = await prisma.equipment.count({
      where: { status: 'MAINTENANCE' },
    })

    // Get reservation statistics
    const totalReservations = await prisma.reservation.count()
    const recentReservations = await prisma.reservation.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Reservations by status
    const reservationsByStatus = await prisma.reservation.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // Equipment usage (top 10 most reserved)
    const topEquipment = await prisma.equipment.findMany({
      take: 10,
      orderBy: {
        reservations: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    })

    // Reservations over time (last 30 days)
    const reservationsOverTime = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "Reservation"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Reservations by category
    const reservationsByCategory = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            equipment: {
              select: {
                reservations: {
                  where: {
                    createdAt: { gte: startDate },
                  },
                },
              },
            },
          },
        },
      },
    })

    const categoryData = reservationsByCategory.map(cat => ({
      name: cat.name,
      count: cat._count.equipment,
    }))

    return NextResponse.json({
      overview: {
        totalEquipment,
        availableEquipment,
        checkedOutEquipment,
        maintenanceEquipment,
        totalReservations,
        recentReservations,
      },
      reservationsByStatus: reservationsByStatus.map(r => ({
        status: r.status,
        count: r._count.id,
      })),
      topEquipment: topEquipment.map(e => ({
        name: e.name,
        count: e._count.reservations,
      })),
      reservationsOverTime: reservationsOverTime as Array<{ date: string; count: number }>,
      reservationsByCategory: categoryData,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
