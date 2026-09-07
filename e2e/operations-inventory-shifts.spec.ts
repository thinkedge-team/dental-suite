import { test, expect } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { prisma } from "../src/lib/prisma";

test.describe("Operations Inventory, Weekly Shift Roster, and Staff Attendance E2E Test", () => {
  test.beforeAll(async () => {
    await prisma.organization.updateMany({
      data: {
        moduleOperate: true,
      },
    });

    const manager = await prisma.user.findUnique({
      where: { email: "manager@demo.com" },
    });

    if (manager?.branchId) {
      await prisma.shift.updateMany({
        where: { userId: manager.id },
        data: { branchId: manager.branchId },
      });

      await prisma.attendanceRecord.deleteMany({
        where: { userId: manager.id },
      });

      const existingItems = await prisma.inventoryItem.count({
        where: { branchId: manager.branchId },
      });

      if (existingItems === 0) {
        const item1 = await prisma.inventoryItem.create({
          data: {
            branchId: manager.branchId,
            name: "Lidocaine HCl 2% + Epinephrine",
            sku: "MED-LIDO-01",
            stock: 8,
            minStock: 20,
            unit: "ampul",
            category: "Anestesi & Farmasi",
          },
        });

        await prisma.inventoryLog.create({
          data: {
            type: "RESTOCK",
            quantity: 8,
            previousStock: 0,
            currentStock: 8,
            itemId: item1.id,
            userId: manager.id,
            notes: "Initial restock audit log",
          },
        });

        await prisma.inventoryItem.create({
          data: {
            branchId: manager.branchId,
            name: "Composite Resin Filtek Z250 A2",
            sku: "MAT-COMP-A2",
            stock: 0,
            minStock: 5,
            unit: "syringe",
            category: "Bahan Tambal & Restorasi",
          },
        });
      }
    }
  });

  test("validates inventory management, weekly shift roster, and staff attendance workflows as manager", async ({
    page,
  }) => {
    // 1. Login as Manager (manager@demo.com)
    await loginAs(page, "manager");

    // 2. Inventory Management (/operate/inventory)
    await page.goto("/operate/inventory");
    await expect(page).toHaveURL(/\/operate\/inventory/);

    // Verify heading "Inventaris Medis"
    const inventoryHeading = page.locator("h1");
    await expect(inventoryHeading).toBeVisible();
    await expect(inventoryHeading).toContainText("Inventaris Medis");

    // Verify 4 KPI cards: "Total Barang" / "Total Item Medis", "Stok Menipis", "Stok Habis", "Mutasi Hari Ini"
    await expect(page.locator("text=/Total (Barang|Item Medis)/").first()).toBeVisible();
    await expect(page.locator("text=Stok Menipis").first()).toBeVisible();
    await expect(page.locator("text=Stok Habis").first()).toBeVisible();
    await expect(page.locator("text=Mutasi Hari Ini").first()).toBeVisible();

    // Open mutation modal for the first item by clicking "Catat Mutasi"
    const catatMutasiBtn = page.locator('table button:has-text("Catat Mutasi")').first();
    await expect(catatMutasiBtn).toBeVisible();
    await catatMutasiBtn.click();

    // Verify modal title / dialog is visible
    const mutationDialog = page.locator('[role="dialog"]').first();
    await expect(mutationDialog).toBeVisible();
    await expect(
      mutationDialog.locator("text=/Mutasi Stok|Catat Mutasi/").first()
    ).toBeVisible();

    // Click "Batal" -> verify modal closes cleanly
    const cancelMutationBtn = mutationDialog.locator('button:has-text("Batal")');
    await expect(cancelMutationBtn).toBeVisible();
    await cancelMutationBtn.click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Click "Riwayat" button on the first row -> verify stock log drawer opens showing timeline records
    const riwayatBtn = page.locator('table button:has-text("Riwayat")').first();
    await expect(riwayatBtn).toBeVisible();
    await riwayatBtn.click();

    const logDrawer = page.locator('[role="dialog"]').first();
    await expect(logDrawer).toBeVisible();
    await expect(logDrawer.locator("#drawer-title")).toBeVisible();
    await expect(logDrawer.getByText("Riwayat Mutasi Stok")).toBeVisible();

    // Close log drawer
    const closeDrawerBtn = logDrawer.locator('button[aria-label="Tutup drawer"]');
    await expect(closeDrawerBtn).toBeVisible();
    await closeDrawerBtn.click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 3. Weekly Shift Roster (/operate/shifts)
    await page.goto("/operate/shifts");
    await expect(page).toHaveURL(/\/operate\/shifts/);

    // Verify heading "Jadwal Shift Staf"
    const shiftsHeading = page.locator("h1");
    await expect(shiftsHeading).toBeVisible();
    await expect(shiftsHeading).toContainText("Jadwal Shift Staf");

    // Verify weekly roster grid exists with days (Senin s.d. Minggu) and staff rows
    const rosterTable = page.locator("table").first();
    await expect(rosterTable).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Senin')")).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Selasa')")).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Rabu')")).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Kamis')")).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Jumat')")).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Sabtu')")).toBeVisible();
    await expect(rosterTable.locator("th:has-text('Minggu')")).toBeVisible();

    // Click an empty cell or existing shift -> verify shift assignment dialog opens
    const shiftCellButton = rosterTable
      .locator("tbody td button")
      .first();
    await expect(shiftCellButton).toBeVisible();
    await shiftCellButton.click();

    const shiftDialog = page.locator('[role="dialog"]').first();
    await expect(shiftDialog).toBeVisible();
    await expect(shiftDialog.locator("#shift-modal-title")).toBeVisible();

    // Close shift modal
    const closeShiftModalBtn = shiftDialog.locator(
      'button:has-text("Batal"), button:has-text("Tutup"), button[aria-label="Tutup"], button:has(svg.lucide-x)'
    ).first();
    await expect(closeShiftModalBtn).toBeVisible();
    await closeShiftModalBtn.click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 4. Staff Attendance (/operate/attendance)
    await page.goto("/operate/attendance");
    await expect(page).toHaveURL(/\/operate\/attendance/);

    // Verify heading "Presensi & Kehadiran Staf"
    const attendanceHeading = page.locator("h1");
    await expect(attendanceHeading).toBeVisible();
    await expect(attendanceHeading).toContainText("Presensi & Kehadiran Staf");

    // Verify <ClockWidget /> displays live time and shift summary
    const digitalClock = page.locator("div.font-mono").first();
    await expect(digitalClock).toBeVisible();
    await expect(digitalClock).toContainText(/\d{2}[\.:]\d{2}/);
    await expect(page.locator("text=Jadwal Shift Anda Hari Ini")).toBeVisible();

    // If "Clock In Sekarang" button is visible, click it -> verify state transitions to on-duty / "Clock Out" button
    const clockInBtn = page.locator('button:has-text("Clock In Sekarang")');
    if (await clockInBtn.isVisible()) {
      await clockInBtn.click();
      await expect(page.locator('button:has-text("Clock Out")')).toBeVisible();
    }

    // Verify Manager Live Attendance Board displays attendees table and KPI metrics
    await expect(page.locator("text=Monitoring Presensi Cabang")).toBeVisible();
    await expect(page.locator("text=Sedang Bertugas").first()).toBeVisible();
    await expect(page.locator("text=Hadir Tepat Waktu").first()).toBeVisible();
    await expect(page.locator("text=Terlambat").first()).toBeVisible();
    await expect(page.locator("text=Total Presensi").first()).toBeVisible();
    await expect(page.getByText("Daftar Kehadiran Hari Ini")).toBeVisible();
  });
});
