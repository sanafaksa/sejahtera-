import Link from "next/link";
import { BarChart3, Globe2, MapPin, Users, Eye, CalendarClock, Plane } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import {
  breakdowns,
  daily,
  inScope,
  overview,
  places,
  DEVICE_LABELS,
  type Scope,
  type VisitRow,
} from "@/lib/analytics/stats";
import { countryFlag, countryName, provinceName } from "@/lib/analytics/regions";
import { ADMIN_TZ, addDays, dateKey, formatDateTime, isValidTimeZone, startOfZonedDay } from "@/lib/timezones";
import DailyChart from "@/components/admin/stats/DailyChart";
import BarList from "@/components/admin/stats/BarList";
import UtmBuilder from "@/components/admin/stats/UtmBuilder";

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
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 min-w-0">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Icon className="w-4 h-4 text-[#A8602A] shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums truncate">{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1 truncate">{hint}</p>}
    </div>
  );
}

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; tab?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const range = RANGES.find((r) => String(r) === params.range) ?? 30;
  const tab: Scope = params.tab === "intl" ? "intl" : "id";

  const [rows, products] = await Promise.all([loadVisits(range), loadProducts()]);
  const ov = overview(rows);
  const points = daily(rows, range);
  const scoped = rows.filter((r) => inScope(r, tab));
  const parts = breakdowns(scoped);
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
          value={ov.topCountry ? `${countryFlag(ov.topCountry.code)} ${countryName(ov.topCountry.code)}` : "–"}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6" role="tablist">
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
                      {tab === "id"
                        ? p.code === "??"
                          ? "Tidak diketahui"
                          : provinceName(p.code)
                        : `${countryFlag(p.code)} ${countryName(p.code === "??" ? null : p.code)}`}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{p.topCity ?? "–"}</td>
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
      <BarList title="Halaman paling sering dibuka" items={parts.pages} />

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
                  <th className="px-3 py-2 font-medium">Jam setempat</th>
                  <th className="px-3 py-2 font-medium">Lokasi</th>
                  <th className="px-3 py-2 font-medium">Halaman</th>
                  <th className="px-3 py-2 font-medium">Perangkat</th>
                  <th className="px-5 sm:px-6 py-2 font-medium">Dibuka dari</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {recent.map((r, i) => (
                  <tr key={`${r.createdAt.toISOString()}-${i}`} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 sm:px-6 py-2.5 whitespace-nowrap tabular-nums">{formatDateTime(r.createdAt, ADMIN_TZ)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-gray-500">
                      {isValidTimeZone(r.timezone) ? formatDateTime(r.createdAt, r.timezone) : "–"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {countryFlag(r.country)}{" "}
                      {[r.city, r.country === "ID" ? provinceName(r.region) : countryName(r.country)]
                        .filter(Boolean)
                        .join(", ")}
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
