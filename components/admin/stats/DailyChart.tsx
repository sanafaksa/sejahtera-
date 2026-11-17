"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/analytics/stats";

const COLORS = {
  indonesia: "#A8602A",
  foreign: "#1F6FA8",
  unknown: "#B8B2AA",
};

function shortDate(key: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${key}T00:00:00Z`)
  );
}

function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= n / 4)! * pow;
  return Math.ceil(n / step) * step;
}

export default function DailyChart({ points }: { points: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const hasUnknown = points.some((p) => p.unknown > 0);
  const max = niceMax(Math.max(1, ...points.map((p) => p.indonesia + p.foreign + p.unknown)));
  const ticks = [0, max / 2, max];
  const labelEvery = points.length > 31 ? 15 : points.length > 7 ? 5 : 1;
  const active = hover !== null ? points[hover] : null;

  const series: Array<{ key: keyof typeof COLORS; label: string }> = [
    { key: "indonesia", label: "Indonesia" },
    { key: "foreign", label: "Luar negeri" },
    ...(hasUnknown ? [{ key: "unknown" as const, label: "Tidak diketahui" }] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[s.key] }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="relative flex gap-2">
        {/* Y axis */}
        <div className="flex flex-col justify-between h-48 text-[11px] text-gray-400 text-right w-8 shrink-0 -mt-1.5 pb-0">
          {[...ticks].reverse().map((t) => (
            <span key={t}>{Number.isInteger(t) ? t : t.toFixed(1)}</span>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          {/* Grid */}
          <div className="absolute inset-x-0 top-0 h-48 flex flex-col justify-between pointer-events-none">
            {ticks.map((t) => (
              <div key={t} className="border-t border-gray-100" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-48 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {points.map((p, i) => {
              const total = p.indonesia + p.foreign + p.unknown;
              return (
                <button
                  type="button"
                  key={p.date}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${shortDate(p.date)}: ${total} kunjungan`}
                  className={`relative flex-1 h-full flex flex-col justify-end gap-[2px] min-w-0 rounded-t ${
                    hover === i ? "bg-gray-50" : ""
                  }`}
                >
                  {series
                    .slice()
                    .reverse()
                    .map((s) =>
                      p[s.key] > 0 ? (
                        <span
                          key={s.key}
                          className="block w-full max-w-6 mx-auto first:rounded-t"
                          style={{ height: `${(p[s.key] / max) * 100}%`, background: COLORS[s.key] }}
                        />
                      ) : null
                    )}
                </button>
              );
            })}
          </div>

          {/* X labels */}
          <div className="flex gap-[2px] mt-2 text-[11px] text-gray-400">
            {points.map((p, i) => (
              <span
                key={p.date}
                className={`flex-1 min-w-0 text-center whitespace-nowrap overflow-visible ${
                  labelEvery === 1 && (points.length - 1 - i) % 2 === 1 ? "invisible sm:visible" : ""
                }`}
              >
                {(points.length - 1 - i) % labelEvery === 0 ? shortDate(p.date) : ""}
              </span>
            ))}
          </div>

          {/* Tooltip */}
          {active && hover !== null && (
            <div
              className="absolute top-0 z-10 pointer-events-none bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs text-gray-700 w-40"
              style={{
                left: `clamp(0px, calc(${((hover + 0.5) / points.length) * 100}% - 80px), calc(100% - 160px))`,
              }}
            >
              <p className="font-semibold text-gray-900 mb-1">{shortDate(active.date)}</p>
              {series.map((s) => (
                <p key={s.key} className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ background: COLORS[s.key] }} />
                    {s.label}
                  </span>
                  <span className="font-medium tabular-nums">{active[s.key]}</span>
                </p>
              ))}
              <p className="flex justify-between border-t border-gray-100 mt-1 pt-1 font-semibold text-gray-900">
                <span>Total</span>
                <span className="tabular-nums">{active.indonesia + active.foreign + active.unknown}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Lihat sebagai tabel</summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-gray-700">
            <thead className="text-xs text-gray-500">
              <tr>
                <th className="py-1 pr-4 font-medium">Tanggal (WIB)</th>
                {series.map((s) => (
                  <th key={s.key} className="py-1 pr-4 font-medium text-right">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date} className="border-t border-gray-100">
                  <td className="py-1 pr-4">{shortDate(p.date)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="py-1 pr-4 text-right tabular-nums">
                      {p[s.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
