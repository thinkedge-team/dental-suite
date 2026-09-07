import { test, expect } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { prisma } from "../src/lib/prisma";

test.describe("Director Dashboard, Branch Switcher, Analytics & Reporting E2E Test", () => {
  test.beforeAll(async () => {
    await prisma.organization.updateMany({
      data: {
        moduleOperate: true,
        moduleIntelligence: true,
      },
    });
  });

  test("performs director login, validates dashboard KPIs, tests branch switcher, executive analytics, and CSV export", async ({
    page,
  }) => {
    // 1. Login as Director (director@demo.com)
    await loginAs(page, "director");

    // 2. On /dashboard:
    // - Verify heading "Selamat Datang" or Director greeting
    const greetingHeading = page.locator("h1").first();
    await expect(greetingHeading).toBeVisible();
    await expect(greetingHeading).toContainText(/Selamat (pagi|siang|sore|malam|Datang)/i);

    // - Verify 4 KPI cards: "Total Janji" / "Total Janji Hari Ini", "Pasien Hadir", "Pasien Baru", "Kunjungan Selesai"
    await expect(page.locator("p:has-text('Total Janji')").first()).toBeVisible();
    await expect(page.locator("p:has-text('Pasien Hadir')").first()).toBeVisible();
    await expect(page.locator("p:has-text('Pasien Baru')").first()).toBeVisible();
    await expect(page.locator("p:has-text('Kunjungan Selesai')").first()).toBeVisible();

    // - Verify system alert section renders
    await expect(page.locator("text=Peringatan Sistem")).toBeVisible();

    // 3. Header Global Branch Switcher:
    // - Click branch switcher button in header
    const branchSwitcherBtn = page
      .locator('header button[title="Ganti cabang aktif operasional"], header button:has-text("Cabang"), header button:has-text("Semua Cabang")')
      .first();
    await expect(branchSwitcherBtn).toBeVisible();
    await branchSwitcherBtn.click();

    // - Click "Cabang Pluit" option -> assert header updates to display "Cabang Pluit" and URL includes ?branch=...
    const pluitOption = page.locator('button:has-text("Cabang Pluit")');
    await expect(pluitOption).toBeVisible();
    await pluitOption.click();

    await expect(page).toHaveURL(/(\?|&)branch=/);
    await expect(branchSwitcherBtn).toContainText("Cabang Pluit");

    // - Click branch switcher again -> select "Semua Cabang (Konsolidasi)" -> assert URL removes branch param
    await branchSwitcherBtn.click();
    const allBranchesOption = page.locator('button:has-text("Semua Cabang (Konsolidasi)")');
    await expect(allBranchesOption).toBeVisible();
    await allBranchesOption.click();

    await expect(page).not.toHaveURL(/(\?|&)branch=/);
    await expect(branchSwitcherBtn).toContainText("Semua Cabang (Konsolidasi)");

    // 4. Executive Analytics (/operate/analytics):
    // - Navigate to /operate/analytics
    await page.goto("/operate/analytics");
    await expect(page).toHaveURL(/\/operate\/analytics/);

    // - Verify heading "Analitik & Performa Eksekutif"
    await expect(page.locator("h1")).toContainText("Analitik & Performa Eksekutif");

    // - Verify 4 metric cards: "Total Pendapatan Klinis", "Kunjungan Selesai", "Tingkat No-Show", "Rata-rata per Pasien"
    await expect(page.locator("text=Total Pendapatan Klinis")).toBeVisible();
    await expect(page.locator("text=Kunjungan Selesai").first()).toBeVisible();
    await expect(page.locator("text=Tingkat No-Show")).toBeVisible();
    await expect(page.locator("text=Rata-rata per Pasien")).toBeVisible();

    // - Verify SVG Trend Chart is rendered (SVG elements visible)
    const trendChartSvg = page.locator('svg[viewBox="0 0 1000 260"]');
    await expect(trendChartSvg).toBeVisible();

    // - Test period filter tabs: click "Bulan Ini" or "7 Hari Terakhir" -> assert tab active state updates
    const sevenDaysTab = page.locator('a:has-text("7 Hari Terakhir")');
    await expect(sevenDaysTab).toBeVisible();
    await sevenDaysTab.click();
    await expect(page).toHaveURL(/period=7d/);
    await expect(sevenDaysTab).toHaveClass(/bg-primary/);

    const thisMonthTab = page.locator('a:has-text("Bulan Ini")');
    await expect(thisMonthTab).toBeVisible();
    await thisMonthTab.click();
    await expect(page).toHaveURL(/period=this_month/);
    await expect(thisMonthTab).toHaveClass(/bg-primary/);

    // - Verify Doctor Ranking table and Service Breakdown components are visible
    await expect(page.locator("text=Peringkat Dokter & Kontribusi")).toBeVisible();
    await expect(page.locator("text=Distribusi Layanan Medis")).toBeVisible();

    // 5. Reporting Hub (/operate/reports):
    // - Navigate to /operate/reports
    await page.goto("/operate/reports");
    await expect(page).toHaveURL(/\/operate\/reports/);

    // - Verify heading "Pusat Laporan & Ekspor CSV"
    await expect(page.locator("h1")).toContainText("Pusat Laporan & Ekspor CSV");

    // - Verify 3 report cards exist: "Laporan Janji Temu Pasien", "Laporan Kunjungan & Pendapatan", "Laporan Mutasi Inventaris"
    await expect(page.locator("text=Laporan Janji Temu Pasien")).toBeVisible();
    await expect(page.locator("text=Laporan Kunjungan & Pendapatan")).toBeVisible();
    await expect(page.locator("text=Laporan Mutasi Inventaris")).toBeVisible();

    // - Click "Unduh CSV" button on the first card and wait for the download event -> assert download filename ends with .csv
    const downloadPromise = page.waitForEvent("download");
    const downloadButtons = page.locator('button:has-text("Unduh CSV")');
    await expect(downloadButtons.first()).toBeVisible();
    await downloadButtons.first().click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
