import { AppointmentStatus, PrismaClient, Role } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: today at HH:MM WIB (UTC+7) as UTC Date
function wibToday(hh: number, mm: number): Date {
  const d = new Date();
  d.setUTCHours(hh - 7, mm, 0, 0); // WIB offset
  return d;
}

async function main() {
  console.log('Seeding demo organization...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'senyum-sehat' },
    update: {},
    create: {
      name: 'Klinik Gigi Senyum Sehat',
      slug: 'senyum-sehat',
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

  // 4. Doctors
  const doctorAndi = await prisma.doctor.upsert({
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

  const doctorSarah = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-sarah-amanda' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Sarah Amanda',
      slug: 'dr-sarah-amanda',
      title: 'drg.',
      specialty: 'Sp.KG',
      bio: 'Spesialis Konservasi Gigi.',
      isActive: true,
    },
  });

  const doctorBudi = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-budi-hartono' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Budi Hartono',
      slug: 'dr-budi-hartono',
      title: 'drg.',
      specialty: 'Sp.BM',
      bio: 'Spesialis Bedah Mulut.',
      isActive: true,
    },
  });

  // Assign doctors to branch1 and create weekly schedules (Mon–Fri)
  const allDoctors = [doctorAndi, doctorSarah, doctorBudi];
  for (const doc of allDoctors) {
    await prisma.branchDoctor.upsert({
      where: { branchId_doctorId: { branchId: branch1.id, doctorId: doc.id } },
      update: {},
      create: { branchId: branch1.id, doctorId: doc.id },
    });

    for (const day of [1, 2, 3, 4, 5]) {
      await prisma.schedule.upsert({
        where: { doctorId_branchId_dayOfWeek: { doctorId: doc.id, branchId: branch1.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorId: doc.id,
          branchId: branch1.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotMinutes: 30,
          isActive: true,
        },
      });
    }
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

  // 6. Sample Appointments for Today
  const startOfToday = wibToday(0, 0);
  const endOfToday = wibToday(23, 59);

  const existingCount = await prisma.appointment.count({
    where: {
      organizationId: org.id,
      scheduledAt: { gte: startOfToday, lt: endOfToday },
    },
  });

  if (existingCount === 0) {
    const appointmentData = [
      {
        time: [9, 0] as const,
        patientName: 'Sarah Wijaya',
        patientPhone: '08111111111',
        service: 'Pembersihan Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: doctorAndi.id,
      },
      {
        time: [9, 30] as const,
        patientName: 'Budi Santoso',
        patientPhone: '08222222222',
        service: 'Konsultasi',
        status: AppointmentStatus.CHECKED_IN,
        doctorId: doctorAndi.id,
      },
      {
        time: [10, 0] as const,
        patientName: 'Rina Kartika',
        patientPhone: '08333333333',
        service: 'Penambalan Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: undefined,
      },
      {
        time: [10, 30] as const,
        patientName: 'Anton Prabowo',
        patientPhone: '08444444444',
        service: 'Cabut Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: undefined,
      },
      {
        time: [11, 0] as const,
        patientName: 'Jessica Wong',
        patientPhone: '08555555555',
        service: 'Pemutihan Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: doctorSarah.id,
      },
      {
        time: [14, 0] as const,
        patientName: 'Michael Tan',
        patientPhone: '08666666666',
        service: 'Konsultasi',
        status: AppointmentStatus.CANCELLED,
        doctorId: doctorBudi.id,
      },
    ];

    for (const item of appointmentData) {
      const patient = await prisma.patient.upsert({
        where: {
          organizationId_phone: {
            organizationId: org.id,
            phone: item.patientPhone,
          },
        },
        update: { name: item.patientName },
        create: {
          organizationId: org.id,
          name: item.patientName,
          phone: item.patientPhone,
        },
      });

      await prisma.appointment.create({
        data: {
          organizationId: org.id,
          branchId: branch1.id,
          patientId: patient.id,
          patientName: item.patientName,
          patientPhone: item.patientPhone,
          service: item.service,
          status: item.status,
          doctorId: item.doctorId,
          scheduledAt: wibToday(item.time[0], item.time[1]),
        },
      });
    }
  }

  // 7. Insurance Partners
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