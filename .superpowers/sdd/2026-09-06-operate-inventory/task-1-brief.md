# Task 1 Brief: Prisma Schema & Seed Update for Inventory & Stock Logs

## Context
Sub-Project 3A of OPERATE module in `dental-suite`.
Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`

## Files to touch
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`

## Requirements
1. `prisma/schema.prisma`:
   - Add relation `inventoryLogs InventoryLog[]` to model `User`.
   - Update model `InventoryItem`:
     - Add `category String @default("Umum")`
     - Add `logs InventoryLog[]`
     - Add index `@@index([branchId, category])`
   - Add model `InventoryLog`:
     ```prisma
     model InventoryLog {
       id            String           @id @default(cuid())
       itemId        String
       item          InventoryItem    @relation(fields: [itemId], references: [id], onDelete: Cascade)
       userId        String
       user          User             @relation(fields: [userId], references: [id])
       type          InventoryLogType
       quantity      Int
       previousStock Int
       currentStock  Int
       notes         String?
       createdAt     DateTime         @default(now())

       @@index([itemId, createdAt])
       @@index([userId])
     }

     enum InventoryLogType {
       USAGE
       RESTOCK
       ADJUSTMENT
       DAMAGED
     }
     ```
   - Run `npx prisma generate` to rebuild `src/generated/prisma`.

2. `prisma/seed.ts`:
   - In organization creation/upsert: set `moduleOperate: true`.
   - Seed realistic dental inventory items across `branch1` (Kelapa Gading) and `branch2` (Pluit):
     - *Anestesi & Farmasi*:
       - "Lidocaine HCl 2% + Epinephrine" (SKU: "MED-LIDO-01", stock: 8, minStock: 20, unit: "ampul", category: "Anestesi & Farmasi") -> low stock!
       - "Mepivacaine 3% Non-Vasoconstrictor" (SKU: "MED-MEPI-02", stock: 25, minStock: 15, unit: "ampul", category: "Anestesi & Farmasi")
       - "Amoxicillin 500mg" (SKU: "MED-AMOX-03", stock: 50, minStock: 30, unit: "strip", category: "Anestesi & Farmasi")
     - *Bahan Tambal & Restorasi*:
       - "Composite Resin Filtek Z250 A2" (SKU: "MAT-COMP-A2", stock: 6, minStock: 5, unit: "syringe", category: "Bahan Tambal & Restorasi")
       - "Bonding Agent Universal" (SKU: "MAT-BOND-01", stock: 3, minStock: 4, unit: "botol", category: "Bahan Tambal & Restorasi") -> low stock!
       - "Etching Gel 37%" (SKU: "MAT-ETCH-01", stock: 12, minStock: 5, unit: "syringe", category: "Bahan Tambal & Restorasi")
     - *Habis Pakai & Sterilisasi*:
       - "Dental Needle 30G Short" (SKU: "DISP-NDL-30", stock: 150, minStock: 50, unit: "pcs", category: "Habis Pakai & Sterilisasi")
       - "Latex Examination Gloves M" (SKU: "DISP-GLV-M", stock: 0, minStock: 10, unit: "box", category: "Habis Pakai & Sterilisasi") -> out of stock!
       - "Masker Medis 3-Ply Earloop" (SKU: "DISP-MASK-01", stock: 20, minStock: 10, unit: "box", category: "Habis Pakai & Sterilisasi")
       - "Pouch Sterilisasi Autoclave 90x230mm" (SKU: "STER-PCH-01", stock: 80, minStock: 30, unit: "pcs", category: "Habis Pakai & Sterilisasi")
     - *Ortodonti*:
       - "Bracket Metal MBT 0.022 Kit" (SKU: "ORTH-BRK-01", stock: 15, minStock: 10, unit: "set", category: "Ortodonti")
       - "Niti Archwire 0.014 Upper" (SKU: "ORTH-WIRE-01", stock: 30, minStock: 20, unit: "pcs", category: "Ortodonti")
     - *Instrumen Bedah*:
       - "Blade Bisturi No. 15" (SKU: "SURG-BLD-15", stock: 45, minStock: 25, unit: "pcs", category: "Instrumen Bedah")
       - "Benang Jahit Silk 3-0" (SKU: "SURG-SLK-30", stock: 2, minStock: 8, unit: "pcs", category: "Instrumen Bedah") -> low stock!
   - Seed corresponding `InventoryLog` records for initial stock (type `RESTOCK`, previousStock 0, currentStock equals item.stock).

3. Global Constraints:
   - Zero em-dashes (U+2014) in any code or strings. Use `-` or `·`.
   - TypeScript strict mode.
   - Commit with:
     `GIT_MASTER=1 git commit -m "feat(operate): add inventory category, inventory logs schema, and seed data"`
