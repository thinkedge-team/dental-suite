export const SHIFT_PRESETS = {
  PAGI: {
    label: "Shift Pagi",
    startTime: "08:00",
    endTime: "15:00",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SIANG: {
    label: "Shift Siang",
    startTime: "14:00",
    endTime: "21:00",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  FULLDAY: {
    label: "Full Day",
    startTime: "08:00",
    endTime: "20:00",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
} as const;

export type ShiftPresetKey = keyof typeof SHIFT_PRESETS;

export type PunctualityStatus = "ON_TIME" | "LATE" | "PRESENT";

export interface PunctualityResult {
  status: PunctualityStatus;
  minutesLate: number;
}

function getWibHoursAndMinutes(date: Date): { hours: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  let hours = 0;
  let minutes = 0;

  for (const part of parts) {
    if (part.type === "hour") {
      hours = parseInt(part.value, 10);
      if (hours === 24) hours = 0;
    } else if (part.type === "minute") {
      minutes = parseInt(part.value, 10);
    }
  }

  return { hours, minutes };
}

export function evaluatePunctuality(
  clockInTime: Date,
  shiftStartTimeStr?: string | null,
  graceMinutes = 15,
): PunctualityResult {
  if (!shiftStartTimeStr || !shiftStartTimeStr.trim()) {
    return { status: "PRESENT", minutesLate: 0 };
  }

  const [shiftHoursStr, shiftMinutesStr] = shiftStartTimeStr.split(":");
  const shiftHours = parseInt(shiftHoursStr, 10);
  const shiftMinutes = parseInt(shiftMinutesStr || "0", 10);

  if (isNaN(shiftHours) || isNaN(shiftMinutes)) {
    return { status: "PRESENT", minutesLate: 0 };
  }

  const shiftTotalMinutes = shiftHours * 60 + shiftMinutes;
  const { hours: clockInHours, minutes: clockInMins } = getWibHoursAndMinutes(clockInTime);
  const clockInTotalMinutes = clockInHours * 60 + clockInMins;

  const diff = clockInTotalMinutes - shiftTotalMinutes;

  if (diff <= graceMinutes) {
    return {
      status: "ON_TIME",
      minutesLate: Math.max(0, diff),
    };
  }

  return {
    status: "LATE",
    minutesLate: diff,
  };
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes <= 0) {
    return "0m";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}j`;
  }

  return `${hours}j ${mins}m`;
}
