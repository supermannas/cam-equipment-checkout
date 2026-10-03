import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  
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
  });
  
  const staff = await prisma.user.create({
    data: {
      email: 'staff@catawba.edu',
      name: 'Equipment Staff',
      password: hashedPassword,
      role: 'STAFF',
      studentId: 'STAFF001',
      phone: '704-555-0002',
    },
  });
  
  const student = await prisma.user.create({
    data: {
      email: 'student1@catawba.edu',
      name: 'Alex Johnson',
      password: hashedPassword,
      role: 'STUDENT',
      studentId: 'STU12345',
      phone: '704-555-0003',
    },
  });
  
  console.log('✅ Created users');
  
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Cameras', description: 'Digital and film cameras' } }),
    prisma.category.create({ data: { name: 'Lenses', description: 'Prime and zoom lenses' } }),
    prisma.category.create({ data: { name: 'Audio', description: 'Recorders, microphones, and audio equipment' } }),
    prisma.category.create({ data: { name: 'Lighting', description: 'LED panels, strobes, and lighting accessories' } }),
    prisma.category.create({ data: { name: 'Support', description: 'Tripods, monopods, and stabilizers' } }),
  ]);
  
  console.log('✅ Created categories');
  
  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: '4K' } }),
    prisma.tag.create({ data: { name: 'Wireless' } }),
    prisma.tag.create({ data: { name: 'Portable' } }),
    prisma.tag.create({ data: { name: 'Professional' } }),
    prisma.tag.create({ data: { name: 'Student-Friendly' } }),
    prisma.tag.create({ data: { name: 'HDR' } }),
  ]);
  
  console.log('✅ Created tags');
  
  // Create sample equipment
  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        name: 'Canon EOS R5',
        description: 'Professional mirrorless camera with 8K video',
        serialNumber: 'CAM-001',
        categoryId: categories[0].id,
        quantity: 2,
        available: 2,
        location: 'Cage A-1',
        imageUrl: '/images/canon-r5.jpg',
        tags: { connect: [{ name: '4K' }, { name: 'Professional' }] },
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Sony A7S III',
        description: 'Low-light champion with 4K 120fps',
        serialNumber: 'CAM-002',
        categoryId: categories[0].id,
        quantity: 2,
        available: 2,
        location: 'Cage A-2',
        imageUrl: '/images/sony-a7s3.jpg',
        tags: { connect: [{ name: '4K' }, { name: 'Professional' }] },
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Canon RF 24-70mm f/2.8',
        description: 'Standard zoom lens for Canon R series',
        serialNumber: 'LEN-001',
        categoryId: categories[1].id,
        quantity: 3,
        available: 3,
        location: 'Cage B-1',
        imageUrl: '/images/canon-24-70.jpg',
        tags: { connect: [{ name: 'Professional' }] },
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Zoom H6 Recorder',
        description: 'Portable 6-track audio recorder',
        serialNumber: 'AUD-001',
        categoryId: categories[2].id,
        quantity: 4,
        available: 4,
        location: 'Cage C-1',
        imageUrl: '/images/zoom-h6.jpg',
        tags: { connect: [{ name: 'Portable' }, { name: 'Student-Friendly' }] },
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Aputure 300d II',
        description: 'High-power LED light with Bowens mount',
        serialNumber: 'LIT-001',
        categoryId: categories[3].id,
        quantity: 2,
        available: 2,
        location: 'Cage D-1',
        imageUrl: '/images/aputure-300d.jpg',
        tags: { connect: [{ name: 'Professional' }] },
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Manfrotto MT055CXPro',
        description: 'Carbon fiber tripod with horizontal column',
        serialNumber: 'SUP-001',
        categoryId: categories[4].id,
        quantity: 3,
        available: 3,
        location: 'Cage E-1',
        imageUrl: '/images/manfrotto-055.jpg',
        tags: { connect: [{ name: 'Professional' }, { name: 'Portable' }] },
      },
    }),
  ]);
  
  console.log('✅ Created equipment');
  
  // Create a sample waiver
  const waiver = await prisma.waiver.create({
    data: {
      userId: student.id,
      signature: 'signed-by-alex-johnson',
      waiverType: 'general',
      isValid: true,
    },
  });
  
  console.log('✅ Created sample waiver');
  
  console.log('🎉 Seeding complete!');
  console.log('\nDemo Accounts:');
  console.log('  Admin: admin@catawba.edu / Password123!');
  console.log('  Staff: staff@catawba.edu / Password123!');
  console.log('  Student: student1@catawba.edu / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
