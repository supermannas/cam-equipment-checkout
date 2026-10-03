import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Tags fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: { name, color },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Tag create error:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
