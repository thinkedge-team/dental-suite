import { describe, it, expect } from "vitest";
import {
  generateNextDays,
  isDoctorAvailableOnDay,
  SESSION_TIME_SLOTS,
} from "../src/app/(marketing)/book/date-slot-utils";

describe("date-slot-utils", () => {
  describe("generateNextDays", () => {
    it("generates 14 consecutive days by default anchored in Asia/Jakarta", () => {
      // 2026-09-07T03:00:00Z is 10:00:00 WIB (Monday)
      const fixedNow = new Date("2026-09-07T03:00:00Z");
      const days = generateNextDays(14, fixedNow);

      expect(days).toHaveLength(14);

      // Day 0: 2026-09-07 (Senin)
      expect(days[0]).toEqual({
        iso: "2026-09-07",
        dayName: "Sen",
        dayNum: 7,
        monthName: "Sep",
        isToday: true,
        isTomorrow: false,
        dayOfWeek: 1,
      });

      // Day 1: 2026-09-08 (Selasa)
      expect(days[1]).toEqual({
        iso: "2026-09-08",
        dayName: "Sel",
        dayNum: 8,
        monthName: "Sep",
        isToday: false,
        isTomorrow: true,
        dayOfWeek: 2,
      });

      // Day 13: 2026-09-20 (Minggu)
      expect(days[13]).toEqual({
        iso: "2026-09-20",
        dayName: "Min",
        dayNum: 20,
        monthName: "Sep",
        isToday: false,
        isTomorrow: false,
        dayOfWeek: 0,
      });
    });

    it("respects Asia/Jakarta timezone boundary when UTC is previous day", () => {
      // 2026-09-07T18:00:00Z is 2026-09-08 01:00:00 WIB (Tuesday)
      const lateUtc = new Date("2026-09-07T18:00:00Z");
      const days = generateNextDays(3, lateUtc);

      expect(days).toHaveLength(3);
      expect(days[0]?.iso).toBe("2026-09-08");
      expect(days[0]?.dayName).toBe("Sel");
      expect(days[0]?.isToday).toBe(true);

      expect(days[1]?.iso).toBe("2026-09-09");
      expect(days[1]?.dayName).toBe("Rab");
      expect(days[1]?.isTomorrow).toBe(true);
    });

    it("supports custom day counts", () => {
      const fixedNow = new Date("2026-09-07T00:00:00Z");
      const days = generateNextDays(5, fixedNow);
      expect(days).toHaveLength(5);
    });

    it("does not contain any em-dashes in generated strings", () => {
      const fixedNow = new Date("2026-09-07T00:00:00Z");
      const days = generateNextDays(14, fixedNow);
      for (const d of days) {
        expect(d.iso).not.toContain("\u2014");
        expect(d.dayName).not.toContain("\u2014");
        expect(d.monthName).not.toContain("\u2014");
      }
    });
  });

  describe("isDoctorAvailableOnDay", () => {
    it("returns true if schedules is null, undefined, or empty", () => {
      expect(isDoctorAvailableOnDay(null, 1)).toBe(true);
      expect(isDoctorAvailableOnDay(undefined, 1)).toBe(true);
      expect(isDoctorAvailableOnDay([], 1)).toBe(true);
      expect(isDoctorAvailableOnDay(null, undefined)).toBe(true);
    });

    it("returns true if dayOfWeek is undefined", () => {
      const schedules = [{ dayOfWeek: 1, isActive: true }];
      expect(isDoctorAvailableOnDay(schedules, undefined)).toBe(true);
    });

    it("evaluates doctor practice days correctly based on active status", () => {
      const schedules = [
        { dayOfWeek: 1, isActive: true }, // Sen
        { dayOfWeek: 2, isActive: false }, // Sel (inactive)
        { dayOfWeek: 3, isActive: true }, // Rab
      ];

      // Monday active
      expect(isDoctorAvailableOnDay(schedules, 1)).toBe(true);
      // Tuesday inactive
      expect(isDoctorAvailableOnDay(schedules, 2)).toBe(false);
      // Wednesday active
      expect(isDoctorAvailableOnDay(schedules, 3)).toBe(true);
      // Thursday not in list
      expect(isDoctorAvailableOnDay(schedules, 4)).toBe(false);
      // Sunday not in list
      expect(isDoctorAvailableOnDay(schedules, 0)).toBe(false);
    });
  });

  describe("SESSION_TIME_SLOTS", () => {
    it("has exact required sessions and valid slots structure", () => {
      expect(SESSION_TIME_SLOTS).toHaveProperty("morning");
      expect(SESSION_TIME_SLOTS).toHaveProperty("afternoon");
      expect(SESSION_TIME_SLOTS).toHaveProperty("evening");

      expect(SESSION_TIME_SLOTS.morning).toEqual({
        label: "Sesi Pagi",
        period: "09:00 - 11:30",
        slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
      });

      expect(SESSION_TIME_SLOTS.afternoon).toEqual({
        label: "Sesi Siang",
        period: "13:00 - 15:00",
        slots: ["13:00", "13:30", "14:00", "14:30", "15:00"],
      });

      expect(SESSION_TIME_SLOTS.evening).toEqual({
        label: "Sesi Sore / Malam",
        period: "16:00 - 18:00",
        slots: ["16:00", "16:30", "17:00", "17:30", "18:00"],
      });
    });

    it("has zero em-dashes in session labels and periods", () => {
      for (const session of Object.values(SESSION_TIME_SLOTS)) {
        expect(session.label).not.toContain("\u2014");
        expect(session.period).not.toContain("\u2014");
        for (const slot of session.slots) {
          expect(slot).not.toContain("\u2014");
        }
      }
    });
  });
});
