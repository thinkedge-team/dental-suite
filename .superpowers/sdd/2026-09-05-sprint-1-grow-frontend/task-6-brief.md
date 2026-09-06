# Task 6 Brief: Visual Audit, Responsive Polish & Build Verification

## Objective
Perform visual audit, cross-navigation link verification, and production build checks across all public patient marketing pages:
1. Check that all internal links connect seamlessly:
   - Header logo -> `/`
   - Header links -> `/layanan`, `/dokter`, `/lokasi`, `/asuransi`
   - Homepage treatment cards -> `/layanan/[slug]`
   - Homepage branch links -> `/lokasi/[slug]`
   - Service cards on `/layanan` -> `/layanan/[slug]`
   - Doctor cards on `/dokter` -> `/dokter/[slug]`
   - Branch cards on `/lokasi` -> `/lokasi/[slug]`
   - Doctor schedule table on `/dokter/[slug]` links to booking or WhatsApp
   - "Portal Staf" links consistently route to `/login`
2. Verify strict sans-serif adherence (`font-sans`) and brand color variables (`var(--color-primary)` etc.).
3. Run lint check (`npm run lint`), TypeScript check (`npx tsc --noEmit`), and production build (`npm run build`).

## Requirements & Constraints
- Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`
- Verification: Clean exit code 0 on `npm run build`.
- Commit: `GIT_MASTER=1 git commit -m "chore(grow): verify and polish public patient frontend routes"` (if changes made).

## Report Output
Write full report to `.superpowers/sdd/2026-09-05-sprint-1-grow-frontend/task-6-report.md`.
Return short summary: status (DONE), commits, test summary, concerns.
