import { AttendanceStatus, AppointmentStatus, PrismaClient, Role, ApprovalType, ApprovalStatus } from '../src/generated/prisma';
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
      moduleIntelligence: true,
    },
  });

  // 2. Branches
  const branch1 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'kelapa-gading' } },
    update: {
      name: 'Kelapa Gading',
      address: 'Jl. Boulevard Raya No. 123, Kelapa Gading, Jakarta Utara',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14240',
      whatsapp: '6281234567890',
      photoUrls: ['/images/branch-kelapa-gading.jpg', '/images/clinic-room.jpg'],
      openingHours: {
        weekday: '09:00 - 21:00',
        saturday: '09:00 - 18:00',
        sunday: '10:00 - 15:00',
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
      photoUrls: ['/images/branch-kelapa-gading.jpg', '/images/clinic-room.jpg'],
      openingHours: {
        weekday: '09:00 - 21:00',
        saturday: '09:00 - 18:00',
        sunday: '10:00 - 15:00',
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

  const allDoctors = [doctorAndi, doctorSarah, doctorBudi];
  for (const doc of allDoctors) {
    for (const b of [branch1, branch2]) {
      await prisma.branchDoctor.upsert({
        where: { branchId_doctorId: { branchId: b.id, doctorId: doc.id } },
        update: {},
        create: { branchId: b.id, doctorId: doc.id },
      });
    }

    for (const day of [1, 3, 5]) {
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

    for (const day of [2, 4, 6]) {
      await prisma.schedule.upsert({
        where: { doctorId_branchId_dayOfWeek: { doctorId: doc.id, branchId: branch2.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorId: doc.id,
          branchId: branch2.id,
          dayOfWeek: day,
          startTime: '10:00',
          endTime: '18:00',
          slotMinutes: 30,
          isActive: true,
        },
      });
    }
  }

  // 5. Services
  const services = [
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
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: service.slug } },
      update: { ...service, isActive: true },
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
        branchId: branch1.id,
      },
      {
        time: [9, 30] as const,
        patientName: 'Budi Santoso',
        patientPhone: '08222222222',
        service: 'Konsultasi',
        status: AppointmentStatus.CHECKED_IN,
        doctorId: doctorAndi.id,
        branchId: branch1.id,
      },
      {
        time: [10, 0] as const,
        patientName: 'Rina Kartika',
        patientPhone: '08333333333',
        service: 'Penambalan Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: undefined,
        branchId: branch1.id,
      },
      {
        time: [10, 30] as const,
        patientName: 'Anton Prabowo',
        patientPhone: '08444444444',
        service: 'Cabut Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: undefined,
        branchId: branch1.id,
      },
      {
        time: [11, 0] as const,
        patientName: 'Jessica Wong',
        patientPhone: '08555555555',
        service: 'Pemutihan Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: doctorSarah.id,
        branchId: branch2.id,
      },
      {
        time: [14, 0] as const,
        patientName: 'Michael Tan',
        patientPhone: '08666666666',
        service: 'Konsultasi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: doctorBudi.id,
        branchId: branch2.id,
      },
      {
        time: [15, 30] as const,
        patientName: 'Hendra Gunawan',
        patientPhone: '08777777777',
        service: 'Pembersihan Gigi',
        status: AppointmentStatus.CHECKED_IN,
        doctorId: doctorSarah.id,
        branchId: branch2.id,
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
          branchId: item.branchId,
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

  const pluitAptCount = await prisma.appointment.count({
    where: {
      organizationId: org.id,
      branchId: branch2.id,
      scheduledAt: { gte: startOfToday, lt: endOfToday },
    },
  });

  if (pluitAptCount === 0) {
    const pluitAppointments = [
      {
        time: [13, 0] as const,
        patientName: 'Jessica Wong',
        patientPhone: '08555555555',
        service: 'Pemutihan Gigi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: doctorSarah.id,
        branchId: branch2.id,
      },
      {
        time: [15, 0] as const,
        patientName: 'Michael Tan',
        patientPhone: '08666666666',
        service: 'Konsultasi',
        status: AppointmentStatus.CONFIRMED,
        doctorId: doctorBudi.id,
        branchId: branch2.id,
      },
      {
        time: [16, 0] as const,
        patientName: 'Hendra Gunawan',
        patientPhone: '08777777777',
        service: 'Pembersihan Gigi',
        status: AppointmentStatus.CHECKED_IN,
        doctorId: doctorSarah.id,
        branchId: branch2.id,
      },
    ];

    for (const item of pluitAppointments) {
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
          branchId: item.branchId,
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
    {
      name: 'AdMedika',
      slug: 'admedika',
      coverageDetails: 'Klaim rawat jalan gigi cashless dan reimbursement terintegrasi jaringan Third Party Administrator AdMedika.',
      claimProcess: 'Tunjukkan kartu fisik atau e-card AdMedika di meja resepsionis untuk verifikasi instan via web portal.',
    },
    {
      name: 'Prudential',
      slug: 'prudential',
      coverageDetails: 'Perlindungan rawat jalan gigi dan tindakan bedah mulut sesuai plafon polis PRUHospital & Surgical.',
      claimProcess: 'Swipe kartu asuransi Prudential di mesin EDC kasir klinik untuk pemrosesan cashless langsung.',
    },
    {
      name: 'BCA Life',
      slug: 'bca-life',
      coverageDetails: 'Cakupan perawatan gigi preventif, penambalan komposit, dan pembersihan karang gigi berkala.',
      claimProcess: 'Verifikasi nomor kepesertaan BCA Life di kasir dengan menunjukkan kartu identitas resmi.',
    },
    {
      name: 'Mandiri Inhealth',
      slug: 'mandiri-inhealth',
      coverageDetails: 'Fasilitas cashless perawatan gigi bagi pemegang kartu Mandiri Inhealth Silver, Gold, dan Platinum.',
      claimProcess: 'Gesek kartu Mandiri Inhealth pada terminal EDC atau konfirmasi digital via aplikasi.',
    },
    {
      name: 'Sinarmas',
      slug: 'sinarmas',
      coverageDetails: 'Jaminan menyeluruh rawat jalan gigi dan perawatan darurat untuk pemegang polis Simas Sehat.',
      claimProcess: 'Tunjukkan kartu kepesertaan Sinarmas MSIG untuk cetak surat jaminan perawatan instan.',
    },
  ];

  for (const insurer of insurers) {
    await prisma.insurancePartner.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: insurer.slug } },
      update: { ...insurer, isActive: true },
      create: { organizationId: org.id, ...insurer, isActive: true },
    });
  }

  const mu = await prisma.user.findUnique({ where: { email: 'manager@demo.com' } });
  const bu = await prisma.user.findUnique({ where: { email: 'staff@demo.com' } });
  const bi = branch1.id;
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

  const bi2 = branch2.id;
  const pluitItems = [
    { n: 'Lidocaine HCl 2% + Epinephrine', s: 'MED-LIDO-PLU', st: 18, ms: 15, u: 'ampul', c: 'Anestesi & Farmasi' },
    { n: 'Composite Resin Filtek Z250 A3', s: 'MAT-COMP-A3', st: 8, ms: 5, u: 'syringe', c: 'Bahan Tambal & Restorasi' },
    { n: 'Dental Needle 30G Short', s: 'DISP-NDL-PLU', st: 120, ms: 40, u: 'pcs', c: 'Habis Pakai & Sterilisasi' },
    { n: 'Latex Examination Gloves S', s: 'DISP-GLV-S', st: 4, ms: 10, u: 'box', c: 'Habis Pakai & Sterilisasi' },
    { n: 'Bracket Metal MBT 0.022 Kit', s: 'ORTH-BRK-PLU', st: 9, ms: 6, u: 'set', c: 'Ortodonti' },
  ];
  for (const d of pluitItems) {
    const i = await prisma.inventoryItem.create({ data: { branchId: bi2, name: d.n, sku: d.s, stock: d.st, minStock: d.ms, unit: d.u, category: d.c } });
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

  console.log('Seeding approval requests...');
  const existingProcurement = await prisma.approvalRequest.findFirst({
    where: {
      organizationId: org.id,
      branchId: bi,
      type: ApprovalType.PROCUREMENT,
    },
  });

  if (!existingProcurement) {
    const lidoItem = await prisma.inventoryItem.findFirst({
      where: { branchId: bi, sku: 'MED-LIDO-01' },
    });

    await prisma.approvalRequest.create({
      data: {
        organizationId: org.id,
        branchId: bi,
        requestedById: bu!.id,
        type: ApprovalType.PROCUREMENT,
        status: ApprovalStatus.PENDING,
        payload: {
          title: 'Pengadaan Anestesi Lidocaine',
          itemId: lidoItem?.id,
          itemName: lidoItem?.name || 'Lidocaine HCl 2% + Epinephrine',
          category: lidoItem?.category || 'Anestesi & Farmasi',
          currentStock: lidoItem?.stock ?? 8,
          minStock: lidoItem?.minStock ?? 20,
          unit: lidoItem?.unit || 'ampul',
          quantity: 30,
          estimatedCost: 450000,
          urgency: 'URGENT',
          notes: 'Stok kritis menipis di bawah ambang batas minimum.',
        },
      },
    });
  }

  const existingMaintenance = await prisma.approvalRequest.findFirst({
    where: {
      organizationId: org.id,
      branchId: bi,
      type: ApprovalType.MAINTENANCE,
    },
  });

  if (!existingMaintenance) {
    await prisma.approvalRequest.create({
      data: {
        organizationId: org.id,
        branchId: bi,
        requestedById: bu!.id,
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
  }
  console.log('Approval requests seeding complete!');

  const existingVisitsCount = await prisma.visit.count({
    where: { organizationId: org.id },
  });

  if (existingVisitsCount === 0) {
    console.log('Seeding historical visits for INTELLIGENCE module...');
    const allServices = await prisma.service.findMany({
      where: { organizationId: org.id },
    });
    const sPembersihan = allServices.find((s) => s.slug === 'pembersihan-gigi');
    const sPenambalan = allServices.find((s) => s.slug === 'penambalan-gigi');
    const sPemutihan = allServices.find((s) => s.slug === 'pemutihan-gigi');
    const sCabut = allServices.find((s) => s.slug === 'cabut-gigi');
    const sKonsultasi = allServices.find((s) => s.slug === 'konsultasi');

    const historicalPatients = [
      { name: 'Dewi Lestari', phone: '08123456701' },
      { name: 'Agus Setiawan', phone: '08123456702' },
      { name: 'Maya Anggraini', phone: '08123456703' },
      { name: 'Hendro Kusumo', phone: '08123456704' },
      { name: 'Ratna Paramita', phone: '08123456705' },
      { name: 'Bambang Soediro', phone: '08123456706' },
      { name: 'Farah Quinn', phone: '08123456707' },
      { name: 'Doni Pratama', phone: '08123456708' },
      { name: 'Linda Kurnia', phone: '08123456709' },
      { name: 'Rudy Hartono', phone: '08123456710' },
      { name: 'Siti Rahma', phone: '08123456711' },
      { name: 'Yusuf Mansur', phone: '08123456712' },
    ];

    const visitTemplates = [
      {
        daysAgo: 28,
        patientIdx: 0,
        doctor: doctorAndi,
        branch: branch1,
        service: sPembersihan,
        amount: 250000,
        method: 'QRIS',
        notes: 'Pembersihan karang gigi regio anterior dan posterior.',
      },
      {
        daysAgo: 25,
        patientIdx: 1,
        doctor: doctorSarah,
        branch: branch1,
        service: sPenambalan,
        amount: 450000,
        method: 'DEBIT',
        notes: 'Tambal komposit gigi 36.',
      },
      {
        daysAgo: 22,
        patientIdx: 2,
        doctor: doctorBudi,
        branch: branch2,
        service: sPemutihan,
        amount: 800000,
        method: 'QRIS',
        notes: 'Scaling dan bleaching in-office estetika.',
      },
      {
        daysAgo: 19,
        patientIdx: 3,
        doctor: doctorAndi,
        branch: branch1,
        service: sCabut,
        amount: 450000,
        method: 'CASH',
        notes: 'Ekstraksi gigi molar 3 bungsu persistensi.',
      },
      {
        daysAgo: 16,
        patientIdx: 4,
        doctor: doctorSarah,
        branch: branch2,
        service: sPenambalan,
        amount: 800000,
        method: 'INSURANCE',
        notes: 'Tambal kelas II MO gigi 46 dan aplikasi fluoride.',
      },
      {
        daysAgo: 13,
        patientIdx: 5,
        doctor: doctorBudi,
        branch: branch1,
        service: sPembersihan,
        amount: 250000,
        method: 'QRIS',
        notes: 'Scaling dan polishing tuntas tanpa komplikasi.',
      },
      {
        daysAgo: 10,
        patientIdx: 6,
        doctor: doctorSarah,
        branch: branch1,
        service: sPemutihan,
        amount: 1500000,
        method: 'DEBIT',
        notes: 'Paket whitening komprehensif dua rahang.',
      },
      {
        daysAgo: 8,
        patientIdx: 7,
        doctor: doctorAndi,
        branch: branch2,
        service: sPenambalan,
        amount: 450000,
        method: 'QRIS',
        notes: 'Tambal komposit estetik insisivus atas.',
      },
      {
        daysAgo: 5,
        patientIdx: 8,
        doctor: doctorBudi,
        branch: branch1,
        service: sCabut,
        amount: 300000,
        method: 'CASH',
        notes: 'Pencabutan akar gigi gangren radiks.',
      },
      {
        daysAgo: 4,
        patientIdx: 9,
        doctor: doctorSarah,
        branch: branch1,
        service: sPembersihan,
        amount: 250000,
        method: 'QRIS',
        notes: 'Scaling profilaksis berkala enam bulanan.',
      },
      {
        daysAgo: 2,
        patientIdx: 10,
        doctor: doctorAndi,
        branch: branch2,
        service: sPemutihan,
        amount: 2500000,
        method: 'INSURANCE',
        notes: 'Restorasi veneer komposit direct 4 gigi anterior.',
      },
      {
        daysAgo: 1,
        patientIdx: 11,
        doctor: doctorSarah,
        branch: branch1,
        service: sKonsultasi,
        amount: 250000,
        method: 'DEBIT',
        notes: 'Konsultasi rencana ortodonti dan rontgen panoramik.',
      },
    ];

    for (const v of visitTemplates) {
      const pData = historicalPatients[v.patientIdx];
      const patient = await prisma.patient.upsert({
        where: {
          organizationId_phone: {
            organizationId: org.id,
            phone: pData.phone,
          },
        },
        update: { name: pData.name },
        create: {
          organizationId: org.id,
          name: pData.name,
          phone: pData.phone,
        },
      });

      const createdAt = new Date(Date.now() - v.daysAgo * 86_400_000);

      await prisma.visit.create({
        data: {
          organizationId: org.id,
          branchId: v.branch.id,
          patientId: patient.id,
          doctorId: v.doctor.id,
          serviceId: v.service?.id,
          paymentAmount: v.amount,
          paymentMethod: v.method,
          notes: v.notes,
          createdAt,
        },
      });
    }
    console.log('Historical visits seeding complete!');
  }

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