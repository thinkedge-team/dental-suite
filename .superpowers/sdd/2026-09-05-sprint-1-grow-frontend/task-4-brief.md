# Task 4 Brief: Doctors Directory & Detail Profile Pages

## Objective
Implement the Doctors discovery directory and doctor profile pages:
1. `src/components/grow/doctor-card.tsx`:
   - Component rendering `MockDoctor`
   - Clinical portrait/avatar with framed presentation
   - Doctor full name with title, specialty badge
   - Kemenkes licensing status ("SIP & STR Terverifikasi") with `ShieldCheck` icon
   - Practice branches list with `MapPin` icon
   - Years of experience badge
   - "Lihat Profil & Jadwal" action link pointing to `/dokter/${doctor.slug}`
2. `src/app/(marketing)/dokter/page.tsx`:
   - "use client" for interactive filtering by Branch (Semua, Kelapa Gading, Pluit) and Specialty (Semua, Konservasi Gigi, Bedah Mulut, Ortodonti)
   - Header with title: "Tim Dokter Gigi Spesialis Kami" and subtitle describing credential standards
   - Responsive grid of `DoctorCard`
   - Trust banner: "Seluruh dokter gigi di Klinik Gigi Senyum Sehat memegang Surat Izin Praktik (SIP) aktif dan tersertifikasi oleh Konsil Kedokteran Indonesia (KKI)."
3. `src/app/(marketing)/dokter/[slug]/page.tsx`:
   - Next.js 16 dynamic page: `export default async function DoctorDetailPage({ params }: { params: Promise<{ slug: string }> })`
   - `const { slug } = await params;`
   - Lookup doctor from `mockDoctors` by slug (trigger `notFound()` if not found)
   - Breadcrumb: `Beranda > Dokter > [Doctor Name]`
   - 2-column layout:
     - Left: Sticky profile card with portrait, title, SIP & STR numbers, years of experience, education history list, and "Booking Konsultasi" WhatsApp CTA
     - Right: Detailed biography & clinical philosophy, plus Practice Schedule Table (Day, Branch, Practice Hours, Status "Tersedia") with quick appointment trigger

## Requirements & Constraints
- Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`
- Strictly sans-serif (`font-sans`).
- Colors: master brand tokens (`primary`, `card`, `border`, etc.).
- Next.js 16 App Router compliance: dynamic route parameters in Next.js 16 (`params: Promise<{ slug: string }>`) must be awaited.
- Verification: `npx tsc --noEmit` and `npm run build` must pass with 0 errors.
- Commit: `GIT_MASTER=1 git add src/components/grow/doctor-card.tsx src/app/\(marketing\)/dokter/ && GIT_MASTER=1 git commit -m "feat(grow): add doctors directory and profile pages with schedule table"`

## Report Output
Write full report to `.superpowers/sdd/2026-09-05-sprint-1-grow-frontend/task-4-report.md`.
Return short summary: status (DONE), commits, test summary, concerns.
