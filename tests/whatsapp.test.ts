import { describe, it, expect } from "vitest";
import {
  formatPhoneForWhatsapp,
  getConfirmationWaLink,
  getReminderWaLink,
  type WaAppointmentData,
} from "../src/lib/whatsapp";

describe("formatPhoneForWhatsapp", () => {
  it("normalizes phone numbers starting with 0", () => {
    expect(formatPhoneForWhatsapp("081234567890")).toBe("6281234567890");
    expect(formatPhoneForWhatsapp("0812-3456-7890")).toBe("6281234567890");
  });

  it("normalizes phone numbers starting with +62", () => {
    expect(formatPhoneForWhatsapp("+6281234567890")).toBe("6281234567890");
  });

  it("handles numbers already starting with 62", () => {
    expect(formatPhoneForWhatsapp("6281234567890")).toBe("6281234567890");
  });

  it("removes dashes, spaces, and punctuation", () => {
    expect(formatPhoneForWhatsapp("+62 812-3456-7890")).toBe("6281234567890");
  });
});

describe("getConfirmationWaLink", () => {
  const mockApt: WaAppointmentData = {
    patientName: "Budi Santoso",
    branchName: "Klinik Pusat",
    branchAddress: "Jl. Sudirman No. 1",
    doctorName: "drg. Anita",
    service: "Pembersihan Karang Gigi",
    scheduledAt: new Date("2026-09-10T10:00:00Z"),
    cancelToken: "token-123",
    patientPhone: "081234567890",
  };

  it("generates a valid wa.me link with cancelToken and base URL", () => {
    const link = getConfirmationWaLink(mockApt, "https://example.com");

    expect(link).toContain("https://wa.me/6281234567890?text=");
    expect(link).toContain(encodeURIComponent("token=token-123"));
    expect(link).not.toContain("\u2014"); // Ensure zero em-dashes
  });
});

describe("getReminderWaLink", () => {
  const mockApt: WaAppointmentData = {
    patientName: "Budi Santoso",
    branchName: "Klinik Pusat",
    branchAddress: "Jl. Sudirman No. 1",
    doctorName: "drg. Anita",
    service: "Pembersihan Karang Gigi",
    scheduledAt: new Date("2026-09-10T10:00:00Z"),
    cancelToken: "token-123",
    patientPhone: "081234567890",
  };

  it("generates a valid 1day reminder wa.me link", () => {
    const link = getReminderWaLink(mockApt, "1day", "https://example.com");

    expect(link).toContain("https://wa.me/6281234567890?text=");
    expect(link).toContain(encodeURIComponent("token=token-123"));
    expect(link).not.toContain("\u2014");
  });

  it("generates a valid 2hour reminder wa.me link", () => {
    const link = getReminderWaLink(mockApt, "2hour", "https://example.com");

    expect(link).toContain("https://wa.me/6281234567890?text=");
    expect(link).not.toContain("\u2014");
  });
});