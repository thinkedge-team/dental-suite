export interface MockService {
  id: string;
  name: string;
  slug: string;
  category: 'PREVENTIVE' | 'ESTHETIC' | 'RESTORATION' | 'SURGERY' | 'ORTHODONTICS';
  categoryLabel: string;
  description: string;
  shortDesc: string;
  durationMinutes: number;
  basePrice: number;
  featured: boolean;
  insuranceCovered: boolean;
  indications: string[];
  steps: string[];
  faqs: { question: string; answer: string }[];
}

export interface MockDoctor {
  id: string;
  name: string;
  slug: string;
  title: string;
  specialty: string;
  subSpecialty?: string;
  sipNumber: string;
  strNumber: string;
  experienceYears: number;
  education: string[];
  bio: string;
  photoUrl: string;
  branches: string[];
  schedule: {
    day: string;
    branch: string;
    hours: string;
  }[];
}

export interface MockBranch {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  hours: string;
  facilities: string[];
  mapEmbedUrl: string;
}

export interface MockInsurance {
  id: string;
  name: string;
  type: 'CASHLESS' | 'REIMBURSEMENT';
  logoText: string;
  supportedBranches: string[];
}

export const mockServices: MockService[] = [
  {
    id: 'srv-1',
    name: 'Pembersihan Karang Gigi (Scaling Ultrasonic)',
    slug: 'scaling-gigi',
    category: 'PREVENTIVE',
    categoryLabel: 'Pencegahan',
    shortDesc: 'Pembersihan karang gigi ultrasonik bebas ngilu untuk menjaga gusi sehat dan nafas segar.',
    description: 'Perawatan scaling menggunakan teknologi piezo-ultrasonic mutakhir yang mengangkat plak keras dan karang gigi secara presisi tanpa merusak enamel.',
    durationMinutes: 45,
    basePrice: 450000,
    featured: true,
    insuranceCovered: true,
    indications: ['Gusi sering berdarah saat sikat gigi', 'Karang gigi menumpuk', 'Bau mulut tidak sedap'],
    steps: ['Pemeriksaan intraoral & foto rongga mulut', 'Scaling ultrasonik pada rahang atas & bawah', 'Polesing pasta fluorida untuk proteksi enamel'],
    faqs: [
      { question: 'Apakah scaling terasa sakit?', answer: 'Dengan teknologi ultrasonic kami, getaran lembut minim rasa ngilu.' },
      { question: 'Berapa sering harus scaling?', answer: 'Dianjurkan setiap 6 bulan sekali untuk pemeliharaan rutin.' }
    ]
  },
  {
    id: 'srv-2',
    name: 'Direct Composite Restoration (Tambal Gigi Estetis)',
    slug: 'tambal-gigi-estetis',
    category: 'RESTORATION',
    categoryLabel: 'Restorasi',
    shortDesc: 'Tambal gigi berlubang sewarna gigi asli dengan komposit nano-hybrid tahan lama.',
    description: 'Restorasi gigi dengan material komposit berkualitas tinggi buatan Jerman yang menyatu sempurna dengan kontur dan gradasi warna gigi alami Anda.',
    durationMinutes: 60,
    basePrice: 550000,
    featured: true,
    insuranceCovered: true,
    indications: ['Gigi berlubang ringan hingga sedang', 'Gigi depan sompel atau retak', 'Penggantian tambalan lama'],
    steps: ['Pembersihan jaringan karies secara steril', 'Etsa dan bonding enamel', 'Aplikasi komposit lapis demi lapis dengan light-curing', 'Polesing akhir hingga kilap alami'],
    faqs: [
      { question: 'Apakah tambalan terlihat berbeda dari gigi asli?', answer: 'Tidak, warna dicocokkan dengan shade guide presisi menyerupai warna asli.' }
    ]
  },
  {
    id: 'srv-3',
    name: 'In-Office Dental Whitening (Bleaching Gigi)',
    slug: 'bleaching-gigi',
    category: 'ESTHETIC',
    categoryLabel: 'Estetika',
    shortDesc: 'Pemutihan gigi profesional hingga 8 tingkat lebih cerah dalam satu kunjungan 60 menit.',
    description: 'Prosedur pemutihan gigi dengan LED cold-light aktivasi gel hidrogen peroksida berformula khusus yang melindungi sensitivitas gigi.',
    durationMinutes: 60,
    basePrice: 2500000,
    featured: true,
    insuranceCovered: false,
    indications: ['Gigi menguning akibat kopi/teh/rokok', 'Perubahan warna usia', 'Persiapan acara pernikahan/foto penting'],
    steps: ['Pembersihan awal & isolasi gusi dengan gingival barrier', 'Aplikasi gel pemutih medis', 'Aktivasi sinar LED 3 siklus @ 15 menit', 'Aplikasi gel anti-sensitivitas'],
    faqs: [
      { question: 'Berapa lama hasil pemutihan bertahan?', answer: 'Rata-rata bertahan 1-2 tahun tergantung pola konsumsi kopi dan teh.' }
    ]
  },
  {
    id: 'srv-4',
    name: 'Odontektomi (Pencabutan Gigi Bungsu Impaksi)',
    slug: 'odontektomi-gigi-bungsu',
    category: 'SURGERY',
    categoryLabel: 'Bedah Mulut',
    shortDesc: 'Operasi minor pencabutan gigi bungsu impaksi oleh Spesialis Bedah Mulut berpengalaman.',
    description: 'Tindakan bedah mulut terencana untuk mengangkat gigi bungsu yang tumbuh miring atau terpendam dengan teknik minimal invasif dan anestesi lokal aman.',
    durationMinutes: 60,
    basePrice: 2800000,
    featured: false,
    insuranceCovered: true,
    indications: ['Nyeri berulang di rahang belakang', 'Gusi bengkak di sekitar gigi bungsu', 'Gigi mendesak susunan gigi lain'],
    steps: ['Analisis foto rontgen panoramik', 'Anestesi lokal profundal', 'Pemisahan gigi dan pengangkatan presisi', 'Penjahitan dan instruksi pasca-bedah'],
    faqs: [
      { question: 'Berapa lama masa pemulihan?', answer: 'Bengkak biasanya reda dalam 3-5 hari dengan obat pasca-tindakan.' }
    ]
  }
];

