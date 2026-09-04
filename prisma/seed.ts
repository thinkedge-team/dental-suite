import { PrismaClient, Role } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo organization...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-klinik' },
    update: {},
    create: {
      name: 'Klinik Gigi Senyum Sehat',
      slug: 'demo-klinik',
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: false,
      moduleIntelligence: false,
    },
  });

  // 2. Branches
  const branch1 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'kelapa-gading' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Kelapa Gading',
      slug: 'kelapa-gading',
      address: 'Jl. Boulevard Raya No. 123, Kelapa Gading, Jakarta Utara',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      whatsapp: '6281234567890',
      isActive: true,
    },
  });

  await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'pluit' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Pluit',
      slug: 'pluit',
      address: 'Jl. Pluit Indah No. 45, Pluit, Jakarta Utara',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      whatsapp: '6281234567891',
      isActive: true,
    },
  });

  // 3. Users
  const hashedPassword = await bcrypt.hash('demo123456', 12);

  await prisma.user.upsert({
    where: { email: 'director@demo.com' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Dr. Budi Santoso',
      email: 'director@demo.com',
      passwordHash: hashedPassword,
      role: Role.DIRECTOR,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      organizationId: org.id,
      branchId: branch1.id,
      name: 'Sari Wijaya',
      email: 'manager@demo.com',
      passwordHash: hashedPassword,
      role: Role.MANAGER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@demo.com' },
    update: {},
    create: {
      organizationId: org.id,
      branchId: branch1.id,
      name: 'Rina Kartika',
      email: 'staff@demo.com',
      passwordHash: hashedPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  // 4. Doctor
  const doctor = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-andi-pratama' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Andi Pratama',
      slug: 'dr-andi-pratama',
      title: 'drg.',
      specialty: 'Dokter Gigi Umum',
      bio: 'Dokter gigi berpengalaman 5 tahun.',
      isActive: true,
    },
  });

  // Assign doctor to branch
  await prisma.branchDoctor.upsert({
    where: { branchId_doctorId: { branchId: branch1.id, doctorId: doctor.id } },
    update: {},
    create: { branchId: branch1.id, doctorId: doctor.id },
  });

  // Create weekly schedule (Mon-Thu)
  for (const day of [1, 2, 3, 4]) {
    await prisma.schedule.upsert({
      where: { doctorId_branchId_dayOfWeek: { doctorId: doctor.id, branchId: branch1.id, dayOfWeek: day } },
      update: {},
      create: {
        doctorId: doctor.id,
        branchId: branch1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotMinutes: 30,
        isActive: true,
      },
    });
  }

  // 5. Services
  const services = [
    { name: 'Pembersihan Gigi', slug: 'pembersihan-gigi', price: 250000, durationMin: 45 },
    { name: 'Penambalan Gigi', slug: 'penambalan-gigi', price: 400000, durationMin: 60 },
    { name: 'Pemutihan Gigi', slug: 'pemutihan-gigi', price: 800000, durationMin: 90 },
    { name: 'Cabut Gigi', slug: 'cabut-gigi', price: 300000, durationMin: 30 },
    { name: 'Konsultasi', slug: 'konsultasi', price: 150000, durationMin: 20 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: service.slug } },
      update: {},
      create: { organizationId: org.id, ...service, isActive: true },
    });
  }

  // 6. Insurance Partners
  const insurers = [
    { name: 'BPJS Kesehatan', slug: 'bpjs' },
    { name: 'Allianz', slug: 'allianz' },
    { name: 'Prudential', slug: 'prudential' },
  ];

  for (const insurer of insurers) {
    await prisma.insurancePartner.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: insurer.slug } },
      update: {},
      create: { organizationId: org.id, ...insurer, isActive: true },
    });
  }

  console.log('Seed complete!');
  console.log('\nDemo accounts:');
  console.log('  Director: director@demo.com / demo123456');
  console.log('  Manager:  manager@demo.com  / demo123456');
  console.log('  Staff:    staff@demo.com    / demo123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });