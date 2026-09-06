import { AttendanceStatus, AppointmentStatus, InventoryLogType, PrismaClient, Role } from '../src/generated/prisma';
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
    update: { moduleOperate: true },
    create: {
      name: 'Klinik Gigi Senyum Sehat',
      slug: 'senyum-sehat',
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: true,
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

  const branch2 = await prisma.branch.upsert({
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

  const du = await prisma.user.findUnique({ where: { email: 'director@demo.com' } });
  const mu = await prisma.user.findUnique({ where: { email: 'manager@demo.com' } });
  const bu = await prisma.user.findUnique({ where: { email: 'staff@demo.com' } });
  const bi = branch1.id;
  const b2 = branch2.id;
  const af1 = [
    { n: 'Lidocaine HCl 2% + Epinephrine', s: 'MED-LIDO-01', st: 8, ms: 20, u: 'ampul', c: 'Anestesi & Farmasi' },
    { n: 'Mepivacaine 3% Non-Vasoconstrictor', s: 'MED-MEPI-02', st: 25, ms: 15, u: 'ampul', c: 'Anestesi & Farmasi' },
    { n: 'Amoxicillin 500mg', s: 'MED-AMOX-03', st: 50, ms: 30, u: 'strip', c: 'Anestesi & Farmasi' },
  ];
  for (const d of af1) {
    const i = await prisma.inventoryItem.create({ data: { branchId: bi, name: d.n, sku: d.s, stock: d.st, minStock: d.ms, unit: d.u, category: d.c } });
    await prisma.inventoryLog.create({ data: { type: 'RESTOCK' as const, quantity: d.st, previousStock: 0, currentStock: d.st, itemId: i.id, userId: mu!.id } });
  }
  const bt1 = [
    { n: 'Composite Resin Filtek Z250 A2', s: 'MAT-COMP-A2', st: 6, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' },
    { n: 'Bonding Agent Universal', s: 'MAT-BOND-01', st: 3, ms: 4, u: 'botol', c: 'Bahan Tambal & Restorasi' },
    { n: 'Etching Gel 37%', s: 'MAT-ETCH-01', st: 12, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' },
  ];
  for (const d of bt1) {
    const i = await prisma.inventoryItem.create({ data: { branchId: bi, name: d.n, sku: d.s, stock: d.st, minStock: d.ms, unit: d.u, category: d.c } });
    await prisma.inventoryLog.create({ data: { type: 'RESTOCK' as const, quantity: d.st, previousStock: 0, currentStock: d.st, itemId: i.id, userId: mu!.id } });
  }
  const hp1 = [
    { n: 'Dental Needle 30G Short', s: 'DISP-NDL-30', st: 150, ms: 50, u: 'pcs', c: 'Habis Pakai & Sterilisasi' },
    { n: 'Latex Examination Gloves M', s: 'DISP-GLV-M', st: 0, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' },
    { n: 'Masker Medis 3-Ply Earloop', s: 'DISP-MASK-01', st: 20, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' },
    { n: 'Pouch Sterilisasi Autoclave 90x230mm', s: 'STER-PCH-01', st: 80, ms: 30, u: 'pcs', c: 'Habis Pakai & Sterilisasi' },
  ];
  for (const d of hp1) {
    const i = await prisma.inventoryItem.create({ data: { branchId: bi, name: d.n, sku: d.s, stock: d.st, minStock: d.ms, unit: d.u, category: d.c } });
    await prisma.inventoryLog.create({ data: { type: 'RESTOCK' as const, quantity: d.st, previousStock: 0, currentStock: d.st, itemId: i.id, userId: mu!.id } });
  }
  const o1 = [
    { n: 'Bracket Metal MBT 0.022 Kit', s: 'ORTH-BRK-01', st: 15, ms: 10, u: 'set', c: 'Ortodonti' },
    { n: 'Niti Archwire 0.014 Upper', s: 'ORTH-WIRE-01', st: 30, ms: 20, u: 'pcs', c: 'Ortodonti' },
  ];
  for (const d of o1) {
    const i = await prisma.inventoryItem.create({ data: { branchId: bi, name: d.n, sku: d.s, stock: d.st, minStock: d.ms, unit: d.u, category: d.c } });
    await prisma.inventoryLog.create({ data: { type: 'RESTOCK' as const, quantity: d.st, previousStock: 0, currentStock: d.st, itemId: i.id, userId: mu!.id } });
  }
  const ib1 = [
    { n: 'Blade Bisturi No. 15', s: 'SURG-BLD-15', st: 45, ms: 25, u: 'pcs', c: 'Instrumen Bedah' },
    { n: 'Benang Jahit Silk 3-0', s: 'SURG-SLK-30', st: 2, ms: 8, u: 'pcs', c: 'Instrumen Bedah' },
  ];
  for (const d of ib1) {
    const i = await prisma.inventoryItem.create({ data: { branchId: bi, name: d.n, sku: d.s, stock: d.st, minStock: d.ms, unit: d.u, category: d.c } });
    await prisma.inventoryLog.create({ data: { type: 'RESTOCK' as const, quantity: d.st, previousStock: 0, currentStock: d.st, itemId: i.id, userId: mu!.id } });
  }
  console.log('Inventory seeding complete!');

  console.log('Seeding shifts and attendance...');

  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysSinceMonday = (utcDay + 6) % 7;

  function wibDateAtStartOfDay(dayOffset: number): Date {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + dayOffset);
    d.setUTCHours(0 - 7, 0, 0, 0);
    return d;
  }

  const todayWib = new Date();
  todayWib.setUTCHours(0 - 7, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const shiftDate = wibDateAtStartOfDay(i - daysSinceMonday);

    const existingManagerShift = await prisma.shift.findFirst({
      where: {
        userId: mu!.id,
        branchId: bi,
        date: shiftDate,
      },
    });

    const managerShift = existingManagerShift
      ? existingManagerShift
      : await prisma.shift.create({
          data: {
            branchId: bi,
            userId: mu!.id,
            date: shiftDate,
            startTime: '08:00',
            endTime: '15:00',
            shiftType: 'PAGI',
            notes: 'Shift Pagi Manager',
          },
        });

    const existingStaffShift = await prisma.shift.findFirst({
      where: {
        userId: bu!.id,
        branchId: bi,
        date: shiftDate,
      },
    });

    if (!existingStaffShift) {
      await prisma.shift.create({
        data: {
          branchId: bi,
          userId: bu!.id,
          date: shiftDate,
          startTime: '14:00',
          endTime: '21:00',
          shiftType: 'SIANG',
          notes: 'Shift Siang Staff',
        },
      });
    }

    if (shiftDate.getTime() === todayWib.getTime()) {
      const existingAttendance = await prisma.attendanceRecord.findFirst({
        where: {
          userId: mu!.id,
          date: shiftDate,
        },
      });

      if (!existingAttendance) {
        await prisma.attendanceRecord.create({
          data: {
            branchId: bi,
            userId: mu!.id,
            shiftId: managerShift.id,
            date: shiftDate,
            clockInAt: wibToday(7, 55),
            status: AttendanceStatus.ON_TIME,
            notes: 'Hadir tepat waktu',
          },
        });
      }
    }
  }

  console.log('Shifts and attendance seeding complete!');
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