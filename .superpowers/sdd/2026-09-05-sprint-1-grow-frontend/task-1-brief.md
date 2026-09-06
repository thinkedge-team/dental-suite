# Task 1 Brief: Typed Mock Dataset & Data Contracts

## Objective
Implement `src/data/mock-grow.ts` in `dental-suite` containing typed mock data arrays mirroring Prisma models for the GROW module:
- `MockService` & `mockServices` (4 services: Scaling, Tambal Gigi Estetis, Bleaching Gigi, Odontektomi)
- `MockDoctor` & `mockDoctors` (3 doctors: drg. Sarah Amanda, drg. Budi Santoso, drg. Jessica Tan with SIP, STR, schedules)
- `MockBranch` & `mockBranches` (2 branches: Kelapa Gading and Pluit with addresses, phone, facilities, hours)
- `MockInsurance` & `mockInsurances` (6 partners: Prudential, Allianz, Mandiri Inhealth, Sinarmas, BPJS Kesehatan, FWD)

## Requirements & Constraints
- Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`
- Language: TypeScript strict
- Verification: Run `npx ts-node -e "const { mockServices, mockDoctors, mockBranches, mockInsurances } = require('./src/data/mock-grow'); console.log({ services: mockServices.length, doctors: mockDoctors.length, branches: mockBranches.length, insurances: mockInsurances.length });"`
- Commit: `GIT_MASTER=1 git add src/data/mock-grow.ts && GIT_MASTER=1 git commit -m "feat(grow): add typed mock datasets for patient marketing pages"`

## Report Output
Write full report to `.superpowers/sdd/2026-09-05-sprint-1-grow-frontend/task-1-report.md`.
Return short summary: status (DONE), commits, test output, concerns.
