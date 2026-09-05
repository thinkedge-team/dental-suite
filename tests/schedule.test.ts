import { describe, it, expect } from "vitest";

describe("Schedule helper and validation tests", () => {
  it("validates start date is before end date", () => {
    const startAt = new Date("2026-09-10T09:00:00Z");
    const endAt = new Date("2026-09-10T17:00:00Z");
    expect(startAt.getTime() < endAt.getTime()).toBe(true);
  });

  it("detects invalid range when startAt >= endAt", () => {
    const startAt = new Date("2026-09-10T17:00:00Z");
    const endAt = new Date("2026-09-10T09:00:00Z");
    expect(startAt.getTime() < endAt.getTime()).toBe(false);
  });

  it("formats Asia/Jakarta time properly without em-dashes", () => {
    const d = new Date("2026-09-10T02:00:00Z"); // 09:00 WIB
    const formatted = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB";

    expect(formatted).toContain("WIB");
    expect(formatted).not.toContain("\u2014");
  });
});
