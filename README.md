# Think Edge Dental Suite

Satu platform digital untuk jaringan klinik gigi multi-cabang. Dari mendapatkan pasien hingga mengelola operasional klinik — Think Edge menghubungkan proses, sistem, dan data dalam satu ekosistem digital modular.

> **From business problems to production-ready software.**

## Architecture: One Platform, Four Sellable Modules

Satu codebase, satu data model, satu login — bukan empat aplikasi terpisah. Modul dijual à la carte per organisasi (klinik), diaktifkan lewat flag `moduleGrow` / `moduleConnect` / `moduleOperate` / `moduleIntelligence` pada model `Organization`. Data tidak pernah siloed: membeli hanya OPERATE tidak berarti tabel CONNECT dihapus, hanya navigasinya yang disembunyikan.

| Pillar | Modul | Permukaan |
|---|---|---|
| **GROW** | Patient Growth Engine — SEO lokal, website performa tinggi, konversi | Patient web (publik) |
| **CONNECT** | Appointment & booking multi-cabang real-time, reminder WA/Email, check-in | Patient web (alur booking) |
| **OPERATE** | Shift dokter/perawat, absensi, inventory medis, workflow persetujuan | Staff portal (cabang) |
| **INTELLIGENCE** | Dashboard analytics & data pasien terstruktur | Management console |

**INTELLIGENCE** tidak pernah dijual standalone — ia agregasi dari CONNECT/OPERATE, dashboards kosong tanpa sumber data.

## Struktur

```
src/
├── app/
│   ├── (marketing)/      # Patient web: halaman publik (GROW/CONNECT)
│   ├── (portal)/         # Staff portal + management console (OPERATE/INTELLIGENCE)
│   ├── (auth)/           # Login
│   └── api/              # API routes (auth, integrasi)
├── auth.ts               # NextAuth v5 (Credentials + JWT, RBAC)
├── auth.config.ts        # Middleware authorization rules
├── generated/prisma/     # Prisma Client (generated)
└── lib/prisma.ts         # Prisma singleton
```

Peran RBAC: `SUPER_ADMIN` (operator Think Edge), `DIRECTOR` (pusat/jaringan), `MANAGER` (cabang), `STAFF` (resepsionis/perawat), `DOCTOR` (klinis).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **PostgreSQL** + **Prisma 6** (ORM)
- **Auth.js v5** (NextAuth beta) — Credentials + JWT
- **Zod** (validasi), **bcryptjs** (password)

## Getting Started

```bash
cp .env.example .env        # isi DATABASE_URL + AUTH_SECRET
npm install
npx prisma migrate dev      # buat tabel dari prisma/schema.prisma
npm run dev                 # http://localhost:3000
```

## Status

Foundation scaffold. Modul CONNECT (booking) dan OPERATE (ops) masih dalam pengembangan — lihat `prisma/schema.prisma` untuk model yang sudah dirancang.

## Terkait

- `thinkedge-team/mockup-lp-ocean-dental` — CMS Laravel Ocean Dental (referensi konten GROW: layanan, dokter, lokasi, mitra asuransi)
- `thinkedge-team/cp-thinkedge` — company profile Think Edge
