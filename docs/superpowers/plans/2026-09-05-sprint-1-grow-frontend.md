# Sprint 1 (GROW Module): Public Patient Website (Frontend First) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, mobile-first public marketing surface for patient discovery and acquisition (`/`, `/layanan`, `/dokter`, `/lokasi`, `/asuransi`) using typed mock data before database integration.

**Architecture:** A Next.js App Router route group `(marketing)` with a shared glassmorphic header and clinical footer wraps all public routes. Presentation components (`src/components/grow/*`) receive typed mock entities (`src/data/mock-grow.ts`) modeled after Prisma schemas, allowing later seamless one-line replacement with Prisma queries.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React icons.

## Global Constraints

- **Typography**: Strictly sans-serif (`Plus_Jakarta_Sans` via `font-sans`). Absolutely NO serif fonts.
- **Brand Tokens**: Primary Orange (`#f38218` / `var(--color-primary)`), Ink (`#161817`), Paper (`#f7f5f0`), Line (`rgba(22,24,23,0.12)`), Slate (`#5b6465`).
- **Git Prefix**: Always prefix git commands with `GIT_MASTER=1`.
- **Working Directory**: `/home/imyourdream/Work/thinkedge/dental-suite`.

---

### Task 1: Typed Mock Dataset & Data Contracts

**Files:**
- Create: `src/data/mock-grow.ts`
- Test: `src/data/__tests__/mock-grow.test.ts`

**Interfaces:**
- Consumes: None (root data provider)
- Produces: `MockService`, `MockDoctor`, `MockBranch`, `MockInsurance` interfaces and `mockServices`, `mockDoctors`, `mockBranches`, `mockInsurances` exported arrays.

- [ ] **Step 1: Write test to verify mock data contracts and integrity**

Create `src/data/__tests__/mock-grow.test.ts`:
```typescript
import { mockServices, mockDoctors, mockBranches, mockInsurances } from '../mock-grow';

describe('mock-grow data contract', () => {
  it('should provide non-empty services with valid categories and pricing', () => {
    expect(mockServices.length).toBeGreaterThanOrEqual(4);
    for (const service of mockServices) {
      expect(service.slug).toMatch(/^[a-z0-9-]+$/);
      expect(service.basePrice).toBeGreaterThan(0);
      expect(service.durationMinutes).toBeGreaterThan(0);
    }
  });

  it('should provide doctors with credentials and schedules', () => {
    expect(mockDoctors.length).toBeGreaterThanOrEqual(3);
    for (const doctor of mockDoctors) {
      expect(doctor.slug).toMatch(/^[a-z0-9-]+$/);
      expect(doctor.sipNumber).toBeDefined();
      expect(doctor.schedule.length).toBeGreaterThan(0);
    }
  });

  it('should provide 2 branches with addresses and operational hours', () => {
    expect(mockBranches.length).toBe(2);
    expect(mockBranches.map(b => b.slug)).toEqual(['kelapa-gading', 'pluit']);
  });

  it('should provide insurance partners with cashless or reimbursement flags', () => {
    expect(mockInsurances.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ts-node -e "import('./src/data/mock-grow').then(m => console.log(m.mockServices.length))"`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement `src/data/mock-grow.ts`**

```typescript
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
```

- [ ] **Step 4: Verify test passes**

Run: `npx ts-node -e "const { mockServices } = require('./src/data/mock-grow'); console.log('Services:', mockServices.length);"`
Expected: `Services: 4`

- [ ] **Step 5: Commit**

```bash
GIT_MASTER=1 git add src/data/mock-grow.ts
GIT_MASTER=1 git commit -m "feat(grow): add typed mock datasets for patient marketing pages"
```

---

### Task 2: Shared Public Marketing Shell & Navigation

**Files:**
- Create: `src/components/grow/public-header.tsx`
- Create: `src/components/grow/public-footer.tsx`
- Create: `src/app/(marketing)/layout.tsx`
- Modify: `src/app/(marketing)/page.tsx` (Move and enhance `src/app/page.tsx`)

**Interfaces:**
- Consumes: None (uses Next.js `Link`, `usePathname`, Lucide icons)
- Produces: `<PublicHeader />`, `<PublicFooter />`, and `MarketingLayout` wrapping `children`

- [ ] **Step 1: Write header and footer component specifications**

Create `src/components/grow/public-header.tsx` with:
- Glassmorphic top bar `bg-card/90 backdrop-blur-md border-b border-border/60 sticky top-0 z-40`.
- Clinic logo and brand typography.
- Navigation items: `[ { name: 'Beranda', href: '/' }, { name: 'Layanan', href: '/layanan' }, { name: 'Dokter', href: '/dokter' }, { name: 'Cabang & Lokasi', href: '/lokasi' }, { name: 'Asuransi', href: '/asuransi' } ]`.
- Active link styling based on `usePathname()`.
- WhatsApp CS button + "Portal Staf" button.
- Mobile dropdown menu with hamburger toggle (`useState`).

