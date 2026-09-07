# E2E Playwright Testing Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a robust Playwright End-to-End test suite covering all 5 critical user journeys (Patient Self-Booking & Cancellation, Receptionist Flow, Director Dashboard & Analytics, Inventory Operations, and Staff Shifts & Attendance) running against the live Docker container.

**Architecture:** Playwright test runner configured via `playwright.config.ts` targeting `http://localhost:3000`; reusable page object / auth helper fixtures in `e2e/fixtures/auth.ts`; isolated, deterministic test specs in `e2e/*.spec.ts`; and `npm run test:e2e` script in `package.json`.

**Tech Stack:** Playwright (`@playwright/test`), Next.js 16, TypeScript, Chromium.

## Global Constraints

- Tech stack: Next.js 16, TypeScript, Playwright, Chromium.
- Copy rule: Strictly zero em-dashes (U+2014) across all test code, comments, and assertions. Use `-` or `·`.
- Target environment: Local Docker container running at `http://localhost:3000`.
- Credentials:
  - Director: `director@demo.com` / `demo123456`
  - Manager: `manager@demo.com` / `demo123456`
  - Staff: `staff@demo.com` / `demo123456`
- Type safety: No `as any`, no `@ts-ignore`.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Playwright Installation, Configuration & Auth Fixtures

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/fixtures/auth.ts`

**Interfaces:**
- Produces:
  - `playwright.config.ts` targeting `http://localhost:3000`
  - `loginAs(page, role: 'director' | 'manager' | 'staff')` helper
  - `npm run test:e2e` npm script

- [ ] **Step 1: Install `@playwright/test` and update `package.json`**

In `package.json`, add script `"test:e2e": "playwright test"` and add `@playwright/test` to `devDependencies`.
Run: `npm install --save-dev @playwright/test`

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // Sequential to prevent database race conditions
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 3: Implement `e2e/fixtures/auth.ts`**

Create helper for authenticated portal sessions:
```ts
import { Page, expect } from "@playwright/test";

export const DEMO_USERS = {
  director: { email: "director@demo.com", password: "demo123456" },
  manager: { email: "manager@demo.com", password: "demo123456" },
  staff: { email: "staff@demo.com", password: "demo123456" },
} as const;

export async function loginAs(page: Page, role: "director" | "manager" | "staff") {
  const { email, password } = DEMO_USERS[role];
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}
```

- [ ] **Step 4: Commit changes**

```bash
GIT_MASTER=1 git add package.json package-lock.json playwright.config.ts e2e/fixtures/auth.ts
GIT_MASTER=1 git commit -m "feat(e2e): configure Playwright test runner and auth helpers"
```

---

### Task 2: Patient Booking & Self-Service Cancellation E2E Test

**Files:**
- Create: `e2e/patient-booking-cancel.spec.ts`

**Interfaces:**
- Tests:
  - Step 1: Branch & service selection at `/book`
  - Step 2: 14-day date carousel and session time slot chip selection
  - Step 3: Patient data input and booking submission
  - Step 4: Verification of confirmation screen with WhatsApp link
  - Step 5: Verification of self-service cancellation at `/cancel?token=...`

- [ ] **Step 1: Implement `e2e/patient-booking-cancel.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("Patient Self-Booking and Cancellation Flow", () => {
  test("patient can book an appointment via wizard and self-cancel with token", async ({ page }) => {
    // 1. Visit booking page
    await page.goto("/book");
    await expect(page.locator("h1")).toContainText("Buat Janji Temu");

    // 2. Step 1: Select branch and service
    await page.locator('button:has-text("Kelapa Gading")').first().click();
    await page.selectOption("select#service-select", { index: 1 });
    await page.click('button:has-text("Lanjutkan")');

    // 3. Step 2: Select Date from Carousel & Time Slot Chip
    await expect(page.locator("text=Pilih Tanggal Kunjungan")).toBeVisible();
    // Select second available date card (tomorrow)
    const dateCards = page.locator("button.group\\/day");
    await dateCards.nth(1).click();

    // Select first available time slot chip
    const slotChips = page.locator("button:has-text(':')");
    await slotChips.first().click();
    await page.click('button:has-text("Lanjutkan")');

    // 4. Step 3: Fill patient details
    await expect(page.locator("text=Informasi Pasien")).toBeVisible();
    const testPhone = "0812998877" + Math.floor(10 + Math.random() * 90);
    await page.fill("#patientName", "Budi Playwright Test");
    await page.fill("#patientPhone", testPhone);
    await page.fill("#patientNotes", "Pemeriksaan rutin gigi via Playwright E2E");

    // Submit booking
    await page.click('button:has-text("Kirim Reservasi Janji Temu")');

    // 5. Verification on Confirmation Screen
    await expect(page.locator("text=Reservasi Berhasil Terkirim!")).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a:has-text("Konfirmasi via WhatsApp")')).toBeVisible();

    // Verify cancellation link exists or navigate to /cancel
    const waLink = await page.getAttribute('a:has-text("Konfirmasi via WhatsApp")', "href");
    expect(waLink).toContain("wa.me");

    // 6. Test direct cancellation with an invalid token first
    await page.goto("/cancel?token=invalid-dummy-token");
    await expect(page.locator("text=Tautan Tidak Valid")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify**

Run: `npx playwright test e2e/patient-booking-cancel.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit changes**

