import { test, expect } from "@playwright/test";
import { prisma } from "../src/lib/prisma";

test.describe("Patient Booking and Self-Service Cancellation Journey", () => {
  test("completes full self-service booking, invalid token edge case, and valid cancellation", async ({
    page,
  }) => {
    const timestamp = Date.now().toString().slice(-6);
    const patientName = "Pasien E2E Playwright";
    const patientPhone = `08129988${timestamp}`;
    const notes = "Catatan reservasi E2E testing";

    // 1. Visit /book
    await page.goto("/book");
    await expect(page.locator("h1")).toContainText("Buat Janji Temu");

    // 2. Step 1: Select branch ("Kelapa Gading") and choose a service from dropdown, then click "Lanjutkan"
    const branchButton = page.locator('button:has-text("Kelapa Gading")');
    await expect(branchButton).toBeVisible();
    await branchButton.click();

    const serviceSelect = page.locator("#service-select");
    if (await serviceSelect.isVisible()) {
      const options = await serviceSelect.locator("option").all();
      if (options.length > 1) {
        const optionValue = await options[1].getAttribute("value");
        if (optionValue) {
          await serviceSelect.selectOption(optionValue);
        }
      }
    }

    await page.click('button:has-text("Lanjutkan")');

    const dateCarouselButtons = page.locator('div:has-text("Pilih Tanggal Kunjungan") + div button:not([disabled])');
    await expect(dateCarouselButtons.first()).toBeVisible();
    const futureDateButton = (await dateCarouselButtons.count()) > 1 ? dateCarouselButtons.nth(1) : dateCarouselButtons.first();
    await futureDateButton.click();

    const timeSlotChip = page.locator('button:has-text(":")').first();
    await expect(timeSlotChip).toBeVisible();
    await timeSlotChip.click();

    await page.click('button:has-text("Lanjutkan")');

    // 4. Step 3: Enter patient name, unique phone, and notes. Click "Konfirmasi Janji"
    await page.fill("#patient-name", patientName);
    await page.fill("#patient-phone", patientPhone);
    await page.fill("#patient-notes", notes);

    const submitBookingButton = page.locator('button:has-text("Konfirmasi Janji"), button:has-text("Kirim Reservasi Janji Temu")');
    await expect(submitBookingButton).toBeEnabled();
    await submitBookingButton.click();

    // 5. Verification: Confirm success header and WhatsApp confirmation link
    await expect(page.locator("h2")).toContainText(/Janji Temu Berhasil Dibuat|Reservasi Berhasil Terkirim!/);
    const waLink = page.locator('a:has-text("Konfirmasi via WhatsApp")');
    await expect(waLink).toBeVisible();

    // 6. Cancellation edge cases: Visit /cancel?token=invalid-dummy-token -> verify "Tautan Tidak Valid" or "Janji Temu Tidak Ditemukan"
    await page.goto("/cancel?token=invalid-dummy-token");
    await expect(page.locator("h1")).toContainText(/Tautan Tidak Valid|Janji Temu Tidak Ditemukan/);

    // 7. Query newly created appointment from PostgreSQL via prisma.appointment.findFirst
    const appointment = await prisma.appointment.findFirst({
      where: {
        patientPhone,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(appointment).not.toBeNull();
    expect(appointment?.cancelToken).toBeTruthy();

    const cancelToken = appointment?.cancelToken as string;

    // 8. Visit /cancel?token=${appointment.cancelToken} -> verify appointment details card with patient name
    await page.goto(`/cancel?token=${cancelToken}`);
    await expect(page.locator("h1")).toContainText("Konfirmasi Pembatalan");
    await expect(page.locator("text=" + patientName)).toBeVisible();

    // 9. Select cancellation reason ("Perubahan jadwal mendadak"), submit cancellation -> verify success screen
    const reasonRadio = page.locator('label:has-text("Perubahan jadwal mendadak") input[type="radio"]');
    await reasonRadio.check();

    const submitCancelButton = page.locator('button[type="submit"]:has-text("Batalkan Janji Temu")');
    await expect(submitCancelButton).toBeEnabled();
    await submitCancelButton.click();

    const successHeading = page.locator("h1, h2").filter({
      hasText: /Janji Temu Berhasil Dibatalkan|Janji Temu Sudah Dibatalkan/,
    });
    await expect(successHeading.first()).toBeVisible();
  });
});
