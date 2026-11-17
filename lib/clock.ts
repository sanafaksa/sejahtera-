/**
 * "Jam Wilayah": region clocks, local business status and best-hour
 * suggestions. Pure functions on top of lib/timezones (Intl + IANA names).
 */
import { z } from "zod";
import { ADMIN_TZ, dateKey, isValidTimeZone, offsetMinutes, zonedParts } from "@/lib/timezones";

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const clockRegionSchema = z.object({
  id: z.string().min(1).max(64),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^([A-Z]{2})?$/, "Kode negara harus 2 huruf"),
  city: z.string().trim().min(1, "Nama kota wajib diisi").max(60),
  timeZone: z.string().refine(isValidTimeZone, "Zona waktu tidak dikenal"),
  enabled: z.boolean(),
});

export const clockSettingsSchema = z.object({
  regions: z.array(clockRegionSchema).max(40),
  hour12: z.boolean(),
  showLocalTimeInRecent: z.boolean(),
  showBuyerTimeOnInvoice: z.boolean(),
});

export type ClockRegion = z.infer<typeof clockRegionSchema>;
export type ClockSettings = z.infer<typeof clockSettingsSchema>;

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  regions: [
    { id: "id-jakarta", country: "ID", city: "Jakarta", timeZone: "Asia/Jakarta", enabled: true },
    { id: "us-new-york", country: "US", city: "New York", timeZone: "America/New_York", enabled: true },
    { id: "de-berlin", country: "DE", city: "Berlin", timeZone: "Europe/Berlin", enabled: true },
    { id: "au-sydney", country: "AU", city: "Sydney", timeZone: "Australia/Sydney", enabled: true },
    { id: "gb-london", country: "GB", city: "London", timeZone: "Europe/London", enabled: true },
    { id: "nl-amsterdam", country: "NL", city: "Amsterdam", timeZone: "Europe/Amsterdam", enabled: true },
    { id: "my-kuala-lumpur", country: "MY", city: "Kuala Lumpur", timeZone: "Asia/Kuala_Lumpur", enabled: true },
    { id: "sg-singapore", country: "SG", city: "Singapura", timeZone: "Asia/Singapore", enabled: true },
    { id: "jp-tokyo", country: "JP", city: "Tokyo", timeZone: "Asia/Tokyo", enabled: true },
  ],
  hour12: false,
  showLocalTimeInRecent: true,
  showBuyerTimeOnInvoice: false,
};

// ---------------------------------------------------------------------------
// Status & comparisons
// ---------------------------------------------------------------------------

export type RegionStatus = "work" | "edge" | "sleep" | "weekend";

export const STATUS_LABELS: Record<RegionStatus, string> = {
  work: "Jam kerja",
  edge: "Pagi / malam",
  sleep: "Waktu tidur",
  weekend: "Akhir pekan",
};

/**
 * Local status of a region at `date`:
 * - Jam kerja: Mon-Fri 09:00-17:59
 * - Pagi / malam: Mon-Fri 06:00-08:59 and 18:00-21:59
 * - Akhir pekan: Sat/Sun 06:00-21:59
 * - Waktu tidur: every day 22:00-05:59
 */
export function regionStatus(date: Date, timeZone: string): RegionStatus {
  const { hour, weekday } = zonedParts(date, timeZone);
  if (hour < 6 || hour >= 22) return "sleep";
  if (weekday === 0 || weekday === 6) return "weekend";
  if (hour >= 9 && hour < 18) return "work";
  return "edge";
}

export type DayRelation = "Kemarin" | "Hari ini" | "Besok";

/** Whether the region's calendar day is before, equal to or after the WIB day. */
export function dayRelation(date: Date, timeZone: string, reference = ADMIN_TZ): DayRelation {
  const a = dateKey(date, timeZone);
  const b = dateKey(date, reference);
  if (a === b) return "Hari ini";
  return a < b ? "Kemarin" : "Besok";
}

/** Difference to WIB in minutes (positive = ahead of WIB). */
export function diffFromAdminMinutes(timeZone: string, date: Date): number {
  return offsetMinutes(timeZone, date) - offsetMinutes(ADMIN_TZ, date);
}

export function formatDiff(minutes: number): string {
  if (minutes === 0) return "Sama dengan WIB";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const text = m ? `${h} jam ${m} mnt` : `${h} jam`;
  return minutes > 0 ? `${text} lebih cepat` : `${text} lebih lambat`;
}