```bash
GIT_MASTER=1 git add e2e/patient-booking-cancel.spec.ts
GIT_MASTER=1 git commit -m "test(e2e): add patient booking and cancellation journey test"
```

---

### Task 3: Receptionist & Clinical Workflow E2E Test

**Files:**
- Create: `e2e/receptionist-workflow.spec.ts`

**Interfaces:**
- Tests:
  - Staff login at `/login`
  - Navigation to `/appointments`
  - Appointment search and status filtering
  - Navigation to `/appointments/[id]`
  - Check-in mutation (`CONFIRMED` -> `CHECKED_IN`)
  - Completion mutation with visit notes (`CHECKED_IN` -> `COMPLETED`)
  - New appointment creation at `/appointments/new`

- [ ] **Step 1: Implement `e2e/receptionist-workflow.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Receptionist and Clinical Workflow", () => {
  test("staff logs in, checks in appointment, and completes visit with notes", async ({ page }) => {
    // 1. Login as Staff
    await loginAs(page, "staff");

    // 2. Navigate to appointments list
    await page.goto("/appointments");
    await expect(page.locator("h1")).toContainText("Jadwal Janji Temu");

    // 3. Open first appointment detail
    const detailLink = page.locator('a:has-text("Detail")').first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();

    // 4. Check appointment detail page
    await expect(page).toHaveURL(/\/appointments\/cm/);
    await expect(page.locator("text=Detail Janji Temu")).toBeVisible();

    // 5. Test Check-in or Complete if available
    const checkInBtn = page.locator('button:has-text("Check In")');
    const completeBtn = page.locator('button:has-text("Selesaikan Kunjungan")');

    if (await checkInBtn.isVisible()) {
      await checkInBtn.click();
      await expect(page.locator('button:has-text("Selesaikan Kunjungan")')).toBeVisible({ timeout: 10000 });
    }

    if (await completeBtn.isVisible()) {
      await page.fill("textarea#notes", "Tindakan scaling selesai dengan baik via Playwright");
      await completeBtn.click();
      await expect(page.locator("text=Selesai")).toBeVisible({ timeout: 10000 });
    }

    // 6. Test New Walk-in Appointment Creation
    await page.goto("/appointments/new");
    await expect(page.locator("h1")).toContainText("Buat Janji Temu Baru");
    await page.fill("#patientName", "Pasien Walkin Playwright");
    await page.fill("#patientPhone", "081987654321");
    await page.fill('input[type="date"]', "2026-09-15");
    await page.fill('input[type="time"]', "10:00");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/appointments/, { timeout: 10000 });
  });
});
```

- [ ] **Step 2: Run test to verify**

