# Task 2 Brief: Shared Public Marketing Shell & Navigation

## Objective
Create the shared public patient marketing shell and navigation layout in `src/app/(marketing)/`:
1. `src/components/grow/public-header.tsx`: Interactive responsive navigation bar ("use client") with logo, links (`/`, `/layanan`, `/dokter`, `/lokasi`, `/asuransi`), active state via `usePathname()`, WhatsApp button, Portal Staf button (`/login`), and mobile hamburger toggle menu.
2. `src/components/grow/public-footer.tsx`: Comprehensive clinical footer with clinic bio, Kemenkes accreditation note, services list, branch hours & contacts, and copyright note.
3. `src/app/(marketing)/layout.tsx`: Shared marketing layout wrapping children between `PublicHeader` and `PublicFooter`.
4. `src/app/(marketing)/page.tsx`: Move the existing `src/app/page.tsx` to `src/app/(marketing)/page.tsx` and delete the old `src/app/page.tsx` (to avoid route conflict). Strip out the duplicate header from `page.tsx` so the shared `MarketingLayout` header takes its place cleanly. Update homepage CTA links to navigate to `/layanan`, `/dokter`, `/lokasi`, `/asuransi`.

## Requirements & Constraints
- Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`
- Typography: Strictly sans-serif (`font-sans`).
- Colors: Theme tokens (`primary`, `card`, `border`, `muted-foreground`, etc.).
- Next.js 16 App Router compliance: No duplicate root page. `src/app/page.tsx` must be removed when `src/app/(marketing)/page.tsx` is created.
- Verification: `npx tsc --noEmit` must pass with 0 errors. `npm run build` should succeed.
- Commit: `GIT_MASTER=1 git add src/components/grow/ src/app/\(marketing\)/ && GIT_MASTER=1 git rm src/app/page.tsx && GIT_MASTER=1 git commit -m "feat(grow): implement shared public marketing header, footer, and layout"`

## Report Output
Write full report to `.superpowers/sdd/2026-09-05-sprint-1-grow-frontend/task-2-report.md`.
Return short summary: status (DONE), commits, test summary, concerns.
