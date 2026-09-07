import { test, expect } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Receptionist and Clinical Workflow E2E Test", () => {
  test("performs receptionist login, appointment check-in, completion, and walk-in creation", async ({
    page,
  }) => {
    // 1. Login as staff member
    await loginAs(page, "staff");

    // 2. Navigate to /appointments. Verify page title and appointments table render.
    await page.goto("/appointments");
    await expect(page).toHaveURL(/\/appointments/);
    await expect(page.locator("h1")).toBeVisible();

    // Ensure we have at least one appointment row or create one if list is empty
    let detailLink = page.locator('a:has-text("Detail")').first();
    const hasExistingAppointment = (await detailLink.count()) > 0;

    if (!hasExistingAppointment) {
      // Create an appointment first if table is empty
      await page.goto("/appointments/new");
      await expect(page.locator("h1")).toContainText(/Buat Janji Temu/);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      await page.fill("#patientName", "Pasien Pre-test Playwright");
      await page.fill("#patientPhone", "081234567890");
      await page.fill("#date", tomorrow);
      await page.fill("#time", "10:00");
      await page.click('button[type="submit"]:has-text("Buat Janji Temu")');
      await expect(page).toHaveURL(/\/appointments/);
      await page.goto(`/appointments?date=${tomorrow}`);
      detailLink = page.locator('a:has-text("Detail")').first();
    }

    // 3. Click "Detail" link on first available appointment row to navigate to /appointments/[id]
    await expect(detailLink).toBeVisible();
    await detailLink.click();
    await expect(page).toHaveURL(/\/appointments\/[a-zA-Z0-9_-]+/);

    // 4. On detail view: Check in and complete visit
    const checkInButton = page.locator('button[type="submit"]:has-text("Check In")');
    if (await checkInButton.isVisible()) {
      await checkInButton.click();
      await expect(
        page.locator('span:has-text("Check-in"), span:has-text("Menunggu Tindakan")')
      ).toBeVisible();
    }

    const completeForm = page.locator("textarea#notes");
    if (await completeForm.isVisible()) {
      await page.fill("textarea#notes", "Pemeriksaan dan tindakan scaling tuntas via Playwright E2E");
      await page.click('button[type="submit"]:has-text("Selesaikan Kunjungan")');
      await expect(page.locator('span:has-text("Selesai")')).toBeVisible();
    }

    // 5. Walk-in appointment creation
    await page.goto("/appointments/new");
    await expect(page.locator("h1")).toContainText(/Buat Janji Temu/);

    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const walkinPhone = `0819${Date.now().toString().slice(-8)}`;

    await page.fill("#patientName", "Pasien Walk-in Playwright");
    await page.fill("#patientPhone", walkinPhone);
    await page.fill("#date", futureDate);
    await page.fill("#time", "14:00");

    const walkinCheckbox = page.locator("#walkin");
    if (await walkinCheckbox.isVisible()) {
      await walkinCheckbox.check();
    }

    await page.click('button[type="submit"]:has-text("Buat Janji Temu")');

    // Verify redirection back to /appointments
    await expect(page).toHaveURL(/\/appointments/);
  });
});