Create `src/components/grow/public-footer.tsx` with:
- 4 column responsive grid:
  1. Brand bio + Kemenkes accreditation notice.
  2. Direct service category links (`/layanan`).
  3. Branch addresses & telephone numbers.
  4. Emergency & WhatsApp quick-action booking.
- Bottom copyright bar: `© 2026 Klinik Gigi Senyum Sehat. Powered by Think Edge Dental Suite.`

- [ ] **Step 2: Create `src/app/(marketing)/layout.tsx`**

```tsx
import { PublicHeader } from "@/components/grow/public-header";
import { PublicFooter } from "@/components/grow/public-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
```

- [ ] **Step 3: Move and adapt `src/app/page.tsx` into `src/app/(marketing)/page.tsx`**

Remove duplicate embedded header/footer from `page.tsx` so it cleanly utilizes `MarketingLayout`. Ensure home hero links navigate to `/layanan`, `/dokter`, `/lokasi`, and `/asuransi`.

- [ ] **Step 4: Run typecheck and verify build**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
GIT_MASTER=1 git add src/components/grow/public-header.tsx src/components/grow/public-footer.tsx src/app/\(marketing\)/layout.tsx src/app/\(marketing\)/page.tsx
GIT_MASTER=1 git commit -m "feat(grow): implement shared public marketing header, footer, and layout"
```

---

### Task 3: Services Directory & Detail Pages

**Files:**
- Create: `src/components/grow/service-card.tsx`
- Create: `src/app/(marketing)/layanan/page.tsx`
- Create: `src/app/(marketing)/layanan/[slug]/page.tsx`

**Interfaces:**
- Consumes: `mockServices`, `MockService` from `src/data/mock-grow.ts`
- Produces: `<ServiceCard service={service} />`, `/layanan` page, `/layanan/[slug]` page.

- [ ] **Step 1: Implement `src/components/grow/service-card.tsx`**

Display:
- Category badge (`bg-primary/10 text-primary border border-primary/20 text-xs font-semibold`).
- Service Name & Short Description.
- Estimated duration (`Clock` icon) + Insurance covered indicator (`ShieldCheck`).
- Formatted Price: `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.basePrice)`.
- Link to `/layanan/${service.slug}` with hover arrow motion.

- [ ] **Step 2: Implement `src/app/(marketing)/layanan/page.tsx`**

Client/Server interactive catalog:
- Filter categories: `['Semua', 'Pencegahan', 'Restorasi', 'Estetika', 'Bedah Mulut']`.
- Search query input to quickly find treatments.
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop) of `ServiceCard`.
- Empty state if search yields no results.
- Sticky CTA banner: "Butuh konsultasi rencana perawatan? Hubungi dokter gigi kami via WhatsApp".

- [ ] **Step 3: Implement `src/app/(marketing)/layanan/[slug]/page.tsx`**

Detail view:
- Retrieve service by slug from `mockServices` (fallback to `notFound()`).
- Hero section: Category, Title, Price, Duration, Action button ("Konsultasi via WhatsApp").
- 2-column layout:
  - Left column: "Tentang Perawatan", "Indikasi Perawatan", "Tahapan Tindakan".
  - Right sticky sidebar: Action summary card (Harga mulai dari, Estimasi durasi, Metode pembayaran, WhatsApp button).
- Interactive FAQ accordion section at bottom.

- [ ] **Step 4: Run typecheck and route build**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
GIT_MASTER=1 git add src/components/grow/service-card.tsx src/app/\(marketing\)/layanan/page.tsx src/app/\(marketing\)/layanan/\[slug\]/page.tsx
GIT_MASTER=1 git commit -m "feat(grow): add dental services directory and detail pages"
```

---

### Task 4: Doctors Directory & Detail Pages

**Files:**
- Create: `src/components/grow/doctor-card.tsx`
- Create: `src/app/(marketing)/dokter/page.tsx`
- Create: `src/app/(marketing)/dokter/[slug]/page.tsx`

**Interfaces:**
- Consumes: `mockDoctors`, `MockDoctor` from `src/data/mock-grow.ts`
- Produces: `<DoctorCard doctor={doctor} />`, `/dokter` page, `/dokter/[slug]` page.

- [ ] **Step 1: Implement `src/components/grow/doctor-card.tsx`**

