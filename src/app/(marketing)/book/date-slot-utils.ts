export interface CalendarDayOption {
  readonly iso: string; // YYYY-MM-DD
  readonly dayName: string; // "Sen", "Sel", "Rab", etc.
  readonly dayNum: number;
  readonly monthName: string; // "Sep", "Okt", etc.
  readonly isToday: boolean;
  readonly isTomorrow: boolean;
  readonly dayOfWeek: number; // 0=Min, 1=Sen, ... 6=Sab
}

export interface DoctorScheduleDay {
  readonly dayOfWeek: number;
  readonly isActive: boolean;
}

export interface ClinicalSession {
  readonly label: string;
  readonly period: string;
  readonly slots: readonly string[];
}

const INDONESIAN_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
const INDONESIAN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

/**
 * Parses or formats date components in Asia/Jakarta (UTC+7) timezone.
 */
function getJakartaDateParts(date: Date): { year: number; month: number; day: number; dayOfWeek: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  let year = 0;
  let month = 0;
  let day = 0;
  let weekdayStr = "";

  for (const p of parts) {
    if (p.type === "year") year = Number(p.value);
    else if (p.type === "month") month = Number(p.value);
    else if (p.type === "day") day = Number(p.value);
    else if (p.type === "weekday") weekdayStr = p.value;
  }

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayOfWeek = weekdayMap[weekdayStr] ?? 0;

  return { year, month, day, dayOfWeek };
}

/**
 * Formats year, month, day to YYYY-MM-DD
 */
function formatIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Generates `count` consecutive calendar days starting from `now`, anchored in Asia/Jakarta (UTC+7).
 */
export function generateNextDays(count = 14, now: Date = new Date()): CalendarDayOption[] {
  const todayParts = getJakartaDateParts(now);
  const todayIso = formatIso(todayParts.year, todayParts.month, todayParts.day);

  // We can compute subsequent days by advancing day by day from anchor in UTC to avoid DST or local offset quirks
  // In Asia/Jakarta, midnight UTC for a Jakarta day (YYYY-MM-DD) is YYYY-MM-DD 00:00:00 +07:00 => previous day 17:00:00 UTC
  // Using Date.UTC with year, month - 1, day:
  const anchorTime = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  const tomorrowTime = anchorTime + 24 * 60 * 60 * 1000;
  const tomorrowDate = new Date(tomorrowTime);
  const tomorrowIso = formatIso(
    tomorrowDate.getUTCFullYear(),
    tomorrowDate.getUTCMonth() + 1,
    tomorrowDate.getUTCDate()
  );

  const days: CalendarDayOption[] = [];

  for (let i = 0; i < count; i++) {
    const currentUtcTime = anchorTime + i * 24 * 60 * 60 * 1000;
    const d = new Date(currentUtcTime);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dayNum = d.getUTCDate();
    const dayOfWeek = d.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    const iso = formatIso(y, m, dayNum);
    const dayName = INDONESIAN_DAYS[dayOfWeek] ?? "Min";
    const monthName = INDONESIAN_MONTHS[m - 1] ?? "Jan";

    days.push({
      iso,
      dayName,
      dayNum,
      monthName,
      isToday: iso === todayIso,
      isTomorrow: iso === tomorrowIso,
      dayOfWeek,
    });
  }

  return days;
}

/**
 * Checks if a doctor is available on a specific day of the week.
 * Returns true if schedules is null, undefined, or empty.
 * Otherwise checks if there is any active schedule for that dayOfWeek.
 */
export function isDoctorAvailableOnDay(
  schedules?: readonly DoctorScheduleDay[] | null,
  dayOfWeek?: number
): boolean {
  if (!schedules || schedules.length === 0) {
    return true;
  }
  if (dayOfWeek === undefined) {
    return true;
  }
  return schedules.some((s) => s.dayOfWeek === dayOfWeek && s.isActive);
}

/**
 * Clinical sessions and their available time slots.
 */
export const SESSION_TIME_SLOTS: Record<"morning" | "afternoon" | "evening", ClinicalSession> = {
  morning: {
    label: "Sesi Pagi",
    period: "09:00 - 11:30",
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  afternoon: {
    label: "Sesi Siang",
    period: "13:00 - 15:00",
    slots: ["13:00", "13:30", "14:00", "14:30", "15:00"],
  },
  evening: {
    label: "Sesi Sore / Malam",
    period: "16:00 - 18:00",
    slots: ["16:00", "16:30", "17:00", "17:30", "18:00"],
  },
};
