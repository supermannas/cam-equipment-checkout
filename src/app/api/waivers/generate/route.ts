import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { format } from 'date-fns'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { reservationId, signatureDataUrl } = body

    if (!reservationId || !signatureDataUrl) {
      return NextResponse.json(
        { error: 'Reservation ID and signature required' },
        { status: 400 }
      )
    }

    // Get reservation details
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            studentId: true,
          },
        },
        equipment: {
          select: {
            name: true,
            description: true,
            sku: true,
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = 750
    const margin = 50
    const lineHeight = 20

    // Title
    page.drawText('Equipment Checkout Waiver', {
      x: margin,
      y,
      size: 24,
      font: boldFont,
    })
    y -= 40

    // Reservation info
    page.drawText(`Reservation ID: ${reservation.id}`, {
      x: margin,
      y,
      size: 12,
      font,
    })
    y -= lineHeight

    page.drawText(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, {
      x: margin,
      y,
      size: 12,
      font,
    })
    y -= 30

    // User info
    page.drawText('Borrower Information:', {
      x: margin,
      y,
      size: 14,
      font: boldFont,
    })
    y -= lineHeight

    page.drawText(`Name: ${reservation.user.name || 'N/A'}`, {
      x: margin + 20,
      y,
      size: 12,
      font,
    })
    y -= lineHeight

    page.drawText(`Email: ${reservation.user.email}`, {
      x: margin + 20,
      y,
      size: 12,
      font,
    })
    y -= lineHeight

    if (reservation.user.studentId) {
      page.drawText(`Student ID: ${reservation.user.studentId}`, {
        x: margin + 20,
        y,
        size: 12,
        font,
      })
      y -= lineHeight
    }
    y -= 20

    // Equipment info
    page.drawText('Equipment:', {
      x: margin,
      y,
      size: 14,
      font: boldFont,
    })
    y -= lineHeight

    page.drawText(`Item: ${reservation.equipment.name}`, {
      x: margin + 20,
      y,
      size: 12,
      font,
    })
    y -= lineHeight

    if (reservation.equipment.sku) {
      page.drawText(`SKU: ${reservation.equipment.sku}`, {
        x: margin + 20,
        y,
        size: 12,
        font,
      })
      y -= lineHeight
    }

    if (reservation.equipment.description) {
      page.drawText(`Description: ${reservation.equipment.description}`, {
        x: margin + 20,
        y,
        size: 12,
        font,
      })
      y -= lineHeight
    }
    y -= 20

    // Checkout period
    page.drawText('Checkout Period:', {
      x: margin,
      y,
      size: 14,
      font: boldFont,
    })
    y -= lineHeight

    page.drawText(`Check Out: ${format(reservation.startDate, 'MMMM d, yyyy h:mm a')}`, {
      x: margin + 20,
      y,
      size: 12,
      font,
    })
    y -= lineHeight

    page.drawText(`Return By: ${format(reservation.endDate, 'MMMM d, yyyy h:mm a')}`, {
      x: margin + 20,
      y,
      size: 12,
      font,
    })
    y -= 30

    // Terms and conditions
    page.drawText('Terms and Conditions:', {
      x: margin,
      y,
      size: 14,
      font: boldFont,
    })
    y -= lineHeight

    const terms = [
      'I acknowledge that I am solely responsible for the equipment listed above.',
      'I understand that I must return the equipment by the specified return date and time.',
      'I agree to pay for any damage or loss that occurs while the equipment is in my possession.',
      'I understand that the equipment may not be loaned to others.',
      'I acknowledge that I have received training on the proper use of this equipment.',
      'I understand that failure to comply with these terms may result in loss of borrowing privileges.',
    ]

    for (const term of terms) {
      page.drawText(`• ${term}`, {
        x: margin + 20,
        y,
        size: 10,
        font,
        maxWidth: 500,
      })
      y -= 15
    }

    y -= 30

    // Signature section
    page.drawText('Signature:', {
      x: margin,
      y,
      size: 12,
      font: boldFont,
    })
    y -= 40

    // Draw signature placeholder
    page.drawRectangle({
      x: margin,
      y,
      width: 200,
      height: 50,
      borderColor: 'rgb(0.8, 0.8, 0.8)',
      borderWidth: 1,
    })

    page.drawText('Digital Signature', {
      x: margin + 10,
      y + 15,
      size: 10,
      font,
      color: 'rgb(0.6, 0.6, 0.6)',
    })

    y -= 80

    // Date signed
    page.drawText(`Signed: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, {
      x: margin,
      y,
      size: 10,
      font,
    })

    // Save PDF
    const pdfBytes = await pdfDoc.save()

    // Save signature to database
    const waiver = await prisma.waiver.create({
      data: {
        userId: reservation.userId,
        equipmentId: reservation.equipmentId,
        reservationId: reservation.id,
        signature: signatureDataUrl,
        pdfPath: `/waivers/${reservation.id}.pdf`,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'WAIVER_SIGNED',
        entity: 'Waiver',
        entityId: waiver.id,
        details: JSON.stringify({ reservationId }),
      },
    })

    return NextResponse.json({
      success: true,
      waiverId: waiver.id,
      pdfBytes: Buffer.from(pdfBytes).toString('base64'),
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
