"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Clock3, Coffee, Moon, Plus, Save, Settings2, Sunrise, Trash2 } from "lucide-react";
import {
  STATUS_LABELS,
  dayRelation,
  diffFromAdminMinutes,
  formatDiff,
  regionStatus,
  type ClockRegion,
  type ClockSettings,
  type RegionStatus,
} from "@/lib/clock";
import { ADMIN_TZ, formatClock, formatOffset, offsetMinutes } from "@/lib/timezones";
import { useNow } from "./useNow";

const STATUS_STYLE: Record<RegionStatus, { className: string; icon: typeof Briefcase }> = {
  work: { className: "bg-[#E7F4EC] text-[#1F6B45]", icon: Briefcase },
  edge: { className: "bg-[#FFF4D6] text-[#8A5A00]", icon: Sunrise },
  weekend: { className: "bg-[#EEEAFB] text-[#5B3FB0]", icon: Coffee },
  sleep: { className: "bg-gray-100 text-gray-600", icon: Moon },
};

function displayCountry(code: string) {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["id"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function slug(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RegionClockBoard({
  initialNow,
  initialSettings,
  shares,
}: {
  initialNow: number;
  initialSettings: ClockSettings;
  /** share (0..1) of visits in the last 30 days per country code */
  shares: Record<string, number>;
}) {
  const router = useRouter();
  const now = useNow(initialNow);
  const [settings, setSettings] = useState(initialSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Add-region form
  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [] as string[];
    }
  }, []);
  const [newZone, setNewZone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const visible = settings.regions.filter((r) => r.enabled);
  const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  function update(patch: Partial<ClockSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setMessage(null);
  }

  function updateRegion(id: string, patch: Partial<ClockRegion>) {
    update({ regions: settings.regions.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }

  function addRegion() {
    if (!zones.includes(newZone)) {
      setMessage({ ok: false, text: "Pilih zona waktu dari daftar." });
      return;
    }
    const city = newCity.trim() || newZone.split("/").pop()!.replace(/_/g, " ");
    const country = newCountry.trim().toUpperCase();
    if (country && !/^[A-Z]{2}$/.test(country)) {
      setMessage({ ok: false, text: "Kode negara harus 2 huruf, mis. FR." });
      return;
    }
    let id = slug(`${country || "xx"}-${city}`) || `wilayah-${settings.regions.length + 1}`;
    while (settings.regions.some((r) => r.id === id)) id += "-2";
    update({ regions: [...settings.regions, { id, country, city, timeZone: newZone, enabled: true }] });
    setNewZone("");
    setNewCity("");
    setNewCountry("");
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/clock", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      setMessage({ ok: true, text: "Pengaturan disimpan." });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Gagal menyimpan" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with admin clock */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Jam Wilayah</h1>
          <p className="text-gray-600">Jam setempat calon pembeli dan waktu terbaik untuk menghubungi mereka.</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 self-start">
          <Clock3 className="w-5 h-5 text-[#A8602A]" />
          <div>
            <p className="text-xs text-gray-500">Jam Anda (WIB)</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums" suppressHydrationWarning>
              {formatClock(now, ADMIN_TZ, settings.hour12)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            aria-expanded={showSettings}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings2 className="w-4 h-4" />
            Pengaturan
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Wilayah yang ditampilkan</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {settings.regions.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                  <input
                    id={`region-${r.id}`}
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => updateRegion(r.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-[#A8602A]"
                  />
                  <label htmlFor={`region-${r.id}`} className="flex-1 min-w-0 text-sm">
                    <span className="font-medium text-gray-900">{r.city}</span>
                    <span className="block text-xs text-gray-500 truncate">
                      {[r.country, r.timeZone].filter(Boolean).join(" · ")}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => update({ regions: settings.regions.filter((x) => x.id !== r.id) })}
                    aria-label={`Hapus ${r.city}`}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Tambah wilayah</h3>
            <div className="grid sm:grid-cols-[2fr_1.5fr_1fr_auto] gap-2">
              <label className="text-sm">
                <span className="sr-only">Zona waktu</span>
                <input
                  list="tz-list"
                  value={newZone}
                  onChange={(e) => {
                    setNewZone(e.target.value);
                    if (!newCity && zones.includes(e.target.value)) {
                      setNewCity(e.target.value.split("/").pop()!.replace(/_/g, " "));
                    }
                  }}
                  placeholder="Zona waktu, mis. Europe/Paris"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
                />
                <datalist id="tz-list">
                  {zones.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </label>
              <input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Nama kota"
                maxLength={60}
                aria-label="Nama kota"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
              />
              <input
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                placeholder="Kode negara"
                maxLength={2}
                aria-label="Kode negara (2 huruf)"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
              />
              <button
                type="button"
                onClick={addRegion}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#A8602A] text-[#A8602A] px-3 py-2 text-sm font-medium hover:bg-amber-50"
              >
                <Plus className="w-4 h-4" />
                Tambah wilayah
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-2">Format jam</legend>
              <div className="flex gap-4 text-sm text-gray-700">
                {[
                  [false, "24 jam (14:30)"],
                  [true, "12 jam (2:30 PM)"],
                ].map(([value, label]) => (
                  <label key={String(value)} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="hour-format"
                      checked={settings.hour12 === value}
                      onChange={() => update({ hour12: value as boolean })}
                      className="accent-[#A8602A]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={settings.showLocalTimeInRecent}
                  onChange={(e) => update({ showLocalTimeInRecent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-[#A8602A]"
                />
                Tampilkan jam setempat di tabel Kunjungan Terbaru
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={settings.showBuyerTimeOnInvoice}
                  onChange={(e) => update({ showBuyerTimeOnInvoice: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-[#A8602A]"
                />
                Cantumkan jam setempat pembeli di invoice
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan…" : "Simpan pengaturan"}
            </button>
            {dirty && !saving && <span className="text-sm text-gray-500">Ada perubahan yang belum disimpan.</span>}
            {message && (
              <span role="status" className={`text-sm ${message.ok ? "text-[#1F6B45]" : "text-red-600"}`}>
                {message.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Region cards */}
      {visible.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada wilayah yang ditampilkan. Buka Pengaturan untuk memilih.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r) => {
            const status = regionStatus(now, r.timeZone);
            const style = STATUS_STYLE[status];
            const StatusIcon = style.icon;
            const rel = dayRelation(now, r.timeZone);
            const share = r.country ? shares[r.country] ?? 0 : null;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5" suppressHydrationWarning>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {r.country && (
                        <span className="inline-flex items-center justify-center rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-gray-600">
                          {r.country}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 truncate">{r.city}</h3>
                    </div>
                    {r.country && <p className="text-xs text-gray-500 mt-0.5">{displayCountry(r.country)}</p>}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${style.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" aria-hidden />
                    {STATUS_LABELS[status]}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-gray-900 tabular-nums">{formatClock(now, r.timeZone, settings.hour12)}</p>
                  <span
                    className={`text-sm font-medium ${rel === "Hari ini" ? "text-gray-500" : "text-[#A8602A]"}`}
                  >
                    {rel}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500">Offset</dt>
                    <dd className="text-gray-800 tabular-nums">{formatOffset(offsetMinutes(r.timeZone, now))}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Selisih dari WIB</dt>
                    <dd className="text-gray-800">{formatDiff(diffFromAdminMinutes(r.timeZone, now))}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-gray-500">Porsi pengunjung (30 hari)</dt>
                    <dd className="flex items-center gap-2">
                      {share === null ? (
                        <span className="text-gray-400">–</span>
                      ) : (
                        <>
                          <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#A8602A]"
                              style={{ width: `${share > 0 ? Math.max(2, share * 100) : 0}%` }}
                            />
                          </div>
                          <span className="text-gray-800 tabular-nums w-10 text-right">{Math.round(share * 100)}%</span>
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
