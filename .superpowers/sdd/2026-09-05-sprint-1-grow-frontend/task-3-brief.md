# Task 3 Brief: Services Directory & Detail Pages

## Objective
Implement the Dental Services discovery directory and procedure detail pages:
1. `src/components/grow/service-card.tsx`:
   - Component rendering `MockService`
   - Category pill badge (`bg-primary/10 text-primary border border-primary/20 text-xs font-semibold`)
   - Procedure name, short description
   - Estimated duration badge (`Clock` icon) + Insurance indicator (`ShieldCheck`)
   - Formatted price in IDR (`new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.basePrice)`)
   - Link to `/layanan/${service.slug}` with hover animation and arrow icon
2. `src/app/(marketing)/layanan/page.tsx`:
   - Category filter tabs (`['Semua', 'Pencegahan', 'Restorasi', 'Estetika', 'Bedah Mulut']`)
   - Search input for instant query filtering
   - Responsive grid of `ServiceCard` (1 col mobile, 2 col tablet, 3 col desktop)
   - Empty state when no service matches filter
   - WhatsApp quick consultation banner CTA
3. `src/app/(marketing)/layanan/[slug]/page.tsx`:
   - Dynamic route for single procedure details
   - Lookup service from `mockServices` by slug (trigger `notFound()` if absent)
   - Breadcrumb navigation (`Beranda > Layanan > [Service Name]`)
   - Hero header: Category badge, title, formatted price, duration, and direct WhatsApp CTA button
   - 2-column layout:
     - Left: About procedure, indications list, step-by-step treatment phases, and FAQ accordion
     - Right: Sticky summary card with price, estimated time, insurance coverage badge, and WhatsApp booking trigger

## Requirements & Constraints
- Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`
- Strictly sans-serif (`font-sans`).
- Colors: master brand tokens (`primary`, `card`, `border`, etc.).
- Next.js 16 App Router compliance: dynamic route parameters in Next.js 16 (`params: Promise<{ slug: string }>`) must be awaited (`const { slug } = await params;`).
- Verification: `npx tsc --noEmit` must pass with 0 errors. `npm run build` must succeed.
- Commit: `GIT_MASTER=1 git add src/components/grow/service-card.tsx src/app/\(marketing\)/layanan/ && GIT_MASTER=1 git commit -m "feat(grow): add dental services directory and detail pages"`

## Report Output
Write full report to `.superpowers/sdd/2026-09-05-sprint-1-grow-frontend/task-3-report.md`.
Return short summary: status (DONE), commits, test summary, concerns.