Display:
- Doctor portrait / avatar with clinical frame.
- Name, Degree, Specialty pill.
- SIP and STR verification badge ("SIP Terverifikasi Kemenkes").
- Practice branches list with `MapPin` icons.
- "Lihat Profil & Jadwal" button pointing to `/dokter/${doctor.slug}`.

- [ ] **Step 2: Implement `src/app/(marketing)/dokter/page.tsx`**

Directory view:
- Filter by Branch (Semua, Kelapa Gading, Pluit) and Specialty (Semua, Konservasi Gigi, Bedah Mulut, Ortodonti).
- Interactive grid of `DoctorCard`.
- Trust banner: "100% Dokter Gigi Spesialis Tersertifikasi & Berizin Praktik Resmi".

- [ ] **Step 3: Implement `src/app/(marketing)/dokter/[slug]/page.tsx`**

Detail view:
- Retrieve doctor by slug from `mockDoctors` (fallback to `notFound()`).
- Left profile card: Portrait, full credentials (SIP & STR), experience years, education history.
- Right content area: Biography & clinical approach.
- Weekly timetable schedule table displaying days, branches, and practice hours with "Booking Konsultasi" button.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
GIT_MASTER=1 git add src/components/grow/doctor-card.tsx src/app/\(marketing\)/dokter/page.tsx src/app/\(marketing\)/dokter/\[slug\]/page.tsx
GIT_MASTER=1 git commit -m "feat(grow): add doctors directory and profile pages with schedule table"
```

---

### Task 5: Locations & Insurance Directories

**Files:**
- Create: `src/components/grow/branch-card.tsx`
- Create: `src/components/grow/insurance-grid.tsx`
- Create: `src/app/(marketing)/lokasi/page.tsx`
- Create: `src/app/(marketing)/lokasi/[slug]/page.tsx`
- Create: `src/app/(marketing)/asuransi/page.tsx`

**Interfaces:**
- Consumes: `mockBranches`, `mockInsurances` from `src/data/mock-grow.ts`
- Produces: `/lokasi`, `/lokasi/[slug]`, `/asuransi` pages.

- [ ] **Step 1: Implement `branch-card.tsx` and `/lokasi/page.tsx`**

Display:
- Cards for Kelapa Gading and Pluit branches.
- Address, phone, WhatsApp direct link, hours badge.
- Facilities bullet list (Dental X-Ray, Parkir luas, Ruang ramah anak).
- "Petunjuk Arah" button opening Google Maps and "Lihat Detail Cabang" link.

- [ ] **Step 2: Implement `/lokasi/[slug]/page.tsx`**

Detail view:
- Branch detail by slug.
- Google Maps responsive iframe container / directions card.
- Comprehensive facilities breakdown.
- Doctors on duty at this branch with mini doctor cards.

- [ ] **Step 3: Implement `insurance-grid.tsx` and `/asuransi/page.tsx`**

Display:
- Hero: "Mitra Asuransi & Pembayaran Fleksibel".
- Partner cards showing insurance logos, badge (`Cashless` or `Reimbursement`), and supported branches.
- Step-by-step guide: "3 Langkah Mudah Klaim Asuransi di Klinik":
  1. Tunjukkan kartu asuransi / e-card saat kedatangan di resepsionis.
  2. Dokter melakukan tindakan sesuai plafon polis Anda.
  3. Kasir memproses swipe cashless langsung tanpa bayar di muka.
- FAQ accordion for insurance coverage and claim assistance.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
GIT_MASTER=1 git add src/components/grow/branch-card.tsx src/components/grow/insurance-grid.tsx src/app/\(marketing\)/lokasi/page.tsx src/app/\(marketing\)/lokasi/\[slug\]/page.tsx src/app/\(marketing\)/asuransi/page.tsx
GIT_MASTER=1 git commit -m "feat(grow): add clinic locations and insurance partner directory pages"
```

---

### Task 6: Visual Audit, Responsive Polish & Build Verification

**Files:**
- Modify: `src/app/(marketing)/page.tsx` (Refine home links and featured treatment cards)
- Verify: All public routes

- [ ] **Step 1: Verify all anchor links and cross-navigation**

Check that:
- Navbar links work across all pages: `/`, `/layanan`, `/dokter`, `/lokasi`, `/asuransi`.
- Service cards on home page link to `/layanan/[slug]`.
- Doctor profile schedules link to WhatsApp booking.
- Staff portal link navigates to `/login`.

- [ ] **Step 2: Run linter and typecheck**

Run: `npm run lint` and `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run full Next.js production build**

Run: `npm run build`
Expected: Clean build with exit code 0; all static and dynamic route pages generated cleanly.

- [ ] **Step 4: Commit**

```bash
GIT_MASTER=1 git add .
GIT_MASTER=1 git commit -m "chore(grow): verify and polish public patient frontend routes"
```
