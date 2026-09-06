# Task 5 Brief: Clinic Locations & Insurance Partner Directory Pages

## Objective
Implement clinic locations and insurance partner pages:
1. `src/components/grow/branch-card.tsx`:
   - Component rendering `MockBranch`
   - Branch name, city badge
   - Complete physical address with `MapPin` icon
   - Phone and WhatsApp quick-contact links
   - Operational hours badge (`Clock` icon)
   - Facilities chip list (e.g. Dental X-Ray, Ruang Autoklaf, Parkir Luas)
   - "Detail Cabang & Peta" button pointing to `/lokasi/${branch.slug}`
2. `src/components/grow/insurance-grid.tsx`:
   - Grid rendering `mockInsurances`
   - Partner cards featuring badge (`CASHLESS` in emerald or `REIMBURSEMENT` in sky blue)
   - Partner name, supported branches list, and claim processing speed indicator
3. `src/app/(marketing)/lokasi/page.tsx`:
   - Hero: "Jaringan Cabang Klinik Gigi Senyum Sehat"
   - Grid of `BranchCard` for Kelapa Gading and Pluit
   - Network advantages section: Rekam Medis Terintegrasi antar cabang, Standar Sterilisasi Kemenkes Seragam
4. `src/app/(marketing)/lokasi/[slug]/page.tsx`:
   - Next.js 16 dynamic page: `export default async function BranchDetailPage({ params }: { params: Promise<{ slug: string }> })`
   - `const { slug } = await params;`
   - Lookup branch from `mockBranches` (fallback to `notFound()`)
   - Breadcrumb: `Beranda > Cabang & Lokasi > [Branch Name]`
   - Branch details: address, contact numbers, hours, full list of facilities with icons
   - Doctors practicing at this branch (queried from `mockDoctors.filter(d => d.branches.includes(branchName))`)
   - Google Maps action card / directions prompt
5. `src/app/(marketing)/asuransi/page.tsx`:
   - Hero: "Mitra Asuransi & Kemudahan Pembayaran"
   - Partner grid via `<InsuranceGrid />`
   - Step-by-step guide: "3 Langkah Mudah Klaim Asuransi Tanpa Ribet":
     1. Verifikasi Kepesertaan di Meja Resepsionis
     2. Perawatan oleh Dokter Spesialis sesuai Plafon Polis
     3. Swipe Cashless / Penyelesaian Dokumen Reimbursement Instan
   - FAQ accordion on insurance terms and coordination of benefits (BPJS + Asuransi Swasta)

## Requirements & Constraints
- Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`
- Strictly sans-serif (`font-sans`).
- Colors: master brand tokens (`primary`, `card`, `border`, etc.).
- Next.js 16 App Router compliance: dynamic params awaited.
- Verification: `npx tsc --noEmit` and `npm run build` must pass cleanly.
- Commit: `GIT_MASTER=1 git add src/components/grow/branch-card.tsx src/components/grow/insurance-grid.tsx src/app/\(marketing\)/lokasi/ src/app/\(marketing\)/asuransi/ && GIT_MASTER=1 git commit -m "feat(grow): add clinic locations and insurance partner directory pages"`

## Report Output
Write full report to `.superpowers/sdd/2026-09-05-sprint-1-grow-frontend/task-5-report.md`.
Return short summary: status (DONE), commits, test summary, concerns.
