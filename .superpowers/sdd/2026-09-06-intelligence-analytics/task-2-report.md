# Task 2 Report: Server Actions, Patient Detail Timeline, and Row Links

## Summary
Completed Task 2 for INTELLIGENCE Module in dental-suite:
- Created `src/lib/actions/intelligence.ts` with `updatePatientNotes` action supporting session verification, organization scoping, empty string normalization to null, and cache revalidation.
- Created `src/lib/actions/reports.ts` with 3 CSV export actions (`exportAppointmentsCsv`, `exportVisitsCsv`, `exportInventoryCsv`) with role guard (`DIRECTOR`, `MANAGER`, `SUPER_ADMIN`), manager branch locking, WIB day bounds parsing, formula injection sanitization via `encodeCsv`, and UTF-8 BOM encoding.
- Created `src/app/(portal)/patients/[id]/patient-notes-form.tsx` client component for inline clinical notes/medical alerts editing with feedback toast.
- Created `src/app/(portal)/patients/[id]/page.tsx` server component with Next.js 16 awaited `params`, demographic cards, 3 KPI stats, upcoming appointments, and longitudinal visit timeline.
- Updated `src/app/(portal)/patients/page.tsx` with clickable patient names and explicit "Detail" link.
- Added comprehensive unit tests in `tests/intelligence-actions.test.ts` (9 tests covering authorization, branch scoping, note trimming, and CSV generation).

## Verification
- `npx vitest run`: 9 test files passed, 82 total tests passed.
- `npx tsc --noEmit`: Clean, 0 errors.
- `npm run build`: Production build succeeded.
- `npx eslint`: 0 errors on all touched files.
- Zero em-dashes (U+2014) verified.

## Git Commit
- Hash: `13e38b0`
- Message: `feat(intelligence): add patient detail timeline, notes editor, and CSV report export actions`

## Fix Round 1
- Issue: TypeScript compilation failure (TS2353) where `ActionContext` in `src/lib/actions/reports.ts` lacked `id?: string;`.
- Resolution: Added `id?: string;` to `ActionContext.session.user` in `src/lib/actions/reports.ts`.
- Verification:
  - `npx tsc --noEmit`: Clean (code 0).
  - `npx vitest run tests/intelligence-actions.test.ts`: 9/9 tests passed.
  - Zero em-dashes (U+2014) verified.
