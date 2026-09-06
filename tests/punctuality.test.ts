/// <reference types="vitest" />

import { describe, it, expect } from "vitest";
import {
  evaluatePunctuality,
  formatDurationMinutes,
  SHIFT_PRESETS,
} from "@/lib/attendance/punctuality";

describe("Punctuality Engine (evaluatePunctuality)", () => {
  // WIB is UTC+7. 08:00 WIB is 01:00 UTC.
  const baseDateStr = "2026-09-06";

  it("evaluates clock-in before shift start as ON_TIME with 0 minutes late", () => {
    // 07:50 WIB -> 00:50 UTC
    const clockIn = new Date(`${baseDateStr}T00:50:00.000Z`);
    const result = evaluatePunctuality(clockIn, "08:00");

    expect(result.status).toBe("ON_TIME");
    expect(result.minutesLate).toBe(0);
  });

  it("evaluates clock-in exactly at shift start as ON_TIME with 0 minutes late", () => {
    // 08:00 WIB -> 01:00 UTC
    const clockIn = new Date(`${baseDateStr}T01:00:00.000Z`);
    const result = evaluatePunctuality(clockIn, "08:00");

    expect(result.status).toBe("ON_TIME");
    expect(result.minutesLate).toBe(0);
  });

  it("evaluates clock-in within 15-minute grace threshold as ON_TIME", () => {
    // 08:10 WIB -> 01:10 UTC (10 mins late, within grace)
    const clockIn10 = new Date(`${baseDateStr}T01:10:00.000Z`);
    const result10 = evaluatePunctuality(clockIn10, "08:00");

    expect(result10.status).toBe("ON_TIME");
    expect(result10.minutesLate).toBe(10);

    // 08:15 WIB -> 01:15 UTC (exactly at grace limit)
    const clockIn15 = new Date(`${baseDateStr}T01:15:00.000Z`);
    const result15 = evaluatePunctuality(clockIn15, "08:00");

    expect(result15.status).toBe("ON_TIME");
    expect(result15.minutesLate).toBe(15);
  });

  it("evaluates clock-in past 15-minute grace threshold as LATE with exact minutesLate", () => {
    // 08:16 WIB -> 01:16 UTC (16 mins late)
    const clockIn16 = new Date(`${baseDateStr}T01:16:00.000Z`);
    const result16 = evaluatePunctuality(clockIn16, "08:00");

    expect(result16.status).toBe("LATE");
    expect(result16.minutesLate).toBe(16);

    // 08:45 WIB -> 01:45 UTC (45 mins late)
    const clockIn45 = new Date(`${baseDateStr}T01:45:00.000Z`);
    const result45 = evaluatePunctuality(clockIn45, "08:00");

    expect(result45.status).toBe("LATE");
    expect(result45.minutesLate).toBe(45);
  });

  it("evaluates unscheduled clock-in without shift as PRESENT with 0 minutes late", () => {
    const clockIn = new Date(`${baseDateStr}T01:00:00.000Z`);

    expect(evaluatePunctuality(clockIn, null)).toEqual({
      status: "PRESENT",
      minutesLate: 0,
    });

    expect(evaluatePunctuality(clockIn, undefined)).toEqual({
      status: "PRESENT",
      minutesLate: 0,
    });

    expect(evaluatePunctuality(clockIn, "")).toEqual({
      status: "PRESENT",
      minutesLate: 0,
    });
  });

  it("supports custom grace period parameter", () => {
    // 08:10 WIB -> with graceMinutes = 5 -> LATE by 10 mins
    const clockIn10 = new Date(`${baseDateStr}T01:10:00.000Z`);
    const result = evaluatePunctuality(clockIn10, "08:00", 5);

    expect(result.status).toBe("LATE");
    expect(result.minutesLate).toBe(10);
  });

  it("correctly handles afternoon and evening shifts (SIANG)", () => {
    // 14:00 WIB is 07:00 UTC
    // 14:05 WIB -> 07:05 UTC (5 mins late, within grace)
    const clockIn = new Date(`${baseDateStr}T07:05:00.000Z`);
    const result = evaluatePunctuality(clockIn, "14:00");

    expect(result.status).toBe("ON_TIME");
    expect(result.minutesLate).toBe(5);

    // 14:25 WIB -> 07:25 UTC (25 mins late)
    const clockInLate = new Date(`${baseDateStr}T07:25:00.000Z`);
    const resultLate = evaluatePunctuality(clockInLate, "14:00");

    expect(resultLate.status).toBe("LATE");
    expect(resultLate.minutesLate).toBe(25);
  });
});

describe("Duration Formatting (formatDurationMinutes)", () => {
  it("formats zero or negative minutes as 0m", () => {
    expect(formatDurationMinutes(0)).toBe("0m");
    expect(formatDurationMinutes(-5)).toBe("0m");
  });

  it("formats sub-hour durations in minutes", () => {
    expect(formatDurationMinutes(45)).toBe("45m");
    expect(formatDurationMinutes(15)).toBe("15m");
  });

  it("formats exact hour multiples without trailing 0m", () => {
    expect(formatDurationMinutes(60)).toBe("1j");
    expect(formatDurationMinutes(120)).toBe("2j");
  });

  it("formats compound hours and minutes", () => {
    expect(formatDurationMinutes(125)).toBe("2j 5m");
    expect(formatDurationMinutes(90)).toBe("1j 30m");
  });
});

describe("SHIFT_PRESETS", () => {
  it("contains defined presets for PAGI, SIANG, and FULLDAY", () => {
    expect(SHIFT_PRESETS.PAGI.startTime).toBe("08:00");
    expect(SHIFT_PRESETS.PAGI.endTime).toBe("15:00");
    expect(SHIFT_PRESETS.SIANG.startTime).toBe("14:00");
    expect(SHIFT_PRESETS.SIANG.endTime).toBe("21:00");
    expect(SHIFT_PRESETS.FULLDAY.startTime).toBe("08:00");
    expect(SHIFT_PRESETS.FULLDAY.endTime).toBe("20:00");
  });
});
