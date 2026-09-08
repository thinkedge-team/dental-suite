# Think Edge Dental Suite

Satu platform digital operasional terpadu untuk jaringan klinik gigi multi-cabang di Indonesia. Menghubungkan akuisisi pasien, reservasi janji temu real-time, manajemen shift & inventaris medis, hingga analitik eksekutif dalam satu ekosistem data yang modular dan terisolasi aman.

> **From business problems to production-ready software.**

---

## 1. Arsitektur 4 Modul Terpadu

Think Edge Dental Suite dibangun di atas prinsip **satu codebase, satu data model, dan satu sistem login** - bukan empat aplikasi terpisah yang terpecah (*anti-siloed*). Fitur diaktifkan secara dinamis per organisasi melalui lisensi modul (`moduleGrow`, `moduleConnect`, `moduleOperate`, `moduleIntelligence`):

| Modul | Pilar Solusi | Fitur Utama & Permukaan |
|---|---|---|
| **GROW** | *Patient Growth Engine* | Website publik berkecepatan tinggi (`/`, `/layanan`, `/dokter`, `/lokasi`, `/asuransi`, `/tentang`), optimasi SEO lokal, JSON-LD schema, sitemap dinamis, dan CMS katalog layanan klinis. |
| **CONNECT** | *Patient & Clinic Bridge* | Reservasi janji temu online 3-langkah (`/book`), pencegahan double-booking optimistik, pembatalan mandiri bertoken (`/cancel`), portal resepsionis (`/appointments`), check-in, walk-in, dan manajemen blok jadwal dokter (`/schedule`). |
| **OPERATE** | *Internal Operations* | Roster shift mingguan (`/operate/shifts`), jam presensi digital & live attendance board (`/operate/attendance`), inventaris medis dengan kalkulasi mutasi otomatis (`/operate/inventory`), serta persetujuan berjenjang (`/operate/approvals`). |
| **INTELLIGENCE** | *Executive Analytics* | Dasbor performa eksekutif (`/operate/analytics`), grafik tren pendapatan harian SVG, tingkat no-show, peringkat dokter, kontribusi layanan, rekam riwayat kunjungan pasien (`/patients/[id]`), dan ekspor laporan CSV (`/operate/reports`). |

---

## 2. Tech Stack Produksi

- **Framework:** Next.js 16 (App Router, Turbopack, React 19, TypeScript Strict Mode)
- **Styling & UI:** Tailwind CSS v4, Lucide React icons, Base UI primitives
- **Database & ORM:** PostgreSQL 16, Prisma 6 (dengan dual-connection pooling Neon & PgBouncer)
- **Autentikasi & Keamanan:** Auth.js v5 (NextAuth beta) dengan JWT session cookie, bcryptjs (12 salt rounds), HTTP security headers (HSTS, CSP, X-Frame-Options DENY)
- **Testing:** Vitest (16 files, 149 tests), Playwright Chromium E2E (4 scenario suites)
- **Infrastruktur Dev:** Docker Compose (PostgreSQL 16 pada host port 5435, MailHog SMTP port 1025/8025)

---

## 3. Akun Demonstrasi (Password: `demo123456`)

Database telah dilengkapi dengan data seed operasional lengkap untuk 3 cabang aktif di Jakarta:

| Peran (Role) | Email | Cabang Penugasan | Lingkup Akses |
|---|---|---|---|
| **SUPER_ADMIN** | `superadmin@demo.com` | Global (Think Edge Operator) | Akses konfigurasi platform tingkat tinggi |
| **DIRECTOR** | `director@demo.com` | Kantor Pusat (Semua Cabang) | Konsolidasi seluruh cabang, analitik pendapatan, ekspor data, kelola lisensi & staf |
| **MANAGER** | `manager@demo.com` | Cabang Kelapa Gading | Operasional cabang Kelapa Gading (shift, presensi, inventaris, persetujuan) |
| **MANAGER** | `manager.pluit@demo.com` | Cabang Pluit | Operasional cabang Pluit |
| **MANAGER** | `manager.senopati@demo.com` | Cabang Senopati | Operasional cabang Senopati |
| **STAFF** | `staff@demo.com` | Cabang Kelapa Gading | Meja resepsionis, check-in pasien, janji walk-in, pengajuan pengadaan |
| **STAFF** | `staff.pluit@demo.com` | Cabang Pluit | Meja resepsionis cabang Pluit |
| **STAFF** | `staff.senopati@demo.com` | Cabang Senopati | Meja resepsionis cabang Senopati |
| **DOCTOR** | `doctor.andi@demo.com` | Cabang Kelapa Gading | Dokter Gigi Umum, blok jadwal praktik personal |
| **DOCTOR** | `doctor.sarah@demo.com` | Cabang Pluit | Sp.KG (Konservasi Gigi), jadwal praktik & riwayat tindakan |
| **DOCTOR** | `doctor.budi@demo.com` | Cabang Senopati | Sp.BM (Bedah Mulut), jadwal tindakan odontektomi & implan |
| **DOCTOR** | `doctor.clara@demo.com` | Cabang Senopati | Sp.Ort (Ortodonti), jadwal pemasangan & kontrol behel |

---

## 4. Panduan Menjalankan Secara Lokal (Local Development)

