/**
 * Pure calculation and formatting helpers.
 * Zero server directives, zero database imports.
 * All computations anchored in Asia/Jakarta (WIB = UTC+7).
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WIB_OFFSET_HOURS = 7;

const toWib = (date: Date): Date => new Date(date.getTime() + WIB_OFFSET_HOURS * 60 * 60 * 1000);

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  return 'Rp' + rounded.toLocaleString('id-ID');
}

// ---------------------------------------------------------------------------
// calculateKpiGrowth
// ---------------------------------------------------------------------------

/**
 * Compute percentage growth between two values.
 *
 * - previous === 0 & current > 0   → { value: 100, label: "+100%", positive: true }
 * - previous === 0 & current === 0 → { value: 0, label: "0%", positive: true }
 * - previous !== 0                  → round to 1 decimal, signed label
 */
export function calculateKpiGrowth(
  current: number,
  previous: number,
): { value: number; label: string; positive: boolean } {
  if (previous === 0) {
    if (current > 0) {
      return { value: 100, label: '+100%', positive: true };
    }
    // current === 0
    return { value: 0, label: '0%', positive: true };
  }

  const raw = ((current - previous) / previous) * 100;
  const value = Math.round(raw * 10) / 10; // 1 decimal place
  const positive = value >= 0;
  const label = `${positive ? '+' : ''}${value}%`;
  return { value, label, positive };
}

// ---------------------------------------------------------------------------
// resolveDateRange
// ---------------------------------------------------------------------------

/**
 * Calculate current + previous date ranges anchored in Asia/Jakarta (WIB).
 *
 * Presets:
 *   "7d"    – last 7 days / previous 7 days
 *   "30d"   – last 30 days / previous 30 days
 *   "this_month" – current WIB month / previous WIB month
 *   "last_month" – last WIB month / month before last
 */
export function resolveDateRange(
  preset: '7d' | '30d' | 'this_month' | 'last_month',
  now: Date = new Date(),
) {
  const w = toWib(now); // reference point in WIB

  switch (preset) {
    case '7d': {
      // current: last 7 days inclusive of w (w - 6d … w)
      // previous: 7 days before current starts (w - 13d … w - 7d)
      const currentEnd = w;
      const currentStart = new Date(w.getTime() - 6 * 86_400_000); // 6 days before
      const previousEnd = new Date(w.getTime() - 7 * 86_400_000); // day before current starts
      const previousStart = new Date(w.getTime() - 13 * 86_400_000); // 13 days before w

      return {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      };
    }

    case '30d': {
      // current: last 30 days inclusive of w (w - 29d … w)
      // previous: 30 days before current starts (w - 59d … w - 30d)
      const currentEnd = w;
      const currentStart = new Date(w.getTime() - 29 * 86_400_000);
      const previousEnd = new Date(w.getTime() - 30 * 86_400_000);
      const previousStart = new Date(w.getTime() - 59 * 86_400_000);

      return {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      };
    }

    case 'this_month': {
      // Current month in WIB: from 1st day 00:00 to last day 23:59:59
      const currentStart = new Date(Date.UTC(w.getFullYear(), w.getMonth(), 1));
      // Last day of current month
      const nextMonth = w.getMonth() + 1;
      const nextYear = w.getMonth() + 1 >= 12 ? w.getFullYear() + 1 : w.getFullYear();
      const currentEnd = new Date(Date.UTC(nextYear, nextMonth, 0, 23, 59, 59, 999));

      // Previous month
      const prevMonth = w.getMonth() - 1;
      const prevYear = w.getMonth() - 1 < 0 ? w.getFullYear() - 1 : w.getFullYear();
      const prevNextMonth = prevMonth + 1;
      const prevNextYear = prevMonth + 1 >= 12 ? prevYear + 1 : prevYear;
      const previousStart = new Date(Date.UTC(prevYear, prevMonth, 1));
      const previousEnd = new Date(Date.UTC(prevNextYear, prevNextMonth, 0, 23, 59, 59, 999));

      return {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      };
    }

    case 'last_month': {
      // Last month in WIB (relative to now) and the one before it
      const year = w.getFullYear();
      const month = w.getMonth(); // 0-indexed current month

      // Last month (the "current" period in the pair)
      const lastM = month - 1;
      const lastY = lastM < 0 ? year - 1 : year;
      const lastMonthStart = new Date(Date.UTC(lastY, lastM, 1));
      const lastNextM = lastM + 1; // 1-indexed for Date.UTC rollover
      const lastNextY = lastM + 1 >= 12 ? lastY + 1 : lastY;
      const lastMonthEnd = new Date(Date.UTC(lastNextY, lastNextM, 0, 23, 59, 59, 999));

      // Month before last month
      const prevM = lastM - 1;
      const prevY = prevM < 0 ? lastY - 1 : lastY;
      const prevNextM = prevM + 1;
      const prevNextY = prevM + 1 >= 12 ? prevY + 1 : prevY;
      const previousStart = new Date(Date.UTC(prevY, prevM, 1));
      const previousEnd = new Date(Date.UTC(prevNextY, prevNextM, 0, 23, 59, 59, 999));

      return {
        current: { start: lastMonthStart, end: lastMonthEnd },
        previous: { start: previousStart, end: previousEnd },
      };
    }

    default:
      // TypeScript exhaustive check already; this is a safety net.
      const _exhaustive: never = preset;
      throw new Error(`Unhandled preset: ${String(_exhaustive)}`);
  }
}

// ---------------------------------------------------------------------------
// generateSvgPath
// ---------------------------------------------------------------------------

/**
 * Generate an SVG polyline from points, and an enclosed-area path that
 * drops down to y=100 and closes back to the start.
 *
 * Returns { pathD, areaD } where:
 *   pathD  = "M x1 y1 L x2 y2 L x3 y3 ..."
 *   areaD  = pathD + " L lastX 100 L firstX 100 Z"
 */
export function generateSvgPath(
  points: { x: number; y: number }[],
): { pathD: string; areaD: string } {
  if (points.length === 0) {
    return { pathD: '', areaD: 'Z' };
  }

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;

  const areaD = `${pathD} L ${lastX} 100 L ${firstX} 100 Z`;

  return { pathD, areaD };
}