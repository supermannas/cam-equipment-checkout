import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { importEquipmentFromCSV, validateCSVRow } from '@/lib/csv-import'
import { parse } from 'csv-parse/sync'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    
    // Parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as any[]

    if (records.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // Validate and import
    const results = await importEquipmentFromCSV(records)

    // Log audit for successful imports
    if (results.success > 0) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BULK_IMPORT',
          entity: 'Equipment',
          entityId: 'bulk-import',
          details: JSON.stringify({
            total: records.length,
            success: results.success,
            failed: results.failed,
          }),
        },
      })
    }

    return NextResponse.json({
      success: results.success,
      failed: results.failed,
      errors: results.errors,
    })
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 })
  }
}
