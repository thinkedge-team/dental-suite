/// <reference types="vitest" />

import { describe, it, expect } from "vitest";

const WIB_OFFSET_HOURS = 7;
const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

export function resolveMondayWib(weekParam?: string): Date {
  if (weekParam) {
    const match = weekParam.match(/^(\d{4})-W(\d{1,2})$/i);
    if (match) {
      const year = parseInt(match[1], 10);
      const weekNum = parseInt(match[2], 10);
      const jan4 = new Date(Date.UTC(year, 0, 4));
      const jan4Day = jan4.getUTCDay();
      const jan4MondayDiff = jan4Day === 0 ? -6 : 1 - jan4Day;
      const week1Monday = new Date(Date.UTC(year, 0, 4 + jan4MondayDiff));
      const targetMondayUtc = new Date(
        Date.UTC(
          week1Monday.getUTCFullYear(),
          week1Monday.getUTCMonth(),
          week1Monday.getUTCDate() + (weekNum - 1) * 7,
          0,
          0,
          0,
          0,
        ),
      );
      return new Date(targetMondayUtc.getTime() - WIB_OFFSET_MS);
    }

    const dateStr = weekParam.includes("T") ? weekParam.split("T")[0] : weekParam;
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const y = parts[0];
      const m = parts[1] - 1;
      const d = parts[2];
      const inputDateUtc = new Date(Date.UTC(y, m, d));
      const dayOfWeek = inputDateUtc.getUTCDay();
      const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mondayDateUtc = new Date(Date.UTC(y, m, d + mondayDiff, 0, 0, 0, 0));
      return new Date(mondayDateUtc.getTime() - WIB_OFFSET_MS);
    }
  }

  const now = new Date();
  const wibTime = new Date(now.getTime() + WIB_OFFSET_MS);
  const wYear = wibTime.getUTCFullYear();
  const wMonth = wibTime.getUTCMonth();
  const wDay = wibTime.getUTCDate();
  const wDayOfWeek = wibTime.getUTCDay();
  const mondayDiff = wDayOfWeek === 0 ? -6 : 1 - wDayOfWeek;
  const mondayDateUtc = new Date(Date.UTC(wYear, wMonth, wDay + mondayDiff, 0, 0, 0, 0));
  return new Date(mondayDateUtc.getTime() - WIB_OFFSET_MS);
}

function toWibDateString(date: Date): string {
  const wibDate = new Date(date.getTime() + WIB_OFFSET_MS);
  const y = wibDate.getUTCFullYear();
  const m = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(wibDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

describe("resolveMondayWib", () => {
  it("anchors ISO date to Monday in WIB", () => {
    // 2026-09-06 is Sunday -> Monday is 2026-08-31
    const resSun = resolveMondayWib("2026-09-06");
    expect(toWibDateString(resSun)).toBe("2026-08-31");

    // 2026-09-07 is Monday -> Monday is 2026-09-07
    const resMon = resolveMondayWib("2026-09-07");
    expect(toWibDateString(resMon)).toBe("2026-09-07");

    // 2026-09-09 is Wednesday -> Monday is 2026-09-07
    const resWed = resolveMondayWib("2026-09-09");
    expect(toWibDateString(resWed)).toBe("2026-09-07");
  });

  it("anchors ISO week pattern (e.g. 2026-W37) to correct Monday", () => {
    // Week 37 of 2026 starts on Monday 2026-09-07
    const resW37 = resolveMondayWib("2026-W37");
    expect(toWibDateString(resW37)).toBe("2026-09-07");
  });

  it("produces exact 00:00:00 WIB timestamp (17:00 UTC previous day)", () => {
    const res = resolveMondayWib("2026-09-07");
    // Monday 00:00:00 WIB = Sunday 17:00:00.000 UTC
    expect(res.toISOString()).toBe("2026-09-06T17:00:00.000Z");
  });
});
