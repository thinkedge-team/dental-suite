import {
  PrismaClient,
  Role,
  AppointmentStatus,
  AttendanceStatus,
  InventoryLogType,
  ApprovalType,
  ApprovalStatus,
} from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: WIB (UTC+7) Date helper
function wibDate(daysOffset: number, hh: number, mm: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysOffset);
  d.setUTCHours(hh - 7, mm, 0, 0); // WIB offset is UTC+7
  return d;
}

function wibStartOfDay(daysOffset: number = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysOffset);
  d.setUTCHours(0 - 7, 0, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding Think Edge Dental Suite comprehensive dataset...');

  // ─── 1. ORGANIZATION ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'senyum-sehat' },
    update: {
      name: 'Klinik Gigi Senyum Sehat',
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: true,
      moduleIntelligence: true,
    },
    create: {
      name: 'Klinik Gigi Senyum Sehat',
      slug: 'senyum-sehat',
      logoUrl: '/images/logo-senyum-sehat.png',
      primaryColor: '#f38218',
      seoTitle: 'Klinik Gigi Senyum Sehat - Perawatan Gigi Modern & Terpercaya',
      seoDescription: 'Layanan dokter gigi spesialis lengkap dengan fasilitas modern di Jakarta Utara dan Jakarta Selatan.',
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: true,
      moduleIntelligence: true,
    },
  });

  // ─── CLEANUP TRANSACTIONAL DATA FOR IDEMPOTENT RUNS ────────────────────────
  console.log('Resetting transactional demo data for organization...');
  await prisma.visit.deleteMany({ where: { organizationId: org.id } });
  await prisma.inventoryLog.deleteMany({ where: { item: { branch: { organizationId: org.id } } } });
  await prisma.inventoryItem.deleteMany({ where: { branch: { organizationId: org.id } } });
  await prisma.attendanceRecord.deleteMany({ where: { branch: { organizationId: org.id } } });
  await prisma.shift.deleteMany({ where: { branch: { organizationId: org.id } } });
  await prisma.approvalRequest.deleteMany({ where: { organizationId: org.id } });
  await prisma.appointment.deleteMany({ where: { organizationId: org.id } });
  await prisma.scheduleBlock.deleteMany({ where: { branch: { organizationId: org.id } } });
  await prisma.schedule.deleteMany({ where: { branch: { organizationId: org.id } } });
  await prisma.branchDoctor.deleteMany({ where: { branch: { organizationId: org.id } } });

  // ─── 2. BRANCHES (ACTIVE & INACTIVE) ─────────────────────────────────────────
  console.log('Seeding branches...');
  const branch1 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'kelapa-gading' } },
    update: {
      name: 'Kelapa Gading',
      address: 'Jl. Boulevard Raya No. 123, Kelapa Gading, Jakarta Utara',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14240',
      whatsapp: '6281234567890',
      latitude: -6.158200,
      longitude: 106.909300,
      photoUrls: ['/images/branch-kelapa-gading.jpg', '/images/clinic-room.jpg'],
      openingHours: {
        weekday: '08:00 - 21:00',
        saturday: '09:00 - 18:00',
        sunday: '10:00 - 16:00',
      },
      parkingInfo: 'Tersedia parkir kendaraan roda empat dan dua luas dengan keamanan 24 jam.',
      googleMapsUrl: 'https://maps.google.com/?q=Kelapa+Gading+Dental+Clinic',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Kelapa Gading',
      slug: 'kelapa-gading',
      address: 'Jl. Boulevard Raya No. 123, Kelapa Gading, Jakarta Utara',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14240',
      whatsapp: '6281234567890',
      latitude: -6.158200,
      longitude: 106.909300,
      photoUrls: ['/images/branch-kelapa-gading.jpg', '/images/clinic-room.jpg'],
      openingHours: {
        weekday: '08:00 - 21:00',
        saturday: '09:00 - 18:00',
        sunday: '10:00 - 16:00',
      },
      parkingInfo: 'Tersedia parkir kendaraan roda empat dan dua luas dengan keamanan 24 jam.',
      googleMapsUrl: 'https://maps.google.com/?q=Kelapa+Gading+Dental+Clinic',
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'pluit' } },
    update: {
      name: 'Pluit',
      address: 'Jl. Pluit Indah No. 45, Pluit, Jakarta Utara',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14450',
      whatsapp: '6281234567891',
      latitude: -6.121500,
      longitude: 106.791200,
      photoUrls: ['/images/branch-pluit.jpg', '/images/clinic-room.jpg'],
      openingHours: {
        weekday: '09:00 - 21:00',
        saturday: '09:00 - 18:00',
        sunday: '10:00 - 15:00',
      },
      parkingInfo: 'Fasilitas valet dan parkir reserved khusus pasien di area lobi.',
      googleMapsUrl: 'https://maps.google.com/?q=Pluit+Dental+Clinic',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Pluit',
      slug: 'pluit',
      address: 'Jl. Pluit Indah No. 45, Pluit, Jakarta Utara',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14450',
      whatsapp: '6281234567891',
      latitude: -6.121500,
      longitude: 106.791200,
      photoUrls: ['/images/branch-pluit.jpg', '/images/clinic-room.jpg'],
      openingHours: {
        weekday: '09:00 - 21:00',
        saturday: '09:00 - 18:00',
        sunday: '10:00 - 15:00',
      },
      parkingInfo: 'Fasilitas valet dan parkir reserved khusus pasien di area lobi.',
      googleMapsUrl: 'https://maps.google.com/?q=Pluit+Dental+Clinic',
      isActive: true,
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'senopati' } },
    update: {
      name: 'Senopati',
      address: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      whatsapp: '6281234567892',
      latitude: -6.234100,
      longitude: 106.812400,
      photoUrls: ['/images/clinic-room.jpg'],
      openingHours: {
        weekday: '10:00 - 21:00',
        saturday: '10:00 - 19:00',
        sunday: '11:00 - 16:00',
      },
      parkingInfo: 'Lahan parkir basement khusus dengan pengisian daya mobil listrik.',
      googleMapsUrl: 'https://maps.google.com/?q=Senopati+Dental+Clinic',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Senopati',
      slug: 'senopati',
      address: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      whatsapp: '6281234567892',
      latitude: -6.234100,
      longitude: 106.812400,
      photoUrls: ['/images/clinic-room.jpg'],
      openingHours: {
        weekday: '10:00 - 21:00',
        saturday: '10:00 - 19:00',
        sunday: '11:00 - 16:00',
      },
      parkingInfo: 'Lahan parkir basement khusus dengan pengisian daya mobil listrik.',
      googleMapsUrl: 'https://maps.google.com/?q=Senopati+Dental+Clinic',
      isActive: true,
    },
  });

  // Inactive branch (Segera Hadir)
  await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'surabaya-barat' } },
    update: {
      name: 'Surabaya Barat',
      address: 'Jl. Mayjen Sungkono No. 12, Surabaya, Jawa Timur',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60225',
      whatsapp: '6281234567893',
      isActive: false,
    },
    create: {
      organizationId: org.id,
      name: 'Surabaya Barat',
      slug: 'surabaya-barat',
      address: 'Jl. Mayjen Sungkono No. 12, Surabaya, Jawa Timur',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60225',
      whatsapp: '6281234567893',
      isActive: false,
    },
  });

  // ─── 3. USERS (ALL 5 ROLES + INACTIVE) ──────────────────────────────────────
  console.log('Seeding users across all roles...');
  const hashedPassword = await bcrypt.hash('demo123456', 12);

  // SUPER_ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@demo.com' },
    update: { organizationId: org.id, role: Role.SUPER_ADMIN, isActive: true },
    create: {
      organizationId: org.id,
      name: 'Platform Superadmin',
      email: 'superadmin@demo.com',
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  // DIRECTOR
  const director = await prisma.user.upsert({
    where: { email: 'director@demo.com' },
    update: { organizationId: org.id, role: Role.DIRECTOR, isActive: true },
    create: {
      organizationId: org.id,
      name: 'Dr. Budi Santoso',
      email: 'director@demo.com',
      passwordHash: hashedPassword,
      role: Role.DIRECTOR,
      isActive: true,
    },
  });

  // MANAGERS (Branch Kelapa Gading and Branch Pluit)
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: { organizationId: org.id, branchId: branch1.id, role: Role.MANAGER, isActive: true },
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

  const manager2 = await prisma.user.upsert({
    where: { email: 'manager.pluit@demo.com' },
    update: { organizationId: org.id, branchId: branch2.id, role: Role.MANAGER, isActive: true },
    create: {
      organizationId: org.id,
      branchId: branch2.id,
      name: 'Ferry Salim',
      email: 'manager.pluit@demo.com',
      passwordHash: hashedPassword,
      role: Role.MANAGER,
      isActive: true,
    },
  });

  // STAFF (Branch Kelapa Gading and Branch Pluit)
  const staff1 = await prisma.user.upsert({
    where: { email: 'staff@demo.com' },
    update: { organizationId: org.id, branchId: branch1.id, role: Role.STAFF, isActive: true },
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

  const staff2 = await prisma.user.upsert({
    where: { email: 'staff.pluit@demo.com' },
    update: { organizationId: org.id, branchId: branch2.id, role: Role.STAFF, isActive: true },
    create: {
      organizationId: org.id,
      branchId: branch2.id,
      name: 'Maya Dian',
      email: 'staff.pluit@demo.com',
      passwordHash: hashedPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  // INACTIVE STAFF (Testing disabled account status)
  await prisma.user.upsert({
    where: { email: 'inactive.staff@demo.com' },
    update: { organizationId: org.id, branchId: branch1.id, role: Role.STAFF, isActive: false },
    create: {
      organizationId: org.id,
      branchId: branch1.id,
      name: 'Bambang Sutrisno (Nonaktif)',
      email: 'inactive.staff@demo.com',
      passwordHash: hashedPassword,
      role: Role.STAFF,
      isActive: false,
    },
  });

  // DOCTOR USERS
  const docUser1 = await prisma.user.upsert({
    where: { email: 'doctor.andi@demo.com' },
    update: { organizationId: org.id, branchId: branch1.id, role: Role.DOCTOR, isActive: true },
    create: {
      organizationId: org.id,
      branchId: branch1.id,
      name: 'drg. Andi Pratama',
      email: 'doctor.andi@demo.com',
      passwordHash: hashedPassword,
      role: Role.DOCTOR,
      isActive: true,
    },
  });

  const docUser2 = await prisma.user.upsert({
    where: { email: 'doctor.sarah@demo.com' },
    update: { organizationId: org.id, branchId: branch2.id, role: Role.DOCTOR, isActive: true },
    create: {
      organizationId: org.id,
      branchId: branch2.id,
      name: 'drg. Sarah Amanda',
      email: 'doctor.sarah@demo.com',
      passwordHash: hashedPassword,
      role: Role.DOCTOR,
      isActive: true,
    },
  });

  // ─── 4. DOCTORS & SPECIALTIES ────────────────────────────────────────────────
  console.log('Seeding doctors and specialties...');
  const doctorAndi = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-andi-pratama' } },
    update: {
      name: 'Andi Pratama',
      title: 'drg.',
      specialty: 'Dokter Gigi Umum',
      photoUrl: '/images/doctor-sarah.jpg',
      sipNumber: '503/SIP.012/DPMPTSP/2022',
      strNumber: '31.1.1.100.2.18.123456',
      yearsExperience: 7,
      bio: 'Berpengalaman dalam perawatan gigi preventif, penambalan estetis, dan edukasi kesehatan gigi keluarga.',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Andi Pratama',
      slug: 'dr-andi-pratama',
      title: 'drg.',
      specialty: 'Dokter Gigi Umum',
      photoUrl: '/images/doctor-sarah.jpg',
      sipNumber: '503/SIP.012/DPMPTSP/2022',
      strNumber: '31.1.1.100.2.18.123456',
      yearsExperience: 7,
      bio: 'Berpengalaman dalam perawatan gigi preventif, penambalan estetis, dan edukasi kesehatan gigi keluarga.',
      isActive: true,
    },
  });

  const doctorSarah = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-sarah-amanda' } },
    update: {
      name: 'Sarah Amanda',
      title: 'drg.',
      specialty: 'Sp.KG',
      photoUrl: '/images/doctor-jessica.jpg',
      sipNumber: '503/SIP.045/DPMPTSP/2023',
      strNumber: '31.2.1.200.3.19.654321',
      yearsExperience: 9,
      bio: 'Spesialis Konservasi Gigi fokus pada perawatan saluran akar mikroskopis dan restorasi estetik kompleks.',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Sarah Amanda',
      slug: 'dr-sarah-amanda',
      title: 'drg.',
      specialty: 'Sp.KG',
      photoUrl: '/images/doctor-jessica.jpg',
      sipNumber: '503/SIP.045/DPMPTSP/2023',
      strNumber: '31.2.1.200.3.19.654321',
      yearsExperience: 9,
      bio: 'Spesialis Konservasi Gigi fokus pada perawatan saluran akar mikroskopis dan restorasi estetik kompleks.',
      isActive: true,
    },
  });

  const doctorBudi = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-budi-hartono' } },
    update: {
      name: 'Budi Hartono',
      title: 'drg.',
      specialty: 'Sp.BM',
      photoUrl: '/images/doctor-budi.jpg',
      sipNumber: '503/SIP.078/DPMPTSP/2021',
      strNumber: '31.1.1.300.1.17.789012',
      yearsExperience: 12,
      bio: 'Spesialis Bedah Mulut dan Maksilofasial dengan keahlian odontektomi impaksi gigi bungsu dan implan dental.',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Budi Hartono',
      slug: 'dr-budi-hartono',
      title: 'drg.',
      specialty: 'Sp.BM',
      photoUrl: '/images/doctor-budi.jpg',
      sipNumber: '503/SIP.078/DPMPTSP/2021',
      strNumber: '31.1.1.300.1.17.789012',
      yearsExperience: 12,
      bio: 'Spesialis Bedah Mulut dan Maksilofasial dengan keahlian odontektomi impaksi gigi bungsu dan implan dental.',
      isActive: true,
    },
  });

  const doctorClara = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-clara-shinta' } },
    update: {
      name: 'Clara Shinta',
      title: 'drg.',
      specialty: 'Sp.Ort',
      photoUrl: '/images/doctor-jessica.jpg',
      sipNumber: '503/SIP.099/DPMPTSP/2020',
      strNumber: '31.1.1.400.2.16.456789',
      yearsExperience: 8,
      bio: 'Spesialis Ortodonti berfokus pada perapian gigi menggunakan bracket self-ligating damon dan clear aligner transparan.',
      isActive: true,
    },
    create: {
      organizationId: org.id,
      name: 'Clara Shinta',
      slug: 'dr-clara-shinta',
      title: 'drg.',
      specialty: 'Sp.Ort',
      photoUrl: '/images/doctor-jessica.jpg',
      sipNumber: '503/SIP.099/DPMPTSP/2020',
      strNumber: '31.1.1.400.2.16.456789',
      yearsExperience: 8,
      bio: 'Spesialis Ortodonti berfokus pada perapian gigi menggunakan bracket self-ligating damon dan clear aligner transparan.',
      isActive: true,
    },
  });

  // Inactive doctor
  await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-denny-kurnia' } },
    update: {
      name: 'Denny Kurnia',
      title: 'drg.',
      specialty: 'Sp.KGA',
      yearsExperience: 15,
      bio: 'Dokter Gigi Spesialis Anak (Sedang dalam masa cuti studi luar negeri).',
      isActive: false,
    },
    create: {
      organizationId: org.id,
      name: 'Denny Kurnia',
      slug: 'dr-denny-kurnia',
      title: 'drg.',
      specialty: 'Sp.KGA',
      yearsExperience: 15,
      bio: 'Dokter Gigi Spesialis Anak (Sedang dalam masa cuti studi luar negeri).',
      isActive: false,
    },
  });

  const activeDoctors = [doctorAndi, doctorSarah, doctorBudi, doctorClara];
  const activeBranches = [branch1, branch2, branch3];

  // Map Doctors to Branches & Regular Schedules
  for (const doc of activeDoctors) {
    for (const b of activeBranches) {
      await prisma.branchDoctor.create({
        data: { branchId: b.id, doctorId: doc.id },
      });
    }

    // Branch 1 (Kelapa Gading): Mon, Wed, Fri
    for (const day of [1, 3, 5]) {
      await prisma.schedule.create({
        data: {
          doctorId: doc.id,
          branchId: branch1.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '16:00',
          slotMinutes: 30,
          isActive: true,
        },
      });
    }

    // Branch 2 (Pluit): Tue, Thu, Sat
    for (const day of [2, 4, 6]) {
      await prisma.schedule.create({
        data: {
          doctorId: doc.id,
          branchId: branch2.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotMinutes: 30,
          isActive: true,
        },
      });
    }

    // Branch 3 (Senopati): Sun
    await prisma.schedule.create({
      data: {
        doctorId: doc.id,
        branchId: branch3.id,
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '16:00',
        slotMinutes: 30,
        isActive: true,
      },
    });
  }

  // Schedule Blocks (Doctor Leave & Clinic Maintenance)
  await prisma.scheduleBlock.create({
    data: {
      doctorId: doctorSarah.id,
      branchId: branch2.id,
      startAt: wibDate(1, 9, 0),
      endAt: wibDate(1, 17, 0),
      reason: 'Cuti Workshop Endodontik Nasional',
    },
  });

  await prisma.scheduleBlock.create({
    data: {
      doctorId: doctorBudi.id,
      branchId: branch1.id,
      startAt: wibDate(3, 13, 0),
      endAt: wibDate(3, 17, 0),
      reason: 'Sterilisasi Ruang Bedah & Kalibrasi Unit 2',
    },
  });

  // ─── 5. SERVICES (ACTIVE & INACTIVE) ─────────────────────────────────────────
  console.log('Seeding clinical services...');
  const servicesData = [
    {
      name: 'Pembersihan Gigi (Scaling Ultrasonic)',
      slug: 'pembersihan-gigi',
      description: 'Perawatan pembersihan karang gigi dan plak membandel dengan teknologi piezo-ultrasonic bebas ngilu untuk menjaga gusi sehat dan nafas segar.',
      imageUrl: '/images/service-scaling.jpg',
      price: 350000,
      durationMin: 45,
      sortOrder: 1,
      seoTitle: 'Pencegahan',
      seoDescription: 'Pembersihan karang gigi ultrasonik bebas ngilu untuk menjaga gusi sehat dan nafas segar.',
      isActive: true,
    },
    {
      name: 'Penambalan Gigi Estetis Komposit',
      slug: 'penambalan-gigi',
      description: 'Restorasi gigi berlubang atau patah menggunakan material nano-hybrid komposit buatan Jerman sewarna gigi asli untuk kekuatan dan estetika maksimal.',
      imageUrl: '/images/clinic-room.jpg',
      price: 550000,
      durationMin: 60,
      sortOrder: 2,
      seoTitle: 'Restorasi',
      seoDescription: 'Tambal gigi berlubang sewarna gigi asli dengan komposit nano-hybrid tahan lama.',
      isActive: true,
    },
    {
      name: 'Pemutihan Gigi Profesional (Bleaching)',
      slug: 'pemutihan-gigi',
      description: 'Prosedur pemutihan gigi in-office dengan teknologi cold-light LED untuk mencerahkan warna gigi hingga 6-8 tingkat dalam satu sesi 60 menit.',
      imageUrl: '/images/service-bleaching.jpg',
      price: 1800000,
      durationMin: 60,
      sortOrder: 3,
      seoTitle: 'Estetika',
      seoDescription: 'Pemutihan gigi profesional hingga 8 tingkat lebih cerah dalam satu kunjungan 60 menit.',
      isActive: true,
    },
    {
      name: 'Cabut Gigi & Odontektomi Gigi Bungsu',
      slug: 'cabut-gigi',
      description: 'Pencabutan gigi serta operasi minor gigi bungsu impaksi oleh dokter spesialis bedah mulut dengan teknik minimal invasif dan anestesi lokal aman.',
      imageUrl: '/images/promo-implant.jpg',
      price: 750000,
      durationMin: 45,
      sortOrder: 4,
      seoTitle: 'Bedah Mulut',
      seoDescription: 'Operasi minor pencabutan gigi bungsu impaksi oleh Spesialis Bedah Mulut berpengalaman.',
      isActive: true,
    },
    {
      name: 'Konsultasi & Pemeriksaan Gigi',
      slug: 'konsultasi',
      description: 'Pemeriksaan rongga mulut menyeluruh menggunakan kamera intraoral beresolusi tinggi disertai konsultasi mendalam bersama dokter spesialis.',
      imageUrl: '/images/promo-whitening.jpg',
      price: 150000,
      durationMin: 30,
      sortOrder: 5,
      seoTitle: 'Pencegahan',
      seoDescription: 'Pemeriksaan komprehensif rongga mulut dan perumusan rencana perawatan gigi personal.',
      isActive: true,
    },
    {
      name: 'Implan Gigi Titanium Presisi',
      slug: 'implan-gigi',
      description: 'Pemasangan implan dental titanium biokompatibel untuk menggantikan akar gigi yang hilang dengan stabilitas jangka panjang dan penampilan alami.',
      imageUrl: '/images/promo-implant.jpg',
      price: 12000000,
      durationMin: 90,
      sortOrder: 6,
      seoTitle: 'Bedah Mulut',
      seoDescription: 'Solusi permanen penggantian gigi hilang dengan implan titanium grade medis internasional.',
      isActive: true,
    },
    {
      name: 'Pasang Kawat Gigi Ortodonti Metal',
      slug: 'kawat-gigi',
      description: 'Pemasangan bracket behel metal presisi tinggi untuk merapikan susunan gigi dan memperbaiki relasi gigitan oklusi ideal.',
      imageUrl: '/images/clinic-room.jpg',
      price: 6500000,
      durationMin: 90,
      sortOrder: 7,
      seoTitle: 'Ortodonti',
      seoDescription: 'Perawatan kawat gigi ortodonti oleh dokter spesialis ortodonti berpengalaman.',
      isActive: true,
    },
    {
      name: 'Perawatan Saluran Akar (Endodontik)',
      slug: 'saluran-akar',
      description: 'Sterilisasi dan pengisian saluran akar gigi terinfeksi menggunakan rotary instrument dan dental microscope untuk mempertahankan gigi asli.',
      imageUrl: '/images/service-scaling.jpg',
      price: 1200000,
      durationMin: 60,
      sortOrder: 8,
      seoTitle: 'Konservasi Gigi',
      seoDescription: 'Perawatan saluran akar tanpa sakit untuk mempertahankan gigi berlubang dalam.',
      isActive: true,
    },
    // Inactive service
    {
      name: 'Terapi Sel Punca Pulpa (Uji Klinis)',
      slug: 'terapi-sel-punca',
      description: 'Layanan terapi regeneratif biologi pulpa yang masih dalam tahap studi klinis.',
      imageUrl: '/images/clinic-room.jpg',
      price: 25000000,
      durationMin: 120,
      sortOrder: 9,
      seoTitle: 'Riset',
      seoDescription: 'Prosedur eksperimental kedokteran gigi regeneratif.',
      isActive: false,
    },
  ];

  const serviceMap = new Map<string, any>();
  for (const s of servicesData) {
    const created = await prisma.service.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: s.slug } },
      update: { ...s },
      create: { organizationId: org.id, ...s },
    });
    serviceMap.set(s.slug, created);
  }

  // ─── 6. INSURANCE PARTNERS (ACTIVE & INACTIVE) ────────────────────────────────
  console.log('Seeding insurance partners...');
  const insurersData = [
    {
      name: 'AdMedika',
      slug: 'admedika',
      coverageDetails: 'Klaim rawat jalan gigi cashless dan reimbursement terintegrasi jaringan Third Party Administrator AdMedika.',
      claimProcess: 'Tunjukkan kartu fisik atau e-card AdMedika di meja resepsionis untuk verifikasi instan via web portal.',
      isActive: true,
    },
    {
      name: 'Prudential',
      slug: 'prudential',
      coverageDetails: 'Perlindungan rawat jalan gigi dan tindakan bedah mulut sesuai plafon polis PRUHospital & Surgical.',
      claimProcess: 'Swipe kartu asuransi Prudential di mesin EDC kasir klinik untuk pemrosesan cashless langsung.',
      isActive: true,
    },
    {
      name: 'BCA Life',
      slug: 'bca-life',
      coverageDetails: 'Cakupan perawatan gigi preventif, penambalan komposit, dan pembersihan karang gigi berkala.',
      claimProcess: 'Verifikasi nomor kepesertaan BCA Life di kasir dengan menunjukkan kartu identitas resmi.',
      isActive: true,
    },
    {
      name: 'Mandiri Inhealth',
      slug: 'mandiri-inhealth',
      coverageDetails: 'Fasilitas cashless perawatan gigi bagi pemegang kartu Mandiri Inhealth Silver, Gold, dan Platinum.',
      claimProcess: 'Gesek kartu Mandiri Inhealth pada terminal EDC atau konfirmasi digital via aplikasi.',
      isActive: true,
    },
    {
      name: 'Sinarmas',
      slug: 'sinarmas',
      coverageDetails: 'Jaminan menyeluruh rawat jalan gigi dan perawatan darurat untuk pemegang polis Simas Sehat.',
      claimProcess: 'Tunjukkan kartu kepesertaan Sinarmas MSIG untuk cetak surat jaminan perawatan instan.',
      isActive: true,
    },
    // Inactive insurance partner
    {
      name: 'BPJS Kesehatan',
      slug: 'bpjs-kesehatan',
      coverageDetails: 'Jaminan kesehatan nasional BPJS (Belum terintegrasi sebagai faskes primer klinik).',
      claimProcess: 'Belum melayani klaim langsung BPJS Kesehatan di klinik swasta ini.',
      isActive: false,
    },
  ];

  const insurerMap = new Map<string, any>();
  for (const ins of insurersData) {
    const created = await prisma.insurancePartner.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: ins.slug } },
      update: { ...ins },
      create: { organizationId: org.id, ...ins },
    });
    insurerMap.set(ins.slug, created);
  }

  // ─── 7. PATIENTS (WITH CONSENT, VARIATIONS & SOFT-DELETED) ───────────────────
  console.log('Seeding patients with full consent and status variations...');
  const patientPool = [
    { name: 'Sarah Wijaya', phone: '08111111111', email: 'sarah.w@example.com', dob: new Date('1992-05-14'), notes: 'Riwayat gusi sensitif.' },
    { name: 'Budi Santoso', phone: '08222222222', email: 'budi.s@example.com', dob: new Date('1988-11-20'), notes: 'Pemeriksaan rutin enam bulanan.' },
    { name: 'Rina Kartika', phone: '08333333333', email: 'rina.k@example.com', dob: new Date('1995-02-08'), notes: 'Tambalan lama mulai goyang.' },
    { name: 'Anton Prabowo', phone: '08444444444', email: 'anton.p@example.com', dob: new Date('1985-09-17'), notes: 'Gigi bungsu bawah kanan sering ngilu.' },
    { name: 'Jessica Wong', phone: '08555555555', email: 'jessica.w@example.com', dob: new Date('1998-03-25'), notes: 'Ingin bleaching sebelum acara pernikahan.' },
    { name: 'Michael Tan', phone: '08666666666', email: 'michael.t@example.com', dob: new Date('1990-07-30'), notes: 'Konsultasi pemasangan implan gigi geraham.' },
    { name: 'Hendra Gunawan', phone: '08777777777', email: 'hendra.g@example.com', dob: new Date('1982-12-05'), notes: 'Perokok aktif, karang gigi cukup tebal.' },
    { name: 'Dewi Lestari', phone: '08123456701', email: 'dewi.l@example.com', dob: new Date('1994-08-19'), notes: 'Alergi terhadap antibiotik amoxicillin.' },
    { name: 'Agus Setiawan', phone: '08123456702', email: 'agus.s@example.com', dob: new Date('1986-04-12'), notes: 'Alergi latex ringan.' },
    { name: 'Maya Anggraini', phone: '08123456703', email: 'maya.a@example.com', dob: new Date('1997-01-22'), notes: 'Pasien ortodonti kontrol rutin.' },
    { name: 'Hendro Kusumo', phone: '08123456704', email: 'hendro.k@example.com', dob: new Date('1979-06-15'), notes: 'Hipertensi terkontrol.' },
    { name: 'Ratna Paramita', phone: '08123456705', email: 'ratna.p@example.com', dob: new Date('1993-10-10'), notes: 'Ibu hamil trimester kedua.' },
    { name: 'Bambang Soediro', phone: '08123456706', email: 'bambang.sd@example.com', dob: new Date('1975-03-18'), notes: 'Pasien geriatri.' },
    { name: 'Farah Quinn', phone: '08123456707', email: 'farah.q@example.com', dob: new Date('1991-09-02'), notes: 'Estetika veneer.' },
    { name: 'Pasien Walk-in Anonim', phone: '08199999991', email: null, dob: null, notes: 'Pasien darurat sakit gigi datang langsung tanpa reservasi.' },
    // Soft-deleted patient
    { name: 'Pasien Berhenti Berlangganan', phone: '08199999992', email: 'deleted@example.com', dob: new Date('1980-01-01'), notes: 'Akun pasien ditutup atas permintaan PDP.', deletedAt: new Date(Date.now() - 7 * 86_400_000) },
  ];

  const patientMap = new Map<string, any>();
  for (const p of patientPool) {
    const created = await prisma.patient.upsert({
      where: { organizationId_phone: { organizationId: org.id, phone: p.phone } },
      update: {
        name: p.name,
        email: p.email,
        dob: p.dob,
        notes: p.notes,
        consentedAt: new Date(),
        consentIp: '127.0.0.1',
        deletedAt: p.deletedAt || null,
      },
      create: {
        organizationId: org.id,
        name: p.name,
        phone: p.phone,
        email: p.email,
        dob: p.dob,
        notes: p.notes,
        consentedAt: new Date(),
        consentIp: '127.0.0.1',
        deletedAt: p.deletedAt || null,
      },
    });
    patientMap.set(p.phone, created);
  }

  // ─── 8. APPOINTMENTS (ALL 5 AppointmentStatus VALUES + VARIATIONS) ───────────
  console.log('Seeding appointments across all 5 statuses (CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW)...');

  // Today Appointments (Kelapa Gading - Branch 1)
  // Ensure the earliest appointment is CONFIRMED for E2E Receptionist check-in / complete workflow
  const aptTodayConfirmed1 = await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08111111111').id,
      patientName: 'Sarah Wijaya',
      patientPhone: '08111111111',
      service: 'Pembersihan Gigi (Scaling Ultrasonic)',
      reasonForVisit: 'Pembersihan karang gigi rutin.',
      status: AppointmentStatus.CONFIRMED,
      scheduledAt: wibDate(0, 9, 0),
      walkin: false,
      reminderSentAt: wibDate(-1, 10, 0),
      reminder2hSentAt: wibDate(0, 7, 0),
      cancelToken: 'token-cancel-sarah-1',
    },
  });

  const aptTodayCheckedIn1 = await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08222222222').id,
      patientName: 'Budi Santoso',
      patientPhone: '08222222222',
      service: 'Konsultasi & Pemeriksaan Gigi',
      reasonForVisit: 'Konsultasi ngilu gigi belakang.',
      status: AppointmentStatus.CHECKED_IN,
      scheduledAt: wibDate(0, 9, 30),
      checkInAt: wibDate(0, 9, 15),
      walkin: false,
      cancelToken: 'token-cancel-budi-2',
    },
  });

  const aptTodayCompleted1 = await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08333333333').id,
      patientName: 'Rina Kartika',
      patientPhone: '08333333333',
      service: 'Penambalan Gigi Estetis Komposit',
      reasonForVisit: 'Tambal gigi berlubang.',
      status: AppointmentStatus.COMPLETED,
      scheduledAt: wibDate(0, 8, 0),
      checkInAt: wibDate(0, 7, 50),
      walkin: false,
      cancelToken: 'token-cancel-rina-3',
    },
  });

  // Create associated Visit for completed appointment
  await prisma.visit.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08333333333').id,
      appointmentId: aptTodayCompleted1.id,
      serviceId: serviceMap.get('penambalan-gigi').id,
      paymentAmount: 550000,
      paymentMethod: 'QRIS',
      notes: 'Penambalan kelas I komposit pada gigi 46 tuntas tanpa komplikasi.',
      createdAt: wibDate(0, 8, 45),
    },
  });

  // CANCELLED status with cancelledAt and reason
  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorBudi.id,
      patientId: patientMap.get('08444444444').id,
      patientName: 'Anton Prabowo',
      patientPhone: '08444444444',
      service: 'Cabut Gigi & Odontektomi Gigi Bungsu',
      reasonForVisit: 'Operasi gigi bungsu impaksi.',
      status: AppointmentStatus.CANCELLED,
      scheduledAt: wibDate(0, 10, 30),
      cancelledAt: wibDate(0, 7, 30),
      cancelToken: 'token-cancel-anton-4',
      walkin: false,
    },
  });

  // NO_SHOW status
  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorClara.id,
      patientId: patientMap.get('08555555555').id,
      patientName: 'Jessica Wong',
      patientPhone: '08555555555',
      service: 'Pasang Kawat Gigi Ortodonti Metal',
      reasonForVisit: 'Konsultasi pasang behel.',
      status: AppointmentStatus.NO_SHOW,
      scheduledAt: wibDate(0, 8, 30),
      walkin: false,
      cancelToken: 'token-cancel-jessica-5',
    },
  });

  // Walk-in appointment (walkin: true) with insurance partner
  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08199999991').id,
      patientName: 'Pasien Walk-in Anonim',
      patientPhone: '08199999991',
      service: 'Pembersihan Gigi (Scaling Ultrasonic)',
      reasonForVisit: 'Pembersihan karang gigi darurat.',
      insurancePartnerId: insurerMap.get('admedika').id,
      status: AppointmentStatus.CONFIRMED,
      scheduledAt: wibDate(0, 14, 0),
      walkin: true,
    },
  });

  // Today Appointments (Pluit - Branch 2)
  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      doctorId: doctorSarah.id,
      patientId: patientMap.get('08666666666').id,
      patientName: 'Michael Tan',
      patientPhone: '08666666666',
      service: 'Pemutihan Gigi Profesional (Bleaching)',
      status: AppointmentStatus.CONFIRMED,
      scheduledAt: wibDate(0, 11, 0),
      walkin: false,
      insurancePartnerId: insurerMap.get('prudential').id,
      cancelToken: 'token-cancel-michael-6',
    },
  });

  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      doctorId: doctorSarah.id,
      patientId: patientMap.get('08777777777').id,
      patientName: 'Hendra Gunawan',
      patientPhone: '08777777777',
      service: 'Pembersihan Gigi (Scaling Ultrasonic)',
      status: AppointmentStatus.CHECKED_IN,
      scheduledAt: wibDate(0, 15, 30),
      checkInAt: wibDate(0, 15, 10),
      walkin: false,
      cancelToken: 'token-cancel-hendra-7',
    },
  });

  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      doctorId: doctorBudi.id,
      patientId: patientMap.get('08123456701').id,
      patientName: 'Dewi Lestari',
      patientPhone: '08123456701',
      service: 'Cabut Gigi & Odontektomi Gigi Bungsu',
      status: AppointmentStatus.COMPLETED,
      scheduledAt: wibDate(0, 9, 30),
      checkInAt: wibDate(0, 9, 20),
      walkin: false,
      cancelToken: 'token-cancel-dewi-8',
    },
  });

  // Future Appointments (Tomorrow & 2 Days Ahead)
  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08123456702').id,
      patientName: 'Agus Setiawan',
      patientPhone: '08123456702',
      service: 'Penambalan Gigi Estetis Komposit',
      status: AppointmentStatus.CONFIRMED,
      scheduledAt: wibDate(1, 10, 0),
      walkin: false,
      cancelToken: 'token-cancel-agus-9',
    },
  });

  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      doctorId: doctorSarah.id,
      patientId: patientMap.get('08123456703').id,
      patientName: 'Maya Anggraini',
      patientPhone: '08123456703',
      service: 'Perawatan Saluran Akar (Endodontik)',
      status: AppointmentStatus.CONFIRMED,
      scheduledAt: wibDate(2, 14, 0),
      walkin: false,
      cancelToken: 'token-cancel-maya-10',
    },
  });

  // Past Historical Appointments (for No-show rate and analytics calculations)
  for (let d = 1; d <= 14; d++) {
    // Past completed
    const pastCompletedApt = await prisma.appointment.create({
      data: {
        organizationId: org.id,
        branchId: d % 2 === 0 ? branch1.id : branch2.id,
        doctorId: d % 2 === 0 ? doctorAndi.id : doctorSarah.id,
        patientId: patientMap.get('08123456704').id,
        patientName: 'Hendro Kusumo',
        patientPhone: '08123456704',
        service: 'Pembersihan Gigi (Scaling Ultrasonic)',
        status: AppointmentStatus.COMPLETED,
        scheduledAt: wibDate(-d, 10, 0),
        checkInAt: wibDate(-d, 9, 50),
        walkin: false,
      },
    });

    await prisma.visit.create({
      data: {
        organizationId: org.id,
        branchId: d % 2 === 0 ? branch1.id : branch2.id,
        doctorId: d % 2 === 0 ? doctorAndi.id : doctorSarah.id,
        patientId: patientMap.get('08123456704').id,
        appointmentId: pastCompletedApt.id,
        serviceId: serviceMap.get('pembersihan-gigi').id,
        paymentAmount: 350000,
        paymentMethod: d % 3 === 0 ? 'INSURANCE' : d % 2 === 0 ? 'QRIS' : 'DEBIT',
        notes: 'Pembersihan karang gigi rutin berkala tuntas.',
        createdAt: wibDate(-d, 10, 45),
      },
    });

    // Past No-Show (1 every 5 days)
    if (d % 5 === 0) {
      await prisma.appointment.create({
        data: {
          organizationId: org.id,
          branchId: branch1.id,
          doctorId: doctorBudi.id,
          patientId: patientMap.get('08123456705').id,
          patientName: 'Ratna Paramita',
          patientPhone: '08123456705',
          service: 'Konsultasi & Pemeriksaan Gigi',
          status: AppointmentStatus.NO_SHOW,
          scheduledAt: wibDate(-d, 14, 0),
          walkin: false,
        },
      });
    }

    // Past Cancelled (1 every 6 days)
    if (d % 6 === 0) {
      await prisma.appointment.create({
        data: {
          organizationId: org.id,
          branchId: branch2.id,
          doctorId: doctorSarah.id,
          patientId: patientMap.get('08123456706').id,
          patientName: 'Bambang Soediro',
          patientPhone: '08123456706',
          service: 'Pemutihan Gigi Profesional (Bleaching)',
          status: AppointmentStatus.CANCELLED,
          scheduledAt: wibDate(-d, 15, 0),
          cancelledAt: wibDate(-d, 9, 0),
          cancelToken: `token-cancel-past-${d}`,
          walkin: false,
        },
      });
    }
  }

  // ─── 9. SHIFTS (ALL 4 shiftType VALUES: PAGI, SIANG, FULLDAY, CUSTOM) ──────
  console.log('Seeding weekly shifts across all shift types...');
  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysSinceMonday = (utcDay + 6) % 7;

  // Generate complete week (Monday to Sunday)
  for (let i = 0; i < 7; i++) {
    const shiftDate = wibStartOfDay(i - daysSinceMonday);

    // Manager 1 (Kelapa Gading) - PAGI (08:00 - 15:00)
    const mShift = await prisma.shift.create({
      data: {
        branchId: branch1.id,
        userId: manager1.id,
        date: shiftDate,
        startTime: '08:00',
        endTime: '15:00',
        shiftType: 'PAGI',
        notes: 'Shift Pagi Manager Klinik',
      },
    });

    // Staff 1 (Kelapa Gading) - SIANG (14:00 - 21:00)
    const sShift = await prisma.shift.create({
      data: {
        branchId: branch1.id,
        userId: staff1.id,
        date: shiftDate,
        startTime: '14:00',
        endTime: '21:00',
        shiftType: 'SIANG',
        notes: 'Shift Siang Staff Front Office',
      },
    });

    // Staff 2 (Pluit) - FULLDAY (09:00 - 20:00 on Weekends) or CUSTOM (10:00 - 16:00 on Weekdays)
    const isWeekend = i >= 5;
    await prisma.shift.create({
      data: {
        branchId: branch2.id,
        userId: staff2.id,
        date: shiftDate,
        startTime: isWeekend ? '09:00' : '10:00',
        endTime: isWeekend ? '20:00' : '16:00',
        shiftType: isWeekend ? 'FULLDAY' : 'CUSTOM',
        notes: isWeekend ? 'Shift Fullday Weekend Duty' : 'Shift Custom Training & Sterilisasi',
      },
    });

    // ─── 10. ATTENDANCE (ALL 4 AttendanceStatus: ON_TIME, LATE, EARLY_LEAVE, PRESENT)
    // If today: seed live attendance records
    if (i === daysSinceMonday) {
      // Manager 1: ON_TIME (Clocked in early at 07:55 for 08:00 shift)
      await prisma.attendanceRecord.create({
        data: {
          branchId: branch1.id,
          userId: manager1.id,
          shiftId: mShift.id,
          date: shiftDate,
          clockInAt: wibDate(0, 7, 55),
          status: AttendanceStatus.ON_TIME,
          notes: 'Hadir tepat waktu sebelum briefing pagi.',
        },
      });

      // Staff 1: PRESENT (Clocked in at 13:58 for 14:00 shift, currently on duty)
      await prisma.attendanceRecord.create({
        data: {
          branchId: branch1.id,
          userId: staff1.id,
          shiftId: sShift.id,
          date: shiftDate,
          clockInAt: wibDate(0, 13, 58),
          status: AttendanceStatus.PRESENT,
          notes: 'Sedang bertugas di meja resepsionis.',
        },
      });
    } else if (i < daysSinceMonday) {
      // Past days in current week:
      // Day 0: LATE (Clocked in at 08:24 for 08:00 shift)
      if (i === 0) {
        await prisma.attendanceRecord.create({
          data: {
            branchId: branch1.id,
            userId: manager1.id,
            shiftId: mShift.id,
            date: shiftDate,
            clockInAt: wibDate(i - daysSinceMonday, 8, 24),
            clockOutAt: wibDate(i - daysSinceMonday, 15, 5),
            status: AttendanceStatus.LATE,
            notes: 'Terlambat akibat kendala kemacetan jalan tol.',
          },
        });
      }
      // Day 1: EARLY_LEAVE (Clocked in on time, clocked out at 13:30 due to headache)
      else if (i === 1) {
        await prisma.attendanceRecord.create({
          data: {
            branchId: branch1.id,
            userId: manager1.id,
            shiftId: mShift.id,
            date: shiftDate,
            clockInAt: wibDate(i - daysSinceMonday, 7, 58),
            clockOutAt: wibDate(i - daysSinceMonday, 13, 30),
            status: AttendanceStatus.EARLY_LEAVE,
            notes: 'Izin pulang lebih awal sakit demam tinggi.',
          },
        });
      } else {
        // Standard ON_TIME
        await prisma.attendanceRecord.create({
          data: {
            branchId: branch1.id,
            userId: manager1.id,
            shiftId: mShift.id,
            date: shiftDate,
            clockInAt: wibDate(i - daysSinceMonday, 7, 52),
            clockOutAt: wibDate(i - daysSinceMonday, 15, 10),
            status: AttendanceStatus.ON_TIME,
            notes: 'Hadir dan pulang sesuai jadwal reguler.',
          },
        });
      }
    }
    // Future days (i > daysSinceMonday): shift exists with no attendance record (Absent / Scheduled)
  }

  // ─── 11. INVENTORY ITEMS (NORMAL, LOW STOCK, OUT OF STOCK) ───────────────────
  console.log('Seeding inventory across categories, stock levels (Normal, Menipis, Habis)...');

  // Kelapa Gading Inventory Items
  const kgInventory = [
    // Anestesi & Farmasi
    { n: 'Lidocaine HCl 2% + Epinephrine', s: 'MED-LIDO-01', st: 8, ms: 20, u: 'ampul', c: 'Anestesi & Farmasi' }, // Low Stock
    { n: 'Mepivacaine 3% Non-Vasoconstrictor', s: 'MED-MEPI-02', st: 25, ms: 15, u: 'ampul', c: 'Anestesi & Farmasi' }, // Normal Stock
    { n: 'Amoxicillin 500mg Kaplet', s: 'MED-AMOX-03', st: 50, ms: 30, u: 'strip', c: 'Anestesi & Farmasi' }, // Normal Stock
    { n: 'Asam Mefenamat 500mg', s: 'MED-MEFE-04', st: 0, ms: 20, u: 'strip', c: 'Anestesi & Farmasi' }, // Out of Stock
    // Bahan Tambal & Restorasi
    { n: 'Composite Resin Filtek Z250 A2', s: 'MAT-COMP-A2', st: 6, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' }, // Normal Stock
    { n: 'Bonding Agent Universal Single Bond', s: 'MAT-BOND-01', st: 2, ms: 4, u: 'botol', c: 'Bahan Tambal & Restorasi' }, // Low Stock
    { n: 'Etching Gel Phosphoric 37%', s: 'MAT-ETCH-01', st: 12, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' }, // Normal Stock
    { n: 'Glass Ionomer Cement Fuji IX', s: 'MAT-GIC-01', st: 0, ms: 3, u: 'kotak', c: 'Bahan Tambal & Restorasi' }, // Out of Stock
    // Habis Pakai & Sterilisasi
    { n: 'Dental Needle 30G Short Terumo', s: 'DISP-NDL-30', st: 150, ms: 50, u: 'pcs', c: 'Habis Pakai & Sterilisasi' }, // Normal Stock
    { n: 'Latex Examination Gloves M', s: 'DISP-GLV-M', st: 0, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' }, // Out of Stock
    { n: 'Latex Examination Gloves S', s: 'DISP-GLV-S', st: 4, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' }, // Low Stock
    { n: 'Masker Medis 3-Ply Earloop', s: 'DISP-MASK-01', st: 20, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' }, // Normal Stock
    { n: 'Pouch Sterilisasi Autoclave 90x230mm', s: 'STER-PCH-01', st: 80, ms: 30, u: 'pcs', c: 'Habis Pakai & Sterilisasi' }, // Normal Stock
    // Ortodonti
    { n: 'Bracket Metal MBT 0.022 Kit', s: 'ORTH-BRK-01', st: 15, ms: 10, u: 'set', c: 'Ortodonti' }, // Normal Stock
    { n: 'Niti Archwire 0.014 Upper', s: 'ORTH-WIRE-01', st: 30, ms: 20, u: 'pcs', c: 'Ortodonti' }, // Normal Stock
    { n: 'Power Chain Elastomeric Gray', s: 'ORTH-CHN-01', st: 1, ms: 5, u: 'roll', c: 'Ortodonti' }, // Low Stock
    // Instrumen Bedah
    { n: 'Blade Bisturi No. 15', s: 'SURG-BLD-15', st: 45, ms: 25, u: 'pcs', c: 'Instrumen Bedah' }, // Normal Stock
    { n: 'Benang Jahit Silk 3-0 Non-Absorbable', s: 'SURG-SLK-30', st: 2, ms: 8, u: 'pcs', c: 'Instrumen Bedah' }, // Low Stock
    { n: 'Gelatamp Hemostatic Sponge', s: 'SURG-HEMO-01', st: 0, ms: 5, u: 'jar', c: 'Instrumen Bedah' }, // Out of Stock
    // Peralatan & Aksesoris
    { n: 'Saliva Ejector Disposable', s: 'ACC-SAL-01', st: 200, ms: 50, u: 'pcs', c: 'Peralatan & Aksesoris' }, // Normal Stock
  ];

  const firstKgItem = await prisma.inventoryItem.create({
    data: {
      branchId: branch1.id,
      name: kgInventory[0].n,
      sku: kgInventory[0].s,
      stock: kgInventory[0].st,
      minStock: kgInventory[0].ms,
      unit: kgInventory[0].u,
      category: kgInventory[0].c,
    },
  });

  // ─── 12. INVENTORY LOGS (ALL 4 InventoryLogType: RESTOCK, USAGE, ADJUSTMENT, DAMAGED)
  // Seed all 4 log types on the first item to ensure log drawer timeline is fully populated
  await prisma.inventoryLog.create({
    data: {
      itemId: firstKgItem.id,
      userId: manager1.id,
      type: InventoryLogType.RESTOCK,
      quantity: 15,
      previousStock: 0,
      currentStock: 15,
      notes: 'Penerimaan stok dari distributor PT Medika Farma.',
      createdAt: wibDate(-2, 10, 0),
    },
  });

  await prisma.inventoryLog.create({
    data: {
      itemId: firstKgItem.id,
      userId: staff1.id,
      type: InventoryLogType.USAGE,
      quantity: 5,
      previousStock: 15,
      currentStock: 10,
      notes: 'Pemakaian tindakan anestesi lokal bedah minor.',
      createdAt: wibDate(-1, 14, 30),
    },
  });

  await prisma.inventoryLog.create({
    data: {
      itemId: firstKgItem.id,
      userId: manager1.id,
      type: InventoryLogType.DAMAGED,
      quantity: 2,
      previousStock: 10,
      currentStock: 8,
      notes: 'Ampul retak pecah saat proses pemindahan penyimpanan.',
      createdAt: wibDate(0, 9, 15), // Today mutation
    },
  });

  await prisma.inventoryLog.create({
    data: {
      itemId: firstKgItem.id,
      userId: manager1.id,
      type: InventoryLogType.ADJUSTMENT,
      quantity: 0,
      previousStock: 8,
      currentStock: 8,
      notes: 'Verifikasi stok fisik opname mingguan cocok.',
      createdAt: wibDate(0, 11, 0), // Today mutation
    },
  });

  // Create remaining Kelapa Gading items
  for (let i = 1; i < kgInventory.length; i++) {
    const d = kgInventory[i];
    const createdItem = await prisma.inventoryItem.create({
      data: {
        branchId: branch1.id,
        name: d.n,
        sku: d.s,
        stock: d.st,
        minStock: d.ms,
        unit: d.u,
        category: d.c,
      },
    });

    // Create a initial RESTOCK log
    await prisma.inventoryLog.create({
      data: {
        itemId: createdItem.id,
        userId: manager1.id,
        type: InventoryLogType.RESTOCK,
        quantity: d.st,
        previousStock: 0,
        currentStock: d.st,
        notes: 'Stok awal setup sistem klinik.',
        createdAt: wibDate(-3, 8, 0),
      },
    });
  }

  // Pluit Branch Inventory Items
  const pluitInventory = [
    { n: 'Lidocaine HCl 2% + Epinephrine', s: 'MED-LIDO-PLU', st: 18, ms: 15, u: 'ampul', c: 'Anestesi & Farmasi' },
    { n: 'Composite Resin Filtek Z250 A3', s: 'MAT-COMP-A3', st: 8, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' },
    { n: 'Dental Needle 30G Short', s: 'DISP-NDL-PLU', st: 120, ms: 40, u: 'pcs', c: 'Habis Pakai & Sterilisasi' },
    { n: 'Latex Examination Gloves S', s: 'DISP-GLV-S-PLU', st: 3, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' }, // Low stock
    { n: 'Etching Gel 37%', s: 'MAT-ETCH-PLU', st: 0, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' }, // Out of stock
    { n: 'Bracket Metal MBT 0.022 Kit', s: 'ORTH-BRK-PLU', st: 9, ms: 6, u: 'set', c: 'Ortodonti' },
  ];

  for (const d of pluitInventory) {
    const item = await prisma.inventoryItem.create({
      data: {
        branchId: branch2.id,
        name: d.n,
        sku: d.s,
        stock: d.st,
        minStock: d.ms,
        unit: d.u,
        category: d.c,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        itemId: item.id,
        userId: manager2.id,
        type: InventoryLogType.RESTOCK,
        quantity: d.st,
        previousStock: 0,
        currentStock: d.st,
        notes: 'Pengiriman stok dari gudang logistik pusat.',
        createdAt: wibDate(-1, 10, 0),
      },
    });
  }

  // ─── 13. APPROVAL REQUESTS (ALL 3 TYPES x ALL 3 STATUSES = 9 COMBINATIONS) ───
  console.log('Seeding approval requests across all types (PROCUREMENT, MAINTENANCE, OTHER) and statuses (PENDING, APPROVED, REJECTED)...');

  // 1. PROCUREMENT + PENDING
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      requestedById: staff1.id,
      type: ApprovalType.PROCUREMENT,
      status: ApprovalStatus.PENDING,
      payload: {
        title: 'Pengadaan Darurat Anestesi Lidocaine 2%',
        itemId: firstKgItem.id,
        itemName: firstKgItem.name,
        category: firstKgItem.category,
        currentStock: firstKgItem.stock,
        minStock: firstKgItem.minStock,
        unit: firstKgItem.unit,
        quantity: 30,
        estimatedCost: 450000,
        urgency: 'URGENT',
        notes: 'Stok menipis di bawah ambang batas minimum dan jadwal operasi minggu ini padat.',
      },
    },
  });

  // 2. PROCUREMENT + APPROVED
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      requestedById: staff1.id,
      type: ApprovalType.PROCUREMENT,
      status: ApprovalStatus.APPROVED,
      reviewNote: 'Disetujui. PO telah diterbitkan ke distributor resmi.',
      payload: {
        title: 'Pengadaan Sarung Tangan Latex M & Masker',
        itemName: 'Latex Gloves M & Masker Medis',
        category: 'Habis Pakai & Sterilisasi',
        quantity: 15,
        estimatedCost: 650000,
        urgency: 'NORMAL',
        notes: 'Pengadaan berkala perlengkapan APD klinis.',
      },
    },
  });

  // 3. PROCUREMENT + REJECTED
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      requestedById: staff2.id,
      type: ApprovalType.PROCUREMENT,
      status: ApprovalStatus.REJECTED,
      reviewNote: 'Ditolak. Spesifikasi tidak sesuai standar klinis dan melebihi batas anggaran bulanan.',
      payload: {
        title: 'Pengadaan Dental Loupes 3.5x Ergonomis',
        itemName: 'Dental Loupes Titanium Frame',
        category: 'Peralatan & Aksesoris',
        quantity: 2,
        estimatedCost: 8500000,
        urgency: 'LOW',
        notes: 'Permintaan penambahan alat pembesar klinis.',
      },
    },
  });

  // 4. MAINTENANCE + PENDING
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      requestedById: staff2.id,
      type: ApprovalType.MAINTENANCE,
      status: ApprovalStatus.PENDING,
      payload: {
        title: 'Kalibrasi Autoclave & Uji Spora Rutin',
        equipmentName: 'Autoclave B-Class Ruang Sterilisasi',
        urgency: 'NORMAL',
        estimatedCost: 750000,
        description: 'Jadwal kalibrasi sertifikasi tahunan alat sterilisasi uap bertekanan.',
      },
    },
  });

  // 5. MAINTENANCE + APPROVED
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      requestedById: staff1.id,
      type: ApprovalType.MAINTENANCE,
      status: ApprovalStatus.APPROVED,
      reviewNote: 'Disetujui. Teknisi vendor dijadwalkan visit besok pagi.',
      payload: {
        title: 'Perbaikan Selang Suction Unit 2',
        equipmentName: 'Dental Unit Kursi 2',
        urgency: 'URGENT',
        estimatedCost: 350000,
        description: 'Selang suction mengalami retak dan daya hisap menurun drastis saat tindakan.',
      },
    },
  });

  // 6. MAINTENANCE + REJECTED
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      requestedById: staff1.id,
      type: ApprovalType.MAINTENANCE,
      status: ApprovalStatus.REJECTED,
      reviewNote: 'Ditolak. Peremajaan sofa ruang tunggu ditunda hingga kuartal 4.',
      payload: {
        title: 'Penggantian Kulit Sofa Ruang Tunggu Pasien',
        equipmentName: 'Sofa Lobi Utama',
        urgency: 'LOW',
        estimatedCost: 1500000,
        description: 'Terdapat sedikit goresan pada bantalan sofa lobi.',
      },
    },
  });

  // 7. OTHER + PENDING
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      requestedById: staff1.id,
      type: ApprovalType.OTHER,
      status: ApprovalStatus.PENDING,
      payload: {
        title: 'Izin Lembur Staf Resepsionis Expo Kesehatan Mall',
        urgency: 'NORMAL',
        estimatedCost: 300000,
        description: 'Penugasan 2 orang staf front office untuk booth edukasi gigi di Mall Kelapa Gading.',
      },
    },
  });

  // 8. OTHER + APPROVED
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      requestedById: staff1.id,
      type: ApprovalType.OTHER,
      status: ApprovalStatus.APPROVED,
      reviewNote: 'Disetujui sesuai jatah alokasi seragam tahunan tim klinis.',
      payload: {
        title: 'Pengadaan Seragam Scrub Klinis 2026',
        urgency: 'NORMAL',
        estimatedCost: 1200000,
        description: 'Pembuatan 8 set seragam scrub baru untuk perawat dan resepsionis.',
      },
    },
  });

  // 9. OTHER + REJECTED
  await prisma.approvalRequest.create({
    data: {
      organizationId: org.id,
      branchId: branch2.id,
      requestedById: staff2.id,
      type: ApprovalType.OTHER,
      status: ApprovalStatus.REJECTED,
      reviewNote: 'Ditolak. Sesuai ketentuan perusahaan, biaya parkir mobil pribadi staf tidak ditanggung.',
      payload: {
        title: 'Klaim Penggantian Biaya Parkir Langganan Staf',
        urgency: 'LOW',
        estimatedCost: 200000,
        description: 'Permohonan subsidi parkir bulanan karyawan.',
      },
    },
  });

  // ─── 14. VISITS (INTELLIGENCE MODULE & REVENUE ANALYTICS) ────────────────────
  console.log('Seeding rich historical visits across all payment methods (QRIS, CASH, DEBIT, INSURANCE)...');

  const paymentMethods = ['QRIS', 'CASH', 'DEBIT', 'INSURANCE'];
  const historicalVisitsData = [
    { daysAgo: 58, patIdx: '08123456701', doc: doctorAndi, branch: branch1, serv: 'pembersihan-gigi', amt: 350000, meth: 'QRIS', notes: 'Scaling rutin rahang atas dan bawah.' },
    { daysAgo: 54, patIdx: '08123456702', doc: doctorSarah, branch: branch1, serv: 'penambalan-gigi', amt: 550000, meth: 'DEBIT', notes: 'Tambal komposit gigi 36.' },
    { daysAgo: 50, patIdx: '08123456703', doc: doctorBudi, branch: branch2, serv: 'pemutihan-gigi', amt: 1800000, meth: 'QRIS', notes: 'In-office bleaching estetik.' },
    { daysAgo: 46, patIdx: '08123456704', doc: doctorAndi, branch: branch1, serv: 'cabut-gigi', amt: 750000, meth: 'CASH', notes: 'Ekstraksi gigi molar bungsu.' },
    { daysAgo: 42, patIdx: '08123456705', doc: doctorSarah, branch: branch2, serv: 'saluran-akar', amt: 1200000, meth: 'INSURANCE', notes: 'Pembersihan saluran akar sesi 1.' },
    { daysAgo: 38, patIdx: '08123456706', doc: doctorBudi, branch: branch1, serv: 'pembersihan-gigi', amt: 350000, meth: 'QRIS', notes: 'Scaling dan pembersihan plak.' },
    { daysAgo: 34, patIdx: '08123456707', doc: doctorSarah, branch: branch1, serv: 'pemutihan-gigi', amt: 1800000, meth: 'DEBIT', notes: 'Bleaching gigi 8 tingkat lebih cerah.' },
    { daysAgo: 30, patIdx: '08111111111', doc: doctorAndi, branch: branch2, serv: 'penambalan-gigi', amt: 550000, meth: 'QRIS', notes: 'Tambal estetik insisivus.' },
    { daysAgo: 26, patIdx: '08222222222', doc: doctorBudi, branch: branch1, serv: 'cabut-gigi', amt: 750000, meth: 'CASH', notes: 'Pencabutan sisa akar gigi.' },
    { daysAgo: 22, patIdx: '08333333333', doc: doctorSarah, branch: branch1, serv: 'pembersihan-gigi', amt: 350000, meth: 'QRIS', notes: 'Pembersihan karang berkala.' },
    { daysAgo: 18, patIdx: '08444444444', doc: doctorClara, branch: branch2, serv: 'kawat-gigi', amt: 6500000, meth: 'INSURANCE', notes: 'Pemasangan behel metal 2 rahang.' },
    { daysAgo: 14, patIdx: '08555555555', doc: doctorAndi, branch: branch1, serv: 'konsultasi', amt: 150000, meth: 'DEBIT', notes: 'Konsultasi panoramik intraoral.' },
    { daysAgo: 10, patIdx: '08666666666', doc: doctorBudi, branch: branch2, serv: 'implan-gigi', amt: 12000000, meth: 'DEBIT', notes: 'Pemasangan fixture implan titanium gigi 46.' },
    { daysAgo: 7, patIdx: '08777777777', doc: doctorSarah, branch: branch1, serv: 'penambalan-gigi', amt: 550000, meth: 'QRIS', notes: 'Tambal komposit kelas II.' },
    { daysAgo: 5, patIdx: '08123456701', doc: doctorAndi, branch: branch1, serv: 'pembersihan-gigi', amt: 350000, meth: 'CASH', notes: 'Scaling profilaksis berkala.' },
    { daysAgo: 3, patIdx: '08123456702', doc: doctorSarah, branch: branch2, serv: 'saluran-akar', amt: 1200000, meth: 'INSURANCE', notes: 'Obturasi saluran akar tuntas.' },
    { daysAgo: 2, patIdx: '08123456703', doc: doctorBudi, branch: branch1, serv: 'cabut-gigi', amt: 750000, meth: 'QRIS', notes: 'Ekstraksi gigi geraham bungsu.' },
    { daysAgo: 1, patIdx: '08123456704', doc: doctorSarah, branch: branch1, serv: 'pembersihan-gigi', amt: 350000, meth: 'DEBIT', notes: 'Pembersihan karang dan polishing fluoridasi.' },
  ];

  for (const v of historicalVisitsData) {
    const patient = patientMap.get(v.patIdx);
    const service = serviceMap.get(v.serv);
    const visitDate = wibDate(-v.daysAgo, 11, 30);

    await prisma.visit.create({
      data: {
        organizationId: org.id,
        branchId: v.branch.id,
        doctorId: v.doc.id,
        patientId: patient.id,
        serviceId: service.id,
        paymentAmount: v.amt,
        paymentMethod: v.meth,
        notes: v.notes,
        createdAt: visitDate,
      },
    });
  }

  // Soft-deleted visit record
  const softDeletedVisitDate = wibDate(-40, 10, 0);
  await prisma.visit.create({
    data: {
      organizationId: org.id,
      branchId: branch1.id,
      doctorId: doctorAndi.id,
      patientId: patientMap.get('08111111111').id,
      serviceId: serviceMap.get('konsultasi').id,
      paymentAmount: 150000,
      paymentMethod: 'CASH',
      notes: 'Kunjungan dibatalkan dan direvisi karena kesalahan billing.',
      createdAt: softDeletedVisitDate,
      deletedAt: new Date(softDeletedVisitDate.getTime() + 3600000),
    },
  });

  console.log('\n======================================================');
  console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Demonstration Credentials (Password: demo123456):');
  console.log('  Superadmin: superadmin@demo.com');
  console.log('  Director:   director@demo.com');
  console.log('  Manager:    manager@demo.com (Kelapa Gading), manager.pluit@demo.com (Pluit)');
  console.log('  Staff:      staff@demo.com (Kelapa Gading), staff.pluit@demo.com (Pluit)');
  console.log('  Doctors:    doctor.andi@demo.com, doctor.sarah@demo.com');
  console.log('  Inactive:   inactive.staff@demo.com');
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
