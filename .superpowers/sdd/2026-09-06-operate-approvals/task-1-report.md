# Task 1 Execution Report: Approval Payloads, Server Actions with Two-Tier RBAC, and Seed Data

## Summary
Task 1 of the OPERATE Two-Tier Approval Workflows subsystem has been implemented and verified.

## Files Modified / Created
- `src/lib/approvals/types.ts`: Defined payload interfaces (`ProcurementPayload`, `MaintenancePayload`, `OtherPayload`, `ApprovalPayload`), type guards (`isProcurementPayload`, `isMaintenancePayload`, `isOtherPayload`), pure payload validator `validateApprovalPayload`, and pure RBAC helper `canUserReviewRequest`.
- `src/lib/actions/approvals.ts`: Implemented server actions with strict multi-tenant and branch scoping:
  - `submitApprovalRequest`: Validates organizationId, branch scoping for non-directors, payload validity, branch existence, creates request with `PENDING` status, and revalidates paths.
  - `reviewApprovalRequest`: Validates organizationId, enforces two-tier review permissions via `canUserReviewRequest` (Manager locked to assigned branch; Director/Super Admin org-wide), updates status/notes, and revalidates paths.
  - `fulfillProcurementToStock`: Validates organizationId, checks `APPROVED` status and `PROCUREMENT` type, prevents duplicate fulfillment, executes atomic `prisma.$transaction` updating inventory item stock, logging `RESTOCK` mutation in `InventoryLog`, and stamping `fulfilledAt` on the payload.
- `tests/approvals.test.ts`: Created Vitest test suite with 25 unit and action tests covering payload validation across all types, RBAC permission matrices, and server action behaviors.
- `prisma/seed.ts`: Seeded 2 demo `ApprovalRequest` records (1 `PENDING` `PROCUREMENT` request and 1 `APPROVED` `MAINTENANCE` request for Kelapa Gading branch).

## Verification Results
- Vitest: 25 tests passing in `tests/approvals.test.ts`, 57 tests passing across entire suite (6 test files).
- TypeScript: `npx tsc --noEmit` passed with 0 errors.
- Global constraints: Zero em-dashes (U+2014) verified across all touched files.

## Git Protocol
- Branch: `main`
- Commit Message: `feat(operate): add approval types, server actions with two-tier RBAC, and seed data`
