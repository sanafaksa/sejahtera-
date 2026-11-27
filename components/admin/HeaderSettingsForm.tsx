"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Mail, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { DEFAULT_HEADER_SETTINGS, type HeaderSettings } from "@/lib/header-settings";

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-stone-900">{label}</span>
        {hint && <span className="block text-xs text-stone-500 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? "bg-[#A8602A]" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

export default function HeaderSettingsForm({ initial }: { initial: HeaderSettings }) {
  const router = useRouter();
  const [s, setS] = useState<HeaderSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof HeaderSettings>(k: K, v: HeaderSettings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const text = s.customText.trim();

  const persist = async (next: HeaderSettings) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/header", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const save = () => persist(s);
  const restoreDefault = () => {
    setS(DEFAULT_HEADER_SETTINGS);
    persist(DEFAULT_HEADER_SETTINGS);
  };

  return (
    <div className="space-y-6">
      {/* Live preview */}
      <div className="rounded-2xl overflow-hidden ring-1 ring-black/5">
        <div className="group bg-[#3E2723] text-white/90 text-[13px] overflow-hidden h-11">
          {!s.enabled ? (
            <div className="h-full flex items-center justify-center text-white/50 text-xs">
              Contact bar dimatikan
            </div>
          ) : text ? (
            s.marquee ? (
              <div className="animate-marquee h-full items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
                {[0, 1].map((half) => (
                  <div key={half} className="flex items-center shrink-0">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="px-8">
                        {text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center px-5">
                <span className="truncate">{text}</span>
              </div>
            )
          ) : (
            <div className="h-full px-5 flex items-center justify-between">
              <div className="flex items-center gap-5 min-w-0">
                <span className="inline-flex items-center gap-2 shrink-0">
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  {s.phone}
                </span>
                <span className="inline-flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.email}</span>
                </span>
              </div>
              {s.showHours && (
                <span className="hidden md:inline-flex items-center gap-2 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {s.hours} {s.tzLabel && <span className="text-white/60">({s.tzLabel})</span>}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-stone-500 px-3 py-1.5 bg-white/60">Pratinjau</p>
      </div>

      {/* Toggles */}
      <div className="glass rounded-2xl px-4 divide-y divide-white/70">
        <Toggle label="Tampilkan contact bar" checked={s.enabled} onChange={(v) => set("enabled", v)} />
        <Toggle
          label="Running text"
          hint="Jalankan teks bergerak. Nonaktif = tata letak statis."
          checked={s.marquee}
          onChange={(v) => set("marquee", v)}
        />
      </div>

      {/* Custom text — the only editable field */}
      <div className="glass rounded-2xl p-4">
        <label className="block">
          <span className="block text-xs font-medium text-stone-600 mb-1.5">Teks custom</span>
          <input
            value={s.customText}
            onChange={(e) => set("customText", e.target.value)}
            placeholder="mis. Gratis ongkir se-Bali bulan ini!"
            className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
          />
          <span className="block text-xs text-stone-500 mt-1.5">
            Kalau diisi, contact bar menampilkan teks ini. Kosongkan untuk menampilkan info kontak default.
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={saving}
          className="admin-chip inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Simpan
        </button>
        <button
          onClick={restoreDefault}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 transition disabled:opacity-70"
        >
          <RotateCcw className="w-4 h-4" />
          Default
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Tersimpan ✓</span>}
      </div>
    </div>
  );
}
