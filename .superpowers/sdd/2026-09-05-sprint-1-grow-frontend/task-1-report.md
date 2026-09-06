# Task 1 Report: Typed Mock Dataset & Data Contracts

## Status: DONE

## Deliverable
Implemented `src/data/mock-grow.ts` containing typed mock datasets and data contracts mirroring Prisma models for the GROW module.

### Exported Contracts
- `MockService` & `mockServices` (4 dental treatments: Scaling, Tambal Gigi Estetis, Bleaching Gigi, Odontektomi)
- `MockDoctor` & `mockDoctors` (3 specialist doctors: drg. Sarah Amanda, Sp.KG, drg. Budi Santoso, Sp.BM, drg. Jessica Tan, Sp.Ort)
- `MockBranch` & `mockBranches` (2 clinic locations: Kelapa Gading and Pluit)
- `MockInsurance` & `mockInsurances` (6 insurance partners: Prudential, Allianz, Mandiri Inhealth, Sinarmas, BPJS Kesehatan, FWD)

## Verification
1. **Contract Integrity via ts-node**:
   ```bash
   npx ts-node -e "const { mockServices, mockDoctors, mockBranches, mockInsurances } = require('./src/data/mock-grow'); console.log({ services: mockServices.length, doctors: mockDoctors.length, branches: mockBranches.length, insurances: mockInsurances.length });"
   ```
   Output:
   ```json
   { "services": 4, "doctors": 3, "branches": 2, "insurances": 6 }
   ```

2. **Type Checking**:
   ```bash
   npx tsc --noEmit
   ```
   Output: Exit code 0 (clean, no diagnostics/errors).

3. **LSP Diagnostics**:
   Clean on `src/data/mock-grow.ts`.

## Git Commit
- Hash: `a426429545d4304eb62b761a1b9ec3146e4306d0`
- Message: `feat(grow): add typed mock datasets for patient marketing pages`
