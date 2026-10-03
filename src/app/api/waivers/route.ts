import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { generateWaiverPDF } from '../../../lib/waiver-generator';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const equipmentId = searchParams.get('equipmentId');

    let where: any = {
      isValid: true
    };

    if (userId) {
      where.userId = userId;
    }

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    const waivers = await prisma.waiver.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            studentId: true
          }
        },
        equipment: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        signedAt: 'desc'
      }
    });

    return NextResponse.json(waivers);
  } catch (error) {
    console.error('Error fetching waivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waivers' },
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
    const { equipmentId, signature } = body;

    if (!equipmentId || !signature) {
      return NextResponse.json(
        { error: 'Equipment ID and signature are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: (session as any).user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Generate PDF waiver
    const waiverData = {
      studentName: user.name,
      studentId: user.studentId || 'N/A',
      equipmentName: equipment.name,
      checkoutDate: new Date().toLocaleDateString(),
      returnDate: 'To be determined',
      signature: signature,
      signatureDate: new Date().toLocaleDateString()
    };

    const pdfBytes = await generateWaiverPDF(waiverData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // Save waiver record
    const waiver = await prisma.waiver.create({
      data: {
        userId: user.id,
        equipmentId,
        signature,
        waiverType: 'general',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE',
        entity: 'Waiver',
        entityId: waiver.id,
        changes: JSON.stringify({ equipmentId, waiverType: 'general' })
      }
    });

    return NextResponse.json({
      waiverId: waiver.id,
      pdfBase64
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing waiver:', error);
    return NextResponse.json(
      { error: 'Failed to process waiver' },
      { status: 500 }
    );
  }
}