// ---------------------------------------------------------------------------
// Heatmap & suggestions
// ---------------------------------------------------------------------------

export interface HeatRow {
  country: string;
  total: number;
  /** visits per hour 0-23 in WIB */
  wib: number[];
  /** visits per hour 0-23 in the visitor's own time zone */
  local: number[];
}

export function emptyHours(): number[] {
  return Array.from({ length: 24 }, () => 0);
}

export function buildHeatmap(
  visits: Array<{ createdAt: Date; country: string | null; timezone: string | null }>,
  maxCountries = 10
): HeatRow[] {
  const rows = new Map<string, HeatRow>();
  for (const v of visits) {
    if (!v.country) continue;
    let row = rows.get(v.country);
    if (!row) {
      row = { country: v.country, total: 0, wib: emptyHours(), local: emptyHours() };
      rows.set(v.country, row);
    }
    row.total++;
    row.wib[zonedParts(v.createdAt, ADMIN_TZ).hour]++;
    const tz = isValidTimeZone(v.timezone) ? v.timezone : ADMIN_TZ;
    row.local[zonedParts(v.createdAt, tz).hour]++;
  }
  return [...rows.values()].sort((a, b) => b.total - a.total).slice(0, maxCountries);
}

/**
 * Busiest contiguous window of `length` hours (wrapping past midnight).
 * Returns null when there is no data.
 */
export function busiestWindow(hours: number[], length = 3): { start: number; end: number; visits: number } | null {
  if (hours.every((h) => h === 0)) return null;
  let best = { start: 0, visits: -1 };
  for (let start = 0; start < 24; start++) {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += hours[(start + i) % 24];
    if (sum > best.visits) best = { start, visits: sum };
  }
  return { start: best.start, end: (best.start + length) % 24, visits: best.visits };
}

export interface SuggestionGroup {
  id: "americas" | "europe" | "apac";
  label: string;
  /** IANA prefixes / zones that belong to the group */
  match: (timeZone: string) => boolean;
  /** used when there is no visit data yet */
  fallbackZone: string;
}

export const SUGGESTION_GROUPS: SuggestionGroup[] = [
  {
    id: "americas",
    label: "Amerika Serikat & Amerika",
    match: (tz) => tz.startsWith("America/") || tz.startsWith("US/"),
    fallbackZone: "America/New_York",
  },
  {
    id: "europe",
    label: "Eropa",
    match: (tz) => tz.startsWith("Europe/"),
    fallbackZone: "Europe/Berlin",
  },
  {
    id: "apac",
    label: "Australia & Asia",
    match: (tz) =>
      (tz.startsWith("Australia/") || tz.startsWith("Asia/") || tz.startsWith("Pacific/")) &&
      !["Asia/Jakarta", "Asia/Pontianak", "Asia/Makassar", "Asia/Jayapura"].includes(tz),
    fallbackZone: "Australia/Sydney",
  },
];

export interface Suggestion {
  id: SuggestionGroup["id"];
  label: string;
  /** busiest 3-hour window in WIB hours */
  start: number;
  end: number;
  visits: number;
  /** true when based on real visits, false when estimated from office hours */
  fromData: boolean;
}

/**
 * One suggestion per group. With visit data it is the busiest 3-hour WIB
 * window; without data it falls back to 19:00-22:00 local evening time in
 * the group's main zone (when people browse for home décor), converted to WIB.
 */
export function suggestHours(
  visits: Array<{ createdAt: Date; timezone: string | null; country: string | null }>,
  now: Date = new Date()
): Suggestion[] {
  return SUGGESTION_GROUPS.map((g) => {
    const hours = emptyHours();
    for (const v of visits) {
      if (v.country === "ID") continue;
      if (v.timezone && g.match(v.timezone)) hours[zonedParts(v.createdAt, ADMIN_TZ).hour]++;
    }
    const win = busiestWindow(hours);
    if (win) return { id: g.id, label: g.label, ...win, fromData: true };

    const diffHours = Math.round(diffFromAdminMinutes(g.fallbackZone, now) / 60);
    const start = (((19 - diffHours) % 24) + 24) % 24;
    return { id: g.id, label: g.label, start, end: (start + 3) % 24, visits: 0, fromData: false };
  });
}

export function hourLabel(h: number, hour12 = false): string {
  if (!hour12) return `${String(h).padStart(2, "0")}.00`;
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12} ${suffix}`;
}
