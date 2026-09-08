# Panduan Deployment: Vercel & Neon PostgreSQL

> **Platform Target:** Vercel (Next.js 16 Serverless Runtime)  
> **Database Target:** Neon Serverless PostgreSQL (dengan PgBouncer Connection Pooling)  
> **Framework:** Next.js 16 (App Router), Prisma 6, Auth.js v5  

---

## 1. Arsitektur Koneksi Database Neon & Vercel

Pada arsitektur serverless seperti Vercel, fungsi backend Next.js dapat dibuat dan dimatikan secara instan sesuai lonjakan lalu lintas (*scale to zero*). Tanpa *connection pooler*, koneksi langsung ke PostgreSQL akan cepat habis (*connection exhaustion*).

Prisma pada proyek ini telah dikonfigurasi dengan dua saluran koneksi:
1. `DATABASE_URL` (**Pooled Connection String** via PgBouncer): Digunakan oleh aplikasi saat runtime untuk melayani kueri data pasien, janji temu, dan operasional.
2. `DIRECT_URL` (**Direct Unpooled Connection String**): Digunakan oleh Prisma CLI untuk menjalankan migrasi skema (`prisma migrate deploy`) karena PgBouncer tidak mendukung *advisory locks* migrasi.

---

## 2. Langkah Persiapan di Neon Console

1. Buka [Neon Console](https://console.neon.tech/) dan buat proyek baru (misal: `dental-suite-prod`).
2. Pilih region terdekat dengan pengguna (disarankan: **Singapore / ap-southeast-1**).
3. Pada halaman **Dashboard** proyek Neon:
   - Centang opsi **Pooled connection** untuk mendapatkan `DATABASE_URL`:
     ```
     postgresql://[user]:[password]@[endpoint]-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
   - Hilangkan centang **Pooled connection** untuk mendapatkan `DIRECT_URL`:
     ```
     postgresql://[user]:[password]@[endpoint].ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```

---

## 3. Langkah Migrasi Skema & Seeding Data Awal

Sebelum atau saat aplikasi terhubung ke Neon, jalankan migrasi tabel dan seed data awal dari terminal lokal:

```bash
# 1. Pasang connection string Neon sementara ke environment
export DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
export DIRECT_URL="postgresql://[user]:[password]@[endpoint].ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 2. Terapkan seluruh migrasi tabel Prisma ke database Neon
npx prisma migrate deploy

# 3. Jalankan seed data komprehensif (Organisasi, Cabang, Layanan, Dokter, Akun Demo)
npx prisma db seed
```

---

## 4. Konfigurasi Environment Variables di Vercel

Buka proyek Anda di **Vercel Dashboard** → **Settings** → **Environment Variables**, lalu tambahkan konfigurasi berikut untuk environment **Production** dan **Preview**:

| Variabel | Contoh Nilai | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgresql://...-pooler...neondb?sslmode=require` | Connection string pooled Neon (PgBouncer) |
| `DIRECT_URL` | `postgresql://...neondb?sslmode=require` | Connection string langsung (unpooled) |
| `AUTH_SECRET` | `openssl rand -base64 32` | Kunci enkripsi sesi JWT Auth.js v5 |
| `AUTH_TRUST_HOST` | `true` | Wajib aktif untuk Auth.js pada reverse proxy Vercel |
| `NEXTAUTH_URL` | `https://klinik-anda.vercel.app` | URL domain publik produksi Anda |
| `NEXT_PUBLIC_APP_URL` | `https://klinik-anda.vercel.app` | Base URL untuk SEO, sitemap, dan canonical URL |
| `NEXT_PUBLIC_DEFAULT_ORG_SLUG` | `senyum-sehat` | Slug organisasi default untuk website publik |

---

## 5. Build & Output Settings di Vercel

Proyek ini telah dikonfigurasi secara otomatis:
- **Build Command:** `prisma generate && next build` (dikonfigurasi dalam `package.json`).
- **Postinstall Hook:** `prisma generate` dijalankan saat `npm install` di Vercel.
- **Prisma Binary Targets:** Mencakup `rhel-openssl-3.0.x` yang merupakan target biner runtime AWS Lambda / Vercel Serverless.

---

## 6. Verifikasi Pasca-Deployment

Setelah deployment selesai di Vercel:
1. Kunjungi halaman beranda publik (`/`) dan pastikan data layanan, dokter, serta lokasi cabang termuat langsung dari database Neon.
2. Akses halaman reservasi `/book`, pilih cabang, dan buat janji temu uji coba.
3. Buka `/login` dan masuk menggunakan akun Direktur (`director@demo.com` / `demo123456`) atau Manajer (`manager@demo.com` / `demo123456`).
4. Periksa dasbor eksekutif `/operate/analytics` dan pastikan metrik konsolidasi seluruh cabang tampil dengan responsif.
