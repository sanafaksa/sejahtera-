"use client";

import { useState } from "react";
import { hourLabel, type HeatRow } from "@/lib/clock";

// Traffic-light ramp: green (few visits) -> yellow -> red (busiest).
const RAMP = ["#4ADE80", "#A3E635", "#FACC15", "#FB923C", "#EF4444"];
const EMPTY = "#E7E5E4";
const TOP_COUNTRIES = 10;

function colorFor(value: number, max: number) {
  if (value === 0 || max === 0) return EMPTY;
  const idx = Math.min(RAMP.length - 1, Math.floor((value / max) * RAMP.length - 1e-9));
  return RAMP[Math.max(0, idx)];
}

function countryLabel(code: string) {
  try {
    return new Intl.DisplayNames(["id"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default function VisitHeatmap({ rows, hour12 }: { rows: HeatRow[]; hour12: boolean }) {
  const [mode, setMode] = useState<"wib" | "local">("wib");
  const [hover, setHover] = useState<{ country: string; hour: number; value: number } | null>(null);
  const [country, setCountry] = useState<string>("all");
  // "Semua negara" shows the busiest countries; picking one shows just that row.
  const shown = country === "all" ? rows.slice(0, TOP_COUNTRIES) : rows.filter((r) => r.country === country);
  const max = Math.max(0, ...shown.flatMap((r) => r[mode]));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Jam ramai pengunjung</h2>
          <p className="text-sm text-gray-600">Kunjungan 30 hari terakhir per jam, per negara.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
        {rows.length > 0 && (
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setHover(null);
            }}
            aria-label="Pilih negara"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
          >
            <option value="all">
              {rows.length > TOP_COUNTRIES ? `Semua negara (${TOP_COUNTRIES} teratas)` : "Semua negara"}
            </option>
            {rows.map((r) => (
              <option key={r.country} value={r.country}>
                {countryLabel(r.country)} ({r.total})
              </option>
            ))}
          </select>
        )}
        <div className="inline-flex rounded-lg border border-gray-200 p-1" role="group" aria-label="Zona jam">
          {(
            [
              ["wib", "Jam WIB"],
              ["local", "Jam setempat"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`px-3 py-1.5 text-sm rounded-md ${
                mode === key ? "bg-[#A8602A] text-white font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada data kunjungan.</p>
      ) : (
        <>
          <div className="overflow-x-auto -mx-1 px-1">
            <table
              className="table-fixed border-separate border-spacing-[2px] text-xs min-w-[680px] w-full"
              onMouseLeave={() => setHover(null)}
            >
              <thead>
                <tr>
                  <th className="text-left font-medium text-gray-500 pr-2 w-36" />
                  {Array.from({ length: 24 }, (_, h) => (
                    <th key={h} className="font-normal text-gray-400 text-center">
                      {h % 3 === 0 ? (hour12 ? hourLabel(h, true).replace(" ", "") : String(h).padStart(2, "0")) : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.country}>
                    <th scope="row" className="text-left font-medium text-gray-700 pr-2 whitespace-nowrap truncate">
                      <span className="inline-block rounded bg-gray-100 px-1 text-[10px] text-gray-600 mr-1.5">{r.country}</span>
                      {countryLabel(r.country)}
                    </th>
                    {r[mode].map((v, h) => (
                      <td
                        key={h}
                        tabIndex={0}
                        onMouseEnter={() => setHover({ country: r.country, hour: h, value: v })}
                        onFocus={() => setHover({ country: r.country, hour: h, value: v })}
                        title={`${countryLabel(r.country)}, ${hourLabel(h, hour12)}: ${v} kunjungan`}
                        className="h-7 rounded-[4px] outline-none focus:ring-2 focus:ring-[#A8602A]"
                        style={{ background: colorFor(v, max) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span>Sepi</span>
              <span className="w-4 h-4 rounded-[4px] border border-gray-200" style={{ background: EMPTY }} />
              {RAMP.map((c) => (
                <span key={c} className="w-4 h-4 rounded-[4px]" style={{ background: c }} />
              ))}
              <span>Ramai</span>
            </div>
            <p className="min-h-[1rem] text-gray-700" aria-live="polite">
              {hover
                ? `${countryLabel(hover.country)} · ${hourLabel(hover.hour, hour12)}–${hourLabel((hover.hour + 1) % 24, hour12)} ${
                    mode === "wib" ? "WIB" : "waktu setempat"
                  }: ${hover.value} kunjungan`
                : "Arahkan kursor ke kotak untuk melihat detail."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
