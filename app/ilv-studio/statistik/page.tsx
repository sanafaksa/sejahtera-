import Link from "next/link";
import { BarChart3, Globe2, MapPin, Users, Eye, CalendarClock, Plane } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import {
  breakdowns,
  daily,
  inScope,
  overview,
  pagesSplit,
  places,
  geoPoints,
  DEVICE_LABELS,
  type Scope,
  type VisitRow,
} from "@/lib/analytics/stats";
import VisitorMap from "@/components/admin/stats/VisitorMap";
import { countryName, mapsUrl, provinceName } from "@/lib/analytics/regions";
import Flag from "@/components/admin/stats/Flag";
import StatsRegionFilter from "@/components/admin/stats/StatsRegionFilter";
import { ADMIN_TZ, addDays, dateKey, formatDateTime, isValidTimeZone, startOfZonedDay } from "@/lib/timezones";
import DailyChart from "@/components/admin/stats/DailyChart";
import BarList from "@/components/admin/stats/BarList";
import UtmBuilder from "@/components/admin/stats/UtmBuilder";
import { getSetting } from "@/lib/settings";
import { clockSettingsSchema, DEFAULT_CLOCK_SETTINGS } from "@/lib/clock";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
const MAX_ROWS = 200_000;

async function loadVisits(days: number): Promise<VisitRow[]> {
  const today = dateKey(new Date(), ADMIN_TZ);
  const since = startOfZonedDay(addDays(today, -(days - 1)), ADMIN_TZ);
  try {
    return await prisma.pageVisit.findMany({
      where: { createdAt: { gte: since } },
      select: {
        createdAt: true,
        visitorId: true,
        path: true,
        productSlug: true,
        country: true,
        region: true,
        city: true,
        latitude: true,
        longitude: true,
        geoPrecise: true,
        timezone: true,
        device: true,
        os: true,
        browser: true,
        inApp: true,
        source: true,
      },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
  } catch (error) {
    console.warn("Failed to load visits:", error);
    return [];
  }
}

async function loadProducts() {
  try {
    return await prisma.product.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

function pct(v: number | null) {
  return v === null ? "–" : `${Math.round(v * 100)}%`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 min-w-0">
      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
        <Icon className="w-4 h-4 text-[#A8602A] shrink-0 mt-0.5" />
        <span className="leading-snug">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums truncate">{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1 truncate">{hint}</p>}
    </div>
  );
}

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; tab?: string; region?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const range = RANGES.find((r) => String(r) === params.range) ?? 30;
  const tab: Scope = params.tab === "intl" ? "intl" : "id";
  const region = params.region ?? "";

  const [rows, products, clock] = await Promise.all([
    loadVisits(range),
    loadProducts(),
    getSetting("clock", clockSettingsSchema, DEFAULT_CLOCK_SETTINGS),
  ]);
  const showLocal = clock.showLocalTimeInRecent;
  const hour12 = clock.hour12;
  const ov = overview(rows);
  const points = daily(rows, range);

  // Rows for the active tab, then optionally narrowed to one province/country.
  const scopedAll = rows.filter((r) => inScope(r, tab));
  const regionKey = (r: VisitRow) => (tab === "id" ? r.region : r.country);
  const scoped = region ? scopedAll.filter((r) => regionKey(r) === region) : scopedAll;

  // Region filter options (most-visited first), built from the unfiltered tab rows.
  const regionCounts = new Map<string, number>();
  for (const r of scopedAll) {
    const k = regionKey(r);
    if (k) regionCounts.set(k, (regionCounts.get(k) ?? 0) + 1);
  }
  const regionOptions = [...regionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      value,
      label: `${tab === "id" ? provinceName(value) : countryName(value)} (${count})`,
    }));

  const parts = breakdowns(scoped);
  const pages = pagesSplit(scoped);
  const mapPoints = geoPoints(scoped);
  const preciseCount = scoped.filter((r) => r.geoPrecise).length;
  const placeRows =
    tab === "id" ? places(scoped, (r) => r.region) : places(scoped, (r) => r.country);
  const recent = scoped.slice(0, 25);

  const href = (next: { range?: number; tab?: Scope }) =>
    `/ilv-studio/statistik?range=${next.range ?? range}&tab=${next.tab ?? tab}`;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Statistik</h1>
          <p className="text-gray-600">
            Kunjungan anonim ke website Ilavio. Semua waktu dalam WIB.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 self-start" role="group" aria-label="Rentang waktu">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={href({ range: r })}
              aria-current={r === range ? "true" : undefined}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                r === range ? "bg-[#A8602A] text-white font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {r} hari
            </Link>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Eye} label="Total kunjungan" value={ov.total.toLocaleString("id-ID")} hint={`${range} hari terakhir`} />
        <StatCard icon={Users} label="Pengunjung unik" value={ov.unique.toLocaleString("id-ID")} />
        <StatCard icon={Plane} label="Dari luar Indonesia" value={pct(ov.foreignShare)} />
        <StatCard icon={Globe2} label="Jumlah negara" value={String(ov.countryCount)} />
        <StatCard
          icon={MapPin}
          label="Negara / kota teratas"
          value={
            ov.topCountry ? (
              <span className="inline-flex items-center gap-1.5">
                <Flag code={ov.topCountry.code} /> {countryName(ov.topCountry.code)}
              </span>
            ) : (
              "–"
            )
          }
          hint={ov.topCity ? `${ov.topCity.city} (${ov.topCity.visits} kunjungan)` : undefined}
        />
        <StatCard
          icon={CalendarClock}
          label="Hari ini"
          value={ov.todayVisits.toLocaleString("id-ID")}
          hint={`${ov.todayUnique} pengunjung unik`}
        />
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#A8602A]" />
          <h2 className="font-semibold text-gray-900">Kunjungan harian</h2>
        </div>
        <DailyChart points={points} />
      </div>

      {/* Tabs + region filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div className="border-b border-gray-200 flex gap-6 flex-1" role="tablist">
        {(
          [
            ["id", "Indonesia"],
            ["intl", "Internasional"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={href({ tab: key })}
            role="tab"
            aria-selected={tab === key}
            className={`-mb-px pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-[#A8602A] text-[#A8602A]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
            <span className="ml-2 text-xs text-gray-400 tabular-nums">
              {rows.filter((r) => inScope(r, key)).length}
            </span>
          </Link>
        ))}
      </div>
        {regionOptions.length > 0 && (
          <StatsRegionFilter
            value={region}
            options={regionOptions}
            basePath={href({})}
            label={tab === "id" ? "Provinsi" : "Negara"}
          />
        )}
      </div>

      {/* Visitor map */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 sm:px-6 pt-5 pb-3">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#A8602A]" /> Peta pengunjung
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8602A]" /> perkiraan (IP)
              </span>
              <span className="inline-flex items-center gap-1 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> presisi (GPS,{" "}
                {preciseCount.toLocaleString("id-ID")})
              </span>
            </p>
          </div>
        </div>
        <VisitorMap points={mapPoints} />
      </div>

      {/* Places table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-900 px-5 sm:px-6 pt-5">
          {tab === "id" ? "Per provinsi" : "Per negara"}
        </h2>
        {placeRows.length === 0 ? (
          <p className="px-5 sm:px-6 py-6 text-sm text-gray-500">Belum ada kunjungan pada rentang ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left mt-3">
              <thead className="text-xs text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 sm:px-6 py-2 font-medium">{tab === "id" ? "Provinsi" : "Negara"}</th>
                  <th className="px-3 py-2 font-medium">Kota teratas</th>
                  <th className="px-3 py-2 font-medium text-right">Kunjungan</th>
                  <th className="px-3 py-2 font-medium text-right">Unik</th>
                  <th className="px-3 py-2 font-medium min-w-32">Porsi</th>
                  <th className="px-5 sm:px-6 py-2 font-medium">Perangkat umum</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {placeRows.slice(0, 30).map((p) => (
                  <tr key={p.code} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 sm:px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        {tab === "intl" && <Flag code={p.code} />}
                        {tab === "id"
                          ? p.code === "??"
                            ? "Tidak diketahui"
                            : provinceName(p.code)
                          : countryName(p.code === "??" ? null : p.code)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {p.topCity ? (
                        <a
                          href={mapsUrl([
                            p.topCity,
                            tab === "id" ? provinceName(p.code) : countryName(p.code === "??" ? null : p.code),
                          ])}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#A8602A] hover:underline"
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {p.topCity}
                        </a>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{p.visits}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{p.unique}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#A8602A]" style={{ width: `${Math.max(2, p.share * 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums w-9 text-right">{pct(p.share)}</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-2.5">{p.topDevice ? DEVICE_LABELS[p.topDevice] ?? p.topDevice : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <BarList title="Jenis perangkat" items={parts.devices} />
        <BarList title="Sistem operasi" items={parts.os} />
        <BarList title="Browser" items={parts.browsers} />
        <BarList title="Dibuka dari" items={parts.sources} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <BarList
          title="Halaman non-produk"
          items={pages.others}
          empty="Belum ada kunjungan halaman non-produk."
        />
        <BarList
          title="Halaman produk"
          items={pages.products}
          empty="Belum ada kunjungan halaman produk."
        />
      </div>

      {/* Recent visits */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-900 px-5 sm:px-6 pt-5">Kunjungan terbaru</h2>
        {recent.length === 0 ? (
          <p className="px-5 sm:px-6 py-6 text-sm text-gray-500">Belum ada kunjungan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left mt-3">
              <thead className="text-xs text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 sm:px-6 py-2 font-medium">Waktu (WIB)</th>
                  {showLocal && <th className="px-3 py-2 font-medium">Jam setempat</th>}
                  <th className="px-3 py-2 font-medium">Lokasi</th>
                  <th className="px-3 py-2 font-medium">Halaman</th>
                  <th className="px-3 py-2 font-medium">Perangkat</th>
                  <th className="px-5 sm:px-6 py-2 font-medium">Dibuka dari</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {recent.map((r, i) => (
                  <tr key={`${r.createdAt.toISOString()}-${i}`} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 sm:px-6 py-2.5 whitespace-nowrap tabular-nums">{formatDateTime(r.createdAt, ADMIN_TZ, hour12)}</td>
                    {showLocal && (
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-gray-500">
                        {isValidTimeZone(r.timezone) ? formatDateTime(r.createdAt, r.timezone, hour12) : "–"}
                      </td>
                    )}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {(() => {
                        const placeName = [
                          r.city,
                          r.country === "ID" ? provinceName(r.region) : countryName(r.country),
                        ]
                          .filter(Boolean)
                          .join(", ");
                        const inner = (
                          <span className="inline-flex items-center gap-1.5">
                            <Flag code={r.country} />
                            {placeName || "Tidak diketahui"}
                          </span>
                        );
                        return placeName ? (
                          <a
                            href={mapsUrl([
                              r.city,
                              r.country === "ID" ? provinceName(r.region) : countryName(r.country),
                            ])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#A8602A] hover:underline"
                            title="Buka di Google Maps"
                          >
                            {inner}
                          </a>
                        ) : (
                          inner
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2.5 max-w-56 truncate" title={r.path}>{r.path}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {[DEVICE_LABELS[r.device] ?? r.device, r.os, r.browser].filter(Boolean).join(" · ")}
                    </td>
                    <td className="px-5 sm:px-6 py-2.5 whitespace-nowrap">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UtmBuilder products={products} />
    </div>
  );
}
