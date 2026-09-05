const WIB_OFFSET_HOURS = 7;
const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

export function getWibDayBounds(now: Date = new Date()): { readonly start: Date; readonly end: Date } {
  const wibTime = new Date(now.getTime() + WIB_OFFSET_MS);
  const year = wibTime.getUTCFullYear();
  const month = wibTime.getUTCMonth();
  const date = wibTime.getUTCDate();

  const start = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - WIB_OFFSET_MS);
  const end = new Date(Date.UTC(year, month, date, 23, 59, 59, 999) - WIB_OFFSET_MS);

  return { start, end };
}

export function getWibMonthStart(now: Date = new Date()): Date {
  const wibTime = new Date(now.getTime() + WIB_OFFSET_MS);
  const year = wibTime.getUTCFullYear();
  const month = wibTime.getUTCMonth();

  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - WIB_OFFSET_MS);
}

export function getWibTodayIso(now: Date = new Date()): string {
  const wibTime = new Date(now.getTime() + WIB_OFFSET_MS);
  const year = wibTime.getUTCFullYear();
  const month = String(wibTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wibTime.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWibIsoBounds(iso: string): { readonly start: Date; readonly end: Date } {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - WIB_OFFSET_MS);
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - WIB_OFFSET_MS);

  return { start, end };
}
