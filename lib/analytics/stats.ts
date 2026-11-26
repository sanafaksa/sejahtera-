/**
 * Pure aggregation of page visits for the Statistik page. Everything is
 * grouped by calendar day in WIB; rows carry UTC timestamps.
 */
import { ADMIN_TZ, addDays, dateKey } from "@/lib/timezones";

export interface VisitRow {
  createdAt: Date;
  visitorId: string;
  path: string;
  productSlug: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  geoPrecise: boolean;
  timezone: string | null;
  device: string;
  os: string | null;
  browser: string | null;
  inApp: string | null;
  source: string;
}

export type Scope = "id" | "intl";

export interface Count {
  label: string;
  count: number;
  share: number; // 0..1
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD (WIB)
  indonesia: number;
  foreign: number;
  unknown: number;
}

export interface PlaceRow {
  code: string;
  visits: number;
  unique: number;
  share: number;
  topCity: string | null;
  topDevice: string | null;
}

export interface Overview {
  total: number;
  unique: number;
  foreignShare: number | null; // null when no visit has a known country
  countryCount: number;
  topCountry: { code: string; visits: number } | null;
  topCity: { city: string; country: string | null; visits: number } | null;
  todayVisits: number;
  todayUnique: number;
}

export function inScope(row: Pick<VisitRow, "country">, scope: Scope): boolean {
  if (scope === "id") return row.country === "ID";
  return row.country !== null && row.country !== "ID";
}

function tally<T>(rows: T[], key: (r: T) => string | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

function top(m: Map<string, number>): [string, number] | null {
  let best: [string, number] | null = null;
  for (const e of m) if (!best || e[1] > best[1]) best = e;
  return best;
}

export function toCounts(m: Map<string, number>, limit = 8): Count[] {
  const total = [...m.values()].reduce((a, b) => a + b, 0);
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((a, [, c]) => a + c, 0);
  if (rest > 0) head.push(["Lainnya", rest]);
  return head.map(([label, count]) => ({ label, count, share: total ? count / total : 0 }));
}

export function overview(rows: VisitRow[], now: Date = new Date()): Overview {
  const known = rows.filter((r) => r.country);
  const foreign = known.filter((r) => r.country !== "ID").length;
  const countries = tally(rows, (r) => r.country);
  const topCountry = top(countries);
  const cities = tally(rows, (r) => (r.city ? `${r.city}|${r.country ?? ""}` : null));
  const topCity = top(cities);
  const today = dateKey(now, ADMIN_TZ);
  const todayRows = rows.filter((r) => dateKey(r.createdAt, ADMIN_TZ) === today);

  return {
    total: rows.length,
    unique: new Set(rows.map((r) => r.visitorId)).size,
    foreignShare: known.length ? foreign / known.length : null,
    countryCount: countries.size,
    topCountry: topCountry ? { code: topCountry[0], visits: topCountry[1] } : null,
    topCity: topCity
      ? {
          city: topCity[0].split("|")[0],
          country: topCity[0].split("|")[1] || null,
          visits: topCity[1],
        }
      : null,
    todayVisits: todayRows.length,
    todayUnique: new Set(todayRows.map((r) => r.visitorId)).size,
  };
}

export function daily(rows: VisitRow[], days: number, now: Date = new Date()): DailyPoint[] {
  const last = dateKey(now, ADMIN_TZ);
  const points = new Map<string, DailyPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(last, -i);
    points.set(d, { date: d, indonesia: 0, foreign: 0, unknown: 0 });
  }
  for (const r of rows) {
    const p = points.get(dateKey(r.createdAt, ADMIN_TZ));
    if (!p) continue;
    if (r.country === "ID") p.indonesia++;
    else if (r.country) p.foreign++;
    else p.unknown++;
  }
  return [...points.values()];
}

/** Rows grouped by `key` (country code or province code), most visits first. */
export function places(rows: VisitRow[], key: (r: VisitRow) => string | null): PlaceRow[] {
  const groups = new Map<string, VisitRow[]>();
  for (const r of rows) {
    const k = key(r) ?? "??";
    const g = groups.get(k);
    if (g) g.push(r);
    else groups.set(k, [r]);
  }
  return [...groups.entries()]
    .map(([code, g]) => ({
      code,
      visits: g.length,
      unique: new Set(g.map((r) => r.visitorId)).size,
      share: rows.length ? g.length / rows.length : 0,
      topCity: top(tally(g, (r) => r.city))?.[0] ?? null,
      topDevice: top(tally(g, (r) => r.device))?.[0] ?? null,
    }))
    .sort((a, b) => b.visits - a.visits);
}

export const DEVICE_LABELS: Record<string, string> = {
  mobile: "HP",
  tablet: "Tablet",
  desktop: "Desktop",
};

export function breakdowns(rows: VisitRow[]) {
  return {
    devices: toCounts(tally(rows, (r) => DEVICE_LABELS[r.device] ?? r.device)),
    os: toCounts(tally(rows, (r) => r.os ?? "Lainnya")),
    browsers: toCounts(tally(rows, (r) => r.browser ?? "Lainnya")),
    sources: toCounts(tally(rows, (r) => r.source)),
    pages: toCounts(tally(rows, (r) => r.path), 10),
  };
}

/** Friendly names for known non-product routes. */
const PAGE_LABELS: Record<string, string> = {
  "/": "Beranda",
  "/about": "Tentang",
  "/products": "Produk (katalog)",
  "/gallery": "Galeri",
  "/contact": "Kontak",
  "/craftsmanship": "Craftsmanship",
  "/export": "Export",
  "/bali": "Bali",
};

export function pageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/collections/")) return `Koleksi: ${path.split("/")[2] ?? ""}`;
  if (path.startsWith("/products/")) return `Produk: ${path.split("/")[2] ?? ""}`;
  return path;
}

/** Split page views into product pages and everything else (non-product). */
export function pagesSplit(rows: VisitRow[]): { products: Count[]; others: Count[] } {
  const products = rows.filter((r) => r.productSlug);
  const others = rows.filter((r) => !r.productSlug);
  return {
    products: toCounts(tally(products, (r) => pageLabel(r.path)), 10),
    others: toCounts(tally(others, (r) => pageLabel(r.path)), 10),
  };
}

export interface GeoPoint {
  lat: number;
  lng: number;
  count: number;
  precise: boolean;
  label: string;
}

/** Cluster visits that carry coordinates into map points (precise kept finer). */
export function geoPoints(rows: VisitRow[]): GeoPoint[] {
  const m = new Map<string, GeoPoint>();
  for (const r of rows) {
    if (r.latitude == null || r.longitude == null) continue;
    const dp = r.geoPrecise ? 4 : 2; // ~11 m precise, ~1 km approximate
    const lat = Number(r.latitude.toFixed(dp));
    const lng = Number(r.longitude.toFixed(dp));
    const key = `${lat},${lng},${r.geoPrecise ? 1 : 0}`;
    const existing = m.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      m.set(key, {
        lat,
        lng,
        count: 1,
        precise: r.geoPrecise,
        label: [r.city, r.country].filter(Boolean).join(", ") || "Tidak diketahui",
      });
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