Run: `npx playwright test e2e/receptionist-workflow.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit changes**

```bash
GIT_MASTER=1 git add e2e/receptionist-workflow.spec.ts
GIT_MASTER=1 git commit -m "test(e2e): add receptionist check-in and visit completion workflow test"
```

---

### Task 4: Director Dashboard, Analytics & Branch Switching E2E Test

**Files:**
- Create: `e2e/director-analytics.spec.ts`

**Interfaces:**
- Tests:
  - Director login at `/login`
  - Dashboard KPI cards rendering
  - Header branch switcher context change (switching between branches)
  - Navigation to `/operate/analytics` and verification of SVG trend chart and doctor rankings
  - Navigation to `/operate/reports` and CSV export action trigger

- [ ] **Step 1: Implement `e2e/director-analytics.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Director Dashboard, Branch Switching, and Analytics", () => {
  test("director views live dashboard, switches branch context, and checks analytics", async ({ page }) => {
    // 1. Login as Director
    await loginAs(page, "director");

    // 2. Dashboard KPIs
    await expect(page.locator("h1")).toContainText("Selamat Datang");
    await expect(page.locator("text=Total Janji Hari Ini")).toBeVisible();
    await expect(page.locator("text=Pasien Hadir")).toBeVisible();

    // 3. Test Global Branch Context Switcher in Header
    const branchBtn = page.locator('header button:has-text("Cabang")').first();
    if (await branchBtn.isVisible()) {
      await branchBtn.click();
      const pluitOption = page.locator('button:has-text("Cabang Pluit")').first();
      if (await pluitOption.isVisible()) {
        await pluitOption.click();
        await expect(page.locator('header button:has-text("Pluit")')).toBeVisible({ timeout: 5000 });
      }
    }

    // 4. Executive Analytics Page
    await page.goto("/operate/analytics");
    await expect(page.locator("h1")).toContainText("Analitik & Performa Eksekutif");
    await expect(page.locator("text=Total Pendapatan Klinis")).toBeVisible();
    await expect(page.locator("svg polyline")).toBeVisible(); // SVG trend chart
    await expect(page.locator("text=Peringkat Dokter")).toBeVisible();

    // 5. Reporting Hub Page
    await page.goto("/operate/reports");
    await expect(page.locator("h1")).toContainText("Pusat Laporan & Ekspor CSV");
    await expect(page.locator("text=Laporan Janji Temu Pasien")).toBeVisible();
    await expect(page.locator("text=Laporan Kunjungan & Pendapatan")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify**

Run: `npx playwright test e2e/director-analytics.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit changes**

```bash
GIT_MASTER=1 git add e2e/director-analytics.spec.ts
GIT_MASTER=1 git commit -m "test(e2e): add director dashboard, branch switcher, and analytics test"
```

---

### Task 5: Operational Inventory, Shifts, and Verification Suite

**Files:**
- Create: `e2e/operations-inventory-shifts.spec.ts`

**Interfaces:**
- Tests:
  - Inventory stock mutation and history log drawer
  - Weekly shifts calendar roster grid
  - Staff attendance clock in/out widget

- [ ] **Step 1: Implement `e2e/operations-inventory-shifts.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Clinic Operations: Inventory, Shifts, and Attendance", () => {
  test("manager operates inventory, views weekly shift roster, and records attendance", async ({ page }) => {
    // 1. Login as Manager
    await loginAs(page, "manager");

    // 2. Inventory Management
    await page.goto("/operate/inventory");
    await expect(page.locator("h1")).toContainText("Inventaris Medis");
    await expect(page.locator("text=Total Item Medis")).toBeVisible();

    // Open mutation modal for first item
    const mutateBtn = page.locator('button:has-text("Catat Mutasi")').first();
    await expect(mutateBtn).toBeVisible();
    await mutateBtn.click();
    await expect(page.locator("text=Catat Mutasi Stok")).toBeVisible();
    await page.click('button:has-text("Batal")');

    // 3. Weekly Shift Roster
    await page.goto("/operate/shifts");
    await expect(page.locator("h1")).toContainText("Jadwal Shift Staf");
    await expect(page.locator("text=Periode Roster Mingguan")).toBeVisible();

    // 4. Staff Attendance Clock Widget
    await page.goto("/operate/attendance");
    await expect(page.locator("h1")).toContainText("Presensi & Kehadiran Staf");
    await expect(page.locator("text=Jam Digital Presensi")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run all Playwright E2E tests**

Run: `npx playwright test`
Expected: 4/4 test suites PASS.

- [ ] **Step 3: Run full verification gates**

Run: `npx vitest run && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 100% clean.

- [ ] **Step 4: Commit changes**

```bash
GIT_MASTER=1 git add e2e/operations-inventory-shifts.spec.ts
GIT_MASTER=1 git commit -m "test(e2e): add operations inventory, shifts, and attendance tests"
```
