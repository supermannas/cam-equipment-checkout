import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Cameras',
        description: 'Digital and film cameras, cinema cameras, and accessories',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Audio',
        description: 'Recorders, microphones, and audio equipment',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lighting',
        description: 'LED panels, fresnels, and lighting accessories',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Support',
        description: 'Tripods, gimbals, and support equipment',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        description: 'Memory cards, batteries, cables, and cases',
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: '4K' } }),
    prisma.tag.create({ data: { name: 'Wireless' } }),
    prisma.tag.create({ data: { name: 'Portable' } }),
    prisma.tag.create({ data: { name: 'Professional' } }),
    prisma.tag.create({ data: { name: 'Student-Friendly' } }),
    prisma.tag.create({ data: { name: 'HDR' } }),
  ])

  console.log(`✅ Created ${tags.length} tags`)

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('Password123!', 12)

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@catawba.edu',
      name: 'Equipment Admin',
      password: hashedPassword,
      role: 'ADMIN',
      studentId: 'ADMIN001',
      phone: '704-555-0001',
    },
  })

  const staff = await prisma.user.create({
    data: {
      email: 'staff@catawba.edu',
      name: 'Equipment Staff',
      password: hashedPassword,
      role: 'STAFF',
      studentId: 'STAFF001',
      phone: '704-555-0002',
    },
  })

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@catawba.edu',
        name: 'Alex Johnson',
        password: hashedPassword,
        role: 'STUDENT',
        studentId: 'STU001',
        phone: '704-555-0101',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student2@catawba.edu',
        name: 'Maria Garcia',
        password: hashedPassword,
        role: 'STUDENT',
        studentId: 'STU002',
        phone: '704-555-0102',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student3@catawba.edu',
        name: 'David Chen',
        password: hashedPassword,
        role: 'STUDENT',
        studentId: 'STU003',
        phone: '704-555-0103',
      },
    }),
  ])

  console.log(`✅ Created ${1 + 1 + students.length} users`)

  // Create equipment
  const equipmentData = [
    {
      name: 'Canon EOS R5',
      description: 'Full-frame mirrorless camera with 8K video capability',
      categoryId: categories[0].id,
      serialNumber: 'CN123456789',
      purchaseDate: new Date('2024-01-15'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[0].id, tags[3].id, tags[5].id],
    },
    {
      name: 'Sony A7IV',
      description: 'Hybrid full-frame camera excellent for photo and video',
      categoryId: categories[0].id,
      serialNumber: 'SN987654321',
      purchaseDate: new Date('2024-02-01'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[0].id, tags[2].id, tags[4].id],
    },
    {
      name: 'Blackmagic Pocket 6K',
      description: 'Cinema camera with RAW recording capability',
      categoryId: categories[0].id,
      serialNumber: 'BM123456',
      purchaseDate: new Date('2024-01-20'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[0].id, tags[3].id],
    },
    {
      name: 'Zoom H6 Recorder',
      description: 'Portable 6-channel audio recorder',
      categoryId: categories[1].id,
      serialNumber: 'ZH6123456',
      purchaseDate: new Date('2024-01-10'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[2].id, tags[4].id],
    },
    {
      name: 'Sennheiser MKH 416',
      description: 'Professional shotgun microphone',
      categoryId: categories[1].id,
      serialNumber: 'SM416789',
      purchaseDate: new Date('2024-01-12'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[3].id],
    },
    {
      name: 'Aputure 300d II',
      description: 'High-power LED panel light',
      categoryId: categories[2].id,
      serialNumber: 'AP300D2',
      purchaseDate: new Date('2024-02-05'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[3].id, tags[5].id],
    },
    {
      name: 'Manfrotto MT055CXPRO4',
      description: 'Carbon fiber tripod with horizontal column',
      categoryId: categories[3].id,
      serialNumber: 'MF055CX',
      purchaseDate: new Date('2024-01-08'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[2].id, tags[3].id],
    },
    {
      name: 'DJI Ronin SC',
      description: '3-axis gimbal stabilizer for mirrorless cameras',
      categoryId: categories[3].id,
      serialNumber: 'DJIRSC123',
      purchaseDate: new Date('2024-01-25'),
      location: 'Ketner 3210',
      quantity: 1,
      available: 1,
      tags: [tags[0].id, tags[2].id],
    },
    {
      name: 'SanDisk 128GB CFexpress',
      description: 'High-speed memory card for 4K/8K recording',
      categoryId: categories[4].id,
      serialNumber: 'SDCFE128',
      purchaseDate: new Date('2024-02-10'),
      location: 'Ketner 3210',
      quantity: 5,
      available: 5,
      tags: [tags[0].id, tags[4].id],
    },
    {
      name: 'Sony NP-FZ100 Batteries (3-pack)',
      description: 'Rechargeable lithium-ion batteries',
      categoryId: categories[4].id,
      serialNumber: 'SNFZ1003',
      purchaseDate: new Date('2024-02-12'),
      location: 'Ketner 3210',
      quantity: 3,
      available: 3,
      tags: [tags[4].id],
    },
  ]

  const equipmentList = await Promise.all(
    equipmentData.map(async (data) => {
      const equipment = await prisma.equipment.create({
        data: {
          name: data.name,
          description: data.description,
          serialNumber: data.serialNumber,
          category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
          quantity: data.quantity,
          available: data.available,
          location: data.location,
          purchaseDate: data.purchaseDate,
          notes: data.notes,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
        },
      })

      // Add tags
      if (data.tags && data.tags.length > 0) {
        await prisma.equipmentTags.createMany({
          data: data.tags.map((tagId: string) => ({
            equipmentId: equipment.id,
            tagId,
          })),
        })
      }

      return equipment
    })
  )

  console.log(`✅ Created ${equipmentList.length} equipment items`)

  // Create sample reservations
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() + 1)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 2)

  const reservations = await Promise.all([
    prisma.reservation.create({
      data: {
        userId: students[0].id,
        equipmentId: equipmentList[0].id,
        startDate,
        endDate,
        purpose: 'Student film project for COMM 3650',
        status: 'APPROVED',
        approvedBy: staff.id,
        approvedAt: new Date(),
      },
    }),
    prisma.reservation.create({
      data: {
        userId: students[1].id,
        equipmentId: equipmentList[3].id,
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        purpose: 'Audio recording for podcast project',
        status: 'PENDING',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: students[2].id,
        equipmentId: equipmentList[5].id,
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // Friday to Monday
        purpose: 'Weekend outdoor shoot',
        status: 'APPROVED',
        approvedBy: admin.id,
        approvedAt: new Date(),
      },
    }),
  ])

  console.log(`✅ Created ${reservations.length} reservations`)

  // Create sample waivers
  await Promise.all(
    reservations
      .filter(r => r.status === 'APPROVED')
      .map(async (reservation) => {
        await prisma.waiver.create({
          data: {
            userId: reservation.userId,
            equipmentId: reservation.equipmentId,
            reservationId: reservation.id,
            signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            pdfPath: `/waivers/${reservation.id}.pdf`,
            signedAt: new Date(),
          },
        })
      })
  )

  console.log('✅ Created sample waivers')

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATED',
        entity: 'Equipment',
        entityId: equipmentList[0].id,
        details: JSON.stringify({ name: 'Canon EOS R5', sku: 'CAM-001' }),
      },
      {
        userId: staff.id,
        action: 'APPROVED',
        entity: 'Reservation',
        entityId: reservations[0].id,
        details: JSON.stringify({ status: 'APPROVED' }),
      },
      {
        userId: students[0].id,
        action: 'WAIVER_SIGNED',
        entity: 'Waiver',
        entityId: 'waiver-001',
        details: JSON.stringify({ reservationId: reservations[0].id }),
      },
    ],
  })

  console.log('✅ Created audit logs')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📝 Demo Login Credentials:')
  console.log('   Admin:    admin@catawba.edu / Password123!')
  console.log('   Staff:    staff@catawba.edu / Password123!')
  console.log('   Student:  student1@catawba.edu / Password123!')
  console.log('\n💡 Tip: All demo users use the same password for convenience.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