export const mockDoctors: MockDoctor[] = [
  {
    id: 'doc-1',
    name: 'drg. Sarah Amanda, Sp.KG',
    slug: 'drg-sarah-amanda',
    title: 'Spesialis Konservasi Gigi (Endodontis)',
    specialty: 'Konservasi Gigi & Estetika',
    subSpecialty: 'Perawatan Saluran Akar & Veneer',
    sipNumber: 'SIP.446.1/0892/DS-DINKES/2022',
    strNumber: '31.2.1.100.2.18.098765',
    experienceYears: 9,
    education: ['Dokter Gigi - Universitas Indonesia (2015)', 'Spesialis Konservasi Gigi - Universitas Indonesia (2019)'],
    bio: 'drg. Sarah memiliki keahlian mendalam dalam perawatan mikroskopik saluran akar dan restorasi estetik minimal invasif untuk mempertahankan gigi asli selama mungkin.',
    photoUrl: '/images/dashboard-hero.jpg',
    branches: ['Kelapa Gading', 'Pluit'],
    schedule: [
      { day: 'Senin', branch: 'Kelapa Gading', hours: '10:00 - 16:00' },
      { day: 'Rabu', branch: 'Kelapa Gading', hours: '14:00 - 20:00' },
      { day: 'Jumat', branch: 'Pluit', hours: '10:00 - 18:00' },
      { day: 'Sabtu', branch: 'Kelapa Gading', hours: '09:00 - 15:00' }
    ]
  },
  {
    id: 'doc-2',
    name: 'drg. Budi Santoso, Sp.BM',
    slug: 'drg-budi-santoso',
    title: 'Spesialis Bedah Mulut & Maksilofasial',
    specialty: 'Bedah Mulut & Implan',
    subSpecialty: 'Implan Gigi & Odontektomi',
    sipNumber: 'SIP.446.2/0451/DS-DINKES/2021',
    strNumber: '31.2.1.100.2.16.054321',
    experienceYears: 12,
    education: ['Dokter Gigi - Universitas Padjadjaran (2012)', 'Spesialis Bedah Mulut - Universitas Airlangga (2017)'],
    bio: 'drg. Budi memimpin divisi bedah mulut dengan pengalaman lebih dari 1.500 kasus impaksi gigi dan prosedur implan gigi berteknologi computer-guided.',
    photoUrl: '/images/dashboard-hero.jpg',
    branches: ['Kelapa Gading', 'Pluit'],
    schedule: [
      { day: 'Selasa', branch: 'Pluit', hours: '13:00 - 20:00' },
      { day: 'Kamis', branch: 'Kelapa Gading', hours: '13:00 - 20:00' },
      { day: 'Sabtu', branch: 'Pluit', hours: '10:00 - 17:00' }
    ]
  },
  {
    id: 'doc-3',
    name: 'drg. Jessica Tan, Sp.Ort',
    slug: 'drg-jessica-tan',
    title: 'Spesialis Ortodonti',
    specialty: 'Ortodonti & Perapian Gigi',
    subSpecialty: 'Clear Aligners & Self-Ligating Braces',
    sipNumber: 'SIP.446.3/1105/DS-DINKES/2023',
    strNumber: '31.2.1.100.2.20.112233',
    experienceYears: 7,
    education: ['Dokter Gigi - Universitas Gadjah Mada (2017)', 'Spesialis Ortodonti - Universitas Indonesia (2022)'],
    bio: 'drg. Jessica berspesialisasi dalam perawatan kawat gigi konvensional maupun aligner transparan untuk mengoreksi gigitan dan menciptakan senyum simetris harmonis.',
    photoUrl: '/images/dashboard-hero.jpg',
    branches: ['Kelapa Gading'],
    schedule: [
      { day: 'Senin', branch: 'Kelapa Gading', hours: '13:00 - 20:00' },
      { day: 'Rabu', branch: 'Kelapa Gading', hours: '10:00 - 17:00' },
      { day: 'Jumat', branch: 'Kelapa Gading', hours: '13:00 - 20:00' }
    ]
  }
];

