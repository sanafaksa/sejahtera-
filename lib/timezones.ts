/**
 * Time-zone helpers built on Intl.DateTimeFormat and IANA zone names.
 * Offsets are never hard-coded, so daylight-saving changes are picked up
 * automatically from the runtime's time-zone database.
 */

export const ADMIN_TZ = "Asia/Jakarta";

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  /** 0 = Sunday ... 6 = Saturday */
  weekday: number;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = partsFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hourCycle: "h23",
    });
    partsFormatters.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const out: Record<string, string> = {};
  for (const p of partsFormatter(timeZone).formatToParts(date)) out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    weekday: WEEKDAYS[out.weekday] ?? 0,
  };
}

/** UTC offset of `timeZone` at `date`, in minutes (e.g. +420 for WIB). */
export function offsetMinutes(timeZone: string, date: Date = new Date()): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  const truncated = Math.floor(date.getTime() / 60000) * 60000;
  return Math.round((asUtc - truncated) / 60000);
}

/** "UTC+7", "UTC-4", "UTC+5:30" */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** Calendar date in a zone as "YYYY-MM-DD". */
export function dateKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** The UTC instant at which calendar day `key` (YYYY-MM-DD) starts in `timeZone`. */
export function startOfZonedDay(key: string, timeZone: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  const wallClock = Date.UTC(y, m - 1, d);
  // Two passes settle the offset even when the day starts near a DST switch.
  let guess = wallClock - offsetMinutes(timeZone, new Date(wallClock)) * 60000;
  guess = wallClock - offsetMinutes(timeZone, new Date(guess)) * 60000;
  return new Date(guess);
}

/** Shift a YYYY-MM-DD key by whole days. */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

export function formatClock(date: Date, timeZone: string, hour12 = false): string {
  return new Intl.DateTimeFormat(hour12 ? "en-US" : "id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    ...(hour12 ? { hour12: true } : { hourCycle: "h23" as const }),
  })
    .format(date)
    .replace(".", ":");
}

export function formatDateTime(date: Date, timeZone: string, hour12 = false): string {
  const day = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    day: "numeric",
    month: "short",
  }).format(date);
  return `${day}, ${formatClock(date, timeZone, hour12)}`;
}
