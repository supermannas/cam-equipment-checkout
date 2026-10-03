import { prisma } from './prisma'

export interface EquipmentCSVRow {
  name: string
  sku?: string
  assetId?: string
  description?: string
  category?: string
  serialNumber?: string
  location?: string
  purchaseDate?: string
  purchasePrice?: string
  status?: string
}

export interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export async function importEquipmentFromCSV(
  rows: EquipmentCSVRow[]
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2 // Account for header row

    try {
      // Validate required fields
      if (!row.name || row.name.trim() === '') {
        throw new Error('Name is required')
      }

      // Find or create category
      let categoryId: string | undefined
      if (row.category) {
        const category = await prisma.category.upsert({
          where: { name: row.category.trim() },
          update: {},
          create: { name: row.category.trim() },
        })
        categoryId = category.id
      }

      // Parse price
      let purchasePrice: number | undefined
      if (row.purchasePrice) {
        const price = parseFloat(row.purchasePrice.replace(/[^0-9.]/g, ''))
        if (!isNaN(price)) {
          purchasePrice = price
        }
      }

      // Parse date
      let purchaseDate: Date | undefined
      if (row.purchaseDate) {
        const date = new Date(row.purchaseDate)
        if (!isNaN(date.getTime())) {
          purchaseDate = date
        }
      }

      // Parse status
      let status: 'AVAILABLE' | 'RESERVED' | 'CHECKED_OUT' | 'MAINTENANCE' | 'RETIRED' = 'AVAILABLE'
      if (row.status) {
        const normalizedStatus = row.status.toUpperCase().trim()
        if (
          ['AVAILABLE', 'RESERVED', 'CHECKED_OUT', 'MAINTENANCE', 'RETIRED'].includes(
            normalizedStatus
          )
        ) {
          status = normalizedStatus as typeof status
        }
      }

      // Create equipment
      await prisma.equipment.create({
        data: {
          name: row.name.trim(),
          sku: row.sku?.trim() || null,
          assetId: row.assetId?.trim() || null,
          description: row.description?.trim() || null,
          categoryId,
          serialNumber: row.serialNumber?.trim() || null,
          location: row.location?.trim() || null,
          purchaseDate,
          purchasePrice,
          status,
        },
      })

      result.success++
    } catch (error) {
      result.failed++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push({
        row: rowNumber,
        error: errorMessage,
      })
    }
  }

  return result
}

export function validateCSVRow(row: EquipmentCSVRow): string[] {
  const errors: string[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push('Name is required')
  }

  if (row.sku) {
    // Check if SKU already exists
    // This would be done in the import function itself
  }

  if (row.assetId) {
    // Check if asset ID already exists
    // This would be done in the import function itself
  }

  if (row.purchasePrice) {
    const price = parseFloat(row.purchasePrice.replace(/[^0-9.]/g, ''))
    if (isNaN(price) || price < 0) {
      errors.push('Invalid purchase price')
    }
  }

  if (row.purchaseDate) {
    const date = new Date(row.purchaseDate)
    if (isNaN(date.getTime())) {
      errors.push('Invalid purchase date')
    }
  }

  if (row.status) {
    const validStatuses = ['AVAILABLE', 'RESERVED', 'CHECKED_OUT', 'MAINTENANCE', 'RETIRED']
    if (!validStatuses.includes(row.status.toUpperCase())) {
      errors.push('Invalid status. Must be one of: AVAILABLE, RESERVED, CHECKED_OUT, MAINTENANCE, RETIRED')
    }
  }

  return errors
}