### Prasyarat
- Node.js 20+ dan npm 10+
- Docker & Docker Compose

### Langkah Instalasi
```bash
# 1. Masuk ke direktori aplikasi
cd dental-suite

# 2. Salin environment file
cp .env.example .env

# 3. Jalankan container database PostgreSQL lokal
docker compose up -d

# 4. Pasang dependensi proyek
npm install

# 5. Terapkan migrasi database dan generate Prisma Client
npx prisma migrate dev

# 6. Jalankan seed database komprehensif
npx prisma db seed

# 7. Jalankan server pengembangan Next.js
npm run dev
```

Akses aplikasi di browser:
- Website Publik Pasien: `http://localhost:3000`
- Alur Reservasi Janji Temu: `http://localhost:3000/book`
- Portal Masuk Staf/Dokter: `http://localhost:3000/login`
- Web MailHog (Email Testing): `http://localhost:8025`

---

## 5. Rangkaian Pengujian (Testing Pyramid)

Proyek ini menerapkan piramida pengujian otomatis untuk menjamin keandalan sistem tanpa regresi:

### 5.1 Unit & Action Tests (Vitest)
Menjalankan 149 pengujian logika bisnis, otentikasi, sanitasi slug, kalkulasi stok, evaluasi ketepatan waktu presensi, generator tautan WhatsApp, dan hak akses RBAC:
```bash
npx vitest run
```

### 5.2 End-to-End Browser Testing (Playwright)
Menjalankan 4 skenario simulasi pengguna nyata secara sekuensial di atas browser Chromium:
```bash
# Menjalankan seluruh pengujian E2E headless
npx playwright test

# Menjalankan dengan antarmuka visual (UI Mode)
npx playwright test --ui
```

Skenario E2E yang diuji:
1. `e2e/patient-booking-cancel.spec.ts`: Reservasi 3-langkah pasien, carousel tanggal 14 hari, time slot chip, consent UU PDP, dan pembatalan mandiri bertoken di `/cancel`.
2. `e2e/receptionist-workflow.spec.ts`: Login staf, tabel janji temu, check-in pasien, penyelesaian kunjungan, dan pembuatan janji walk-in.
3. `e2e/director-analytics.spec.ts`: Login direktur, switcher cabang header persisten, grafik SVG analitik, dan ekspor laporan CSV.
4. `e2e/operations-inventory-shifts.spec.ts`: Login manajer, pencatatan mutasi obat, drawer riwayat stok, roster kalender shift, dan live attendance board.

---

## 6. Panduan Deployment: Vercel & Neon PostgreSQL

Aplikasi telah siap dipublikasikan ke Vercel Serverless dengan database Neon Serverless PostgreSQL.

1. **Prisma Binary Targets**: Telah mencakup `rhel-openssl-3.0.x` (runtime Vercel Lambda).
2. **Dual Connection String (Connection Pooling)**:
   - `DATABASE_URL`: Mengarah ke endpoint pooled Neon (PgBouncer) untuk melayani query aplikasi serverless tanpa kehabisan koneksi.
   - `DIRECT_URL`: Mengarah ke endpoint langsung Neon untuk eksekusi migrasi tabel DDL (`prisma migrate deploy`).
3. **Environment Variables di Vercel**:
   - `DATABASE_URL`: `postgresql://[user]:[password]@[endpoint]-pooler.region.neon.tech/neondb?sslmode=require`
   - `DIRECT_URL`: `postgresql://[user]:[password]@[endpoint].region.neon.tech/neondb?sslmode=require`
   - `AUTH_SECRET`: Generate via `openssl rand -base64 32`
   - `AUTH_TRUST_HOST`: `true`
   - `NEXTAUTH_URL`: `https://[nama-aplikasi].vercel.app`
   - `NEXT_PUBLIC_APP_URL`: `https://[nama-aplikasi].vercel.app`
   - `NEXT_PUBLIC_DEFAULT_ORG_SLUG`: `senyum-sehat`

Panduan teknis lengkap tersedia di `docs/plan/deployment-vercel-neon.md`.

---

## 7. Kepatuhan Regulasi & Standar Keamanan (Phase 6)

- **UU Pelindungan Data Pribadi (UU PDP No. 27/2022)**:
  - Checkbox persetujuan pemrosesan data eksplisit pada form booking pasien.
  - Pencatatan bukti audit timestamp `consentedAt` dan IP address `consentIp`.
  - Hak Dilupakan (*Right to Erasure*) melalui server action `anonymizePatient` yang menganonimkan identitas pribadi pasien seraya menjaga integritas rekam transaksi medis.
- **Permenkes No. 269/Menkes/Per/III/2008**:
  - Riwayat kunjungan klinis dan billing transaksi pasien dipertahankan dengan batas minimum retensi 5 tahun melalui mekanisme soft-delete (`deletedAt`).
- **OWASP Top 10 Defense-in-Depth**:
  - Pencegahan IDOR berbasis validasi multi-tenant `organizationId` dari JWT terenkripsi.
  - Pencegahan double-booking berbasis database unique constraint `@@unique([doctorId, scheduledAt])`.
  - HTTP Security Headers terkonfigurasi (HSTS, CSP, X-Frame-Options DENY).

Laporan audit lengkap tersedia di `docs/security/security-review.md`.