export const mockBranches: MockBranch[] = [
  {
    id: 'br-1',
    name: 'Cabang Kelapa Gading',
    slug: 'kelapa-gading',
    address: 'Jl. Boulevard Raya Blok LB 3 No. 12, Kelapa Gading',
    city: 'Jakarta Utara',
    phone: '(021) 4587-9901',
    whatsapp: '6281234567890',
    hours: 'Senin - Sabtu: 09:00 - 20:00 WIB (Minggu Libur)',
    facilities: ['4 Dental Unit Ergonomis', 'Dental X-Ray Digital Panoramik', 'Ruang Sterilisasi Standar Autoklaf Kelas B', 'Lounge Pasien & WiFi Cepat', 'Parkir Mobil Luas & Valet Gratis'],
    mapEmbedUrl: 'https://maps.google.com'
  },
  {
    id: 'br-2',
    name: 'Cabang Pluit',
    slug: 'pluit',
    address: 'Ruko Pluit Junction Blok A No. 8, Jl. Pluit Raya',
    city: 'Jakarta Utara',
    phone: '(021) 6682-1102',
    whatsapp: '6281234567891',
    hours: 'Senin - Sabtu: 09:00 - 20:00 WIB (Minggu Libur)',
    facilities: ['3 Dental Unit Khusus Bedah & Estetika', 'Intraoral Scanner 3D', 'Ruang Tindakan VIP Ramah Anak', 'Area Parkir Basemen Nyaman'],
    mapEmbedUrl: 'https://maps.google.com'
  }
];

export const mockInsurances: MockInsurance[] = [
  { id: 'ins-1', name: 'Prudential Indonesia', type: 'CASHLESS', logoText: 'PRUDENTIAL', supportedBranches: ['Kelapa Gading', 'Pluit'] },
  { id: 'ins-2', name: 'Allianz Life Indonesia', type: 'CASHLESS', logoText: 'ALLIANZ', supportedBranches: ['Kelapa Gading', 'Pluit'] },
  { id: 'ins-3', name: 'Mandiri Inhealth', type: 'CASHLESS', logoText: 'MANDIRI INHEALTH', supportedBranches: ['Kelapa Gading', 'Pluit'] },
  { id: 'ins-4', name: 'Sinarmas MSIG', type: 'CASHLESS', logoText: 'SINARMAS', supportedBranches: ['Kelapa Gading'] },
  { id: 'ins-5', name: 'BPJS Kesehatan (Rujukan Faskes 1)', type: 'REIMBURSEMENT', logoText: 'BPJS KESEHATAN', supportedBranches: ['Kelapa Gading', 'Pluit'] },
  { id: 'ins-6', name: 'FWD Insurance', type: 'CASHLESS', logoText: 'FWD', supportedBranches: ['Kelapa Gading', 'Pluit'] }
];
